# LA BOR — PLAYABILITY & MOBILE REBUILD
## Source of truth for the next gameplay-first iteration

> **Priority order:** playability → spatial fidelity → mobile controls → camera → interaction clarity → gameplay systems → art polish.
>
> The current prototype already proves the concept. The next iteration must make it **feel good to play**.

---

# 0. Executive decision

The current React + SVG prototype should no longer be treated as the final gameplay engine.

It was useful to prove:

- full-screen exploration
- character movement
- hotspots
- workshop scenes
- overlays
- mission logic
- environmental animation

But La Bor is now becoming a real 2D game-like experience with:

- a map that must respect the real property
- mobile-first movement
- multiple workshop rooms
- sprite animation
- minigames
- mission state
- avatar selection
- depth sorting
- camera behaviors
- repeated gameplay

At this point, the simplest maintainable structure is:

```text
REACT / TYPESCRIPT / VITE
        +
      PHASER
        +
       TILED
```

## Responsibility split

### React
Use for:
- intro
- avatar/profile selector
- editorial overlays
- menus
- resident information
- contact
- mission summary
- settings
- accessibility / fallback UI

### Phaser
Use for:
- player
- world
- mobile input
- camera
- collisions
- scene transitions
- depth sorting
- sprite animations
- interaction zones
- workshop rooms
- minigames or embedded gameplay scenes

### Tiled
Use as the editable spatial source of truth for:
- actual property boundary
- building footprints
- walkable polygons
- collision areas
- entrances
- spawn points
- hotspots
- props
- depth anchors
- mission locations

Do not recreate the entire marketing/interface layer in Phaser.

Do not throw away React.

---

# 1. Why playability currently feels weak

The current implementation has accumulated several systems inside a custom world engine:

- manual `requestAnimationFrame`
- manual camera smoothing
- custom screen/world coordinate conversion
- custom pointer state
- tap-to-walk
- floating joystick
- manual path finding
- manual scene switching
- manual depth indexes
- SVG world geometry

This is technically workable, but every new gameplay feature now adds more custom engine work.

The main spatial issue is more important:

## Current walkable world is fundamentally too generic

The current `WALKABLE_AREA` is effectively the entire rectangular interior of the property, while buildings are treated as blocked rectangles.

That means the game does not truly understand the shape and circulation of the real site.

The property should instead be traced from the real plan.

---

# 2. Non-negotiable product principles

## 2.1 The real property must read immediately

The player should understand within seconds:

- where Cobá is
- where the entrance is
- where the central patio is
- where the large tree is
- where CONTRASTE is
- where VETA is
- where MANNINO / herrería is
- where the available pavilions are
- where the naves are

This should be achieved spatially, not through a giant minimap or excessive labels.

## 2.2 Exterior = real scale

The overworld should preserve the real relative dimensions and perimeter of the property.

Do not arbitrarily enlarge one exterior workshop footprint because it is easier visually.

## 2.3 Interiors = gameplay scale

Once the player enters a workshop, that workshop can become a separate scene that is intentionally larger and easier to navigate.

This solves the conflict between:

> architectural accuracy

and:

> good gameplay.

The exterior tells the truth.

The interior creates room to play.

## 2.4 Mobile is the primary gameplay test

Desktop may remain richer, but every gameplay decision must first work on:

```text
360 × 800
390 × 844
393 × 852
430 × 932
```

Also test landscape, but do not require it.

---

# 3. Real-map rebuild

Use the existing files:

```text
public/assets/reference/labor-master-plan.png
public/assets/reference/260823_TRAMA-layout.pdf
```

as the spatial source.

Do **not** continue deriving geometry from the old 1280×1160 design mockup.

## Required process

1. Open the real plan as a locked background reference.
2. Calibrate scale from known dimensions.
3. Trace the exact outer property polygon.
4. Trace every building footprint.
5. Trace actual exterior circulation.
6. Mark doors / access points.
7. Mark vegetation and real physical obstacles.
8. Export the geometry separately from artwork.

---

# 4. Use Tiled as the map authoring tool

Create:

```text
public/maps/labor-overworld.tmj
```

Recommended Tiled layers:

```text
REFERENCE
  plan-image

ART_BACKGROUND
ART_GROUND
ART_BUILDINGS
ART_PROPS_BACK

COLLISION
  property-boundary
  buildings
  hard-obstacles

WALKABLE
  courtyard
  entrance
  corridors

DOORS
  contraste
  veta
  mannino
  pabellones
  naves

POI
  pieza-central
  eventos
  info
  future-points

SPAWN
  main
  mission-return-points

DEPTH
  trees
  canopies
  foreground-props

ART_PROPS_FRONT
```

