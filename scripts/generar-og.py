# -*- coding: utf-8 -*-
"""
Genera assets/img/og.png: la tarjeta que aparece al pegar el enlace de la
wiki en Discord, Twitter o WhatsApp.

    pip install pillow
    python scripts/generar-og.py

Dibuja una banda de sangre con el borde rasgado mediante ruido fractal 1D,
el titulo encima y las secciones debajo. Si cambia el nombre del sitio o
las secciones, se edita aqui y se vuelve a lanzar.

Usa fuentes de Windows (Constantia y Georgia). En otro sistema, cambia las
rutas de la variable F por cualquier serif con caracteres latinos.
"""
import random, math, pathlib
from PIL import Image, ImageDraw, ImageFont, ImageFilter, ImageChops

random.seed(7)
W, H = 1200, 630
SALIDA = pathlib.Path(__file__).resolve().parent.parent / "assets" / "img" / "og.png"

NEGRO   = (5, 4, 6)
SANGRE  = (125, 12, 17)
SANGRE2 = (163, 13, 19)
BRASA   = (216, 31, 24)
HUESO   = (236, 229, 220)
CENIZA  = (139, 133, 143)

F = "C:/Windows/Fonts/"
titulo_f = ImageFont.truetype(F + "constan.ttf", 116)   # serif elegante
wiki_f   = ImageFont.truetype(F + "georgiab.ttf", 26)
pie_f    = ImageFont.truetype(F + "georgia.ttf", 21)
lema_f   = ImageFont.truetype(F + "georgiai.ttf", 27)

img  = Image.new("RGB", (W, H), NEGRO)
capa = ImageDraw.Draw(img)

