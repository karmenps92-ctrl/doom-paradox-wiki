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
    "Doom Paradox es un juego asimetrico de terror para Roblox: un infierno gobernado por una entidad " +
    "lovecraftiana que se alimenta del sufrimiento humano. Los pecadores intentan escapar; los verdugos " +
    "cobran la deuda. Este es el archivo abierto de sus personajes, mapas, mecanicas y musica.",

  /* --- Enlaces externos (deja "" para ocultar el boton) --- */
  enlaces: {
    juego: "",                                  // pon aqui el enlace de la experiencia cuando salga
    discord: "https://discord.gg/yZCafC3E7",    // servidor de fans anunciado el 18/8/2026 (borralo si no quieres publicarlo)
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
     id          -> nombre del JSON dentro de /datos
     ruta        -> ruta publica (#/verdugos)
     vista       -> como se dibuja (catalogo | mapas | ost | galeria)
     campoFiltro -> campo por el que se agrupan los botones de filtro */
  secciones: [
    {
      id: "verdugos",
      nombre: "Verdugos",
      ruta: "verdugos",
      vista: "catalogo",
      tono: "sangre",
      singular: "Verdugo",
      campoFiltro: "origen",
      lema: "Los que cobran la deuda.",
      descripcion:
        "Los asesinos de Doom Paradox. Veinticuatro entidades confirmadas, entre creaciones originales, " +
        "clasicos de Roblox y viejos conocidos de las creepypastas. Cada uno impone sus propias reglas al mapa."
    },
    {
      id: "pecadores",
      nombre: "Pecadores",
      ruta: "pecadores",
      vista: "catalogo",
      tono: "ceniza",
      singular: "Pecador",
      campoFiltro: "origen",
      lema: "Los que todavia pueden huir.",
      descripcion:
        "Los supervivientes. Veinte condenados que reparan, se esconden y corren. Cada pecador arrastra una " +
        "relacion con algun verdugo: esa deuda es el nudo del lore."
    },
    {
      id: "mapas",
      nombre: "Mapas",
      ruta: "mapas",
      vista: "mapas",
      tono: "humo",
      singular: "Mapa",
      campoFiltro: "zona",
      lema: "El escenario tambien caza.",
      descripcion:
        "Los escenarios del limbo y el lobby que los une. Planos comentados, eventos de medio tiempo, " +
        "rutas y secretos documentados por el equipo."
    },
    {
      id: "mecanicas",
      nombre: "Mecanicas",
      ruta: "mecanicas",
      vista: "catalogo",
      tono: "humo",
      singular: "Mecanica",
      campoFiltro: "tipo",
      lema: "Como funciona el infierno.",
      descripcion:
        "Modos de partida, sistemas y reglas del mundo: LMS, Double Trouble, rondas especiales, " +
        "modificadores y todo lo que cambia una partida por dentro."
    },
    {
      id: "ost",
      nombre: "OST",
      ruta: "ost",
      vista: "ost",
      tono: "humo",
      singular: "Tema",
      campoFiltro: "escena",
      lema: "La banda sonora del paradox.",
      descripcion:
        "Chase themes, temas de LMS y ambientes de mapa. Cada verdugo tiene su propia persecucion sonando detras."
    },
    {
      id: "galeria",
      nombre: "Galeria",
      ruta: "galeria",
      vista: "galeria",
      tono: "ceniza",
      singular: "Obra",
      campoFiltro: "autor",
      lema: "Lo que la comunidad dibuja.",
      descripcion:
        "Fan art y arte del equipo. Cada obra pertenece a quien la firma."
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