The exact renderer can change, but these semantic layers should stay.

---

# 5. Coordinate philosophy

Do not use random magic coordinates spread through TypeScript.

The map file should own positions.

Use TypeScript to interpret those positions.

Example object property:

```text
name: contraste-door
class: workshop-door
properties:
  spaceId = contraste
  sceneId = contraste-room
  action = ENTRAR
```

Example collision object:

```text
name: main-tree-trunk
class: obstacle
```

Example mission POI:

```text
name: central-piece
class: mission-anchor
properties:
  mission = pieza-central
```

---

# 6. Scale

Use a consistent world scale derived from the real plan.

A practical starting point is approximately:

```text
48 world px = 1 real meter
```

This gives a roughly 1.7k × 1.8k world for a ~35 × 37 m property.

The exact scale is less important than:

- real proportionality
- consistent collisions
- readable character scale
- comfortable camera framing

Do not use different scales for different exterior buildings.

---

# 7. Gameplay clearance

Architectural accuracy should not create frustrating movement.

## Exterior

Maintain real building footprints.

For interactive approach areas:
- avoid decorative collision clutter
- keep door approach zones generous
- interaction radius can be larger than the literal door

Suggested:
- minimum comfortable route: ~1.4 m
- primary circulation: preferably ~2 m or more
- door interaction zone: ~1.2–1.8 m wide

## Interior workshop scenes

Make paths significantly more generous.

The player should not constantly scrape furniture.

---

# 8. Mobile controls — recommended final scheme

Use two-handed mobile game ergonomics.

## Left thumb = movement

Use a **dynamic floating analog stick** only in the left interaction zone.

Recommended active region:

```text
left 45–50% of the screen
bottom / middle area
```

The joystick appears at the initial finger contact.

Why:
- user does not have to find a fixed control
- movement remains analog
- right side stays free for interaction
- gestures do not fight the action button

The joystick should:
- normalize to `[-1, 1]`
- have a dead zone
- allow slow movement with small displacement
- disappear on release
- cancel any tap-to-walk target

## Right thumb = contextual action

Use ONE primary action button.

Do not permanently label it `ENTRAR`.

Its label changes based on context:

```text
ENTRAR
JUGAR
USAR
VER
HABLAR
INSTALAR
```

When nothing is nearby:
- button can disappear
- or be inactive / minimal

This is clearer than “enter nearest space.”

## Tap-to-walk

Keep tap-to-walk as a secondary convenience, not the only system.

Important:
- tapping an interactive object must never also move the player
- dragging to control movement must never activate a hotspot

---

# 9. Mobile input conflict rules

Priority:

```text
1. UI / action buttons
2. interactive world objects
3. joystick gesture
4. tap-to-walk ground
```

Any pointer that begins on UI must never reach the game-world movement handler.

Any pointer that begins on an interactable object must not become a movement tap.

Only the left-side gameplay zone may create a floating joystick.

---

# 10. Camera — the biggest feel improvement

Stop keeping the character mechanically centered at all times.

Use Phaser camera follow with:

- smooth lerp
- camera bounds
- deadzone
- integer pixel rounding where pixel art requires it

## Recommended behavior

### Overworld
- follow player
- deadzone approximately 30–40% of viewport width
- deadzone approximately 22–30% of viewport height
- low follow lerp
- do not move camera for every tiny step

This makes the world feel more stable.

### Workshop room
- slightly closer zoom
- smaller deadzone
- focus more on interaction stations

### Interaction
When action is activated:
- subtle focus toward object
- zoom in slightly
- freeze or reduce player control as needed

When leaving:
- smooth zoom back out

No aggressive cinematic movement.

---

# 11. Mobile zoom

Do not calculate mobile zoom primarily by trying to fit the entire world.

A phone should show a **useful local area**, not the whole property.

The user should move through the place.

Suggested design target:

- player clearly visible
- nearest workshop / landmark visible
- enough surrounding context to orient
- no giant empty strip
- no tiny buildings

The map can be almost square while the screen is tall; the camera should embrace that rather than trying to show everything.

---

# 12. HUD reduction

The current mobile experience has too many persistent pieces competing for space.

Final mobile HUD should be approximately:

## Top left
Small avatar/profile chip.

## Top center / below safe area
Current mission only when a mission is active.

Example:

```text
LA PIEZA
2 / 4 · METAL
```

## Top right
Menu.

## Bottom left
Floating joystick only while touched.

## Bottom right
Context action.

Everything else becomes temporary:

- rewards → toast then disappear
- oficio points → profile or mission summary
- tutorials → disappear after first use
- debug → debug mode only

---

