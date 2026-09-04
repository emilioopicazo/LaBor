# LA BOR — ART DIRECTION & ASSET SYSTEM
## Design handoff for world-building, asset creation, and visual consistency

> This document is the **design source of truth** for the visual production of La Bor's digital experience.
>
> Its purpose is to define the complete **art direction, asset system, export rules, interaction visual language, and production priorities** before everything is integrated into the interactive prototype.
>
> This document is intentionally separate from gameplay and engineering handoffs.

---

# 0. PURPOSE

We are creating the **visual identity and asset system** for an experimental digital experience / 2D explorable world based on a real workshop complex in Tulum called:

# LA BOR — TALLERES

This is not a normal website and not a generic videogame.

The visual system should feel like:

- an explorable 2D world
- an architectural model
- an art object
- a workshop map
- a playful but refined digital interface

The visual direction should allow the project to become:

- a world you can walk through
- a world you can interact with
- a world you can build inside
- a world that can grow as new workshops/residents are added

---

# 1. DESIGN PRINCIPLE

The core principle is:

> **Do not design a website. Design a place.**

Everything should feel like it belongs to the same world.

Every object, structure, sign, prop and interface piece must feel like part of the same physical/digital environment.

The user should feel:

> “I am inside La Bor.”

Not:

> “I am navigating a landing page.”

---

# 2. VISUAL NORTH STAR

The world should feel like a hybrid of:

- 2D explorable videogame
- architectural model / maqueta
- industrial workshop
- editorial / brutalist interface
- slightly nostalgic digital world
- handcrafted environment

The reference point is **not** pixel art in a retro arcade sense.

If pixel-art logic is used, it should be:

- soft
- refined
- intentional
- clean
- contemporary
- not childish

A better description is:

> **2D digital model / illustrated game world with a tactile industrial mood**

---

# 3. DESIGN GOALS

The visual system must support:

1. exploration
2. clarity
3. recognizability
4. asset modularity
5. gameplay expansion
6. future workshop additions
7. animation
8. consistent depth
9. clean replacement of placeholders
10. clean export/import into the interactive system

---

# 4. MASTER STYLE

## Overall mood

- industrial
- artistic
- gray
- raw
- tactile
- architectural
- slightly worn
- spacious
- creative
- contemporary
- not overdesigned

## Emotional tone

- inviting
- curious
- intelligent
- playful in a subtle way
- immersive
- not hyper-commercial

## What it should avoid

- cartoon look
- colorful toy aesthetic
- childish icons
- glossy SaaS vibe
- generic 3D render look
- polished sterile corporate look
- flat empty CAD without soul

---

# 5. WORLD VIEW / CAMERA

The entire asset system must follow one consistent point of view.

## Perspective

Use:

> **top-down / cenital / model-like 2D perspective**

It can be slightly stylized, but all assets must share the same visual logic.

The current implementation behaves like a simplified top-down world.

The art direction may include slight pseudo-depth, but must stay consistent.

## Rules

- all map/world assets must respect the same viewing angle
- avoid mixing front-view and top-view objects
- avoid perspective conflicts between buildings, props and characters
- everything should feel like it belongs to the same small world

---

# 6. LIGHTING RULES

Use one universal lighting rule for all assets:

> **Light comes from the northwest**
>
> **Shadows fall toward the southeast**

This rule is mandatory for all world pieces.

That includes:

- buildings
- trees
- props
- sculptures
- signage
- furniture
- gates
- workshop objects
- vehicles if ever added
- character shadows

Consistency here matters a lot.

---

# 7. PALETTE

The world should remain mostly restrained.

## Core palette family

- off-white
- dirty white
- concrete gray
- warm gray
- medium charcoal
- black
- muted green
- desaturated rust / oxide brown

## Accent use

Accents should be minimal and purposeful:

- muted rust on metal
- dark green in vegetation
- slightly warmer wood browns
- tiny silver / steel accents where needed
- tiny off-black / charcoal interface contrast

Do not introduce bright primaries or rainbow accents.

## Palette behavior

- 80–90% of the world should remain neutral / gray-based
- accents should help readability and material distinction
- interface and world should feel related

