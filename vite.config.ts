import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react-swc" // Ini otomatis pakai SWC sesuai pilihanmu
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})