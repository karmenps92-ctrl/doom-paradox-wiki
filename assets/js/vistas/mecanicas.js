/* ============================================================
   DOOM PARADOX · WIKI — Mecánicas y Sistemas de Juego HD 3.0
   Módulos de motor de juego, reglas de partida, protocolos y lore.
   ============================================================ */

import { SITIO } from "../config.js";
import { cargarSeccion, buscarEntrada, referencias } from "../datos.js";
import { $, $$, esc, norm, md, insignia, revelar, debounce } from "../util.js";
import { tarjetas3D } from "../efectos.js";

/* Iconos SVG temáticos por ID de mecánica */
export const ICONOS_MECANICAS = {
  "el-infierno": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="24" cy="24" r="20" stroke-dasharray="4 2" opacity="0.6"/>
      <path d="M14 24c0-5.5 4.5-10 10-10s10 4.5 10 10-4.5 10-10 10-10-4.5-10-10z" fill="rgba(255,32,46,0.2)"/>
      <circle cx="24" cy="24" r="4" fill="var(--sangre-viva)"/>
      <path d="M24 4v6M24 38v6M4 24h6M38 24h6"/>
    </svg>`,
  "el-anfitrion": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M12 38h24M16 38V22l8-10 8 10v16M24 12v-4M20 8h8" stroke="var(--oro)"/>
      <circle cx="24" cy="24" r="3" fill="var(--oro)"/>
      <path d="M8 42h32" opacity="0.7"/>
    </svg>`,
  "lms": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M10 38L38 10M38 38L10 10" stroke="var(--sangre-viva)"/>
      <path d="M24 6l4 8-4 8-4-8 4-8z" fill="rgba(255,32,46,0.3)"/>
      <circle cx="24" cy="24" r="18" stroke-dasharray="2 3" opacity="0.5"/>
    </svg>`,
  "double-trouble": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M18 8l-6 16h10l-4 16 16-20H24l6-12H18z" fill="rgba(255,32,46,0.25)" stroke="var(--sangre-viva)"/>
      <path d="M30 14l-4 10h6l-3 10 10-12H34l4-8H30z" stroke="var(--oro)"/>
    </svg>`,
  "rondas-especiales": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="10" y="10" width="28" height="28" rx="6" stroke="var(--sangre-viva)"/>
      <circle cx="18" cy="18" r="2.5" fill="#fff"/>
      <circle cx="30" cy="18" r="2.5" fill="#fff"/>
      <circle cx="24" cy="24" r="2.5" fill="var(--sangre-viva)"/>
      <circle cx="18" cy="30" r="2.5" fill="#fff"/>
      <circle cx="30" cy="30" r="2.5" fill="#fff"/>
    </svg>`,
  "modificadores": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M8 16h32M8 32h32"/>
      <circle cx="16" cy="16" r="4" fill="var(--sangre-viva)"/>
      <circle cx="32" cy="32" r="4" fill="var(--oro)"/>
      <path d="M16 20v8M32 20v8" stroke-dasharray="2 2"/>
    </svg>`,
  "eventos-medio-tiempo": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="var(--sangre-viva)"/>
      <path d="M24 12v12l7 4" stroke="#fff"/>
      <path d="M16 6h16M10 24h4M34 24h4" opacity="0.6"/>
    </svg>`,
  "muertes-relacionadas": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M24 38s-14-9-14-18a8 8 0 0114-5 8 8 0 0114 5c0 9-14 18-14 18z" fill="rgba(255,32,46,0.2)" stroke="var(--sangre-viva)"/>
      <path d="M19 23l10 10M29 23l-10 10" stroke="#fff"/>
    </svg>`,
  "clasificacion-gore": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M24 6l16 6v14c0 10-8 16-16 18-8-2-16-8-16-18V12l16-6z" fill="rgba(255,32,46,0.25)" stroke="var(--sangre-viva)"/>
      <text x="24" y="30" font-family="sans-serif" font-size="13" font-weight="900" text-anchor="middle" fill="#fff" stroke="none">+16</text>
    </svg>`,
  "cuerpos-r15": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="19" y="6" width="10" height="9" rx="2" stroke="#fff"/>
      <rect x="15" y="17" width="18" height="14" rx="2" stroke="var(--sangre-viva)" fill="rgba(255,32,46,0.15)"/>
      <rect x="8" y="17" width="5" height="14" rx="2" stroke="#fff"/>
      <rect x="35" y="17" width="5" height="14" rx="2" stroke="#fff"/>
      <rect x="16" y="33" width="6" height="10" rx="2" stroke="#fff"/>
      <rect x="26" y="33" width="6" height="10" rx="2" stroke="#fff"/>
    </svg>`,
  "skins-y-tienda": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <path d="M8 18l16-10 16 10v20a2 2 0 01-2 2H10a2 2 0 01-2-2V18z" stroke="var(--oro)"/>
      <path d="M16 26l8-6 8 6v10H16V26z" fill="rgba(229,180,72,0.2)"/>
      <circle cx="24" cy="18" r="3" fill="var(--oro)"/>
    </svg>`,
  "power-ups": `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <rect x="8" y="12" width="32" height="24" rx="4" stroke="var(--sangre-viva)"/>
      <path d="M18 36l-4 6M30 36l4 6M16 12l6-6M32 12l-6-6" opacity="0.6"/>
      <circle cx="33" cy="20" r="1.5" fill="var(--oro)"/>
      <circle cx="33" cy="28" r="1.5" fill="var(--sangre-viva)"/>
      <path d="M14 18h14v12H14z" fill="rgba(255,32,46,0.3)"/>
    </svg>`
};

/* Tarjeta Modular de Mecánica */
export function tarjetaMecanica(m, index = 1){
  const icono = ICONOS_MECANICAS[m.id] || `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="var(--sangre-viva)"/>
      <path d="M24 14v20M14 24h20"/>
    </svg>`;

  const tipoClase = (m.tipo || "").toLowerCase().replace(/\s+/g, "-");

  return `
    <a class="tarjeta-mecanica tipo-${esc(tipoClase)}" href="#/mecanicas/${esc(m.id)}" data-revelar>
      <div class="mecanica-card-header">
        <span class="mecanica-mod-id">MOD // 0${index < 10 ? "0" + index : index}</span>
        <div class="mecanica-badges">
          <span class="mecanica-tipo-badge">${esc(m.tipo || "Sistema")}</span>
          ${m.estado === "canon" ? insignia("Canon", "canon") : insignia("Borrador", "borrador")}
        </div>
      </div>

      <div class="mecanica-card-body">
        <div class="mecanica-icono-marco">
          ${icono}
          <div class="mecanica-icono-glow" aria-hidden="true"></div>
        </div>

        <div class="mecanica-info">
          <h3 class="mecanica-titulo">${esc(m.nombre)}</h3>
          <p class="mecanica-resumen">${esc(m.resumen || "Regla y comportamiento documentado en el desarrollo.")}</p>
        </div>
      </div>

      <div class="mecanica-card-footer">
        <div class="mecanica-tags">
          ${(m.etiquetas || []).slice(0, 3).map(t => `<span class="mecanica-tag">#${esc(t)}</span>`).join("")}
        </div>
        <span class="mecanica-enlace">CONSULTAR REGLA &rarr;</span>
      </div>
    </a>`;
}

/* Catálogo de Mecánicas */
export async function vistaMecanicas(raiz, sec){
  const { entradas, error } = await cargarSeccion(sec.id);
  const valores = [...new Set(entradas.map(e => e.tipo).filter(Boolean))].sort();

  raiz.innerHTML = `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.descripcion)}</p>
    </section>

    <section class="seccion">
      <div class="contenedor">
        ${error ? `<div class="aviso"><b>No se pudo leer datos/${esc(sec.id)}.json</b><p>${esc(error)}</p></div>` : ""}

        <div class="barra-filtros">
          <button class="filtro" data-valor="" aria-pressed="true">Todas las Reglas</button>
          ${valores.map(v => `<button class="filtro" data-valor="${esc(v)}" aria-pressed="false">${esc(v)}</button>`).join("")}
          <label class="buscador-local">
            <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="1.5" aria-hidden="true"><circle cx="11" cy="11" r="6.5"/><path d="M16 16l4.5 4.5"/></svg>
            <input type="search" id="filtro-mecanica" placeholder="Buscar regla, modo o sistema..." aria-label="Buscar mecánicas">
          </label>
        </div>

        <p class="contador" id="contador-mecanicas"></p>
        <div class="rejilla-mecanicas" id="rejilla-mecanicas" style="margin-top:1.5rem"></div>
      </div>
    </section>`;

  const rejilla = $("#rejilla-mecanicas", raiz);
  const contador = $("#contador-mecanicas", raiz);
  const input = $("#filtro-mecanica", raiz);
  let filtro = "", texto = "";

  function pintar(){
    const lista = entradas.filter(e => {
      if (filtro && e.tipo !== filtro) return false;
      if (!texto) return true;
      const bolsa = norm([e.nombre, e.resumen, e.tipo, (e.etiquetas || []).join(" ")].join(" "));
      return bolsa.includes(texto);
    });

    contador.textContent = `${lista.length} ${lista.length === 1 ? "mecanismo documentado" : "mecanismos y reglas de juego"}`;
    rejilla.innerHTML = lista.length
      ? lista.map((e, i) => tarjetaMecanica(e, i + 1)).join("")
      : `<p class="vacio" style="grid-column:1/-1">No hay ninguna regla que coincida con esa búsqueda.</p>`;
    revelar(rejilla);
    tarjetas3D(rejilla);
  }

  $$(".filtro", raiz).forEach(b => b.addEventListener("click", () => {
    filtro = b.dataset.valor;
    $$(".filtro", raiz).forEach(o => o.setAttribute("aria-pressed", String(o === b)));
    pintar();
  }));

  input.addEventListener("input", debounce(() => {
    texto = norm(input.value.trim());
    pintar();
  }, 110));

  pintar();
}

/* Vista Detallada de una Mecánica / Protocolo */
export async function vistaMecanica(raiz, sec, id){
  const m = await buscarEntrada(sec.id, id);
  if (!m){
    raiz.innerHTML = `<section class="seccion"><div class="contenedor">
      <h2 style="font-family:var(--titular);color:#fff">MECÁNICA NO ENCONTRADA</h2>
      <p style="text-align:center"><a class="boton" href="#/mecanicas">Volver a Mecánicas</a></p></div></section>`;
    return;
  }
  document.title = `${m.nombre} · ${SITIO.titulo} WIKI`;

  const { entradas } = await cargarSeccion(sec.id);
  const pos = entradas.findIndex(x => x.id === m.id);
  const anterior = entradas[pos - 1], siguiente = entradas[pos + 1];

  const icono = ICONOS_MECANICAS[m.id] || `
    <svg viewBox="0 0 48 48" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true">
      <circle cx="24" cy="24" r="18" stroke="var(--sangre-viva)"/>
      <path d="M24 14v20M14 24h20"/>
    </svg>`;

  raiz.innerHTML = `
    <article class="mecanica-terminal-view">
      <div class="contenedor">
        <!-- HEADER PROTOCOLO -->
        <header class="mecanica-heroe-header">
          <p class="migas">
            <a href="#/">Inicio</a><span>/</span>
            <a href="#/mecanicas">Mecánicas</a><span>/</span>
            <span style="color:#fff">${esc(m.nombre)}</span>
          </p>

          <div class="mecanica-header-layout">
            <div class="mecanica-header-emblema">
              ${icono}
            </div>

            <div class="mecanica-header-datos">
              <div class="mecanica-meta-tags">
                <span class="mecanica-pill-tipo">${esc(m.tipo || "Sistema")}</span>
                ${m.estado === "canon" ? insignia("Canon", "canon") : insignia("Borrador", "borrador")}
                <span class="mecanica-pill-id">ID // ${esc(m.id.toUpperCase())}</span>
              </div>
              <h1 class="mecanica-titulo-principal">${esc(m.nombre)}</h1>
              ${m.resumen ? `<p class="mecanica-resumen-principal">${esc(m.resumen)}</p>` : ""}
            </div>
          </div>
        </header>

        <!-- CUERPO PRINCIPAL DEL PROTOCOLO (2 COLUMNAS) -->
        <div class="mecanica-layout-grid">
          <div class="mecanica-col-principal">
            <div class="mecanica-briefing-box">
              <div class="mecanica-barra-top">
                <span>DOCUMENTACIÓN DEL SISTEMA</span>
                <span>ESTADO: ${esc(m.estado ? m.estado.toUpperCase() : "REGISTRADO")}</span>
              </div>
              <div class="prosa mecanica-prosa">
                ${m.descripcion ? md(m.descripcion) : "<p>No hay descripción adicional documentada aún.</p>"}
              </div>
            </div>
          </div>

          <aside class="mecanica-col-sidebar">
            <div class="panel">
              <h4>Ficha del Sistema</h4>
              <div class="mapa-telemetria-grid">
                <div class="mapa-telemetria-item">
                  <span class="mapa-tele-label">Categoría</span>
                  <b class="mapa-tele-val">${esc(m.tipo || "Mecánica")}</b>
                </div>
                <div class="mapa-telemetria-item">
                  <span class="mapa-tele-label">Estado</span>
                  <b class="mapa-tele-val">${esc(m.estado === "canon" ? "Confirmado" : "Propuesta")}</b>
                </div>
                <div class="mapa-telemetria-item" style="grid-column:1/-1">
                  <span class="mapa-tele-label">Fuente</span>
                  <b class="mapa-tele-val" style="font-size:.88rem;color:var(--ceniza-clara)">${esc(m.fuente || "Desarrollo")}</b>
                </div>
              </div>
            </div>

            ${(m.etiquetas || []).length ? `
              <div class="panel">
                <h4>Etiquetas del Sistema</h4>
                <div class="chips">
                  ${(m.etiquetas || []).map(t => `<span class="chip">#${esc(t)}</span>`).join("")}
                </div>
              </div>` : ""}

            <div class="panel" style="background:rgba(255,32,46,0.06);border-color:rgba(255,32,46,0.2)">
              <h4>Acciones Rápidas</h4>
              <p style="color:var(--ceniza-clara);font-size:.9rem;line-height:1.6;margin:0 0 1rem">
                Explora el resto de mecánicas y modos de partida de Doom Paradox.
              </p>
              <a class="boton" data-variante="lleno" style="width:100%;text-align:center" href="#/mecanicas">Volver a Mecánicas</a>
            </div>
          </aside>
        </div>

        <!-- NAVEGACIÓN ENTRE MECÁNICAS -->
        <nav class="barra-navegacion-fichas" aria-label="Navegación entre mecánicas">
          ${anterior ? `
            <a class="nav-ficha-btn prev" href="#/mecanicas/${esc(anterior.id)}">
              <span class="nav-dir">&larr; Anterior</span>
              <span class="nav-nombre">${esc(anterior.nombre)}</span>
            </a>` : `<div style="flex:1"></div>`}
          
          <a class="nav-ficha-todos" href="#/mecanicas">Todas las Reglas</a>

          ${siguiente ? `
            <a class="nav-ficha-btn next" href="#/mecanicas/${esc(siguiente.id)}">
              <span class="nav-dir">Siguiente &rarr;</span>
              <span class="nav-nombre">${esc(siguiente.nombre)}</span>
            </a>` : `<div style="flex:1"></div>`}
        </nav>
      </div>
    </article>`;

  revelar(raiz);
}
