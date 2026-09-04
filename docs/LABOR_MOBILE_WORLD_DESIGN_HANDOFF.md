# Handoff: LA BOR — explorable workshop world (mobile) + control rework + site perimeter

## Overview

LA BOR — TALLERES is a real workshop complex in Tulum (34.90 × 37.31 m, Cobá street to the south, Mala Casa to the north). The digital experience is a top-down explorable 2D world: the visitor walks the courtyard, taps a roof, and opens a sheet with that space's data. Seven of the eleven structures are available for rent — those show a **“This could be yours…”** lead-in plus a contact form.

This handoff covers three things:

1. The **mobile-first world screen** (390 × 844) with a camera that follows the visitor.
2. A **rework of the movement controls** — the current analog-stick-in-a-fixed-corner is hard to use and must be replaced by the scheme in §4.
3. A **perimeter wall** that visually and physically delimits the site.

## About the design files

The files in this bundle are **design references written as HTML** (`.dc.html` — plain HTML documents that open in a browser). They are prototypes showing intended look, geometry and behavior. **Do not ship them.** Recreate the design inside the existing La Bor codebase using its current world renderer, coordinate system, hotspot logic and animation architecture. Keep movement, hotspots, layering and interactivity working; swap visuals and controls only.

All artwork in the prototype is **procedurally drawn pixel art on `<canvas>`** so the world could be evaluated without waiting for final assets. In production these are **image assets** (transparent PNG/WebP) at the paths in §9. The canvas painters in the prototype are the *specification* for each piece (silhouette, palette, light direction), not the delivery format.

## Fidelity

**High fidelity** for palette, geometry, layout, copy and interaction. Exact hex values, footprints and z-order are listed below and should be matched.
**Placeholder** for: the final drawn artwork (canvas stand-ins), resident photography, and the 16:9 video slot (deliberately left empty).

---

## 1. Art direction (binding)

- Perspective: **top-down / model-like**, slight relief. Never mix front-view and top-view objects.
- Light from the **northwest**, shadows to the **southeast**. In logical pixels the shadow is a **+3 px offset silhouette** at `rgba(24,20,17,0.28)`. This rule applies to every piece, including character and animals.
- Mood: **Caribbean industrial**. Base stays neutral/warm concrete and sand; color arrives as accents — terracotta, ochre, teal, palm green, oxide rust. Roughly 70 % neutral / 30 % accent.
- Interface: editorial and architectural. Rectangles, 1 px strokes, uppercase labels, no rounded corners except circular controls, no glass or gloss.
- Typography: **Archivo** (Google Fonts, weights 400–900). Uppercase labels with wide letter-spacing (`.16em`–`.30em`).
- Pixel art must read as **refined and contemporary**, not retro arcade.

## 2. World geometry

The prototype world is **1280 × 1160 px** at 1× display scale. That maps to the real site: 1280 px ≈ 34.90 m, so **1 m ≈ 36.7 px**. The viewport is 390 × 844.

Structures (world coordinates, `left, top, width, height`, and the z-index used for depth sorting):

| Id | Label | Box | z-index | Area | Status |
|---|---|---|---|---|---|
| `veta` | VETA | 40, 40, 146, 478 | 558 | 12.31 × 25.00 m | Resident (woodwork) |
| `mannino` | MANNINO | 40, 518, 146, 278 | 796 | 12.31 × 5.85 m | Resident (ironwork) |
| `vetaSur` | VETA · ANNEX | 40, 796, 146, 319 | 1115 | 12.31 × 12.06 m | Resident (material yard) |
| `pab04` | PABELLÓN 04 | 186, 133, 197, 203 | 336 | 42 m² | **Available** |
| `contraste` | CONTRASTE | 386, 133, 170, 203 | 337 | 6.10 × 6.65 m | Resident (jewellery) |
| `pab01` | PABELLÓN 01 | 859, 133, 341, 181 | 314 | 80 m² | **Available** |
| `pab02` | PABELLÓN 02 | 859, 314, 341, 195 | 509 | 80 m² | **Available** |
| `pab03` | PABELLÓN 03 | 1005, 509, 195, 186 | 695 | 46 m² | **Available** |
| `nave03` | NAVE 03 | 310, 796, 268, 319 | 1115 | 95 m² | **Available** |
| `nave02` | NAVE 02 | 578, 796, 331, 319 | 1116 | 117 m² | **Available** |
| `nave01` | NAVE 01 | 909, 796, 331, 319 | 1117 | 117 m² | **Available** |

