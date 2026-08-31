/* ============================================================
   OST: lista de temas + reproductor con visor de onda
   Soporta archivos locales (assets/audio) y enlaces de YouTube.
   ============================================================ */

import { SITIO, urlEditar, urlIssue } from "../config.js";
import { cargarSeccion, buscarEntrada, referencias } from "../datos.js";
import { $, $$, esc, md, duracion, insignia, revelar } from "../util.js";
import { comentarios, montarComentarios } from "../comentarios.js";

let audio, ctxAudio, analizador, fuenteConectada = false, animando = 0;

export async function vistaOst(raiz, sec){
  const { entradas } = await cargarSeccion(sec.id);

  raiz.innerHTML = `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.descripcion)}</p>
    </section>
    <section class="seccion"><div class="contenedor">
      ${entradas.length ? entradas.map((t, i) => filaPista(t, i)).join("") : `<p class="vacio">Todavia no hay temas subidos.</p>`}

      <div class="reproductor" id="reproductor" hidden>
        <div class="repro-info">
          <b id="repro-titulo">—</b><span id="repro-autor"></span>
        </div>
        <canvas class="visor-onda" id="onda" width="900" height="44" aria-hidden="true"></canvas>
        <button class="boton" id="repro-stop">Detener</button>
      </div>

      <div class="aviso" style="margin-top:3rem">
        <b>Como anadir un tema</b>
        <p>Sube el archivo a <code>assets/audio/</code> (mp3 u ogg ligero) y describelo en
        <a href="${esc(urlEditar("ost"))}" target="_blank" rel="noopener">datos/ost.json</a>.
        Si el tema solo esta en YouTube, basta con poner su enlace.
        Tambien puedes <a href="${esc(urlIssue("nueva-entrada.yml", "[OST] "))}" target="_blank" rel="noopener">proponerlo</a>.</p>
      </div>
    </div></section>`;

  conectarPistas(raiz, entradas);
  revelar(raiz);
}

export async function vistaTema(raiz, sec, id){
  const t = await buscarEntrada(sec.id, id);
  if (!t){
    raiz.innerHTML = `<section class="seccion"><div class="contenedor"><h2>Tema no encontrado</h2>
      <p style="text-align:center"><a class="boton" href="#/ost">Volver a la OST</a></p></div></section>`;
    return;
  }
  document.title = `${t.titulo} · ${SITIO.titulo} WIKI`;
  const mapasRel = await referencias("mapas", t.mapas || []);
  const verdRel  = await referencias("verdugos", t.verdugos || []);

  raiz.innerHTML = `
    <article class="seccion"><div class="contenedor">
      <p class="migas"><a href="#/">Inicio</a><span>/</span><a href="#/ost">OST</a><span>/</span>${esc(t.titulo)}</p>
      <h1 class="entrada-titulo">${esc(t.titulo)}</h1>
      <p class="entrada-alias">${esc(t.autor || t.compositor || "Autor sin acreditar")}</p>

      ${filaPista(t, 0)}

      <div class="reproductor" id="reproductor" hidden>
        <div class="repro-info"><b id="repro-titulo">—</b><span id="repro-autor"></span></div>
        <canvas class="visor-onda" id="onda" width="900" height="44" aria-hidden="true"></canvas>
        <button class="boton" id="repro-stop">Detener</button>
      </div>

      ${t.youtube ? `<div style="margin-top:1.4rem;border:1px solid var(--linea);aspect-ratio:16/9">
        <iframe style="width:100%;height:100%;border:0" src="https://www.youtube-nocookie.com/embed/${esc(idYoutube(t.youtube))}"
          title="${esc(t.titulo)}" loading="lazy" allowfullscreen referrerpolicy="no-referrer"></iframe></div>` : ""}

      <div class="cuerpo-entrada">
        <div class="prosa">${t.descripcion ? md(t.descripcion) : "<p class=\"vacio\">Sin notas todavia.</p>"}</div>
        <aside>
          <div class="panel"><h4>Ficha</h4>
            <ul class="datos" style="border:0;background:transparent;grid-template-columns:1fr">
              ${t.escena ? `<li style="padding-left:0"><b>Suena en</b><span>${esc(t.escena)}</span></li>` : ""}
              ${t.duracion ? `<li style="padding-left:0"><b>Duracion</b><span>${duracion(t.duracion)}</span></li>` : ""}
              ${t.estado ? `<li style="padding-left:0"><b>Estado</b><span>${esc(t.estado)}</span></li>` : ""}
            </ul>
          </div>
          ${panelRef("Mapas", mapasRel, "mapas")}
          ${panelRef("Verdugos", verdRel, "verdugos")}
        </aside>
      </div>

      ${comentarios(`ost/${t.id}`, t.titulo)}
    </div></article>`;

  conectarPistas(raiz, [t]);
  revelar(raiz);
  montarComentarios(raiz);
}

