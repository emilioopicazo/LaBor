import { FRAME_H, FRAME_W, type AvatarDef } from "../../data/avatars"

interface AvatarSpriteProps {
  avatar: AvatarDef
  scale: number
  /** anima el ciclo de caminar (frente) */
  walking?: boolean
}

/** Frame del sheet (CSS, nearest-neighbor). Fila 0 = frente. */
export function AvatarSprite({ avatar, scale, walking = false }: AvatarSpriteProps) {
  return (
    <span
      className={`avatar-sprite${walking ? " is-walking" : ""}`}
      style={{
        width: FRAME_W * scale,
        height: FRAME_H * scale,
        backgroundImage: `url(${avatar.sheet})`,
        backgroundSize: `${FRAME_W * 4 * scale}px ${FRAME_H * 3 * scale}px`,
        // @ts-expect-error variable CSS para la animación
        "--frame-w": `${FRAME_W * scale}px`,
      }}
      aria-hidden="true"
    />
  )
}