Depth rule: **z-index = the piece's bottom Y in world coordinates.** The visitor's z-index is `y + 70`. That single rule produces correct occlusion (walking behind a canopy, in front of a wall) with no special cases. Trees and palms ship split into `-base` and `-canopy` so the canopy can sit above the visitor while the trunk sits below.

Courtyard content: main tree (585, 92/120, 200×200 split), two palms (214, 330/352 and 930, 678/700, 120×120 split), two shrubs, two terracotta planters, a teal water tank (872, 452), the installation pedestal “The central piece” (640, 380, 176×176), the events board (760, 640), the info totem (420, 700), a worktable, a wood stack, pallets, and the main gate at the Cobá opening (186, 1058).

## 3. Site perimeter (new — must be added)

A wall runs the full boundary of the property, 40 px thick (≈ 1.1 m), with one opening for the Cobá gate.

| Segment | Box | z-index |
|---|---|---|
| North wall | 0, 0, 1280, 40 | 44 |
| West wall | 0, 0, 40, 1160 | 1152 |
| East wall | 1240, 0, 40, 1160 | 1153 |
| South wall (west of gate) | 0, 1120, 186, 40 | 1158 |
| South wall (east of gate) | 310, 1120, 970, 40 | 1159 |

The gate opening is the gap **x 186 → 310** on the south edge, aligned with `prop-gate-main`.

Wall artwork: concrete band, cap highlight on the NW-facing edge (`#a8a190`, then `#948d7d`), hard inner shadow on the SE-facing edge (`rgba(24,20,17,0.45)`), block joints every 6 logical px (`#615c52`), fine speckle, and a terracotta pilaster (`#b5673c`) every ~23 logical px with occasional oxide stains (`#c47a3f`). Tileable: deliver `wall-h` (8 px tall, tiles horizontally) and `wall-v` (8 px wide, tiles vertically) and repeat, rather than one giant image.

