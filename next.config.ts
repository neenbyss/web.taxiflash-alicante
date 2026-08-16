import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  // Salida autocontenida para la imagen Docker (node server.js).
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
          // La app no usa cámara/micrófono/geolocalización del navegador.
          {
            key: "Permissions-Policy",
            value: "camera=(), microphone=(), geolocation=()",
          },
        ],
      },
    ]
  },
}

export default nextConfig
