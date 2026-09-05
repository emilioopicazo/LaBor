# LA BOR — MISSIONS & MINIGAMES SYSTEM
## Resettable mission runs + three real mobile-friendly minigames

---

# 1. Main rule

Starting a mission creates a **fresh mission run**.

The player profile is persistent.

The mission run is temporary.

This distinction is critical.

---

# 2. State separation

## Persistent profile

```ts
type PlayerProfile = {
  avatarId: string
  nickname?: string
}
```

Persists:
- chosen avatar
- future cosmetic unlocks
- optional long-term achievement summary

## Mission run

```ts
type MissionRun = {
  runId: string
  missionId: string
  startedAt: number

  currentStep: string
  temporaryInventory: string[]
  completedMinigames: string[]
  temporaryWorldFlags: string[]

  score: number
  completed: boolean
}
```

This resets when the mission starts again.

---

# 3. Start mission behavior

`startMission(missionId)` must:

1. end / discard existing run
2. create new `runId`
3. clear temporary inventory
4. clear workshop completion flags
5. reset minigames
6. reset central sculpture stages
7. reset mission-specific world props
8. spawn / return player to mission start point
9. begin step 1

Profile/avatar stays unchanged.

---

# 4. Restart mission

Provide explicit:

```text
REINICIAR MISIÓN
```

Before restart:
- simple confirmation

Then:
- fresh run
- no stale station completion
- no stale minigame boards
- no leftover materials

---

# 5. Reload behavior

Recommended:

- browser reload resumes the current run
- explicit `REINICIAR MISIÓN` resets it
- choosing `INICIAR` from mission selector always creates a new run

This avoids punishing accidental refreshes.

---

# 6. Main mission

## LA PIEZA CENTRAL

Recommended first route:

```text
1. discover pedestal
2. start mission
3. VETA → complete wood activity / minigame
4. receive WOOD COMPONENT
5. MANNINO → complete metal activity / minigame
6. receive METAL COMPONENT
7. CONTRASTE → complete detail activity / minigame
8. receive SILVER / DETAIL COMPONENT
9. return to patio
10. assemble
11. sculpture appears
12. mission complete
```

World changes should be visible.

---

# 7. Minigame philosophy

The current “hold until 100%” interaction should be replaced.

A minigame must have:
- a clear board/state
- player input
- actual rules
- success/failure
- replay
- touch targets
- short duration
- no tutorial longer than one sentence

Target duration:

```text
15–90 seconds
```

Failure should not punish harshly.

Allow instant replay.

---

# 8. Minigame 01 — GATO / TIC-TAC-TOE

Recommended workshop:
## VETA

Theme:
- carved wooden board
- wooden X/O tokens or two simple symbols

Board:
```text
3 × 3
```

Input:
- tap cell

Opponent:
- AI

Logic:
- standard win lines
- AI can use minimax
- game ends win / lose / draw

Mission rule:
- win = component awarded
- draw / loss = retry

Optional easier mode:
- AI occasionally chooses a non-optimal move

Mobile:
- board large
- minimum cell roughly 72 CSS px when possible
- no tiny text

---

# 9. Minigame 02 — CONECTA 4

Recommended workshop:
## MANNINO / HERRERÍA

Theme:
- metal frame
- metal discs / washers / fabricated pieces

Board:
```text
7 columns × 6 rows
```

Input:
- tap column

Rules:
- gravity
- alternate player/AI
- detect horizontal / vertical / diagonal four

AI V1:
1. play immediate winning move
2. block player's immediate winning move
3. prefer center
4. choose reasonable random valid column

No need for heavyweight perfect AI initially.

Mission:
- win = METAL COMPONENT
- loss = retry

---

# 10. Minigame 03 — MEMORIA / PAREJAS

Recommended workshop:
## CONTRASTE

Why this one:
- extremely intuitive on touch
- no precision gestures
- simple real logic
- visually adaptable to jewelry
- fast to build
- no AI required

Theme cards:
- charms
- ring forms
- small metal shapes
- stone silhouettes
- tools

Board:
```text
4 × 3
```

6 pairs.

Input:
- tap card
- tap second card

Rules:
- matched pair stays revealed
- mismatch hides after short delay
- complete all pairs

Scoring:
- moves
- optional time

Mission:
- completion = DETAIL COMPONENT

Do not require a strict timer for first version.

---

# 11. Minigame architecture

Use a shared contract.

```ts
type MinigameResult = {
  gameId: string
  success: boolean
  score?: number
  durationMs: number
}
```

Each game should expose:

```ts
start()
reset()
destroy()
onComplete(result)
```

Do not let minigames directly mutate global mission state.

They return a result.

Mission controller decides the reward.

---

# 12. Phaser scene approach

Recommended scenes:

```text
MinigameTicTacToe
MinigameConnectFour
MinigameMemory
```

Or one reusable Minigame Scene host.

On launch:
- pause workshop scene
- open minigame
- complete
- return result
- resume workshop

React overlay may still be used for title/reward if desired.

---

# 13. Minigame mobile UI

Use:
- centered play board
- maximum board size based on shortest viewport dimension
- safe-area padding
- one close/back button
- one restart button after failure
- no gameplay HUD clutter

Touch:
- no hover dependencies
- no drag required for these first three
- no double taps
- no press-and-hold

---

# 14. Success transition

Keep it short.

Example:

```text
COMPONENTE COMPLETADO
+ METAL
```

Then:
```text
VOLVER AL TALLER
```

No giant victory cinematic.

---

# 15. Mission UI

Only show current objective.

Examples:

```text
LA PIEZA · 1/4
VE A VETA
```

Then:

```text
LA PIEZA · 2/4
LLEVA LA MADERA A MANNINO
```

Do not show a huge quest log unless opened from menu.

---

# 16. Temporary world flags

Mission-specific visual changes:

```text
pieza.baseInstalled
pieza.metalInstalled
pieza.detailInstalled
pieza.complete
```

These belong to the current run.

Restarting mission clears them.

---

# 17. Mission completion

Completion may:
- show final sculpture
- award a summary
- save one permanent achievement if desired

But when starting that mission again:
- sculpture returns to initial mission state
- mission components reset

If a permanent “completed before” badge exists, that can stay in profile.

---

# 18. Debug

Development menu should allow:

```text
START MISSION
RESTART MISSION
SKIP STEP
GIVE COMPONENT
OPEN GATO
OPEN CONECTA 4
OPEN MEMORIA
CLEAR RUN
```

This will save enormous iteration time.

---

# 19. Acceptance tests

## Mission
- new start is always fresh
- restart clears every temporary state
- avatar remains selected
- refresh does not corrupt run
- mission can be completed twice consecutively

## Gato
- no invalid moves
- win/draw/loss correct
- AI never places on occupied cell

## Connect Four
- gravity correct
- no overfilled columns
- all win directions detected

## Memory
- only two unmatched cards may be open
- matched cards stay open
- rapid tapping cannot break state
- completion detected correctly

## Mobile
- all games usable at 360px width
- no board under safe areas
- no browser scrolling