---

# 8. TEXTURE / MATERIAL LANGUAGE

The world should not feel perfectly flat or digitally sterile.

Use subtle material cues.

## Main materials

- concrete
- oxidized metal
- wood
- steel
- workshop floors
- slightly dusty painted surfaces
- vegetation
- paper/sign boards

## Texture treatment

Texture should be:

- subtle
- fine
- controlled
- layered lightly
- not noisy enough to ruin readability

Potential texture types:

- concrete grain
- paper grain
- speckle
- minor scratches
- slight wear
- shadow softness
- light scuffs
- dusty edges

Avoid heavy grunge overlays.

We want:

> tactile, not dirty.

---

# 9. SCALE + PROPORTION

The world should feel generous and spatial.

The current map already has a central courtyard and surrounding workshops.

The art should preserve:

- the courtyard as the main breathable center
- workshops big enough to feel important
- walkable circulation around trees and objects
- enough space for movement, interactions and future mini-games

Important:

> Increase the **sense of space**.

The workshops should feel slightly larger, more usable and more inviting to enter/interact with than a literal technical diagram would suggest.

---

# 10. MOVEMENT / MOBILITY CONSIDERATIONS

The art must support easier movement and exploration.

That means:

- no overly tight paths
- no decorative clutter that blocks navigation excessively
- trees and props should frame movement, not obstruct it too much
- workshops should feel like destinations, not tiny boxes
- there should be clear navigable zones and interaction areas

The world must remain legible at a glance.

---

# 11. DEPTH / OCCLUSION RULES

The game must allow the visitor to move visually:

- in front of trees
- behind trees
- in front of props
- behind props
- into workshop thresholds
- around objects

Therefore assets should be prepared to support depth sorting.

## When useful, split assets into layers

Examples:

### Tree
- trunk/base
- canopy/shadow

### Large sign
- support structure
- sign face

### Workshop objects
- base
- hanging element / top element

### Installations
- base
- upper shape

This allows the engine to layer them more intelligently.

---

# 12. ANIMATION PHILOSOPHY

The world should feel alive.

Not everything needs to move a lot, but everything should feel potentially active.

## World animation goals

- subtle
- environmental
- atmospheric
- craft-related
- world-building

## Good examples

- tree leaves moving
- welding sparks
- fan rotation
- poster flutter
- tool blink
- light flicker
- dust movement
- hanging cable sway
- door subtle movement
- smoke puff
- workshop glow

## Avoid

- chaotic animation everywhere
- constant loops that distract
- anything too cute/cartoonish
- noisy VFX

---

# 13. WORLD COMPONENTS

The world can be divided into these visual groups:

## A. Overworld base
- ground / floor
- courtyard
- walkable zones
- circulation paths

## B. Architecture
- NAVE 01
- NAVE 02
- NAVE 03
- PABELLÓN 01
- PABELLÓN 02
- PABELLÓN 03
- PABELLÓN 04
- CONTRASTE
- VETA
- MANNINO

## C. Vegetation
- main tree
- smaller trees
- shrubs
- sidewalk tree

## D. Props / world objects
- events board
- info totem
- work table
- pallets
- stacks of wood
- sculptural base
- gates
- workshop objects
- benches
- signage

## E. Character assets
- visitor / player
- possible workshop attendants later
- simple NPCs later

## F. Interface / overlays
- world labels
- hotspot indicators
- menu pieces
- overlay panels
- inventory tags
- quest labels later

---

# 14. CHARACTER DIRECTION — VISITOR

The visitor should feel simple and universal.

It does not need to be a detailed avatar creator.

## Desired character style

- silhouette-based
- slightly stylized
- compact
- readable at small size
- minimal color count
- strong shape
- subtle shadow
- fits the world, not a separate art style

## Important

The character should not look like:
- anime
- mascot branding
- childish cartoon
- RPG fantasy sprite

It should feel like:

> a person visiting a workshop world.

## Suggested first deliverables

- idle/front
- walk frame 1
- walk frame 2
- optional walk frame 3
- optional interact frame

---

# 15. INTERFACE DIRECTION

The interface should feel connected to the world.

## Tone

