# Como aportar a la wiki

No hace falta saber programar. Hay tres caminos, de mas facil a mas tecnico.

## 1. Rellenar un formulario

En la pestana **Issues** del repositorio:

- **Proponer una ficha** — un verdugo, pecador, mapa o tema nuevo.
- **Enviar fan art** — se publica con tu nombre y tu enlace.
- **Reportar un error** — un dato equivocado o algo que se ve mal.

Alguien del equipo lo pasa al archivo y te avisa cuando este publicado.

## 2. Editar el texto desde la web de GitHub

Cada seccion es un archivo en `datos/`. Abrelo, pulsa el lapiz, cambia lo que haga falta y
GitHub crea la propuesta por ti. Un robot revisa que el archivo no quede roto.

| Seccion   | Archivo               |
|-----------|-----------------------|
| Verdugos  | `datos/verdugos.json` |
| Pecadores | `datos/pecadores.json`|
| Mapas     | `datos/mapas.json`    |
| Mecanicas | `datos/mecanicas.json`|
| OST       | `datos/ost.json`      |
| Galeria   | `datos/galeria.json`  |

### Campos de una ficha

```json
{
  "id": "solo-minusculas-y-guiones",
  "nombre": "Nombre visible",
  "alias": "Apodo (opcional)",
  "pecado": "Ira",
  "peligro": 4,
  "estado": "canon | borrador",
  "imagen": "assets/img/verdugos/solo-minusculas-y-guiones.png",
  "resumen": "Una frase para la tarjeta.",
  "descripcion": "Texto largo con **negrita**, *cursiva*, listas con - y citas con >.",
  "stats": { "Velocidad": 4, "Sigilo": 2 },
  "habilidades": [{ "nombre": "", "tipo": "activa", "enfriamiento": "45 s", "texto": "" }],
  "consejos": [],
  "curiosidades": [],
  "mapas": ["id-de-un-mapa"],
  "ost": ["id-de-un-tema"],
  "etiquetas": [],
  "actualizado": "2026-08-31"
}
```

Reglas:

- El `id` no se cambia nunca una vez publicado: los enlaces se romperian.
- Lo que no este confirmado va con `"estado": "borrador"`.
- Los mapas usan coordenadas en porcentaje (`x` e `y` de 0 a 100) sobre la imagen.
- Las imagenes van a `assets/img/<seccion>/` con el mismo nombre que el `id`, en webp o
  png y por debajo de 500 kB.

## 3. Trabajar en local

```bash
python -m http.server 8000     # abrir http://localhost:8000
node scripts/validar.mjs       # revisar los datos antes del pull request
```

El validador avisa de ids repetidos, referencias rotas, imagenes que faltan y campos fuera
de rango.

## Normas de contenido

- Credito siempre al autor del arte, con enlace si lo hay. Se retira a peticion.
- Nada de datos personales de otros jugadores.
- Los spoilers se avisan en la primera linea del resumen.
- Si una teoria es tuya, marcala como teoria: la wiki distingue lo confirmado de lo que no.
