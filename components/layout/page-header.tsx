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
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="font-heading text-xl font-semibold">{titulo}</h1>
        {descripcion && (
          <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>
        )}
      </div>
      {children && <div className="flex items-center gap-2">{children}</div>}
    </div>
  )
}
