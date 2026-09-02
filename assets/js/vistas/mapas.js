/* ============================================================
   DOOM PARADOX · WIKI — Mapas y Cartografía Táctica HD 3.0
   Tarjetas de mapa con estilo radar/blueprint y terminal
   táctico ordenado con telemetría interactiva de balizas.
   ============================================================ */

import { SITIO } from "../config.js";
import { cargarSeccion, buscarEntrada, referencias } from "../datos.js";
import { $, $$, esc, md, imagen, insignia, revelar, peligro } from "../util.js";
import { iniciales } from "./inicio.js";

/* Renderiza la tarjeta de mapa táctico para catálogo e inicio */
export function tarjetaMapa(m){
  const puntos = m.puntos || [];
  return `
    <a class="tarjeta-mapa" href="#/mapas/${esc(m.id)}" data-revelar>
      <div class="tarjeta-mapa-preview">
        <div class="mapa-reticula" aria-hidden="true"></div>
        <div class="mapa-brujula" aria-hidden="true">N</div>
        <div class="mapa-coordenadas" aria-hidden="true">RECON-7 // ${(Number(puntos[0]?.x) || 45) * 1.8}° N · ${(Number(puntos[0]?.y) || 55) * 2.1}° W</div>
        
        <div class="mapa-lienzo-preview">
          ${imagen(m.imagen, "Plano de " + m.nombre, iniciales(m.nombre))}
        </div>

        <div class="mapa-radar-barrido" aria-hidden="true"></div>

        <div class="mapa-badges-top">
          ${m.zona ? `<span class="mapa-badge-zona">${esc(m.zona)}</span>` : ""}
          <span class="mapa-badge-puntos">
            <i class="beacon-pulso"></i>
            ${puntos.length} PUNTOS
          </span>
          ${m.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
          ${m.estado === "canon" ? insignia("Canon", "canon") : ""}
        </div>
      </div>

      <div class="tarjeta-mapa-cuerpo">
        <div class="tarjeta-mapa-cabecera">
          <h3 class="tarjeta-mapa-titulo">${esc(m.nombre)}</h3>
          <span class="tarjeta-mapa-sector">SECTOR // ${esc((m.zona || "LIMBO").toUpperCase())}</span>
        </div>
        <p class="tarjeta-mapa-resumen">${esc(m.resumen || "Escenario táctico del limbo con rutas y zonas clave.")}</p>

        <div class="tarjeta-mapa-footer">
          <div class="mapa-specs-lista">
            ${m.dificultad ? `<span class="mapa-spec-chip"><b>DIF:</b> ${esc(m.dificultad)}</span>` : ""}
            ${m.salidas ? `<span class="mapa-spec-chip"><b>SALIDAS:</b> ${esc(m.salidas)}</span>` : ""}
          </div>
          <span class="mapa-accion-explorar">EXPLORAR PLANO &rarr;</span>
        </div>
      </div>
    </a>`;
}

/* Catálogo de Mapas */
export async function vistaMapas(raiz, sec){
  const { entradas } = await cargarSeccion(sec.id);
  raiz.innerHTML = `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.descripcion)}</p>
    </section>

    <section class="seccion"><div class="contenedor">
      ${entradas.length 
        ? `<div class="rejilla-mapas">${entradas.map(m => tarjetaMapa(m)).join("")}</div>`
        : `<p class="vacio">Ningún mapa documentado todavía.</p>`}
    </div></section>`;
  revelar(raiz);
}

