/* ============================================================
   DOOM PARADOX · WIKI — Motor de Efectos Visuales (VFX HD 3.4)
   Brasas en 4 capas con sprites pre-renderizados, viento, estelas
   y ráfagas; física de vórtice con el cursor; luz volumétrica del
   vacío; tilt 3D con reflejo; apertura del archivo; cabecera que
   se comprime al bajar; ondas de choque y sonido sintetizado.
   ============================================================ */

import { $, $$ } from "./util.js";

const reduce = () => matchMedia("(prefers-reduced-motion: reduce)").matches;

/* Perfil de calidad: misma estética, menos trabajo en teléfono/tablet
   y en máquinas justas. CSS lee html[data-calidad]. */
export function calidad(){
  if (reduce()) return "baja";
  const conexion = navigator.connection;
  if (conexion?.saveData) return "baja";
  const ram = navigator.deviceMemory || 8;
  const cores = navigator.hardwareConcurrency || 8;
  const estrecho = matchMedia("(max-width: 700px)").matches;
  const tablet = matchMedia("(max-width: 1100px)").matches;
  const tactil = matchMedia("(pointer: coarse)").matches;
  if (ram <= 2 || estrecho) return "baja";
  if (tactil || tablet || cores <= 4 || ram <= 4) return "media";
  return "alta";
}

export function aplicarCalidad(){
  const c = calidad();
  document.documentElement.dataset.calidad = c;
  return c;
}

/* ---------------- Audio FX — motor compartido (Web Audio) ----------------
   Un solo AudioContext: bus de SFX (piedra, metal, sangre) y bus de
   ambiente (viento, drones, crepitar). Los clics dejan de ser un
   beep: van en capas, con sala corta y compresor. */
let audioMotor = null;
let ultimoHover = 0;
let ultimoClick = 0;

function motorAudio(){
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return null;
  if (audioMotor){
    if (audioMotor.ctx.state === "suspended") audioMotor.ctx.resume();
    return audioMotor;
  }

  const ctx = new AC();
  const master = ctx.createGain();
  master.gain.value = 0.86;
  master.connect(ctx.destination);

  const comp = ctx.createDynamicsCompressor();
  comp.threshold.value = -16;
  comp.knee.value = 20;
  comp.ratio.value = 3.2;
  comp.attack.value = 0.003;
  comp.release.value = 0.16;
  comp.connect(master);

  const sfx = ctx.createGain();
  sfx.gain.value = 0.78;
  const delay = ctx.createDelay();
  delay.delayTime.value = 0.021;
  const fb = ctx.createGain(); fb.gain.value = 0.16;
  const wet = ctx.createGain(); wet.gain.value = 0.2;
  const lpSala = ctx.createBiquadFilter();
  lpSala.type = "lowpass"; lpSala.frequency.value = 2400;
  sfx.connect(comp);
  sfx.connect(delay);
  delay.connect(fb).connect(delay);
  delay.connect(lpSala).connect(wet).connect(comp);

  const amb = ctx.createGain();
  amb.gain.value = 0;
  amb.connect(master);

  const ruidoCorto = bufferRuido(ctx, 0.35, "blanco");
  const ruidoRosa = bufferRuido(ctx, 4, "rosa");
  const crepitar = bufferCrepitar(ctx, 2.4);

  audioMotor = { ctx, master, sfx, amb, ruidoCorto, ruidoRosa, crepitar, nodosAmb: null };
  if (ctx.state === "suspended") ctx.resume();
  return audioMotor;
}

function bufferRuido(ctx, segundos, color){
  const n = Math.floor(ctx.sampleRate * segundos);
  const buf = ctx.createBuffer(color === "rosa" ? 2 : 1, n, ctx.sampleRate);
  for (let ch = 0; ch < buf.numberOfChannels; ch++){
    const d = buf.getChannelData(ch);
    let b0 = 0, b1 = 0, b2 = 0;
    for (let i = 0; i < n; i++){
      const blanco = Math.random() * 2 - 1;
      if (color === "rosa"){
        b0 = 0.99765 * b0 + blanco * 0.0990460;
        b1 = 0.96300 * b1 + blanco * 0.2965164;
        b2 = 0.57000 * b2 + blanco * 1.0526913;
        d[i] = (b0 + b1 + b2 + blanco * 0.1848) * 0.13;
      } else {
        d[i] = blanco * Math.exp(-i / (ctx.sampleRate * 0.09));
      }
    }
  }
  return buf;
}

