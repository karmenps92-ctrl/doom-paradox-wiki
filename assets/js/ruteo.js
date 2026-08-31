/* ============================================================
   Ruteo por hash (#/seccion/entrada)
   Usar hash evita configurar redirecciones en GitHub Pages:
   cualquier enlace profundo funciona al recargar.
   ============================================================ */

import { $, $$, alPrincipio } from "./util.js";

const rutas = [];
let contenedor, transicion, actual = "";

export function registrar(patron, manejador){
  // patron: "/", "/verdugos", "/verdugos/:id"
  const partes = patron.split("/").filter(Boolean);
  rutas.push({ partes, manejador, patron });
}

export function iniciar(selector = "#contenido"){
  contenedor = $(selector);
  transicion = $("#tinta");
  window.addEventListener("hashchange", resolver);
  resolver();
}

export function ir(ruta){
  if (location.hash === ruta) return;
  location.hash = ruta;
}

export function rutaActual(){
  return (location.hash || "#/").replace(/^#/, "");
}

function coincide(ruta){
  const partes = ruta.split("/").filter(Boolean);
  for (const r of rutas){
    if (r.partes.length !== partes.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < r.partes.length; i++){
      const p = r.partes[i];
      if (p.startsWith(":")) params[p.slice(1)] = decodeURIComponent(partes[i]);
      else if (p !== partes[i]) { ok = false; break; }
    }
    if (ok) return { manejador: r.manejador, params };
  }
  return null;
}

async function resolver(){
  const ruta = rutaActual();
  if (ruta === actual) return;
  const primera = actual === "";
  actual = ruta;

  const encontrada = coincide(ruta) || coincide("/404") || null;
  if (!encontrada) { contenedor.innerHTML = '<p class="vacio">Ruta desconocida.</p>'; return; }

  marcarNav(ruta);
  document.body.dataset.ruta = ruta;

  if (!primera) await fase("entra");
  contenedor.innerHTML = '<div class="cargando">Abriendo el archivo</div>';

  try{
    await encontrada.manejador(contenedor, encontrada.params);
  }catch(err){
    console.error(err);
    contenedor.innerHTML =
      `<div class="contenedor seccion"><h2>Se rompio algo</h2>
       <div class="aviso"><b>Error</b><p>${err.message}</p></div></div>`;
  }

  alPrincipio();
  if (!primera) await fase("sale");
}

function fase(nombre){
  if (!transicion || matchMedia("(prefers-reduced-motion: reduce)").matches) return Promise.resolve();
  return new Promise(res => {
    transicion.dataset.fase = nombre;
    const fin = () => {
      transicion.removeEventListener("animationend", fin);
      if (nombre === "sale") delete transicion.dataset.fase;
      res();
    };
    transicion.addEventListener("animationend", fin);
    setTimeout(fin, 700); // salvavidas
  });
}

function marcarNav(ruta){
  const base = "#/" + (ruta.split("/").filter(Boolean)[0] || "");
  $$(".nav a, .pie-nav a").forEach(a => {
    const suyo = a.getAttribute("href");
    if (suyo === base || (base === "#/" && suyo === "#/")) a.setAttribute("aria-current", "page");
    else a.removeAttribute("aria-current");
  });
}
