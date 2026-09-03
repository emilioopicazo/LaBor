# LA BOR — DIGITAL WORKSHOP EXPERIENCE

> **Master development handoff / V0**
>
> Core principle: **“No navegar la página. Recorrer el taller.”**
>
> This document is the source of truth for the first interactive prototype of La Bor.

---

## 0. PROJECT INTENT

We are building an experimental digital experience for a real physical creative workshop complex called:

# LA BOR — TALLERES

This is **not** intended to be a conventional website.

The physical architecture of La Bor becomes the primary interface.

The user should feel like they are **entering, walking through and discovering the real workshop**, rather than navigating standard website pages.

The first prototype must remain:

- simple
- lightweight
- editable
- visually strong
- achievable quickly
- easy to iterate

The goal is **not** to build a sophisticated videogame.

The goal is to make a website **behave like a simple point-and-click exploration game**.

Think:

- Club Penguin movement logic
- Gather-style spatial browsing
- architectural model
- experimental editorial website
- industrial / brutalist art direction

The desired reaction is:

> “The website is the workshop.”

Not:

> “Nice landing page.”

And not:

> “They built a videogame.”

---

# 1. MASTER CREATIVE PRINCIPLE

At every design and engineering decision, ask:

> **Does this make the user feel like they are exploring La Bor?**

If the answer is no, simplify.

Avoid drifting toward:

- SaaS
- agency website
- portfolio template
- corporate site
- generic landing page
- conventional navigation

The workshop itself is the information architecture.

- courtyard = navigation
- workshops = content
- doors = links
- walking = browsing
- exploration = discovery

---

# 2. FIRST ACTION — INSPECT THE REPOSITORY

Before changing anything:

1. Inspect the entire repository.
2. Understand the current framework.
3. Identify routing.
4. Identify package manager.
5. Review installed dependencies.
6. Review styling approach.
7. Review existing components.
8. Review asset structure.
9. Confirm the build/deployment environment.

Do **not** rebuild working infrastructure unnecessarily.

Do **not** introduce a major framework migration.

If the project already uses React / Vite / Next / TypeScript or a similarly appropriate stack, preserve it.

If Framer Motion is already installed, reuse it.

If React already exists, stay in React.

---

# 3. TECHNICAL DIRECTION FOR V0

For this prototype, prefer:

# React + TypeScript + SVG + CSS

Do not introduce a full game engine unless the existing repository already has one and using it is clearly simpler.

Avoid for V0:

- Three.js
- React Three Fiber
- Babylon
- Blender pipelines
- complex WebGL
- multiplayer
- physics engines
- complex pathfinding
- tilemap editors
- game networking

The experience should **look and feel spatial/game-like**, while the implementation stays simple.

SVG is preferred because it gives us:

- scalable architecture
- editable coordinates
- responsive rendering
- clickable regions
- easy labels
- lightweight 2.5D geometry
- easy replacement later with custom artwork

---

# 4. MASTER ARCHITECTURAL REFERENCE

A real site plan of La Bor exists and should be treated as the **master spatial reference**.

Recommended repository location:

```text
/public/assets/reference/labor-master-plan.png
```

If the image is not yet in that path, place it there before final visual calibration.

Important:

The reference image is for **spatial relationships only**.

Do **not** reproduce:

- measurement annotations
- summary panel
- rental-layout graphic style
- drafting labels as-is

Reconstruct the property as an intentional digital world.

---


# 4A. OFFICIAL GOOGLE MAPS LOCATION

La Bor already has a registered Google Maps location.

Official reference point:

```text
Name: Labor / La Bor
Latitude: 20.2061954
Longitude: -87.4752482
Location context: Tulum, Quintana Roo, Mexico
```

Google Maps reference:

```text
https://www.google.com/maps/place/Labor/@20.2061442,-87.4755593,89m/data=!3m1!1e3!4m7!3m6!1s0x8f4fd7ca8fa0a6b7:0x1ebfd8aea9ea8917!4b1!8m2!3d20.2061954!4d-87.4752482!16s%2Fg%2F11nvsd9qgj
```

For V0, this location is **metadata only**.

Do not use GPS coordinates to redefine the internal interactive map geometry.

The architectural plan remains the source of truth for spatial relationships inside the digital world.

This location should simply be retained for future use such as:

- `CÓMO LLEGAR`
- Google Maps deep link
- contact overlay
- location metadata / SEO
- future real-world orientation features
- future connection between digital map and physical property