/* Vista Detallada de Mapa / Terminal Táctico */
export async function vistaMapa(raiz, sec, id){
  const m = await buscarEntrada(sec.id, id);
  if (!m){
    raiz.innerHTML = `<section class="seccion"><div class="contenedor">
      <h2 style="font-family:var(--titular);color:#fff">MAPA NO ENCONTRADO</h2>
      <p style="text-align:center"><a class="boton" href="#/mapas">Volver a los mapas</a></p></div></section>`;
    return;
  }
  document.title = `${m.nombre} · ${SITIO.titulo} WIKI`;
  const puntos = m.puntos || [];
  const verdugosRel = await referencias("verdugos", m.verdugos || []);
  const ostRel = await referencias("ost", m.ost || []);

  raiz.innerHTML = `
    <article class="mapa-terminal-view">
      <div class="contenedor">
        <!-- CABECERA TÁCTICA -->
        <header class="mapa-heroe-header">
          <p class="migas">
            <a href="#/">Inicio</a><span>/</span>
            <a href="#/mapas">Mapas</a><span>/</span>
            <span style="color:#fff">${esc(m.nombre)}</span>
          </p>

          <div class="mapa-titulo-fila">
            <div class="mapa-meta-tags">
              <span class="mapa-tag-sector">SECTOR // ${esc((m.zona || "EXTERIOR").toUpperCase())}</span>
              <span class="mapa-tag-balizas"><i class="beacon-pulso"></i> ${puntos.length} BALIZAS ACTIVAS</span>
              ${m.estado === "canon" ? insignia("Canon", "canon") : insignia("Borrador", "borrador")}
            </div>
            <h1 class="mapa-titulo-principal">${esc(m.nombre)}</h1>
            ${m.resumen ? `<p class="mapa-resumen-destacado">${esc(m.resumen)}</p>` : ""}
          </div>
        </header>

        <!-- GRID PRINCIPAL DEL TERMINAL (2 COLUMNAS PERFECTAMENTE ALINEADAS) -->
        <div class="mapa-terminal-grid">
          
          <!-- COLUMNA IZQUIERDA: VISOR TÁCTICO + BRIEFING ORDENADO -->
          <div class="mapa-col-visor">
            <!-- MARCO DEL VISOR HOLOGRÁFICO -->
            <div class="mapa-visor-marco">
              <div class="mapa-terminal-barra-top">
                <span class="terminal-id">TERRAIN RECON // SAT-ID: ${esc(m.id.toUpperCase())} // MODO TÁCTICO</span>
                <span class="terminal-live"><i class="beacon-pulso red"></i> VISTA EN TIEMPO REAL</span>
              </div>

              <div class="mapa-visor" id="visor">
                <div class="mapa-reticula-fondo" aria-hidden="true"></div>
                <div class="mapa-brujula-indicador" aria-hidden="true">N</div>

                <div class="mapa-lienzo" id="lienzo">
                  ${imagen(m.imagen, "Plano de " + m.nombre, iniciales(m.nombre))}
                  ${puntos.map((p, i) => `
                    <button class="punto" style="left:${Number(p.x) || 50}%;top:${Number(p.y) || 50}%"
                      data-punto="${i}" aria-label="${esc(p.titulo || "Punto " + (i + 1))}">
                      <i class="punto-baliza" aria-hidden="true"></i>
                      <i class="punto-baliza" aria-hidden="true"></i>
                      <span class="punto-num">${i + 1}</span>
                    </button>`).join("")}
                </div>

                <div class="mapa-controles">
                  <button data-zoom="1" aria-label="Acercar" title="Acercar">+</button>
                  <button data-zoom="-1" aria-label="Alejar" title="Alejar">&minus;</button>
                  <button data-zoom="0" aria-label="Restablecer vista" title="Restablecer vista">&#8635;</button>
                </div>
              </div>

              <div class="mapa-terminal-barra-bottom">
                <span>Arrastra para mover el plano · Rueda para zoom · Clic en balizas</span>
                <span id="zoom-nivel" style="color:var(--brasa);font-weight:700">ZOOM: 1.0x</span>
              </div>
            </div>

            <!-- DESGLOSE DEL TERRENO Y LORE ORDENADO EN BLOQUES TÁCTICOS -->
            <div class="mapa-secciones-briefing">
              ${m.descripcion ? md(m.descripcion) : ""}
              
              ${(m.secretos || []).length ? `
                <div class="mapa-dossier-card">
                  <h3 class="dossier-subtitulo">Secretos y Rutas del Escenario</h3>
                  <ul class="lista-tactica">
                    ${(m.secretos || []).map(s => `<li>${esc(s)}</li>`).join("")}
                  </ul>
                </div>` : ""}

              ${(m.consejos || []).length ? `
                <div class="mapa-dossier-card alerta">
                  <h3 class="dossier-subtitulo">Tácticas de Supervivencia en el Terreno</h3>
                  <ul class="lista-tactica">
                    ${(m.consejos || []).map(c => `<li>${esc(c)}</li>`).join("")}
                  </ul>
                </div>` : ""}
            </div>
          </div>

          <!-- COLUMNA DERECHA: INSPECTOR DE PUNTO (HUD) + ÍNDICE + TELEMETRÍA -->
          <aside class="mapa-col-sidebar">
            <!-- INSPECTOR DE BALIZA ACTIVA (HUD) -->
            <div class="hud-inspector" id="detalle">
              <div class="hud-header">
                <span class="hud-label">INSPECTOR DE BALIZA</span>
                <span class="hud-estado">ESPERANDO SELECCIÓN</span>
              </div>
              <div class="hud-cuerpo">
                <h4 class="hud-titulo">${puntos.length ? "Selecciona un punto" : "Sin balizas"}</h4>
                <p class="hud-texto">
                  ${puntos.length ? "Haz clic sobre un número en el plano o en la lista inferior para examinar la información de esa posición." : "No hay balizas registradas aún."}
                </p>
              </div>
            </div>

            <!-- ÍNDICE DE BALIZAS TÁCTICAS -->
            ${puntos.length ? `
              <div class="panel mapa-panel-indice">
                <h4>Índice de Balizas (${puntos.length})</h4>
                <div class="lista-balizas-interactivas">
                  ${puntos.map((p, i) => `
                    <button type="button" class="btn-baliza-item" data-ir="${i}">
                      <span class="baliza-num">0${i + 1}</span>
                      <div class="baliza-info">
                        <b class="baliza-nombre">${esc(p.titulo || "Punto " + (i + 1))}</b>
                        ${p.tipo ? `<span class="baliza-tipo">${esc(p.tipo)}</span>` : ""}
                      </div>
                    </button>`).join("")}
                </div>
              </div>` : ""}

            <!-- FICHA TÉCNICA DEL TERRENO -->
            <div class="panel">
              <h4>Telemetría del Terreno</h4>
              <div class="mapa-telemetria-grid">
                <div class="mapa-telemetria-item">
                  <span class="mapa-tele-label">Zona</span>
                  <b class="mapa-tele-val">${esc(m.zona || "Exterior")}</b>
                </div>
                <div class="mapa-telemetria-item">
                  <span class="mapa-tele-label">Dificultad</span>
                  <b class="mapa-tele-val">${esc(m.dificultad || "Estándar")}</b>
                </div>
                <div class="mapa-telemetria-item">
                  <span class="mapa-tele-label">Jugadores</span>
                  <b class="mapa-tele-val">${esc(m.jugadores || "8 Pecadores")}</b>
                </div>
                <div class="mapa-telemetria-item">
                  <span class="mapa-tele-label">Salidas</span>
                  <b class="mapa-tele-val">${esc(m.salidas || "2 Rutas")}</b>
                </div>
              </div>
            </div>

            <!-- AMENAZAS DEL MAPA (VERDUGOS) -->
            ${panelRef("Amenazas del Mapa", verdugosRel, "verdugos")}

            <!-- BANDA SONORA LIGADA -->
            ${panelRef("Banda Sonora Ligada", ostRel, "ost")}
          </aside>

        </div>
      </div>
    </article>`;

  visorInteractivo(raiz, puntos);
  revelar(raiz);
}

