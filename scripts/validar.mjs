/* ============================================================
   Validador de /datos
   Uso:  node scripts/validar.mjs
   Comprueba que el JSON no este roto, que no haya ids repetidos,
   que las referencias entre secciones existan y que las imagenes
   declaradas esten subidas. Sale con codigo 1 si hay errores.
   ============================================================ */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const raiz = join(dirname(fileURLToPath(import.meta.url)), "..");
const SECCIONES = ["verdugos", "pecadores", "mapas", "ost", "galeria"];

const errores = [];
const avisos = [];
const datos = {};

for (const sec of SECCIONES){
  const ruta = join(raiz, "datos", `${sec}.json`);
  if (!existsSync(ruta)){ errores.push(`Falta datos/${sec}.json`); continue; }
  let json;
  try{
    json = JSON.parse(readFileSync(ruta, "utf8"));
  }catch(err){
    errores.push(`datos/${sec}.json no es JSON valido: ${err.message}`);
    continue;
  }
  const entradas = Array.isArray(json) ? json : json.entradas;
  if (!Array.isArray(entradas)){
    errores.push(`datos/${sec}.json debe tener una lista "entradas"`);
    continue;
  }
  datos[sec] = entradas;

  const vistos = new Set();
  entradas.forEach((e, i) => {
    const donde = `datos/${sec}.json[${i}]`;
    if (!e.id) { errores.push(`${donde}: falta "id"`); return; }
    if (!/^[a-z0-9-]+$/.test(e.id))
      errores.push(`${donde}: el id "${e.id}" solo puede llevar minusculas, numeros y guiones`);
    if (vistos.has(e.id)) errores.push(`${donde}: id repetido "${e.id}"`);
    vistos.add(e.id);

    if (!e.nombre && !e.titulo) errores.push(`${donde} (${e.id}): falta "nombre" o "titulo"`);
    if (e.peligro != null && (Number(e.peligro) < 0 || Number(e.peligro) > 5))
      errores.push(`${donde} (${e.id}): "peligro" debe estar entre 0 y 5`);
    if (e.stats) for (const [k, v] of Object.entries(e.stats))
      if (Number(v) < 0 || Number(v) > 5) errores.push(`${donde} (${e.id}): stat "${k}" fuera de 0-5`);

    if (e.imagen && !existsSync(join(raiz, e.imagen)))
      avisos.push(`${donde} (${e.id}): la imagen ${e.imagen} todavia no esta subida`);

    if (sec === "mapas") (e.puntos || []).forEach((p, j) => {
      const n = (v) => Number(v) >= 0 && Number(v) <= 100;
      if (!n(p.x) || !n(p.y)) errores.push(`${donde} (${e.id}) punto ${j}: x e y van en porcentaje 0-100`);
    });

    if (sec === "galeria" && !e.autor)
      errores.push(`${donde} (${e.id}): toda obra de la galeria necesita "autor"`);
  });
}

/* referencias cruzadas */
const ids = Object.fromEntries(
  Object.entries(datos).map(([sec, arr]) => [sec, new Set(arr.map(e => e.id))])
);
for (const [sec, arr] of Object.entries(datos))
  for (const e of arr)
    for (const campo of ["verdugos", "pecadores", "mapas", "ost"])
      for (const ref of (e[campo] || []))
        if (ids[campo] && !ids[campo].has(ref))
          avisos.push(`datos/${sec}.json (${e.id}): referencia a ${campo}/${ref} que no existe`);

/* imagenes huerfanas */
for (const sec of ["verdugos", "pecadores", "mapas", "galeria"]){
  const dir = join(raiz, "assets", "img", sec);
  if (!existsSync(dir)) continue;
  const usadas = new Set((datos[sec] || []).map(e => e.imagen).filter(Boolean));
  for (const archivo of readdirSync(dir)){
    if (archivo.startsWith(".")) continue;
    if (![...usadas].some(u => u.endsWith("/" + archivo)))
      avisos.push(`assets/img/${sec}/${archivo} no lo usa ninguna ficha`);
  }
}

const total = Object.values(datos).reduce((a, b) => a + b.length, 0);
console.log(`\nDOOM PARADOX · validador de datos`);
console.log(`${total} fichas leidas en ${Object.keys(datos).length} secciones\n`);
avisos.forEach(a => console.log(`  aviso   ${a}`));
errores.forEach(e => console.log(`  ERROR   ${e}`));

if (errores.length){
  console.log(`\n${errores.length} error(es). Corrige y vuelve a intentarlo.\n`);
  process.exit(1);
}
console.log(`\nTodo correcto${avisos.length ? ` (${avisos.length} aviso(s) sin bloquear)` : ""}.\n`);
