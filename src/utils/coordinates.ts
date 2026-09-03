// Conversión entre coordenadas de pantalla y de mundo.
// La cámara se define por el punto de mundo (x, y) que queda en el
// centro del viewport y un zoom uniforme.

export interface CameraState {
  x: number
  y: number
  zoom: number
}

export interface ViewportSize {
  width: number
  height: number
}

export function screenToWorldCoordinates(
  sx: number,
  sy: number,
  camera: CameraState,
  viewport: ViewportSize,
): { x: number; y: number } {
  return {
    x: (sx - viewport.width / 2) / camera.zoom + camera.x,
    y: (sy - viewport.height / 2) / camera.zoom + camera.y,
  }
}

export function worldToScreenCoordinates(
  wx: number,
  wy: number,
  camera: CameraState,
  viewport: ViewportSize,
): { x: number; y: number } {
  return {
    x: (wx - camera.x) * camera.zoom + viewport.width / 2,
    y: (wy - camera.y) * camera.zoom + viewport.height / 2,
  }
}

/** Transform CSS que aplica la cámara al contenedor del mundo. */
export function cameraTransform(camera: CameraState, viewport: ViewportSize): string {
  const tx = viewport.width / 2 - camera.x * camera.zoom
  const ty = viewport.height / 2 - camera.y * camera.zoom
  return `translate3d(${tx}px, ${ty}px, 0) scale(${camera.zoom})`
}

/** Limita la cámara para no mostrar vacío fuera del mundo. */
export function clampCamera(
  x: number,
  y: number,
  zoom: number,
  viewport: ViewportSize,
  worldWidth: number,
  worldHeight: number,
): { x: number; y: number } {
  const halfW = viewport.width / 2 / zoom
  const halfH = viewport.height / 2 / zoom
  const cx =
    halfW * 2 >= worldWidth ? worldWidth / 2 : Math.min(Math.max(x, halfW), worldWidth - halfW)
  const cy =
    halfH * 2 >= worldHeight ? worldHeight / 2 : Math.min(Math.max(y, halfH), worldHeight - halfH)
  return { x: cx, y: cy }
}
