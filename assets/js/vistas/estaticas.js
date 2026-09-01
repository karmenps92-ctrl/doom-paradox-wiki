/* ============================================================
   Páginas fijas: guía de contribución, créditos y 404
   ============================================================ */

import { SITIO, urlIssue, urlEditar } from "../config.js";
import { esc, revelar } from "../util.js";
import { comentarios, montarComentarios } from "../comentarios.js";

export async function vistaGuia(raiz){
  document.title = `Contribuir · ${SITIO.titulo} WIKI`;
  raiz.innerHTML = `
    <section class="banda" data-tono="ceniza">
      <h2 class="banda-titulo">Contribuir</h2>
      <p class="banda-bajada">Esta wiki es un archivo abierto: se edita con texto, no con código.</p>
    </section>

    <section class="seccion"><div class="contenedor cuerpo-entrada">
      <div class="prosa">
        <h3>La idea</h3>
        <p>Cada sección de la wiki es un archivo de texto dentro de la carpeta <code>datos/</code>.
        Añadir un verdugo es añadir un bloque a <code>datos/verdugos.json</code>. La página se genera sola.</p>

        <h3>Sin saber de GitHub</h3>
        <ul>
          <li>Abre una <a href="${esc(urlIssue("nueva-entrada.yml"))}" target="_blank" rel="noopener">propuesta de ficha</a> y rellena el formulario.</li>
          <li>Si viste un error, usa el <a href="${esc(urlIssue("correccion.yml"))}" target="_blank" rel="noopener">reporte de corrección</a>.</li>
          <li>Para dibujos, el <a href="${esc(urlIssue("fan-art.yml"))}" target="_blank" rel="noopener">formulario de fan art</a>.</li>
        </ul>

        <h3>Con GitHub</h3>
        <ul>
          <li>Haz un fork del repositorio.</li>
          <li>Edita el JSON de la sección (por ejemplo <a href="${esc(urlEditar("verdugos"))}" target="_blank" rel="noopener">datos/verdugos.json</a>).</li>
          <li>Sube la imagen a <code>assets/img/&lt;sección&gt;/</code> con el mismo <code>id</code> de la ficha.</li>
          <li>Abre un pull request. Un validador automático revisa que el JSON no esté roto.</li>
        </ul>

        <h3>Cómo es una ficha de verdugo</h3>
        <pre class="bloque-codigo"><code>{
  "id": "nombre-en-minusculas",
  "nombre": "Nombre visible",
  "alias": "El que apaga las velas",
  "origen": "Original",
  "peligro": 4,
  "estado": "canon",
  "imagen": "assets/img/verdugos/nombre-en-minusculas.png",
  "resumen": "Una frase que se lee en la tarjeta.",
  "descripcion": "Texto largo. Admite **negrita**, *cursiva*, listas con - y citas con &gt;.",
  "stats": { "Velocidad": 4, "Sigilo": 2, "Daño": 5 },
  "habilidades": [
    { "nombre": "Aullido", "tipo": "activa", "enfriamiento": "45 s", "texto": "Qué hace." }
  ],
  "skins": [{ "nombre": "Vegan", "texto": "En qué se basa." }],
  "consejos": ["Qué hacer para sobrevivir."],
  "mapas": ["bosque-encantado"],
  "ost": ["chase-vanity"],
  "etiquetas": ["gula", "cuchillo"],
  "actualizado": "2026-08-31",
  "fuente": "De dónde sale el dato"
}</code></pre>

        <p>Las claves van siempre <strong>sin tilde</strong> (<code>descripcion</code>, <code>duracion</code>),
        porque las lee el programa. El texto de dentro, en cambio, se escribe bien: con tildes y con eñes.</p>

        <h3>Reglas de la casa</h3>
        <ul>
          <li>Marca como <code>"estado": "borrador"</code> lo que sea teoría o no esté confirmado.</li>
          <li>El fan art se publica siempre con crédito y enlace al autor; se retira si el autor lo pide.</li>
          <li>Nada de espóilers sin avisar en la primera línea del resumen.</li>
          <li>Imágenes ligeras: menos de 500 kB por archivo, en webp o png.</li>
        </ul>
      </div>

      <aside>
        <div class="panel"><h4>Atajos de teclado</h4>
          <div class="chips">
            <span class="chip"><kbd>Ctrl</kbd><kbd>K</kbd> buscar</span>
            <span class="chip"><kbd>/</kbd> buscar</span>
            <span class="chip"><kbd>Esc</kbd> cerrar</span>
          </div>
        </div>
        <div class="panel"><h4>Estructura</h4>
          <ul class="lista-limpia">
            <li><code>datos/</code> el contenido</li>
            <li><code>assets/img/</code> imágenes</li>
            <li><code>assets/audio/</code> música</li>
            <li><code>assets/js/config.js</code> ajustes</li>
          </ul>
        </div>
        <div class="panel"><h4>Repositorio</h4>
          <a class="boton boton-ancho" href="https://github.com/${esc(SITIO.repo)}" target="_blank" rel="noopener">Abrir en GitHub</a>
        </div>
      </aside>
    </div></section>`;
  revelar(raiz);
}

export async function vistaCreditos(raiz){
  document.title = `Créditos · ${SITIO.titulo} WIKI`;
  raiz.innerHTML = `
    <section class="banda" data-tono="sangre">
      <h2 class="banda-titulo">Créditos</h2>
      <p class="banda-bajada">Quién hace el juego y quién sostiene este archivo.</p>
    </section>
    <section class="seccion"><div class="contenedor">
      <div class="prosa">
        <h3>Equipo de Doom Paradox</h3>
        <p>Doom Paradox lo dirige <strong>S.U.A</strong> y lo saca adelante el equipo del servidor de
        desarrollo: arte, modelado, programación, música, doblaje y pruebas.</p>
        <p>Los nombres aparecen tal y como se usan en el servidor. Si alguien quiere figurar de otra
        forma, o no figurar, se cambia en cuanto lo pida.</p>

        <h3>Esta wiki</h3>
        <p>Archivo abierto: lo que lees aquí sale del desarrollo del juego y de las propuestas de la
        comunidad. Cada ficha indica de qué canal y de qué fecha viene su información, y si es
        <em>canon</em> o todavía un <em>borrador</em>.</p>

        <h3>Aviso</h3>
        <p>Wiki mantenida por la comunidad. El arte pertenece a sus autores y se retira a petición.
        Roblox es marca de Roblox Corporation, sin relación con este proyecto. Los personajes
        invitados y de creepypasta pertenecen a sus respectivos creadores.</p>
      </div>
      ${comentarios("creditos", "los créditos")}
    </div></section>`;
  revelar(raiz);
  montarComentarios(raiz);
}

export async function vista404(raiz){
  document.title = `Perdido · ${SITIO.titulo} WIKI`;
  raiz.innerHTML = `
    <section class="seccion pagina-404">
      <div class="contenedor">
        <p class="etiqueta"><span class="raya"></span>Error 404</p>
        <h1 data-glitch="PERDIDO">PERDIDO</h1>
        <p class="heroe-bajada">Esta página no existe en el archivo. Puede que nunca existiera.</p>
        <p><a class="boton" data-variante="lleno" href="#/">Volver al principio</a></p>
      </div>
    </section>`;
}
