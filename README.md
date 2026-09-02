# DOOM PARADOX · WIKI

Wiki para el juego de Roblox **Doom Paradox**. Sitio estático, sin frameworks ni compilación: HTML, CSS y JavaScript de módulos nativos. Todo el contenido vive en archivos de texto dentro de `datos/`.

## Características

- **Secciones dirigidas por datos**: Verdugos, Pecadores, Mapas, Mecánicas, OST y Galería.
- **Buscador global** con `Ctrl + K` (o `/`), tolerante a acentos y a erratas.
- **Fichas de personaje** estilo códice con atributos animados, habilidades, tácticas de supervivencia y skins.
- **Visor de mapas interactivo**: arrastrar, acercar con la rueda y puntos de interés numerados con su descripción.
- **Reproductor de OST** con ecualizador de fuego en tiempo real (Web Audio) o enlaces de audio.
- **Galería** en mosaico con lupa y créditos a autores.
- **Motor de efectos VFX HD 3.0**: partículas de fuego y cenizas en 4 capas con física de vórtice reactiva al ratón, linterna volumétrica, tilt 3D y ambiente sonoro sintetizado.
- **Validador automático** de los datos (`node scripts/validar.mjs`).

## Poner en marcha en local

```bash
python -m http.server 8000
```

Y abrir `http://localhost:8000`.

Para validar los datos:

```bash
node scripts/validar.mjs
```

## Estructura

```
index.html                 esqueleto y capas atmosféricas
assets/css/estilo.css      sistema visual (colores, tipografía, componentes)
assets/css/efectos.css     grano, niebla, cenizas, transiciones, tilt 3D
assets/js/config.js        ajustes y metadata del sitio
assets/js/app.js           arranque y registro de rutas
assets/js/ruteo.js         ruteo por hash con transición de tinta
assets/js/datos.js         carga y caché de /datos
assets/js/buscador.js      paleta de búsqueda global
assets/js/efectos.js       partículas HD, física de cursor, ambiente sonoro
assets/js/vistas/          una vista por tipo de página
datos/*.json               EL CONTENIDO DE LA WIKI
assets/img/<seccion>/      imágenes de cada ficha
assets/audio/              temas de la OST
scripts/validar.mjs        validador de datos
```