function bufferCrepitar(ctx, segundos){
  const n = Math.floor(ctx.sampleRate * segundos);
  const buf = ctx.createBuffer(1, n, ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < n; i++) d[i] = 0;
  let i = 0;
  while (i < n){
    const hueco = Math.floor((0.04 + Math.random() * 0.22) * ctx.sampleRate);
    const largo = Math.floor((0.004 + Math.random() * 0.012) * ctx.sampleRate);
    const amp = 0.35 + Math.random() * 0.65;
    for (let k = 0; k < largo && i + k < n; k++){
      d[i + k] += (Math.random() * 2 - 1) * amp * Math.exp(-k / (largo * 0.28));
    }
    i += hueco;
  }
  return buf;
}

function tono(ctx, dest, t, { tipo = "sine", f0, f1, dur, vol, attack = 0.006, filtro }){
  const osc = ctx.createOscillator();
  const g = ctx.createGain();
  osc.type = tipo;
  osc.frequency.setValueAtTime(Math.max(1, f0), t);
  if (f1 != null) osc.frequency.exponentialRampToValueAtTime(Math.max(1, f1), t + dur);
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let nodo = osc;
  if (filtro){
    const f = ctx.createBiquadFilter();
    f.type = filtro.type;
    f.Q.value = filtro.q || 1;
    f.frequency.setValueAtTime(filtro.f0, t);
    if (filtro.f1) f.frequency.exponentialRampToValueAtTime(Math.max(20, filtro.f1), t + dur);
    osc.connect(f);
    nodo = f;
  }
  nodo.connect(g).connect(dest);
  osc.start(t);
  osc.stop(t + dur + 0.03);
}

function soplo(ctx, dest, t, buf, { dur, vol, attack = 0.004, filtro, playback = 1 }){
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.loop = buf.duration > dur;
  src.playbackRate.value = playback;
  const g = ctx.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0002, vol), t + attack);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  let nodo = src;
  if (filtro){
    const f = ctx.createBiquadFilter();
    f.type = filtro.type;
    f.Q.value = filtro.q || 0.85;
    f.frequency.setValueAtTime(filtro.f0, t);
    if (filtro.f1) f.frequency.exponentialRampToValueAtTime(Math.max(40, filtro.f1), t + dur);
    src.connect(f);
    nodo = f;
  }
  nodo.connect(g).connect(dest);
  src.start(t);
  src.stop(t + dur + 0.03);
}

export function sonidoUI(tipo = "click"){
  if (reduce()) return;
  try{
    const m = motorAudio();
    if (!m) return;
    const { ctx, sfx, ruidoCorto } = m;
    const t = ctx.currentTime;
    const tactil = matchMedia("(pointer: coarse)").matches;
    const perfil = document.documentElement.dataset.calidad || "alta";

    if (tipo === "hover"){
      if (tactil || perfil === "baja") return;
      if (t * 1000 - ultimoHover < 90) return;
      ultimoHover = t * 1000;
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.055, vol: 0.02, attack: 0.004,
        filtro: { type: "highpass", f0: 2800, f1: 4200, q: 0.7 }
      });
      tono(ctx, sfx, t, {
        tipo: "sine", f0: 268, f1: 176, dur: 0.09, vol: 0.014, attack: 0.01,
        filtro: { type: "lowpass", f0: 900, f1: 420, q: 0.8 }
      });
      return;
    }

    if (tipo === "click"){
      if (performance.now() - ultimoClick < 42) return;
      ultimoClick = performance.now();
      tono(ctx, sfx, t, { tipo: "sine", f0: 68, f1: 26, dur: 0.15, vol: 0.26, attack: 0.004 });
      tono(ctx, sfx, t, {
        tipo: "triangle", f0: 196, f1: 52, dur: 0.12, vol: 0.15, attack: 0.005,
        filtro: { type: "lowpass", f0: 980, f1: 220, q: 0.9 }
      });
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.038, vol: 0.1, attack: 0.001,
        filtro: { type: "highpass", f0: 2200, f1: 3600, q: 0.8 }
      });
      tono(ctx, sfx, t + 0.006, {
        tipo: "sine", f0: 1760, f1: 820, dur: 0.14, vol: 0.038, attack: 0.002,
        filtro: { type: "bandpass", f0: 1700, f1: 900, q: 7 }
      });
      return;
    }

    if (tipo === "fuego"){
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.36, vol: 0.2, attack: 0.02,
        filtro: { type: "bandpass", f0: 520, f1: 110, q: 1.1 }, playback: 0.85
      });
      tono(ctx, sfx, t, {
        tipo: "sawtooth", f0: 74, f1: 22, dur: 0.3, vol: 0.11, attack: 0.02,
        filtro: { type: "lowpass", f0: 340, f1: 90, q: 0.7 }
      });
      [0.05, 0.11, 0.18].forEach((dt, i) => {
        soplo(ctx, sfx, t + dt, ruidoCorto, {
          dur: 0.028 + i * 0.006, vol: 0.07 - i * 0.012, attack: 0.001,
          filtro: { type: "highpass", f0: 1400, f1: 2600, q: 0.9 },
          playback: 1.1 + i * 0.15
        });
      });
      return;
    }

    if (tipo === "tinta"){
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.4, vol: 0.15, attack: 0.03,
        filtro: { type: "lowpass", f0: 220, f1: 55, q: 0.7 }, playback: 0.7
      });
      tono(ctx, sfx, t, { tipo: "sine", f0: 44, f1: 17, dur: 0.44, vol: 0.2, attack: 0.03 });
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.12, vol: 0.05, attack: 0.008,
        filtro: { type: "highpass", f0: 700, f1: 1800, q: 0.8 }
      });
      return;
    }

    if (tipo === "abrir"){
      tono(ctx, sfx, t, { tipo: "sine", f0: 52, f1: 88, dur: 0.16, vol: 0.12, attack: 0.01 });
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.14, vol: 0.07, attack: 0.012,
        filtro: { type: "bandpass", f0: 280, f1: 640, q: 1 }
      });
      tono(ctx, sfx, t + 0.02, { tipo: "triangle", f0: 240, f1: 140, dur: 0.1, vol: 0.06, attack: 0.008 });
      return;
    }

    if (tipo === "cerrar"){
      tono(ctx, sfx, t, { tipo: "sine", f0: 90, f1: 36, dur: 0.13, vol: 0.12, attack: 0.008 });
      soplo(ctx, sfx, t, ruidoCorto, {
        dur: 0.08, vol: 0.05, attack: 0.006,
        filtro: { type: "lowpass", f0: 500, f1: 160, q: 0.8 }
      });
    }
  }catch(_){}
}

