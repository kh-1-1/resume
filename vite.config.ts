import { readFile } from "node:fs/promises"
import path from "node:path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig, type Plugin } from "vite"

function localPrivateResumePlugin(): Plugin {
  const privateBackupPath = path.resolve(import.meta.dirname, "./private/resume-import.json")

  return {
    name: "local-private-resume",
    apply: "serve",
    configureServer(server) {
      server.middlewares.use("/private-resume-import.json", async (_request, response, next) => {
        try {
          const backup = await readFile(privateBackupPath)

          response.statusCode = 200
          response.setHeader("Content-Type", "application/json; charset=utf-8")
          response.setHeader("Cache-Control", "no-store")
          response.end(backup)
        } catch (error) {
          if ((error as NodeJS.ErrnoException).code === "ENOENT") {
            next()
            return
          }

          next(error as Error)
        }
      })
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [localPrivateResumePlugin(), react(), tailwindcss()],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
})
