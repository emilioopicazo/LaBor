# LA BOR — GAMEPLAY V1 HANDOFF

> Extracto de las secciones 91–106 de `LABOR_DIGITAL_EXPERIENCE_HANDOFF_V2.md` (fuente de verdad del gameplay).

# 91. NEXT PHASE — GAMEPLAY EXPANSION / V1

> **Important:** this section describes the next product phase after the basic spatial prototype is stable.
>
> Do not destabilize V0 movement/camera/map systems to implement this prematurely.
>
> V0 proves: **“I can walk through La Bor.”**
>
> V1 proves: **“There are reasons to walk through La Bor.”**

The experience should evolve from spatial website into a lightweight 2D explorable game.

The objective is still NOT to build a complex videogame.

The objective is to make La Bor feel alive, interactive and rewarding enough that users want to explore every workshop.

## 91.1 New gameplay principle

The main property map becomes the **OVERWORLD**.

The player can:

- walk around the courtyard
- move around buildings
- move visually in front of and behind vegetation / props
- discover animated objects
- interact with physical installations
- enter real workshops
- complete simple activities
- collect materials / progress
- return to the courtyard
- use results from one workshop inside another
- contribute to a larger shared objective

The experience should feel like:

```text
digital workshop
+
point-and-click exploration
+
simple crafting/adventure loop
```

Not like:

```text
arcade
RPG
platformer
complex simulator
```

## 91.2 Remove the generic central “TALLERES” hotspot

The generic `TALLERES` interaction currently imagined in the center of the map should be removed.

The actual resident workshops ARE the workshops.

The player should discover and enter:

- HERRERÍA
- VETA / CARPINTERÍA
- CONTRASTE / JOYERÍA
- future resident workshops

The courtyard should contain physical installations, events, objectives and shared objects instead of a generic “TALLERES” button.

## 91.3 Larger playable workshop areas

Resident workshops should stop being only information overlays.

Each important workshop can become a **dedicated 2D room / sub-scene**.

Suggested architecture:

```text
OVERWORLD / PATIO
  ↓
enter workshop
  ↓
WORKSHOP ROOM
  ↓
walk around inside
  ↓
interact with 2–4 stations
  ↓
complete activity / collect result
  ↓
exit
  ↓
OVERWORLD
```

Suggested internal logical size:

```ts
WORKSHOP_ROOM_WIDTH = 1200–1600
WORKSHOP_ROOM_HEIGHT = 800–1100
```

## 91.4 Workshop scene system

Create reusable scene definitions:

```ts
interface WorkshopScene {
  id: string
  name: string
  worldAsset: string

  spawnPoint: { x: number; y: number }
  exitPoint: { x: number; y: number }

  walkableAreas: Polygon[]
  obstacles: Obstacle[]
  stations: WorkshopStation[]
  ambientAnimations?: AmbientAnimation[]
}
```

This architecture must allow future resident workshops to be added without rewriting the full game.

## 91.5 Dynamic 2D depth / occlusion

The player must be able to move:

- above objects
- below objects
- behind trees
- in front of trees
- behind tables
- in front of machinery

Use depth sorting based primarily on each visual element's **ground anchor Y coordinate**.

Concept:

```ts
renderOrder = groundAnchorY
```

Objects define a bottom/ground anchor.

The player should render:

- behind an object when player Y is above the object's anchor
- in front when player Y is below the object's anchor

Do not rely on fixed SVG layers only.

## 91.6 Tree occlusion

Trees should be split conceptually into:

```text
TREE BASE / TRUNK
TREE CANOPY
```

The player can pass partially behind the trunk and visually underneath the canopy.

If SVG is used, separate trunk/base and canopy into distinct nodes.

If image assets are used, prefer separate transparent assets where useful.

## 91.7 World animation

Animate selectively:

- leaves
- fans
- welding sparks
- lamps
- hanging cables
- smoke / dust
- machinery idle motion
- small workshop activity
- posters
- shadows
- doors / gates

Almost every area should have at least one sign of life, without making the world noisy.

## 91.8 Interactable object standard

```ts
interface InteractiveObject {
  id: string
  sceneId: string
  type:
    | "station"
    | "collectible"
    | "installation"
    | "door"
    | "npc"
    | "prop"

  position: { x: number; y: number }
  interactionRadius: number
  interactionType: string
  animation?: string
  requires?: Requirement[]
  rewards?: Reward[]
}
```

## 91.9 Gameplay needs a motive

Do NOT add arbitrary points only because games have points.

Every interaction should contribute to at least one of:

- creating something
- unlocking something
- collecting useful material
- completing an objective
- changing the physical/digital workshop
- discovering content

The player should understand why the action matters.

## 91.10 Recommended progression foundation

### Materials

Initial resource categories:

```text
MADERA
METAL
PLATA
COMPONENTES
```

### Puntos de oficio

A universal lightweight progression score earned for:

- completing workshop interactions
- discovering installations
- finishing cross-workshop tasks
- creating objects

Keep the score discreet.

## 91.11 Minimal inventory

```ts
interface Inventory {
  materials: {
    wood: number
    metal: number
    silver: number
  }

  components: string[]
  completedObjects: string[]
  oficioPoints: number
}
```

No complex RPG inventory, rarity system or economy.

## 91.12 Workshop mini-interactions

Each workshop should contain 1–3 simple interactions, roughly 10–40 seconds each.

### HERRERÍA

Possible stations:

**Forge / hammer**
- abstract timing interaction
- produce a metal component

**Welding station**
- simple hold/trace interaction
- combine metal components

Rewards:
- METAL COMPONENT
- PUNTOS DE OFICIO

### VETA / CARPINTERÍA

Possible stations:

**Cut**
- alignment interaction

**Sand**
- hold/swipe until target finish

**Assemble**
- small 2D shape-fitting interaction

Rewards:
- WOOD PIECE
- WOOD FRAME
- BASE
- PUNTOS DE OFICIO

### CONTRASTE / JOYERÍA

Possible stations:

**Form / wax**
- simple shape/tracing interaction

**Polish**
- short circular/swipe interaction

**Detail**
- select a finishing detail

Rewards:
- SILVER COMPONENT
- CHARM
- DETAIL PIECE
- PUNTOS DE OFICIO

Mechanics should remain abstract and artistic, not instructional manufacturing simulators.

## 91.13 Future workshop plug-in model

Each new resident may add:

```text
1 workshop room
2–4 interactable stations
1 material/component type
1 visual identity
1–3 quest contributions
```

---

# 92. MOTIVE OPTION A — LA PIEZA CENTRAL

This is the strongest first narrative concept.

## Premise

The courtyard contains an empty plinth / construction area.

The player helps create a collaborative La Bor installation.

Example chain:

```text
1. Discover central empty installation site
2. Receive objective: CONSTRUIR LA PIEZA
3. Go to VETA
4. Acquire / create wooden base
5. Go to HERRERÍA
6. Forge structural metal component
7. Return / combine parts
8. Go to CONTRASTE
9. Produce a silver/detail element
10. Bring all components to courtyard
11. Assemble installation
12. Installation appears physically in the map
13. Receive completion / OFICIO reward
```

The crucial reward is:

# THE WORLD CHANGES.

Before:
```text
empty installation site
```

After:
```text
completed collaborative sculpture
```

Future variation can allow different component choices to create different final sculptures.

---

# 93. MOTIVE OPTION B — ENCARGOS DE LA BOR

A repeatable creative-commission system.

A physical board in the courtyard contains small briefs such as:

```text
UNA LÁMPARA
UN BANCO
UN LETRERO
UNA PIEZA PARA EL PATIO
UN TROFEO
UNA PEQUEÑA ESCULTURA
```

Each commission requires multiple workshops.

Example:

```text
ENCARGO: LÁMPARA

VETA
→ create wooden base

HERRERÍA
→ create metal arm

CONTRASTE
→ create small reflective detail

COURTYARD
→ assemble object
```

Finished objects can appear in:

- courtyard
- archive
- exhibition wall
- shelves
- installations

This creates replayability and lets future workshops become ingredients in new commissions.

Recommended role:

```text
LA PIEZA CENTRAL = first major quest
ENCARGOS = repeatable loop after / during it
```

---

# 94. MOTIVE OPTION C — ACTIVAR LA BOR

A larger environmental/event objective.

## Premise

La Bor begins in a quieter daytime state.

The player helps prepare the property for an event / exhibition / nighttime activation.

Example:

```text
VETA
→ build display stands / benches

HERRERÍA
→ build frames / installation support

CONTRASTE
→ create markers / detail pieces

PATIO
→ install objects

EVENTOS BOARD
→ activate event

FINAL
→ lights turn on
→ courtyard becomes populated / animated
→ completed installations appear
```

The reward is the full map transitioning into an **activated event state**.

This communicates what La Bor actually represents:

- workshops
- collaboration
- making
- events
- culture
- community

---

# 95. RECOMMENDED GAME STRUCTURE

