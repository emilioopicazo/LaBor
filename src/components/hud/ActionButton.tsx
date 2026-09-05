interface ActionButtonProps {
  label: string | null
  caption: string | null
  coarse: boolean
  onPress: () => void
}

/**
 * UN botón contextual (abajo-derecha). Dice exactamente lo que va a
 * pasar: ENTRAR · VER · JUGAR · INSTALAR · SALIR. Sin objetivo cerca,
 * no existe.
 */
export function ActionButton({ label, caption, coarse, onPress }: ActionButtonProps) {
  if (!label) return null
  return (
    <div className="action">
      {caption && <span className="action__caption">{caption}</span>}
      <button
        type="button"
        className="action__button"
        onPointerDown={(e) => e.stopPropagation()}
        onClick={(e) => {
          e.stopPropagation()
          onPress()
        }}
      >
        {label}
        {!coarse && <span className="action__key">E</span>}
      </button>
    </div>
  )
}