/* ---------------- Sistema de Cenizas, Brasas y Fuego HD ----------------
   Cada partícula se pinta con un sprite (degradado radial ya
   rasterizado) en vez de shadowBlur: mismo bloom, una fracción
   del coste. Las brasas se suman en modo "lighter" para que
   brillen de verdad al cruzarse. */
let chispasManuales = [];
let dprGlobal = 1;

const sprites = {};
function sprite(nombre, nucleo, medio, borde){
  const c = document.createElement("canvas");
  const s = 64; c.width = c.height = s;
  const g = c.getContext("2d");
  const grad = g.createRadialGradient(s / 2, s / 2, 0, s / 2, s / 2, s / 2);
  grad.addColorStop(0, nucleo);
  grad.addColorStop(0.16, medio);
  grad.addColorStop(0.42, borde);
  grad.addColorStop(1, "rgba(0,0,0,0)");
  g.fillStyle = grad; g.fillRect(0, 0, s, s);
  sprites[nombre] = c;
}

export function cenizas(){
  const lienzo = $("#cenizas");
  if (!lienzo || reduce()) return;
  const ctx = lienzo.getContext("2d");
  let an = 0, al = 0, particulas = [], raf = 0, visible = true;
  let ratonX = -9999, ratonY = -9999, ratonVx = 0, ratonVy = 0, prevRatonX = 0, prevRatonY = 0;
  let ultimoMovimiento = 0, ultimaRafaga = 0, tiempo = 0;

  sprite("chispa", "rgba(255,248,225,1)", "rgba(255,170,90,.95)", "rgba(255,70,35,.45)");
  sprite("brasa",  "rgba(255,205,150,1)", "rgba(250,90,45,.9)",   "rgba(200,30,25,.35)");
  sprite("ceniza", "rgba(215,208,205,1)", "rgba(180,172,170,.55)", "rgba(150,142,142,.12)");
  sprite("polvo",  "rgba(160,150,160,.9)", "rgba(120,110,120,.4)", "rgba(90,82,92,.08)");

  function medir(){
    const perfil = aplicarCalidad();
    const topeDpr = perfil === "baja" ? 1 : perfil === "media" ? 1.25 : 1.5;
    dprGlobal = Math.min(window.devicePixelRatio || 1, topeDpr);
    an = lienzo.width  = Math.floor(window.innerWidth  * dprGlobal);
    al = lienzo.height = Math.floor(window.innerHeight * dprGlobal);
    lienzo.style.width  = window.innerWidth + "px";
    lienzo.style.height = window.innerHeight + "px";

    const cupo = perfil === "baja"
      ? Math.round(Math.min(52, Math.max(28, window.innerWidth / 16)))
      : perfil === "media"
        ? Math.round(Math.min(110, Math.max(52, window.innerWidth / 11)))
        : Math.round(Math.min(170, Math.max(70, window.innerWidth / 9)));
    particulas = Array.from({ length: cupo }, (_, i) => nueva(i < cupo * 0.38, true));
  }

  function nueva(esBrasa = false, inicio = false){
    const dpr = dprGlobal;
    // Capas: 0=polvo abisal de fondo, 1=ceniza intermedia, 2=brasa incandescente, 3=chispa de fuego viva
    const capa = esBrasa ? (Math.random() < 0.32 ? 3 : 2) : (Math.random() < 0.45 ? 0 : 1);
    const radio = capa === 3 ? Math.random() * 1.7 + 1.0
                : capa === 2 ? Math.random() * 1.6 + 0.7
                : capa === 1 ? Math.random() * 1.3 + 0.4
                :              Math.random() * 0.9 + 0.25;
    return {
      capa,
      x: Math.random() * an,
      y: inicio ? Math.random() * al : al + (10 + Math.random() * 40) * dpr,
      r: radio * dpr,
      vy: -(Math.random() * (capa === 3 ? 0.9 : capa === 2 ? 0.6 : capa === 1 ? 0.32 : 0.16) + 0.1) * dpr,
      vx: (Math.random() - 0.5) * (capa >= 2 ? 0.5 : 0.25) * dpr,
      a: Math.random() * 0.6 + (capa >= 2 ? 0.4 : 0.14),
      fase: Math.random() * Math.PI * 2,
      faseVel: Math.random() * 0.025 + 0.008,
      brasa: capa >= 2,
      chispaFuego: capa === 3,
      vidaMax: Math.random() * 500 + 260,
      edad: inicio ? Math.random() * 350 : 0,
      temperatura: Math.random() * 0.6 + 0.4,
      osc: 0
    };
  }

  function actualizarRaton(e){
    const dpr = dprGlobal;
    const mx = e.clientX * dpr;
    const my = e.clientY * dpr;
    ratonVx = (mx - prevRatonX) * 0.35;
    ratonVy = (my - prevRatonY) * 0.35;
    prevRatonX = ratonX = mx;
    prevRatonY = ratonY = my;
    ultimoMovimiento = Date.now();

    // Estela de microchispas al mover el ratón rápidamente
    const velocidadCursor = Math.hypot(ratonVx, ratonVy);
    if (document.documentElement.dataset.calidad !== "baja" && velocidadCursor > 12 * dpr && Math.random() < 0.45){
      chispasManuales.push({
        x: mx + (Math.random() - 0.5) * 16 * dpr,
        y: my + (Math.random() - 0.5) * 16 * dpr,
        r: (Math.random() * 2 + 1) * dpr,
        vx: -ratonVx * 0.15 + (Math.random() - 0.5) * 2 * dpr,
        vy: -ratonVy * 0.15 + (Math.random() - 0.5) * 2 * dpr,
        gravedad: 0.04 * dpr,
        vida: 0.8,
        decaimiento: 0.045,
        blanca: Math.random() < 0.3
      });
    }
  }

  /* Ráfaga: un puñado de chispas blancas que saltan desde abajo,
     como un tronco que cruje en la hoguera. */
  function rafaga(){
    const dpr = dprGlobal;
    const x = an * (0.1 + Math.random() * 0.8);
    const n = 3 + Math.floor(Math.random() * 4);
    for (let i = 0; i < n; i++){
      chispasManuales.push({
        x: x + (Math.random() - 0.5) * 30 * dpr,
        y: al + 4 * dpr,
        r: (Math.random() * 1.6 + 1.2) * dpr,
        vx: (Math.random() - 0.5) * 2.2 * dpr,
        vy: -(Math.random() * 3.2 + 2.6) * dpr,
        gravedad: 0.022 * dpr,
        vida: 1,
        decaimiento: Math.random() * 0.006 + 0.006,
        blanca: Math.random() < 0.55
      });
    }
  }

  function paso(p, viento, hayCursor, radioInteraccion, radioSq){
    const dpr = dprGlobal;
    p.edad++;
    p.fase += p.faseVel;

    // Movimiento sinusoidal natural + viento lento que cambia de dirección
    p.osc = Math.sin(p.fase) * (p.capa >= 2 ? 0.75 : 0.4) * dpr;
    const arrastre = p.capa === 0 ? 0.35 : p.capa === 1 ? 0.6 : 1;
    p.x += p.vx + p.osc + viento * arrastre;
    p.y += p.vy;

    // Vórtice y repulsión física con el ratón (solo en calidad alta)
    if (hayCursor) {
      const dx = p.x - ratonX;
      const dy = p.y - ratonY;
      const distSq = dx * dx + dy * dy;
      if (distSq < radioSq && distSq > 9) {
        const dist = Math.sqrt(distSq);
        const fuerza = (1 - dist / radioInteraccion) * 2.8;
        const ang = Math.atan2(dy, dx);
        p.x += Math.cos(ang) * fuerza * dpr + (-Math.sin(ang)) * fuerza * 1.2 * dpr + ratonVx * 0.18;
        p.y += Math.sin(ang) * fuerza * dpr + (Math.cos(ang)) * fuerza * 1.2 * dpr + ratonVy * 0.18;
        if (p.brasa) p.temperatura = Math.min(1, p.temperatura + 0.12);
      }
    }
    if (p.brasa && p.temperatura > 0.4) p.temperatura -= 0.002;

    // Reaparición si sale de los límites o se apaga
    if (p.y < -20 * dpr || p.edad > p.vidaMax){
      Object.assign(p, nueva(p.brasa, false));
    }
    if (p.x < -30 * dpr) p.x = an + 25 * dpr;
    else if (p.x > an + 30 * dpr) p.x = -25 * dpr;
  }

  function alfaDe(p){
    // Las brasas parpadean; todo se enciende al nacer y se apaga al morir
    const parpadeo = 0.72 + Math.sin(p.fase * 3.2) * 0.28;
    const vida = Math.min(1, p.edad / 40, (p.vidaMax - p.edad) / 90);
    return Math.min(1, Math.max(0, p.a * parpadeo * vida));
  }

  let saltar = false;
  function pintar(ahora){
    tiempo = ahora || performance.now();
    const perfil = document.documentElement.dataset.calidad || "alta";
    if (perfil === "baja"){
      saltar = !saltar;
      if (saltar){ raf = requestAnimationFrame(pintar); return; }
    }
    ctx.clearRect(0, 0, an, al);
    const dpr = dprGlobal;
    const radioInteraccion = 140 * dpr;
    const radioSq = radioInteraccion * radioInteraccion;
    const hayCursor = perfil === "alta" && (Date.now() - ultimoMovimiento) < 2000 && ratonX > 0;
    const viento = (Math.sin(tiempo * 0.00035) * 0.22 + Math.sin(tiempo * 0.0011 + 1.7) * 0.08) * dpr;

    const esperaRafaga = perfil === "baja" ? 5200 : perfil === "media" ? 3200 : 1800;
    if (tiempo - ultimaRafaga > esperaRafaga + Math.random() * 2400){
      ultimaRafaga = tiempo;
      rafaga();
    }

    // 1. Polvo y ceniza (mezcla normal)
    ctx.globalCompositeOperation = "source-over";
    for (let i = 0; i < particulas.length; i++){
      const p = particulas[i];
      if (p.brasa) continue;
      paso(p, viento, hayCursor, radioInteraccion, radioSq);
      const alfa = alfaDe(p) * (p.capa === 1 ? 0.55 : 0.3);
      if (alfa <= 0.01) continue;
      const s = p.r * 3.2;
      ctx.globalAlpha = alfa;
      ctx.drawImage(sprites[p.capa === 1 ? "ceniza" : "polvo"], p.x - s / 2, p.y - s / 2, s, s);
    }

    // 2. Brasas y chispas de fuego (mezcla aditiva: brillan al cruzarse)
    ctx.globalCompositeOperation = "lighter";
    ctx.lineCap = "round";
    for (let i = 0; i < particulas.length; i++){
      const p = particulas[i];
      if (!p.brasa) continue;
      paso(p, viento, hayCursor, radioInteraccion, radioSq);
      const alfa = alfaDe(p);
      if (alfa <= 0.01) continue;
      ctx.globalAlpha = alfa;

      if (p.chispaFuego && perfil !== "baja"){
        // Estela corta detrás de la chispa: cuanto más caliente, más larga
        const largo = 4 + p.temperatura * 4;
        ctx.strokeStyle = `rgb(255,${Math.round(150 + p.temperatura * 90)},70)`;
        ctx.lineWidth = Math.max(1, p.r * 0.8);
        ctx.beginPath();
        ctx.moveTo(p.x - (p.vx + p.osc) * largo, p.y - p.vy * largo);
        ctx.lineTo(p.x, p.y);
        ctx.stroke();
      }

      const s = p.r * (p.chispaFuego ? 9 + p.temperatura * 3 : 7);
      ctx.drawImage(sprites[p.chispaFuego ? "chispa" : "brasa"], p.x - s / 2, p.y - s / 2, s, s);
    }

    // 3. Chispas generadas por interacciones, clics y ráfagas
    for (let i = chispasManuales.length - 1; i >= 0; i--){
      const c = chispasManuales[i];
      c.x += c.vx + viento * 0.6;
      c.y += c.vy;
      c.vy += c.gravedad;
      c.vx *= 0.97;
      c.vy *= 0.985;
      c.vida -= c.decaimiento;

      if (c.vida <= 0 || c.y < -20 * dpr){
        chispasManuales.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, c.vida * 1.1);
      const s = Math.max(2, c.r * c.vida * 9);
      ctx.drawImage(sprites[c.blanca ? "chispa" : "brasa"], c.x - s / 2, c.y - s / 2, s, s);
    }

    ctx.globalAlpha = 1;
    ctx.globalCompositeOperation = "source-over";
    raf = requestAnimationFrame(pintar);
  }

  medir();
  let resizeT = 0;
  window.addEventListener("resize", () => {
    clearTimeout(resizeT);
    resizeT = setTimeout(medir, 140);
  }, { passive: true });
  if ((document.documentElement.dataset.calidad || "alta") !== "baja"){
    window.addEventListener("mousemove", actualizarRaton, { passive: true });
  }

  document.addEventListener("visibilitychange", () => {
    visible = !document.hidden;
    cancelAnimationFrame(raf);
    if (visible) raf = requestAnimationFrame(pintar);
  });

  raf = requestAnimationFrame(pintar);
}