Do not add a visible Google Map embed to V0 unless explicitly requested.

---

# 5. REAL-WORLD LAYOUT

The map currently contains:

## Left side

- VETA
- MANNINO

## Upper-left

- PABELLÓN 04
- CONTRASTE ATELIER

## Upper-center

- garden / trees / vegetation

## Upper-right

- PABELLÓN 01
- PABELLÓN 02

## Mid-right

- PABELLÓN 03

## Bottom

- NAVE 03
- NAVE 02
- NAVE 01

## Center

- large open courtyard / explanada / common space

## Main narrative entry

- CALLE COBÁ from the bottom

## Secondary orientation

- MALA CASA toward the top

The **central courtyard** is the main exploration/navigation space.

The buildings form the perimeter around it.

---

# 6. EXPERIENCE FLOW

The first complete user journey should be:

```text
OPEN SITE
↓
LA BOR
↓
ENTRAR
↓
SHORT ENTRANCE TRANSITION
↓
COURTYARD REVEAL
↓
VISITOR SPAWNS FROM COBÁ
↓
CLICK PARA CAMINAR
↓
USER CLICKS FLOOR
↓
CHARACTER WALKS
↓
CAMERA FOLLOWS
↓
USER DISCOVERS BUILDINGS / TREE / OBJECTS
↓
USER APPROACHES CONTRASTE
↓
CONTRASTE LABEL APPEARS
↓
USER OPENS IT
↓
EDITORIAL OVERLAY
↓
CLOSE
↓
CONTINUE EXPLORING
```

This loop is the product.

---

# 7. ENTRANCE SCREEN

When the site loads, show a minimal fullscreen composition.

Suggested content:

```text
LA BOR
TALLERES

[ ENTRAR ]

TULUM, QROO.
```

Rules:

- no paragraph
- no traditional nav bar
- no marketing headline
- no “about us”
- no feature list
- no generic hero section

The user should feel like they are standing outside.

---

# 8. ENTRANCE TRANSITION

When the user clicks `ENTRAR`, use a short transition that communicates physically entering the workshop.

Possible treatments:

- industrial gate opens
- two panels separate
- rectangular mask reveal
- brutalist wipe
- fade through doorway
- lights turn on

Target duration:

**600–1200ms**

Keep it lightweight.

No long intro cinematic.

---

# 9. MAIN WORLD

After entering, the viewport becomes a full-screen spatial interface.

There should be no normal browser scrolling during exploration.

The user sees a stylized architectural reconstruction of La Bor.

Do not aim for photorealism.

The desired aesthetic is:

> **architectural model × point-and-click game × brutalist editorial interface**

---

# 10. VISUAL DIRECTION

The environment should feel:

- raw
- industrial
- architectural
- editorial
- brutalist
- creative
- unfinished
- tactile
- slightly underground

Primary palette:

- dirty white
- off-white
- concrete gray
- medium gray
- charcoal
- black

Possible restrained accents:

- oxidized metal
- rust
- muted brown
- desaturated vegetation green

Avoid:

- colorful videogame palette
- neon
- glassmorphism
- gradients
- rounded SaaS cards
- giant glowing interaction markers

Club Penguin is an **interaction reference only**, not an aesthetic reference.

---

# 11. WORLD COORDINATE SYSTEM

Use a logical coordinate system independent of viewport size.

Starting point:

```ts
WORLD_WIDTH = 2400
WORLD_HEIGHT = 1600
```

All architecture, hotspots, player positions and obstacles should use world coordinates.

The camera determines what portion of the world is visible.

---

# 12. INITIAL MAP GEOMETRY

These dimensions are approximate starting coordinates.

Preserve **relative positioning**, not millimeter accuracy.

## PABELLÓN 04

```ts
x: 360
y: 150
width: 350
height: 300
```

Status:

```text
available / future resident
```

---

## CONTRASTE ATELIER

```ts
x: 730
y: 150
width: 300
height: 300
```

Content:

```text
CONTRASTE ATELIER
Joyería / Producción / Talleres
```

This is an important active resident.

---

## LANDSCAPE / TREES

Approximate zone:

```ts
x: 1050
y: 200
width: 300
height: 380
```

Create:

- 1 major tree
- 2–3 smaller plants / trees

The tree is a major orientation landmark.

---

## PABELLÓN 01

```ts
x: 1450
y: 150
width: 550
height: 300
```

