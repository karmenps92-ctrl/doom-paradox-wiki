/* ============================================================
   Catalogo de una seccion (verdugos, pecadores...)
   Filtros por atributo + busqueda local instantanea.
   ============================================================ */

import { urlEditar, urlIssue } from "../config.js";
import { cargarSeccion } from "../datos.js";
import { $, $$, esc, norm, imagen, insignia, peligro, revelar, debounce } from "../util.js";
import { tarjetas3D } from "../efectos.js";
import { iniciales } from "./inicio.js";

export async function vistaCatalogo(raiz, sec){
  const { entradas, error } = await cargarSeccion(sec.id);

  // El campo por el que se filtra lo decide config.js.
  const campo = sec.campoFiltro || "tipo";
  const valores = [...new Set(entradas.map(e => e[campo]).filter(Boolean))].sort();

  raiz.innerHTML = `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.descripcion)}</p>
    </section>

    <section class="seccion">
      <div class="contenedor">
        ${error ? `<div class="aviso"><b>No se pudo leer datos/${esc(sec.id)}.json</b><p>${esc(error)}</p></div>` : ""}

        <div class="barra-filtros">
          <button class="filtro" data-valor="" aria-pressed="true">Todos</button>
          ${valores.map(v => `<button class="filtro" data-valor="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("")}
          <label class="buscador-local">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
            <input type="search" id="filtro-texto" placeholder="Filtrar ${esc(sec.nombre.toLowerCase())}" aria-label="Filtrar ${esc(sec.nombre)}">
          </label>
        </div>

        <p class="contador" id="contador"></p>
        <div class="rejilla" id="rejilla" style="margin-top:1.2rem"></div>

        <div class="aviso" style="margin-top:3rem">
          <b>Falta alguien</b>
          <p>Propón una ficha nueva con
          <a href="${esc(urlIssue("nueva-entrada.yml", "[" + sec.singular + "] "))}" target="_blank" rel="noopener">este formulario</a>
          o edita directamente
          <a href="${esc(urlEditar(sec.id))}" target="_blank" rel="noopener">datos/${esc(sec.id)}.json</a> en GitHub.</p>
        </div>
      </div>
    </section>`;

  const rejilla = $("#rejilla", raiz);
  const contador = $("#contador", raiz);
  const input = $("#filtro-texto", raiz);
  let filtro = "", texto = "";

  function pintar(){
    const lista = entradas.filter(e => {
      if (filtro && e[campo] !== filtro) return false;
      if (!texto) return true;
      const bolsa = norm([e.nombre, e.titulo, e.alias, e.resumen, e[campo], (e.etiquetas || []).join(" ")].join(" "));
      return bolsa.includes(texto);
    });
    contador.textContent = `${lista.length} ${lista.length === 1 ? sec.singular : sec.nombre}`;
    rejilla.innerHTML = lista.length
      ? lista.map(e => tarjeta(sec, e, campo)).join("")
      : `<p class="vacio" style="grid-column:1/-1">Nada coincide con esa búsqueda.</p>`;
    revelar(rejilla);
    tarjetas3D(rejilla);
  }

  $$(".filtro", raiz).forEach(b => b.addEventListener("click", () => {
    filtro = b.dataset.valor;
    $$(".filtro", raiz).forEach(o => o.setAttribute("aria-pressed", String(o === b)));
    pintar();
  }));
  input.addEventListener("input", debounce(() => { texto = norm(input.value.trim()); pintar(); }, 110));

  pintar();
}

function tarjeta(sec, e, campo){
  const nombre = e.nombre || e.titulo || e.id;
  return `
    <a class="ficha" href="#/${esc(sec.ruta)}/${esc(e.id)}" data-revelar>
      <div class="ficha-lienzo">${imagen(e.imagen, nombre, iniciales(nombre))}</div>
      <div class="insignias">
        ${e.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
        ${e.estado === "canon" ? insignia("Canon", "canon") : ""}
        ${e[campo] ? insignia(e[campo]) : ""}
      </div>
      <div class="ficha-cuerpo">
        <div class="ficha-nombre">${esc(nombre)}</div>
        <div class="ficha-meta">
          ${esc(e.alias || sec.singular)}${e.peligro ? " · " + peligro(e.peligro) : ""}
        </div>
        ${e.resumen ? `<p class="ficha-resumen">${esc(e.resumen)}</p>` : ""}
      </div>
    </a>`;
}
