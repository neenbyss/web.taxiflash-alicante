# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- Clientes que necesitan reservar un taxi, programar paradas, consultar viajes y gestionar su perfil desde móvil o escritorio.
- Choferes que necesitan descubrir, aceptar y operar viajes con rapidez, normalmente desde un teléfono.
- Administradores que supervisan reservas, usuarios, permisos, alquileres, reseñas, reportes y notificaciones.

## Product Purpose

TaxiFlash permite solicitar y gestionar servicios de taxi desde la web sin depender de una aplicación instalada. El éxito significa que cada rol puede entender el estado del servicio y completar su siguiente acción con pocos pasos y sin ambigüedad.

## Positioning

Reserva web directa con tarifa estimada, trazado por calles, paradas intermedias y operación diferenciada para cliente, chofer y administración.

## Operating Context

- Los clientes usan principalmente formularios y mapas para crear y seguir reservas.
- Los choferes necesitan acciones rápidas y estados legibles durante el trabajo móvil.
- Administración trabaja con paneles, tablas, filtros y acciones sobre grandes conjuntos de datos.
- Los tres portales comparten autenticación, notificaciones, perfil y cambio de portal según permisos.

## Capabilities and Constraints

- Next.js 16, React 19, TypeScript, Tailwind CSS 4, shadcn/ui, Base UI, tRPC, Prisma, PostgreSQL y Better Auth.
- Leaflet y OpenStreetMap muestran origen, destino, paradas y rutas calculadas por OSRM.
- El layout actual del dashboard debe conservarse.
- Las rutas públicas y de portales están en inglés; el contenido de interfaz está en español.
- El sistema debe funcionar bien en teléfonos de gama media y respetar preferencias de movimiento reducido.

## Brand Commitments

- Marca TaxiFlash.
- Paleta existente crema, blanco, carbón y amarillo dorado.
- Tipografía serif editorial para títulos y sans serif clara para operación.
- Superficies suaves, esquinas amplias y diseño moderno sin depender de bordes visibles.
- El dashboard actual y su layout son la referencia visual vinculante.

## Evidence on Hand

- Datos locales del seed para los tres roles.
- Implementación actual de todos los portales y sus estados.
- Capturas aportadas por el usuario del dashboard y del flujo de reserva.
- No deben inventarse métricas comerciales, testimonios adicionales ni afirmaciones externas.

## Product Principles

1. La siguiente acción debe ser evidente y estar al alcance.
2. Estado, ruta, tiempo y coste deben comprenderse de un vistazo.
3. La experiencia móvil debe sentirse nativa, no como escritorio reducido.
4. La densidad de información debe aumentar sin sacrificar claridad.
5. La identidad visual existente debe sostener cada mejora.

## Accessibility & Inclusion

- Controles táctiles de al menos 44 px y navegación completa por teclado.
- Contraste suficiente, foco visible y estados que no dependan únicamente del color.
- Movimiento reducido y contenido usable antes de completar animaciones.
