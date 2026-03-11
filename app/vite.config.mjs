import path from "path"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

export default defineConfig({
  base: './',
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: [/\.tsx?$/],
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
  },
})
