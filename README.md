# LA BOR — TALLERES

Mundo 2D explorable del complejo de talleres La Bor (Tulum, Q.R.).

> **“No navegar la página. Recorrer el taller.”**
>
> V0: *puedo caminar por La Bor.* · V1: *puedo hacer cosas dentro de La Bor.*

No es un sitio web convencional ni un videojuego complejo: la
arquitectura física de La Bor es la interfaz. El visitante entra por
el portón de Calle Cobá, camina por el patio, descubre los talleres
residentes y los espacios disponibles, entra a un taller, crea un
componente y lo instala en **LA PIEZA CENTRAL** — y el patio cambia.

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

## Qué hay (V1.1)

**Mundo**
- Patio con los sprites del sistema de diseño (docs/LABOR_ART_DIRECTION_
  ASSETS.md): piso de concreto, muro perimetral con portón a Cobá,
  techumbres de las 11 estructuras, árbol principal (base + copa),
  palmas, arbustos, tablero de eventos, tótem, mesa, madera, tarimas,
  macetas, tanque de agua y pedestal de la instalación.
- Etiquetas físicas sobre cada estructura (`NAVE 01 · 117 M²`), pulso
  ocre en los 7 espacios disponibles, acentos por residente (VETA ocre,
  CONTRASTE teal, MANNINO acero).
- Vida ambiental: copas con viento, tragaluz de Contraste que parpadea,
  polvo, un gato que recorre el patio y pájaros que cruzan el cielo.
- Lógica del complejo: **7 talleres + 3 naves** (11 estructuras con el
  anexo de VETA). Residentes: CONTRASTE (joyería), VETA (carpintería),
  MANNINO (herrería).

**Exploración**
- Clic/tap-para-caminar, WASD/flechas, ruteo por waypoints, obstáculos
  circulares, cámara suave con límites y zoom de énfasis al interactuar.
- **Profundidad por ancla Y**: el visitante pasa detrás y delante del
  árbol, macetas, tablero, pedestal, etc.
- Hotspots por proximidad, overlays editoriales (tema oscuro), menú de
  viaje rápido, sello LA BOR que regresa al portón.

**Gameplay**
- Escena de taller jugable: **VETA** (entrar desde su overlay, caminar
  dentro, salir por la puerta).
- Estación **BANCO DE TRABAJO**: mantener presionado para lijar → produce
  `BASE DE MADERA` + 10 OFICIO.
- Quest **LA PIEZA CENTRAL**: descubrir el pedestal → crear la base en
  VETA → instalarla. Al instalar, la base aparece físicamente sobre el
  pedestal (+20 OFICIO). Los pasos de herrería (MANNINO) y plata
  (CONTRASTE) quedan marcados como próximamente.
- Inventario mínimo + oficio persistidos en `localStorage`
  (`labor.save.v1`). Feedback con toasts editoriales.

## Archivos clave

```
src/
  config/world.ts          ← dimensiones, velocidad, cámara, zoom de foco, debug
  data/map.ts              ← polígono caminable, waypoints, spawn, portón
  data/spaces.ts           ← contenido de espacios (nombres, m², CTAs, puntos)
  data/props.ts            ← props del patio con ancla de profundidad + obstáculo
  data/scenes.ts           ← cuartos de taller: geometría, estaciones, props
  data/assets.ts           ← manifiesto de sprites (ruta + tamaño lógico)
  game/state.ts            ← inventario / oficio / banderas + localStorage
  game/quests.ts           ← LA PIEZA CENTRAL (pasos derivados de banderas)
  hooks/useExperienceEngine.ts ← motor: escenas, movimiento, cámara, foco,
                               proximidad, profundidad, fast travel, teclado
  utils/geometry.ts        ← punto-en-polígono, ruteo, punto caminable cercano
  components/experience/
    WorkshopSvg.tsx        ← patio (capas + sprites)
    WorkshopRoomSvg.tsx    ← interior de taller (placeholder con sprites)
    WorldSprite.tsx        ← Sprite, WorldLabel, DepthLayer, PoiMarkers
    Player.tsx             ← visitante (idle + 2 frames) y marcador de clic
    Fauna.tsx              ← gato y pájaros (CSS)
    StationPanel.tsx       ← interacción "mantén para…"
    PiezaOverlay.tsx       ← estado de la quest + acciones
    SpaceOverlay / FastMenu / WorldHUD / HotspotLabel / Toasts / DebugPanel
  styles/experience.css    ← sistema visual (tokens, animaciones, UI)
public/assets/             ← sprites (ver "Assets")
docs/                      ← handoffs (experiencia V2, gameplay, arte, móvil)
```

