import { ASSETS } from "../../data/assets"

const CAT_W = ASSETS.cat1.w * 4
const CAT_H = ASSETS.cat1.h * 4
const BIRD_W = ASSETS.bird1.w * 4
const BIRD_H = ASSETS.bird1.h * 4

/**
 * Vida ambiental decorativa (sistema de diseño §6): un gato que
 * recorre el patio en loop y pájaros que cruzan el cielo. Sin
 * colisión, sin interacción. Todo el movimiento vive en CSS y los
 * frames alternan con un solo reloj de 340 ms.
 */
export function CourtyardCat() {
  return (
    <g className="fauna fauna-cat" aria-hidden="true">
      <image
        href={ASSETS.cat1.src}
        x={-CAT_W / 2}
        y={-CAT_H}
        width={CAT_W}
        height={CAT_H}
        preserveAspectRatio="none"
        className="px fauna-frame fauna-frame--a"
      />
      <image
        href={ASSETS.cat2.src}
        x={-CAT_W / 2}
        y={-CAT_H}
        width={CAT_W}
        height={CAT_H}
        preserveAspectRatio="none"
        className="px fauna-frame fauna-frame--b"
      />
    </g>
  )
}

function Bird({ variant }: { variant: 1 | 2 | 3 }) {
  return (
    <g className={`fauna fauna-bird fauna-bird--${variant}`} aria-hidden="true">
      <g className="fauna-bird__flip">
        <image
          href={ASSETS.bird1.src}
          x={-BIRD_W / 2}
          y={-BIRD_H / 2}
          width={BIRD_W}
          height={BIRD_H}
          preserveAspectRatio="none"
          className="px fauna-frame fauna-frame--a"
        />
        <image
          href={ASSETS.bird2.src}
          x={-BIRD_W / 2}
          y={-BIRD_H / 2}
          width={BIRD_W}
          height={BIRD_H}
          preserveAspectRatio="none"
          className="px fauna-frame fauna-frame--b"
        />
      </g>
    </g>
  )
}

export function SkyBirds() {
  return (
    <g id="foreground">
      <Bird variant={1} />
      <Bird variant={2} />
      <Bird variant={3} />
    </g>
  )
}
