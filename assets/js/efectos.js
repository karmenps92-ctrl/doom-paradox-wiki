/* ============================================================
   DOOM PARADOX · WIKI — Motor de Efectos Visuales (VFX 2.0)
   Cenizas y brasas vivas, iluminación del vacío, tilt 3D,
   ondas de impacto, distorsión y ambiente sonoro sintetizado.
   ============================================================ */

import { $, $$ } from "./util.js";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------------- Sistema de Cenizas y Brasas 2.0 ---------------- */
let chispasManuales = [];

export function cenizas(){
  const lienzo = $("#cenizas");
  if (!lienzo || reduce()) return;
  const ctx = lienzo.getContext("2d");
  let an = 0, al = 0, particulas = [], raf = 0, visible = true;
  let ratonX = -9999, ratonY = -9999, ratonVx = 0, ratonVy = 0, prevRatonX = 0, prevRatonY = 0;

  function medir(){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    an = lienzo.width  = Math.floor(window.innerWidth  * dpr);
    al = lienzo.height = Math.floor(window.innerHeight * dpr);
    lienzo.style.width  = window.innerWidth + "px";
    lienzo.style.height = window.innerHeight + "px";

    const baseCount = Math.round(Math.min(130, Math.max(45, window.innerWidth / 12)));
    particulas = Array.from({ length: baseCount }, (_, i) => nueva(i < baseCount * 0.28, true));
  }

  function nueva(esBrasa = false, inicio = false){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const capa = esBrasa ? 2 : (Math.random() < 0.4 ? 0 : 1); // 0: fondo, 1: medio, 2: brasa activa

    return {
      capa,
      x: Math.random() * an,
      y: inicio ? Math.random() * al : al + 15 * dpr,
      r: (capa === 2 ? Math.random() * 2.2 + 0.8 : (capa === 1 ? Math.random() * 1.5 + 0.5 : Math.random() * 0.9 + 0.3)) * dpr,
      vy: -(Math.random() * (capa === 2 ? 0.65 : (capa === 1 ? 0.38 : 0.2)) + 0.1) * dpr,
      vx: (Math.random() - 0.5) * 0.3 * dpr,
      a: Math.random() * 0.6 + (capa === 2 ? 0.35 : 0.15),
      fase: Math.random() * Math.PI * 2,
      faseVel: (Math.random() * 0.02 + 0.008),
      brasa: capa === 2,
      vidaMax: Math.random() * 400 + 200,
      edad: inicio ? Math.random() * 300 : 0,
      temperatura: Math.random() * 0.5 + 0.5
    };
  }

  function actualizarRaton(e){
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    ratonVx = (e.clientX * dpr - prevRatonX) * 0.3;
    ratonVy = (e.clientY * dpr - prevRatonY) * 0.3;
    prevRatonX = ratonX = e.clientX * dpr;
    prevRatonY = ratonY = e.clientY * dpr;
  }

  function pintar(){
    ctx.clearRect(0, 0, an, al);
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const radioInteraccion = 120 * dpr;
    const radioSq = radioInteraccion * radioInteraccion;

    // 1. Partículas ambientales principales
    for (let i = 0; i < particulas.length; i++){
      const p = particulas[i];
      p.edad++;
      p.fase += p.faseVel;

      // Movimiento sinusoidal natural
      const osc = Math.sin(p.fase) * (p.capa === 2 ? 0.6 : 0.35) * dpr;
      p.x += p.vx + osc;
      p.y += p.vy;

      // Interacción física con el cursor (viento / empuje)
      if (ratonX > 0) {
        const dx = p.x - ratonX;
        const dy = p.y - ratonY;
        const distSq = dx * dx + dy * dy;
        if (distSq < radioSq && distSq > 4) {
          const dist = Math.sqrt(distSq);
          const fuerza = (1 - dist / radioInteraccion) * 2.2;
          p.x += (dx / dist) * fuerza * dpr + ratonVx * 0.15;
          p.y += (dy / dist) * fuerza * dpr + ratonVy * 0.15;
          if (p.brasa) p.temperatura = Math.min(1, p.temperatura + 0.08);
        }
      }

      // Reaparición si sale de pantalla o expira
      if (p.y < -15 * dpr || p.edad > p.vidaMax){
        Object.assign(p, nueva(p.brasa, false));
      }
      if (p.x < -20 * dpr) p.x = an + 15 * dpr;
      else if (p.x > an + 20 * dpr) p.x = -15 * dpr;

      // Renderizado según capa
      const parpadeo = 0.7 + Math.sin(p.fase * 2.8) * 0.3;
      const alfa = Math.min(1, Math.max(0, p.a * parpadeo));

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);

      if (p.brasa){
        // Núcleo blanco/naranja y halo carmesí incandescente
        const rVal = Math.round(220 + p.temperatura * 35);
        const gVal = Math.round(40 + p.temperatura * 75);
        const bVal = Math.round(25 + p.temperatura * 45);
        ctx.fillStyle = `rgba(${rVal},${gVal},${bVal},${alfa.toFixed(3)})`;
        ctx.shadowColor = `rgba(226,35,26,${(alfa * 0.85).toFixed(2)})`;
        ctx.shadowBlur = 10 * dpr;
        ctx.fill();
        ctx.shadowBlur = 0;
      } else if (p.capa === 1){
        // Ceniza intermedia crispada
        ctx.fillStyle = `rgba(180,172,168,${(alfa * 0.45).toFixed(3)})`;
        ctx.fill();
      } else {
        // Ceniza de fondo suave
        ctx.fillStyle = `rgba(120,115,120,${(alfa * 0.25).toFixed(3)})`;
        ctx.fill();
      }
    }

    // 2. Chispas generadas por clics e interacciones
    for (let i = chispasManuales.length - 1; i >= 0; i--){
      const c = chispasManuales[i];
      c.x += c.vx;
      c.y += c.vy;
      c.vy += c.gravedad;
      c.vx *= 0.96;
      c.vy *= 0.96;
      c.vida -= c.decaimiento;

      if (c.vida <= 0){
        chispasManuales.splice(i, 1);
        continue;
      }

      ctx.beginPath();
      ctx.arc(c.x, c.y, c.r * c.vida, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${c.rVal},${c.gVal},${c.bVal},${(c.vida * 0.9).toFixed(2)})`;
      ctx.shadowColor = "rgba(226,35,26,0.9)";
      ctx.shadowBlur = 12 * dpr;
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    raf = requestAnimationFrame(pintar);
  }

  medir();
  window.addEventListener("resize", medir, { passive: true });
  window.addEventListener("mousemove", actualizarRaton, { passive: true });

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(pintar);
  });

  raf = requestAnimationFrame(pintar);
}

/* Lanza una ráfaga de chispas ardientes en una posición (pantalla en px) */
export function crearChispas(clientX, clientY, cantidad = 12){
  if (reduce()) return;
  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  const px = clientX * dpr;
  const py = clientY * dpr;

  for (let i = 0; i < cantidad; i++){
    const angulo = Math.random() * Math.PI * 2;
    const velocidad = (Math.random() * 4.5 + 1.5) * dpr;
    const esBlanco = Math.random() < 0.25;

    chispasManuales.push({
      x: px,
      y: py,
      r: (Math.random() * 2.2 + 1.2) * dpr,
      vx: Math.cos(angulo) * velocidad,
      vy: Math.sin(angulo) * velocidad - (Math.random() * 2.5 + 1) * dpr,
      gravedad: 0.08 * dpr,
      vida: 1.0,
      decaimiento: Math.random() * 0.035 + 0.02,
      rVal: esBlanco ? 255 : 235,
      gVal: esBlanco ? 230 : Math.round(Math.random() * 80 + 40),
      bVal: esBlanco ? 180 : 30
    });
  }
}

/* ---------------- Luz del Vacío (Linterna interactiva) ---------------- */
export function luzVacio(){
  if (reduce()) return;
  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let animando = true;

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
  }, { passive: true });

  function animar(){
    if (!animando) return;
    currentX += (targetX - currentX) * 0.12;
    currentY += (targetY - currentY) * 0.12;

    document.documentElement.style.setProperty("--cursor-x", `${currentX.toFixed(1)}px`);
    document.documentElement.style.setProperty("--cursor-y", `${currentY.toFixed(1)}px`);

    requestAnimationFrame(animar);
  }
  animar();
}

/* ---------------- Tarjetas con Tilt 3D y Brillo Especular ---------------- */
export function tarjetas3D(raiz = document){
  if (reduce() || window.matchMedia("(pointer: coarse)").matches) return;

  const elementos = $$(".ficha, .panel, .mapa-visor, .pista, .aviso", raiz);

  elementos.forEach(el => {
    if (el.dataset.tiltActivado) return;
    el.dataset.tiltActivado = "true";
    el.classList.add("tilt-3d", "brillo-especular");

    let rect = null;

    const alEntrar = () => {
      rect = el.getBoundingClientRect();
    };

    const alMover = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalX = (x / rect.width - 0.5) * 2;
      const normalY = (y / rect.height - 0.5) * 2;

      const rotMax = el.classList.contains("ficha") ? 7.5 : 3.5;
      const rotY = (normalX * rotMax).toFixed(2);
      const rotX = (-normalY * rotMax).toFixed(2);

      el.style.transform = `perspective(850px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.018, 1.018, 1.018)`;
      el.style.setProperty("--sheen-x", `${x.toFixed(1)}px`);
      el.style.setProperty("--sheen-y", `${y.toFixed(1)}px`);
    };

    const alSalir = () => {
      rect = null;
      el.style.transform = "perspective(850px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
    };

    el.addEventListener("mouseenter", alEntrar, { passive: true });
    el.addEventListener("mousemove", alMover, { passive: true });
    el.addEventListener("mouseleave", alSalir, { passive: true });
  });
}

/* ---------------- Ondas de impacto y ruptura al hacer clic ---------------- */
export function ondasClic(){
  if (reduce()) return;

  document.addEventListener("click", (e) => {
    const x = e.clientX;
    const y = e.clientY;

    // Disparar chispas
    crearChispas(x, y, 10);

    // Crear onda visual de sangre / choque
    const onda = document.createElement("div");
    onda.className = "onda-impacto";
    const diametro = Math.min(140, Math.max(60, window.innerWidth * 0.08));
    onda.style.width = `${diametro}px`;
    onda.style.height = `${diametro}px`;
    onda.style.left = `${x}px`;
    onda.style.top = `${y}px`;

    document.body.appendChild(onda);
    setTimeout(() => onda.remove(), 520);
  }, { passive: true });
}

/* ---------------- Barra de progreso de lectura ---------------- */
export function progresoLectura(){
  let barra = $(".progreso");
  if (!barra){
    barra = document.createElement("div");
    barra.className = "progreso";
    document.body.appendChild(barra);
  }
  const calc = () => {
    const alto = document.documentElement.scrollHeight - window.innerHeight;
    barra.style.width = alto > 40 ? (window.scrollY / alto) * 100 + "%" : "0%";
  };
  window.addEventListener("scroll", calc, { passive: true });
  window.addEventListener("resize", calc, { passive: true });
  calc();
}

/* ---------------- Imágenes que aún no existen (reserva) ---------------- */
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

/* ---------------- Ambiente sonoro sintetizado de alta fidelidad ---------------- */
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

  // Ruido rosa filtrado (el viento abisal)
  const largo = audioCtx.sampleRate * 4;
  const buffer = audioCtx.createBuffer(1, largo, audioCtx.sampleRate);
  const datos = buffer.getChannelData(0);
  let b0 = 0, b1 = 0, b2 = 0;
  for (let i = 0; i < largo; i++){
    const blanco = Math.random() * 2 - 1;
    b0 = 0.99765 * b0 + blanco * 0.0990460;
    b1 = 0.96300 * b1 + blanco * 0.2965164;
    b2 = 0.57000 * b2 + blanco * 1.0526913;
    datos[i] = (b0 + b1 + b2 + blanco * 0.1848) * 0.14;
  }
  const ruido = audioCtx.createBufferSource();
  ruido.buffer = buffer; ruido.loop = true;
  const paso = audioCtx.createBiquadFilter();
  paso.type = "lowpass"; paso.frequency.value = 380; paso.Q.value = 0.8;
  ruido.connect(paso).connect(salida);

  // Drone grave lovecraftiano con 3 osciladores armónicos
  const drone = audioCtx.createGain(); drone.gain.value = 0.06;
  [43.6, 55.0, 82.4].forEach((f, i) => {
    const o = audioCtx.createOscillator();
    o.type = i === 2 ? "triangle" : "sine";
    o.frequency.value = f;
    const g = audioCtx.createGain(); g.gain.value = i === 2 ? 0.4 : 0.85;
    o.connect(g).connect(drone); o.start();
  });
  drone.connect(salida);

  // LFO de respiración espectral
  const lfo = audioCtx.createOscillator(); lfo.frequency.value = 0.065;
  const lfoG = audioCtx.createGain(); lfoG.gain.value = 160;
  lfo.connect(lfoG).connect(paso.frequency); lfo.start();

  ruido.start();
  salida.gain.linearRampToValueAtTime(0.55, audioCtx.currentTime + 2.5);
  nodos = { salida, ruido, lfo };
  boton.setAttribute("aria-pressed", "true");
  boton.title = "Silenciar ambiente";
}

function apagarAmbiente(boton){
  if (nodos && audioCtx){
    const t = audioCtx.currentTime;
    nodos.salida.gain.cancelScheduledValues(t);
    nodos.salida.gain.setValueAtTime(nodos.salida.gain.value, t);
    nodos.salida.gain.linearRampToValueAtTime(0, t + 0.8);
    setTimeout(() => { try{ nodos.ruido.stop(); nodos.lfo.stop(); }catch(_){} nodos = null; }, 900);
  }
  boton.setAttribute("aria-pressed", "false");
  boton.title = "Ambiente sonoro";
}

/* ---------------- Menú móvil ---------------- */
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
  window.addEventListener("hashchange", cerrar);
}

/* ---------------- Glitch aleatorio y pulso en la marca ---------------- */
export function pulsoMarca(){
  const marca = $(".marca-titulo");
  if (!marca || reduce()) return;
  setInterval(() => {
    if (Math.random() > 0.3) return;
    marca.classList.add("glitcheando");
    marca.style.textShadow = "3px 0 rgba(226,35,26,.95), -3px 0 rgba(58,208,224,.85)";
    setTimeout(() => {
      marca.style.textShadow = "";
      marca.classList.remove("glitcheando");
    }, 130);
  }, 4800);
}