---

## PABELLÓN 02

```ts
x: 1450
y: 470
width: 550
height: 300
```

---

## PABELLÓN 03

```ts
x: 1700
y: 790
width: 300
height: 300
```

---

## VETA

Long vertical structure on the left.

```ts
x: 120
y: 180
width: 250
height: 720
```

Content:

```text
VETA
Carpintería / Diseño / Producción
```

---

## MANNINO

Approximate interaction region:

```ts
x: 245
y: 810
```

This can initially be represented as a smaller branded space / hotspot inside the left structure.

Do not overcomplicate its architecture in V0.

---

## NAVE 03

```ts
x: 400
y: 1120
width: 420
height: 400
```

---

## NAVE 02

```ts
x: 840
y: 1120
width: 500
height: 400
```

---

## NAVE 01

```ts
x: 1360
y: 1120
width: 640
height: 400
```

---

# 13. CENTRAL COURTYARD

The courtyard is the primary walkable space.

Approximate conceptual bounds:

```text
x = 380 → 2000
y = 470 → 1100
```

Do not make it a simple rectangular collider.

Use an irregular polygon that follows the real site.

Starting approximation:

```ts
const WALKABLE_AREA = [
  [380, 470],
  [1030, 470],
  [1030, 570],
  [1400, 570],
  [1400, 790],
  [1680, 790],
  [1680, 1080],
  [2000, 1080],
  [2000, 1100],
  [380, 1100],
]
```

Adjust visually after rendering.

---

# 14. PLAYER START POSITION

The visitor enters from **CALLE COBÁ**.

Initial spawn:

```ts
x: 1180
y: 1070
```

Narrative:

```text
COBÁ
↓
ENTRANCE
↓
LA BOR COURTYARD
```

---

# 15. PLAYER CHARACTER

For V0, use a deliberately simple avatar.

Acceptable:

- monochrome silhouette
- minimal illustrated person
- geometric human figure
- simple SVG visitor

Do not spend significant time on character illustration.

It needs to read as a human scale reference inside the architecture.

Suggested appearance:

- black / charcoal
- small circular head
- simplified body
- simple legs
- subtle ellipse shadow

---

# 16. MOVEMENT

Primary interaction:

# CLICK / TAP TO WALK

Desktop:

- click any valid ground position
- player walks there

Mobile:

- tap valid ground
- player walks there

Optional secondary controls:

- WASD
- arrow keys

Keyboard controls are secondary.

The experience must work for someone who has never played a videogame.

---

# 17. MOVEMENT LOGIC

Calculate:

- current position
- target position
- distance
- direction
- delta time

Suggested starting speed:

```ts
PLAYER_SPEED = 300
```

Units:

```text
world pixels / second
```

Do not teleport.

Do not overshoot target.

Allow repeated clicks to update destination naturally.

---

# 18. WALKABLE VALIDATION

Implement:

```ts
isPointInsideWalkableArea(x, y)
```

If target is invalid:

- ignore the click

This is acceptable for V0.

Later we can snap to nearest valid point if necessary.

Trees may have small exclusion zones.

---

# 19. NO COMPLEX COLLISION SYSTEM

Do not model collision for every table, wall and object.

Architecture + walkable polygon should do most of the work.

Use simple obstacle circles/rectangles only where necessary.

Example:

```ts
treeObstacle = {
  x: 1120,
  y: 440,
  radius: 70
}
```

---

# 20. FAKE 2.5D DEPTH

Player scale should change subtly with vertical position.

When player moves toward the top/back:

- smaller

When player moves toward the bottom/front:

- larger

Example:

```ts
PLAYER_SCALE_MIN = 0.68
PLAYER_SCALE_MAX = 1.0
```

Mapping:

```text
y ≈ 400  -> 0.68
y ≈ 1100 -> 1.00
```

Clamp values.

Keep the effect subtle.

---

# 21. PLAYER SHADOW

Add a small ellipse under the visitor.

Suggested:

```text
opacity: 0.15–0.25
```

It should scale subtly with player.

This will help tremendously with perceived depth.

---

# 22. CAMERA

Create a camera system.

The world is larger than the viewport.

The camera should follow the player smoothly.

Do not lock the player perfectly in the center.

Suggested:

```ts
CAMERA_LERP = 0.08
```

Clamp camera to world boundaries.

Do not expose empty space outside the world.

---

# 23. INITIAL CAMERA REVEAL

