# LA HORA — La Pieza Central

Reloj de sol de los tres talleres. Paquete de arte y especificación para
integrar en el juego de labortulum.com.

Un disco de madera de VETA, una aguja forjada por MANNNO y las marcas de
plata de CONTRASTE. El filo inferior de la aguja está a **20.2°**, la
latitud real de Tulum: la pieza da la hora de verdad. Cuando la sombra
cruza una marca, ese taller está abierto.

La obra no representa el trabajo del lugar: lo mide.

---

## Qué trae este paquete

```
pieza-central/
  README.md                  ← este archivo
  INTEGRACION.md             ← los parches de código, listos para pegar
  renderSculpture.ts         ← el método completo, drop-in
  assets/
    world/installations/     ← los PNG (misma ruta que public/assets/)
  preview/
    pieza-central-sheet-v1.png
```

Los PNG van tal cual a `public/assets/world/installations/`.

---

## Escala y convenciones

Todo respeta el sistema que ya existe (`docs/LABOR_ART_DIRECTION_ASSETS.md`):

| Regla | Valor |
|---|---|
| Mapa | 48 px por metro |
| Escala de sprite en el mapa | `scale: 3` |
| Resolución de arte | **16 px lógicos por metro** |
| Luz | noroeste; sombra al sureste |
| Formato | PNG 1× con transparencia, bordes ajustados |
| Render | `image-rendering: pixelated` (ya activo) |

La paleta sale de los sprites existentes, sin colores nuevos: concreto
`#8a857b / #c9c4ba / #514d47`, madera `#a8845c / #523c26`, acero
`#8e9299 / #5f646b`, plata `#efece4 / #ded9cf`, tinta `#242320`,
sombra `rgba(23,23,20,.30)`.

---

## Los archivos

| Archivo | px | Origen | Capa | Bandera |
|---|---|---|---|---|
| `pieza-pedestal-v1.png` | 44×44 | 0.5, 1 | suelo | — (estado 00) |
| `pieza-base-madera-v1.png` | 36×22 | 0.5, 0.43 | `p.y + 1` | `pieza.baseInstalled` |
| `pieza-sombra-v1.png` | 44×44 | 0.5, 0.5 | `p.y + 0.5` | `pieza.metalInstalled` |
| `pieza-aguja-metal-v1.png` | 24×28 | 0.5, 1 | `p.y + 2` | `pieza.metalInstalled` |
| `pieza-marcas-plata-v1.png` | 36×22 | 0.5, 0.43 | `p.y + 3` | `pieza.detailInstalled` |
| `pieza-destello-v1.png` | 7×7 | 0.5, 0.5 | `p.y + 4` | `pieza.complete` |
| `icon-madera-v1.png` | 16×16 | — | HUD | — |
| `icon-metal-v1.png` | 16×16 | — | HUD | — |
| `icon-plata-v1.png` | 16×16 | — | HUD | — |

Extras para documentación y redes (no los carga el juego):
`pieza-estado-00..03-v1.png` (44×74) y `pieza-completa-v1.png`.

**Punto de anclaje único:** todo se posiciona sobre
`top = p.y - 23 * p.scale`, que es el centro de la cara superior del
plinto y también el centro del disco. El destello va en
`(p.x - 5 * scale, top - 26 * scale)`, la punta de la aguja.

---

## Los tres componentes

**01 · BASE DE MADERA — VETA · minijuego GATO · `pieza.baseInstalled`**
Disco de Ø 2.20 m armado con 12 duelas radiales de tzalam a testa vista,
ensambladas a media madera y flejadas con un anillo de acero. Las líneas
de cola quedan a la vista: son las horas. Aceite duro, sin barniz.

**02 · COMPONENTE DE METAL — MANNNO · minijuego CONECTA 4 · `pieza.metalInstalled`**
Aguja de solera de acero de 12 mm forjada en caliente: el filo inferior
recto y limpio a 20.2°, el cuerpo abierto a martillo en tres nervaduras.
Pátina de óxido estabilizada, cera negra. Entra a presión en el collar.

**03 · DETALLE EN PLATA — CONTRASTE · minijuego MEMORIA · `pieza.detailInstalled`**
Cuatro piezas de plata .925 a la cera perdida: el collar que recibe la
aguja y tres marcas de hora a ras de la madera, cada una grabada con la
seña de un taller y orientada a su puerta real. La cuarta cara, pulida a
espejo, va en la punta.

---

## Movimiento

| Qué | Cómo |
|---|---|
| Sombra | barre de −52° a +52° en 26 s, `Sine.easeInOut`, yoyo infinito |
| Destello | 3 frames cada ~6 s en la punta pulida; solo con la pieza completa |
| Instalar | el componente baja 12 px en 260 ms con rebote corto |

Una sola animación larga en el patio. Sin partículas de colores.

---

## Dos notas de producción

1. **El plinto adopta la huella que ya existe** (2.75 m ≈ 44 px), no los
   3.25 m del plano de obra, para que `pieza-pedestal-v1.png` sea
   reemplazo directo de `installation-base-v1.png` sin tocar medidas.

2. **Las marcas de plata se dibujan a 5×2 px** (≈ 30 cm aparentes) por
   legibilidad. En la pieza física son de 40 mm — a 16 px/m eso sería
   menos de un píxel. Es un ajuste de lectura, no un cambio de diseño.

---

## Qué NO cambia

Coordenadas, hotspots, joystick, HUD, minijuegos y banderas quedan
exactamente como están. Esto es reemplazo de arte más un estado nuevo de
sombra rotable. `missions.ts` no se toca.
