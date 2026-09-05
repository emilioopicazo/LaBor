# LA BOR — REAL MAP / TILED GEOMETRY GUIDE
## Rebuilding the overworld from the actual architectural plan

> The real plan is the spatial source of truth.
>
> The visual artwork may change repeatedly. The geometry should not.

---

# 1. Goal

Replace the current approximate rectangular-world interpretation with a faithful, editable map derived directly from:

```text
public/assets/reference/labor-master-plan.png
public/assets/reference/260823_TRAMA-layout.pdf
```

The overworld should read as the real La Bor property.

---

# 2. Do not redraw geometry from memory

Never position buildings because they “look about right.”

Instead:

1. import plan
2. calibrate
3. trace
4. name
5. export
6. render

---

# 3. Tiled project

Create:

```text
maps/
  labor.tiled-project
  labor-overworld.tmj
```

Asset export:

```text
public/maps/labor-overworld.tmj
```

Use an orthogonal map.

The game is top-down, not a true isometric tilemap.

---

# 4. Reference image layer

Add the plan as an image/reference layer.

Name:

```text
00_REFERENCE_PLAN
```

Lock it.

Do not render it in production.

The purpose is calibration and tracing.

---

# 5. Coordinate system

Use top-left as world origin:

```text
x → east
y → south
```

This matches normal 2D game coordinates.

Known site dimensions should calibrate the reference.

Do not assume the bounding rectangle itself is the property polygon.

Trace the actual irregular perimeter.

---

# 6. Suggested scale

Starting point:

```text
48 world pixels = 1 meter
```

This is only a recommendation.

After a first mobile playtest, scale may be adjusted globally, but the geometry must remain proportional.

---

# 7. Required object layers

Create these Tiled object layers.

## `PROPERTY_BOUNDARY`

One polygon:
```text
labor-property
```

This is the real perimeter.

Property:
```text
class = property-boundary
```

---

## `BUILDING_COLLISION`

One polygon / rectangle per real physical building footprint.

Objects:
```text
contraste
veta
mannino
pabellon-01
pabellon-02
pabellon-03
pabellon-04
nave-01
nave-02
nave-03
```

If the building shape is not actually rectangular, use a polygon.

Do not force it to a rectangle.

---

## `WALKABLE`

Polygons for:
- main courtyard
- Cobá entrance
- side circulation
- relevant outdoor passageways

These should reflect actual circulation.

Do not use “whole property minus buildings” as the only gameplay rule.

---

## `DOORS`

Use point objects.

Example:

```text
contraste-door
```

Properties:

```text
class = workshop-door
spaceId = contraste
sceneId = contraste-room
action = ENTRAR
radius = 72
```

Door point should sit on the actual courtyard-facing access.

---

## `SPAWNS`

Point objects:

```text
main-coba
return-contraste
return-veta
return-mannino
```

---

## `POI`

Point or rectangle objects:

```text
pieza-central
eventos-board
info-totem
```

Properties define:
- id
- action
- mission role
- radius

---

## `OBSTACLES`

Only real obstacles that should affect movement.

Examples:
- tree trunk
- heavy planter
- fixed sculpture base

Do not collide with every tiny decorative asset.

---

## `DEPTH_ANCHORS`

Optional points for complex props.

For most sprites:
```text
depth = sprite.y
```

For unusual items, use a dedicated anchor.

---

# 8. Art layers

Do not mix collision geometry with final art.

Recommended:

```text
ART_GROUND
ART_BACK
ART_BUILDINGS
ART_PROPS
ART_FRONT
```

The actual implementation may use Tiled image objects or Phaser sprites created from object data.

---

# 9. Main tree

The main tree is both:
- navigation landmark
- depth test
- visual identity

Represent it as:

```text
tree-main-base
tree-main-canopy
```

Collision:
- only trunk/base

Canopy:
- no hard collision
- depth above player when player walks under it

The player should be able to move around all sides.

---

# 10. Buildings are not interaction circles

Do not put a generic hotspot in the building center.

Interaction must happen at:
- door
- gate
- station
- relevant exterior face

This makes navigation spatially understandable.

---

# 11. Exterior fidelity vs interior gameplay

Important:

## Exterior
faithful to plan.

## Interior
separate gameplay room.

A 6 m workshop in reality does not need to feel tiny on mobile.

Its interior scene may use a larger logical canvas.

This is intentional and should not alter the exterior building footprint.

---

# 12. Map QA

Create a debug option:

```text
?mapdebug=1
```

It should render:
- reference plan at partial opacity
- traced boundary
- collision
- walkable polygons
- doors
- player collider
- POIs

This makes visual verification fast.

---

# 13. Geometry acceptance test

Before final artwork:

Overlay the real plan and digital collision geometry.

Check:

- outer perimeter
- Cobá entrance
- VETA west strip
- MANNINO portion
- Pabellón 04
- CONTRASTE
- main vegetation
- Pabellón 01/02/03
- Nave 01/02/03
- central open area

No major structure should be obviously shifted.

---

# 14. Pending physical clarification

Keep these editable until confirmed:

- exact division of the west strip between VETA / MANNINO / annex
- precise gate use and width
- exact entrances to resident workshops

Do not invent permanent geometry where the plan/reference is ambiguous.

---

# 15. Source-of-truth rule

Once the Tiled map is approved:

> **Do not duplicate building coordinates in `spaces.ts`.**

`spaces.ts` should describe content.

Tiled should describe location.

Example:

```ts
space.id = "contraste"
```

and the game finds:

```text
object.spaceId === "contraste"
```

This prevents map drift.