# ---------- 1. halo de brasa arriba ----------
halo = Image.new("L", (W, H), 0)
hd = ImageDraw.Draw(halo)
for r, a in [(760, 26), (560, 34), (360, 42), (200, 46)]:
    hd.ellipse([W // 2 - r, -r * 0.75, W // 2 + r, r * 0.85], fill=a)
halo = halo.filter(ImageFilter.GaussianBlur(90))
img = Image.composite(Image.new("RGB", (W, H), SANGRE), img, halo)

# ---------- 2. banda de sangre con bordes rasgados ----------
banda_top, banda_alto = 232, 178

def perfil(ancho, amp, octavas, semilla):
    """Ruido fractal 1D suavizado: da un borde roto, no ondulado."""
    rnd = random.Random(semilla)
    val = [0.0] * ancho
    for paso, peso in octavas:
        pts = [rnd.uniform(-1, 1) for _ in range(ancho // paso + 3)]
        for x in range(ancho):
            i = x / paso
            i0 = int(i)
            f = i - i0
            f = f * f * (3 - 2 * f)                 # suavizado
            val[x] += (pts[i0] * (1 - f) + pts[i0 + 1] * f) * peso
    m = max(abs(v) for v in val) or 1
    return [v / m * amp for v in val]

OCT = [(150, 1.0), (61, .55), (23, .3), (8, .16), (3, .07)]
sup = perfil(W, 17, OCT, 11)
inf = perfil(W, 20, OCT, 29)

mascara = Image.new("L", (W, H), 0)
md = ImageDraw.Draw(mascara)
poli = [(x, banda_top + sup[x]) for x in range(W)]
poli += [(x, banda_top + banda_alto + inf[x]) for x in range(W - 1, -1, -1)]
md.polygon(poli, fill=255)

# goterones: la tinta chorrea hacia abajo en unos pocos puntos
rnd = random.Random(5)
for _ in range(9):
    x = rnd.randint(40, W - 40)
    largo = rnd.randint(14, 52)
    ancho_g = rnd.randint(5, 15)
    base = banda_top + banda_alto + inf[x]
    md.polygon([(x - ancho_g, base - 4), (x + ancho_g, base - 4),
                (x + ancho_g * 0.28, base + largo), (x - ancho_g * 0.28, base + largo)], fill=255)
    md.ellipse([x - ancho_g * 0.3, base + largo - ancho_g * 0.3,
                x + ancho_g * 0.3, base + largo + ancho_g * 0.3], fill=255)

# salpicaduras sueltas alrededor
for _ in range(70):
    x = rnd.randint(0, W)
    lado = rnd.choice([-1, 1])
    y = (banda_top + sup[x] - rnd.randint(2, 34)) if lado < 0 else (banda_top + banda_alto + inf[x] + rnd.randint(2, 46))
    r = rnd.uniform(1, 5.5)
    md.ellipse([x - r, y - r, x + r, y + r], fill=255)

mascara = mascara.filter(ImageFilter.GaussianBlur(.8))

# degradado vertical dentro de la banda
grad = Image.new("RGB", (1, H))
gd = ImageDraw.Draw(grad)
for y in range(H):
    t_ = (y - banda_top) / banda_alto
    k = 1 - abs(t_ - 0.40) * 1.35
    k = max(0.30, min(1, k))
    gd.point((0, y), fill=tuple(int(SANGRE[i] + (SANGRE2[i] - SANGRE[i]) * k) for i in range(3)))
grad = grad.resize((W, H))
img = Image.composite(grad, img, mascara)

# ---------- 3. titulo ----------
def texto_espaciado(draw, xy, txt, font, fill, sp=0, centrado=True):
    anchos = [draw.textlength(c, font=font) for c in txt]
    total = sum(anchos) + sp * (len(txt) - 1)
    x = xy[0] - total / 2 if centrado else xy[0]
    for c, an in zip(txt, anchos):
        draw.text((x, xy[1]), c, font=font, fill=fill)
        x += an + sp
    return total

capa = ImageDraw.Draw(img)
# sombra suave bajo el titulo
sombra = Image.new("RGBA", (W, H), (0, 0, 0, 0))
sd = ImageDraw.Draw(sombra)
texto_espaciado(sd, (W // 2, banda_top + 20), "DOOM PARADOX", titulo_f, (0, 0, 0, 210), sp=7)
sombra = sombra.filter(ImageFilter.GaussianBlur(9))
img = Image.alpha_composite(img.convert("RGBA"), sombra).convert("RGB")

capa = ImageDraw.Draw(img)
texto_espaciado(capa, (W // 2, banda_top + 18), "DOOM PARADOX", titulo_f, HUESO, sp=7)

# ---------- 4. WIKI ----------
y_wiki = banda_top + banda_alto + 34
texto_espaciado(capa, (W // 2, y_wiki), "WIKI", wiki_f, (255, 120, 96), sp=17)

# filetes a los lados de WIKI
capa.line([(W // 2 - 210, y_wiki + 15), (W // 2 - 104, y_wiki + 15)], fill=(104, 30, 34), width=1)
capa.line([(W // 2 + 104, y_wiki + 15), (W // 2 + 210, y_wiki + 15)], fill=(104, 30, 34), width=1)

# ---------- 5. lema y secciones ----------
lema = "Todo pecado encuentra su verdugo"
an = capa.textlength(lema, font=lema_f)
capa.text(((W - an) / 2, y_wiki + 56), lema, font=lema_f, fill=(196, 188, 190))

pie = "VERDUGOS  ·  PECADORES  ·  MAPAS  ·  MECÁNICAS  ·  OST  ·  GALERÍA"
texto_espaciado(capa, (W // 2, H - 74), pie, pie_f, CENIZA, sp=2.2)

# ---------- 6. marco fino ----------
capa.rectangle([26, 26, W - 27, H - 27], outline=(38, 33, 42), width=1)
for x0, y0, x1, y1 in [(26, 26, 74, 26), (26, 26, 26, 74),
                       (W - 75, H - 27, W - 27, H - 27), (W - 27, H - 75, W - 27, H - 27)]:
    capa.line([x0, y0, x1, y1], fill=BRASA, width=2)

# ---------- 7. cenizas ----------
for _ in range(110):
    x, y = random.randint(0, W), random.randint(0, H)
    r = random.uniform(0.6, 2.2)
    if random.random() < 0.22:
        c = (255, random.randint(70, 130), 50)
    else:
        c = (random.randint(90, 150),) * 3
    capa.ellipse([x - r, y - r, x + r, y + r], fill=c)

# ---------- 8. grano de pelicula ----------
ruido = Image.effect_noise((W, H), 26).convert("L")
img = ImageChops.overlay(img, Image.merge("RGB", (ruido, ruido, ruido)))
img = Image.blend(img, Image.new("RGB", (W, H), NEGRO), 0.06)

# ---------- 9. vineta ----------
vin = Image.new("L", (W, H), 0)
vd = ImageDraw.Draw(vin)
vd.ellipse([-W * 0.28, -H * 0.42, W * 1.28, H * 1.42], fill=255)
vin = vin.filter(ImageFilter.GaussianBlur(150))
img = Image.composite(img, Image.new("RGB", (W, H), (2, 1, 2)), vin)

SALIDA.parent.mkdir(parents=True, exist_ok=True)
img = img.quantize(colors=190, method=Image.Quantize.MEDIANCUT,
                   dither=Image.Dither.FLOYDSTEINBERG)   # de ~1 MB a ~0,5 MB
img.save(SALIDA, "PNG", optimize=True)
print("escrito", SALIDA, img.size, f"{SALIDA.stat().st_size/1024:.0f} kB")
