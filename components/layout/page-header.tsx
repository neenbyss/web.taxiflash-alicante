/** Cabecera de página consistente para los portales: título, descripción y
 *  una zona de acciones opcional a la derecha. */
export function PageHeader({
  titulo,
  descripcion,
  children,
}: {
  titulo: string
  descripcion?: string
  children?: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
      <div className="min-w-0 max-w-2xl">
        <h1 className="text-balance font-heading text-2xl leading-tight font-medium tracking-[-0.02em] sm:text-3xl">{titulo}</h1>
        {descripcion && (
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground sm:text-base">{descripcion}</p>
        )}
      </div>
      {children && <div className="flex w-full items-center gap-2 sm:w-auto">{children}</div>}
    </div>
  )
}