- editorial
- architectural
- brutalist
- restrained
- typographic
- clean

## Design language

- rectangular shapes
- thin strokes
- uppercase labels
- strong type hierarchy
- minimal icons
- little or no rounded corners
- no glossy effects
- no glassmorphism

## UI should not overpower the world

The world is the star.

UI supports it.

---

# 16. TYPOGRAPHY

Current working typeface: **Archivo**

That is acceptable as a functional base.

## Desired typographic mood

- grotesk / industrial
- bold when needed
- strong uppercase labels
- readable at small sizes
- good for wayfinding and signage

Potential future use:

- one primary grotesk/sans family only
- avoid mixing too many typographic personalities

## Usage

- large labels for titles
- condensed smaller labels for wayfinding
- clear hierarchy
- few sizes, used consistently

---

# 17. BRANDING IN THE WORLD

The name:

# LA BOR — TALLERES

should exist inside the world in a physical way.

Examples:

- courtyard stencil
- painted ground typography
- wall marking
- sign plate
- metal plaque

Avoid turning it into a giant graphic overlay.

The identity should feel embedded into the place.

---

# 18. DESIGN FOR MODULAR GROWTH

The asset system should allow future residents/workshops to be added easily.

That means:

- same perspective
- same palette family
- same export method
- same shadow logic
- same layer logic
- same naming structure
- same compositional rules

A new workshop should feel like:

> part of the same world from day one.

---

# 19. WORLDPLAY / INTERACTION DIRECTION

The experience is evolving into a game-like world, not just a map.

Therefore the design should support:

- larger workshop destinations
- enterable rooms / sub-scenes
- mini-game stations
- collectible materials
- modular crafting flow
- quests / objectives
- visible changes in the central courtyard

This means that design assets should not be thought of only as “decor.”

They are also:

- gameplay containers
- interaction anchors
- quest spaces
- transformation zones

---

# 20. PRIMARY GAMEPLAY MOTIF

The strongest current gameplay concept is:

# LA PIEZA CENTRAL

The player moves through different workshops, creates or collects components, and contributes to a collaborative sculpture / installation in the central courtyard.

This means design will eventually need:

- installation base / pedestal
- several modular sculpture states
- workshop-made components
- animated build states
- central visual payoff

The courtyard should be designed with enough spatial dignity to hold a growing central piece.

---

# 21. SECONDARY GAMEPLAY MOTIFS

Also keep room for:

## A. Encargos de La Bor
Repeatable creative commissions built across workshops.

## B. Activar La Bor
Preparing the place for an event / activation, making the world change visually.

This means future assets may include:

- event stage pieces
- banners
- display furniture
- posters
- crowd/activity state elements
- light-on / light-off variants

---

# 22. ASSET SYSTEM — EXPORT RULES

All world assets should be prepared for direct insertion into the digital experience without needing code changes beyond image replacement.

## Mandatory rules

- transparent background
- consistent view
- consistent lighting
- clean outer silhouette
- no baked UI
- no random text embedded unless explicitly needed
- export at 2× intended display size
- keep file bounds tight and clean
- avoid giant empty transparent margins

## Preferred formats

- PNG for transparency and iteration
- WebP for optimized final world assets
- SVG for logos, signage, certain flat objects if appropriate

---

# 23. RECOMMENDED FILE NAMING SYSTEM

Use a clean and scalable naming convention.

## World / architecture

- `world-floor-patio-v1.webp`
- `roof-nave-01-v1.webp`
- `roof-nave-02-v1.webp`
- `roof-nave-03-v1.webp`
- `roof-pabellon-01-v1.webp`
- `roof-pabellon-02-v1.webp`
- `roof-pabellon-03-v1.webp`
- `roof-pabellon-04-v1.webp`
- `roof-contraste-v1.webp`
- `roof-veta-v1.webp`
- `roof-mannino-v1.webp`

## Vegetation

- `tree-main-v1.webp`
- `tree-sidewalk-v1.webp`
- `shrub-01-v1.webp`
- `shrub-02-v1.webp`

## Props

