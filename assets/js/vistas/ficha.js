/* ============================================================
   Ficha detallada de una entrada (verdugo, pecador...)
   ============================================================ */

import { SITIO, urlEditar } from "../config.js";
import { buscarEntrada, cargarSeccion, referencias } from "../datos.js";
import { esc, md, imagen, insignia, peligro, animarStats, revelar } from "../util.js";
import { comentarios, montarComentarios } from "../comentarios.js";
import { iniciales } from "./inicio.js";

export async function vistaFicha(raiz, sec, id){
  const e = await buscarEntrada(sec.id, id);
  if (!e){
    raiz.innerHTML = `<section class="seccion"><div class="contenedor">
      <p class="migas"><a href="#/">Inicio</a><span>/</span><a href="#/${esc(sec.ruta)}">${esc(sec.nombre)}</a></p>
      <h2>No existe esa ficha</h2>
      <p class="vacio">Nadie ha documentado <code>${esc(id)}</code> todavía.</p>
      <p style="text-align:center"><a class="boton" href="#/${esc(sec.ruta)}">Volver a ${esc(sec.nombre)}</a></p>
    </div></section>`;
    return;
  }

  const nombre = e.nombre || e.titulo || e.id;
  document.title = `${nombre} · ${SITIO.titulo} WIKI`;

  const { entradas } = await cargarSeccion(sec.id);
  const pos = entradas.findIndex(x => x.id === e.id);
  const anterior = entradas[pos - 1], siguiente = entradas[pos + 1];

  const mapasRel = await referencias("mapas", e.mapas || []);
  const ostRel   = await referencias("ost", e.ost || []);
  const cruce    = sec.id === "verdugos" ? "pecadores" : "verdugos";
  const cruceRel = await referencias(cruce, e[cruce] || []);

  raiz.innerHTML = `
    <article>
      <header class="entrada-heroe">
        <div class="contenedor">
          <p class="migas">
            <a href="#/">Inicio</a><span>/</span>
            <a href="#/${esc(sec.ruta)}">${esc(sec.nombre)}</a><span>/</span>${esc(nombre)}
          </p>

          <div class="entrada-cabeza">
            <div class="retrato rasgado">${imagen(e.imagen, nombre, iniciales(nombre))}</div>
            <div>
              <div class="insignias" style="position:static;margin-bottom:.9rem">
                ${e.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
                ${e.estado === "canon" ? insignia("Canon", "canon") : ""}
                ${e.pecado ? insignia(e.pecado) : ""}
                ${e.clase ? insignia(e.clase) : ""}
              </div>
              <h1 class="entrada-titulo" data-glitch="${esc(nombre)}">${esc(nombre)}</h1>
              ${e.alias ? `<p class="entrada-alias">${esc(e.alias)}</p>` : ""}
              ${e.resumen ? `<p class="entrada-resumen">${esc(e.resumen)}</p>` : ""}
              <ul class="datos">
                ${dato("Tipo", e.tipo)}
                ${dato(sec.id === "verdugos" ? "Pecado que castiga" : "Culpa", e.pecado || e.culpa)}
                ${dato("Clase", e.clase)}
                ${dato("Origen", e.origen)}
                ${e.peligro ? `<li><b>Amenaza</b><span>${peligro(e.peligro)}</span></li>` : ""}
                ${dato("Voz", e.voz)}
                ${dato("Aparición", e.aparicion)}
                ${dato("Estado", capitalizar(e.estado))}
              </ul>
            </div>
          </div>
        </div>
      </header>

      <div class="contenedor cuerpo-entrada">
        <div class="prosa">
          ${e.cita ? `<blockquote>${esc(e.cita)}</blockquote>` : ""}
          ${e.descripcion ? md(e.descripcion) : `<p class="vacio">Ficha sin desarrollar. <a href="${esc(urlEditar(sec.id))}" target="_blank" rel="noopener">Escríbela tú</a>.</p>`}

          ${listaBloque("Habilidades", (e.habilidades || []).map(h => `
            <div class="habilidad">
              <b>${esc(h.nombre || "")}</b>
              <em>${esc([h.tipo, h.enfriamiento].filter(Boolean).join(" · "))}</em>
              <p>${esc(h.texto || "")}</p>
            </div>`).join(""))}

          ${listaBloque("Cómo sobrevivir", (e.consejos || []).length
            ? `<ul>${(e.consejos || []).map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : "")}

          ${listaBloque("Skins", (e.skins || []).map(s => `
            <div class="habilidad es-skin">
              <b>${esc(s.nombre || "")}</b>
              <p>${esc(s.texto || "")}</p>
            </div>`).join(""))}

          ${listaBloque("Curiosidades", (e.curiosidades || []).length
            ? `<ul>${(e.curiosidades || []).map(c => `<li>${esc(c)}</li>`).join("")}</ul>` : "")}

          ${(e.citas || []).length ? (e.citas || []).map(c => `<p class="cita-bloque">${esc(c)}</p>`).join("") : ""}
        </div>

        <aside>
          <div class="panel indice" id="indice-ficha" hidden>
            <h4>En esta ficha</h4>
            <ol class="indice-lista"></ol>
          </div>
          ${statsPanel(e.stats)}
          ${relacionPanel("Aparece en", mapasRel, "mapas")}
          ${relacionPanel("Temas ligados", ostRel, "ost")}
          ${relacionPanel(cruce === "pecadores" ? "Persigue a" : "Huye de", cruceRel, cruce)}
          ${(e.etiquetas || []).length ? `
            <div class="panel"><h4>Etiquetas</h4>
              <div class="chips">${(e.etiquetas || []).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            </div>` : ""}
          <div class="panel">
            <h4>Ficha</h4>
            <p style="font-size:.86rem;color:var(--ceniza);margin:0 0 .8rem">
              Última revisión: ${esc(e.actualizado || "sin fecha")}.
              ${e.fuente ? `Fuente: ${esc(e.fuente)}.` : ""}
            </p>
            <a class="boton" style="width:100%;justify-content:center" href="${esc(urlEditar(sec.id))}" target="_blank" rel="noopener">Editar en GitHub</a>
          </div>
        </aside>
      </div>

      <div class="contenedor">
        <nav class="barra-filtros" style="margin-top:3rem;border-bottom:0;border-top:1px solid var(--linea);padding-top:1.4rem">
          ${anterior ? `<a class="filtro" href="#/${esc(sec.ruta)}/${esc(anterior.id)}">&larr; ${esc(anterior.nombre || anterior.titulo)}</a>` : ""}
          <a class="filtro" style="margin-left:auto" href="#/${esc(sec.ruta)}">Todos los ${esc(sec.nombre.toLowerCase())}</a>
          ${siguiente ? `<a class="filtro" href="#/${esc(sec.ruta)}/${esc(siguiente.id)}">${esc(siguiente.nombre || siguiente.titulo)} &rarr;</a>` : ""}
        </nav>
        ${comentarios(`${sec.ruta}/${e.id}`, nombre)}
      </div>
    </article>`;

  indiceDeFicha(raiz);
  animarStats(raiz);
  revelar(raiz);
  montarComentarios(raiz);
}

/* Índice lateral: recoge los subtítulos de la prosa, permite saltar a
   ellos sin tocar el hash (que aquí es la ruta) y marca por dónde vas. */
function indiceDeFicha(raiz){
  const caja = raiz.querySelector("#indice-ficha");
  const lista = caja?.querySelector(".indice-lista");
  const titulos = Array.from(raiz.querySelectorAll(".prosa h3"));
  if (!caja || !lista || titulos.length < 2) return;

  lista.innerHTML = titulos.map((h, i) =>
    `<li><button type="button" data-ir="${i}">${esc(h.textContent)}</button></li>`).join("");
  caja.hidden = false;

  const botones = Array.from(lista.querySelectorAll("button"));
  botones.forEach((b, i) => b.addEventListener("click", () => {
    titulos[i].scrollIntoView({ behavior: "smooth", block: "start" });
  }));

  // Marca el último subtítulo que ha pasado por debajo de la cabecera.
  const marcar = () => {
    const limite = window.innerHeight * 0.28;
    let activo = 0;
    titulos.forEach((h, i) => { if (h.getBoundingClientRect().top <= limite) activo = i; });
    botones.forEach((b, i) => b.toggleAttribute("data-activo", i === activo));
  };
  const alDesplazar = marcar;   // seis rectángulos por scroll: sale más barato que un rAF
  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar, { passive: true });
  // el índice muere con la vista: al cambiar de ruta se sustituye el HTML
  new MutationObserver((_, obs) => {
    if (!document.body.contains(caja)){
      window.removeEventListener("scroll", alDesplazar);
      window.removeEventListener("resize", alDesplazar);
      obs.disconnect();
    }
  }).observe(raiz, { childList: true });
  marcar();
}

function capitalizar(t){ return t ? String(t)[0].toUpperCase() + String(t).slice(1) : t; }

function dato(titulo, valor){
  return valor ? `<li><b>${esc(titulo)}</b><span>${esc(valor)}</span></li>` : "";
}

function listaBloque(titulo, html){
  return html ? `<h3>${esc(titulo)}</h3>${html}` : "";
}

function statsPanel(stats){
  if (!stats || !Object.keys(stats).length) return "";
  return `<div class="panel"><h4>Atributos</h4>
    ${Object.entries(stats).map(([k, v]) => {
      const n = Math.max(0, Math.min(5, Number(v) || 0));
      return `<div class="stat">
        <div class="stat-fila"><span>${esc(k)}</span><span>${n}/5</span></div>
        <div class="stat-barra"><i data-valor="${(n / 5) * 100}"></i></div>
      </div>`;
    }).join("")}
  </div>`;
}

function relacionPanel(titulo, refs, ruta){
  if (!refs.length) return "";
  return `<div class="panel"><h4>${esc(titulo)}</h4>
    <div class="chips">
      ${refs.map(r => r.existe
        ? `<a class="chip" href="#/${esc(ruta)}/${esc(r.id)}">${esc(r.nombre)}</a>`
        : `<span class="chip" title="Todavía sin ficha" style="opacity:.55">${esc(r.nombre)}</span>`).join("")}
    </div>
  </div>`;
}
