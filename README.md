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
`PROPERTY_BOUNDARY` (con la abertura del INGRESO), `BUILDING_COLLISION` (VETA / MANNNO / franja sur / Pabellón 04 /
CONTRASTE / Pabellones 01–03 / Naves 01–03, con propiedades `interior`,
`construction`, `group`, `heightM`), `WALKABLE` (patio + pasillo del árbol +
**interiores de P04, P02, P03 y la nave** + **Calle 12 Sur** completa: banqueta
1.7 m y carril hasta x = 39 m), `DOORS`, `SPAWNS`, `POI` (pedestal, tablero,
tótem y un punto `INFO` dentro de cada interior, con `spaceId`), `OBSTACLES`
(círculos: tronco, pedestal…; **rectángulos: los muros de los interiores**, 0.3 m,
con huecos de 1.3 m en las puertas), `DEPTH_ANCHORS` y `ART_*`.

El generador también escribe `src/data/plan.generated.ts` (plano en metros)
para el intro, que lo dibuja como SVG sin cargar el TMJ.

- `maps/labor.tiled-project` abre el mapa en Tiled con las clases ya definidas.
- `scripts/build-overworld-map.mjs` documenta el trazado en metros y regenera
  el TMJ **y** `plan.generated.ts`. Es la fuente de verdad espacial: cambiar un
  muro, una puerta o el estado `interior` de un edificio es editar ahí y correrlo.
- `?mapdebug=1` dibuja el plano encima del juego más polígonos, puertas,
  spawns, POIs y el colisionador del visitante.

## Controles

- **Móvil**: joystick flotante que nace donde cae el pulgar en la mitad
  izquierda (zona muerta 6 px, radio 44 px, diagonales normalizadas, el
  anillo sigue al dedo). **Un** botón contextual abajo-derecha que dice lo
  que va a pasar: ENTRAR · VER · JUGAR · INSTALAR · SALIR. Tocar el piso
  libre camina hasta ahí (secundario). Prioridad: UI > interactuables >
  joystick > tap-to-walk. Un toque corto en la zona del joystick (sin
  arrastrar) también camina hasta ahí.
- **Zoom**: control `+ / −` sobre el botón de acción (pasos `USER_ZOOM_STEPS`
  0.62–1.55×, se guarda en el perfil), pellizco con dos dedos y rueda del ratón.
  El zoom nunca deja ver fuera de los límites del mundo.
- **Escritorio**: WASD / flechas, `E` / `Enter` / espacio para actuar,
  clic para caminar, rueda para zoom, `ESC` cierra.
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
- **LA HORA** (`src/data/missions.ts`, id `pieza-central`): la pieza central es un
  reloj de sol de los tres talleres (`docs/LABOR_LA_HORA_PIEZA_CENTRAL.md`). VETA →
  disco de madera; MANNNO → aguja de metal; CONTRASTE → marcas de plata; INSTALAR
  en el pedestal (tres veces). La sombra de la aguja marca la hora real de Tulum
  (`src/game/world/sundial.ts`, UTC−5, −52° a las 6:30 y +52° a las 18:30) y al
  completar la punta destella. La línea de misión solo muestra el objetivo:
  `LA HORA · 2/4 · MANNNO · JUEGA EN EL TALLER`.
- **Minijuegos** (`src/game/minigames/`, lógica pura sin UI + tableros React), dos
  por taller y se elige uno al azar en cada visita a la estación:
  VETA → Gato (minimax con 40 % de jugadas "distraídas") o Corte a medida (toca
  cuando la marca pasa por la línea: 3 cortes buenos de 5, cada acierto acelera);
  MANNNO → Conecta 4 (IA gana → bloquea → no regala → centro) o Ritmo de fragua
  (repite el orden de 2, 3, 4 y 5 golpes); CONTRASTE → Memoria (seis pares) o La
  balanza (elige las piedras que pesan exacto, tres rondas, siempre con solución).
  Contrato `MinigameResult { gameId, success, score?, durationMs }`; el minijuego
  devuelve resultado y `mission.onMinigameResult` decide la recompensa.

## Interiores sin cambiar de escena (techo transparente)