Collision: all five segments are solid. The visitor is clamped to `x ∈ [28, 1212]`, `y ∈ [-6, 1062]` (the sprite's feet box is what collides, see §4). A 1 px dashed inset line at `rgba(244,239,228,.14)` marks the buildable perimeter inside the wall, and the label `PERIMETER · 34.90 × 37.31 M` sits at the south-east corner.

## 4. Controls — the rework

**Remove** the fixed 116 px joystick pinned to the bottom-left corner. It forces the thumb into one spot, is small relative to the walking speed, and competes with the ENTER button. Replace it with three inputs that share one pointer handler on the stage:

### A. Tap to walk (primary)
- `pointerdown` → `pointerup` in **under 600 ms** with **less than 12 px** of travel, and not on a hotspot, is a **tap**.
- Convert screen → world: `world = screen + camera`, where `camera` is the current world offset.
- Ignore taps outside the walkable rect (`44 → 1236`, `44 → 1116`); otherwise set `target = {x, y}`.
- Show an ochre ring marker (26 px, 2 px `#e08a3c`) at the target; keep it pinned to the **world** position as the camera moves; fade it out on arrival.
- Each frame, if there is no manual input and a target exists: move at `speed` along the normalized vector to the target, stop within 8 px, then clear.
- **Anti-stuck**: if the visitor moves less than 0.4 px for 18 consecutive frames while heading to a target, clear the target (it is behind a wall). Do not implement A* — straight-line plus axis sliding (below) is enough for this site.

### B. Drag anywhere = floating stick (fine control)
- The same pointer press, once travel exceeds **12 px**, becomes a stick. The stick ring (132 px, 1 px `rgba(233,220,198,.5)`, fill `rgba(24,20,17,.42)`) **appears centered on where the finger landed** — it is not a fixed corner control.
- Knob (48 px, `#e9dcc6`, 2 px `#12100e`) follows the finger clamped to a **46 px** radius; input vector = `delta / 46` (a normalized −1…1 per axis, so a small drag walks slowly).
- On release: hide the ring, zero the vector, and do **not** register a tap.
- Any stick input cancels an active tap target.

### C. Keyboard (desktop)
- WASD and arrow keys, `preventDefault` on the arrows. `Escape` closes the sheet. Keyboard input also cancels a tap target.

### Shared movement rules
- Speed: **3.6 px/frame** at 60 fps (tunable 1.5–8).
- Collision box is the visitor's **feet**: `x + 10, y + 52, 20 × 16`.
- Resolve **each axis independently** (try X, then Y) so sliding along a wall works instead of sticking.
- Walk animation: 2 frames alternating every 6 moved frames; frame 0 = idle when input stops.

### Hotspots vs. movement
Every tappable structure carries `data-hotspot="1"`. On `pointerdown`, if `event.target.closest('[data-hotspot]')` matches, the stage handler bails out entirely and lets the hotspot's own click open the sheet. This is what keeps “tap a roof” and “tap the ground” from fighting each other.

### ENTER button
76 px circle, bottom-right, 1 px `#e08a3c` border on `rgba(224,138,60,.24)`, `rgba(224,138,60,.55)` while pressed. It opens the **nearest** space by distance from the visitor's feet to each structure's center — a shortcut for players who don't want to aim taps.

### Camera
Follows the visitor, centered, clamped to the world:
```
camX = clamp(pos.x + 20 - viewportW/2, 0, worldW - viewportW)
camY = clamp(pos.y + 35 - viewportH/2, 0, worldH - viewportH)
```
Applied as a single `translate()` on the world container (no per-sprite math). Keep it on integer pixels so the pixel art never lands on half-pixels.

## 5. Screens

### 5.1 World (390 × 844)
- **HUD top**: gradient scrim `rgba(18,16,14,.92) → transparent`, 14/16 px padding. Left: `LA BOR` 16 px / 900 / `.14em`, sub `WORKSHOPS · TULUM` 8 px / 700 / `.30em` `#c0b6a3`. Right: bordered chip, 1 px `#c98f42`, `7 SPACES AVAILABLE` in `#e08a3c` over `42 – 117 m²`.
- **Hint chip** bottom-left: `TAP THE GROUND TO WALK THERE` / `DRAG ANYWHERE TO STEER`, 8 px / 800 / `.18em`, `#c0b6a3` on `rgba(24,20,17,.84)` with 1 px `#3a352e`.
- **ENTER** bottom-right with `NEAREST SPACE` caption.
- **Structure labels** ride on each roof: 4–5 px padding, `rgba(24,20,17,.86)`, 1 px border (neutral `#6f6b63`; `#c98f42` for Veta, `#3f9c96` for Contraste, `#8e9299` for Mannino), 9–10 px / 800 / `.16em`, `#f4efe4`, format `NAVE 01 · 117 m²`.
- **Availability pulse**: 12 px `#e08a3c` dot on each available structure, `scale(1) → scale(1.9)` with opacity `.9 → .05`, 2.6 s ease-out infinite, staggered 0.4 s apart. Occupied residents get no dot.
- **Courtyard stencil**: 2 px `rgba(244,239,228,.3)` frame, 420 × 130, containing `La Bor` at 64 px / 900 `rgba(244,239,228,.34)` and `TALLERES` at 13 px / `.62em`.

### 5.2 Space sheet (bottom sheet)
Slides up from the bottom (`translateY(101%) → 0`, 260 ms ease-out) over `rgba(14,12,10,.62)`. Panel `#1c1916`, 1 px top border `#c98f42`, max-height 88 %, scrollable, sticky header.

Order of content:
1. Header row: kind label 9 px / 800 / `.26em` `#8b8272` + `CLOSE ✕`.
2. `THIS COULD BE YOURS…` — 11 px / 800 / `.20em` `#e08a3c` — **available spaces only**.
3. Title 38 px / 900 / `-.015em` uppercase.
4. Body copy 14 px / 1.65 `#d5cdbd`.
5. 2 × 2 data grid (1 px `#332e28` gaps): Area, Status (`#e08a3c`), Footprint, Asset filename (monospace `#a89d8b`).
6. **Video slot**: 16:9, 1 px dashed `#6f6357`, captioned `VIDEO SLOT / 16:9 · TO BE DEFINED`. Intentionally empty — AI renders of ceramics studios etc. go here later.
7. Available → `CLAIM THIS SPACE` form: NAME, EMAIL OR WHATSAPP, WHAT WOULD YOU MAKE HERE? (textarea, 3 rows). Fields `#262119` with 1 px `#4e463c`, 13/12 px padding, 11 px / 700 / `.16em` uppercase placeholders. Submit is a full-width `#e08a3c` block, `#1c1916` text, 11 px / 900 / `.22em`, hover `#f2a058`. Footnote `WE ANSWER WITHIN 48 H`.
8. Occupied → `VISIT THE WORKSHOP` outline button, 1 px `#3f9c96`, hover fill `#22423f`, footnote `RESIDENT · BY APPOINTMENT`.

Form validation: name required; second field must be a valid email **or** 10+ digits; message optional. Submit posts to whatever the codebase already uses for enquiries; on success replace the form with a confirmation line in the same type style — do not navigate away from the world.

Copy language: **English** for all UI chrome; keep proper nouns (La Bor, Veta, Contraste, Mannino, Nave, Pabellón, Cobá) as they are.

## 6. Ambient life (all looping, all CSS-driven)

| Element | Motion | Duration |
|---|---|---|
| Tree canopy | `rotate(-0.5°→0.6°)` + `translateY(-2px)`, origin 50 % 82 % | 7 s ease-in-out |
| Palm canopies | `rotate(±1.4°)`, origin 50 % 78 % | 6 s / 7.5 s (0.8 s delay) |
| Contraste skylight | opacity flicker `.45 → .70 → .20 → .62` | 4.2 s |
| Dust motes | `translate(70px,-50px)` with opacity in/out | 12 s / 15 s |
| Availability pulse | scale + fade | 2.6 s, staggered |
| **Orange cat** | Walks the courtyard from (150, 742) to (820, 690) and back, pausing at each end; sprite flips via `scaleX(-1)` at the turn; 2-frame leg/tail cycle at 170 ms | 26 s loop |
| **Birds** | Three birds cross the sky on two paths (west→east rising, east→west descending), fading in/out at the edges; 2-frame wing flap at 170 ms; z above everything | 21 s (×2, 1.4 s apart) and 34 s (9 s delay) |

Animals are **decorative only** — no collision, no interaction, `pointer-events: none`. Frame cycling for every animated sprite runs off **one** 170 ms interval, not one per sprite.

## 7. State

```
pos          {x, y}        visitor world position
target       {x, y} | null tap-to-walk destination
stick        {x, y}        -1…1 per axis from the floating stick
keys         {up,down,left,right}
camera       {x, y}        derived from pos each frame
frame        0 | 1 | 2     visitor walk frame
animFrame    0 | 1         shared cat/bird frame
open         spaceId | null which sheet is showing
```
`pos`, `target`, `stick`, `camera` and the frame counters must **not** live in reactive state — they change every frame. Mutate them and write straight to `style.transform`; only `open` triggers a re-render.

## 8. Design tokens

**Neutrals** `#181411` ink · `#262119` charcoal · `#332e28` line · `#4e463c` line-strong · `#6f6a5e` concrete · `#807a6c` concrete-2 · `#948d7d` concrete-3 · `#a8a190` concrete-4 · `#b8ab93` sand · `#d5cdbd` off · `#e9dcc6` off-2 · `#f7f2e6` white · `#8f8778` floor base

**Accents** `#9c5330` / `#c47a3f` / `#e08a3c` rust · `#b5673c` / `#cf8355` / `#7d4326` terracotta · `#c98f42` / `#e0ac5c` ochre · `#1c5457` / `#2f7e7e` / `#46a39b` / `#7ecfc2` teal · `#31492a` / `#4b6b3c` / `#66914b` / `#8bb45c` green · `#3a5c33` / `#5d9350` / `#7fb95f` palm · `#5b4025` / `#8a6238` / `#a87f4c` wood · `#61666b` / `#94989c` / `#b6bcbd` steel · `#a9c4c2` glass · `#a8551a` / `#d97a2b` / `#efa863` cat

**Type** Archivo. 8/9/10/11 px uppercase labels (700–800, `.16em`–`.30em`) · 13–14 px body (400, 1.65–1.7) · 34–38 px titles (900, `-.015em`) · 64 px courtyard stencil (900).

**Spacing** 4 / 8 / 10 / 12 / 14 / 18 / 22 / 26 px. **Radius** 0 everywhere except circular controls (50 %). **Borders** 1 px, occasionally 2 px for the stencil frame. **Shadows** none in CSS — shadow is drawn into the artwork.

## 9. Assets

Every world piece is a separate transparent image, exported at **2× intended display size**, tight bounds, no baked UI.

```
/public/assets/world/
  floor/    world-floor-patio-v1.webp          (tileable, 256×232 logical)
  walls/    wall-h-v1.webp  wall-v-v1.webp      (tileable, 8 px band)
  roofs/    roof-nave-01-v1.webp  roof-nave-02-v1.webp  roof-nave-03-v1.webp
            roof-pabellon-01-v1.webp … roof-pabellon-04-v1.webp
            roof-contraste-v1.webp  roof-veta-v1.webp
            roof-veta-sur-v1.webp   roof-mannino-v1.webp
  vegetation/ tree-main-base-v1.webp  tree-main-canopy-v1.webp
              palm-base-v1.webp       palm-canopy-v1.webp
              shrub-01-v1.webp        shrub-02-v1.webp
  props/    prop-events-board-v1.webp  prop-info-totem-v1.webp
            prop-worktable-v1.webp     prop-wood-stack-v1.webp
            prop-pallet-stack-v1.webp  prop-gate-main-v1.webp
            prop-planter-v1.webp       prop-water-tank-v1.webp
  installations/ installation-base-v1.webp
/public/assets/characters/
  visitor/  visitor-idle-front-v1.png  visitor-walk-01-v1.png  visitor-walk-02-v1.png
  fauna/    cat-walk-01-v1.png  cat-walk-02-v1.png
            bird-fly-01-v1.png  bird-fly-02-v1.png
/public/assets/overlays/residents/   (one horizontal photo per resident, 1600×1200)
/public/assets/overlays/spaces/      (one photo per available space)
```

Logical sizes (multiply by 5 for display, by 10 for the 2× export): naves 83×80 and 67×80 · pabellones 85×45, 85×49, 49×46, 49×51 · contraste 42×51 · veta 36×120 · veta-sur 36×80 · mannino 36×70 · tree 40×40 · palm 30×30 · shrub 16×14 · planter 16×18 · tank 18×18 · board 40×30 · totem 14×30 · worktable 36×24 · wood stack 30×20 · pallets 26×20 · gate 60×14 · pedestal 44×44 · visitor 16×28 · cat 20×14 · bird 14×10.

Render every sprite with `image-rendering: pixelated` and integer scaling only.

## 10. Files in this bundle

- `LA BOR - Mobile World.dc.html` — the mobile world: camera follow, new controls, perimeter wall, animals, bottom sheet with the availability form. **The primary reference.**
- `LA BOR - Mundo y Assets.dc.html` — desktop 1600×900 world plus the asset sheet: every piece isolated on a checkerboard with its filename, logical size and a PNG 2× download button. Use it to read each silhouette and palette.
- `LABOR_ART_DIRECTION_ASSETS.md` — the original art direction and asset system document (design source of truth).
- `IMPRESIONES-06.png` — the measured site plan the world geometry is derived from.

Open either HTML file directly in a browser. Movement needs one click on the frame first (keyboard focus).

## 11. Implementation order

1. Perimeter wall segments + collision + camera clamp (small, immediately makes the site feel enclosed).
2. Control rework: one pointer handler, tap-to-walk, floating stick, hotspot bail-out, axis-independent collision. Delete the fixed joystick.
3. Availability state on structures: pulse dot, `THIS COULD BE YOURS…`, contact form.
4. Swap canvas stand-ins for delivered image assets, path by path.
5. Ambient loops (canopies, flicker, dust), then cat and birds off the shared 170 ms frame clock.

## 12. Do not

- Do not rebuild the world renderer or change the coordinate system.
- Do not add a fixed-position joystick back.
- Do not give the animals collision or dialogue.
- Do not introduce bright primaries, gradients on world pieces, rounded corners on panels, or a second typeface.
- Do not fill the video slot with stock footage.