function panelRef(titulo, refs, ruta){
  if (!refs.length) return "";
  return `
    <div class="panel">
      <h4>${esc(titulo)}</h4>
      <div class="chips">
        ${refs.map(r => r.existe
          ? `<a class="chip" href="#/${esc(ruta)}/${esc(r.id)}">${esc(r.nombre)}</a>`
          : `<span class="chip" style="opacity:.55">${esc(r.nombre)}</span>`).join("")}
      </div>
    </div>`;
}

/* --- Lógica del Visor Interactivo (Pan, Zoom, Inspector HUD) --- */
function visorInteractivo(raiz, puntos){
  const visor = $("#visor", raiz);
  const lienzo = $("#lienzo", raiz);
  const detalle = $("#detalle", raiz);
  const zoomDisplay = $("#zoom-nivel", raiz);
  if (!visor || !lienzo) return;

  let escala = 1, x = 0, y = 0, arrastrando = false, px = 0, py = 0;

  const aplicar = () => {
    const r = visor.getBoundingClientRect();
    const max = (escala - 1);
    x = Math.min(0, Math.max(-r.width * max, x));
    y = Math.min(0, Math.max(-r.height * max, y));
    lienzo.style.transform = `translate(${x}px, ${y}px) scale(${escala})`;
    if (zoomDisplay) zoomDisplay.textContent = `ZOOM: ${escala.toFixed(1)}x`;
  };

  const zoom = (delta, cx = null, cy = null) => {
    const anterior = escala;
    escala = Math.min(4, Math.max(1, +(escala + delta).toFixed(2)));
    if (cx !== null){
      const r = visor.getBoundingClientRect();
      const fx = (cx - r.left - x) / anterior;
      const fy = (cy - r.top - y) / anterior;
      x -= fx * (escala - anterior);
      y -= fy * (escala - anterior);
    }
    aplicar();
  };

  // Dragging
  visor.addEventListener("mousedown", e => {
    if (e.target.closest(".punto") || e.target.closest(".mapa-controles")) return;
    arrastrando = true;
    visor.classList.add("arrastrando");
    px = e.clientX - x;
    py = e.clientY - y;
  });

  window.addEventListener("mousemove", e => {
    if (!arrastrando) return;
    x = e.clientX - px;
    y = e.clientY - py;
    aplicar();
  });

  window.addEventListener("mouseup", () => {
    arrastrando = false;
    visor.classList.remove("arrastrando");
  });

  // Wheel zoom
  visor.addEventListener("wheel", e => {
    e.preventDefault();
    zoom(e.deltaY < 0 ? 0.25 : -0.25, e.clientX, e.clientY);
  }, { passive: false });

  // Botones de zoom
  visor.querySelectorAll(".mapa-controles button").forEach(b => {
    b.addEventListener("click", () => {
      const z = Number(b.dataset.zoom);
      if (z === 0){ escala = 1; x = 0; y = 0; aplicar(); }
      else zoom(z * 0.35);
    });
  });

  // Inspector de punto activo
  const seleccionarPunto = (i) => {
    const p = puntos[i];
    if (!p || !detalle) return;

    // Resaltar baliza
    $$(".punto", visor).forEach((btn, idx) => {
      btn.setAttribute("aria-current", String(idx === i));
    });
    $$(".btn-baliza-item", raiz).forEach((btn, idx) => {
      btn.classList.toggle("activo", idx === i);
    });

    detalle.innerHTML = `
      <div class="hud-header">
        <span class="hud-label">BALIZA DETECTADA // 0${i + 1}</span>
        ${p.tipo ? `<span class="hud-badge">${esc(p.tipo)}</span>` : ""}
      </div>
      <div class="hud-cuerpo">
        <h4 class="hud-titulo">${esc(p.titulo || "Punto " + (i + 1))}</h4>
        <p class="hud-texto">${esc(p.texto || "Zona táctica del mapa.")}</p>
        <div class="hud-coordenadas-p">COORD: X=${Number(p.x) || 50}% · Y=${Number(p.y) || 50}%</div>
      </div>`;

    // Centrar mapa suavemente en el punto
    const r = visor.getBoundingClientRect();
    const pxPos = ((Number(p.x) || 50) / 100) * r.width;
    const pyPos = ((Number(p.y) || 50) / 100) * r.height;
    if (escala > 1){
      x = r.width / 2 - pxPos * escala;
      y = r.height / 2 - pyPos * escala;
      aplicar();
    }
  };

  // Clic en balizas del plano
  $$(".punto", visor).forEach((b, i) => {
    b.addEventListener("click", () => seleccionarPunto(i));
  });

  // Clic en lista de balizas
  $$(".btn-baliza-item", raiz).forEach((b, i) => {
    b.addEventListener("click", () => {
      seleccionarPunto(i);
      visor.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  });

  aplicar();
}
