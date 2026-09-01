/* ============================================================
   Paginas fijas: guia de contribucion, creditos y 404
   ============================================================ */

import { SITIO, urlIssue, urlEditar } from "../config.js";
import { esc, revelar } from "../util.js";
import { comentarios, montarComentarios } from "../comentarios.js";

export async function vistaGuia(raiz){
  document.title = `Contribuir · ${SITIO.titulo} WIKI`;
  raiz.innerHTML = `
    <section class="banda" data-tono="ceniza">
      <h2 class="banda-titulo">Contribuir</h2>
      <p class="banda-bajada">Esta wiki es un archivo abierto: se edita con texto, no con codigo.</p>
    </section>

    <section class="seccion"><div class="contenedor cuerpo-entrada">
      <div class="prosa">
        <h3>La idea</h3>
        <p>Cada seccion de la wiki es un archivo de texto dentro de la carpeta <code>datos/</code>.
        Anadir un verdugo es anadir un bloque a <code>datos/verdugos.json</code>. La pagina se genera sola.</p>

        <h3>Sin saber de GitHub</h3>
        <ul>
          <li>Abre una <a href="${esc(urlIssue("nueva-entrada.yml"))}" target="_blank" rel="noopener">propuesta de ficha</a> y rellena el formulario.</li>
          <li>Si viste un error, usa el <a href="${esc(urlIssue("correccion.yml"))}" target="_blank" rel="noopener">reporte de correccion</a>.</li>
          <li>Para dibujos, el <a href="${esc(urlIssue("fan-art.yml"))}" target="_blank" rel="noopener">formulario de fan art</a>.</li>
        </ul>

        <h3>Con GitHub</h3>
        <ul>
          <li>Haz un fork del repositorio.</li>
          <li>Edita el JSON de la seccion (por ejemplo <a href="${esc(urlEditar("verdugos"))}" target="_blank" rel="noopener">datos/verdugos.json</a>).</li>
          <li>Sube la imagen a <code>assets/img/&lt;seccion&gt;/</code> con el mismo <code>id</code> de la ficha.</li>
          <li>Abre un pull request. Un validador automatico revisa que el JSON no este roto.</li>
        </ul>

        <h3>Como es una ficha de verdugo</h3>
        <pre style="overflow:auto;border:1px solid var(--linea);background:var(--carbon);padding:1rem;font-size:.82rem"><code>{
  "id": "nombre-en-minusculas",
  "nombre": "Nombre visible",
  "alias": "El que apaga las velas",
  "pecado": "Ira",
  "peligro": 4,
  "estado": "canon",
  "imagen": "assets/img/verdugos/nombre-en-minusculas.png",
  "resumen": "Una frase que se lee en la tarjeta.",
  "descripcion": "Texto largo. Admite **negrita**, *cursiva*, listas con - y citas con &gt;.",
  "stats": { "Velocidad": 4, "Sigilo": 2, "Dano": 5, "Cordura": 1 },
  "habilidades": [
    { "nombre": "Aullido", "tipo": "activa", "enfriamiento": "45 s", "texto": "Que hace." }
  ],
  "consejos": ["Que hacer para sobrevivir."],
  "mapas": ["capilla"],
  "ost": ["tema-del-verdugo"],
  "etiquetas": ["jefe", "melee"],
  "actualizado": "2026-08-31"
}</code></pre>

        <h3>Reglas de la casa</h3>
        <ul>
          <li>Marca como <code>"estado": "borrador"</code> lo que sea teoria o no este confirmado.</li>
          <li>El fan art se publica siempre con credito y enlace al autor; se retira si el autor lo pide.</li>
          <li>Nada de spoilers sin avisar en la primera linea del resumen.</li>
          <li>Imagenes ligeras: menos de 500 kB por archivo, formato webp o png.</li>
        </ul>
      </div>

      <aside>
        <div class="panel"><h4>Atajos</h4>
          <div class="chips">
            <span class="chip">Ctrl K · buscar</span>
            <span class="chip">/ · buscar</span>
            <span class="chip">Esc · cerrar</span>
          </div>
        </div>
        <div class="panel"><h4>Estructura</h4>
          <p style="font-size:.86rem;color:var(--ceniza)">
            <code>datos/</code> el contenido<br>
            <code>assets/img/</code> imagenes<br>
            <code>assets/audio/</code> musica<br>
            <code>assets/js/config.js</code> ajustes del sitio
          </p>
        </div>
        <div class="panel"><h4>Repositorio</h4>
          <a class="boton" style="width:100%;justify-content:center" href="https://github.com/${esc(SITIO.repo)}" target="_blank" rel="noopener">Abrir en GitHub</a>
        </div>
      </aside>
    </div></section>`;
  revelar(raiz);
}

export async function vistaCreditos(raiz){
  document.title = `Creditos · ${SITIO.titulo} WIKI`;
  raiz.innerHTML = `
    <section class="banda" data-tono="sangre">
      <h2 class="banda-titulo">Creditos</h2>
      <p class="banda-bajada">Quien hace el juego y quien sostiene este archivo.</p>
    </section>
    <section class="seccion"><div class="contenedor">
      <div class="prosa">
        <h3>Equipo de Doom Paradox</h3>
        <p>Doom Paradox lo dirige <strong>S.U.A</strong> y lo saca adelante el equipo del servidor de
        desarrollo: arte, modelado, programacion, musica, doblaje y pruebas.</p>
        <p>Nombres tal y como aparecen en el servidor. Si alguien quiere figurar de otra forma, o no
        figurar, se cambia en cuanto lo pida.</p>

        <h3>Wiki</h3>
        <p>Archivo abierto: lo que leas aqui sale del desarrollo del juego y de las propuestas de la
        comunidad. Cada ficha indica de que canal y de que fecha viene su informacion.</p>

        <h3>Aviso</h3>
        <p>Wiki mantenida por la comunidad. El arte pertenece a sus autores y se retira a peticion.
        Roblox es marca de Roblox Corporation, sin relacion con este proyecto. Los personajes invitados
        y de creepypasta pertenecen a sus respectivos creadores.</p>
      </div>
      ${comentarios("creditos", "los creditos")}
    </div></section>`;
  revelar(raiz);
  montarComentarios(raiz);
}

export async function vista404(raiz){
  raiz.innerHTML = `
    <section class="seccion" style="min-height:60vh;display:grid;place-items:center;text-align:center">
      <div class="contenedor">
        <p class="etiqueta">Error 404</p>
        <h1 data-glitch="PERDIDO">PERDIDO</h1>
        <p class="heroe-bajada">Esta pagina no existe en el archivo. Puede que nunca existiera.</p>
        <p><a class="boton" data-variante="lleno" href="#/">Volver al principio</a></p>
      </div>
    </section>`;
}
