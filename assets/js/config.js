/* ============================================================
   CONFIGURACION DE LA WIKI
   Este es el único archivo de configuración del sitio.
   Todo el contenido se lee de la carpeta /datos.
   ============================================================ */

export const SITIO = {
  titulo: "DOOM PARADOX",
  subtitulo: "WIKI",
  lema: "Todo pecado encuentra su verdugo",
  descripcion:
    "Doom Paradox es un juego asimétrico de terror para Roblox: un infierno gobernado por una entidad " +
    "lovecraftiana que se alimenta del sufrimiento humano. Los pecadores intentan escapar; los verdugos " +
    "cobran la deuda. Este es el archivo abierto de sus personajes, mapas, mecánicas y música.",

  /* --- Enlaces externos --- */
  enlaces: {
    juego: "",
    discord: "https://discord.gg/yZCafC3E7",
    grupoRoblox: "",
    youtube: ""
  },

  /* --- Secciones del archivo ---
     id          -> nombre del JSON dentro de /datos
     ruta        -> ruta pública (#/verdugos)
     vista       -> cómo se dibuja (catalogo | mapas | ost | galeria)
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
        "clásicos de Roblox y viejos conocidos de las creepypastas. Cada uno impone sus propias reglas al mapa."
    },
    {
      id: "pecadores",
      nombre: "Pecadores",
      ruta: "pecadores",
      vista: "catalogo",
      tono: "ceniza",
      singular: "Pecador",
      campoFiltro: "origen",
      lema: "Los que todavía pueden huir.",
      descripcion:
        "Los supervivientes. Veinte condenados que reparan, se esconden y corren. Cada pecador arrastra una " +
        "relación con algún verdugo: esa deuda es el nudo del lore."
    },
    {
      id: "mapas",
      nombre: "Mapas",
      ruta: "mapas",
      vista: "mapas",
      tono: "humo",
      singular: "Mapa",
      campoFiltro: "zona",
      lema: "El escenario también caza.",
      descripcion:
        "Los escenarios del limbo y el lobby que los une. Planos comentados, eventos de medio tiempo, " +
        "rutas y secretos documentados por el equipo."
    },
    {
      id: "mecanicas",
      nombre: "Mecánicas",
      ruta: "mecanicas",
      vista: "catalogo",
      tono: "humo",
      singular: "Mecánica",
      campoFiltro: "tipo",
      lema: "Cómo funciona el infierno.",
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
        "Chase themes, temas de LMS y ambientes de mapa. Cada verdugo tiene su propia persecución sonando detrás."
    },
    {
      id: "galeria",
      nombre: "Galería",
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

/* Devuelve la definición de una sección por su ruta o id. */
export function seccionPorRuta(ruta){
  return SITIO.secciones.find(s => s.ruta === ruta || s.id === ruta) || null;
}
