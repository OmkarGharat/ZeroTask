'use client'

import { Task, Target } from '@/lib/types'
import { TaskItem } from './task-item'
import { AddTaskDialog } from './add-task-dialog'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { format, isSameDay } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'
import { ListTodo, CheckCircle2 } from 'lucide-react'

interface DayViewProps {
  tasks: Task[]
  selectedDate: Date
  targets: Target[]
  isLoading: boolean
}

export function DayView({ tasks, selectedDate, targets, isLoading }: DayViewProps) {
  const dayTasks = tasks.filter(task => isSameDay(parseLocalDate(task.due_date), selectedDate))
  const pendingTasks = dayTasks.filter(t => !t.is_completed)
  const completedTasks = dayTasks.filter(t => t.is_completed)

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading tasks...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary text-primary-foreground">
            <span className="text-xl font-bold">{format(selectedDate, 'd')}</span>
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">{format(selectedDate, 'EEEE')}</h2>
            <p className="text-sm text-muted-foreground">{format(selectedDate, 'MMMM yyyy')}</p>
          </div>
        </div>
        <AddTaskDialog targets={targets} defaultDate={selectedDate} />
      </div>

      {dayTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <ListTodo className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No tasks for this day</p>
            <p className="text-sm text-muted-foreground">Add a task to get started</p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-6">
          {pendingTasks.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="text-sm font-medium text-muted-foreground">
                Pending ({pendingTasks.length})
              </h3>
              <div className="flex flex-col gap-2">
                {pendingTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="flex flex-col gap-3">
              <h3 className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                Completed ({completedTasks.length})
              </h3>
              <div className="flex flex-col gap-2">
                {completedTasks.map(task => (
                  <TaskItem key={task.id} task={task} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
