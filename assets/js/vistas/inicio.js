/* ============================================================
   DOOM PARADOX · WIKI — Portada (VFX HD 3.0)
   Hero cinematográfico, telemetría del códice, altar de lore
   y escaparate dinámico de verdugos, pecadores, mapas y OST.
   ============================================================ */

import { SITIO } from "../config.js";
import { cargarTodo } from "../datos.js";
import { esc, imagen, insignia, peligro, revelar } from "../util.js";
import { sonidoUI, crearChispas } from "../efectos.js";
import { tarjetaMapa } from "./mapas.js";

export async function vistaInicio(raiz){
  const todo = await cargarTodo();
  const conteo = Object.fromEntries(
    SITIO.secciones.map(s => [s.id, (todo[s.id]?.entradas || []).length])
  );
  const total = Object.values(conteo).reduce((a, b) => a + b, 0);

  // Iconos temáticos para cada pod
  const iconos = {
    verdugos: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2l3 5h6l-5 4 2 6-6-3-6 3 2-6-5-4h6z"/></svg>`,
    pecadores: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="5"/><path d="M20 21a8 8 0 10-16 0"/></svg>`,
    mapas: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><polygon points="1 6 1 22 8 18 16 22 23 18 23 2 16 6 8 2 1 6"/><line x1="8" y1="2" x2="8" y2="18"/><line x1="16" y1="6" x2="16" y2="22"/></svg>`,
    mecanicas: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-2 2 2 2 0 01-2-2v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83 0 2 2 0 010-2.83l.06-.06a1.65 1.65 0 00.33-1.82 1.65 1.65 0 00-1.51-1H3a2 2 0 01-2-2 2 2 0 012-2h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06a1.65 1.65 0 001.82.33H9a1.65 1.65 0 001-1.51V3a2 2 0 012-2 2 2 0 012 2v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06a1.65 1.65 0 00-.33 1.82V9a1.65 1.65 0 001.51 1H21a2 2 0 012 2 2 2 0 01-2 2h-.09a1.65 1.65 0 00-1.51 1z"/></svg>`,
    ost: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/></svg>`,
    galeria: `<svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/></svg>`
  };

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
          <div class="${sec.id === "mapas" ? "rejilla-mapas" : "rejilla"}" ${sec.id === "mapas" ? "" : "data-densa"}>${entradas.map(e => tarjeta(sec, e)).join("")}</div>
          <p style="margin-top:2.2rem;text-align:center">
            <a class="boton" href="#/${esc(sec.ruta)}">Ver ${conteo[sec.id]} ${esc(sec.nombre.toLowerCase())} &rarr;</a>
          </p>
        </div>
      </section>`;
  }).join("");

  raiz.innerHTML = `
    <!-- HERO CINEMATOGRÁFICO -->
    <section class="heroe">
      <div class="heroe-inner">
        <p class="heroe-tag-comunidad"><span class="heroe-tag-raya"></span>ARCHIVO DE LA COMUNIDAD</p>
        <h1 class="heroe-titulo-clasico">
          <span class="heroe-linea-doom">DOOM</span>
          <span class="heroe-linea-paradox">PARADOX</span>
        </h1>
        <p class="heroe-lema-clasico">${esc(SITIO.lema).toUpperCase()}</p>
        <p class="heroe-bajada-clasica">${esc(SITIO.descripcion)}</p>
        <div class="botones">
          <a class="boton" data-variante="lleno" href="#/verdugos">Entrar al Archivo</a>
          <button class="boton" id="btn-azar" type="button">Entrada al Azar</button>
          ${SITIO.enlaces.discord ? `<a class="boton" href="${esc(SITIO.enlaces.discord)}" target="_blank" rel="noopener">Discord</a>` : ""}
        </div>
      </div>
      <p class="heroe-scroll">DESCIENDE AL ABISMO</p>
    </section>

    <!-- TELEMETRÍA DEL CÓDICE / PODS DE ESTADÍSTICAS -->
    <section class="seccion" style="padding-top:0" data-revelar>
      <div class="contenedor">
        <div class="rejilla-pods">
          ${SITIO.secciones.map(s => `
            <a class="pod-stat" href="#/${esc(s.ruta)}">
              <div class="pod-encabezado">
                <span class="pod-nombre">${esc(s.nombre)}</span>
                <span class="pod-icono">${iconos[s.id] || "★"}</span>
              </div>
              <div class="pod-valor">${conteo[s.id]}</div>
              <div class="pod-barra"><i style="width:${Math.min(100, Math.max(15, (conteo[s.id] / 24) * 100))}%"></i></div>
            </a>`).join("")}
          <div class="pod-stat" style="border-color:var(--oro);background:linear-gradient(145deg,rgba(35,26,14,0.9),rgba(14,10,8,0.95))">
            <div class="pod-encabezado">
              <span class="pod-nombre" style="color:var(--oro-vivo)">Total Fichas</span>
              <span class="pod-icono" style="background:rgba(229,180,72,0.2);color:var(--oro)">✦</span>
            </div>
            <div class="pod-valor" style="color:var(--oro-vivo);text-shadow:0 0 24px rgba(229,180,72,0.8)">${total}</div>
            <div class="pod-barra"><i style="background:linear-gradient(90deg,#967320,var(--oro));box-shadow:0 0 8px var(--oro)"></i></div>
          </div>
        </div>
      </div>
    </section>

    <!-- ALTAR DEL LORE / LA PREMISA -->
    <section class="seccion" data-revelar>
      <div class="contenedor">
        <div class="altar-lore">
          <p class="etiqueta"><span class="raya"></span>La Premisa de la Entidad</p>
          <p class="cita-bloque">
            «Un infierno manejado por una entidad lovecraftiana que disfruta y se alimenta del sufrimiento humano.»
          </p>
          <p style="color:var(--ceniza-clara);max-width:64ch;margin:0 auto 1.8rem;line-height:1.8">
            Los pecadores intentan reparar y escapar. Los verdugos cobran la deuda de sangre. Y cada pecador arrastra un
            vínculo con alguno de ellos: ese pecado decide cómo muere.
          </p>
          <div class="botones">
            <a class="boton" data-variante="lleno" href="#/mecanicas/el-infierno">Leer el Lore del Infierno</a>
            <a class="boton" href="#/mecanicas">Ver las Mecánicas</a>
          </div>
        </div>
      </div>
    </section>

    ${bloques}`;

  // Botón Ruleta del Destino (con chispas y sonido)
  const btnAzar = raiz.querySelector("#btn-azar");
  btnAzar?.addEventListener("click", (e) => {
    sonidoUI("fuego");
    const rect = btnAzar.getBoundingClientRect();
    crearChispas(rect.left + rect.width / 2, rect.top + rect.height / 2, 24);

    const pares = SITIO.secciones.flatMap(s =>
      (todo[s.id]?.entradas || []).map(entry => `#/${s.ruta}/${entry.id}`));
    if (pares.length){
      setTimeout(() => {
        location.hash = pares[Math.floor(Math.random() * pares.length)];
      }, 180);
    }
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
      <p class="vacio">Todavía no hay entradas en esta sección.</p>
    </div></section>`;
}

function tarjeta(sec, e){
  if (sec.id === "mapas") return tarjetaMapa(e);
  const nombre = e.nombre || e.titulo || e.id;
  return `
    <a class="ficha" href="#/${esc(sec.ruta)}/${esc(e.id)}">
      <div class="ficha-lienzo">${imagen(e.imagen, nombre, iniciales(nombre))}</div>
      <div class="insignias">
        ${e.estado === "borrador" ? insignia("Borrador", "borrador") : ""}
        ${e.estado === "canon" ? insignia("Canon", "canon") : ""}
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
