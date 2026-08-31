/* ============================================================
   Atmosfera: cenizas, barra de lectura, ambiente sonoro
   generado por sintesis (no hace falta subir ningun archivo).
   ============================================================ */

import { $, $$ } from "./util.js";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- cenizas flotantes ---------------- */
export function cenizas(){
  const lienzo = $("#cenizas");
  if (!lienzo || reduce()) return;
  const ctx = lienzo.getContext("2d");
  let an = 0, al = 0, particulas = [], raf = 0, visible = true;

  function medir(){
    an = lienzo.width  = Math.floor(innerWidth  * Math.min(devicePixelRatio, 2));
    al = lienzo.height = Math.floor(innerHeight * Math.min(devicePixelRatio, 2));
    lienzo.style.width = innerWidth + "px";
    lienzo.style.height = innerHeight + "px";
    const cuantas = Math.round(Math.min(90, innerWidth / 16));
    particulas = Array.from({ length: cuantas }, nueva);
  }
  function nueva(){
    return {
      x: Math.random() * an,
      y: Math.random() * al,
      r: (Math.random() * 1.6 + .35) * Math.min(devicePixelRatio, 2),
      vy: -(Math.random() * .28 + .07),
      vx: (Math.random() - .5) * .22,
      a: Math.random() * .55 + .12,
      fase: Math.random() * Math.PI * 2,
      brasa: Math.random() < .18
    };
  }
  function pintar(t){
    ctx.clearRect(0, 0, an, al);
    for (const p of particulas){
      p.fase += .012;
      p.x += p.vx + Math.sin(p.fase) * .32;
      p.y += p.vy;
      if (p.y < -10){ Object.assign(p, nueva(), { y: al + 8 }); }
      if (p.x < -12) p.x = an + 8; else if (p.x > an + 12) p.x = -8;
      const parpadeo = .65 + Math.sin(p.fase * 2.4) * .35;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = p.brasa
        ? `rgba(226,60,32,${(p.a * parpadeo).toFixed(3)})`
        : `rgba(196,190,182,${(p.a * parpadeo * .55).toFixed(3)})`;
      if (p.brasa){ ctx.shadowColor = "rgba(226,60,32,.75)"; ctx.shadowBlur = 9; }
      ctx.fill();
      ctx.shadowBlur = 0;
    }
    raf = requestAnimationFrame(pintar);
  }
  medir();
  addEventListener("resize", medir, { passive: true });
  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(pintar);
  });
  raf = requestAnimationFrame(pintar);
}

/* ---------------- barra de progreso de lectura ---------------- */
export function progresoLectura(){
  const barra = document.createElement("div");
  barra.className = "progreso";
  document.body.appendChild(barra);
  const calc = () => {
    const alto = document.documentElement.scrollHeight - innerHeight;
    barra.style.width = alto > 40 ? (scrollY / alto) * 100 + "%" : "0%";
  };
  addEventListener("scroll", calc, { passive: true });
  addEventListener("resize", calc, { passive: true });
  calc();
}

/* ---------------- imagenes que aun no existen ---------------- */
export function reservaImagenes(){
  document.addEventListener("error", (e) => {
    const img = e.target;
    if (!(img instanceof HTMLImageElement) || !img.dataset.ini) return;
    const padre = img.parentElement;
    const suelto = img.dataset.bloque === "1" || (padre && padre.tagName === "FIGURE");
    const hueco = document.createElement("div");
    hueco.className = suelto ? "sin-imagen bloque" : "sin-imagen";
    hueco.innerHTML = `<span>${img.dataset.ini}</span>`;
    img.replaceWith(hueco);
    if (padre && getComputedStyle(padre).position === "static") padre.style.position = "relative";
  }, true);
}

/* ---------------- ambiente sonoro sintetizado ---------------- */
let audioCtx = null, nodos = null;

