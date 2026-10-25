// ============================================================
// LA BOR — trazado inicial del patio real → Tiled (labor-overworld.tmj)
//
// Todas las medidas están en METROS y salen del plano vectorial
// public/assets/reference/260823_TRAMA-layout.pdf (AutoCAD). Se
// extrajeron los segmentos del PDF (pdftocairo -svg) y se calibró la
// escala con la cota superior de 34.90 m (781.2 pt) → 22.384 pt/m.
// Origen = esquina superior-izquierda del rectángulo envolvente del
// predio (x → este, y → sur). Escala del juego: 48 px = 1 m.
//
// El TMJ generado es la FUENTE DE VERDAD editable en Tiled. Este
// script documenta el trazado inicial; si se edita el mapa en Tiled,
// no volver a ejecutarlo (o actualizar aquí las medidas).
//
//   node scripts/build-overworld-map.mjs
// ============================================================
import fs from "node:fs"
import path from "node:path"

const PX = 48 // px de mundo por metro
const px = (m) => Math.round(m * PX * 100) / 100
const P = (x, y) => ({ x: px(x), y: px(y) })

// ---- perímetro real (líneas exteriores del muro) --------------------
// Chaflán NO (0,0)→(7.93,4.65); muro norte y=4.65; muro este x=34.90
// con el INGRESO abierto entre y 24.80 y 29.90 (Calle 12 Sur); muro
// sur y=42.09 (Calle Cobá, sin abertura en el plano); muro oeste x=0
// con quiebre en (0,29.80)→(0.32,42.09).
const BOUNDARY = [
  [0, 0], [7.93, 4.65], [34.9, 4.65], [34.9, 42.09], [0.32, 42.09], [0, 29.8],
]

// ---- huellas de edificios (caras interiores medidas) ---------------
// Franja oeste: línea punteada del plano en x=5.50/5.65; división
// VETA/MANNNO punteada en y=17.60; quiebre del muro en y=29.80.
// interior: se entra sin cambiar de escena (la huella es caminable; los muros
// son rectángulos en OBSTACLES y el techo se vuelve transparente al entrar).
// construction: en obra (bloquea; albañiles trabajando afuera).
// group: varias huellas bajo un mismo techo (la nave es una sola, subdividida).
// heightM: altura visual para la perspectiva (fachadas).
const BUILDINGS = {
  veta: { name: "VETA", poly: [[0, 0], [7.93, 4.65], [5.65, 4.65], [5.65, 17.6], [0, 17.6]], heightM: 4 },
  mannno: { name: "MANNNO", poly: [[0, 17.6], [5.65, 17.6], [5.65, 29.8], [0, 29.8]], heightM: 4 },
  // Tramo sur de la franja (12.31 m): construido en el boceto del
  // plano maestro, sin uso confirmado. Bloquea, no se entra.
  "franja-sur": { name: "PRÓXIMAMENTE", poly: [[0, 29.8], [5.5, 29.8], [5.5, 42.09], [0.32, 42.09]], enterable: false, heightM: 3 },
  "pabellon-04": { name: "PABELLÓN 04", rect: [5.5, 4.65, 11.55, 11.65], interior: true, heightM: 3.5 },
  contraste: { name: "CONTRASTE", rect: [11.55, 4.65, 17.6, 11.65], heightM: 3.5 },
  "pabellon-01": { name: "PABELLÓN 01", rect: [22.9, 4.65, 34.9, 11.46], construction: true, heightM: 3.5 },
  "pabellon-02": { name: "PABELLÓN 02", rect: [22.9, 11.46, 34.9, 18.13], interior: true, heightM: 3.5 },
  "pabellon-03": { name: "PABELLÓN 03", rect: [27.9, 18.13, 34.9, 24.8], interior: true, heightM: 3.5 },
  "nave-03": { name: "NAVE 03", rect: [7.5, 29.9, 15.35, 42.09], interior: true, group: "nave", heightM: 7 },
  "nave-02": { name: "NAVE 02", rect: [15.35, 29.9, 25.05, 42.09], interior: true, group: "nave", heightM: 7 },
  "nave-01": { name: "NAVE 01", rect: [25.05, 29.9, 34.9, 42.09], interior: true, group: "nave", heightM: 7 },
}

