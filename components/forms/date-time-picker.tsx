"use client"

import { RiCalendarLine, RiTimeLine } from "@/components/icons"
import { format } from "date-fns"
import { es } from "date-fns/locale"
import { useState } from "react"

import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"

type DateTimePickerProps = {
  value: Date | null
  onChange: (valor: Date | null) => void
  /** Texto cuando no hay fecha (viaje inmediato). */
  placeholder?: string
}

function combinar(dia: Date, hora: string): Date {
  const [h, m] = hora.split(":").map(Number)
  const d = new Date(dia)
  d.setHours(h || 0, m || 0, 0, 0)
  return d
}

/**
 * Selector de fecha y hora (date-picker de shadcn: Popover + Calendar).
 * value null = viaje inmediato ("ahora mismo").
 */
export function DateTimePicker({
  value,
  onChange,
  placeholder = "Ahora mismo",
}: DateTimePickerProps) {
  const [open, setOpen] = useState(false)
  const [hora, setHora] = useState(value ? format(value, "HH:mm") : "12:00")

  const elegirDia = (dia: Date | undefined) => {
    if (!dia) {
      onChange(null)
      return
    }
    onChange(combinar(dia, hora))
  }

  const cambiarHora = (str: string) => {
    setHora(str)
    if (value) onChange(combinar(value, str))
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger
        render={
          <Button
            type="button"
            variant="outline"
            className={cn(
              "h-12 w-full justify-start gap-2 rounded-lg bg-input px-3 text-sm font-normal ring ring-ring/40",
              !value && "text-muted-foreground"
            )}
          />
        }
      >
        <RiCalendarLine className="size-5 shrink-0 text-muted-foreground" aria-hidden />
        {value ? format(value, "d MMM yyyy, HH:mm", { locale: es }) : placeholder}
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={value ?? undefined}
          onSelect={elegirDia}
          disabled={{ before: new Date() }}
          autoFocus
        />
        <div className="flex items-center gap-2 border-t p-3">
          <label
            htmlFor="dtp-hora"
            className="flex items-center gap-1.5 text-sm text-muted-foreground"
          >
            <RiTimeLine className="size-4" aria-hidden />
            Hora
          </label>
          <input
            id="dtp-hora"
            type="time"
            value={hora}
            onChange={(e) => cambiarHora(e.target.value)}
            className="h-9 flex-1 rounded-md bg-input px-2 text-sm outline-none ring ring-ring/40 focus:ring-2 focus:ring-primary"
          />
          {value && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => {
                onChange(null)
                setOpen(false)
              }}
            >
              Ahora mismo
            </Button>
          )}
        </div>
      </PopoverContent>
    </Popover>
  )
}
