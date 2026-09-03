# LA BOR — Tarea de assets y contenido

Lista de todo lo que falta para pasar del prototipo gris al mundo
custom, manteniendo la estética de videojuego / maqueta. Actualizar
este documento conforme se entreguen cosas.

Reglas para que todo embone en el mundo actual:

- Vista **cenital / top-down** (como maqueta vista desde arriba),
  luz consistente desde el noroeste, sombras hacia el sureste.
- Fondo **transparente** (PNG/WebP) para todo lo que sea objeto o
  edificio suelto; el motor no cambia, solo se sustituye el dibujo.
- Paleta: blancos sucios, grises concreto, carbón; acentos óxido y
  verde desaturado. Nada de neón ni colores saturados.
- Nombrar en minúsculas con guiones: `nave-01.webp`, `arbol-principal.webp`.
- Destinos: `public/assets/world/`, `public/assets/residents/`,
  `public/assets/objects/`, `public/assets/audio/`.

## 1. Referencias

- [x] Plano TRAMA con cotas (`260823_TRAMA-layout.pdf`) — en el repo.
- [ ] PNG del plano con diseño → guardar como
      `public/assets/reference/labor-master-plan.png` (llegó como
      imagen de chat, falta el archivo).

## 2. Identidad

- [ ] Logotipo / lockup LA BOR TALLERES en SVG (hoy es tipografía).
- [ ] Tipografía definitiva de marca (hoy: Archivo de Google Fonts).
- [ ] Confirmar escritura de MANNINO (el plano TRAMA parece decir
      "MANNNO" en el logo; el resumen dice "MANNINO").
- [ ] Logos de residentes en SVG/PNG: VETA, MANNINO, CONTRASTE.

## 3. Contenido y contacto

- [ ] Contacto real de La Bor: Instagram, WhatsApp, email (overlay
      CONTACTO hoy tiene placeholders).
- [ ] Descripción corta real por residente (2–3 líneas): VETA,
      MANNINO, CONTRASTE.
- [ ] Condiciones de espacios disponibles: ¿se muestra precio de
      renta o solo "INFORMACIÓN"? (decisión comercial).
- [ ] Primeros eventos / talleres reales para EVENTOS y AGENDA
      (nombre, fecha, cupo) cuando existan.

## 4. Mundo — piezas visuales (para sustituir el SVG gris)

Cada pieza puede generarse con IA / render / foto tratada, siempre
en cenital y con la misma luz. Tamaños aproximados en px de mundo
(entregar a 2× para nitidez).

- [ ] Piso del patio: textura de concreto ~1700×700 (tileable ideal).
- [ ] NAVE 01 / 02: techumbre industrial ~550×400 c/u (pueden
      compartir asset espejado).
- [ ] NAVE 03: ~440×400.
- [ ] PABELLÓN 01 / 02 con terraza: ~550×300 (terraza poniente
      visible: pérgola / sombra).
- [ ] PABELLÓN 03: ~300×270. PABELLÓN 04: ~350×300.
- [ ] CONTRASTE ATELIER: ~300×300 (techo con tragaluces, puerta sur).
- [ ] Franja VETA con corte diagonal: ~250×560.
- [ ] Sección MANNINO: ~250×760 (placa negra visible).
- [ ] Árbol principal (hito) + 2 arbustos, con sombra: ~300×300.
- [ ] Árbol de banqueta (Calle 12 sur): ~120×140.
- [ ] Objetos del patio: tablero EVENTOS (~100×110), mesa de trabajo
      TALLERES (~130×80), tótem INFO (~60×90), tarimas/huacales,
      madera apilada.
- [ ] Portón INGRESO (Calle 12 sur) y portón de servicio a Cobá.
- [ ] Visitante: 2–4 poses (frente, perfil caminando ×2) silueta
      carbón ~40×70; con eso se arma la animación de caminata.
- [ ] Textura sutil de grano/concreto general (hoy es ruido SVG).

## 5. Fotos / video reales (para overlays y overlays futuros)

- [ ] 1 foto horizontal por residente (interior del taller) para el
      overlay: CONTRASTE, VETA, MANNINO (campo `image` ya existe).
- [ ] 1 foto por espacio disponible (estado actual) o render.
- [ ] Clips cortos (10–20 s, loop, sin audio, MP4/WebM ≤5 MB) para
      overlays futuros: manos trabajando plata (CONTRASTE), madera
      (VETA), patio en uso. Verticales u horizontales, consistentes.
- [ ] Foto aérea / dron del predio (referencia de color y para
      posible "modo real" futuro).

## 6. Sonido (futuro, apagado por defecto)

- [ ] Room tone del patio (viento, pájaros, taller lejano) 30–60 s loop.
- [ ] 3–4 SFX: martilleo, sierra, metal, pasos en concreto.

## 7. Decisiones pendientes

- [ ] ¿La sección sur de la franja poniente es de MANNINO (como está
      hoy) o de VETA?
- [ ] ¿El portón junto a NAVE 03 hacia Cobá es acceso vehicular,
      peatonal o solo servicio?
- [ ] ¿Los pabellones 01/02 se anuncian con 80 m² totales o
      separando interior/terraza? (hoy: 80 m² + desglose).
- [ ] ¿AGENDA vive como espacio propio o se fusiona con EVENTOS?
- [ ] Dominio y hosting para publicar el prototipo (p. ej. Vercel).
