"use client"

import * as React from "react"
import { format, subDays, isSameDay } from "date-fns"
import { Calendar as CalendarIcon } from "lucide-react"
import { DateRange } from "react-day-picker"
import { id } from "date-fns/locale"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface DatePickerWithRangeProps {
  className?: string
  date?: DateRange
  onDateChange?: (date: DateRange | undefined) => void
}

export function DatePickerWithRange({
  className,
  date,
  onDateChange,
}: DatePickerWithRangeProps) {
  // Determine if the current date range matches a preset
  const today = new Date()
  let presetValue = "custom"
  
  if (date?.from && date?.to && isSameDay(date.to, today)) {
    if (isSameDay(date.from, subDays(today, 7))) presetValue = "7"
    else if (isSameDay(date.from, subDays(today, 30))) presetValue = "30"
    else if (isSameDay(date.from, subDays(today, 90))) presetValue = "90"
  }

  return (
    <div className={cn("flex items-center gap-2", className)}>
      <Select
        value={presetValue}
        onValueChange={(value) => {
          if (value === "7") onDateChange?.({ from: subDays(today, 7), to: today })
          else if (value === "30") onDateChange?.({ from: subDays(today, 30), to: today })
          else if (value === "90") onDateChange?.({ from: subDays(today, 90), to: today })
        }}
      >
        <SelectTrigger className="w-[160px] h-8">
          <SelectValue placeholder="Pilih Rentang" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="7">7 Hari Terakhir</SelectItem>
          <SelectItem value="30">30 Hari Terakhir</SelectItem>
          <SelectItem value="90">90 Hari Terakhir</SelectItem>
          <SelectItem value="custom">Kustom...</SelectItem>
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            id="date"
            variant={"outline"}
            size="sm"
            className={cn(
              "justify-start text-left font-normal h-8",
              !date && "text-muted-foreground"
            )}
          >
            <CalendarIcon className="mr-2 h-4 w-4" />
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "LLL dd, y", { locale: id })} -{" "}
                  {format(date.to, "LLL dd, y", { locale: id })}
                </>
              ) : (
                format(date.from, "LLL dd, y", { locale: id })
              )
            ) : (
              <span>Pilih tanggal spesifik</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={onDateChange}
            numberOfMonths={2}
            locale={id}
            disabled={(date) => date > new Date()}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
