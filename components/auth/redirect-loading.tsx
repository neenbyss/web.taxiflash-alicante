import { Logo } from "@/components/shared/logo"
import { RiLoaderLine } from "@/components/icons"

export function RedirectLoading() {
  return (
    <main className="grid min-h-dvh place-items-center bg-background px-6">
      <div className="flex flex-col items-center gap-6">
        <Logo href={null} size="lg" />
        <p
          role="status"
          className="flex items-center gap-2 text-sm text-muted-foreground"
        >
          <RiLoaderLine
            className="size-4 animate-spin motion-reduce:animate-none"
            aria-hidden
          />
          Redirigiendo…
        </p>
      </div>
    </main>
  )
}
