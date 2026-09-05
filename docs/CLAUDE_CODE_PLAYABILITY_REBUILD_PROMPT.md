# CLAUDE CODE — PLAYABILITY-FIRST REBUILD PROMPT

Read these documents first:

1. `docs/LABOR_PLAYABILITY_MOBILE_REBUILD.md`
2. `docs/LABOR_REAL_MAP_TILED_GUIDE.md`
3. `docs/LABOR_AVATAR_PROFILE_SYSTEM.md`
4. `docs/LABOR_MISSIONS_MINIGAMES_SYSTEM.md`
5. `docs/LABOR_ART_DIRECTION_ASSETS.md`
6. `docs/LABOR_DIGITAL_EXPERIENCE_HANDOFF_V2.md`
7. `docs/LABOR_GAMEPLAY_V1_HANDOFF.md`

Also inspect:

```text
public/assets/reference/labor-master-plan.png
public/assets/reference/260823_TRAMA-layout.pdf
```

## PRIORITY

The highest priority is **playability**, especially mobile.

Do not spend this phase polishing textures, typography, fauna or decorative animation while controls, camera and geometry still feel wrong.

A gray/debug version that is extremely pleasant to control is more valuable than a beautiful version that feels broken.

---

## CURRENT PROBLEMS TO FIX

The current experience has these known problems:

- mobile movement is difficult / confusing
- camera/world framing does not feel natural
- the digital site does not sufficiently match the real property perimeter
- building footprints and circulation are based on an older design approximation
- too much geometry lives in hardcoded TypeScript
- interaction affordances are ambiguous
- `ENTRAR AL ESPACIO MÁS CERCANO` is not a sufficiently predictable mobile action model
- current station gameplay is a hold-to-complete progress bar rather than a real minigame
- UI competes with the world on small screens

Treat these as product bugs, not art issues.

---

## ARCHITECTURE DECISION TO EVALUATE AND IMPLEMENT

Unless repository constraints reveal a serious blocker, migrate the actual explorable game layer to:

```text
React + TypeScript + Vite
        +
      Phaser
        +
       Tiled
```

Do not rebuild the entire site.

### Keep React for
- intro
- avatar selector
- overlays
- resident information
- menus
- contact
- mission summaries

### Move / implement in Phaser
- player
- input
- world
- camera
- collisions
- depth
- sprite animation
- workshop scenes
- interaction zones
- minigame scenes

### Use Tiled for
- property boundary
- walkable geometry
- building footprints
- collision
- doors
- spawn
- POIs
- props / anchors

If an incremental bridge is cleaner, build the bridge first and migrate the overworld before workshop interiors.

---

## DO NOT

- do not rewrite every React overlay
- do not add backend/auth
- do not redesign final art
- do not invent new building geometry
- do not keep hardcoding map coordinates if Tiled can own them
- do not implement all future quests
- do not overengineer multiplayer/networking
- do not ship before mobile playtest criteria pass

---

# PHASE 1 — GAME SHELL

1. Add Phaser using the official React/TypeScript/Vite integration pattern.
2. Mount Phaser inside the existing React experience.
3. Establish a clean event bridge:
   - React → Phaser commands
   - Phaser → React events
4. Preserve existing editorial overlays while the world migrates.

Deliver:
- existing app still boots
- Phaser scene can mount/unmount cleanly
- no duplicate pointer handlers

---

# PHASE 2 — REAL OVERWORLD

Create `labor-overworld.tmj`.

Use the actual master plan as the locked tracing reference.

Trace:
- actual property boundary
- buildings
- Cobá opening
- walkable patio/circulation
- tree collision
- doors
- spawns
- POIs

Do NOT use the old full rectangular WALKABLE_AREA as the source of truth.

Create a debug rendering before adding final art.

Acceptance:
- overlaying traced map against the master plan shows no major spatial mismatch

---

# PHASE 3 — MOBILE CONTROL REBUILD

Implement:

## Movement
- floating analog joystick restricted to left-side gameplay zone
- normalized analog input
- small feet collider
- axis/collision sliding
- direct responsive movement

## Context action
Bottom-right contextual button:
- ENTRAR
- JUGAR
- USAR
- VER
depending on nearby interactable

Remove the generic “nearest space” behavior as the primary mobile interaction.

## Optional
Keep tap-to-walk on free ground only if it does not create input conflicts.

Acceptance:
- no accidental interaction while steering
- no joystick spawning over UI
- no sticky corners

---

# PHASE 4 — CAMERA

Use Phaser camera systems.

Implement:
- world bounds
- player follow
- smooth lerp
- deadzone
- mobile-specific framing
- integer rounding where appropriate

Do not try to show the whole property on portrait mobile.

Interaction:
- subtle zoom in / focus
- smooth zoom back out

Acceptance:
- camera does not jitter
- player is not mechanically recentered every tiny step
- user keeps spatial context

---

# PHASE 5 — HUD CLEANUP

On mobile keep persistent UI minimal:

- avatar/profile top-left
- menu top-right
- current mission only when active
- context action bottom-right
- joystick only while touched

Convert:
- rewards
- points
- help
into temporary / menu-based UI.

Respect safe-area insets.

---

# PHASE 6 — AVATAR SELECTOR

Implement 5 cosmetic avatars:

1. `sporty`
2. `playero`
3. `tuluminati`
4. `creativa`
5. `nomada-nocturno`

Use placeholder sprite sheets if art is not yet available.

All:
- identical collider
- identical speed
- identical stats
- cosmetic only

Persist avatar independently from mission state.

---

# PHASE 7 — MISSION RUN STATE

Refactor state into:

```text
PROFILE STATE — persistent
MISSION RUN — resettable
```

Implement:
- `startMission`
- `restartMission`
- `resumeMission`
- `completeMission`

Starting/restarting must reset:
- temporary inventory
- minigames
- mission flags
- central-piece stages

Avatar remains.

---

# PHASE 8 — REAL MINIGAMES

Replace hold-to-complete station interactions.

Implement three functioning games:

## VETA
Tic-Tac-Toe / Gato

## MANNINO
Connect Four

## CONTRASTE
Memory / Matching Pairs

Requirements:
- actual rule logic
- touch-first
- replay
- success/failure
- mission result callback
- no fake progress bar

Do not make them visually complex yet.

Correct logic first.

---

# PHASE 9 — MISSION LOOP

Wire the first mission:

```text
LA PIEZA CENTRAL
```

Player:
- starts fresh run
- visits workshops
- completes games
- receives components
- returns to courtyard
- installs components
- visibly completes sculpture

Restart:
- sculpture and temporary state reset

---

# PHASE 10 — ONLY THEN ART POLISH

After playability acceptance passes:
- integrate final assets
- animation
- tree wind
- workshop ambience
- resident imagery
- design refinements

Do not use art as a workaround for unclear navigation.

---

# MOBILE PLAYTEST GATE

Before calling this work complete, manually test:

```text
360 × 800
390 × 844
393 × 852
430 × 932
844 × 390
932 × 430
```

For every size:

1. enter
2. choose avatar
3. walk around tree
4. reach CONTRASTE
5. enter/exit
6. reach VETA
7. start mission
8. play a minigame
9. return to patio
10. restart mission

Fix:
- stuck movement
- accidental taps
- poor camera framing
- HUD overlap
- inaccessible controls
- confusing actions

before decorative polish.

---

# FINAL REPORT

When complete, report:

## Architecture
What remains React vs Phaser vs Tiled.

## Geometry
How the real plan was calibrated and traced.

## Mobile controls
Exact joystick/action behavior.

## Camera
Follow, deadzone, zoom and bounds.

## Avatar
How profiles/sprites are configured.

## Mission state
What persists and what resets.

## Minigames
Logic and scene structure.

## Playtest
Which viewport sizes were tested and what was fixed.

## Remaining assets
Only the design assets still needed after the gameplay foundation is stable.
