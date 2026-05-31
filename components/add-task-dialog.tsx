'use client'

import { useState, useEffect, useRef } from 'react'
import { Task, Priority, TaskType, Target } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { CalendarIcon, Plus } from 'lucide-react'
import { format } from 'date-fns'
import { createTask } from '@/lib/data'
import { useSWRConfig } from 'swr'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'


interface AddTaskDialogProps {
  targets?: Target[]
  defaultDate?: Date
  defaultTargetId?: string
  triggerButton?: React.ReactNode
}

export function AddTaskDialog({ targets = [], defaultDate, defaultTargetId, triggerButton }: AddTaskDialogProps) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [dueDate, setDueDate] = useState<Date | undefined>(defaultDate || new Date())
  const [priority, setPriority] = useState<Priority>('medium')
  const [taskType, setTaskType] = useState<TaskType>('short-term')
  const [targetId, setTargetId] = useState<string>(defaultTargetId || 'none')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { mutate } = useSWRConfig()
  const formRef = useRef<HTMLFormElement>(null)

  const handleOpenChange = (nextOpen: boolean) => {
    if (nextOpen) {
      setTitle('')
      setDescription('')
      setDueDate(defaultDate || new Date())
      setPriority('medium')
      setTaskType('short-term')
      setTargetId(defaultTargetId || 'none')
      setError(null)
    }
    setOpen(nextOpen)
  }

  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault()
    if (!title || !dueDate) return

    setIsLoading(true)
    setError(null)
    try {
      await createTask({
        title,
        description: description || null,
        due_date: format(dueDate, 'yyyy-MM-dd'),
        priority,
        task_type: taskType,
        target_id: targetId === 'none' ? null : targetId,
      })

      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
      mutate('targets')

      toast.success('Task created!')

      // Reset form
      setTitle('')
      setDescription('')
      setDueDate(defaultDate || new Date())
      setPriority('medium')
      setTaskType('short-term')
      setTargetId(defaultTargetId || 'none')
      setOpen(false)
    } catch (error: unknown) {
      const msg =
        (error as { message?: string })?.message ||
        (error as { error_description?: string })?.error_description ||
        'Unknown error'
      const code = (error as { code?: string })?.code || ''
      console.error('Failed to create task — message:', msg, '| code:', code, '| raw:', error)
      setError(`Failed to create task: ${msg}`)
    } finally {
      setIsLoading(false)
    }
  }

  // Ctrl+Enter / Cmd+Enter to submit
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!open) return
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault()
        handleSubmit()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, title, dueDate, priority, taskType, targetId, description])

  const showTargetSelector = targets.length > 0

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {triggerButton ?? (
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Add Task
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Task</DialogTitle>
        </DialogHeader>
        <form ref={formRef} onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="title">Title</Label>
            <Input
              id="title"
              placeholder="Task title..."
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              autoFocus
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Task description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

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

          {showTargetSelector && (
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

          {error && (
            <p className="text-sm text-destructive rounded-md bg-destructive/10 px-3 py-2">{error}</p>
          )}
          <div className="flex items-center justify-between mt-2">
            <span className="text-xs text-muted-foreground select-none">
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
              {' + '}
              <kbd className="rounded border border-border bg-muted px-1.5 py-0.5 font-mono text-[10px]">↵</kbd>
              {' to submit'}
            </span>
            <Button type="submit" disabled={isLoading || !title.trim()}>
              {isLoading ? 'Adding...' : 'Add Task'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
