# LA BOR — TALLERES

Mundo 2D explorable del complejo de talleres La Bor (Tulum, Q.R.).

> **"No navegar la página. Recorrer el taller."**
>
> V0: *puedo caminar por La Bor.* · V1: *puedo hacer cosas dentro de La Bor.* · **V2: *se siente como un juego pequeño y real, primero en el teléfono.***

La arquitectura física de La Bor es la interfaz. Una intro breve dice qué es
La Bor, eliges tu personaje, el portón se abre y apareces en el **INGRESO
real** (Calle 12 Sur). Caminas por el patio trazado del plano, entras a los
talleres, ganas un componente en cada minijuego de los residentes y armas
**LA PIEZA CENTRAL** en el pedestal. Cada espacio disponible tiene su renta y
un botón para mandar propuesta por WhatsApp.

---

## Cómo correr

```bash
npm install
npm run dev        # desarrollo → http://localhost:5173
npm run build      # typecheck + build de producción → dist/
npm run preview    # sirve el build de producción
```

## Arquitectura (V2)

```
REACT + TYPESCRIPT + VITE  ←→  PHASER 3.90  ←→  TILED (labor-overworld.tmj)
   intro, selector de avatar,      visitante, input, cámara,        perímetro real, huellas,
   overlays, menú, misión,         colisión, profundidad,           circulación, puertas,
   minijuegos (DOM), HUD           patio y cuartos, joystick        spawns, POIs, obstáculos
```

- **React** conserva todo lo editorial: `Intro`, `AvatarSelector`, `SpaceOverlay`,
  `MissionOverlay`, `FastMenu`, HUD (`chip`, `mission-line`, `ActionButton`,
  `JoystickView`) y los tres minijuegos como tableros DOM táctiles.
- **Phaser** vive en `src/game/phaser/` y se carga en un chunk aparte después
  de la intro: `BootScene` (mapa + sprites + animaciones), `WorldScene` (base:
  movimiento, joystick, tap-to-walk, cámara, interactuables), `OverworldScene`
  (patio desde Tiled) y `RoomScene` (interiores desde `src/data/rooms.ts`).
- **Puente** `src/game/bridge.ts`: React manda comandos (`enterRoom`, `exitRoom`,
  `goTo`, `teleport`, `setAvatar`, `setPaused`, `setWorldFlags`, `triggerAction`,
  `focus`); Phaser emite eventos (`ready`, `action`, `interact`, `joystick`,
  `player`, `arrived`, `escape`). Ninguno importa al otro.
- **Tiled** es la fuente de verdad espacial. `src/data/spaces.ts` describe
  contenido (nombres, renta, CTAs) y se relaciona con el mapa por
  `space.id === object.spaceId`. No hay coordenadas de edificios en TypeScript.

## Geometría real

`public/maps/labor-overworld.tmj` se trazó del plano vectorial
`public/assets/reference/260823_TRAMA-layout.pdf`: se extrajeron los
segmentos del PDF y se calibró con la cota de 34.90 m (22.384 pt/m → **48 px
= 1 m**). Origen: esquina NO del rectángulo envolvente; x → este, y → sur.
Predio 34.90 × 42.09 m (chaflán en la esquina NO; **INGRESO** de 5.1 m en el
muro este, Calle 12 Sur; sin abertura en Cobá en el plano).

Capas: `00_REFERENCE_PLAN` (imagen a 48 px/m, solo calibración),
`PROPERTY_BOUNDARY`, `BUILDING_COLLISION` (VETA / MANNNO / franja sur /
Pabellón 04 / CONTRASTE / Pabellones 01–03 / Naves 01–03), `WALKABLE`
(patio + pasillo del árbol + bolsa norte de P03 + ingreso con banqueta),
`DOORS` (puerta en la cara que da al patio), `SPAWNS` (`main-ingreso`,
`return-<espacio>`), `POI` (pedestal, tablero de eventos, tótem), `OBSTACLES`
(tronco, pedestal, tablero, tótem, madera, tarimas), `DEPTH_ANCHORS` y `ART_*`.

- `maps/labor.tiled-project` abre el mapa en Tiled con las clases ya definidas.
- `scripts/build-overworld-map.mjs` documenta el trazado inicial en metros y
  regenera el TMJ. Si editas el mapa en Tiled, **no** lo vuelvas a correr.
- `?mapdebug=1` dibuja el plano encima del juego más polígonos, puertas,
  spawns, POIs y el colisionador del visitante.

## Controles

- **Móvil**: joystick flotante que nace donde cae el pulgar en la mitad
  izquierda (zona muerta 6 px, radio 44 px, diagonales normalizadas, el
  anillo sigue al dedo). **Un** botón contextual abajo-derecha que dice lo
  que va a pasar: ENTRAR · VER · JUGAR · INSTALAR · SALIR. Tocar el piso
  libre camina hasta ahí (secundario). Prioridad: UI > interactuables >
  joystick > tap-to-walk.
- **Escritorio**: WASD / flechas, `E` / `Enter` / espacio para actuar,
  clic para caminar, `ESC` cierra.
