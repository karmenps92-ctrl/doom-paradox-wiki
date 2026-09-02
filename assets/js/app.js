/* ============================================================
   DOOM PARADOX · WIKI — arranque
   Registra las rutas a partir de config.js y enciende los efectos.
   ============================================================ */

import { SITIO, seccionPorRuta } from "./config.js";
import { registrar, iniciar } from "./ruteo.js";
import { buscador } from "./buscador.js";
import { cenizas, luzVacio, tarjetas3D, ondasClic, progresoLectura, reservaImagenes, ambiente, menuMovil, pulsoMarca } from "./efectos.js";

import { vistaInicio } from "./vistas/inicio.js";
import { vistaCatalogo } from "./vistas/catalogo.js";
import { vistaFicha } from "./vistas/ficha.js";
import { vistaMapas, vistaMapa } from "./vistas/mapas.js";
import { vistaOst, vistaTema } from "./vistas/ost.js";
import { vistaGaleria } from "./vistas/galeria.js";
import { vistaCreditos, vista404 } from "./vistas/estaticas.js";

const tituloBase = `${SITIO.titulo} · WIKI`;

/* --- rutas fijas --- */
registrar("/", async (raiz) => { document.title = tituloBase; return vistaInicio(raiz); });
registrar("/creditos", vistaCreditos);
registrar("/404", vista404);

/* --- una ruta de listado y otra de detalle por seccion --- */
for (const sec of SITIO.secciones){
  registrar(`/${sec.ruta}`, async (raiz) => {
    document.title = `${sec.nombre} · ${tituloBase}`;
    if (sec.vista === "mapas")   return vistaMapas(raiz, sec);
    if (sec.vista === "ost")     return vistaOst(raiz, sec);
    if (sec.vista === "galeria") return vistaGaleria(raiz, sec);
    return vistaCatalogo(raiz, sec);
  });

  if (sec.vista !== "galeria"){
    registrar(`/${sec.ruta}/:id`, async (raiz, { id }) => {
      const s = seccionPorRuta(sec.ruta);
      if (s.vista === "mapas") return vistaMapa(raiz, s, id);
      if (s.vista === "ost")   return vistaTema(raiz, s, id);
      return vistaFicha(raiz, s, id);
    });
  }
}

/* --- efectos y utilidades globales --- */
reservaImagenes();
cenizas();
luzVacio();
ondasClic();
tarjetas3D();
progresoLectura();
ambiente();
menuMovil();
pulsoMarca();
buscador();

/* --- en marcha --- */
if (!location.hash) location.hash = "#/";
iniciar("#contenido");

/* Consola: guino para quien abra las devtools. */
console.log("%cDOOM PARADOX", "color:#e2231a;font:400 28px Georgia,serif;letter-spacing:.2em");
console.log("%cTodo pecado encuentra su verdugo.", "color:#8e8a8b;font:14px monospace");