// ---- muros de los interiores (rectángulos que bloquean; 0.3 m) ---------
// Cada muro puede tener huecos (puertas) por donde sí se pasa.
const WALL_T = 0.3
const GAP = 1.3 // ancho de puerta
function wallsOf(id) {
  const b = BUILDINGS[id]
  if (!b || !b.rect) return []
  const [x1, y1, x2, y2] = b.rect
  const seg = (name, [ax, ay, bx, by], gaps = []) => {
    // divide el muro en tramos saltando los huecos (gaps: coordenada a lo largo del muro)
    const horizontal = ay === by
    const start = horizontal ? ax : ay
    const end = horizontal ? bx : by
    const cuts = gaps.flatMap((g) => [g - GAP / 2, g + GAP / 2]).sort((a, b) => a - b)
    const pieces = []
    let cursor = start
    for (let i = 0; i < cuts.length; i += 2) {
      if (cuts[i] > cursor) pieces.push([cursor, cuts[i]])
      cursor = cuts[i + 1]
    }
    if (cursor < end) pieces.push([cursor, end])
    return pieces.map(([a, b], i) => ({ id: `${id}-wall-${name}-${i}`, rect: horizontal ? [a, ay - WALL_T / 2, b, ay + WALL_T / 2] : [ax - WALL_T / 2, a, ax + WALL_T / 2, b] }))
  }
  switch (id) {
    case "pabellon-04":
      return [...seg("n", [x1, y1, x2, y1]), ...seg("s", [x1, y2, x2, y2], [8.5]), ...seg("w", [x1, y1, x1, y2]), ...seg("e", [x2, y1, x2, y2])]
    case "pabellon-02":
      // norte compartido con P01 (bloquea solo); oeste puerta al patio; este salida a Calle 12 Sur; sur muro con P03 y patio
      return [...seg("w", [x1, y1, x1, y2], [14.8]), ...seg("e", [x2, y1, x2, y2], [14.8]), ...seg("s", [x1, y2, x2, y2])]
    case "pabellon-03":
      return [...seg("w", [x1, y1, x1, y2], [21.5]), ...seg("e", [x2, y1, x2, y2], [21.5]), ...seg("s", [x1, y2, x2, y2])]
    default:
      return []
  }
}
// la nave es una sola: perímetro con tres puertas al patio (sin muros internos: la subdivisión es visual)
const NAVE_RECT = [7.5, 29.9, 34.9, 42.09]
function naveWalls() {
  const [x1, y1, x2, y2] = NAVE_RECT
  const out = []
  const push = (name, a, b, horizontal, fixed, gaps = []) => {
    const cuts = gaps.flatMap((g) => [g - GAP / 2, g + GAP / 2]).sort((p, q) => p - q)
    let cursor = a
    let i = 0
    const pieces = []
    for (let k = 0; k < cuts.length; k += 2) {
      if (cuts[k] > cursor) pieces.push([cursor, cuts[k]])
      cursor = cuts[k + 1]
    }
    if (cursor < b) pieces.push([cursor, b])
    pieces.forEach(([p, q]) => out.push({ id: `nave-wall-${name}-${i++}`, rect: horizontal ? [p, fixed - WALL_T / 2, q, fixed + WALL_T / 2] : [fixed - WALL_T / 2, p, fixed + WALL_T / 2, q] }))
  }
  push("n", x1, x2, true, y1, [9.9, 17.9, 27.5])
  push("s", x1, x2, true, y2)
  push("w", y1, y2, false, x1)
  push("e", y1, y2, false, x2)
  return out
}
const INTERIOR_WALLS = [...wallsOf("pabellon-04"), ...wallsOf("pabellon-02"), ...wallsOf("pabellon-03"), ...naveWalls()]