- `prop-events-board-v1.webp`
- `prop-info-totem-v1.webp`
- `prop-worktable-v1.webp`
- `prop-pallet-stack-v1.webp`
- `prop-wood-stack-v1.webp`
- `prop-gate-main-v1.webp`
- `prop-gate-coba-v1.webp`

## Character

- `visitor-idle-front-v1.png`
- `visitor-walk-01-v1.png`
- `visitor-walk-02-v1.png`
- `visitor-walk-03-v1.png`
- `visitor-interact-v1.png`

## Interfaces

- `ui-overlay-frame-v1.svg`
- `ui-hotspot-label-v1.svg`
- `ui-inventory-tag-v1.svg`

## Logos

- `logo-labor-talleres-v1.svg`
- `logo-veta-v1.svg`
- `logo-contraste-v1.svg`
- `logo-mannino-v1.svg`

---

# 24. WORLD ASSET LIST — CURRENT PRIORITY

## Tier 1 — highest impact right now

These are the assets that most improve the current prototype visually.

### Visitor
- idle/front
- walk frame 1
- walk frame 2
- optional walk frame 3

### Floor
- central patio / concrete floor

### Architecture
- NAVE 01
- NAVE 02
- NAVE 03
- CONTRASTE
- VETA
- MANNINO
- PABELLÓN 01
- PABELLÓN 02
- PABELLÓN 03
- PABELLÓN 04

### Vegetation
- main tree with shadow

This set alone will dramatically upgrade the prototype.

---

# 25. WORLD ASSET LIST — SECONDARY

## Tier 2

### Vegetation
- shrubs
- sidewalk tree

### Props
- event board
- info totem
- worktable
- wood stack
- pallets
- gates
- installation base
- workshop signage

These add life and gameplay anchors.

---

# 26. WORLD ASSET LIST — TERTIARY

## Tier 3

### Overlays / content
- resident photos
- available-space images
- looping clips
- sound assets
- additional decorative props

These matter, but can come after the world base is established.

---

# 27. RECOMMENDED DIMENSIONS

These are approximate target sizes for creation/export.

## Floor
- patio floor texture: ~1700×700 minimum display logic
- export at 2× if possible

## Buildings / roofs
- NAVE 01 / 02: ~550×400 each
- NAVE 03: ~440×400
- PABELLÓN 01 / 02: ~550×300
- PABELLÓN 03: ~300×270
- PABELLÓN 04: ~350×300
- CONTRASTE: ~300×300
- VETA: ~250×560
- MANNINO: ~250×760

## Vegetation
- main tree: ~300×300
- shrubs according to use
- sidewalk tree proportional to map

## Visitor
- ~40×70 display logic
- export larger for crispness

---

# 28. BUILDING DIRECTION

Buildings should feel like simplified top-down architectural pieces, not fully detailed interiors.

## Desired look

- recognizable roof forms
- material differences
- industrial utility
- slight depth / relief
- subtle wear
- clean silhouette
- room for future animation or interaction highlights

## Avoid

- excessive fine detail
- hyperrealism
- noisy textures
- inconsistent roof perspectives

---

# 29. VETA / MANNINO RULE

There is an unresolved naming/occupancy question around the western strip.

Before final production, confirm:

- whether the southern portion belongs to MANNINO or VETA
- whether MANNINO is spelled `MANNINO` or `MANNNO`

Until confirmed, keep naming editable in files and labels.

---

# 30. CONTRASTE DIRECTION

CONTRASTE should feel distinct but still belong to the same world.

Because it is a jewelry workshop, it can carry subtle cues of:

- precision
- detail
- metallic refinement
- small-scale making

But the building still belongs to the broader industrial environment.

It should not suddenly look luxurious or disconnected.

---

# 31. VETA DIRECTION

VETA should suggest:

- wood
- making
- carpentry
- fabrication
- practical craft
- workshop utility

Small material cues can help make it distinct.

---

# 32. HERRERÍA DIRECTION

Even if not all herrería assets exist yet, plan for a future workshop scene with cues such as:

- metal
- heat
- sparks
- dark surfaces
- tooling
- frames
- sculptural structure

This will matter a lot once the gameplay layer expands.

---

# 33. CENTRAL COURTYARD DIRECTION

