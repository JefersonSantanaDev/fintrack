"use client"

import * as React from "react"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { DayPicker, type DayPickerProps } from "react-day-picker"
import { ptBR } from "date-fns/locale"

import { cn } from "@/shared/lib/utils"
import { buttonVariants } from "@/shared/ui/button-variants"

function Calendar({
  className,
  classNames,
  showOutsideDays = true,
  locale = ptBR,
  ...props
}: DayPickerProps) {
  return (
    <DayPicker
      showOutsideDays={showOutsideDays}
      locale={locale}
      className={cn("p-3", className)}
      classNames={{
        root: "w-full",
        months: "flex flex-col gap-4",
        month: "space-y-4",
        month_caption: "relative flex h-8 items-center justify-center pt-1 select-none",
        caption_label: "pointer-events-none text-sm font-medium capitalize",
        nav: "pointer-events-none absolute inset-x-0 top-1 z-10 flex items-center justify-between px-1",
        button_previous: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "pointer-events-auto size-7 cursor-pointer rounded-md p-0 text-muted-foreground hover:text-foreground"
        ),
        button_next: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "pointer-events-auto size-7 cursor-pointer rounded-md p-0 text-muted-foreground hover:text-foreground"
        ),
        month_grid: "w-full border-collapse",
        weekdays: "grid grid-cols-7",
        weekday: "text-center text-xs font-medium text-muted-foreground",
        weeks: "mt-1 space-y-1",
        week: "grid grid-cols-7",
        day: "text-center text-sm",
        day_button: cn(
          buttonVariants({ variant: "ghost", size: "icon" }),
          "mx-auto size-8 rounded-md p-0 font-normal aria-selected:opacity-100"
        ),
        selected:
          "bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
        today: "bg-accent text-accent-foreground",
        outside:
          "text-muted-foreground opacity-45 aria-selected:bg-accent/50 aria-selected:text-muted-foreground aria-selected:opacity-30",
        disabled: "text-muted-foreground opacity-35",
        range_middle:
          "aria-selected:bg-accent aria-selected:text-accent-foreground",
        range_start: "rounded-l-md",
        range_end: "rounded-r-md",
        hidden: "invisible",
        ...classNames,
      }}
      components={{
        Chevron: ({ className: chevronClassName, orientation, ...chevronProps }) =>
          orientation === "left" ? (
            <ChevronLeft
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ) : (
            <ChevronRight
              className={cn("size-4", chevronClassName)}
              {...chevronProps}
            />
          ),
      }}
      {...props}
    />
  )
}

export { Calendar }
