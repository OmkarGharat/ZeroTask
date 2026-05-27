'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { format, addDays, addWeeks, addMonths, subDays, subWeeks, subMonths } from 'date-fns'
import { ViewMode } from '@/lib/types'

interface DateNavigatorProps {
  selectedDate: Date
  viewMode: ViewMode
  onDateChange: (date: Date) => void
}

export function DateNavigator({ selectedDate, viewMode, onDateChange }: DateNavigatorProps) {
  const navigatePrevious = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(subDays(selectedDate, 1))
        break
      case 'week':
        onDateChange(subWeeks(selectedDate, 1))
        break
      case 'month':
        onDateChange(subMonths(selectedDate, 1))
        break
    }
  }

  const navigateNext = () => {
    switch (viewMode) {
      case 'day':
        onDateChange(addDays(selectedDate, 1))
        break
      case 'week':
        onDateChange(addWeeks(selectedDate, 1))
        break
      case 'month':
        onDateChange(addMonths(selectedDate, 1))
        break
    }
  }

  const goToToday = () => {
    onDateChange(new Date())
  }

  const getDateLabel = () => {
    switch (viewMode) {
      case 'day':
        return format(selectedDate, 'EEEE, MMMM d, yyyy')
      case 'week':
        return `Week of ${format(selectedDate, 'MMMM d, yyyy')}`
      case 'month':
        return format(selectedDate, 'MMMM yyyy')
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button variant="outline" size="icon" onClick={navigatePrevious}>
        <ChevronLeft className="h-4 w-4" />
      </Button>
      <Button variant="outline" onClick={goToToday}>
        Today
      </Button>
      <Button variant="outline" size="icon" onClick={navigateNext}>
        <ChevronRight className="h-4 w-4" />
      </Button>
      <span className="ml-4 text-lg font-semibold text-foreground">
        {getDateLabel()}
      </span>
    </div>
  )
}