On entering:

1. show slightly wider courtyard context
2. pause very briefly
3. ease toward the player/spawn

Keep total reveal around 1 second.

This creates a sense of arrival without becoming cinematic.

---

# 24. CAMERA ZOOM

Desktop starting range:

```text
0.75–0.90
```

Adjust based on viewport dimensions.

Mobile:

slightly closer.

The user should still understand where they are.

---

# 25. HOTSPOTS

Buildings are accessed through interaction points at their courtyard-facing edges / doors.

The visitor does not physically enter interiors in V0.

When the visitor approaches a hotspot, display a subtle label.

Example:

```text
CONTRASTE
+
```

or

```text
CONTRASTE
VER ↗
```

Avoid gaming language like:

```text
PRESS E TO ENTER
```

---

# 26. INITIAL INTERACTION POINTS

Use these as starting estimates.

## CONTRASTE

```ts
x: 880
y: 495
```

## PABELLÓN 04

```ts
x: 540
y: 500
```

## VETA

```ts
x: 390
y: 650
```

## MANNINO

```ts
x: 390
y: 860
```

## PABELLÓN 01

```ts
x: 1450
y: 450
```

## PABELLÓN 02

```ts
x: 1450
y: 660
```

## PABELLÓN 03

```ts
x: 1660
y: 910
```

## NAVE 03

```ts
x: 610
y: 1090
```

## NAVE 02

```ts
x: 1090
y: 1090
```

## NAVE 01

```ts
x: 1610
y: 1090
```

Adjust after visual inspection.

---

# 27. DATA-DRIVEN SPACES

Create a central data file:

```text
src/data/spaces.ts
```

Suggested interface:

```ts
export interface WorkshopSpace {
  id: string
  name: string
  number?: string
  subtitle?: string
  description?: string

  buildingRect?: {
    x: number
    y: number
    width: number
    height: number
  }

  interactionPoint: {
    x: number
    y: number
  }

  interactionRadius: number

  type:
    | "resident"
    | "available"
    | "event"
    | "navigation"

  status:
    | "active"
    | "coming-soon"
    | "available"

  areaM2?: number

  cta?: {
    label: string
    href?: string
  }

  image?: string
}
```

The movement/interaction engine should read from this configuration.

Do not scatter resident content across game logic.

---

# 28. INITIAL SPACE DATA

## CONTRASTE ATELIER

```text
Name:
CONTRASTE ATELIER

Subtitle:
Joyería / Producción / Talleres

Description:
A workshop dedicated to jewelry, silver work, production and hands-on workshops.

CTA:
VER TALLERES
```

Do not build real reservations yet.

---

## VETA

```text
Name:
VETA

Subtitle:
Carpintería / Diseño / Producción
```

Keep description short.

---

## MANNINO

Use a short placeholder description until more information is supplied.

Do not invent unnecessary positioning copy.

---

# 29. AVAILABLE SPACES

Use the current areas from the architectural plan:

```text
NAVE 01 — 117 m²
NAVE 02 — 117 m²
NAVE 03 — 95 m²

PABELLÓN 01 — 80 m²
PABELLÓN 02 — 80 m²
PABELLÓN 03 — 46 m²
PABELLÓN 04 — 42 m²
```

Reusable overlay:

```text
PABELLÓN 01
80 M²

ESPACIO DISPONIBLE

INFORMACIÓN ↗
```

Do not use red/green real-estate map colors.

Maintain the grayscale design system.

---

# 30. EVENTS / COURTYARD CONTENT

Create an `EVENTOS` hotspot in the courtyard.

Approximate:

```ts
x: 1100
y: 780
```

Prefer representing it through a physical object:

- poster board
- industrial banner frame
- temporary stage
- stack of chairs
- event sign

Overlay:

```text
EVENTOS

Bazares
Exhibiciones
Activaciones
Encuentros

PRÓXIMAMENTE
```

No real calendar yet.

---

# 31. TALLERES

Create a general workshop hotspot.

Possible object:

- communal workbench
- notice board
- workshop schedule board

Overlay:

```text
TALLERES

Cursos y experiencias impartidas
por los talleres residentes.

PRÓXIMAMENTE
```

---

# 32. CONTACTO

Use a physical metaphor if possible:

- entrance office
- sign
- mailbox
- notice panel

Overlay can contain placeholder fields for:

- Instagram
- WhatsApp
- Email

Do not invent actual contact information.