/* Lanza una ráfaga de chispas ardientes en una posición (pantalla en px) */
export function crearChispas(clientX, clientY, cantidad = 16){
  if (reduce()) return;
  const perfil = document.documentElement.dataset.calidad || calidad();
  if (perfil === "baja") cantidad = Math.min(cantidad, 5);
  else if (perfil === "media") cantidad = Math.min(cantidad, 9);
  const dpr = dprGlobal;
  const px = clientX * dpr;
  const py = clientY * dpr;

  for (let i = 0; i < cantidad; i++){
    const angulo = Math.random() * Math.PI * 2;
    const velocidad = (Math.random() * 5.5 + 2.0) * dpr;

    chispasManuales.push({
      x: px,
      y: py,
      r: (Math.random() * 2.8 + 1.2) * dpr,
      vx: Math.cos(angulo) * velocidad,
      vy: Math.sin(angulo) * velocidad - (Math.random() * 3 + 1.5) * dpr,
      gravedad: 0.1 * dpr,
      vida: 1.0,
      decaimiento: Math.random() * 0.035 + 0.018,
      blanca: Math.random() < 0.3
    });
  }
}

/* ---------------- Luz del Vacío (Linterna interactiva HD) ----------------
   Publica --cursor-x / --cursor-y en :root con un retardo suave: de ahí
   beben la linterna, la brasa del cursor y el paralaje de la portada. */
