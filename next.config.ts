import type { NextConfig } from "next"
import { dirname } from "node:path"
import { fileURLToPath } from "node:url"

const projectRoot = dirname(fileURLToPath(import.meta.url))

const nextConfig: NextConfig = {
  poweredByHeader: false,
  turbopack: { root: projectRoot },

  // Docker copia el servidor autocontenido generado por Next.js.
  output: "standalone",

  // Cabeceras de seguridad para todas las rutas.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          // Evita que el sitio se incruste en iframes (clickjacking).
          { key: "X-Frame-Options", value: "DENY" },
          // El navegador no debe "adivinar" tipos MIME.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // No filtrar la URL completa a sitios externos.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "X-DNS-Prefetch-Control", value: "off" },
          { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          {
            key: "Content-Security-Policy",
            value:
              "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; form-action 'self'",
          },
          // El mapa puede solicitar geolocalización únicamente desde este origen.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=(self)",
          },
          ...(process.env.BETTER_AUTH_URL?.startsWith("https://")
            ? [
                {
                  key: "Strict-Transport-Security",
                  value: "max-age=63072000; includeSubDomains; preload",
                },
              ]
            : []),
        ],
      },
    ]
  },
}

export default nextConfig