---

# 33. PROXIMITY DETECTION

Whenever player position updates:

1. calculate distance from player to all active hotspots
2. find those inside interaction radius
3. choose the nearest relevant hotspot
4. show only that interaction label

Suggested default:

```ts
INTERACTION_RADIUS_DEFAULT = 110
```

---

# 34. INTERACTION METHODS

Hotspot can be activated through:

- clicking the label
- clicking the physical hotspot when nearby
- tapping on mobile
- optional keyboard `E`

Do not require `E`.

---

# 35. OVERLAYS

Opening a space should **not navigate to another route**.

Open an editorial HTML/CSS overlay above the world.

The world remains visible underneath.

Suggested composition:

```text
01 / RESIDENTE

CONTRASTE
ATELIER

Joyería
Producción
Talleres

Short description.

VER TALLERES ↗

                          ×
```

---

# 36. OVERLAY DESIGN LANGUAGE

Use:

- square corners
- thin borders
- oversized grotesk typography
- clear hierarchy
- generous negative space
- black / gray / off-white
- crisp transitions

Avoid:

- rounded cards
- glass effects
- gradients
- gaming dialog boxes
- unnecessary iconography
- large shadows

Opening transition:

```text
150–300ms
```

Possible:

- clip reveal
- slide up
- fast fade

---

# 37. OVERLAY BEHAVIOR

While open:

- pause player movement
- maintain player world position
- maintain camera position

Close via:

- X
- ESC
- backdrop click

After closing, exploration continues from the same location.

---

# 38. FALLBACK MENU

Even though the workshop is the navigation, include a discreet fallback.

Top-right:

```text
MENU +
```

Menu options:

```text
RESIDENTES
TALLERES
EVENTOS
AGENDA
CONTACTO
```

This is for accessibility and impatient users.

Do not turn it into a conventional navbar.

---

# 39. MENU AS FAST TRAVEL

Very important:

The fallback menu should preserve the spatial metaphor.

If the user selects `CONTRASTE`:

1. close menu
2. move camera/player toward Contraste
3. arrive at the interaction point
4. open Contraste overlay

The menu is **fast travel**, not page navigation.

---

# 40. BRAND HUD

Keep a tiny persistent identity element.

Suggested top-left:

```text
LA BOR
TALLERES
```

Optional small location:

```text
TULUM
```

Do not dominate the world.

---

# 41. RETURN / RESET

Clicking the LA BOR mark may return the visitor to the courtyard/spawn position.

No hard reload required.

---

# 42. USER GUIDANCE

On first entry:

```text
CLICK PARA CAMINAR
```

Mobile:

```text
TOCA PARA EXPLORAR
```

Place center-bottom.

Hide after first movement.

Do not build a tutorial.

---

# 43. MOBILE

Mobile must remain functional.

Requirements:

- tap to move
- camera follows
- overlays adapt to narrow screens
- menu accessible
- no horizontal browser scroll
- no requirement for keyboard input

The map can show a smaller crop.

Do not simply shrink the entire desktop world until everything becomes tiny.

---

# 44. PORTRAIT MODE

Do not block portrait mode.

Optional subtle message:

```text
MEJOR EN HORIZONTAL
```

But exploration must still function.

---

# 45. NO BROWSER SCROLL DURING WORLD EXPLORATION

Do not combine browser scroll with avatar navigation in V0.

The world is a full-screen spatial application.

A future version may add a scroll-driven arrival sequence, but not now.

---

# 46. SOUND

Prepare a minimal sound architecture, but default:

```text
SOUND OFF
```

Do not autoplay.

Future sound may include:

- workshop room tone
- tools
- metal
- distant machinery
- wind
- people working

Do not spend significant V0 time on sound.

---

# 47. AMBIENT LIFE

Add only 3–5 subtle animations.

Examples:

- tree leaf movement
- tiny welding flicker
- industrial light flicker
- slow fan
- poster movement
- a few dust particles

Keep the world calm.

---

# 48. SVG WORLD LAYERS

Organize SVG into conceptual groups:

```text
BACKGROUND
GROUND
BUILDINGS
LANDSCAPE
OBJECTS
HOTSPOTS
PLAYER
FOREGROUND
```

Example:

```html
<g id="ground">
<g id="buildings">
<g id="landscape">
<g id="objects">
<g id="debug">
```

UI overlays should remain regular HTML/CSS above the SVG.

---