- Colisión: círculo de 16 px a la altura de los pies (≈0.33 m); el paso se
  resuelve por ejes y, si hace falta, girado ±25°/±50°/±75°, así el
  visitante desliza por muros, esquinas y el tronco sin atorarse.
- Velocidad 170 px/s (≈3.5 m/s); viaje rápido desde el menú ×2.6.

## Cámara

Phaser `startFollow` con lerp 0.09, zona muerta 34 % × 24 % del viewport,
límites = predio + banqueta + 2.2 m de calle, `roundPixels`. Zoom base por
viewport: un teléfono vertical ve ~9.5 m de ancho (no todo el predio),
horizontal ~18 m, escritorio ~22 m; los cuartos ×1.2; al abrir un overlay
zoom sutil ×1.1 y regresa.

## Avatares

Cinco arquetipos cosméticos (`src/data/avatars.ts`): `sporty`, `playero`,
`tuluminati`, `creativa`, `nomada-nocturno`. Mismo colisionador, velocidad y
animación. Sheets en `public/assets/characters/avatars/<id>.png`: 4 columnas
(idle, walk-1..3) × 3 filas (frente, espalda, perfil derecho — el izquierdo se
espeja), 16×28 px por frame. Son placeholders generados con
`scripts/gen-avatar-placeholders.mjs`; el arte final sustituye el PNG con la
misma retícula. Perfil en `localStorage` `labor.profile.v1` (`avatarId`,
apodo opcional, misiones completadas). `CAMBIAR PERSONAJE` desde el chip o el
menú no toca la misión.

## Misión y minijuegos

- **Corrida de misión** (`src/game/mission.ts`, `labor.run.v1`): `startMission`
  crea una corrida nueva (inventario temporal, minijuegos, banderas de mundo y
  etapas de la escultura en cero), `restartMission` pide confirmación,
  recargar reanuda, `installNext` instala y al completar registra el logro en
  el perfil. `JUGAR DE NUEVO` resetea la escultura.
- **LA PIEZA CENTRAL** (`src/data/missions.ts`): VETA → GATO → base de madera;
  MANNNO → CONECTA 4 → componente de metal; CONTRASTE → MEMORIA → detalle en
  plata; INSTALAR en el pedestal (tres veces). La línea de misión solo muestra
  el objetivo: `LA PIEZA · 2/4 · MANNNO · CONECTA 4`.
- **Minijuegos** (`src/game/minigames/`, lógica pura sin UI + tableros React):
  Gato 3×3 con minimax y 40 % de jugadas "distraídas" (se puede ganar);
  Conecta 4 7×6 con gravedad e IA gana → bloquea → no regala → centro;
  Memoria 4×3 de seis pares. Contrato `MinigameResult { gameId, success,
  score?, durationMs }`; el minijuego devuelve resultado y `mission.onMinigameResult`
  decide la recompensa.

## Comercial

Contacto real en `src/data/spaces.ts` (`CONTACT`): WhatsApp +52 55 3037 4167 y
labortulum@gmail.com. Pabellones chicos $10,000 MXN / mes (P03, P04), grandes
$15,000 (P01, P02), naves a cotizar. Cada ficha y cada cuarto vacío muestra la
renta y el CTA **ENVIAR PROPUESTA** (WhatsApp prellenado); completar la misión
ofrece **AGENDAR VISITA**.

## Archivos clave

```
public/maps/labor-overworld.tmj      ← geometría (Tiled)
maps/labor.tiled-project             ← proyecto Tiled (clases)
scripts/build-overworld-map.mjs      ← trazado inicial en metros → TMJ
scripts/gen-avatar-placeholders.mjs  ← sheets placeholder de avatares
src/
  game/bridge.ts                     ← comandos / eventos React ↔ Phaser
  game/map/tiled.ts                  ← lector del TMJ → geometría tipada
  game/world/collision.ts            ← canStand, deslizamiento, ruta ligera
  game/phaser/{config,Joystick,WorldScene,OverworldScene,RoomScene,BootScene,createGame}.ts
  game/{profile,mission}.ts          ← perfil persistente / corrida reseteable
  game/minigames/{contract,tictactoe,connectfour,memory}.ts
  data/{spaces,rooms,missions,avatars,assets}.ts
  components/game/GameStage.tsx      ← monta Phaser + HUD + overlays
  components/hud/*                   ← chip, línea de misión, acción, joystick, hint, debug
  components/experience/*            ← intro, selector, overlays, menú, toasts
  components/minigames/*             ← anfitrión + tres tableros
  styles/{experience,game}.css
```

## Modo debug

`?debug` (o `?mapdebug=1`): overlay de geometría, plano de referencia y panel con
START / RESTART / SKIP STEP / GIVE <componente> / INSTALL / OPEN GATO · CONECTA 4 ·
MEMORIA / CLEAR RUN / RESET PROFILE / viajes rápidos. `?renderer=canvas` fuerza
Canvas 2D (pruebas sin GPU).
