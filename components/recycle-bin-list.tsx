'use client'

import { useState } from 'react'
import {
  useDeletedTasks,
  useDeletedTargets,
  restoreTask,
  restoreTarget,
  permanentDeleteTask,
  permanentDeleteTarget,
} from '@/lib/data'
import { useSWRConfig } from 'swr'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { RotateCcw, Trash2, ShieldAlert, FolderHeart, Calendar, Target as TargetIcon } from 'lucide-react'
import { parseISO, format } from 'date-fns'
import { cn } from '@/lib/utils'

export function RecycleBinList() {
  const { data: deletedTasks = [], isLoading: tasksLoading } = useDeletedTasks()
  const { data: deletedTargets = [], isLoading: targetsLoading } = useDeletedTargets()
  const { mutate } = useSWRConfig()

  const [isProcessing, setIsProcessing] = useState(false)

  const handleRestoreTask = async (id: string, title: string) => {
    setIsProcessing(true)
    try {
      await restoreTask(id)
      mutate('deleted-tasks')
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
      mutate('targets')
      toast.success(`Restored task "${title}"`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to restore task')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePermanentDeleteTask = async (id: string, title: string) => {
    setIsProcessing(true)
    try {
      await permanentDeleteTask(id)
      mutate('deleted-tasks')
      toast.success(`Permanently deleted task "${title}"`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete task permanently')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleRestoreTarget = async (id: string, title: string) => {
    setIsProcessing(true)
    try {
      await restoreTarget(id)
      mutate('deleted-targets')
      mutate('deleted-tasks')
      mutate('targets')
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
      toast.success(`Restored goal "${title}" and its subtasks!`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to restore target')
    } finally {
      setIsProcessing(false)
    }
  }

  const handlePermanentDeleteTarget = async (id: string, title: string) => {
    setIsProcessing(true)
    try {
      await permanentDeleteTarget(id)
      mutate('deleted-targets')
      toast.success(`Permanently deleted goal "${title}" and all its subtasks`)
    } catch (err) {
      console.error(err)
      toast.error('Failed to delete target permanently')
    } finally {
      setIsProcessing(false)
    }
  }

  const handleEmptyBin = async () => {
    if (deletedTasks.length === 0 && deletedTargets.length === 0) return
    if (!confirm('Are you sure you want to permanently empty the Recycle Bin? This action is irreversible!')) return

    setIsProcessing(true)
    try {
      // Delete all targets permanently (handles linked tasks)
      const targetDeletes = deletedTargets.map(t => permanentDeleteTarget(t.id))
      await Promise.all(targetDeletes)

      // Delete remaining tasks permanently
      const taskDeletes = deletedTasks.map(t => permanentDeleteTask(t.id))
      await Promise.all(taskDeletes)

      mutate('deleted-tasks')
      mutate('deleted-targets')
      toast.success('Recycle Bin emptied successfully!')
    } catch (err) {
      console.error(err)
      toast.error('Failed to empty the Recycle Bin')
    } finally {
      setIsProcessing(false)
    }
  }

  const isLoading = tasksLoading || targetsLoading
  const isEmpty = deletedTasks.length === 0 && deletedTargets.length === 0

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4 animate-pulse">
        <div className="h-10 bg-muted/20 w-[180px] rounded" />
        <div className="h-[250px] bg-muted/20 w-full rounded-xl" />
      </div>
    )
  }

  if (isEmpty) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-16 text-center">
          <FolderHeart className="h-14 w-14 text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-foreground">Recycle Bin is empty</h3>
          <p className="text-sm text-muted-foreground max-w-sm mt-1">
            Excellent! There are no soft-deleted tasks or targets. Your workspace is tidy.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Recycle Bin</h2>
          <p className="text-sm text-muted-foreground">
            Restore items you soft-deleted or purge them forever
          </p>
        </div>
        <Button
          variant="destructive"
          size="sm"
          disabled={isProcessing}
          onClick={handleEmptyBin}
          className="gap-2 font-medium"
        >
          <Trash2 className="h-4 w-4" />
          Empty Recycle Bin
        </Button>
      </div>

      {/* Deleted Targets Section */}
      {deletedTargets.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Goals / Targets ({deletedTargets.length})
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {deletedTargets.map((target) => (
              <Card key={target.id} className="border-destructive/10 bg-destructive/5/10">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-destructive/10 text-destructive">
                        <TargetIcon className="h-5 w-5" />
                      </div>
                      <div>
                        <CardTitle className="text-md">{target.title}</CardTitle>
                        <CardDescription className="text-xs mt-0.5">
                          Soft-deleted on: {target.deleted_at ? format(parseISO(target.deleted_at), 'PPP') : 'Unknown'}
                        </CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-col gap-3">
                  <div className="rounded bg-destructive/5 border border-destructive/10 p-2.5 text-xs text-destructive flex gap-2">
                    <ShieldAlert className="h-4 w-4 shrink-0" />
                    <span>Restoring this goal will automatically restore all its subtasks that were deleted with it.</span>
                  </div>
                  <div className="flex gap-2 justify-end mt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handleRestoreTarget(target.id, target.title)}
                      className="gap-1.5 h-8 text-xs"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handlePermanentDeleteTarget(target.id, target.title)}
                      className="gap-1.5 h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Forever
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Deleted Tasks Section */}
      {deletedTasks.length > 0 && (
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
            Individual Tasks ({deletedTasks.length})
          </h3>
          <div className="flex flex-col gap-2">
            {deletedTasks.map((task) => {
              const isTargetDeleted = task.deleted_reason === 'Target deleted'
              return (
                <div
                  key={task.id}
                  className="flex items-center justify-between rounded-lg border bg-card p-3 shadow-xs border-destructive/10"
                >
                  <div className="flex flex-col gap-1 max-w-[70%]">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-medium text-foreground">{task.title}</span>
                      {task.priority && (
                        <Badge
                          variant="outline"
                          className={cn(
                            "text-[10px] px-1.5 py-0 capitalize",
                            task.priority === 'high' && "bg-red-500/10 text-red-600 border-red-200",
                            task.priority === 'medium' && "bg-amber-500/10 text-amber-600 border-amber-200",
                            task.priority === 'low' && "bg-emerald-500/10 text-emerald-600 border-emerald-200"
                          )}
                        >
                          {task.priority}
                        </Badge>
                      )}
                      {isTargetDeleted && (
                        <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                          Target deleted
                        </Badge>
                      )}
                    </div>
                    {task.description && (
                      <p className="text-xs text-muted-foreground truncate">{task.description}</p>
                    )}
                    <div className="flex items-center gap-2 mt-1 text-[10px] text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        Due: {task.due_date}
                      </span>
                      {task.deleted_at && (
                        <span>• Deleted: {format(parseISO(task.deleted_at), 'PPP')}</span>
                      )}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isProcessing || isTargetDeleted}
                      onClick={() => handleRestoreTask(task.id, task.title)}
                      className="gap-1.5 h-8 text-xs"
                      title={isTargetDeleted ? "Restore the parent Goal to restore this task" : "Restore task"}
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      Restore
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      disabled={isProcessing}
                      onClick={() => handlePermanentDeleteTask(task.id, task.title)}
                      className="gap-1.5 h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Delete Forever
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}
