/* ============================================================
   Comentarios por pagina con giscus (GitHub Discussions).
   Si no esta configurado, se muestra un aviso con instrucciones
   en vez de romperse.
   ============================================================ */

import { SITIO } from "./config.js";
import { esc } from "./util.js";

export function comentarios(termino, titulo = ""){
  const g = SITIO.giscus;
  const cabecera = `
    <h3 style="font-family:var(--display);font-size:1.8rem;margin-bottom:.4rem">Comentarios</h3>
    <p style="color:var(--ceniza);margin-bottom:1.4rem">
      Teorias, correcciones y hallazgos sobre ${esc(titulo || "esta pagina")}. Se necesita cuenta de GitHub.
    </p>`;

  if (!g.activo || !g.repoId || !g.categoriaId){
    return `<section class="zona-comentarios">${cabecera}
      <div class="aviso">
        <b>Comentarios sin activar</b>
        <p>El propietario de la wiki debe rellenar el bloque <code>giscus</code> de
        <code>assets/js/config.js</code>. Pasos: activar <em>Discussions</em> en el repositorio,
        instalar la app <em>giscus</em>, generar los IDs en <a href="https://giscus.app" rel="noopener" target="_blank">giscus.app</a>
        y poner <code>activo: true</code>.</p>
      </div>
    </section>`;
  }

  return `<section class="zona-comentarios" data-giscus="${esc(termino)}">${cabecera}
    <div class="giscus"></div>
  </section>`;
}

/* Inyecta el script de giscus despues de pintar la vista. */
export function montarComentarios(raiz = document){
  const zona = raiz.querySelector("[data-giscus]");
  if (!zona) return;
  const g = SITIO.giscus;
  const s = document.createElement("script");
  s.src = "https://giscus.app/client.js";
  s.crossOrigin = "anonymous";
  s.async = true;
  Object.entries({
    "data-repo": g.repo,
    "data-repo-id": g.repoId,
    "data-category": g.categoria,
    "data-category-id": g.categoriaId,
    "data-mapping": "specific",
    "data-term": zona.dataset.giscus,
    "data-strict": "1",
    "data-reactions-enabled": "1",
    "data-emit-metadata": "0",
    "data-input-position": "top",
    "data-theme": g.tema,
    "data-lang": g.idioma,
    "data-loading": "lazy"
  }).forEach(([k, v]) => s.setAttribute(k, v));
  zona.querySelector(".giscus")?.appendChild(s);
}
