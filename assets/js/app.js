/* ============================================================
   DOOM PARADOX · WIKI — arranque
   Registra las rutas a partir de config.js y enciende los efectos.
   ============================================================ */

import { SITIO, seccionPorRuta } from "./config.js";
import { registrar, iniciar } from "./ruteo.js";
import { buscador } from "./buscador.js";
import { aplicarCalidad, cenizas, luzVacio, tarjetas3D, ondasClic, progresoLectura, reservaImagenes, ambiente, menuMovil, pulsoMarca, cabeceraCompacta, introArchivo } from "./efectos.js";

const tituloBase = `${SITIO.titulo} · WIKI`;

/* Las vistas se piden al entrar en la ruta: el arranque no descarga
   mapas, OST y galería si el visitante solo ve la portada. */
registrar("/", async (raiz) => {
  document.title = tituloBase;
  const { vistaInicio } = await import("./vistas/inicio.js");
  return vistaInicio(raiz);
});
registrar("/creditos", async (raiz) => {
  const { vistaCreditos } = await import("./vistas/estaticas.js");
  return vistaCreditos(raiz);
});
registrar("/404", async (raiz) => {
  const { vista404 } = await import("./vistas/estaticas.js");
  return vista404(raiz);
});

for (const sec of SITIO.secciones){
  registrar(`/${sec.ruta}`, async (raiz) => {
    document.title = `${sec.nombre} · ${tituloBase}`;
    if (sec.vista === "mapas"){
      const { vistaMapas } = await import("./vistas/mapas.js");
      return vistaMapas(raiz, sec);
    }
    if (sec.id === "mecanicas"){
      const { vistaMecanicas } = await import("./vistas/mecanicas.js");
      return vistaMecanicas(raiz, sec);
    }
    if (sec.vista === "ost"){
      const { vistaOst } = await import("./vistas/ost.js");
      return vistaOst(raiz, sec);
    }
    if (sec.vista === "galeria"){
      const { vistaGaleria } = await import("./vistas/galeria.js");
      return vistaGaleria(raiz, sec);
    }
    const { vistaCatalogo } = await import("./vistas/catalogo.js");
    return vistaCatalogo(raiz, sec);
  });

  if (sec.vista !== "galeria"){
    registrar(`/${sec.ruta}/:id`, async (raiz, { id }) => {
      const s = seccionPorRuta(sec.ruta);
      if (s.vista === "mapas"){
        const { vistaMapa } = await import("./vistas/mapas.js");
        return vistaMapa(raiz, s, id);
      }
      if (s.id === "mecanicas"){
        const { vistaMecanica } = await import("./vistas/mecanicas.js");
        return vistaMecanica(raiz, s, id);
      }
      if (s.vista === "ost"){
        const { vistaTema } = await import("./vistas/ost.js");
        return vistaTema(raiz, s, id);
      }
      const { vistaFicha } = await import("./vistas/ficha.js");
      return vistaFicha(raiz, s, id);
    });
  }
}

function enReposo(fn, espera = 1800){
  if ("requestIdleCallback" in window) requestIdleCallback(fn, { timeout: espera });
  else setTimeout(fn, Math.min(400, espera));
}

/* --- efectos y utilidades globales --- */
aplicarCalidad();
introArchivo();
reservaImagenes();
ondasClic();
tarjetas3D();
progresoLectura();
cabeceraCompacta();
ambiente();
menuMovil();
buscador();
requestAnimationFrame(() => { cenizas(); luzVacio(); pulsoMarca(); });
enReposo(() => {
  import("./vistas/catalogo.js");
  import("./vistas/ficha.js");
  import("./vistas/mapas.js");
  import("./vistas/mecanicas.js");
  import("./vistas/ost.js");
  import("./vistas/galeria.js");
  import("./vistas/estaticas.js");
});

/* --- en marcha --- */
if (!location.hash) location.hash = "#/";
iniciar("#contenido");

/* Consola: guino para quien abra las devtools. */
console.log("%cDOOM PARADOX", "color:#e2231a;font:400 28px Georgia,serif;letter-spacing:.2em");
console.log("%cTodo pecado encuentra su verdugo.", "color:#8e8a8b;font:14px monospace");
