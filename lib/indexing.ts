/** Las demos y previews no deben competir con el sitio definitivo en buscadores. */
export function isIndexingAllowed(env = process.env): boolean {
  return (
    env.NODE_ENV === "production" &&
    env.SITE_NOINDEX !== "true" &&
    (!env.VERCEL_ENV || env.VERCEL_ENV === "production")
  )
}
