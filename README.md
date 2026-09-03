# LA BOR — TALLERES

Experiencia digital explorable del complejo de talleres La Bor (Tulum, Q.R.).

> **“No navegar la página. Recorrer el taller.”**

No es un sitio web convencional: la arquitectura física de La Bor es la
interfaz. El visitante entra desde Calle Cobá, camina por el patio con
clic/tap y descubre los talleres residentes y espacios disponibles.

---

## Cómo correr

```bash
npm install
npm run dev        # desarrollo → http://localhost:5173
npm run build      # typecheck + build de producción → dist/
npm run preview    # sirve el build de producción
```

Stack: **React + TypeScript + Vite + SVG + CSS**. Sin dependencias de
juego, sin backend, sin rutas: todo vive en `/`.

## Qué hay en V0

- Pantalla de entrada (`LA BOR / TALLERES / ENTRAR`) con transición de
  portón industrial.
- Mundo SVG a pantalla completa (2400×1600) calibrado contra el plano
  TRAMA (predio ~34.90 × 37.31 m): VETA + MANNINO al poniente (esquina
  NW en diagonal), PABELLÓN 04 + CONTRASTE al norte, jardín con
  árbol-hito, PABELLONES 01–03 al oriente (01 y 02 con terraza exterior
  + interior), NAVES 01–03 al sur, patio central, **INGRESO por Calle
  12 sur**, Calle Cobá al sur (con portón de servicio junto a NAVE 03)
  y apertura norte hacia Mala Casa. El visitante llega por el INGRESO
  real. La lógica del complejo: **7 talleres + 3 naves**.
- Visitante con clic/tap-para-caminar, escala 2.5D por profundidad,
  sombra y animación de caminata. WASD/flechas como control secundario.
- Ruteo por waypoints (grafo mínimo, no pathfinding complejo) para no
  atravesar edificios; polígono caminable irregular + obstáculos.
- Cámara suave que sigue al visitante, con límites de mundo y reveal
  inicial al entrar.
- Hotspots por proximidad con etiqueta editorial; overlays de residente
  / espacio disponible / programa (EVENTOS, TALLERES, CONTACTO, AGENDA).
- Menú `MENU +` = índice con **fast travel** (el visitante camina rápido
  hasta el espacio y el overlay abre al llegar; no es navegación de
  páginas).
- Sello LA BOR (arriba-izquierda) regresa al punto de llegada.
- Móvil: tap-para-caminar, overlays tipo hoja inferior, aviso sutil
  `MEJOR EN HORIZONTAL` en vertical.
- Accesibilidad: ESC cierra, foco al abrir overlay, `prefers-reduced-motion`,
  menú de respaldo, tecla `E` opcional.
- Modo debug completo (ver abajo).

## Archivos clave

```
src/
  config/world.ts        ← dimensiones, velocidad, cámara, zoom, debug
  data/map.ts            ← polígono caminable, obstáculos, waypoints, spawn
  data/spaces.ts         ← contenido: nombres, estados, m², CTAs, puntos
  hooks/useExperienceEngine.ts  ← motor: loop rAF, movimiento, cámara,
                                   proximidad, fast travel, teclado
  utils/geometry.ts      ← punto-en-polígono, ruteo, punto caminable cercano
  utils/coordinates.ts   ← pantalla ↔ mundo, transform de cámara
  components/experience/
    Entrance.tsx         ← pantalla de llegada + portón
    WorkshopWorld.tsx    ← composición del viewport
    WorkshopSvg.tsx      ← TODO el arte del mundo (capas SVG)
    Player.tsx           ← visitante + marcador de clic
    HotspotLabel.tsx     ← etiqueta de proximidad
    SpaceOverlay.tsx     ← overlay editorial
    FastMenu.tsx         ← índice / fast travel
    WorldHUD.tsx         ← sello, hint, aviso horizontal
    DebugPanel.tsx       ← panel de calibración
  styles/experience.css  ← todo el sistema visual
```

