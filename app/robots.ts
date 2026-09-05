import type { MetadataRoute } from "next"

const origin = () => process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3500"

export default function robots(): MetadataRoute.Robots {
  const production = process.env.NODE_ENV === "production"

  return {
    rules: production
      ? {
          userAgent: "*",
          allow: "/",
          disallow: [
            "/admin/",
            "/customer/",
            "/driver/",
            "/api/",
            "/login",
            "/register",
            "/complete-profile",
            "/forgot-password",
            "/acceso-admin",
            "/acceso-chofer",
            "/redirigir",
            "/reserva",
            "/reserva/",
          ],
        }
      : { userAgent: "*", disallow: "/" },
    sitemap: `${origin()}/sitemap.xml`,
    host: origin(),
  }
}