## Cómo funciona

**Profundidad.** Cada prop tiene un ancla de suelo `y`. `DepthLayer`
dibuja los props ordenados por `y` e inserta al visitante en el índice
que el motor calcula (`playerDepthIndex`, solo cambia cuando cruza un
ancla). El árbol es un prop con base + copa separada; al estar más al
norte que su ancla, el visitante queda debajo de la copa.

**Zoom de interacción.** El motor tiene un "foco" opcional
(`FOCUS_ZOOM_OVERLAY`, `FOCUS_ZOOM_STATION`, `FOCUS_BIAS` en world.ts).
Al abrir un overlay o una estación, la cámara se acerca un poco y se
desplaza hacia el objeto; al cerrar, vuelve al zoom base. Todo con
amortiguación, sin saltos.

**Animación ambiental.** Clases CSS con un solo reloj de frames (340 ms):
`.canopy--slow/--fast` (viento), `.ambient-glow` (parpadeo),
`.dust`, `.fauna-cat`, `.fauna-bird--n`, `.pulse` (disponibles),
`.player__frame--*` (caminata). `prefers-reduced-motion` las apaga.

**Escenas.** `enterScene(id)` funde a negro, cambia la geometría
(polígono, obstáculos, waypoints, puntos de interés) y coloca al
visitante en el spawn del cuarto; `exitScene()` regresa al patio en la
puerta del taller. Agregar un taller = una entrada en `data/scenes.ts`.

**Quest.** Los pasos se derivan de banderas (`pieza.discovered`,
`pieza.baseCrafted`, `pieza.baseInstalled`) e inventario; el estado
guardado es mínimo. `worldChangeProps()` en `data/props.ts` agrega los
props que aparecen cuando la quest avanza.

## Cómo editar

- **Mapa**: `data/map.ts` (polígono, waypoints, spawn), `data/spaces.ts`
  (`buildingRect`, `interactionPoint`), `data/props.ts` (posición,
  tamaño, obstáculo, copa).
- **Contenido**: `data/spaces.ts` (nombres, descripciones, m², CTAs).
- **Taller / estación**: `data/scenes.ts`.
- **Movimiento y cámara**: `config/world.ts`.
- **Arte**: sustituir PNG en `public/assets/` (mismo nombre). Si cambia
  el tamaño lógico, actualizar `data/assets.ts`.

## Assets

Sprites pixel-art extraídos del paquete de diseño (transparentes, a
resolución lógica; el mundo los escala con `image-rendering: pixelated`):

```
public/assets/
  world/floor/world-floor-patio-v1.png
  world/walls/wall-h-v1.png · wall-v-v1.png
  world/roofs/roof-{nave-01,nave-02,nave-03,pabellon-01..04,contraste,veta,veta-sur,mannino}-v1.png
  world/vegetation/tree-main-{base,canopy} · tree-sidewalk-{base,canopy} · palm-{base,canopy} · shrub-01/02
  world/props/prop-{events-board,info-totem,worktable,wood-stack,pallet-stack,gate-main,planter,water-tank}-v1.png
  world/installations/installation-base-v1.png
  characters/visitor/visitor-{idle-front,walk-01,walk-02}-v1.png
  characters/fauna/cat-walk-01/02 · bird-fly-01/02
  reference/labor-master-plan.png · 260823_TRAMA-layout.pdf
  overlays/residents/ · overlays/spaces/ · logos/ · ui/ · audio/   (vacíos, listos)
```

## Modo debug

`?debug` en la URL (o `DEBUG_WORLD = true`): dibuja polígono caminable,
obstáculos, waypoints, radios y spawn de la escena actual; panel con
escena, posición, cámara, índice de profundidad, punto cercano,
inventario, banderas y FPS; clic derecho imprime la coordenada; botón
`RESET SAVE` borra el progreso.

## Metadata de ubicación

Punto oficial de Google Maps (20.2061954, -87.4752482) en `LOCATION`
(`config/world.ts`) y como meta `geo.position`. Solo metadata.