# 49. BUILDING 2.5D STYLE

Do not draw plain debug rectangles.

Give each structure lightweight dimensionality:

- roof face
- front face
- side face
- small architectural shadow
- subtle linework

Fake extrusion:

```text
10–18px
```

Use grayscale differences.

No real 3D required.

---

# 50. ARCHITECTURAL IMPERFECTION

La Bor should not feel like a pristine tech campus.

Use subtle texture:

- concrete speckle
- grain
- paper texture
- irregular lines
- light scratches

Keep it restrained.

Performance matters.

---

# 51. TREE AS LANDMARK

The main tree from the plan should be visually important.

It should help the user think:

> “Contraste is near the tree.”

Slightly exaggerating its scale is acceptable.

Spatial landmarks improve navigation.

---

# 52. SIGNAGE

Use physical signage sparingly.

Examples:

```text
VETA
CONTRASTE
NAVE 01
NAVE 02
NAVE 03
```

Possible treatments:

- painted wall text
- plaque
- stencil
- architectural number

Avoid floating labels over every building.

---

# 53. CENTRAL LA BOR MARK

The current plan places `LA BOR TALLERES` in the center.

Do not add a giant website banner to the courtyard.

Better:

- floor stencil
- painted concrete typography
- faded ground marking

This can become a visual signature.

---

# 54. TYPOGRAPHY

Use a freely available / already installed grotesk sans-serif.

Possible temporary references:

- Inter
- Archivo
- Archivo Narrow
- Space Grotesk
- IBM Plex Sans

Do not spend substantial time sourcing fonts.

The final typography can be replaced later.

Favor:

- uppercase labels
- strong scale differences
- tight hierarchy
- simple spacing
- architectural indexing

---

# 55. CURSOR

Desktop cursor may react subtly:

Ground:

- pointer / small navigation indicator

Interactive zone:

- plus / pointer

Do not create an elaborate animated cursor system.

---

# 56. CAMERA IMPLEMENTATION

A straightforward solution is:

```text
world transform =
translate3d(cameraX, cameraY, 0)
scale(cameraZoom)
```

Create utility:

```ts
screenToWorldCoordinates()
```

Correctly account for:

- viewport coordinates
- camera translation
- zoom

This must be reliable.

---

# 57. PLAYER STATE

Keep it simple.

Recommended state:

```ts
position
targetPosition
isMoving
direction
nearbyHotspot
playerScale
```

React state + refs is sufficient.

Do not add Redux.

---

# 58. ANIMATION LOOP

Use `requestAnimationFrame`.

Each frame:

1. compute delta time
2. move player toward target
3. update depth scale
4. detect nearby hotspot
5. update camera target
6. interpolate camera

Avoid rerendering the entire React tree every frame.

Use refs and transforms where appropriate.

---

# 59. RESPONSIVE CAMERA

On resize:

- recalculate camera bounds
- preserve player world coordinates
- update zoom
- do not reset user position unnecessarily

---

# 60. ACCESSIBILITY

Fallback menu is mandatory.

Also support:

- ESC closes overlay
- keyboard focus
- proper buttons
- ARIA labels where appropriate
- `prefers-reduced-motion`

When reduced motion is active:

- shorten entrance animation
- reduce camera easing
- disable ambient animation where practical

---

# 61. LOADING

Keep loading simple.

Example:

```text
LA BOR
•••
```

Preload essential world assets before enabling `ENTRAR`.

No elaborate loader.

---

# 62. ASSET STRUCTURE

Recommended:

```text
public/
  assets/
    reference/
      labor-master-plan.png

    world/
    characters/
    residents/
    objects/
    textures/
    audio/
```

Use WebP where appropriate.

Do not embed large base64 images in code.

---

# 63. CONFIGURATION

Create:

```text
src/config/world.ts
```

Suggested values:

```ts
export const WORLD_WIDTH = 2400
export const WORLD_HEIGHT = 1600

export const PLAYER_SPEED = 300

export const PLAYER_SCALE_MIN = 0.68
export const PLAYER_SCALE_MAX = 1

export const CAMERA_LERP = 0.08

export const INTERACTION_RADIUS_DEFAULT = 110

export const DEBUG_WORLD = false
```

All major tuning values should live centrally.

---

# 64. DEBUG MODE

This is extremely important.

When:

```ts
DEBUG_WORLD = true
```

show:

