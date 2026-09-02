/* ============================================================
   DOOM PARADOX · WIKI — Ficha de Personaje / Dossier HD 3.0
   Header cinematográfico, habilidades estilo códice,
   tácticas de supervivencia, skins, stats y navegación fluida.
   ============================================================ */

import { SITIO } from "../config.js";
import { buscarEntrada, cargarSeccion, referencias } from "../datos.js";
import { esc, md, imagen, insignia, peligro, animarStats, revelar } from "../util.js";
import { comentarios, montarComentarios } from "../comentarios.js";
import { iniciales } from "./inicio.js";

export async function vistaFicha(raiz, sec, id){
  const e = await buscarEntrada(sec.id, id);
  if (!e){
    raiz.innerHTML = `<section class="seccion"><div class="contenedor">
      <p class="migas"><a href="#/">Inicio</a><span>/</span><a href="#/${esc(sec.ruta)}">${esc(sec.nombre)}</a></p>
      <h2 style="font-family:var(--titular);font-size:2.5rem;text-transform:uppercase;color:#fff">Ficha no encontrada</h2>
      <p class="vacio">No existe ningún registro para <code>${esc(id)}</code> en el archivo.</p>
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
    <article class="ficha-dossier">
      <!-- HEADER CINEMATOGRÁFICO DE LA FICHA -->
      <header class="entrada-heroe">
        <div class="contenedor">
          <p class="migas">
            <a href="#/">Inicio</a><span>/</span>
            <a href="#/${esc(sec.ruta)}">${esc(sec.nombre)}</a><span>/</span>
            <span style="color:#fff">${esc(nombre)}</span>
          </p>

          <div class="entrada-cabeza">
            <div class="retrato rasgado">${imagen(e.imagen, nombre, iniciales(nombre))}</div>

            <div class="entrada-info">
              <div class="insignias" style="position:static;margin-bottom:1rem;display:flex;flex-direction:row;flex-wrap:wrap;gap:.5rem">
                ${e.estado === "canon" ? insignia("Canon", "canon") : ""}
                ${e.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
                ${e.origen ? `<span class="insignia" style="border-color:rgba(255,32,46,0.5);color:#fff">${esc(e.origen)}</span>` : ""}
                ${e.pecado ? insignia(e.pecado) : ""}
                ${e.clase ? insignia(e.clase) : ""}
              </div>

              <h1 class="entrada-titulo" data-glitch="${esc(nombre)}">${esc(nombre)}</h1>
              ${e.alias ? `<p class="entrada-alias">«${esc(e.alias)}»</p>` : ""}
              ${e.resumen ? `<p class="entrada-resumen">${esc(e.resumen)}</p>` : ""}

              <div class="dossier-grid">
                <div class="dossier-item">
                  <span class="dossier-label">Origen</span>
                  <b class="dossier-val">${esc(e.origen || "Desconocido")}</b>
                </div>
                ${e.pecado || e.culpa ? `
                <div class="dossier-item">
                  <span class="dossier-label">${sec.id === "verdugos" ? "Pecado que castiga" : "Culpa"}</span>
                  <b class="dossier-val">${esc(e.pecado || e.culpa)}</b>
                </div>` : ""}
                ${e.clase ? `
                <div class="dossier-item">
                  <span class="dossier-label">Clase</span>
                  <b class="dossier-val">${esc(e.clase)}</b>
                </div>` : ""}
                <div class="dossier-item">
                  <span class="dossier-label">Amenaza</span>
                  <b class="dossier-val">${e.peligro ? peligro(e.peligro) : "Nivel estándar"}</b>
                </div>
                <div class="dossier-item">
                  <span class="dossier-label">Estado</span>
                  <b class="dossier-val" style="color:${e.estado === "canon" ? "var(--oro-vivo)" : "var(--sangre-viva)"}">${capitalizar(e.estado || "Canon")}</b>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      <!-- CUERPO PRINCIPAL (PROSA + SIDEBAR) -->
      <div class="contenedor cuerpo-entrada">
        <div class="prosa">
          ${e.cita ? `<blockquote class="cita-dossier">${esc(e.cita)}</blockquote>` : ""}
          ${e.descripcion ? md(e.descripcion) : `<p class="vacio">Ficha sin descripción detallada aún.</p>`}

          <!-- SECCIÓN DE HABILIDADES -->
          ${(e.habilidades || []).length ? `
            <h3 class="seccion-subtitulo">Habilidades y Poderes</h3>
            <div class="habilidades-lista">
              ${(e.habilidades || []).map((h, i) => `
                <div class="habilidad-card" data-revelar>
                  <div class="habilidad-header">
                    <span class="habilidad-num">0${i + 1}</span>
                    <b class="habilidad-nombre">${esc(h.nombre || "Habilidad")}</b>
                    <div class="habilidad-badges">
                      ${h.tipo ? `<span class="habilidad-tipo">${esc(h.tipo)}</span>` : ""}
                      ${h.enfriamiento ? `<span class="habilidad-cd">⏱ ${esc(h.enfriamiento)}</span>` : ""}
                    </div>
                  </div>
                  <p class="habilidad-desc">${esc(h.texto || "")}</p>
                </div>`).join("")}
            </div>` : ""}

          <!-- SECCIÓN DE CÓMO SOBREVIVIR -->
          ${(e.consejos || []).length ? `
            <h3 class="seccion-subtitulo">Cómo Sobrevivir · Consejos Tácticos</h3>
            <div class="consejos-grid">
              ${(e.consejos || []).map((c, i) => `
                <div class="consejo-card" data-revelar>
                  <span class="consejo-num">#${i + 1}</span>
                  <p class="consejo-texto">${esc(c)}</p>
                </div>`).join("")}
            </div>` : ""}

          <!-- SECCIÓN DE SKINS -->
          ${(e.skins || []).length ? `
            <h3 class="seccion-subtitulo">Variantes y Skins</h3>
            <div class="skins-grid">
              ${(e.skins || []).map(s => `
                <div class="skin-card" data-revelar>
                  <div class="skin-header">
                    <b class="skin-nombre">${esc(s.nombre || "Variante")}</b>
                    <span class="skin-tag">Skin</span>
                  </div>
                  <p class="skin-texto">${esc(s.texto || "Variante visual del personaje.")}</p>
                </div>`).join("")}
            </div>` : ""}

          <!-- SECCIÓN DE CURIOSIDADES -->
          ${(e.curiosidades || []).length ? `
            <h3 class="seccion-subtitulo">Curiosidades y Secretos</h3>
            <div class="curiosidades-grid">
              ${(e.curiosidades || []).map(c => `
                <div class="curiosidad-card" data-revelar>
                  <p class="curiosidad-texto">✦ ${esc(c)}</p>
                </div>`).join("")}
            </div>` : ""}

          <!-- CITAS ADICIONALES -->
          ${(e.citas || []).length ? (e.citas || []).map(c => `<blockquote class="cita-dossier">${esc(c)}</blockquote>`).join("") : ""}
        </div>

        <!-- SIDEBAR / PANEL LATERAL -->
        <aside class="sidebar-dossier">
          <div class="panel indice" id="indice-ficha" hidden>
            <h4>En esta ficha</h4>
            <ol class="indice-lista"></ol>
          </div>

          ${statsPanel(e.stats)}
          ${relacionPanel("Aparece en Mapas", mapasRel, "mapas")}
          ${relacionPanel("Banda Sonora Ligada", ostRel, "ost")}
          ${relacionPanel(cruce === "pecadores" ? "Persigue a" : "Huye de", cruceRel, cruce)}

          ${(e.etiquetas || []).length ? `
            <div class="panel">
              <h4>Etiquetas</h4>
              <div class="chips">${(e.etiquetas || []).map(t => `<span class="chip">${esc(t)}</span>`).join("")}</div>
            </div>` : ""}
        </aside>
      </div>

      <!-- NAVEGACIÓN ENTRE FICHAS -->
      <div class="contenedor">
        <nav class="barra-navegacion-fichas">
          ${anterior ? `
            <a class="nav-ficha-btn prev" href="#/${esc(sec.ruta)}/${esc(anterior.id)}">
              <span class="nav-dir">&larr; Anterior</span>
              <b class="nav-nombre">${esc(anterior.nombre || anterior.titulo)}</b>
            </a>` : `<span style="flex:1"></span>`}

          <a class="nav-ficha-todos" href="#/${esc(sec.ruta)}">
            Volver a ${esc(sec.nombre)}
          </a>

          ${siguiente ? `
            <a class="nav-ficha-btn next" href="#/${esc(sec.ruta)}/${esc(siguiente.id)}">
              <span class="nav-dir">Siguiente &rarr;</span>
              <b class="nav-nombre">${esc(siguiente.nombre || siguiente.titulo)}</b>
            </a>` : `<span style="flex:1"></span>`}
        </nav>

        ${comentarios(`${sec.ruta}/${e.id}`, nombre)}
      </div>
    </article>`;

  indiceDeFicha(raiz);
  animarStats(raiz);
  revelar(raiz);
  montarComentarios(raiz);
}

/* Índice lateral interactivo con seguimiento de lectura */
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

  const marcar = () => {
    const limite = window.innerHeight * 0.3;
    let activo = 0;
    titulos.forEach((h, i) => { if (h.getBoundingClientRect().top <= limite) activo = i; });
    botones.forEach((b, i) => b.toggleAttribute("data-activo", i === activo));
  };
  const alDesplazar = marcar;
  window.addEventListener("scroll", alDesplazar, { passive: true });
  window.addEventListener("resize", alDesplazar, { passive: true });
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

function statsPanel(stats){
  if (!stats || !Object.keys(stats).length) return "";
  return `<div class="panel"><h4>Atributos de Combate</h4>
    ${Object.entries(stats).map(([k, v]) => {
      const n = Math.max(0, Math.min(5, Number(v) || 0));
      return `<div class="stat">
        <div class="stat-fila"><span>${esc(k)}</span><b style="color:#fff">${n}/5</b></div>
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
        : `<span class="chip" title="Pendiente de documentar" style="opacity:.5">${esc(r.nombre)}</span>`).join("")}
    </div>
  </div>`;
}
