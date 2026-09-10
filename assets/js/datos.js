/* ============================================================
   Carga y cache de los archivos de /datos
   Una seccion = un JSON = una pagina. Sin build, sin backend.
   ============================================================ */

import { SITIO } from "./config.js";
import { norm } from "./util.js";

const cache = new Map();

/* Descarga (una sola vez) el JSON de una seccion. */
export async function cargarSeccion(id){
  if (cache.has(id)) return cache.get(id);
  const promesa = fetch(`datos/${id}.json`)
    .then(r => {
      if (!r.ok) throw new Error(`No se pudo leer datos/${id}.json (${r.status})`);
      return r.json();
    })
    .then(j => {
      const entradas = Array.isArray(j) ? j : (j.entradas || []);
      return { meta: Array.isArray(j) ? {} : j, entradas };
    })
    .catch(err => {
      console.warn("[wiki]", err.message);
      return { meta: {}, entradas: [], error: err.message };
    });
  cache.set(id, promesa);
  return promesa;
}

export async function cargarTodo(){
  const ids = SITIO.secciones.map(s => s.id);
  const partes = await Promise.all(ids.map(cargarSeccion));
  const mapa = {};
  ids.forEach((id, i) => { mapa[id] = partes[i]; });
  return mapa;
}

export async function buscarEntrada(seccionId, entradaId){
  const { entradas } = await cargarSeccion(seccionId);
  return entradas.find(e => e.id === entradaId) || null;
}

/* Indice plano para la paleta de busqueda. */
export async function indice(){
  const todo = await cargarTodo();
  const filas = [];
  for (const sec of SITIO.secciones){
    for (const e of (todo[sec.id]?.entradas || [])){
      const texto = [
        e.nombre, e.titulo, e.alias, e.resumen, e.pecado, e.clase,
        e.autor, e.compositor, (e.etiquetas || []).join(" ")
      ].filter(Boolean).join(" ");
      filas.push({
        seccion: sec.id,
        tipo: sec.singular,
        nombre: e.nombre || e.titulo || e.id,
        desc: e.resumen || e.alias || e.descripcion || "",
        ruta: `#/${sec.ruta}/${e.id}`,
        clave: norm(texto)
      });
    }
    filas.push({
      seccion: sec.id, tipo: "Sección", nombre: sec.nombre,
      desc: sec.lema, ruta: `#/${sec.ruta}`, clave: norm(sec.nombre + " " + sec.descripcion)
    });
  }
  filas.push({ seccion:"creditos", tipo:"Ayuda", nombre:"Créditos",
    desc:"Quién hace el juego y quién mantiene la wiki", ruta:"#/creditos",
    clave: norm("creditos equipo autores agradecimientos") });
  return filas;
}

/* Devuelve el nombre legible de una entrada referenciada por id
   (para pintar relaciones entre secciones). */
export async function referencias(seccionId, ids = []){
  if (!ids.length) return [];
  const { entradas } = await cargarSeccion(seccionId);
  return ids.map(id => {
    const e = entradas.find(x => x.id === id);
    return { id, nombre: e ? (e.nombre || e.titulo) : id, existe: !!e };
  });
}
