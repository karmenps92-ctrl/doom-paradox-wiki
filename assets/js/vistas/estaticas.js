/* ============================================================
   Páginas fijas: créditos y 404
   ============================================================ */

import { SITIO } from "../config.js";
import { revelar } from "../util.js";

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
    </div></section>`;
  revelar(raiz);
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
