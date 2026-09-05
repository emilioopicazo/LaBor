// ============================================================
// LA BOR — lector del mapa Tiled (public/maps/labor-overworld.tmj)
// Tiled describe DÓNDE está todo; spaces.ts describe QUÉ es. Este
// módulo convierte el JSON de Tiled en geometría tipada en px de mundo.
// ============================================================

export interface Vec {
  x: number
  y: number
}
export interface Rect {
  x: number
  y: number
  width: number
  height: number
}
export interface Circle {
  id: string
  x: number
  y: number
  r: number
}
export type Facing = "down" | "up" | "left" | "right"
export type WallSide = "n" | "s" | "e" | "w"

export interface BuildingDef {
  id: string
  spaceId: string
  label: string
  enterable: boolean
  points: Vec[]
  bounds: Rect
}
export interface DoorDef {
  id: string
  spaceId: string
  sceneId: string
  action: string
  radius: number
  x: number
  y: number
  facing: WallSide
}
export interface SpawnDef {
  id: string
  x: number
  y: number
  facing: Facing
}
export interface PoiDef {
  id: string
  x: number
  y: number
  radius: number
  action: string
  missionRole: string
  label: string
}
export interface PropDef {
  id: string
  sprite: string
  scale: number
  x: number
  y: number
  canopy: boolean
  missionAnchor?: string
  layer: string
}
export interface DepthAnchor {
  for: string
  x: number
  y: number
  offset: number
}
export interface OverworldMap {
  width: number
  height: number
  pxPerMeter: number
  boundary: Vec[]
  openings: Rect[]
  buildings: BuildingDef[]
  walkable: Vec[][]
  doors: DoorDef[]
  spawns: SpawnDef[]
  pois: PoiDef[]
  obstacles: Circle[]
  obstacleRects: Rect[]
  props: PropDef[]
  depthAnchors: DepthAnchor[]
  reference: { image: string; opacity: number } | null
  labels: { streetSouth: string; streetEast: string; neighborNorth: string }
}

// ---- tipos mínimos del formato JSON de Tiled --------------------------
interface TProp {
  name: string
  type: string
  value: unknown
}
interface TObject {
  id: number
  name: string
  type?: string
  class?: string
  x: number
  y: number
  width: number
  height: number
  polygon?: Vec[]
  point?: boolean
  ellipse?: boolean
  properties?: TProp[]
}
interface TLayer {
  name: string
  type: string
  objects?: TObject[]
  image?: string
  opacity?: number
  properties?: TProp[]
}
export interface TiledMapJson {
  width: number
  height: number
  tilewidth: number
  tileheight: number
  layers: TLayer[]
  properties?: TProp[]
}

type Props = Record<string, string | number | boolean>

function props(list?: TProp[]): Props {
  const out: Props = {}
  list?.forEach((p) => {
    out[p.name] = p.value as string | number | boolean
  })
  return out
}
const str = (p: Props, k: string, d = "") => (typeof p[k] === "string" ? (p[k] as string) : d)
const num = (p: Props, k: string, d = 0) => (typeof p[k] === "number" ? (p[k] as number) : d)
const bool = (p: Props, k: string, d = false) => (typeof p[k] === "boolean" ? (p[k] as boolean) : d)

function polygonPoints(o: TObject): Vec[] {
  if (o.polygon) return o.polygon.map((p) => ({ x: o.x + p.x, y: o.y + p.y }))
  return [
    { x: o.x, y: o.y },
    { x: o.x + o.width, y: o.y },
    { x: o.x + o.width, y: o.y + o.height },
    { x: o.x, y: o.y + o.height },
  ]
}

export function boundsOf(points: Vec[]): Rect {
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  points.forEach((p) => {
    minX = Math.min(minX, p.x)
    minY = Math.min(minY, p.y)
    maxX = Math.max(maxX, p.x)
    maxY = Math.max(maxY, p.y)
  })
  return { x: minX, y: minY, width: maxX - minX, height: maxY - minY }
}

const FACING_OF: Record<string, Facing> = { down: "down", up: "up", left: "left", right: "right" }

