# CHANGELOG — Doom Paradox Wiki

Changelog listo para pegar en Discord. Copia **solo el texto de cada bloque** (no copies la línea `📋 BLOQUE` ni los `---`). Un mensaje por bloque. Límite de Discord: 2000 caracteres.

<!-- DISCORD: copia cada bloque por separado (máx. 2000 caracteres) -->

📋 BLOQUE 1/4 — pega este mensaje

# 🩸 CHANGELOG — Doom Paradox Wiki

**Drop `c5d0824`** · 10 de septiembre 2026 · `main`

La wiki se redesplegó con un **rediseño visual brutal** y un roster limpio: solo se publican fichas con retrato oficial. La identidad se queda — obsidiana, carmesí, oro, sellos de humo rasgado y HUD.

> Todo pecado encuentra su verdugo.

**En vivo**
- [GitHub Pages](https://karmenps92-ctrl.github.io/doom-paradox-wiki/)
- [Vercel](https://doomparadox.vercel.app)
- [Repositorio](https://github.com/karmenps92-ctrl/doom-paradox-wiki)

---
📋 BLOQUE 2/4 — pega este mensaje a continuación

## 🔥 Rediseño visual

Misma alma, más cine. El archivo se siente como el juego.

**Portada (hero)**
- Letras que caen una a una
- **PARADOX** con glitch, glow y aberración
- Sigilo girando, chispas y parallax
- Sello de humo rasgado con el lema

**Tarjetas**
- Duotono carmesí → color real + escáner al hover
- Nombre en banda de humo rasgado
- Esquinas HUD y shimmer dorado en canon
- Entrada escalonada al cargar

**Cabecera**
- Se comprime al hacer scroll
- Subrayado que arde en el nav
- Botones y filtros con brasa

**Dossier**
- Retícula HUD + línea de escaneo
- Sigilos en las habilidades
- Barras de stats con shimmer

**Atmósfera**
- Motor de brasas, niebla de sangre, anillo en el cursor
- Splash de intro (una vez) y humo en el footer
- Paleta `Ctrl+K` con el mismo look

**Pulido**
- Vacío, carga y 404 con estilo
- Fix de sheen / HUD
- Cache de assets `?v=3.4`

---
📋 BLOQUE 3/4 — pega este mensaje a continuación

## 📁 Archivo de fichas sin imagen

Solo se publican fichas **con retrato**. El resto quedó intacto en `coming soon 🔜/` — catálogo + un JSON por personaje. Nada se perdió.

**12 verdugos archivados**
- Sally
- Gold
- Paciente 0
- Domelí
- Flesharal
- Pac-Oni
- 0_0
- Yi Xi
- Winky
- Jason Voorhees
- Slenderman
- Jeff The Killer

**12 verdugos en vivo** (con retrato)
- DPX
- Noli
- c00ldud
- Flowers
- Neor
- 1x1x1x1
- John Doe
- Herobrine
- Wood Stone
- MR-Scoler
- Booner
- Ronn

---
📋 BLOQUE 4/4 — pega este mensaje a continuación

## ✨ Pecadores y publicación

**Pecadores: 20/20 archivados**
No había retratos. La sección queda vacía hasta que existan imágenes.

- 007n7 · Gen-E-S15 · Latt · Shedletsky
- Kittycake · Konut · Jane Doe · Steve
- Andrómeda · Benny · Yiyi · Rubí
- Pingüinikula · Mazer · Roen · Monschesse
- Pot · Evelyn · Vicon E · Camper

JSON completo en `coming soon 🔜/`.

**Publicado en `main`**
Commit `c5d0824` — rediseño visual + archivo de fichas sin imagen. **45 archivos** en el drop.

**Para devolver una ficha al vivo**
1. Retrato en `assets/img/<seccion>/<id>.jpg`
2. Copiar el JSON de `coming soon 🔜/` a `datos/`
3. Correr `node scripts/validar.mjs`

Eso es el drop. El Paradox sigue abierto — ahora, más limpio.