export function ambiente(){
  const boton = $("#alternar-audio");
  if (!boton) return;
  boton.addEventListener("click", () => {
    const encendido = boton.getAttribute("aria-pressed") === "true";
    encendido ? apagarAmbiente(boton) : encenderAmbiente(boton);
  });
}

function encenderAmbiente(boton){
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  audioCtx ||= new AC();
  audioCtx.resume();

  const salida = audioCtx.createGain();
  salida.gain.value = 0;
  salida.connect(audioCtx.destination);

  // ruido rosa filtrado: el "viento" del mapa
  const largo = audioCtx.sampleRate * 3;
  const buffer = audioCtx.createBuffer(1, largo, audioCtx.sampleRate);
  const datos = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < largo; i++){
    const blanco = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + blanco * 0.0990460;
    b1 = 0.96300 * b1 + blanco * 0.2965164;
    b2 = 0.57000 * b2 + blanco * 1.0526913;
    datos[i] = (b0 + b1 + b2 + blanco * 0.1848) * 0.16;
  }
  const ruido = audioCtx.createBufferSource();
  ruido.buffer = buffer; ruido.loop = true;
  const paso = audioCtx.createBiquadFilter();
  paso.type = "lowpass"; paso.frequency.value = 420; paso.Q.value = .6;
  ruido.connect(paso).connect(salida);

  // drone grave con dos osciladores desafinados
  const drone = audioCtx.createGain(); drone.gain.value = .05;
  [55, 55.4, 82.5].forEach((f, i) => {
    const o = audioCtx.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const g = audioCtx.createGain(); g.gain.value = i === 2 ? .35 : 1;
    o.connect(g).connect(drone); o.start();
  });
  drone.connect(salida);

  // latido lento
  const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.07;
  const lfoG = audioCtx.createGain(); lfoG.gain.value = 180;
  lfo.connect(lfoG).connect(paso.frequency); lfo.start();

  ruido.start();
  salida.gain.linearRampToValueAtTime(.5, audioCtx.currentTime + 2.2);
  nodos = { salida, ruido, lfo };
  boton.setAttribute("aria-pressed", "true");
  boton.title = "Silenciar ambiente";
}

function apagarAmbiente(boton){
  if (nodos && audioCtx){
    const t = audioCtx.currentTime;
    nodos.salida.gain.cancelScheduledValues(t);
    nodos.salida.gain.setValueAtTime(nodos.salida.gain.value, t);
    nodos.salida.gain.linearRampToValueAtTime(0, t + .8);
    setTimeout(() => { try{ nodos.ruido.stop(); nodos.lfo.stop(); }catch(_){} nodos = null; }, 900);
  }
  boton.setAttribute("aria-pressed", "false");
  boton.title = "Ambiente sonoro";
}

/* ---------------- menu movil ---------------- */
export function menuMovil(){
  const boton = $("#abrir-menu"), nav = $("#nav");
  if (!boton || !nav) return;
  const cerrar = () => { nav.dataset.abierto = "false"; boton.setAttribute("aria-expanded", "false"); };
  boton.addEventListener("click", () => {
    const abierto = nav.dataset.abierto === "true";
    nav.dataset.abierto = String(!abierto);
    boton.setAttribute("aria-expanded", String(!abierto));
  });
  nav.addEventListener("click", e => { if (e.target.tagName === "A") cerrar(); });
  addEventListener("hashchange", cerrar);
}

/* ---------------- glitch aleatorio en la marca ---------------- */
export function pulsoMarca(){
  const marca = $(".marca-titulo");
  if (!marca || reduce()) return;
  setInterval(() => {
    if (Math.random() > .25) return;
    marca.classList.add("glitcheando");
    marca.style.textShadow = "2px 0 rgba(226,35,26,.9), -2px 0 rgba(58,208,224,.6)";
    setTimeout(() => { marca.style.textShadow = ""; marca.classList.remove("glitcheando"); }, 110);
  }, 5200);
}
