import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
  },
  build: {
    target: "es2019",
    // Phaser se carga en un chunk aparte (dinámico) después de la intro
    chunkSizeWarningLimit: 1700,
  },
})
