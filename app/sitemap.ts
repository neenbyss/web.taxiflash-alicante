import type { MetadataRoute } from "next"

export default function sitemap(): MetadataRoute.Sitemap {
  const origin = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3500"
  const lastModified = new Date()

  return [
    { url: origin, lastModified, changeFrequency: "weekly", priority: 1 },
    {
      url: `${origin}/about`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    {
      url: `${origin}/ubicaciones`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ]
}
