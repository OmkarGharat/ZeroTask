'use client'

import { useState } from 'react'
import { Task, Priority, TaskStatus, Target } from '@/lib/types'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Trash2, GripVertical, Target as TargetIcon, AlertCircle, ChevronDown } from 'lucide-react'
import { updateTask, deleteTask } from '@/lib/data'
import { useSWRConfig } from 'swr'
import { cn, parseLocalDate } from '@/lib/utils'
import { EditTaskDialog } from '@/components/edit-task-dialog'
import { DeleteConfirmDialog } from '@/components/delete-confirm-dialog'
import { format, parseISO, differenceInDays } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu'

interface TaskItemProps {
  task: Task
  showDate?: boolean
  targets?: Target[]
  showSelection?: boolean
  isSelected?: boolean
  onSelectChange?: (checked: boolean) => void
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

function isCompletedLate(task: Task): boolean {
  if (!task.is_completed || !task.completed_at || !task.due_date) return false
  const completedDate = parseISO(task.completed_at)
  const dueDate = parseLocalDate(task.due_date)
  // Normalize completed_at to start of day for comparison
  const completedDay = new Date(completedDate.getFullYear(), completedDate.getMonth(), completedDate.getDate())
  return completedDay > dueDate
}

export function TaskItem({
  task,
  showDate,
  targets = [],
  showSelection = false,
  isSelected = false,
  onSelectChange,
}: TaskItemProps) {
  const { mutate } = useSWRConfig()
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const isCompleted = task.status === 'completed'
  const completedLate = isCompletedLate(task)

  const invalidateTasks = () => {
    mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
    mutate('targets')
  }

  const handleToggleComplete = async () => {
    const nextCompleted = !task.is_completed
    try {
      await updateTask(task.id, {
        is_completed: nextCompleted,
        status: nextCompleted ? 'completed' : 'pending',
      })
      invalidateTasks()
    } catch (error) {
      console.error('Failed to update task:', error)
    }
  }

  const handleStatusChange = async (newStatus: TaskStatus) => {
    try {
      await updateTask(task.id, {
        status: newStatus,
        is_completed: newStatus === 'completed',
      })
      invalidateTasks()
    } catch (error) {
      console.error('Failed to change status:', error)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteTask(task.id)
      invalidateTasks()
    } catch (error) {
      console.error('Failed to delete task:', error)
    }
  }

  // Compute days late for the badge tooltip
  const daysLate = completedLate && task.completed_at
    ? differenceInDays(
        new Date(
          new Date(task.completed_at).getFullYear(),
          new Date(task.completed_at).getMonth(),
          new Date(task.completed_at).getDate()
        ),
        parseLocalDate(task.due_date)
      )
    : 0

  return (
    <>
      <div
        className={cn(
          'group flex items-center gap-3 rounded-lg border bg-card p-3',
          'transition-[opacity,background-color,border-color,border-left-width] duration-300 ease-in-out',
          isCompleted
            ? 'bg-muted/40 opacity-60 border-border'
            : task.status === 'in-progress'
            ? 'border-l-4 border-l-sky-500 bg-sky-500/5 border-border hover:shadow-sm'
            : 'border-border hover:shadow-sm'
        )}
      >
        {/* Multi-selection Checkbox */}
        {showSelection && (
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelectChange?.(!!checked)}
            className="h-5 w-5 border-primary/40 data-[state=checked]:bg-primary"
          />
        )}

        <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity duration-200 group-hover:opacity-100" />
        
        {/* Completion Checkbox */}
        <Checkbox
          checked={task.is_completed}
          onCheckedChange={handleToggleComplete}
          className={cn(
            'h-5 w-5 transition-all duration-300',
            isCompleted && 'opacity-60'
          )}
        />
        
        <div className="flex flex-1 flex-col gap-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={cn(
                'font-medium text-card-foreground transition-all duration-300',
                isCompleted && 'line-through text-muted-foreground'
              )}
            >
              {task.title}
            </span>
            {task.target_id && (
              <TargetIcon className="h-3.5 w-3.5 text-muted-foreground flex-shrink-0" />
            )}
            {/* Completed Late Badge */}
            {completedLate && (
              <Badge
                variant="outline"
                className="gap-1 px-1.5 py-0 text-[10px] font-semibold border-amber-400/60 bg-amber-500/10 text-amber-600 dark:text-amber-400 flex-shrink-0"
                title={`Completed ${daysLate} day${daysLate !== 1 ? 's' : ''} late on ${task.completed_at ? format(parseISO(task.completed_at), 'MMM d, yyyy') : ''}`}
              >
                <AlertCircle className="h-2.5 w-2.5" />
                Completed Late
                {daysLate > 0 && <span className="opacity-70">({daysLate}d)</span>}
              </Badge>
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
                    "cursor-pointer transition-colors duration-200 px-1.5 py-0 text-[10px] font-medium rounded border gap-0.5 select-none",
                    statusConfigs[task.status]?.className
                  )}
                  title="Click to change status"
                >
                  {statusConfigs[task.status]?.label}
                  <ChevronDown className="h-2.5 w-2.5 opacity-60 ml-0.5" />
                </Badge>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-44">
                <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold pb-1">
                  Change Status
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => handleStatusChange('pending')}
                  className={cn("gap-2 text-sm", task.status === 'pending' && "bg-muted font-medium")}
                >
                  <span className="h-2 w-2 rounded-full bg-muted-foreground/50 flex-shrink-0" />
                  Pending
                  {task.status === 'pending' && <span className="ml-auto text-xs text-muted-foreground">current</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange('in-progress')}
                  className={cn("gap-2 text-sm", task.status === 'in-progress' && "bg-sky-500/10 font-medium")}
                >
                  <span className="h-2 w-2 rounded-full bg-sky-500 flex-shrink-0" />
                  In Progress
                  {task.status === 'in-progress' && <span className="ml-auto text-xs text-muted-foreground">current</span>}
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleStatusChange('completed')}
                  className={cn("gap-2 text-sm", task.status === 'completed' && "bg-emerald-500/10 font-medium")}
                >
                  <span className="h-2 w-2 rounded-full bg-emerald-500 flex-shrink-0" />
                  Completed
                  {task.status === 'completed' && <span className="ml-auto text-xs text-muted-foreground">current</span>}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <div className="flex items-center gap-1.5">
              <div className={cn('h-2 w-2 rounded-full transition-colors duration-300', priorityDotColors[task.priority])} />
              <span className="text-xs text-muted-foreground capitalize">{task.priority}</span>
            </div>
            <Badge variant="outline" className="text-xs px-1 py-0">
              {task.task_type === 'long-term' ? 'Long-term' : 'Short-term'}
            </Badge>
            {showDate && (
              <span className="text-xs text-muted-foreground">
                Due: {task.due_date}
              </span>
            )}
            {/* Show actual completion date if completed late */}
            {completedLate && task.completed_at && (
              <span className="text-xs text-amber-600 dark:text-amber-400">
                Done: {format(parseISO(task.completed_at), 'MMM d, yyyy')}
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0">
          <EditTaskDialog task={task} targets={targets} />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 opacity-0 transition-opacity duration-200 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
            onClick={(e) => {
              e.stopPropagation()
              setIsDeleteDialogOpen(true)
            }}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        task={task}
      />
    </>
  )
}
