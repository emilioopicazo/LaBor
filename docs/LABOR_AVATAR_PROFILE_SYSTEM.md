# LA BOR — AVATAR / MINI PROFILE SYSTEM
## Five Tulum archetypes as cosmetic visitors

> Avatars are cosmetic.
>
> They should create personality without creating stat advantages.

---

# 1. Entry flow

Recommended:

```text
INTRO
↓
ENTRAR
↓
ELIGE TU PERSONAJE
↓
5 AVATARS
↓
CONFIRMAR
↓
SPAWN AT COBÁ
```

Keep selection under ~15 seconds.

Do not require account creation.

Nickname can be optional later.

---

# 2. Mini profile

Profile should contain only:

```text
avatar
optional nickname
current mission
small collection / completed pieces later
```

No need for:
- age
- gender selection form
- long onboarding
- skill trees

---

# 3. Five Tulum archetypes

These are fictional archetypes, not real people.

## 01 — LA SPORTY

Mood:
- polished
- sporty
- “fresa”
- Tulum wellness / active lifestyle

Visual:
- fitted sports set
- sneakers
- cap / visor
- bottle or small tote
- clean ponytail / bun

Palette:
- neutral cream
- charcoal
- one muted accent

---

## 02 — EL PLAYERO

Mood:
- casual
- beach-first
- relaxed
- sun / surf energy

Visual:
- sleeveless shirt
- beach shorts
- sandals
- sunglasses
- loose posture

Palette:
- faded sand
- washed charcoal
- muted sea tone

---

## 03 — EL TULUMINATI

Mood:
- ceremonial / bohemian
- linen
- flowing fabric
- intentionally “Tulum”

Visual:
- draped shirt / robe-like layer
- loose pants
- sandals
- scarf / woven accessory
- long silhouette

Palette:
- bone
- warm gray
- earth / clay

Avoid parody becoming offensive; keep it playful and recognizable.

---

## 04 — LA CREATIVA

Mood:
- resident artist
- maker
- practical
- workshop-ready

Visual:
- overalls / work pants
- simple tee
- bandana
- sketchbook / tote
- practical sneakers or boots

Palette:
- charcoal
- dirty white
- muted oxide

This character visually belongs inside La Bor.

---

## 05 — EL NÓMADA NOCTURNO

Mood:
- design / music / tech
- DJ / creative traveler energy
- understated black styling

Visual:
- oversized dark shirt
- cargos
- crossbody
- sunglasses
- optional headphones

Palette:
- black
- graphite
- very small metallic accent

---

# 4. Character art rules

All five must use:
- same base proportions
- same hitbox
- same animation timing
- same sprite dimensions
- same shadow
- same speed
- same gameplay capabilities

Only art changes.

---

# 5. Sprite sheet

Recommended minimum per avatar:

```text
DOWN:
  idle
  walk-1
  walk-2
  walk-3

UP:
  idle
  walk-1
  walk-2
  walk-3

SIDE:
  idle
  walk-1
  walk-2
  walk-3
```

Mirror SIDE for left/right if the art allows it.

Total:
```text
12 frames per avatar
```

Five avatars:
```text
60 frames
```

This is manageable.

Optional later:
- interact
- celebrate
- carry-object

---

# 6. Pixel / 2D consistency

If pixel-art rendering is used:
- one shared logical resolution
- no mixed pixel density
- nearest-neighbor scaling
- integer camera positioning where possible

Character must remain legible on small phones.

---

# 7. Selector UI

Mobile layout:

```text
<          AVATAR          >
        CHARACTER

      LA SPORTY
   breve descriptor

      ELEGIR
```

Support:
- swipe
- left/right arrows
- tap thumbnail row if space allows

Do not show 5 tiny full-body figures at once as the only selection mechanism.

---

# 8. Persistence

Store chosen avatar separately from mission state.

Example:

```ts
type PlayerProfile = {
  avatarId: string
  nickname?: string
}
```

Persist with:
```text
localStorage
```

Key example:
```text
labor.profile.v1
```

Avatar persists when a mission restarts.

---

# 9. Change outfit later

Profile menu should include:

```text
CAMBIAR PERSONAJE
```

Changing avatar:
- does not reset mission
- does not change rewards
- does not teleport player

---

# 10. Future unlocks

Later, the same system can support:
- shirts
- helmets
- aprons
- workshop-made accessories

But V1 should launch with five complete presets.

Avoid building a full character editor now.
