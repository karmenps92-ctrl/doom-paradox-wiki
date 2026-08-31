/* ============================================================
   Galeria de fan art: mosaico + lupa + envio por GitHub
   ============================================================ */

import { urlIssue, urlEditar } from "../config.js";
import { cargarSeccion } from "../datos.js";
import { $, $$, esc, norm, imagen, revelar, debounce } from "../util.js";
import { comentarios, montarComentarios } from "../comentarios.js";

export async function vistaGaleria(raiz, sec){
  const { entradas } = await cargarSeccion(sec.id);
  const autores = [...new Set(entradas.map(o => o.autor).filter(Boolean))].sort();

  raiz.innerHTML = `
    <section class="banda" data-tono="${esc(sec.tono)}">
      <h2 class="banda-titulo">${esc(sec.nombre)}</h2>
      <p class="banda-bajada">${esc(sec.descripcion)}</p>
    </section>

    <section class="seccion"><div class="contenedor">
      <div class="barra-filtros">
        <button class="filtro" data-autor="" aria-pressed="true">Todo</button>
        ${autores.slice(0, 10).map(a => `<button class="filtro" data-autor="${esc(a)}" aria-pressed="false">${esc(a)}</button>`).join("")}
        <label class="buscador-local">
          <input type="search" id="buscar-obra" placeholder="Buscar obra o autor" aria-label="Buscar obra o autor">
        </label>
      </div>

      <div class="mosaico" id="mosaico"></div>

      <div class="aviso" style="margin-top:3rem">
        <b>Envia tu fan art</b>
        <p>Abre una propuesta con tu imagen adjunta: se revisa y se publica con tu nombre y tu enlace.
        Nadie sube nada a tu nombre sin permiso, y puedes pedir que se retire cuando quieras.</p>
        <p style="margin-top:.9rem">
          <a class="boton" data-variante="lleno" href="${esc(urlIssue("fan-art.yml", "[Fan art] "))}" target="_blank" rel="noopener">Enviar fan art</a>
          <a class="boton" href="${esc(urlEditar("galeria"))}" target="_blank" rel="noopener">Editar la galeria</a>
        </p>
      </div>

      ${comentarios("galeria", "la galeria")}
    </div></section>

    <div class="lupa" id="lupa" hidden>
      <button class="lupa-cerrar" id="cerrar-lupa" aria-label="Cerrar">&times;</button>
      <div>
        <img id="lupa-img" src="" alt="">
        <p class="lupa-pie" id="lupa-pie"></p>
      </div>
    </div>`;

  const mosaico = $("#mosaico", raiz);
  let autor = "", texto = "";

  function pintar(){
    const lista = entradas.filter(o => {
      if (autor && o.autor !== autor) return false;
      if (!texto) return true;
      return norm([o.titulo, o.autor, o.descripcion, (o.etiquetas || []).join(" ")].join(" ")).includes(texto);
    });
    mosaico.innerHTML = lista.length ? lista.map((o, i) => `
      <figure data-obra="${i}" data-revelar>
        ${imagen(o.imagen, o.titulo || "Fan art", (o.titulo || "??").slice(0, 2), true)}
        <figcaption>
          <b>${esc(o.titulo || "Sin titulo")}</b>
          ${esc(o.autor || "anonimo")}${o.fecha ? " · " + esc(o.fecha) : ""}
        </figcaption>
      </figure>`).join("")
      : `<p class="vacio">Nada por aqui todavia.</p>`;
    revelar(mosaico);

    $$("figure[data-obra]", mosaico).forEach(f => f.addEventListener("click", () => abrirLupa(lista[Number(f.dataset.obra)])));
  }

  function abrirLupa(o){
    if (!o) return;
    const lupa = $("#lupa", raiz);
    $("#lupa-img", raiz).src = o.imagen || "";
    $("#lupa-img", raiz).alt = o.titulo || "Fan art";
    $("#lupa-pie", raiz).innerHTML =
      `${esc(o.titulo || "Sin titulo")} — ${esc(o.autor || "anonimo")}` +
      (o.fuente ? ` · <a href="${esc(o.fuente)}" target="_blank" rel="noopener">fuente</a>` : "");
    lupa.hidden = false;
  }

  const cerrar = () => { $("#lupa", raiz).hidden = true; };
  $("#cerrar-lupa", raiz).addEventListener("click", cerrar);
  $("#lupa", raiz).addEventListener("click", e => { if (e.target.id === "lupa") cerrar(); });
  addEventListener("keydown", e => { if (e.key === "Escape") cerrar(); });

  $$(".filtro", raiz).forEach(b => b.addEventListener("click", () => {
    autor = b.dataset.autor;
    $$(".filtro", raiz).forEach(o => o.setAttribute("aria-pressed", String(o === b)));
    pintar();
  }));
  $("#buscar-obra", raiz).addEventListener("input", debounce(e => { texto = norm(e.target.value.trim()); pintar(); }, 110));

  pintar();
  montarComentarios(raiz);
}
