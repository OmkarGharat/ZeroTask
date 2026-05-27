'use client'

import { Task, Target } from '@/lib/types'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import {
  format,
  startOfMonth,
  endOfMonth,
  startOfWeek,
  endOfWeek,
  addDays,
  isSameDay,
  isSameMonth,
  isToday,
} from 'date-fns'
import { cn, parseLocalDate } from '@/lib/utils'

interface MonthViewProps {
  tasks: Task[]
  selectedDate: Date
  targets: Target[]
  isLoading: boolean
  onDateSelect: (date: Date) => void
}

export function MonthView({ tasks, selectedDate, targets, isLoading, onDateSelect }: MonthViewProps) {
  const monthStart = startOfMonth(selectedDate)
  const monthEnd = endOfMonth(selectedDate)
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 })

  const days: Date[] = []
  let day = calendarStart
  while (day <= calendarEnd) {
    days.push(day)
    day = addDays(day, 1)
  }

  const weeks: Date[][] = []
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7))
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <Card>
      <CardHeader className="p-3 border-b">
        <div className="grid grid-cols-7 gap-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((dayName) => (
            <div
              key={dayName}
              className="text-center text-xs font-medium text-muted-foreground py-2"
            >
              {dayName}
            </div>
          ))}
        </div>
      </CardHeader>
      <CardContent className="p-3">
        <div className="flex flex-col gap-1">
          {weeks.map((week, weekIndex) => (
            <div key={weekIndex} className="grid grid-cols-7 gap-1">
              {week.map((dayDate) => {
                const dayTasks = tasks.filter((task) =>
                  isSameDay(parseLocalDate(task.due_date), dayDate)
                )
                const pendingCount = dayTasks.filter((t) => !t.is_completed).length
                const today = isToday(dayDate)
                const inCurrentMonth = isSameMonth(dayDate, selectedDate)
                const selected = isSameDay(dayDate, selectedDate)

                return (
                  <div
                    key={dayDate.toISOString()}
                    className={cn(
                      'min-h-[80px] cursor-pointer rounded-lg border border-transparent p-2 transition-all hover:bg-muted/50',
                      !inCurrentMonth && 'opacity-40',
                      today && 'bg-primary/5 border-primary',
                      selected && 'ring-2 ring-primary ring-offset-1'
                    )}
                    onClick={() => onDateSelect(dayDate)}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span
                        className={cn(
                          'flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium',
                          today && 'bg-primary text-primary-foreground',
                          !today && inCurrentMonth && 'text-foreground',
                          !inCurrentMonth && 'text-muted-foreground'
                        )}
                      >
                        {format(dayDate, 'd')}
                      </span>
                      {pendingCount > 0 && (
                        <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-primary/10 px-1.5 text-[10px] font-medium text-primary">
                          {pendingCount}
                        </span>
                      )}
                    </div>
                    <div className="flex flex-col gap-0.5">
                      {dayTasks.slice(0, 2).map((task) => (
                        <div
                          key={task.id}
                          className={cn(
                            'truncate rounded px-1.5 py-0.5 text-[10px]',
                            task.is_completed
                              ? 'bg-muted text-muted-foreground line-through'
                              : task.priority === 'high'
                              ? 'bg-red-500/10 text-red-600'
                              : task.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-600'
                              : 'bg-emerald-500/10 text-emerald-600'
                          )}
                        >
                          {task.title}
                        </div>
                      ))}
                      {dayTasks.length > 2 && (
                        <span className="text-[10px] text-muted-foreground pl-1">
                          +{dayTasks.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
