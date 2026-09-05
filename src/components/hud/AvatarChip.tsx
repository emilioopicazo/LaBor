import { getAvatar } from "../../data/avatars"
import { AvatarSprite } from "../experience/AvatarSprite"

interface AvatarChipProps {
  avatarId: string
  sceneName: string | null
  onClick: () => void
}

/** Chip de perfil (arriba-izquierda): avatar + dónde estás. Abre CAMBIAR PERSONAJE. */
export function AvatarChip({ avatarId, sceneName, onClick }: AvatarChipProps) {
  const avatar = getAvatar(avatarId)
  return (
    <button type="button" className="chip" onClick={onClick} aria-label={`Personaje: ${avatar.name}. Cambiar personaje`}>
      <span className="chip__sprite">
        <AvatarSprite avatar={avatar} scale={2} />
      </span>
      <span className="chip__text">
        <span className="chip__name">{avatar.name}</span>
        <span className="chip__place">{sceneName ?? "LA BOR · PATIO"}</span>
      </span>
    </button>
  )
}