The courtyard is the heart of the world.

It must support:

- circulation
- event identity
- central sculpture growth
- signage
- shared community space
- world transformation

It should feel:

- open
- breathable
- important
- slightly ceremonial
- not empty in a dead way

Potential layers:

- floor stencil / marking
- object clusters
- event board
- info element
- future installation base
- vegetation anchor

---

# 34. OVERLAY IMAGE DIRECTION

Images used inside overlays are not map assets.

They are supporting content.

## Rules

- horizontal first
- clean framing
- good light
- real atmosphere
- show the resident’s work/environment
- avoid generic stock-feeling imagery

Priority:
- 1 image per resident
- 1 image per available space
- later loops/video

---

# 35. SOUND DIRECTION (FUTURE)

Sound remains off by default.

But future sound should match the world:

- courtyard room tone
- subtle work ambience
- metal hits
- saw / wood cues
- footsteps
- light environmental life

No cartoony sound design.

No excessive game chimes.

---

# 36. WHAT TO BUILD FIRST

If time is limited, do this first:

## Critical package
1. visitor
2. floor
3. main tree
4. CONTRASTE
5. VETA
6. NAVE 01
7. NAVE 02
8. NAVE 03
9. event board
10. logo LA BOR

That set gives the current world an immediate leap in quality.

---

# 37. WHAT CAN WAIT

Can be delayed without hurting the first prototype too much:

- final sound
- all video loops
- secondary vegetation
- every single prop
- fully refined overlay content
- final available-space marketing content

---

# 38. DESIGN QA CHECKLIST

Before considering any asset approved, ask:

## Style consistency
- Does it match the same world?
- Does it match the same angle?
- Does it match the same light direction?
- Does it fit the palette?

## Technical consistency
- Transparent background?
- Correct export format?
- Reasonable pixel size?
- Tight bounds?
- Easy to replace in code?

## Gameplay compatibility
- Clear shape?
- Good silhouette?
- Not too cluttered?
- Supports pathing / interaction visibility?
- If needed, can it be split into front/back layers?

---

# 39. ART PRODUCTION WORKFLOW

Recommended order:

## Step 1 — Lock style
Create 1 or 2 sample pieces to prove the direction:
- one roof/building
- one tree
- one floor crop
- one visitor pose

## Step 2 — Validate consistency
Make sure the world logic works together.

## Step 3 — Produce tier 1 assets
Architecture + visitor + floor + tree.

## Step 4 — Produce tier 2 assets
Props + additional vegetation.

## Step 5 — Produce tier 3 support assets
Overlay imagery, loops, sound, extras.

---

# 40. DESIGN DELIVERABLES

Before handing assets to engineering / Claude Code, try to have:

## Core design package
- art direction approved
- naming system
- file structure
- visitor frames
- floor
- main buildings
- main tree
- 2–5 props
- logos
- UI references if needed

## Nice-to-have
- resident photos
- space images
- loops
- sound placeholders
- extra props

---

# 41. FILE STRUCTURE RECOMMENDATION

Recommended organization:

```text
/public/assets/
  reference/
  world/
    floor/
    roofs/
    vegetation/
    props/
    installations/
  characters/
    visitor/
  ui/
  logos/
  overlays/
    residents/
    available-spaces/
  audio/
```

Keep it clean from the start.

---

# 42. CLAUDE CODE DESIGN INSTRUCTION

If this design package is given to Claude Code, the instruction should be:

> Use this document as the visual source of truth.
> Do not redesign the world arbitrarily.
> Preserve the current game logic and coordinate system where possible.
> Swap placeholder artwork with the provided assets.
> Keep movement, hotspots, layering and interactivity working.
> Respect transparency, positioning and naming conventions.
> Prepare the rendering system to support future front/back layer assets for trees and other objects.

---

# 43. FINAL DESIGN NORTH STAR

This project should feel like:

> **An explorable digital workshop world.**

Not:

- a corporate website
- a retro pixel game
- a toy-looking art project
- a decorative map with no life

The sweet spot is:

> **Industrial, artistic, 2D, animated, navigable, collectible, modular, and emotionally tied to the real place.**