- world coordinates
- player x/y
- target x/y
- walkable polygon
- interaction points
- interaction radii
- obstacles
- camera x/y
- zoom
- mouse/touch world coordinates

A tiny debug panel is enough.

Do not create a full editor.

---

# 65. DEBUG COORDINATE HELPER

If easy, add:

- right click on map logs world coordinate

or:

- click in debug mode displays x/y

This will allow rapid map calibration against the real plan.

---

# 66. SUGGESTED FILE STRUCTURE

Adapt to the existing project instead of forcing this blindly.

Conceptual target:

```text
src/
  components/
    experience/
      Entrance.tsx
      WorkshopWorld.tsx
      WorkshopSvg.tsx
      Player.tsx
      HotspotLabel.tsx
      SpaceOverlay.tsx
      FastMenu.tsx
      WorldHUD.tsx
      DebugPanel.tsx

  config/
    world.ts

  data/
    spaces.ts

  hooks/
    usePlayerMovement.ts
    useCamera.ts
    useNearbyHotspot.ts

  utils/
    coordinates.ts
    geometry.ts
    interpolation.ts

  styles/
    experience.css
```

Do not overengineer.

---

# 67. NO ROUTE EXPLOSION

Do not create a dedicated route for every resident.

V0 can live entirely at:

```text
/
```

Everything happens within the spatial world.

---

# 68. BUILDING STATES

Allow subtle states:

## Normal

neutral

## Nearby

slightly stronger border / sign

## Selected

subtle highlight

Do not recolor buildings dramatically.

---

# 69. OCCUPIED VS AVAILABLE

Current known occupied / represented spaces:

- CONTRASTE ATELIER
- VETA
- MANNINO

They may use slightly richer texture or detail.

Available spaces remain more neutral.

Do not use red / green.

---

# 70. ARCHITECTURAL LABEL SYSTEM

Use a clean architectural index.

Examples:

```text
01
PABELLÓN
80 M²
```

or

```text
N01
117 M²
```

This can become part of La Bor’s visual language.

---

# 71. WORLD RESET ON RELOAD

Reload resetting to entrance is acceptable in V0.

Opening/closing overlays should **not** reset position.

---

# 72. URLS

No need to update URL while walking.

Future optional deep links:

```text
?space=contraste
```

Not required now.

---

# 73. PERFORMANCE

Prioritize:

- fast initial load
- smooth transforms
- small dependency footprint
- optimized images
- lightweight SVG
- minimal filters

Avoid:

- thousands of SVG nodes
- giant uncompressed PNGs
- expensive postprocessing
- unnecessary animation loops

Aim for smooth behavior on ordinary laptops and modern phones.

---

# 74. FUTURE POSSIBILITIES — DO NOT BUILD NOW

The architecture should not prevent these later:

- custom illustrated map
- real photography
- workshop reservations
- schedule/calendar
- product sales
- event tickets
- resident profiles
- live availability
- day/night mode
- sound
- animated workers
- interiors
- multiplayer
- 3D

But do **not** build abstractions for imaginary future features.

---

# 75. DEVELOPMENT PHASES

## Phase 1 — Functional world

Build first:

- entrance
- SVG world
- building geometry
- courtyard
- player
- click/tap movement
- camera

Do not polish heavily yet.

Verify that exploration works.

---

## Phase 2 — Interaction

Add:

- spaces data
- hotspots
- proximity detection
- labels
- overlays

---

## Phase 3 — Visual language

Add:

- typography
- grayscale palette
- architectural extrusion
- tree / vegetation
- shadows
- texture
- player depth scaling
- camera smoothing

---

## Phase 4 — Usability

Add:

- fallback menu
- fast travel
- mobile behavior
- accessibility
- debug tools

---

## Phase 5 — Minimal polish

Add:

- entrance transition
- 3–5 ambient details
- interaction animation
- simple loading state

---

# 76. DO NOT DESIGN FOR AN HOUR BEFORE MOVEMENT WORKS

The interaction prototype comes first.

Priority:

1. movement
2. spatial clarity
3. hotspots
4. visual identity
5. polish

---

# 77. ACCEPTANCE TESTS

Manually verify:

- site loads
- entrance works
- player spawns correctly
- desktop click movement works
- mobile tap movement works
- repeated destination clicks work
- invalid ground clicks do not break movement
- camera stays in bounds
- player scaling feels subtle
- Contraste proximity works
- Veta proximity works
- available-space overlay works
- overlays open/close
- ESC works
- menu works
- fast travel works
- resize works
- portrait mobile remains usable
- production build succeeds

