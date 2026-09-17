# lessons.md — errores operativos que no hay que repetir

- **`pkill -f "<texto>"` se mata a sí mismo** si el texto aparece en el propio
  comando (heredocs incluidos). Usar `pkill -f "[v]ite preview"` o `pgrep` +
  `kill` por PID. Ya pasó dos veces (chrome, vite preview).
- **Poda de CSS por prefijo**: un bloque con selectores mixtos
  (`.overlay, .station {}`) no se borra completo; se quita solo el selector
  obsoleto. Verificar con la lista de clases antes de construir.
- **Phaser `setDeadzone` está en unidades de mundo**: dividir el porcentaje
  del viewport entre el zoom, y recalcular en `resize`.
- **Chromium headless sin GPU** rinde pocos fps con WebGL en canvas grandes;
  para pruebas usar `?renderer=canvas` y medir `fps` en `__LABOR__.getState()`
  antes de culpar al movimiento.
- **Playwright + Phaser**: los eventos de `page.mouse` en contexto móvil no son
  touch (`pointer.wasTouch` = false); el joystick se prueba con CDP
  `Input.dispatchTouchEvent`. `locator.boundingBox()` sin timeout espera 30 s.
- **Geometría**: no derivar del mockup; el PDF vectorial (pdftocairo -svg) da
  segmentos exactos y se calibra con una cota conocida.
- **Nunca poner un patrón de `pkill`/`pgrep -f` en la misma llamada que otros comandos**: el shell de la herramienta acaba matándose (exit 144), aunque el patrón lleve `[p]`. Comprobar con `ps | grep "[p]atrón"` y dejar que los procesos terminen solos, o matarlos en una llamada aparte sin ningún otro texto.
- **Phaser se monta detrás de la intro**: cualquier animación lanzada en
  `create()` del primer patio corre tapada por el portón; la llegada visible se
  dispara desde React al abrirse el portón (`gameCommands.arrive()`), con guarda
  de 1 s para no duplicarla. En pruebas, `getState()` solo se ve tras el segundo
  toque, así que el muestreo de zoom empieza ahí.
- **Renderer canvas dibuja los `Text` con `setResolution(2)` al doble** (medido
  con `renderer.snapshot`: 66 px vs 33 px en WebGL). Para juzgar tamaños de
  texto usar WebGL headless con `--use-gl=angle --use-angle=swiftshader
  --enable-unsafe-swiftshader`; el canvas solo sirve para lógica y fps.
- **`→ PIEZA` instala sola al llegar** (`arrived` → `triggerAction`): una prueba
  no debe contar toques de INSTALAR; hay que leer `installed.length` y no tocar
  "VER" después de completar, porque abre el overlay y pausa la escena.
- **El servidor `vite preview` no sobrevive entre días de sesión**: antes de
  correr pruebas, comprobar `curl -s -o /dev/null -w "%{http_code}" :4173` y
  relanzarlo con `nohup` si no responde (la primera prueba del día falló con
  `ERR_CONNECTION_REFUSED`).
- **Capturas de overlays**: esperar ≥ 500 ms tras abrirlos; si no, salen a
  media animación de entrada (opacidad parcial) y parecen translúcidos sin serlo.
- **iOS pinta "↗" (U+2197) como emoji** en botones; también "▶"/"❚❚" pueden
  salir como emoji. En botones: texto sin glifos; iconos con CSS (chevrón,
  triángulo de play, barras de pausa).
- **Orden de hojas CSS**: `game.css` se importa después de `experience.css`;
  una regla en un `@media` de `experience.css` no gana a una regla normal de
  `game.css` con la misma especificidad. Las anulaciones de móvil van al final
  de `game.css`.
- **No reconstruir `dist/` mientras corre el gate de 6 viewports**: vite
  preview sirve archivos con hash y las páginas abiertas fallarían al cargar
  chunks viejos. Editar código sí; `npm run build` solo cuando termine.
- **El servidor de preview hay que lanzarlo con `setsid nohup … &`**; con
  `nohup` a secas muere al cerrar la llamada de la herramienta.