function panelRef(titulo, refs, ruta){
  if (!refs.length) return "";
  return `<div class="panel"><h4>${esc(titulo)}</h4><div class="chips">
    ${refs.map(r => r.existe
      ? `<a class="chip" href="#/${esc(ruta)}/${esc(r.id)}">${esc(r.nombre)}</a>`
      : `<span class="chip" style="opacity:.55">${esc(r.nombre)}</span>`).join("")}
  </div></div>`;
}

function filaPista(t, i){
  const jugable = !!t.archivo;
  return `
    <div class="pista" data-pista="${esc(t.id)}" data-archivo="${esc(t.archivo || "")}" data-revelar>
      <button class="pista-play" ${jugable ? "" : "disabled style=\"opacity:.35;cursor:not-allowed\""}
        aria-label="${jugable ? "Reproducir " + esc(t.titulo) : "Audio no disponible"}">
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 4l13 8-13 8z"/></svg>
      </button>
      <div style="min-width:0">
        <a class="pista-nombre" href="#/ost/${esc(t.id)}">${esc(t.titulo || "Sin titulo")}</a>
        <div class="pista-meta">
          ${esc(t.autor || t.compositor || "autor por acreditar")}
          ${t.escena ? " · " + esc(t.escena) : ""}
          ${!jugable && t.youtube ? " · solo en YouTube" : ""}
          ${t.estado === "borrador" ? " " + insignia("Borrador", "borrador") : ""}
        </div>
      </div>
      <span class="pista-dur">${duracion(t.duracion)}</span>
    </div>`;
}

function idYoutube(url = ""){
  const m = String(url).match(/(?:v=|youtu\.be\/|embed\/)([\w-]{6,})/);
  return m ? m[1] : String(url);
}

function conectarPistas(raiz, entradas){
  const repro = $("#reproductor", raiz);
  if (!repro) return;
  const onda = $("#onda", raiz);
  const titulo = $("#repro-titulo", raiz), autor = $("#repro-autor", raiz);

  audio ||= new Audio();
  audio.crossOrigin = "anonymous";
  audio.preload = "none";

  $$(".pista", raiz).forEach(fila => {
    const boton = $(".pista-play", fila);
    if (!boton || boton.disabled) return;
    boton.addEventListener("click", () => {
      const id = fila.dataset.pista;
      const t = entradas.find(x => x.id === id);
      if (!t) return;
      if (audio.dataset && audio.dataset.id === id && !audio.paused){ audio.pause(); marcar(raiz, null); return; }
      audio.src = fila.dataset.archivo;
      audio.dataset.id = id;
      audio.play().then(() => {
        repro.hidden = false;
        titulo.textContent = t.titulo || "";
        autor.textContent = t.autor || t.compositor || "";
        marcar(raiz, id);
        dibujarOnda(onda);
      }).catch(err => {
        repro.hidden = false;
        titulo.textContent = "No se pudo reproducir";
        autor.textContent = String(err.message || "").slice(0, 60);
      });
    });
  });

  $("#repro-stop", raiz)?.addEventListener("click", () => {
    audio.pause(); audio.currentTime = 0; repro.hidden = true; marcar(raiz, null);
    cancelAnimationFrame(animando);
  });
  audio.onended = () => { marcar(raiz, null); cancelAnimationFrame(animando); };
}

function marcar(raiz, id){
  $$(".pista", raiz).forEach(f => f.dataset.sonando = String(f.dataset.pista === id));
}

function dibujarOnda(lienzo){
  if (!lienzo) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctxAudio ||= new AC();
  if (!fuenteConectada){
    try{
      const fuente = ctxAudio.createMediaElementSource(audio);
      analizador = ctxAudio.createAnalyser();
      analizador.fftSize = 512;
      fuente.connect(analizador).connect(ctxAudio.destination);
      fuenteConectada = true;
    }catch(_){ return; }
  }
  ctxAudio.resume();
  const ctx = lienzo.getContext("2d");
  const datos = new Uint8Array(analizador.frequencyBinCount);

  (function bucle(){
    animando = requestAnimationFrame(bucle);
    analizador.getByteFrequencyData(datos);
    const w = lienzo.width, h = lienzo.height;
    ctx.clearRect(0, 0, w, h);
    const n = 64, paso = Math.floor(datos.length / n);
    for (let i = 0; i < n; i++){
      const v = datos[i * paso] / 255;
      const alto = Math.max(2, v * h);
      const x = (i / n) * w;
      const g = ctx.createLinearGradient(0, h, 0, h - alto);
      g.addColorStop(0, "rgba(168,13,18,.9)");
      g.addColorStop(1, "rgba(226,35,26,.35)");
      ctx.fillStyle = g;
      ctx.fillRect(x, h - alto, w / n - 2, alto);
    }
  })();
}
