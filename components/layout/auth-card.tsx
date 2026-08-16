import { Logo } from "@/components/shared/logo"

type AuthCardProps = {
  titulo: string
  descripcion?: string
  children: React.ReactNode
}

/** Tarjeta de autenticación centrada (chofer, admin, registro). */
export function AuthCard({ titulo, descripcion, children }: AuthCardProps) {
  return (
    <main className="grid min-h-dvh place-items-center p-4">
      <div className="w-full max-w-md rounded-3xl bg-card p-6 shadow-xl ring-1 ring-foreground/5 sm:p-8">
        <div className="mb-6 flex flex-col items-center gap-3 text-center">
          <Logo href="/" size="lg" />
          <div>
            <h1 className="font-heading text-xl font-semibold">{titulo}</h1>
            {descripcion && (
              <p className="mt-0.5 text-sm text-muted-foreground">{descripcion}</p>
            )}
          </div>
        </div>
        {children}
      </div>
    </main>
  )
}