// ---- salidas a la calle (huecos en el muro este, Calle 12 Sur) ----------
const STREET_EXITS = [
  { id: "pabellon-02-street", rect: [34.6, 14.8 - GAP / 2, 35.2, 14.8 + GAP / 2] },
  { id: "pabellon-03-street", rect: [34.6, 21.5 - GAP / 2, 35.2, 21.5 + GAP / 2] },
]

// ---- circulación --------------------------------------------------------
// Patio + pasillo del árbol + interiores de P04, P02, P03 y la nave +
// Calle 12 Sur completa (banqueta 1.7 m + carril 2.4 m, x 34.9–39.0).
// Un solo polígono sin huecos: rodea CONTRASTE, P01 (en obra) y los
// talleres de la franja oeste; los muros interiores van en OBSTACLES.
const STREET_X = 39.0
const WALKABLE = [
  [5.65, 4.65], [11.55, 4.65], [11.55, 11.65], [17.6, 11.65], [17.6, 4.8], [22.9, 4.8],
  [22.9, 11.46], [34.9, 11.46], [34.9, 4.65], [STREET_X, 4.65], [STREET_X, 42.09], [34.9, 42.09],
  [7.5, 42.09], [7.5, 29.9], [5.65, 29.9],
]

// ---- puertas (punto 0.4 m frente al muro que da al patio) ------------
// [spaceId, x, y, normal (hacia el patio), acción]
const DOORS = [
  ["veta", 6.05, 13.0, "e", "ENTRAR"],
  ["mannno", 6.05, 23.7, "e", "ENTRAR"],
  ["pabellon-04", 8.5, 12.05, "s", "VER"],
  ["contraste", 14.6, 12.05, "s", "ENTRAR"],
  ["pabellon-01", 22.5, 8.1, "w", "VER"],
  ["pabellon-02", 22.5, 14.8, "w", "VER"],
  ["pabellon-03", 27.5, 21.5, "w", "VER"],
  ["nave-03", 9.9, 29.5, "n", "VER"],
  ["nave-02", 17.9, 29.5, "n", "VER"],
  ["nave-01", 27.5, 29.5, "n", "VER"],
]
const NORMAL = { e: [1, 0], w: [-1, 0], n: [0, -1], s: [0, 1] }
const FACING = { e: "left", w: "right", n: "down", s: "up" } // hacia dónde mira el visitante al salir

// ---- árbol principal (símbolo del plano centrado en ~(19.0, 6.84)) ----
const TREE = { x: 19.2, y: 7.4, trunkR: 0.45, canopyR: 2.4 }

// ---- puntos de interés del patio ------------------------------------
const POIS = [
  { id: "pieza-central", x: 14.0, y: 20.0, r: 2.0, action: "VER", missionRole: "anchor", label: "LA HORA" },
  { id: "eventos-board", x: 20.5, y: 29.3, r: 1.6, action: "VER", missionRole: "", label: "EVENTOS" },
  { id: "info-totem", x: 30.6, y: 25.9, r: 1.6, action: "VER", missionRole: "", label: "INFORMACIÓN" },
  // puntos de información dentro de cada interior (abren la ficha del espacio)
  { id: "pabellon-04-info", x: 8.5, y: 8.4, r: 1.6, action: "INFO", missionRole: "", label: "PABELLÓN 04", spaceId: "pabellon-04" },
  { id: "pabellon-02-info", x: 26.0, y: 14.8, r: 1.6, action: "INFO", missionRole: "", label: "PABELLÓN 02", spaceId: "pabellon-02" },
  { id: "pabellon-03-info", x: 31.4, y: 21.5, r: 1.6, action: "INFO", missionRole: "", label: "PABELLÓN 03", spaceId: "pabellon-03" },
  { id: "nave-03-info", x: 11.4, y: 34.0, r: 1.6, action: "INFO", missionRole: "", label: "NAVE 03", spaceId: "nave-03" },
  { id: "nave-02-info", x: 20.2, y: 32.2, r: 1.6, action: "INFO", missionRole: "", label: "NAVE 02", spaceId: "nave-02" },
  { id: "nave-01-info", x: 30.0, y: 34.0, r: 1.6, action: "INFO", missionRole: "", label: "NAVE 01", spaceId: "nave-01" },
]