export function parseTiledMap(json: TiledMapJson): OverworldMap {
  const layers = new Map(json.layers.map((l) => [l.name, l]))
  const objs = (name: string) => layers.get(name)?.objects ?? []
  const mp = props(json.properties)

  const boundaryLayer = objs("PROPERTY_BOUNDARY")
  const boundaryObj = boundaryLayer.find((o) => (o.type ?? o.class) === "property-boundary")
  const boundary = boundaryObj ? polygonPoints(boundaryObj) : []
  const openings = boundaryLayer
    .filter((o) => (o.type ?? o.class) === "opening")
    .map((o) => ({ x: o.x, y: o.y, width: o.width, height: o.height }))

  const buildings: BuildingDef[] = objs("BUILDING_COLLISION").map((o) => {
    const p = props(o.properties)
    const points = polygonPoints(o)
    return {
      id: o.name,
      spaceId: str(p, "spaceId", o.name),
      label: str(p, "label", ""),
      enterable: bool(p, "enterable", true),
      points,
      bounds: boundsOf(points),
    }
  })

  const walkable = objs("WALKABLE").map(polygonPoints)

  const doors: DoorDef[] = objs("DOORS").map((o) => {
    const p = props(o.properties)
    return {
      id: o.name,
      spaceId: str(p, "spaceId"),
      sceneId: str(p, "sceneId"),
      action: str(p, "action", "ENTRAR"),
      radius: num(p, "radius", 72),
      x: o.x,
      y: o.y,
      facing: (str(p, "facing", "s") as WallSide) ?? "s",
    }
  })

  const spawns: SpawnDef[] = objs("SPAWNS").map((o) => {
    const p = props(o.properties)
    return { id: o.name, x: o.x, y: o.y, facing: FACING_OF[str(p, "facing", "down")] ?? "down" }
  })

  const pois: PoiDef[] = objs("POI").map((o) => {
    const p = props(o.properties)
    return {
      id: str(p, "id", o.name),
      x: o.point ? o.x : o.x + o.width / 2,
      y: o.point ? o.y : o.y + o.height / 2,
      radius: num(p, "radius", 96),
      action: str(p, "action", "VER"),
      missionRole: str(p, "missionRole", ""),
      label: str(p, "label", o.name.toUpperCase()),
    }
  })

  const obstacles: Circle[] = []
  const obstacleRects: Rect[] = []
  objs("OBSTACLES").forEach((o) => {
    if (o.ellipse) {
      obstacles.push({ id: o.name, x: o.x + o.width / 2, y: o.y + o.height / 2, r: Math.max(o.width, o.height) / 2 })
    } else if (o.polygon) {
      obstacleRects.push(boundsOf(polygonPoints(o)))
    } else {
      obstacleRects.push({ x: o.x, y: o.y, width: o.width, height: o.height })
    }
  })

  const propLayers = ["ART_BACK", "ART_PROPS", "ART_FRONT"]
  const propsOut: PropDef[] = []
  propLayers.forEach((name) => {
    objs(name).forEach((o) => {
      const p = props(o.properties)
      propsOut.push({
        id: o.name,
        sprite: str(p, "sprite"),
        scale: num(p, "scale", 3),
        x: o.x,
        y: o.y,
        canopy: bool(p, "canopy", false),
        missionAnchor: str(p, "missionAnchor") || undefined,
        layer: name,
      })
    })
  })

  const depthAnchors: DepthAnchor[] = objs("DEPTH_ANCHORS").map((o) => {
    const p = props(o.properties)
    return { for: str(p, "for", o.name), x: o.x, y: o.y, offset: num(p, "offset", 0) }
  })

  const ref = layers.get("00_REFERENCE_PLAN")
  const reference = ref?.image ? { image: ref.image.replace(/^\.\.\//, "/"), opacity: ref.opacity ?? 0.45 } : null

  return {
    width: json.width * json.tilewidth,
    height: json.height * json.tileheight,
    pxPerMeter: num(mp, "pxPerMeter", json.tilewidth),
    boundary,
    openings,
    buildings,
    walkable,
    doors,
    spawns,
    pois,
    obstacles,
    obstacleRects,
    props: propsOut,
    depthAnchors,
    reference,
    labels: {
      streetSouth: str(mp, "streetSouth", ""),
      streetEast: str(mp, "streetEast", ""),
      neighborNorth: str(mp, "neighborNorth", ""),
    },
  }
}
