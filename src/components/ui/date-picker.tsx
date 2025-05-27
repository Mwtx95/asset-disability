import * as React from "react"
import { format } from "date-fns"
import { Calendar as CalendarIcon, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

interface DatePickerProps {
  date?: Date
  onDateChange?: (date: Date | undefined) => void
  placeholder?: string
  disabled?: boolean
}

export function DatePicker({
  date,
  onDateChange,
  placeholder = "Pick a date",
  disabled = false,
}: DatePickerProps) {
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    if (value) {
      onDateChange?.(new Date(value))
    } else {
      onDateChange?.(undefined)
    }
  }

  const clearDate = () => {
    onDateChange?.(undefined)
  }

  return (
    <div className="relative">
      <Input
        type="date"
        value={date ? format(date, "yyyy-MM-dd") : ""}
        onChange={handleDateChange}
        disabled={disabled}
        className="w-full pr-8"
        placeholder={placeholder}
      />
      {date && (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1/2 h-6 w-6 -translate-y-1/2 p-0 hover:bg-muted"
          onClick={clearDate}
        >
          <X className="h-3 w-3" />
        </Button>
      )}
    </div>
  )
}

interface DateRangePickerProps {
  from?: Date
  to?: Date
  onRangeChange?: (range: { from?: Date; to?: Date }) => void
  placeholder?: string
  disabled?: boolean
}

export function DateRangePicker({
  from,
  to,
  onRangeChange,
  placeholder = "Select date range",
  disabled = false,
}: DateRangePickerProps) {
  const handleFromChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const newFrom = value ? new Date(value) : undefined
    onRangeChange?.({ from: newFrom, to })
  }

  const handleToChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    const newTo = value ? new Date(value) : undefined
    onRangeChange?.({ from, to: newTo })
  }

  const clearRange = () => {
    onRangeChange?.({ from: undefined, to: undefined })
  }

  const hasRange = from || to

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-xs text-muted-foreground">Date Range</Label>
        {hasRange && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-auto p-1 text-xs text-muted-foreground hover:text-foreground"
            onClick={clearRange}
          >
            Clear
          </Button>
        )}
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="space-y-1">
          <Label htmlFor="from-date" className="text-xs text-muted-foreground">
            From
          </Label>
          <Input
            id="from-date"
            type="date"
            value={from ? format(from, "yyyy-MM-dd") : ""}
            onChange={handleFromChange}
            disabled={disabled}
            className="w-full text-sm"
            max={to ? format(to, "yyyy-MM-dd") : undefined}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="to-date" className="text-xs text-muted-foreground">
            To
          </Label>
          <Input
            id="to-date"
            type="date"
            value={to ? format(to, "yyyy-MM-dd") : ""}
            onChange={handleToChange}
            disabled={disabled}
            className="w-full text-sm"
            min={from ? format(from, "yyyy-MM-dd") : undefined}
          />
        </div>
      </div>
      {hasRange && (
        <div className="text-xs text-muted-foreground">
          {from && to ? (
            <>
              {format(from, "MMM dd, yyyy")} - {format(to, "MMM dd, yyyy")}
            </>
          ) : from ? (
            <>From {format(from, "MMM dd, yyyy")}</>
          ) : to ? (
            <>Until {format(to, "MMM dd, yyyy")}</>
          ) : null}
        </div>
      )}
    </div>
  )
}
