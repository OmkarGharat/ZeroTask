'use client'

import { Task, Target } from '@/lib/types'
import { TaskItem } from './task-item'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { format, startOfWeek, addDays, isSameDay, isToday } from 'date-fns'
import { cn, parseLocalDate } from '@/lib/utils'

interface WeekViewProps {
  tasks: Task[]
  selectedDate: Date
  targets: Target[]
  isLoading: boolean
  onDateSelect: (date: Date) => void
}

export function WeekView({ tasks, selectedDate, targets, isLoading, onDateSelect }: WeekViewProps) {
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 })
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-7 gap-3">
      {weekDays.map((day) => {
        const dayTasks = tasks.filter(task => isSameDay(parseLocalDate(task.due_date), day))
        const pendingCount = dayTasks.filter(t => !t.is_completed).length
        const completedCount = dayTasks.filter(t => t.is_completed).length
        const today = isToday(day)
        const selected = isSameDay(day, selectedDate)

        return (
          <Card
            key={day.toISOString()}
            className={cn(
              'cursor-pointer transition-all hover:border-primary/50',
              today && 'ring-2 ring-primary ring-offset-2',
              selected && 'border-primary'
            )}
            onClick={() => onDateSelect(day)}
          >
            <CardHeader className="p-3 pb-2">
              <div className="flex flex-col items-center">
                <span className="text-xs font-medium text-muted-foreground">
                  {format(day, 'EEE')}
                </span>
                <span
                  className={cn(
                    'flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold',
                    today && 'bg-primary text-primary-foreground',
                    !today && 'text-foreground'
                  )}
                >
                  {format(day, 'd')}
                </span>
              </div>
            </CardHeader>
            <CardContent className="p-3 pt-0">
              {dayTasks.length > 0 ? (
                <div className="flex flex-col gap-1">
                  <div className="flex items-center justify-center gap-2 text-xs">
                    {pendingCount > 0 && (
                      <span className="text-amber-600">{pendingCount} pending</span>
                    )}
                    {completedCount > 0 && (
                      <span className="text-emerald-600">{completedCount} done</span>
                    )}
                  </div>
                  <div className="mt-2 flex flex-col gap-1 max-h-[120px] overflow-y-auto">
                    {dayTasks.slice(0, 3).map((task) => (
                      <div
                        key={task.id}
                        className={cn(
                          'truncate rounded px-2 py-1 text-xs',
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
                    {dayTasks.length > 3 && (
                      <span className="text-center text-xs text-muted-foreground">
                        +{dayTasks.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-center text-xs text-muted-foreground">No tasks</p>
              )}
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
