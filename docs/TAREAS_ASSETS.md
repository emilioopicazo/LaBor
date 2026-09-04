# LA BOR — Tarea de assets y contenido

Estado tras integrar el paquete de diseño (V1.1). Reglas: vista
cenital, luz del noroeste, sombras al sureste, fondo transparente,
export 2×, nombres de `docs/LABOR_ART_DIRECTION_ASSETS.md` §23.

## Entregado e integrado

- [x] Sistema de diseño (tokens, tipografía, chips, pulso ocre).
- [x] Piso del patio, muros perimetrales, portón de Cobá.
- [x] Techumbres de las 11 estructuras.
- [x] Árbol principal (base + copa), árbol de banqueta, palmas, arbustos.
- [x] Props: tablero, tótem, mesa, madera, tarimas, macetas, tanque.
- [x] Pedestal de LA PIEZA CENTRAL.
- [x] Visitante: idle + 2 frames de caminata.
- [x] Gato y pájaros (2 frames).
- [x] Plano medido `labor-master-plan.png` + TRAMA PDF.

## Falta — mayor impacto primero

### Gameplay (siguientes talleres)
- [ ] Interior de VETA (hoy: placeholder de duela + sprites). Piso,
      muro de fondo, racks, herramientas. ~1400×960 lógico ÷ 6.
- [ ] Interior de MANNINO / herrería: fragua, yunque, mesa de soldar,
      chispas. Estaciones: FORJAR (timing) y SOLDAR (trazo).
- [ ] Interior de CONTRASTE / joyería: banco de joyero, pulidora.
      Estaciones: FORMAR (trazo), PULIR (círculo), DETALLE (elección).
- [ ] Estados de LA PIEZA CENTRAL: base de madera (hoy usa el sprite de
      madera), + componente de metal, + detalle en plata, pieza completa.
- [ ] Pose de interacción del visitante (`visitor-interact-v1.png`).
- [ ] Iconos/tags de inventario (`ui-inventory-tag-v1.svg`).

### Identidad y contenido
- [ ] Logotipo LA BOR TALLERES en SVG (hoy tipografía).
- [ ] Logos de VETA, MANNINO, CONTRASTE.
- [ ] Contacto real (Instagram, WhatsApp, email).
- [ ] Descripción real de 2–3 líneas por residente.
- [ ] 1 foto horizontal por residente y por espacio disponible
      (`public/assets/overlays/`).
- [ ] Copy definitivo: el diseño móvil usa interfaz en inglés
      ("TAP THE GROUND…", "THIS COULD BE YOURS…", "CLAIM THIS SPACE");
      hoy el mundo está en español. Decidir idioma de la interfaz.

### Diseño móvil (docs/LABOR_MOBILE_WORLD_DESIGN_HANDOFF.md)
- [ ] Stick flotante al arrastrar (hoy: tap-para-caminar + teclado).
- [ ] Botón ENTER "espacio más cercano".
- [ ] Hoja inferior con formulario "CLAIM THIS SPACE" (a dónde llegan
      los leads: email / WhatsApp / hoja de cálculo).
- [ ] Slot de video 16:9 en los overlays.

### Sonido (futuro, apagado)
- [ ] Room tone del patio + 3–4 efectos (martillo, sierra, metal, pasos).

## Decisiones pendientes
- [ ] MANNINO vs MANNNO (el logo del plano TRAMA parece decir MANNNO).
- [ ] ¿Precio de renta visible o solo "INFORMACIÓN → contacto"?
- [ ] Idioma de la interfaz (español hoy / inglés en el diseño móvil).
- [ ] Dominio + hosting para publicar (Vercel sería lo directo).
