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
