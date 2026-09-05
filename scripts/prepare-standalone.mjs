import { cpSync, existsSync, mkdirSync } from "node:fs"
import { resolve } from "node:path"

const root = process.cwd()
const standalone = resolve(root, ".next", "standalone")

if (!existsSync(standalone)) {
  throw new Error("No existe .next/standalone. Ejecuta next build primero.")
}

const publicSource = resolve(root, "public")
if (existsSync(publicSource)) {
  cpSync(publicSource, resolve(standalone, "public"), {
    recursive: true,
    force: true,
  })
}

const staticSource = resolve(root, ".next", "static")
if (existsSync(staticSource)) {
  const standaloneNext = resolve(standalone, ".next")
  mkdirSync(standaloneNext, { recursive: true })
  cpSync(staticSource, resolve(standaloneNext, "static"), {
    recursive: true,
    force: true,
  })
}

console.log("Recursos public y static preparados para el servidor standalone.")
