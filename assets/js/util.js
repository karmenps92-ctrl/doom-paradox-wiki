/* ============================================================
   Utilidades compartidas
   ============================================================ */

export const $  = (sel, ctx = document) => ctx.querySelector(sel);
export const $$ = (sel, ctx = document) => Array.from(ctx.querySelectorAll(sel));

/* Escapa texto antes de meterlo en innerHTML. */
export function esc(txt = ""){
  return String(txt)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;").replace(/'/g, "&#39;");
}

/* Quita acentos y baja a minusculas: busqueda tolerante. */
export function norm(txt = ""){
  const rango = new RegExp("[\\u0300-\\u036f]", "g");
  return String(txt).toLowerCase().normalize("NFD").replace(rango, "");
}

export function slug(txt = ""){
  return norm(txt).replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

/* Mini-markdown: negrita, cursiva, codigo, enlaces, listas,
   citas y subtitulos. Escapa primero, asi que es seguro. */
export function md(texto = ""){
  const bloques = String(texto).split(/\n{2,}/);
  return bloques.map(b => {
    const lineas = b.split("\n").map(l => l.trim()).filter(Boolean);
    if (!lineas.length) return "";

    if (lineas.every(l => l.startsWith("- ")))
      return `<ul>${lineas.map(l => `<li>${enLinea(l.slice(2))}</li>`).join("")}</ul>`;

    if (lineas.every(l => l.startsWith("> ")))
      return `<blockquote>${lineas.map(l => enLinea(l.slice(2))).join("<br>")}</blockquote>`;

    if (lineas[0].startsWith("## "))
      return `<h3>${enLinea(lineas[0].slice(3))}</h3>` +
             (lineas.length > 1 ? `<p>${lineas.slice(1).map(enLinea).join("<br>")}</p>` : "");

    return `<p>${lineas.map(enLinea).join("<br>")}</p>`;
  }).join("");
}

function enLinea(t){
  return esc(t)
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, '<a href="$2" rel="noopener">$1</a>')
    .replace(/\*\*([^*]+)\*\*/g, "<strong>$1</strong>")
    .replace(/\*([^*]+)\*/g, "<em>$1</em>")
    .replace(/`([^`]+)`/g, "<code>$1</code>");
}

/* Imagen con reserva: si el archivo todavia no existe, app.js
   la sustituye por un placeholder de tinta con las iniciales. */
export function imagen(src, alt, iniciales, bloque = false){
  const ini = esc((iniciales || (alt || "?").slice(0, 2)).toUpperCase());
  const clase = bloque ? "sin-imagen bloque" : "sin-imagen";
  if (!src) return `<div class="${clase}"><span>${ini}</span></div>`;
  return `<img src="${esc(src)}" alt="${esc(alt || "")}" data-ini="${ini}"${bloque ? ' data-bloque="1"' : ""} loading="lazy" decoding="async">`;
}

/* Medidor de peligro 0..5 */
export function peligro(n = 0){
  const v = Math.max(0, Math.min(5, Number(n) || 0));
  let out = `<span class="peligro" title="Nivel de amenaza ${v} de 5" aria-label="Amenaza ${v} de 5">`;
  for (let i = 1; i <= 5; i++) out += `<i class="${i <= v ? "on" : ""}"></i>`;
  return out + "</span>";
}

export function insignia(texto, tipo = ""){
  return `<span class="insignia"${tipo ? ` data-tipo="${esc(tipo)}"` : ""}>${esc(texto)}</span>`;
}

export function duracion(seg){
  const s = Number(seg);
  if (!s || Number.isNaN(s)) return "--:--";
  return `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, "0")}`;
}

export function alPrincipio(){
  window.scrollTo({ top: 0, behavior: "auto" });
}

/* Observador que revela elementos al entrar en pantalla. */
let observador;
export function revelar(raiz = document){
  if (!("IntersectionObserver" in window)) {
    $$("[data-revelar]", raiz).forEach(el => el.classList.add("visible"));
    return;
  }
  observador ||= new IntersectionObserver((entradas) => {
    entradas.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("visible");
      observador.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px", threshold: .08 });
  const pendientes = $$("[data-revelar]", raiz);
  pendientes.forEach(el => observador.observe(el));
  // Red de seguridad: si el navegador congela las animaciones (pestana en
  // segundo plano, ahorro de energia), el contenido nunca queda invisible.
  setTimeout(() => pendientes.forEach(el => el.classList.add("visible")), 2500);
}

/* Anima las barras de estadistica cuando aparecen. */
export function animarStats(raiz = document){
  requestAnimationFrame(() => {
    $$(".stat-barra i", raiz).forEach(b => { b.style.width = (b.dataset.valor || 0) + "%"; });
  });
}

export const debounce = (fn, ms = 160) => {
  let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); };
};