export function luzVacio(){
  if (reduce()) return;
  const perfil = document.documentElement.dataset.calidad || aplicarCalidad();
  if (perfil === "baja" || matchMedia("(pointer: coarse)").matches) return;

  let targetX = window.innerWidth / 2;
  let targetY = window.innerHeight / 2;
  let currentX = targetX;
  let currentY = targetY;
  let raf = 0;
  let ultimoMovimiento = 0;

  const seguir = () => {
    currentX += (targetX - currentX) * 0.14;
    currentY += (targetY - currentY) * 0.14;
    document.documentElement.style.setProperty("--cursor-x", `${currentX.toFixed(1)}px`);
    document.documentElement.style.setProperty("--cursor-y", `${currentY.toFixed(1)}px`);
    const cerca = Math.abs(targetX - currentX) < 0.4 && Math.abs(targetY - currentY) < 0.4;
    if (cerca && Date.now() - ultimoMovimiento > 180){
      raf = 0;
      return;
    }
    raf = requestAnimationFrame(seguir);
  };

  window.addEventListener("mousemove", (e) => {
    targetX = e.clientX;
    targetY = e.clientY;
    ultimoMovimiento = Date.now();
    if (!document.body.dataset.cursor) document.body.dataset.cursor = "1";
    if (!raf) raf = requestAnimationFrame(seguir);
  }, { passive: true });
  document.documentElement.addEventListener("mouseleave", () => { delete document.body.dataset.cursor; });
  document.documentElement.addEventListener("mouseenter", () => { document.body.dataset.cursor = "1"; });
}