The three systems do not need to be mutually exclusive.

Recommended hierarchy:

## MAIN STORY
`LA PIEZA CENTRAL`

Introduces every workshop and the collaboration concept.

## REPEATABLE LOOP
`ENCARGOS DE LA BOR`

Provides ongoing reasons to explore and create.

## LARGE / SEASONAL OBJECTIVE
`ACTIVAR LA BOR`

Transforms the environment around events or special activations.

This is substantially stronger than generic point collection.

---

# 96. LIGHTWEIGHT QUEST SYSTEM

```ts
interface Quest {
  id: string
  title: string
  description: string
  type: "main" | "commission" | "event"

  steps: QuestStep[]

  rewards: Reward[]
  worldChanges?: WorldChange[]
}
```

```ts
interface QuestStep {
  id: string
  text: string
  sceneId?: string
  stationId?: string
  requiredItems?: string[]
  completed: boolean
}
```

Keep this lightweight and only implement what current gameplay needs.

---

# 97. WORLD CHANGES

Completed objectives should visibly modify world state.

Examples:

- sculpture appears
- bench appears
- sign appears
- lights activate
- banner appears
- installation gains a component
- event state activates

Visible transformation matters more than points alone.

---

# 98. CENTRAL COURTYARD PURPOSE

After removing the generic `TALLERES` hotspot, the courtyard can contain:

```text
CENTRAL INSTALLATION SITE
EVENTS BOARD
INFO TOTEM
CREATED OBJECTS
TEMPORARY INSTALLATIONS
SEATING
ART / MATERIAL OBJECTS
```

It becomes the visible record of what the player has done.

---

# 99. PLAYER FEEDBACK

Keep feedback minimal and editorial.

Examples:

```text
+ MADERA

COMPONENTE COMPLETADO

+20 OFICIO

PIEZA 2/4
```

Avoid arcade UI, giant score popups and confetti.

---

# 100. SAVE STATE

For the first gameplay prototype use:

```text
localStorage
```

Persist:

- inventory
- oficio points
- completed quest steps
- created objects
- world state

No backend/auth/database yet.

---

# 101. GAMEPLAY DEBUG MODE

Extend debug tools to expose:

- current scene
- player location
- inventory
- active quest
- quest step
- interactable bounds
- render-depth anchors
- current world flags
- reset local save

---

# 102. ASSET REQUIREMENTS FOR GAMEPLAY V1

The user will provide a new, more specific custom design direction.

Do not permanently lock visual implementation around current placeholder styling.

## OVERWORLD

- courtyard floor
- roofs/buildings
- trees split for depth where useful
- gates
- installations
- events board
- info objects

## WORKSHOP ROOMS

- HERRERÍA room
- VETA / carpentry room
- CONTRASTE / jewelry room

## STATIONS

- forge
- welding bench
- carpentry table
- wood station
- jewelry bench
- polish station

## PLAYER

- idle
- walk frames
- optional interaction pose

## QUEST OBJECTS

- wood components
- metal components
- silver components
- central sculpture stages
- commission outputs

---

# 103. ASSET RULES

Unless superseded by a future art-direction specification:

- top-down / model-like 2D perspective
- consistent camera angle
- consistent lighting
- northwest light
- shadows southeast
- transparent background
- muted industrial palette
- no baked labels unless needed
- export at 2× intended display resolution

World interaction coordinates must remain independent from artwork.

---

# 104. IMPLEMENTATION ORDER

Do not implement all mini-games at once.

## V1.1

- dynamic Y depth
- tree occlusion
- one workshop room
- one simple interaction
- inventory
- one reward

## V1.2

- second workshop
- cross-workshop dependency
- first quest

## V1.3

- third workshop
- central installation

## V1.4

- repeatable commission board

## V1.5

- activated event state

---

# 105. FIRST GAMEPLAY ACCEPTANCE CRITERIA

The first gameplay expansion is successful when:

1. I can move through the courtyard.
2. I can pass visually in front of and behind a tree.
3. The environment contains subtle animation.
4. I can enter at least one workshop room.
5. I can walk inside that room.
6. I can interact with one craft station.
7. The interaction gives me a material/component.
8. My inventory persists.
9. I can return to the courtyard.
10. The material is useful in a quest.
11. A completed action visibly changes something in the world.

---

# 106. V1 CREATIVE NORTH STAR

V0:

> **“I can walk through La Bor.”**

V1:

> **“I can make things inside La Bor.”**

Long-term:

> **“What I make changes La Bor.”**

