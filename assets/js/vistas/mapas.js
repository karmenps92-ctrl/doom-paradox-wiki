/* ============================================================
   Mapas: listado + visor interactivo con puntos de interes
   (arrastrar para mover, rueda o botones para acercar)
   ============================================================ */

import { SITIO } from "../config.js";
import { cargarSeccion, buscarEntrada, referencias } from "../datos.js";
import { $, $$, esc, md, imagen, insignia, revelar, listaDatos } from "../util.js";
import { iniciales } from "./inicio.js";

export async function vistaMapas(raiz, sec){
  const { entradas } = await cargarSeccion(sec.id);
  raiz.innerHTML = `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.descripcion)}</p>
    </section>
    <section class="seccion"><div class="contenedor">
      ${entradas.length ? `<div class="rejilla">${entradas.map(m => `
        <a class="ficha" href="#/${esc(sec.ruta)}/${esc(m.id)}" data-revelar>
          <div class="ficha-lienzo" style="aspect-ratio:16/10">${imagen(m.imagen, m.nombre, iniciales(m.nombre))}</div>
          <div class="insignias">
            ${m.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
            ${m.dificultad ? insignia(m.dificultad) : ""}
          </div>
          <div class="ficha-cuerpo">
            <div class="ficha-nombre">${esc(m.nombre)}</div>
            <div class="ficha-meta">${(m.puntos || []).length} puntos marcados</div>
            ${m.resumen ? `<p class="ficha-resumen">${esc(m.resumen)}</p>` : ""}
          </div>
        </a>`).join("")}</div>`
      : `<p class="vacio">Ningún mapa documentado todavía.</p>`}
    </div></section>`;
  revelar(raiz);
}

export async function vistaMapa(raiz, sec, id){
  const m = await buscarEntrada(sec.id, id);
  if (!m){
    raiz.innerHTML = `<section class="seccion"><div class="contenedor">
      <h2>Mapa no encontrado</h2>
      <p style="text-align:center"><a class="boton" href="#/mapas">Volver a los mapas</a></p></div></section>`;
    return;
  }
  document.title = `${m.nombre} · ${SITIO.titulo} WIKI`;
  const puntos = m.puntos || [];
  const verdugosRel = await referencias("verdugos", m.verdugos || []);
  const ostRel = await referencias("ost", m.ost || []);

  raiz.innerHTML = `
    <article class="seccion"><div class="contenedor">
      <p class="migas"><a href="#/">Inicio</a><span>/</span><a href="#/mapas">Mapas</a><span>/</span>${esc(m.nombre)}</p>
      <h1 class="entrada-titulo" data-glitch="${esc(m.nombre)}">${esc(m.nombre)}</h1>
      ${m.resumen ? `<p class="entrada-resumen" style="margin-bottom:2rem">${esc(m.resumen)}</p>` : ""}

      <div class="mapa-doble">
        <div>
          <div class="mapa-visor" id="visor">
            <div class="mapa-lienzo" id="lienzo">
              ${imagen(m.imagen, "Plano de " + m.nombre, iniciales(m.nombre))}
              ${puntos.map((p, i) => `
                <button class="punto" style="left:${Number(p.x) || 50}%;top:${Number(p.y) || 50}%"
                  data-punto="${i}" aria-label="${esc(p.titulo || "Punto " + (i + 1))}">
                  <i class="punto-baliza" aria-hidden="true"></i>
                  <i class="punto-baliza" aria-hidden="true"></i>
                  ${i + 1}
                </button>`).join("")}
            </div>
            <div class="mapa-controles">
              <button data-zoom="1" aria-label="Acercar">+</button>
              <button data-zoom="-1" aria-label="Alejar">&minus;</button>
              <button data-zoom="0" aria-label="Restablecer vista">&#8635;</button>
            </div>
          </div>
          <p class="contador" style="margin-top:.7rem">Arrastra para moverte · rueda para acercar · toca un punto</p>
        </div>

        <div>
          <div class="mapa-detalle" id="detalle">
            <h4>${puntos.length ? "Puntos de interés" : "Sin puntos marcados"}</h4>
            <p style="color:var(--ceniza);font-size:.92rem;margin:0">
              ${puntos.length ? "Selecciona un número sobre el plano." : "Nadie ha marcado nada en este mapa aún."}
            </p>
          </div>
          ${puntos.length ? `<div class="panel" style="margin-top:1.2rem"><h4>Índice</h4>
            <ol style="padding-left:1.2rem;margin:0;color:var(--ceniza-clara)">
              ${puntos.map((p, i) => `<li style="margin:.3rem 0"><a href="#" data-ir="${i}">${esc(p.titulo || "Punto " + (i + 1))}</a></li>`).join("")}
            </ol></div>` : ""}
          ${panelRef("Verdugos del mapa", verdugosRel, "verdugos")}
          ${panelRef("Música", ostRel, "ost")}
          ${panelDatos("Datos", [
            ["Zona", m.zona],
            ["Dificultad", m.dificultad],
            ["Jugadores", m.jugadores],
            ["Salidas", m.salidas]
          ])}
        </div>
      </div>

      <div class="prosa" style="margin-top:3rem">
        ${m.descripcion ? md(m.descripcion) : ""}
        ${(m.secretos || []).length ? `<h3>Secretos documentados</h3><ul>${(m.secretos || []).map(s => `<li>${esc(s)}</li>`).join("")}</ul>` : ""}
      </div>
    </div></article>`;

  visorInteractivo(raiz, puntos);
  revelar(raiz);
}

