# DOOM PARADOX · WIKI

Wiki de la comunidad para el juego de Roblox **Doom Paradox**. Sitio estatico, sin
frameworks ni compilacion: HTML, CSS y JavaScript de modulos nativos. Todo el contenido
vive en archivos de texto dentro de `datos/`, asi que cualquiera puede aportar sin saber
programar.

## Que trae

- **Cinco secciones dirigidas por datos**: Verdugos, Pecadores, Mapas, Mecanicas y OST, mas la
  Galeria de fan art. Anadir una entrada al JSON crea su pagina automaticamente.
- **Buscador global** con `Ctrl + K` (o `/`), tolerante a acentos y a erratas.
- **Fichas de personaje** con atributos animados, habilidades, consejos y referencias
  cruzadas entre secciones (un verdugo enlaza a sus mapas y a su tema musical).
- **Visor de mapas interactivo**: arrastrar, acercar con la rueda y puntos de interes
  numerados con su descripcion.
- **Reproductor de OST** con visor de onda en tiempo real (Web Audio), o incrustado de
  YouTube si el tema no esta subido.
- **Galeria** en mosaico con lupa y credito obligatorio al autor.
- **Comentarios por pagina** mediante giscus (GitHub Discussions), sin base de datos.
- **Estetica propia**: humo, grano de pelicula, cenizas en movimiento, transiciones de
  tinta entre paginas y un ambiente sonoro sintetizado (no ocupa ni un byte de audio).
- **Validador automatico** de los datos en cada pull request.

## Poner en marcha en local

Los modulos de JavaScript no funcionan abriendo el archivo directamente, hace falta un
servidor. Con Python:

```bash
python -m http.server 8000
```

Y abrir `http://localhost:8000`. Con Node tambien vale `npx serve .`.

Antes de subir cambios conviene pasar el validador:

```bash
node scripts/validar.mjs
```

## Publicar en GitHub Pages

1. Crear un repositorio publico (por ejemplo `doom-paradox-wiki`).
2. Subir esta carpeta:

```bash
git remote add origin https://github.com/USUARIO/doom-paradox-wiki.git
git branch -M main
git push -u origin main
```

3. En el repositorio: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
   El flujo de trabajo `.github/workflows/pages.yml` valida los datos y publica.
4. Editar `assets/js/config.js` y poner el valor real de `repo` (`usuario/repositorio`)
   para que funcionen los botones de "editar en GitHub" y los formularios.

La wiki queda en `https://USUARIO.github.io/doom-paradox-wiki/`.

### Dominio propio (opcional)

Crear un archivo `CNAME` en la raiz con el dominio y apuntar el DNS a GitHub Pages.

## Activar los comentarios

1. En el repositorio: **Settings → General → Features → Discussions**.
2. Instalar la app [giscus](https://github.com/apps/giscus) en el repositorio.
3. Generar los identificadores en [giscus.app](https://giscus.app).
4. Rellenar el bloque `giscus` de `assets/js/config.js` y poner `activo: true`.

## Estructura

```
index.html                 esqueleto y capas atmosfericas
assets/css/estilo.css      sistema visual (colores, tipografia, componentes)
assets/css/efectos.css     grano, niebla, cenizas, transiciones
assets/js/config.js        AJUSTES DEL SITIO — empieza por aqui
assets/js/app.js           arranque y registro de rutas
assets/js/ruteo.js         ruteo por hash con transicion de tinta
assets/js/datos.js         carga y cache de /datos
assets/js/buscador.js      paleta de busqueda global
assets/js/efectos.js       cenizas, ambiente sonoro, progreso de lectura
assets/js/vistas/          una vista por tipo de pagina
datos/*.json               EL CONTENIDO DE LA WIKI
assets/img/<seccion>/      imagenes de cada ficha
assets/audio/              temas de la OST
scripts/validar.mjs        validador de datos
scripts/generar-og.py      rehace la tarjeta social (assets/img/og.png)
```

## La tarjeta que se ve al compartir el enlace

`assets/img/og.png` es lo que muestran Discord, Twitter o WhatsApp cuando alguien pega el
enlace de la wiki. Si cambia el nombre o las secciones, se rehace con:

```bash
python scripts/generar-og.py
```

## De donde sale el contenido

Las fichas se han volcado desde el servidor de desarrollo del juego (agosto de 2026). Cada
entrada lleva un campo `fuente` con el canal y la fecha de donde salio el dato, y un campo
`estado`:

- `canon` — confirmado por el equipo.
- `borrador` — propuesta discutida pero sin aprobar, o ficha que existe en el roster pero
  todavia no esta escrita.

Ninguna ficha tiene imagen todavia: mientras falte, la wiki dibuja un marcador de tinta con
las iniciales del personaje, asi que se puede publicar antes de tener el arte terminado.

## Creditos y derechos

El fan art pertenece a sus autores y se publica con credito y enlace; se retira a peticion.
Roblox es una marca de Roblox Corporation, sin relacion con este proyecto.
