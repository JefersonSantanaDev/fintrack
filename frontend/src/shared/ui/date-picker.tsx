
import * as React from "react"
import { format } from "date-fns"
import { ptBR } from "date-fns/locale"
import { CalendarDays } from "lucide-react"
import type { Matcher } from "react-day-picker"

import { cn } from "@/shared/lib/utils"
import { Button } from "@/shared/ui/button"
import { Calendar } from "@/shared/ui/calendar"
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover"

interface DatePickerProps {
  id?: string
  value?: Date
  onChange: (date: Date | undefined) => void
  placeholder?: string
  className?: string
  disabled?: boolean
  fromDate?: Date
  toDate?: Date
}

function DatePicker({
  id,
  value,
  onChange,
  placeholder = "Selecione a data",
  className,
  disabled = false,
  fromDate,
  toDate,
}: DatePickerProps) {
  const [open, setOpen] = React.useState(false)

  const disabledMatcher = React.useMemo(() => {
    const matchers: Matcher[] = []

    if (fromDate) {
      matchers.push({ before: fromDate })
    }

    if (toDate) {
      matchers.push({ after: toDate })
    }

    return matchers.length > 0 ? matchers : undefined
  }, [fromDate, toDate])

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          id={id}
          type="button"
          variant="outline"
          disabled={disabled}
          className={cn(
            "h-10 w-full justify-between rounded-md px-3 text-left font-normal",
            !value && "text-muted-foreground",
            className
          )}
        >
          {value ? format(value, "dd/MM/yyyy", { locale: ptBR }) : placeholder}
          <CalendarDays className="size-4 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="start"
        side="bottom"
        sideOffset={6}
        avoidCollisions={false}
        className="w-auto overflow-hidden rounded-xl border bg-popover p-0 shadow-lg"
      >
        <Calendar
          mode="single"
          selected={value}
          onSelect={date => {
            onChange(date)
            if (date) {
              setOpen(false)
            }
          }}
          defaultMonth={value}
          disabled={disabledMatcher}
          autoFocus
        />
      </PopoverContent>
    </Popover>
  )
}

export { DatePicker }