# 13. Player collision

Do not collide using the entire sprite rectangle.

Use a small feet/body collider.

Example principle:

```text
visual sprite = larger
collision body = small ellipse / rectangle around feet
```

This makes moving close to walls, tables and trees feel much better.

---

# 14. Movement feel

Target:
- responsive start
- responsive stop
- no sliding after input release
- analog speed from joystick
- diagonal speed normalized
- smooth wall sliding

Avoid:
- acceleration that feels “floaty”
- huge inertia
- character snagging on corners
- accidental auto-pathing

For a site exploration experience, direct movement is preferable.

---

# 15. Pathfinding

Do not make A* a requirement for normal joystick movement.

For tap-to-walk:
- simple navigation can be used
- if necessary, use a light path/grid system

But primary mobile gameplay should remain direct manual control.

This removes a large class of “why did the character walk there?” frustrations.

---

# 16. Depth

Use a ground-anchor rule:

```text
depth = feetY
```

For props:
```text
depth = groundAnchorY
```

Split large assets when necessary:

```text
tree-base
tree-canopy
```

This allows:
- walking under trees
- passing behind furniture
- clear spatial layering

---

# 17. Animation

World animation should contribute to feel without distracting from movement.

Keep:
- tree breeze
- subtle leaves
- occasional workshop sparks
- slow fan
- hanging cable
- small ambient fauna if performance allows

Disable / simplify on:
- reduced motion
- low-power mode if needed

---

# 18. Performance targets

## Mobile
Aim:
- 60 FPS on modern phones
- stable 30+ FPS on older devices

Gameplay first.

Do not let huge image assets ruin input responsiveness.

## Asset strategy
- sprite atlases
- WebP for large artwork
- small PNG for pixel sprites where needed
- lazy-load workshop interiors when possible
- destroy/unload unnecessary scene resources

---

# 19. Loading

Do not load every future workshop and every minigame before entering the world.

Initial bundle should prioritize:

```text
player
overworld
UI
first mission metadata
```

Workshop scenes can preload intelligently after entry.

---

# 20. Accessibility / fallback

Keep a small menu that allows direct access to information.

Important distinction:

```text
GAMEPLAY = explore the world
FALLBACK = access information without playing
```

The fallback should not compromise the gameplay layout.

---

# 21. Playability acceptance criteria

Do not call this phase finished until:

### Movement
- player can begin moving within 2–3 seconds of entering
- joystick appears where thumb lands in allowed zone
- no accidental movement when pressing UI
- diagonal movement is normalized
- player does not get stuck on building corners
- player can comfortably circle the main tree

### Camera
- no jitter
- no frantic re-centering
- no empty-space exposure beyond property bounds
- orientation is understandable on a 390×844 screen

### Map
- property perimeter reads clearly
- major buildings match real relative placement
- courtyard is obvious
- Cobá entry is obvious
- workshop doors are logical
- real plan and digital map can be visually overlaid without major mismatch

### Interaction
- the correct action appears near the correct object
- no “nearest space” surprises
- action button always describes what will happen

### UI
- no control overlaps with safe areas
- no persistent clutter obscures the world
- user can play one-handed in a basic way, two-handed comfortably

---

# 22. Playtest protocol

Test on:

```text
360 × 800
390 × 844
393 × 852
430 × 932
844 × 390 landscape
932 × 430 landscape
```

For each viewport perform:

1. enter
2. select avatar
3. move from Cobá to tree
4. circle tree
5. approach CONTRASTE
6. enter
7. exit
8. approach VETA
9. open mission
10. start a minigame
11. return to patio
12. restart mission

Record:
- accidental taps
- stuck states
- camera confusion
- UI collisions
- unclear interactions

---

# 23. Migration phases

## Phase P0 — freeze feature growth
Do not add more art polish yet.

## Phase P1 — Phaser shell
Embed a Phaser game canvas inside the existing React app.

Preserve React intro / overlays.

## Phase P2 — Tiled real map
Trace real plan and replace hardcoded overworld geometry.

## Phase P3 — controls + camera
Mobile joystick, action button, deadzone camera, collisions.

This phase must feel excellent before continuing.

## Phase P4 — avatar selector
5 cosmetics, sprite sheets, session profile.

## Phase P5 — mission state
Fresh mission runs + reset architecture.

## Phase P6 — real minigames
Connect Four, Tic-Tac-Toe, Memory.

## Phase P7 — art swap
Only after the world is fun to control.

---

# 24. Technical north star

The next version succeeds if a user can open La Bor on a phone, move around immediately and think:

> **“This feels like a small real game.”**

before noticing any particular texture, render or visual effect.

Playability wins.
