# LA BOR — TALLERES

Mundo 2D explorable del complejo de talleres La Bor (Tulum, Q.R.).

> **“No navegar la página. Recorrer el taller.”**
>
> V0: *puedo caminar por La Bor.* · V1: *puedo hacer cosas dentro de La Bor.*

No es un sitio web convencional ni un videojuego complejo: la
arquitectura física de La Bor es la interfaz. Una intro breve dice qué
es La Bor y se desvanece sola; el visitante aparece en el portón de
Calle Cobá, camina por el patio, entra a cualquiera de los diez
talleres y naves, crea componentes en los talleres residentes y los
instala en **LA PIEZA CENTRAL** — y el patio cambia.

---

## Cómo correr

```bash
npm install
npm run dev        # desarrollo → http://localhost:5173
npm run build      # typecheck + build de producción → dist/
npm run preview    # sirve el build de producción
```

Stack: **React + TypeScript + Vite + SVG + sprites pixel-art**. Sin
dependencias de juego, sin backend, sin rutas: todo vive en `/`.

## Qué hay (V1.2)

**Llegada**
- Intro automática: LA BOR → qué es La Bor → el portón se abre. No hay
  que picar (tocar adelanta). Los sprites se precargan durante la intro.
- El visitante aparece en el portón de Cobá y la cámara se abre.

**Mundo**
- El mundo es el predio completo con su muro (3200×2900, geometría del
  prototipo de diseño ×2.5): todo el terreno es caminable salvo las
  huellas de los edificios y los objetos. Mucho aire entre estructuras.
- Sprites del sistema de diseño: piso, muro, portón, las 10 techumbres,
  árbol principal (base + copa) y sus dos plantas — la única vegetación
  del plano —, tablero de eventos, tótem, mesa, madera, tarimas,
  macetas, tanque y pedestal.
- Etiquetas físicas sobre cada estructura, pulso ocre en los 7
  disponibles, acentos por residente (VETA ocre, CONTRASTE teal,
  MANNINO acero). Gato en loop, pájaros, viento en la copa, tragaluz.
- Lógica del complejo: **7 talleres + 3 naves**. Residentes: CONTRASTE
  (joyería), VETA (carpintería), MANNINO (herrería).

**Controles**
- Escritorio: clic para caminar, WASD / flechas, `E` o `Enter` para
  activar lo cercano, `ESC` para cerrar.
- Táctil: tocar el piso para caminar; **arrastrar en cualquier parte
  levanta un stick flotante** centrado en el dedo; botón **ENTRAR** va
  al espacio más cercano.
- Zoom: el patio se ve siempre al mismo zoom; al entrar a un taller la
  cámara se acerca a su puerta y dentro se ve más cerca; al salir se
  abre de nuevo.

**Talleres**
- Los 10 se pueden recorrer por dentro. VETA, MANNINO y CONTRASTE
  tienen una estación de oficio (LIJAR / FORJAR / PULIR: mantener
  presionado). Los 7 disponibles son cuartos vacíos con su ficha,
  el letrero "ESPACIO DISPONIBLE · m²" y acceso a INFORMACIÓN.

**Quest LA PIEZA CENTRAL**
- Descubrir el pedestal → base de madera (VETA) → componente de metal
  (MANNINO) → detalle en plata (CONTRASTE). Cada componente se instala
  en orden y aparece sobre el pedestal; al completar, +50 OFICIO.
- Inventario, oficio y banderas en `localStorage` (`labor.save.v1`).

## Archivos clave