// ---- obstáculos reales (solo los que afectan el movimiento) ---------
const OBSTACLES = [
  { id: "tree-main-trunk", x: TREE.x, y: TREE.y, r: TREE.trunkR },
  { id: "pieza-pedestal", x: 14.0, y: 19.3, r: 0.95 },
  { id: "eventos-board", x: 20.5, y: 29.55, r: 0.7 },
  { id: "info-totem", x: 30.6, y: 26.2, r: 0.4 },
  { id: "wood-stack", x: 7.4, y: 16.4, r: 0.55 },
  { id: "pallets", x: 7.3, y: 27.2, r: 0.5 },
]

// ---- props visuales (ancla de suelo = pies del sprite) -------------
// sprite = clave en src/data/assets.ts · scale = px de mundo por px de arte
const PROPS = [
  { id: "tree-main-base", sprite: "treeMainBase", x: TREE.x, y: TREE.y + 0.35, scale: 6, layer: "ART_PROPS" },
  { id: "tree-main-canopy", sprite: "treeMainCanopy", x: TREE.x, y: TREE.y - 0.5, scale: 6, layer: "ART_FRONT", canopy: true },
  { id: "shrub-01", sprite: "shrub01", x: 17.1, y: 12.6, scale: 4, layer: "ART_PROPS" },
  { id: "shrub-02", sprite: "shrub02", x: 19.8, y: 13.8, scale: 4, layer: "ART_PROPS" },
  { id: "installation-base", sprite: "piezaPedestal", x: 14.0, y: 20.0, scale: 3, layer: "ART_PROPS", missionAnchor: "pieza-central" },
  { id: "events-board", sprite: "eventsBoard", x: 20.5, y: 29.7, scale: 3, layer: "ART_PROPS" },
  { id: "info-totem", sprite: "infoTotem", x: 30.6, y: 26.4, scale: 3, layer: "ART_PROPS" },
  { id: "wood-stack", sprite: "woodStack", x: 7.4, y: 16.7, scale: 3, layer: "ART_PROPS" },
  { id: "pallets", sprite: "palletStack", x: 7.3, y: 27.5, scale: 3, layer: "ART_PROPS" },
  { id: "planter-01", sprite: "planter", x: 12.3, y: 12.5, scale: 3, layer: "ART_PROPS" },
  { id: "planter-02", sprite: "planter", x: 25.2, y: 19.0, scale: 3, layer: "ART_PROPS" },
  { id: "water-tank", sprite: "waterTank", x: 24.2, y: 24.4, scale: 3, layer: "ART_PROPS" },
]

// ---- spawns ----------------------------------------------------------
const SPAWNS = [
  { id: "main-ingreso", x: 35.9, y: 27.35, facing: "left", note: "INGRESO real del plano (Calle 12 Sur)" },
  ...DOORS.map(([spaceId, x, y, n]) => ({
    id: `return-${spaceId}`,
    x: x + NORMAL[n][0] * 0.8,
    y: y + NORMAL[n][1] * 0.8,
    facing: FACING[n],
  })),
]

// ============================================================
// Serialización Tiled (JSON map format 1.10)
// ============================================================
let nextObjectId = 1
let nextLayerId = 1
const prop = (name, value) => ({
  name,
  type: typeof value === "number" ? (Number.isInteger(value) ? "int" : "float") : typeof value === "boolean" ? "bool" : "string",
  value,
})
const base = (name, type, x, y) => ({
  id: nextObjectId++,
  name,
  type,
  x: px(x),
  y: px(y),
  width: 0,
  height: 0,
  rotation: 0,
  visible: true,
})
const polygonObj = (name, type, poly, props = []) => {
  const [x0, y0] = poly[0]
  return {
    ...base(name, type, x0, y0),
    polygon: poly.map(([x, y]) => P(x - x0, y - y0)),
    properties: props,
  }
}
const rectObj = (name, type, [x1, y1, x2, y2], props = []) => ({
  ...base(name, type, x1, y1),
  width: px(x2 - x1),
  height: px(y2 - y1),
  properties: props,
})
const pointObj = (name, type, x, y, props = []) => ({ ...base(name, type, x, y), point: true, properties: props })
const ellipseObj = (name, type, x, y, r, props = []) => ({
  ...base(name, type, x - r, y - r),
  width: px(2 * r),
  height: px(2 * r),
  ellipse: true,
  properties: props,
})
const layer = (name, objects, extra = {}) => ({
  id: nextLayerId++,
  name,
  type: "objectgroup",
  draworder: "topdown",
  objects,
  opacity: 1,
  visible: true,
  x: 0,
  y: 0,
  ...extra,
})

