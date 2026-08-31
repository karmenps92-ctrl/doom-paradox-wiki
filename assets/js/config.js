/* ============================================================
   CONFIGURACION DE LA WIKI
   Este es el unico archivo que necesitas tocar para adaptar la
   wiki a tu repositorio. Todo lo demas se alimenta de /datos.
   ============================================================ */

export const SITIO = {
  titulo: "DOOM PARADOX",
  subtitulo: "WIKI",
  lema: "Todo pecado encuentra su verdugo",
  descripcion:
    "Archivo abierto del universo de Doom Paradox: sus verdugos, sus pecadores, los mapas donde se cazan y la musica que los acompana.",

  /* --- Enlaces externos (deja "" para ocultar el boton) --- */
  enlaces: {
    juego: "",                    // ej: https://www.roblox.com/games/0000000000/Doom-Paradox
    discord: "",                  // ej: https://discord.gg/xxxxxxx
    grupoRoblox: "",
    youtube: ""
  },

  /* --- Repositorio de GitHub (usuario/repo) --- */
  repo: "USUARIO/doom-paradox-wiki",
  rama: "main",

  /* --- Comentarios con giscus (GitHub Discussions) ---
     1. Crea el repo publico y activa Discussions.
     2. Instala la app https://github.com/apps/giscus en el repo.
     3. Entra en https://giscus.app, pega tu repo y copia los IDs.
     4. Rellena los cuatro valores de abajo y activo:true.        */
  giscus: {
    activo: false,
    repo: "USUARIO/doom-paradox-wiki",
    repoId: "",
    categoria: "Wiki",
    categoriaId: "",
    tema: "noborder_dark",
    idioma: "es"
  },

  /* --- Secciones del archivo ---
     id  -> nombre del JSON dentro de /datos
     ruta-> ruta publica (#/verdugos)
     vista-> como se dibuja (catalogo | mapas | ost | galeria)  */
  secciones: [
    {
      id: "verdugos",
      nombre: "Verdugos",
      ruta: "verdugos",
      vista: "catalogo",
      tono: "sangre",
      singular: "Verdugo",
      lema: "Los que cobran la deuda.",
      descripcion:
        "Entidades que persiguen a los pecadores. Cada uno impone sus propias reglas al mapa: aprendelas o pagalas."
    },
    {
      id: "pecadores",
      nombre: "Pecadores",
      ruta: "pecadores",
      vista: "catalogo",
      tono: "ceniza",
      singular: "Pecador",
      lema: "Los que todavia pueden huir.",
      descripcion:
        "Personajes jugables. Cada pecador arrastra una culpa distinta y una habilidad que nace de ella."
    },
    {
      id: "mapas",
      nombre: "Mapas",
      ruta: "mapas",
      vista: "mapas",
      tono: "humo",
      singular: "Mapa",
      lema: "El escenario tambien caza.",
      descripcion:
        "Planos comentados, rutas de escape, generadores, escondites y secretos documentados por la comunidad."
    },
    {
      id: "ost",
      nombre: "OST",
      ruta: "ost",
      vista: "ost",
      tono: "humo",
      singular: "Tema",
      lema: "La banda sonora del paradox.",
      descripcion:
        "Temas originales del juego con su contexto: donde suenan, quien los compuso y que anuncian."
    },
    {
      id: "galeria",
      nombre: "Galeria",
      ruta: "galeria",
      vista: "galeria",
      tono: "ceniza",
      singular: "Obra",
      lema: "Lo que la comunidad dibuja.",
      descripcion:
        "Fan art enviado por jugadores. Cada obra pertenece a quien la firma."
    }
  ]
};

/* Devuelve la definicion de una seccion por su ruta o id. */
export function seccionPorRuta(ruta){
  return SITIO.secciones.find(s => s.ruta === ruta || s.id === ruta) || null;
}

/* URL para abrir una plantilla de issue en GitHub. */
export function urlIssue(plantilla, titulo = ""){
  const base = `https://github.com/${SITIO.repo}/issues/new`;
  const p = new URLSearchParams();
  if (plantilla) p.set("template", plantilla);
  if (titulo) p.set("title", titulo);
  return `${base}?${p.toString()}`;
}

/* URL para editar en GitHub el JSON de una seccion. */
export function urlEditar(seccionId){
  return `https://github.com/${SITIO.repo}/edit/${SITIO.rama}/datos/${seccionId}.json`;
}
