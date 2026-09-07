# LA BOR — Tareas de assets y contenido (tras la reconstrucción jugable)

Estado: la base jugable (mapa real, controles móviles, cámara, avatares,
misión, minijuegos) pasa el playtest móvil. Lo que sigue es arte y contenido;
nada de esto bloquea jugar. Reglas: vista cenital, luz del noroeste, sombras
al sureste, fondo transparente, nombres de `docs/LABOR_ART_DIRECTION_ASSETS.md`.

## Resuelto en esta iteración

- [x] Geometría real desde el PDF TRAMA (48 px/m), editable en Tiled.
- [x] MANNNO (no MANNINO) en código, mapa y UI.
- [x] Contacto real: WhatsApp +52 55 3037 4167 · labortulum@gmail.com.
- [x] Renta visible: pabellones chicos $10,000, grandes $15,000 MXN/mes; naves a cotizar; CTA ENVIAR PROPUESTA.
- [x] Cinco avatares (placeholder) con selector.
- [x] Tres minijuegos reales en lugar de "mantener presionado".

## Falta — mayor impacto primero

### 1. Avatares (arte final, 60 frames)
- [ ] Sheet por arquetipo en `public/assets/characters/avatars/<id>.png`,
      64×84 px: 4 columnas (idle, walk-1, walk-2, walk-3) × 3 filas (frente,
      espalda, perfil derecho). Misma silueta y timing para los cinco.
- [ ] Opcional después: pose de interacción / carga / festejo.

### 2. Techumbres a las huellas reales
- [ ] Las techumbres actuales se dibujan estiradas sobre la huella medida.
      Rehacer a proporción real (48 px/m): VETA con chaflán, MANNNO, franja
      sur, P04 6.05×7 m, CONTRASTE 6.05×7 m, P01/P02 12×6.7 m, P03 7×6.7 m,
      naves 7.85/9.7 × 12.2 m. Cara sur (muro) y puerta hacia el patio.
- [ ] Piso del patio: el mosaico actual queda tenue; una textura de losa /
      concreto a 48 px/m con juntas cada 1–2 m.
- [ ] Calle 12 Sur / Cobá: banqueta y asfalto (hoy tono plano).

### 3. Interiores (hoy: piso plano por estilo + props del sistema)
- [ ] VETA: duela, racks, herramientas; banco de carpintero (estación GATO).
- [ ] MANNNO: fragua, yunque, mesa de soldar (estación CONECTA 4).
- [ ] CONTRASTE: banco de joyero, pulidora, vitrina (estación MEMORIA).
- [ ] Espacios disponibles: muro de fondo, portón / ventana, letrero con renta.

### 4. Minijuegos (piel; la lógica ya está)
- [ ] GATO: fichas de madera (X / O) y tablero tallado.
- [ ] CONECTA 4: marco metálico y rondanas (hoy círculos CSS).
- [ ] MEMORIA: 6 ilustraciones de piezas (anillo, dije, cadena, piedra, pinza, lima).

### 5. LA PIEZA CENTRAL
- [ ] Pedestal a 48 px/m y los tres componentes (base, estructura de metal,
      detalle en plata) + pieza completa (hoy: sprite de madera + vectores).

### 6. Identidad y contenido
- [ ] Logotipo LA BOR TALLERES en SVG (hoy tipografía).
- [ ] Logos de VETA, MANNNO, CONTRASTE (para techos y overlays).
- [ ] Descripción real de 2–3 líneas por residente; foto por espacio.
- [ ] Instagram de La Bor (campo `CONTACT.instagram` vacío).
- [ ] Texto definitivo de la intro.

### 7. Sonido
- [x] Música de ambiente en loop (Love In The Night) con play / pausa en el menú.
- [ ] 3–4 pistas y selector en el menú (la lista `TRACKS` ya lo admite).
- [ ] Room tone del patio + efectos (martillo, sierra, metal, pasos, fichas).

## Decisiones pendientes (no inventar geometría)
- [ ] Uso real de la franja sur de la franja oeste (12.31 m, hoy bloqueada sin nombre).
- [ ] Acceso por Cobá: el plano solo abre el INGRESO en Calle 12 Sur. Si hay
      acceso peatonal por Cobá, agregar `opening` + `spawn` en el TMJ (1 min).
- [ ] Puertas exactas de P01/P02 (hoy en la cara oeste, hacia el patio) y de P04/CONTRASTE (cara sur).
- [ ] Dominio + hosting para publicar (Vercel sería lo directo).
