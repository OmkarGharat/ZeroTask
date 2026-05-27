'use client'

import { Task, Priority, TaskStatus } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, GripVertical, Target } from 'lucide-react'
import { updateTask, deleteTask } from '@/lib/data'
import { useSWRConfig } from 'swr'
import { cn } from '@/lib/utils'
import { EditTaskDialog } from '@/components/edit-task-dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface TaskItemProps {
  task: Task
  showDate?: boolean
}

const priorityColors: Record<Priority, string> = {
  high: 'bg-red-500/10 text-red-600 border-red-200',
  medium: 'bg-amber-500/10 text-amber-600 border-amber-200',
  low: 'bg-emerald-500/10 text-emerald-600 border-emerald-200',
}

const priorityDotColors: Record<Priority, string> = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
}

const statusConfigs = {
  pending: {
    label: 'Pending',
    className: 'bg-muted text-muted-foreground border-muted-foreground/20 hover:bg-muted/80',
  },
  'in-progress': {
    label: 'In Progress',
    className: 'bg-sky-500/10 text-sky-600 border-sky-200 dark:border-sky-800/30 hover:bg-sky-500/20',
  },
  completed: {
    label: 'Completed',
    className: 'bg-emerald-500/10 text-emerald-600 border-emerald-200 dark:border-emerald-800/30 hover:bg-emerald-500/20',
  },
}

export function TaskItem({ task, showDate }: TaskItemProps) {
  const { mutate } = useSWRConfig()

  const handleToggleComplete = async () => {
    const nextCompleted = !task.is_completed
    try {
      await updateTask(task.id, {
        is_completed: nextCompleted,
        status: nextCompleted ? 'completed' : 'pending'
      })
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask(task.id, {
        status: newStatus,
        is_completed: newStatus === 'completed'
      })
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
    } catch (error) {
      console.error('Failed to change status:', error)
    }
  }

  const handleDelete = async () => {
    try {
      await deleteTask(task.id)
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  return (
    <div
      className={cn(
        'group flex items-center gap-3 rounded-lg border border-border bg-card p-3 transition-all hover:shadow-sm',
        task.status === 'completed' && 'bg-muted/50 opacity-60',
        task.status === 'in-progress' && 'border-l-4 border-l-sky-500 bg-sky-500/5'
      )}
    >
      <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      
      <Checkbox
        checked={task.status === 'completed'}
        onCheckedChange={handleToggleComplete}
        className="h-5 w-5"
      />
      
      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'font-medium text-card-foreground',
              task.status === 'completed' && 'line-through text-muted-foreground'
            )}
          >
            {task.title}
          </span>
          {task.target_id && (
            <Target className="h-3.5 w-3.5 text-muted-foreground" />
          )}
        </div>
        {task.description && (
          <p className="text-sm text-muted-foreground line-clamp-1">
            {task.description}
          </p>
        )}
        <div className="flex flex-wrap items-center gap-2 mt-1">
          {/* Status Dropdown Badge */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Badge
                variant="outline"
                className={cn(
                  "cursor-pointer transition-colors px-1.5 py-0 text-[10px] font-medium rounded border",
                  statusConfigs[task.status]?.className
                )}
              >
                {statusConfigs[task.status]?.label}
              </Badge>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              <DropdownMenuItem onClick={() => handleStatusChange('pending')}>
                Mark Pending
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('in-progress')}>
                Mark In Progress
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleStatusChange('completed')}>
                Mark Completed
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1.5">
            <div className={cn('h-2 w-2 rounded-full', priorityDotColors[task.priority])} />
            <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
          </div>
          <Badge variant="outline" className="text-xs px-1 py-0">
            {task.task_type === 'long-term' ? 'Long-term' : 'Short-term'}
          </Badge>
          {showDate && (
            <span className="text-xs text-muted-foreground">
              {task.due_date}
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1">
        <EditTaskDialog task={task} />
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
          onClick={handleDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
