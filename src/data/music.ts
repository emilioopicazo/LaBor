// ============================================================
// LA BOR — música de ambiente
// Una pista por ahora; la lista ya admite varias (selector después).
// Archivos en public/assets/audio/ (AAC .m4a: Safari, Chrome, Firefox).
// ============================================================

export interface Track {
  id: string
  title: string
  artist: string
  /** fuentes en orden de preferencia: AAC (.m4a) y respaldo MP3 (universal) */
  sources: Array<{ src: string; type: string }>
}

export const TRACKS: Track[] = [
  {
    id: "love-in-the-night",
    title: "Love In The Night",
    artist: "Unknown Artist",
    sources: [
      { src: "/assets/audio/love-in-the-night.m4a", type: "audio/mp4" },
      { src: "/assets/audio/love-in-the-night.mp3", type: "audio/mpeg" },
    ],
  },
]

/** volumen de ambiente: presente sin asustar (0–1) */
export const AMBIENT_VOLUME = 0.22
/** entrada suave para que nadie brinque */
export const FADE_IN_MS = 2600
