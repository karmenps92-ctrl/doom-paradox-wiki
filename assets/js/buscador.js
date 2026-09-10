/* ============================================================
   Paleta de busqueda global (Ctrl/Cmd + K)
   Busqueda difusa sobre el indice de /datos.
   ============================================================ */

import { $, $$, esc, norm, debounce } from "./util.js";
import { indice } from "./datos.js";
import { sonidoUI } from "./efectos.js";

let filas = null, seleccion = 0, ultimoFoco = null;

export function buscador(){
  const caja   = $("#paleta");
  const input  = $("#paleta-input");
  const lista  = $("#paleta-lista");
  const abrirB = $("#abrir-buscador");
  if (!caja) return;

  const abrir = async () => {
    ultimoFoco = document.activeElement;
    caja.hidden = false;
    input.value = "";
    input.focus();
    filas ||= await indice();
    pintar("");
    sonidoUI("abrir");
  };
  const cerrar = () => {
    if (!caja.hidden) sonidoUI("cerrar");
    caja.hidden = true;
    if (ultimoFoco && ultimoFoco.focus) ultimoFoco.focus();
  };

  abrirB?.addEventListener("click", abrir);
  $$("[data-cerrar]", caja).forEach(b => b.addEventListener("click", cerrar));

  addEventListener("keydown", (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k"){ e.preventDefault(); caja.hidden ? abrir() : cerrar(); return; }
    if (e.key === "/" && !/^(INPUT|TEXTAREA)$/.test(document.activeElement.tagName) && caja.hidden){ e.preventDefault(); abrir(); return; }
    if (caja.hidden) return;
    if (e.key === "Escape"){ e.preventDefault(); cerrar(); }
    if (e.key === "ArrowDown"){ e.preventDefault(); mover(1); }
    if (e.key === "ArrowUp"){ e.preventDefault(); mover(-1); }
    if (e.key === "Enter"){
      const a = lista.querySelector("li[data-activo] a");
      if (a){ e.preventDefault(); location.hash = a.getAttribute("href"); cerrar(); }
    }
  });

  input.addEventListener("input", debounce(() => pintar(input.value), 90));
  lista.addEventListener("click", e => { if (e.target.closest("a")) cerrar(); });

  function mover(paso){
    const items = $$("li", lista);
    if (!items.length) return;
    seleccion = (seleccion + paso + items.length) % items.length;
    items.forEach((li, i) => {
      if (i === seleccion){ li.dataset.activo = "true"; li.scrollIntoView({ block: "nearest" }); }
      else delete li.dataset.activo;
    });
  }

  function pintar(consulta){
    seleccion = 0;
    const q = norm(consulta.trim());
    let res = filas || [];
    if (q){
      res = res
        .map(f => ({ f, p: puntuar(f, q) }))
        .filter(x => x.p > 0)
        .sort((a, b) => b.p - a.p)
        .slice(0, 12)
        .map(x => x.f);
    } else {
      res = res.filter(f => f.tipo === "Seccion").concat(res.filter(f => f.tipo !== "Seccion").slice(0, 6));
    }

    if (!res.length){
      lista.innerHTML = `<li class="vacio" style="padding:2rem;font-size:1.1rem">Nada en el archivo con ese nombre.</li>`;
      return;
    }
    lista.innerHTML = res.map((f, i) => `
      <li${i === 0 ? " data-activo" : ""} role="option">
        <a href="${esc(f.ruta)}">
          <span class="res-tipo">${esc(f.tipo)}</span>
          <span><span class="res-nombre">${esc(f.nombre)}</span>
          ${f.desc ? `<span class="res-desc">${esc(String(f.desc).slice(0, 90))}</span>` : ""}</span>
        </a>
      </li>`).join("");
  }
}

/* Puntuacion: nombre exacto > prefijo > subcadena > todas las
   palabras en la ficha > erratas leves sobre el nombre. */
function puntuar(fila, q){
  const nombre = norm(fila.nombre);
  if (nombre === q) return 100;
  if (nombre.startsWith(q)) return 84;
  if (nombre.includes(q)) return 66;

  const palabras = q.split(/\s+/).filter(Boolean);
  if (palabras.length > 1 && palabras.every(p => fila.clave.includes(p))) return 48;
  if (fila.clave.includes(q)) return 42;

  // tolerancia a erratas: solo sobre el nombre y con consultas de 3+ letras
  if (q.length >= 3 && subsecuencia(nombre, q)) return 18;
  return 0;
}

function subsecuencia(texto, q){
  let i = 0, saltos = 0;
  for (const c of q){
    const j = texto.indexOf(c, i);
    if (j === -1) return false;
    saltos += j - i;
    i = j + 1;
  }
  return saltos <= q.length * 2; // las letras deben ir juntas, no dispersas
}
