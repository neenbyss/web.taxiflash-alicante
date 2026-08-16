import { getSessionCookie } from "better-auth/cookies"
import { NextResponse, type NextRequest } from "next/server"

// ============================================================
// proxy.ts = el "middleware" de Next.js 16 (la convención
// middleware.ts quedó deprecada y se renombró a proxy.ts).
// Corre en el servidor ANTES de renderizar cualquier ruta.
// ============================================================
//
// Seguridad en 3 capas (esta es la primera, optimista):
//   1. proxy.ts  — comprueba la cookie de sesión y redirige (rápido, sin DB).
//   2. Layout de cada portal — valida sesión REAL y rol en el servidor
//      (requireRole en server/session.ts).
//   3. Procedimientos tRPC — vuelven a exigir sesión, rol y permiso en cada
//      operación (server/trpc.ts).
// La cookie puede falsificarse en teoría, por eso las capas 2 y 3 son las
// autoritativas; el proxy solo evita renderizar de más y mejora la UX.

const RUTAS_PROTEGIDAS = ["/cliente", "/chofer", "/admin"]
const RUTAS_SOLO_ANONIMOS = ["/login", "/register"]

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const sessionCookie = getSessionCookie(request)

  // Portales: sin cookie de sesión no se entra; se recuerda a dónde iba.
  const esProtegida = RUTAS_PROTEGIDAS.some(
    (ruta) => pathname === ruta || pathname.startsWith(`${ruta}/`)
  )
  if (esProtegida && !sessionCookie) {
    const loginUrl = new URL("/login", request.url)
    loginUrl.searchParams.set("callbackUrl", pathname)
    return NextResponse.redirect(loginUrl)
  }

  // Login/registro: un usuario ya autenticado va directo a su portal.
  if (RUTAS_SOLO_ANONIMOS.includes(pathname) && sessionCookie) {
    return NextResponse.redirect(new URL("/redirigir", request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/cliente/:path*",
    "/chofer/:path*",
    "/admin/:path*",
    "/login",
    "/register",
  ],
}