/* ---------------- Tarjetas con Tilt 3D y Brillo Especular HD ---------------- */
export function tarjetas3D(raiz = document){
  if (reduce() || window.matchMedia("(pointer: coarse)").matches) return;

  const elementos = $$(".ficha, .panel, .mapa-visor, .pista, .aviso, .pod-stat, .altar-lore", raiz);

  elementos.forEach(el => {
    if (el.dataset.tiltActivado) return;
    el.dataset.tiltActivado = "true";
    el.classList.add("tilt-3d", "brillo-especular");

    let rect = null;

    const alEntrar = () => {
      rect = el.getBoundingClientRect();
      sonidoUI("hover");
    };

    const alMover = (e) => {
      if (!rect) rect = el.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      const normalX = (x / rect.width - 0.5) * 2;
      const normalY = (y / rect.height - 0.5) * 2;

      const rotMax = el.classList.contains("ficha") ? 8.5 : 4.0;
      const rotY = (normalX * rotMax).toFixed(2);
      const rotX = (-normalY * rotMax).toFixed(2);

      el.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) scale3d(1.022, 1.022, 1.022)`;
      el.style.setProperty("--sheen-x", `${x.toFixed(1)}px`);
      el.style.setProperty("--sheen-y", `${y.toFixed(1)}px`);
    };

    const alSalir = () => {
      rect = null;
      el.style.transform = "perspective(900px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)";
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

    const propio = e.target.closest("#abrir-buscador, #abrir-menu, .btn-esc, [data-cerrar]");
    if (!propio) sonidoUI("click");
    const perfil = document.documentElement.dataset.calidad || calidad();
    if (perfil !== "baja") crearChispas(x, y, perfil === "media" ? 7 : 14);

    // Crear onda visual de sangre / choque
    const onda = document.createElement("div");
    onda.className = "onda-impacto";
    const diametro = Math.min(160, Math.max(70, window.innerWidth * 0.09));
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

/* ---------------- Cabecera que se comprime al bajar ----------------
   body[data-compacta] rebaja --cabecera-alto; con histéresis para
   que no titile cerca del umbral. */
export function cabeceraCompacta(){
  let compacta = false, pendiente = false;
  const evaluar = () => {
    pendiente = false;
    const y = window.scrollY;
    const debe = compacta ? y > 24 : y > 88;
    if (debe !== compacta){
      compacta = debe;
      document.body.toggleAttribute("data-compacta", compacta);
    }
  };
  window.addEventListener("scroll", () => {
    if (pendiente) return;
    pendiente = true;
    requestAnimationFrame(evaluar);
  }, { passive: true });
  evaluar();
}

/* ---------------- Apertura del archivo ----------------
   Se muestra una vez por sesión (sessionStorage "dp-intro"; el inline
   de index.html la oculta antes de pintar si ya se vio). Dura ~1.2s
   y se salta con clic o tecla. Mientras está en pantalla, html lleva
   data-intro-activa y la portada retrasa la caída de sus letras. */
export function introArchivo(){
  const capa = $("#intro-archivo");
  if (!capa) return;
  const html = document.documentElement;
  if (html.hasAttribute("data-intro-vista") || reduce()){
    capa.remove();
    html.setAttribute("data-intro-vista", "");
    return;
  }
  try{ sessionStorage.setItem("dp-intro", "1"); }catch(_){}
  html.setAttribute("data-intro-activa", "");

  let cerrada = false;
  const cerrar = () => {
    if (cerrada) return;
    cerrada = true;
    capa.dataset.saliendo = "1";
    removeEventListener("keydown", cerrar);
    setTimeout(() => capa.remove(), 650);
    // La portada sigue su coreografía; cuando termina, dejamos de retrasarla.
    setTimeout(() => {
      html.removeAttribute("data-intro-activa");
      html.setAttribute("data-intro-vista", "");
    }, 4500);
  };
  capa.addEventListener("click", cerrar, { once: true });
  addEventListener("keydown", cerrar);
  setTimeout(cerrar, 1250);
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

/* ---------------- Ambiente sonoro: viento, drones y brasas ---------------- */
export function ambiente(){
  const boton = $("#alternar-audio");
  if (!boton) return;
  boton.addEventListener("click", () => {
    const encendido = boton.getAttribute("aria-pressed") === "true";
    encendido ? apagarAmbiente(boton) : encenderAmbiente(boton);
  });
}

function encenderAmbiente(boton){
  const m = motorAudio();
  if (!m) return;
  apagarNodosAmb(true);

  const { ctx, amb, ruidoRosa, crepitar } = m;
  const t0 = ctx.currentTime;

  const viento = ctx.createBufferSource();
  viento.buffer = ruidoRosa; viento.loop = true;
  const paso = ctx.createBiquadFilter();
  paso.type = "lowpass"; paso.frequency.value = 340; paso.Q.value = 0.75;
  const gViento = ctx.createGain(); gViento.gain.value = 0.55;
  viento.connect(paso).connect(gViento).connect(amb);

  const aire = ctx.createBufferSource();
  aire.buffer = ruidoRosa; aire.loop = true;
  const hpAire = ctx.createBiquadFilter();
  hpAire.type = "highpass"; hpAire.frequency.value = 2100; hpAire.Q.value = 0.6;
  const gAire = ctx.createGain(); gAire.gain.value = 0.07;
  aire.connect(hpAire).connect(gAire).connect(amb);

  const drone = ctx.createGain(); drone.gain.value = 0.09;
  const osciladores = [];
  [[36.7, "sine", 0.9], [55.0, "sine", 0.75], [55.35, "sine", 0.28], [82.4, "triangle", 0.38], [110.0, "sine", 0.16]].forEach(([f, tipo, vol]) => {
    const o = ctx.createOscillator();
    o.type = tipo; o.frequency.value = f;
    const g = ctx.createGain(); g.gain.value = vol;
    o.connect(g).connect(drone);
    o.start();
    osciladores.push(o);
  });
  drone.connect(amb);

  const lfo = ctx.createOscillator(); lfo.frequency.value = 0.055;
  const lfoG = ctx.createGain(); lfoG.gain.value = 140;
  lfo.connect(lfoG).connect(paso.frequency);
  lfo.start();

  const chispas = ctx.createBufferSource();
  chispas.buffer = crepitar; chispas.loop = true;
  const bpChispa = ctx.createBiquadFilter();
  bpChispa.type = "bandpass"; bpChispa.frequency.value = 1600; bpChispa.Q.value = 1.6;
  const gChispa = ctx.createGain(); gChispa.gain.value = 0.045;
  chispas.connect(bpChispa).connect(gChispa).connect(amb);

  const lfoChispa = ctx.createOscillator(); lfoChispa.frequency.value = 0.18;
  const lfoChispaG = ctx.createGain(); lfoChispaG.gain.value = 0.028;
  lfoChispa.connect(lfoChispaG).connect(gChispa.gain);
  lfoChispa.start();

  viento.start();
  aire.start();
  chispas.start();

  amb.gain.cancelScheduledValues(t0);
  amb.gain.setValueAtTime(amb.gain.value, t0);
  amb.gain.linearRampToValueAtTime(0.42, t0 + 2.8);

  const gemido = setInterval(() => {
    if (!audioMotor?.nodosAmb) return;
    const t = ctx.currentTime;
    tono(ctx, amb, t, {
      tipo: "sawtooth", f0: 48 + Math.random() * 18, f1: 22, dur: 1.6, vol: 0.035, attack: 0.2,
      filtro: { type: "lowpass", f0: 180, f1: 70, q: 0.8 }
    });
  }, 14000 + Math.random() * 8000);

  m.nodosAmb = { viento, aire, chispas, lfo, lfoChispa, osciladores, gemido };
  boton.setAttribute("aria-pressed", "true");
  boton.title = "Silenciar ambiente";
  sonidoUI("fuego");
}

function apagarNodosAmb(inmediato = false){
  const m = audioMotor;
  if (!m?.nodosAmb) return;
  const { ctx, amb } = m;
  const t = ctx.currentTime;
  amb.gain.cancelScheduledValues(t);
  amb.gain.setValueAtTime(amb.gain.value, t);
  amb.gain.linearRampToValueAtTime(0, t + (inmediato ? 0.05 : 0.85));
  const nodos = m.nodosAmb;
  m.nodosAmb = null;
  clearInterval(nodos.gemido);
  const cortar = () => {
    try{ nodos.viento.stop(); nodos.aire.stop(); nodos.chispas.stop(); }catch(_){}
    try{ nodos.lfo.stop(); nodos.lfoChispa.stop(); }catch(_){}
    (nodos.osciladores || []).forEach(o => { try{ o.stop(); }catch(_){} });
  };
  if (inmediato) cortar();
  else setTimeout(cortar, 900);
}

function apagarAmbiente(boton){
  apagarNodosAmb(false);
  boton.setAttribute("aria-pressed", "false");
  boton.title = "Ambiente sonoro";
}

/* ---------------- Menú móvil ---------------- */
export function menuMovil(){
  const boton = $("#abrir-menu"), nav = $("#nav");
  if (!boton || !nav) return;
  const cerrar = () => {
    nav.dataset.abierto = "false";
    boton.setAttribute("aria-expanded", "false");
    document.body.style.overflow = "";
  };
  boton.addEventListener("click", () => {
    const abierto = nav.dataset.abierto === "true";
    nav.dataset.abierto = String(!abierto);
    boton.setAttribute("aria-expanded", String(!abierto));
    document.body.style.overflow = abierto ? "" : "hidden";
    sonidoUI(abierto ? "cerrar" : "abrir");
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
