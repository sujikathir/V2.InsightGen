import path from "path"
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./src"),
    },
  },
  esbuild: {
    loader: 'tsx',
    include: [
      "src/**/*.tsx",
      "src/**/*.ts",
      "src/**/*.jsx",
      "src/**/*.js",
    ],
  },
})