---

# 78. BUILD VALIDATION

Before stopping:

- run lint if configured
- run typecheck if configured
- run production build
- fix runtime errors
- remove broken imports
- do not leave pseudo-code in place of implementation

---

# 79. CONTENT RULE

Do not invent long marketing copy.

This experience should use minimal language.

Use placeholders when information is unknown.

---

# 80. SOURCE OF TRUTH

Keep the responsibilities separate:

## Architectural plan

Defines:

- spatial relationship

## `spaces.ts`

Defines:

- names
- resident status
- descriptions
- areas
- CTAs
- interaction locations

## `world.ts`

Defines:

- dimensions
- movement
- camera
- behavior
- debug configuration

This separation is important.

---

# 81. WHAT TO DO IF IT FEELS TOO MUCH LIKE A GAME

Remove:

- HUD elements
- bright interaction outlines
- quest markers
- cartoon UI
- giant tooltips
- gamer language

Replace with:

- editorial labels
- architectural signage
- minimal proximity indicators
- physical objects

---

# 82. WHAT TO DO IF IT FEELS TOO MUCH LIKE CAD

Add:

- visitor
- vegetation
- shadows
- architectural depth
- subtle movement
- physical signage
- texture
- ambient life

We want:

> architectural but alive

---

# 83. WHAT TO DO IF IT FEELS TOO CLEAN

Add subtle:

- grain
- concrete texture
- irregularity
- slight misalignment
- analog details

Do not add arbitrary decoration.

---

# 84. IMPORTANT GRAPHICS ARCHITECTURE

The interaction logic must remain independent from the temporary SVG artwork.

Later we may replace the entire visual map with:

- a custom illustration
- layered images
- rendered architecture
- photography collage

Player positions and hotspot coordinates should still work with minimal recalibration.

Do not bind gameplay logic to specific SVG building nodes more than necessary.

---

# 85. V0 MINIMUM COMPLETE PRODUCT

The prototype is complete when I can:

1. open the website
2. see LA BOR
3. click ENTRAR
4. enter a visual reconstruction of the workshop
5. see the visitor
6. click on the courtyard
7. watch the visitor walk there
8. watch the camera follow
9. recognize the basic real-world layout
10. identify the central courtyard
11. approach Contraste
12. see Contraste appear
13. open its editorial overlay
14. close it
15. continue from the same location
16. approach Veta
17. inspect an available pavilion/nave
18. open the fallback menu
19. use fast travel
20. use tap movement on mobile
21. run the production build successfully

---

# 86. OUT OF SCOPE FOR V0

Do not implement:

- authentication
- database
- Supabase
- CMS
- payment
- reservation backend
- real calendar integration
- multiplayer
- chat
- user profiles
- inventory
- true 3D
- complex physics
- detailed interiors

Placeholder CTAs are acceptable.

---

# 87. FINAL CREATIVE NORTH STAR

This is not:

> a game about La Bor

This is not:

> a website with a game embedded

It is:

# LA BOR ITSELF TURNED INTO A DIGITAL INTERFACE.

The physical site becomes information architecture.

The courtyard becomes navigation.

Residents become discoverable destinations.

Doors become links.

Walking becomes browsing.

Exploration becomes discovery.

---

# 88. IMPLEMENTATION AUTONOMY

Do not repeatedly stop for minor questions.

When a detail is unclear:

1. choose the simplest reasonable assumption
2. implement it
3. document the assumption

Do not return only a development plan.

**Build the working prototype.**

---

# 89. REQUIRED FINAL DEVELOPMENT REPORT

After implementation, provide a concise report containing:

## WHAT WAS BUILT

What is currently functional.

## HOW TO RUN

Exact local commands.

## KEY FILES

Where major systems live.

## HOW TO EDIT THE MAP

Where coordinates and geometry live.

## HOW TO EDIT RESIDENT CONTENT

Where resident/space content lives.

## HOW TO TUNE MOVEMENT

Player speed and camera behavior.

## DEBUG MODE

How to enable and use it.

## VISUAL ASSETS TO REPLACE NEXT

Only the minimum assets needed to turn the gray prototype into a custom La Bor world.

---

# 90. CURRENT BUILD PRIORITY

The first milestone is simply:

# “I CAN WALK THROUGH LA BOR.”

Do not overengineer it.

Build that first.