```
src/
  config/world.ts          ← dimensiones, velocidad, zooms (patio / taller), stick, intro
  data/map.ts              ← interior del muro, portón, spawn, waypoints de esquinas
  data/spaces.ts           ← contenido y huellas de los espacios, CTAs (entrar / info)
  data/props.ts            ← props del patio con ancla de profundidad + cambios de mundo
  data/scenes.ts           ← los 10 cuartos: estilo, estaciones, props, salida, ficha
  data/assets.ts           ← manifiesto de sprites
  game/state.ts            ← inventario / oficio / banderas + localStorage
  game/quests.ts           ← LA PIEZA CENTRAL (3 componentes en orden)
  hooks/useExperienceEngine.ts ← motor: escenas, tap/stick/teclado, cámara y zoom,
                               proximidad, profundidad, fast travel
  utils/geometry.ts        ← caminable = polígono − huellas − obstáculos; ruteo
  components/experience/
    Intro.tsx              ← intro automática + portón
    WorkshopSvg.tsx        ← patio (capas + sprites)
    WorkshopRoomSvg.tsx    ← interiores (duela / concreto / losa) según estilo
    TouchControls.tsx      ← stick flotante + ENTRAR
    WorldSprite.tsx        ← Sprite, WorldLabel, DepthLayer, PoiMarkers
    Player.tsx · Fauna.tsx · StationPanel.tsx · PiezaOverlay.tsx
    SpaceOverlay / FastMenu / WorldHUD / HotspotLabel / Toasts / DebugPanel
  styles/experience.css    ← sistema visual (tokens, animaciones, UI, stick)
public/assets/             ← sprites (ver "Assets")
docs/                      ← handoffs (experiencia V2, gameplay, arte, móvil) + tareas
```

## Cómo editar

- **Mapa**: huellas y puertas en `data/spaces.ts`; portón, spawn y
  waypoints extra en `data/map.ts`; objetos en `data/props.ts`.
- **Contenido**: `data/spaces.ts`.
- **Talleres / estaciones**: `data/scenes.ts` (`emptyRoom()` para
  disponibles; los residentes tienen su bloque).
- **Movimiento, cámara y zoom**: `config/world.ts`.
- **Arte**: sustituir PNG en `public/assets/` (mismo nombre).

## Cómo funciona

**Caminable.** Un punto es caminable si está dentro del interior del
muro, fuera de toda huella de edificio y fuera de todo obstáculo. Los
waypoints se generan en las esquinas de las huellas (+90 px) y el
ruteo usa Dijkstra sobre ese grafo.

**Profundidad.** `DepthLayer` dibuja props por ancla `y` e inserta al
visitante donde toca (el motor solo actualiza el índice al cruzar un
ancla). El árbol es base + copa: al norte del tronco, el visitante
queda bajo la copa.

**Zoom.** Patio: fijo (`ZOOM_DESKTOP_MIN` / `ZOOM_MOBILE_MIN`). Al
entrar a un taller: foco hacia la puerta con `ENTER_ZOOM` durante el
fundido; dentro: `ROOM_ZOOM_*`; al salir la cámara arranca a
`EXIT_ZOOM` y se abre. Estación: `FOCUS_ZOOM_STATION`.

**Escenas.** `enterScene(id)` funde, cambia geometría y puntos de
interés (estación / salida / ficha) y coloca al visitante; `exitScene()`
regresa a la puerta del taller en el patio.

## Assets

Sprites pixel-art extraídos del paquete de diseño:

```
public/assets/
  world/floor/world-floor-patio-v1.png
  world/walls/wall-h-v1.png · wall-v-v1.png
  world/roofs/roof-{nave-01,nave-02,nave-03,pabellon-01..04,contraste,veta,mannino}-v1.png
  world/vegetation/tree-main-{base,canopy} · shrub-01/02 · (palm/sidewalk: no usados)
  world/props/prop-{events-board,info-totem,worktable,wood-stack,pallet-stack,gate-main,planter,water-tank}-v1.png
  world/installations/installation-base-v1.png
  characters/visitor/visitor-{idle-front,walk-01,walk-02}-v1.png
  characters/fauna/cat-walk-01/02 · bird-fly-01/02
  reference/labor-master-plan.png · 260823_TRAMA-layout.pdf
```

## Modo debug

`?debug` en la URL: polígono caminable, huellas, obstáculos, waypoints,
radios y spawn de la escena actual; panel con escena, posición,
cámara, profundidad, stick, inventario y banderas; clic derecho imprime
la coordenada; `RESET SAVE` borra el progreso.