const layers = [
  {
    id: nextLayerId++,
    name: "00_REFERENCE_PLAN",
    type: "imagelayer",
    image: "../assets/reference/labor-plan-48px.png",
    locked: true,
    opacity: 0.45,
    visible: true,
    x: 0,
    y: 0,
    properties: [prop("note", "Plano TRAMA rasterizado a 48 px/m. Solo calibración; no se dibuja en producción.")],
  },
  layer("PROPERTY_BOUNDARY", [
    polygonObj("labor-property", "property-boundary", BOUNDARY, [prop("note", "Perímetro real medido (líneas exteriores). Chaflán NO; INGRESO en muro este y 24.80–29.90.")]),
    // Abertura real del muro (portón INGRESO, 5.1 m, Calle 12 Sur)
    rectObj("ingreso-opening", "opening", [34.6, 24.8, 35.2, 29.9], [prop("label", "INGRESO"), prop("street", "CALLE 12 SUR")]),
    ...STREET_EXITS.map((e) => rectObj(e.id, "opening", e.rect, [prop("label", ""), prop("street", "CALLE 12 SUR")])),
  ]),
  layer(
    "BUILDING_COLLISION",
    Object.entries(BUILDINGS).map(([id, b]) => {
      const props = [prop("spaceId", id), prop("label", b.name), prop("enterable", b.enterable !== false), prop("interior", b.interior === true), prop("construction", b.construction === true), prop("group", b.group ?? ""), prop("heightM", b.heightM ?? 3.5)]
      return b.rect ? rectObj(id, "building", b.rect, props) : polygonObj(id, "building", b.poly, props)
    }),
  ),
  layer("WALKABLE", [polygonObj("patio", "walkable", WALKABLE, [prop("note", "Patio + pasillo del árbol + interiores (P04, P02, P03, nave) + Calle 12 Sur.")])]),
  layer(
    "DOORS",
    DOORS.map(([spaceId, x, y, n, action]) =>
      pointObj(`${spaceId}-door`, "workshop-door", x, y, [
        prop("spaceId", spaceId),
        prop("sceneId", `${spaceId}-room`),
        prop("action", action),
        prop("radius", 72),
        prop("facing", n),
      ]),
    ),
  ),
  layer(
    "SPAWNS",
    SPAWNS.map((s) => pointObj(s.id, "spawn", s.x, s.y, [prop("facing", s.facing), ...(s.note ? [prop("note", s.note)] : [])])),
  ),
  layer(
    "POI",
    POIS.map((p) =>
      pointObj(p.id, "poi", p.x, p.y, [
        prop("id", p.id),
        prop("action", p.action),
        prop("missionRole", p.missionRole),
        prop("radius", px(p.r)),
        prop("label", p.label),
        ...(p.spaceId ? [prop("spaceId", p.spaceId)] : []),
      ]),
    ),
  ),
  layer("OBSTACLES", [
    ...OBSTACLES.map((o) => ellipseObj(o.id, "obstacle", o.x, o.y, o.r)),
    ...INTERIOR_WALLS.map((w) => rectObj(w.id, "obstacle", w.rect, [prop("wall", true)])),
  ]),
  layer("DEPTH_ANCHORS", [
    pointObj("tree-main-canopy", "depth-anchor", TREE.x, TREE.y + 0.35, [prop("for", "tree-main-canopy"), prop("offset", 40)]),
  ]),
  layer("ART_GROUND", [], { properties: [prop("note", "Piso del patio: el renderer tapiza world-floor-patio dentro de WALKABLE.")] }),
  layer("ART_BACK", []),
  layer("ART_BUILDINGS", [], { properties: [prop("note", "Los edificios se dibujan desde BUILDING_COLLISION (techos/etiquetas).")] }),
  layer(
    "ART_PROPS",
    PROPS.filter((p) => p.layer === "ART_PROPS").map((p) =>
      pointObj(p.id, "prop", p.x, p.y, [prop("sprite", p.sprite), prop("scale", p.scale), ...(p.missionAnchor ? [prop("missionAnchor", p.missionAnchor)] : [])]),
    ),
  ),
  layer(
    "ART_FRONT",
    PROPS.filter((p) => p.layer === "ART_FRONT").map((p) =>
      pointObj(p.id, "prop", p.x, p.y, [prop("sprite", p.sprite), prop("scale", p.scale), prop("canopy", true)]),
    ),
  ),
]

