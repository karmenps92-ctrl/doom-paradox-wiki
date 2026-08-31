/* ============================================================
   Portada
   ============================================================ */

import { SITIO, urlIssue } from "../config.js";
import { cargarTodo } from "../datos.js";
import { esc, imagen, insignia, peligro, revelar } from "../util.js";

export async function vistaInicio(raiz){
  const todo = await cargarTodo();
  const conteo = Object.fromEntries(
    SITIO.secciones.map(s => [s.id, (todo[s.id]?.entradas || []).length])
  );
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);

  const bloques = SITIO.secciones.map(sec => {
    const entradas = (todo[sec.id]?.entradas || []).slice(0, 4);
    if (!entradas.length) return bloqueVacio(sec);
    return `
      <section class="banda" data-tono="${esc(sec.tono)}">
        <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
        <p class="banda-bajada">${esc(sec.lema)}</p>
      </section>
      <section class="seccion" data-revelar>
        <div class="contenedor">
          <div class="rejilla" data-densa>${entradas.map(e => tarjeta(sec, e)).join("")}</div>
          <p style="margin-top:1.6rem;text-align:center">
            <a class="boton" href="#/${esc(sec.ruta)}">Ver los ${conteo[sec.id]} ${esc(sec.nombre.toLowerCase())}</a>
          </p>
        </div>
      </section>`;
  }).join("");

  raiz.innerHTML = `
    <section class="heroe">
      <div class="heroe-inner">
        <p class="etiqueta"><span class="raya"></span>Archivo de la comunidad</p>
        <h1 data-glitch="DOOM">DOOM<em>PARADOX</em></h1>
        <p class="heroe-lema">${esc(SITIO.lema)}</p>
        <p class="heroe-bajada">${esc(SITIO.descripcion)}</p>
        <div class="botones">
          <a class="boton" data-variante="lleno" href="#/verdugos">Entrar al archivo</a>
          <button class="boton" id="btn-azar">Entrada al azar</button>
          ${SITIO.enlaces.juego ? `<a class="boton" href="${esc(SITIO.enlaces.juego)}" target="_blank" rel="noopener">Jugar en Roblox</a>` : ""}
          ${SITIO.enlaces.discord ? `<a class="boton" href="${esc(SITIO.enlaces.discord)}" target="_blank" rel="noopener">Discord</a>` : ""}
        </div>
      </div>
      <p class="heroe-scroll">DESCIENDE</p>
    </section>

    <section class="seccion" data-revelar>
      <div class="contenedor">
        <ul class="datos">
          ${SITIO.secciones.map(s => `
            <li><b>${esc(s.nombre)}</b><span>${conteo[s.id]}</span></li>`).join("")}
          <li><b>Fichas totales</b><span>${total}</span></li>
        </ul>
      </div>
    </section>

    ${bloques}

    <section class="seccion" data-revelar>
      <div class="contenedor">
        <div class="aviso">
          <b>Esta wiki la escribe la comunidad</b>
          <p>Falta algo o hay un dato mal? Puedes proponer cambios sin saber programar:
          cada seccion se guarda en un archivo de texto dentro del repositorio.
          <a href="#/guia">Mira la guia</a> o
          <a href="${esc(urlIssue("correccion.yml"))}" target="_blank" rel="noopener">abre un reporte</a>.</p>
        </div>
      </div>
    </section>`;

  raiz.querySelector("#btn-azar")?.addEventListener("click", () => {
    const pares = SITIO.secciones.flatMap(s =>
      (todo[s.id]?.entradas || []).map(e => `#/${s.ruta}/${e.id}`));
    if (pares.length) location.hash = pares[Math.floor(Math.random() * pares.length)];
  });

  revelar(raiz);
}

function bloqueVacio(sec){
  return `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.lema)}</p>
    </section>
    <section class="seccion"><div class="contenedor">
      <p class="vacio">Todavia no hay nada documentado aqui. <a href="#/guia">Se el primero</a>.</p>
    </div></section>`;
}

function tarjeta(sec, e){
  const nombre = e.nombre || e.titulo || e.id;
  return `
    <a class="ficha" href="#/${esc(sec.ruta)}/${esc(e.id)}">
      <div class="ficha-lienzo">${imagen(e.imagen, nombre, iniciales(nombre))}</div>
      <div class="insignias">
        ${e.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
      </div>
      <div class="ficha-cuerpo">
        <div class="ficha-nombre">${esc(nombre)}</div>
        <div class="ficha-meta">${esc(e.pecado || e.clase || e.zona || sec.singular)}
          ${e.peligro ? " · " + peligro(e.peligro) : ""}</div>
      </div>
    </a>`;
}

export function iniciales(nombre = ""){
  const p = String(nombre).replace(/^(el|la|los|las)\s+/i, "").split(/\s+/);
  return ((p[0]?.[0] || "") + (p[1]?.[0] || p[0]?.[1] || "")).toUpperCase();
}
