'use client'

import { useState } from 'react'
import { Task, Priority, TaskType, Target } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, Pencil } from 'lucide-react'
import { format, parseISO } from 'date-fns'
import { updateTask } from '@/lib/data'
import { useSWRConfig } from 'swr'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


interface EditTaskDialogProps {
  task: Task
  targets?: Target[]
}

export function EditTaskDialog({ task, targets = [] }: EditTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState(task.title)
  const [description, setDescription] = useState(task.description ?? '')
  const [dueDate, setDueDate] = useState<Date | undefined>(parseISO(task.due_date))
  const [priority, setPriority] = useState<Priority>(task.priority)
  const [taskType, setTaskType] = useState<TaskType>(task.task_type)
  const [targetId, setTargetId] = useState<string>(task.target_id || 'none')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { mutate } = useSWRConfig()

  // Reset form to task's current values whenever dialog opens
  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle(task.title)
      setDescription(task.description ?? '')
      setDueDate(parseISO(task.due_date))
      setPriority(task.priority)
      setTaskType(task.task_type)
      setTargetId(task.target_id || 'none')
      setError(null)
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title.trim() || !dueDate) return

    setIsLoading(true)
    setError(null)

    const updatedFields = {
      title: title.trim(),
      description: description.trim() || null,
      due_date: format(dueDate, 'yyyy-MM-dd'),
      priority,
      task_type: taskType,
      target_id: targetId === 'none' ? null : targetId,
    }

    try {
      // Optimistic update for SWR caches
      const updateTaskList = (oldTasks: Task[] | undefined) => {
        if (!oldTasks) return []
        return oldTasks.map((t) => (t.id === task.id ? { ...t, ...updatedFields } : t))
      }

      mutate('all-tasks', updateTaskList, { revalidate: false })
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'), updateTaskList, { revalidate: false })

      mutate(
        'targets',
        (oldTargets: Target[] | undefined) => {
          if (!oldTargets) return []
          return oldTargets.map((t) => {
            let newTasks = t.tasks || []
            const hadTask = newTasks.some((x) => x.id === task.id)
            const shouldHaveTask = targetId === t.id

            if (hadTask && !shouldHaveTask) {
              newTasks = newTasks.filter((x) => x.id !== task.id)
            } else if (!hadTask && shouldHaveTask) {
              newTasks = [...newTasks, { ...task, ...updatedFields } as Task]
            } else if (hadTask && shouldHaveTask) {
              newTasks = newTasks.map((x) => (x.id === task.id ? ({ ...x, ...updatedFields } as Task) : x))
            }
            return { ...t, tasks: newTasks }
          })
        },
        { revalidate: false }
      )

      await updateTask(task.id, updatedFields)

      // Revalidate to sync with DB
      mutate('all-tasks')
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
      mutate('targets')

      toast.success('Changes saved successfully!')
      setOpen(false)
    } catch (err: unknown) {
      const msg =
        (err as { message?: string })?.message ||
        'Unknown error'
      setError(`Failed to save: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-accent"
          onClick={(e) => e.stopPropagation()}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Task</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          {/* Title */}
          <div className="grid gap-2">
            <Label htmlFor="edit-title">Title</Label>
            <Input
              id="edit-title"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          {/* Description */}
          <div className="grid gap-2">
            <Label htmlFor="edit-description">Description (optional)</Label>
            <Textarea
              id="edit-description"
              placeholder="Task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          {/* Due Date */}
          <div className="grid gap-2">
            <Label>Due Date</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    'justify-start text-left font-normal',
                    !dueDate && 'text-muted-foreground'
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {dueDate ? format(dueDate, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={dueDate}
                  onSelect={setDueDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Priority + Type */}
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as Priority)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="high">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-red-500" />
                      High
                    </div>
                  </SelectItem>
                  <SelectItem value="medium">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-amber-500" />
                      Medium
                    </div>
                  </SelectItem>
                  <SelectItem value="low">
                    <div className="flex items-center gap-2">
                      <div className="h-2 w-2 rounded-full bg-emerald-500" />
                      Low
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Type</Label>
              <Select value={taskType} onValueChange={(v) => setTaskType(v as TaskType)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="short-term">Short-term</SelectItem>
                  <SelectItem value="long-term">Long-term</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Link to Target Selector */}
          {targets.length > 0 && (
            <div className="grid gap-2">
              <Label>Link to Target (optional)</Label>
              <Select value={targetId} onValueChange={(v) => setTargetId(v)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a target..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  {targets.map((target) => (
                    <SelectItem key={target.id} value={target.id}>
                      {target.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Error */}
          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">
              {error}
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-2 mt-2">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => setOpen(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" className="flex-1" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Saving...' : 'Save changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