Los espacios disponibles (P02, P03, P04 y los tres módulos de la nave) se
recorren **dentro del patio**: la huella es caminable, los muros bloquean y la
puerta es un hueco. Al pisar la huella (`pointInPolygon` en cada frame), el
contenedor del techo —relleno, lámina, nombre y estado— baja a alfa 0.08 en
420 ms y se ve el interior: una losa lisa con juntas (a propósito ambigua: sin
subdivisiones dibujadas) y una placa `INFO` en el piso que abre la ficha. No hay
botón en la puerta ni balizas: se entra caminando. En la nave, el techo es uno
solo (lámina a dos aguas) con la subdivisión en 3 módulos marcada en el piso, y
la **carpa beduina** de la Nave 02 es un segundo techo (contenedor propio con
postes que bloquean): se ve desde los otros módulos y se vuelve transparente solo
cuando estás debajo. Al entrar se emite `space` y React muestra un aviso corto
(nombre y m², una vez por espacio por sesión) y marca el espacio como visitado.
El CTA de la ficha "CAMINAR AL PABELLÓN / A LA NAVE" lleva al letrero de adentro.

**Pabellón 01 en obra** (`status: "coming-soon"`, sin fecha pública): no se
entra; afuera, en el pasillo del árbol, hay una cuadrilla en loop —uno carga
bloques del montón a la puerta, otro martilla el muro ("TOC"), otro duerme sobre
los costales ("z")—, conos y letrero EN OBRA. Casco y chaleco son texturas
generadas (`helmet`, `vest`, `block`, `sack`, `cone`, `hammer`, `site-sign`).
La ficha ofrece **AVISARME CUANDO ABRA** y visita a la obra.

## Comercial

Contacto real en `src/data/spaces.ts` (`CONTACT`): WhatsApp +52 55 3037 4167 y
labortulum@gmail.com. Sin formularios: cada botón abre WhatsApp (o el correo) con
el mensaje ya escrito según lo que el interesado eligió (`src/data/leads.ts`).

- **Sin precios publicados** (decisión comercial, oct 2026): ni en el juego, ni
  en el intro, ni en `/acerca/`, ni en el JSON-LD. `plans` queda vacío; la renta
  se platica por WhatsApp. La leyenda `PRICE_LEGEND` solo dice dónde preguntar.
- **Ficha de espacio**: chips de uso (TALLER, ESTUDIO, OFICINA…) → **ME
  INTERESA** (WhatsApp con espacio + uso), **AGENDAR VISITA**, **PEDIR INFO POR
  CORREO** y **CAMINAR AL PABELLÓN / A LA NAVE**.
