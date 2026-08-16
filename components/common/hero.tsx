import Image from "next/image"

/**
 * Hero de las páginas interiores del sitio público. Mismo lenguaje visual que
 * el hero del landing: fondo oscuro con imagen, degradado y tipografía heading.
 */
export function Hero({
  title,
  description,
}: {
  title: string | React.JSX.Element
  description: string
}) {
  return (
    <section className="relative lg:p-2">
      <div className="relative z-10 container-screen-2xl pt-36 pb-16 text-center text-white lg:pt-48 lg:pb-24">
        <h1 className="mx-auto max-w-4xl font-heading text-4xl leading-tight sm:text-5xl lg:text-7xl">
          {title}
        </h1>
        <p className="mx-auto mt-5 max-w-2xl text-balance text-white/80 sm:text-lg">
          {description}
        </p>
      </div>

      <div className="pointer-events-none absolute inset-0 overflow-clip rounded-4xl">
        <Image
          src="/images/hero_bg.webp"
          width={1600}
          height={900}
          alt=""
          priority
          className="absolute top-1/2 left-1/2 size-full -translate-x-1/2 -translate-y-1/2 scale-110 object-cover"
        />
        <div className="absolute inset-0 bg-linear-to-t from-neutral-900/95 via-neutral-900/80 to-neutral-900/50" />
      </div>
    </section>
  )
}
