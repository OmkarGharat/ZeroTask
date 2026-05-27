'use client'

import { Button } from '@/components/ui/button'
import { ViewMode } from '@/lib/types'
import { CalendarDays, Calendar, CalendarRange, ListTodo } from 'lucide-react'

interface ViewModeSwitcherProps {
  viewMode: ViewMode
  onViewModeChange: (mode: ViewMode) => void
}

export function ViewModeSwitcher({ viewMode, onViewModeChange }: ViewModeSwitcherProps) {
  return (
    <div className="flex items-center gap-1 rounded-lg border border-border bg-muted p-1">
      <Button
        variant={viewMode === 'day' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('day')}
        className="gap-2"
      >
        <Calendar className="h-4 w-4" />
        Day
      </Button>
      <Button
        variant={viewMode === 'week' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('week')}
        className="gap-2"
      >
        <CalendarRange className="h-4 w-4" />
        Week
      </Button>
      <Button
        variant={viewMode === 'month' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('month')}
        className="gap-2"
      >
        <CalendarDays className="h-4 w-4" />
        Month
      </Button>
      <Button
        variant={viewMode === 'all' ? 'default' : 'ghost'}
        size="sm"
        onClick={() => onViewModeChange('all')}
        className="gap-2"
      >
        <ListTodo className="h-4 w-4" />
        List
      </Button>
    </div>
  )
}