- **Estados** (oct 2026): P02, P03, P04 y naves `available`; P01 `coming-soon`
  (en obra, sin fecha). `reserved` sigue soportado (lista de espera). La línea de
  escasez se calcula de los estados reales ("QUEDAN 3 PABELLONES DE 4 · 1 EN
  OBRA"). El CTA principal de la ficha es pegajoso al pie de la hoja.
- **Eventos** (`src/data/events.ts`): el próximo evento aparece en el menú, en el
  tablero de EVENTOS (VOY · PONER UN STAND · AGREGAR AL CALENDARIO), en el tótem
  de información, en la recompensa de la misión y como aviso al entrar. Ahora:
  bazar **PATIO**, domingo 20 de septiembre, 5 a 11 pm.

## Música de recompensa

`src/data/music.ts` lista las pistas (hoy una: `public/assets/audio/love-in-the-night.m4a`,
AAC 80 kbps, 5 MB, con respaldo MP3; se transmite por rangos). La pista se estrena en el
momento en que se instala el último componente de LA PIEZA CENTRAL: `mission.installNext`
la arranca dentro del mismo gesto del visitante, que es lo que el navegador exige para
sonar. Suena en loop a volumen ambiente (0.22) con fade-in de 2.6 s y se apaga con fade
al iniciar una corrida nueva. Queda desbloqueada en el perfil de quien la terminó: en el
menú, sección MÚSICA, aparece bloqueada hasta entonces y después se pausa y se reanuda;
pausar se recuerda en `labor.audio.v1`. Para agregar pistas basta añadirlas a `TRACKS`
(el selector de 3–4 canciones queda para después).

## Anuncio del bazar (PATIO)

- **Pop-up del cartel** (`EventPopup.tsx`): se abre desde el letrero de
  EVENTOS del patio (acción VER) y desde el menú → PRÓXIMO EN EL PATIO. Muestra
  el cartel (`public/assets/events/<id>.jpg`, campo `poster` en `EVENTS`,
  900 px / ~250 KB), la fecha relativa ("ESTE DOMINGO"), lugar, lineup y tres
  CTAs: VOY (WhatsApp prellenado), AGREGAR AL CALENDARIO y QUIERO PONER UN
  STAND (WhatsApp). En horizontal el cartel va a la izquierda y los CTAs a la
  derecha. Cuando el evento pasa, `nextEvent()` devuelve null y todo esto se
  apaga solo (el "!" incluido).
- **"!" en el letrero** (estado de marcador `notice`): al entrar, un signo de
  exclamación ocre entra con pop, rebota y manda un anillo cada 2.4 s sobre el
  letrero de eventos; el aviso de entrada dice "¡MIRA EL LETRERO!". Se disuelve
  con chispas al abrir el anuncio (una vez por visita).
- **Ciclo de vida de eventos** (`src/data/events.ts`): cada evento pasa solo
  por próximo → hoy → en curso → pasado (`eventStatus`, `nextEvent`,
  `lastEvent`, `pastEvents`). Con un evento próximo: aviso al entrar, "!" en
  el letrero, fila PRÓXIMO EN EL PATIO en el menú, pop-up con cartel y CTAs
  (VOY, STAND, CALENDARIO, CÓMO LLEGAR) y montaje con cajas en el patio. El
  día del evento: bazar montado. Cuando pasa: el patio vuelve a la normalidad
  y el último evento se queda como **evidencia** (fila ÚLTIMO EN EL PATIO ·
  YA PASÓ, pop-up con el cartel sellado "YA PASÓ · 20 SEP 2026", edición y
  `recap`, CTAs AVISARME DEL PRÓXIMO / STAND EN EL PRÓXIMO / PROPONER). En
  `/acerca/` vive la sección "Eventos en el patio · ediciones anteriores".
  Para anunciar el siguiente basta agregar un objeto a `EVENTS` (y su cartel
  en `public/assets/events/`), y actualizar `/acerca/` y el JSON-LD a mano.
- **Bazar montado** (interpretación, sin marcas ni links): el día del evento
  (o con `mounted: true` en el evento) el patio muestra dos filas de puestos
  genéricos al sur del reloj (`STALL_ROWS` / `STALL_XS`, texturas `stall-a` y
  `stall-b`), series de luces con focos que titilan, tres paseantes que
  recorren los pasillos y se paran a curiosear (`VISITOR_ROUTES`) y la
  leyenda "BAZAR PATIO · HOY · 5 A 11 PM". Los puestos bloquean el paso (solo
  la mesa); los pasillos entre filas y entre puestos quedan libres. Cuando el
  evento termina, todo desaparece solo.
- **Montaje del bazar** (`NPC_ROUTES` en `OverworldScene.ts`): antes del día del evento, mientras
  hay bazar por venir (`nextEvent()`); una leyenda en el piso entre las pilas
  dice "MONTANDO EL BAZAR · PRÓXIMO DOMINGO" (o MAÑANA / HOY). Dos personas
  (avatares distintos al del visitante) cargan cajas de la madera y las tarimas
  al centro del patio en loop: esperan, cargan, caminan, dejan la caja (se
  desvanece) y regresan. Rutas verificadas como pisables con `canStand`; con
  `prefers-reduced-motion` se quedan quietas. `__LABOR__.getState().npcs` las
  expone para pruebas. Cuando el layout del bazar quede definido, el reloj de
  sol puede moverse; por ahora sigue en su lugar.

## Personas de los talleres (contacto directo)

Dentro de VETA, MANNNO y CONTRASTE hay una persona de pie (`RoomDef.host`,
`WorkshopSpace.contact`): al acercarte el botón dice HABLAR · NOMBRE y se abre
su ficha (`PersonOverlay.tsx`) con **WhatsApp a su número con el mensaje ya
escrito** ("Hola Pablo, … me interesa más información sobre el taller de
carpintería VETA"), llamada directa y la ficha del espacio. Números: VETA
Pablo +52 33 3350 7799 · MANNNO Azul +52 33 1266 3462 · CONTRASTE Emilio
+52 55 3037 4167. Instagram (VETA @vetatallermx, CONTRASTE @contraste_atelier; MANNNO no
tiene) y la ficha propia de CONTRASTE en Google Maps viven en
`contact.instagram` / `contact.maps` y salen en la ficha de la persona, en la
ficha del taller, en `/acerca/` y en el JSON-LD (`sameAs`, `hasMap`). Para
agregar más interacciones con esa persona, el punto de entrada es
`workshopInfoMessage()` en `src/data/leads.ts`.

## Interfaz (guías de Apple / HIG)

- **Hojas inferiores** con agarradera, esquinas de 22 px, zonas seguras y
  `overscroll-behavior: contain` para el menú y todos los overlays en
  teléfono; en escritorio la ficha sigue siendo panel lateral.
- **Menú** como listas agrupadas (`.menu__list`): filas de 52 pt, separadores
  insertados, chevrón de navegación, resaltado al presionar (no inversión),
  fila destacada para el evento, iconos de música en CSS (sin glifos).
- **Botones** (`.overlay__cta`): llenos, ancho completo, 50 pt, esquinas de
  12 px; primario ocre, secundario tintado, terciario delineado
  (`--plain`), destructivo rojo. **Sin emojis ni flechas** en botones (iOS
  renderizaba "↗" como emoji).
- **Cerrar**: círculo de 44 pt. Objetivo táctil mínimo 44 pt en todo.

## SEO · GEO · AEO

- `index.html`: título y descripción con intención de búsqueda (talleres,
  carpintería, herrería, joyería, renta de taller/nave en Tulum, La Veleta),
  canonical `https://www.labortulum.com/`, robots, geo/ICBM, Open Graph y
  Twitter (`public/og/labor-og.jpg` 1200×630), PWA (`manifest.webmanifest`,
  iconos 192/512/180) y `<noscript>` con resumen y enlace a `/acerca/`.
- **JSON-LD** (`@graph`): WebSite, Organization+LocalBusiness (dirección,
  geo, `hasMap` a Google Maps, teléfonos, los tres talleres como
  `department`, ofertas con precio por pabellón y naves a cotizar), Event
  (bazar PATIO) y FAQPage (7 preguntas con respuestas directas: qué es, dónde
  está, precios, talleres, bazar, cómo agendar, qué es el recorrido). Es lo
  que leen Google, Bing y los motores generativos (GEO/AEO).
- **`/acerca/`** (`public/acerca/index.html`): página estática indexable con
  todo el contenido en HTML semántico (talleres con WhatsApp, tabla de
  espacios y precios, bazar con cartel, ubicación con Google Maps y
  coordenadas, FAQ en `<details>`, contacto) y enlace al recorrido. El juego
  en sí es canvas, así que esta página es la fuente de texto para buscadores.
- `robots.txt` + `sitemap.xml` (con imágenes). Ubicación de Google Maps
  (`CONTACT.maps`) en menú → CÓMO LLEGAR, información y anuncio del bazar.
- Cuando cambien precios, fechas o teléfonos hay que actualizar tres lugares:
  `src/data`, el JSON-LD de `index.html` y `public/acerca/index.html`.

## Animaciones y señales

Todo lo que pasa en el mundo se ve (y respeta `prefers-reduced-motion`):

- **Llegada**: cuando el portón se abre, React manda `gameCommands.arrive()`:
  el visitante "aterriza" con un pop y la cámara asienta desde un poco más lejos
  al zoom base. Phaser se monta detrás de la intro, así que la animación de
  `create()` sola no se vería; por eso se dispara desde el portón. Cuartos y
  regresos al patio la repiten tras el fundido.
- **Entrar a un taller**: anillo en la puerta y acercamiento de cámara mientras
  funde a negro.
- **Ganar en un taller**: el tablero brilla y el resultado se "sella"; la
  baliza de la estación/puerta salta con chispas y anillo teal al cerrar el
  panel (si estaba abierto, queda pendiente hasta cerrarlo) y la línea de misión
  hace un bump.
- **Instalar en LA HORA**: la pieza cae con rebote, anillo ocre y chispas sobre
  el disco.
- **LA HORA completa**: tres anillos escalonados, chispas desde la punta de la
  aguja, acercamiento de cámara 2 s y regreso; el título de la recompensa se
  sella; empieza la música.
- **PRÓXIMAMENTE**: la franja sur (bloque junto a MANNNO, no se entra) lleva un
  letrero discreto con respiración lenta; el texto viene del mapa
  (`franja-sur.label`, generador `scripts/build-overworld-map.mjs`).
- **Balizas** (diamantes sobre puertas, estaciones y pedestal): escala
  1.3 · objetivo 1.45 · cerca 1.6, para que no roben protagonismo.
- **RESERVADO (FOMO)**: sello óxido con entrada tipo estampa y pulso continuo en
  la ficha, más la línea "QUEDAN N PABELLONES DE 4 · M YA RESERVADOS"; en el
  techo del patio y en el letrero del cuarto el texto va sobre fondo óxido con
  pulso; en el menú la meta parpadea.

En `?debug`, `__LABOR__.getState().fx` lista los últimos efectos
(`ring:x,y`, `burst:x,y`) para verificarlos en Playwright.

## Sistema visual V2 (oct 2026)

Grises de concreto, asfalto y lámina + **un** acento rojo tenue (`--accent`
#b4544b) solo en detalles: foco, objetivo, sellos, "!" del letrero, techo de
CONTRASTE, cascos de la obra. Los alias `--ochre*`, `--teal`, `--rust` siguen
existiendo pero apuntan a grises y al acento. Hojas (`.overlay__panel`,
`.menu__panel`, `.popup__card`) translúcidas con `backdrop-filter`. Sin
degradados rayados. Favicon: "LB" negro sobre papel (`public/favicon.svg`, con
animación SMIL para Firefox; en Chrome/Safari `src/favicon.ts` cambia unos
frames cada 7 s: un subrayado que barre). Intro: hoja de plano —el predio se
dibuja solo desde `plan.generated.ts`, etiquetas, "INGRESO", una línea de datos
(oficios y renta, sin precios) y un botón; entra solo a los 7 s (2.6 s si ya
viniste, `labor.intro.v2`), con liga directa a WhatsApp y a `/acerca/`.
**Sin balizas**: no hay rombos ni palomitas sobre puertas o letreros; solo el
"!" del tablero cuando hay evento. Los techos dicen nombre y estado, nada más.

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
  data/plan.generated.ts             ← plano en metros (lo escribe el generador; intro)
  favicon.ts                         ← animador del favicon (frames)
  components/hud/ZoomControl.tsx     ← + / − de zoom
  game/{profile,mission}.ts          ← perfil persistente / corrida reseteable
  game/minigames/{contract,tictactoe,cut,connectfour,rhythm,memory,balance}.ts
  game/world/sundial.ts              ← la sombra de LA HORA sigue al sol real de Tulum
  data/{spaces,rooms,missions,avatars,assets,music}.ts
  game/audio.ts                      ← música de recompensa (se estrena al terminar la pieza)
  components/game/GameStage.tsx      ← monta Phaser + HUD + overlays
  components/hud/*                   ← chip, línea de misión, acción, joystick, hint, debug
  components/experience/*            ← intro, selector, overlays, menú, toasts
  components/minigames/*             ← anfitrión + seis tableros
  styles/{experience,game}.css
```

## Modo debug

`?debug` (o `?mapdebug=1`): overlay de geometría, plano de referencia y panel con
START / RESTART / SKIP STEP / GIVE <componente> / INSTALL / OPEN GATO · CONECTA 4 ·
MEMORIA / CLEAR RUN / RESET PROFILE / viajes rápidos. `?renderer=canvas` fuerza
Canvas 2D (pruebas sin GPU).