const map = {
  compressionlevel: -1,
  height: 43,
  infinite: false,
  layers,
  nextlayerid: nextLayerId,
  nextobjectid: nextObjectId,
  orientation: "orthogonal",
  properties: [
    prop("pxPerMeter", PX),
    prop("source", "public/assets/reference/260823_TRAMA-layout.pdf (calibrado con la cota 34.90 m)"),
    prop("origin", "esquina NO del rectángulo envolvente del predio; x→este, y→sur"),
    prop("propertyWidthM", 34.9),
    prop("propertyHeightM", 42.09),
    prop("streetSouth", "CALLE COBÁ"),
    prop("streetEast", "CALLE 12 SUR"),
    prop("neighborNorth", "MALA CASA"),
  ],
  renderorder: "right-down",
  tiledversion: "1.10.2",
  tileheight: PX,
  tilesets: [],
  tilewidth: PX,
  type: "map",
  version: "1.10",
  width: 35,
}

const out = path.resolve("public/maps/labor-overworld.tmj")
fs.writeFileSync(out, JSON.stringify(map, null, 2) + "\n")
console.log("→", out, `${map.width * PX}×${map.height * PX}px`, "objetos:", nextObjectId - 1)

// ---- plano en metros para el intro (SVG que se dibuja solo) --------------
// Misma fuente de verdad que el mapa; React no necesita el TMJ para pintarlo.
{
  const planOut = path.resolve("src/data/plan.generated.ts")
  const polyOf = (b) => (b.poly ? b.poly : [[b.rect[0], b.rect[1]], [b.rect[2], b.rect[1]], [b.rect[2], b.rect[3]], [b.rect[0], b.rect[3]]])
  const plan = {
    boundary: BOUNDARY,
    streetX: STREET_X,
    ingreso: { x: 34.9, y: 27.35 },
    tree: { x: TREE.x, y: TREE.y, r: TREE.canopyR },
    buildings: Object.entries(BUILDINGS).map(([id, b]) => ({ id, label: b.name, poly: polyOf(b), interior: b.interior === true, construction: b.construction === true, group: b.group ?? "", enterable: b.enterable !== false })),
  }
  const ts = `// GENERADO por scripts/build-overworld-map.mjs — no editar a mano.\n// Plano del predio en metros (para el intro). Fuente de verdad: el generador.\nexport interface PlanBuilding {\n  id: string\n  label: string\n  poly: Array<[number, number]>\n  interior: boolean\n  construction: boolean\n  group: string\n  enterable: boolean\n}\nexport const PLAN = ${JSON.stringify(plan, null, 2)} as const satisfies {\n  boundary: ReadonlyArray<readonly [number, number]>\n  streetX: number\n  ingreso: { x: number; y: number }\n  tree: { x: number; y: number; r: number }\n  buildings: ReadonlyArray<PlanBuilding>\n}\n`
  fs.writeFileSync(planOut, ts)
  console.log(`→ ${planOut}`)
}