/* Panel de pares etiqueta/valor. Se dibuja solo si hay algo que decir. */
function panelDatos(titulo, pares){
  const cuerpo = listaDatos(pares, { columnas: 1, plano: true });
  return cuerpo ? `<div class="panel"><h4>${esc(titulo)}</h4>${cuerpo}</div>` : "";
}

function panelRef(titulo, refs, ruta){
  if (!refs.length) return "";
  return `<div class="panel" style="margin-top:1.2rem"><h4>${esc(titulo)}</h4>
    <div class="chips">${refs.map(r => r.existe
      ? `<a class="chip" href="#/${esc(ruta)}/${esc(r.id)}">${esc(r.nombre)}</a>`
      : `<span class="chip" style="opacity:.55">${esc(r.nombre)}</span>`).join("")}</div></div>`;
}

/* --- pan / zoom / puntos --- */
function visorInteractivo(raiz, puntos){
  const visor = $("#visor", raiz), lienzo = $("#lienzo", raiz), detalle = $("#detalle", raiz);
  if (!visor || !lienzo) return;
  let escala = 1, x = 0, y = 0, arrastrando = false, px = 0, py = 0;

  const aplicar = () => {
    const r = visor.getBoundingClientRect();
    const max = (escala - 1);
    x = Math.min(0, Math.max(-r.width * max, x));
    y = Math.min(0, Math.max(-r.height * max, y));
    lienzo.style.transform = `translate(${x}px, ${y}px) scale(${escala})`;
  };
  const zoom = (delta, cx = null, cy = null) => {
    const anterior = escala;
    escala = Math.min(4, Math.max(1, +(escala + delta).toFixed(2)));
    if (cx !== null){
      const k = escala / anterior;
      x = cx - (cx - x) * k;
      y = cy - (cy - y) * k;
    }
    if (escala === 1){ x = 0; y = 0; }
    aplicar();
  };

  visor.addEventListener("pointerdown", e => {
    if (e.target.closest(".punto,.mapa-controles")) return;
    arrastrando = true; px = e.clientX; py = e.clientY;
    visor.classList.add("arrastrando");
    visor.setPointerCapture(e.pointerId);
  });
  visor.addEventListener("pointermove", e => {
    if (!arrastrando) return;
    x += e.clientX - px; y += e.clientY - py; px = e.clientX; py = e.clientY;
    aplicar();
  });
  const soltar = e => { arrastrando = false; visor.classList.remove("arrastrando"); };
  visor.addEventListener("pointerup", soltar);
  visor.addEventListener("pointercancel", soltar);
  visor.addEventListener("wheel", e => {
    e.preventDefault();
    const r = visor.getBoundingClientRect();
    zoom(e.deltaY < 0 ? .28 : -.28, e.clientX - r.left, e.clientY - r.top);
  }, { passive: false });

  $$("[data-zoom]", raiz).forEach(b => b.addEventListener("click", () => {
    const v = Number(b.dataset.zoom);
    if (v === 0){ escala = 1; x = 0; y = 0; aplicar(); } else zoom(v * .4);
  }));

  const mostrar = (i) => {
    const p = puntos[i];
    if (!p) return;
    $$(".punto", raiz).forEach(b => b.setAttribute("aria-current", String(Number(b.dataset.punto) === i)));
    detalle.innerHTML = `
      <h4>${esc(p.titulo || "Punto " + (i + 1))}</h4>
      ${p.tipo ? `<p class="ficha-meta" style="margin-bottom:.6rem">${esc(p.tipo)}</p>` : ""}
      <div class="prosa" style="font-size:.95rem">${p.texto ? md(p.texto) : "<p>Sin descripción.</p>"}</div>`;
  };
  $$(".punto", raiz).forEach(b => b.addEventListener("click", () => mostrar(Number(b.dataset.punto))));
  $$("[data-ir]", raiz).forEach(a => a.addEventListener("click", e => {
    e.preventDefault(); mostrar(Number(a.dataset.ir));
    visor.scrollIntoView({ behavior: "smooth", block: "center" });
  }));
}