## Cómo editar el mapa

- **Huella y posición de edificios**: `buildingRect` de cada espacio en
  `src/data/spaces.ts`. El dibujo se genera de estos datos.
- **Puntos de interacción**: `interactionPoint` + `interactionRadius`
  en el mismo archivo.
- **Zona caminable**: `WALKABLE_AREA` en `src/data/map.ts` (polígono
  ortogonal en coordenadas de mundo).
- **Obstáculos**: `OBSTACLES` (círculos) en `src/data/map.ts`.
- **Waypoints de ruteo**: `WAYPOINTS` en `src/data/map.ts` — puntos
  interiores cerca de las esquinas cóncavas del patio.
- **Spawn**: `SPAWN_POINT` en `src/data/map.ts`.
- El arte decorativo (árbol, objetos, señalética pintada) vive en
  `src/components/experience/WorkshopSvg.tsx`; la lógica no depende de
  esos nodos, así que el mapa entero se puede reemplazar por una
  ilustración custom sin tocar el motor.

Referencias en `public/assets/reference/`: el plano TRAMA con cotas
(`260823_TRAMA-layout.pdf`, ya incluido) y la interpretación con diseño
(`labor-master-plan.png`, pendiente de colocar).

## Cómo editar contenido de residentes / espacios

Todo en `src/data/spaces.ts`: nombre, subtítulo, descripción, `details`
(listas), estado (`active` / `available` / `coming-soon`), `areaM2` y
`cta` (puede abrir otro overlay con `targetSpaceId`, p. ej.
`INFORMACIÓN → CONTACTO`, o un `href` externo cuando exista).

## Cómo afinar movimiento y cámara

En `src/config/world.ts`:

| Constante | Efecto |
| --- | --- |
| `PLAYER_SPEED` | velocidad de caminata (world px/s) |
| `FAST_TRAVEL_MULT` | multiplicador del fast travel del menú |
| `CAMERA_LERP` | suavidad del seguimiento de cámara |
| `PLAYER_SCALE_MIN/MAX` | profundidad 2.5D del visitante |
| `ZOOM_DESKTOP_MIN` / `ZOOM_MOBILE_MIN` | acercamiento por dispositivo |
| `INTERACTION_RADIUS_DEFAULT` | radio de hotspot por defecto |

## Modo debug

Activar con `?debug` en la URL (p. ej. `localhost:5173/?debug`) o
poniendo `DEBUG_WORLD = true` en `src/config/world.ts`. Muestra:

- polígono caminable, obstáculos, waypoints, radios de interacción y
  spawn dibujados sobre el mundo;
- panel con posición del visitante, destino, cámara, zoom, coordenada
  del mouse y FPS;
- **clic derecho** sobre el mundo = imprime la coordenada de mundo en
  consola y en el panel (para calibrar contra el plano).

## Sonido

Apagado por defecto (`SOUND_ENABLED = false` en `world.ts`). Sin assets
de audio en V0.

## Metadata de ubicación

El punto oficial de Google Maps (20.2061954, -87.4752482) vive en
`LOCATION` dentro de `src/config/world.ts` y como meta `geo.position` en
`index.html`. Es solo metadata: no define la geometría del mapa interno.
Reservado para un futuro `CÓMO LLEGAR`.

## Próximos assets visuales (mínimo para dejar de ser prototipo gris)

1. `labor-master-plan.png` en `public/assets/reference/` para calibrar.
2. Logotipo / lockup real de LA BOR (SVG) — hoy es tipografía.
3. Contacto real (Instagram, WhatsApp, email) para el overlay CONTACTO.
4. 1 foto o textura por residente (CONTRASTE, VETA, MANNINO) para los
   overlays (`image` ya existe en la interfaz de datos).
5. Tipografía definitiva de marca (hoy: Archivo vía Google Fonts, con
   fallback a Helvetica/Arial).
