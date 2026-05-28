'use client'

import { Target } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Trash2, ChevronDown, Target as TargetIcon, Plus } from 'lucide-react'
import { deleteTarget, getTargetProgress, updateTask } from '@/lib/data'
import { TaskItem } from './task-item'
import { AddTaskDialog } from './add-task-dialog'
import { AddTargetDialog } from './add-target-dialog'
import { useSWRConfig } from 'swr'
import { useState } from 'react'
import { cn } from '@/lib/utils'
import { DeleteConfirmDialog } from './delete-confirm-dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface TargetCardProps {
  target: Target
  allTargets: Target[]
}

function TargetCard({ target, allTargets }: TargetCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const [isSelectMode, setIsSelectMode] = useState(false)
  const [selectedTaskIds, setSelectedTaskIds] = useState<string[]>([])
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [isMoving, setIsMoving] = useState(false)
  
  const { mutate } = useSWRConfig()
  const progress = getTargetProgress(target)
  const totalTasks = target.tasks?.length || 0
  const completedTasks = target.tasks?.filter(t => t.is_completed).length || 0

  const handleDeleteConfirm = async () => {
    try {
      await deleteTarget(target.id)
      mutate('targets')
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
    } catch (error) {
      console.error('Failed to delete target:', error)
    }
  }

  const handleSelectTask = (taskId: string, checked: boolean) => {
    if (checked) {
      setSelectedTaskIds([...selectedTaskIds, taskId])
    } else {
      setSelectedTaskIds(selectedTaskIds.filter(id => id !== taskId))
    }
  }

  const handleMoveTasks = async (destinationTargetId: string) => {
    if (selectedTaskIds.length === 0) return
    setIsMoving(true)
    try {
      const updates = selectedTaskIds.map(taskId => 
        updateTask(taskId, { target_id: destinationTargetId === 'none' ? null : destinationTargetId })
      )
      await Promise.all(updates)
      
      mutate('targets')
      mutate((key: string) => typeof key === 'string' && key.includes('tasks'))
      
      setSelectedTaskIds([])
      setIsSelectMode(false)
    } catch (error) {
      console.error('Failed to move tasks:', error)
    } finally {
      setIsMoving(false)
    }
  }

  return (
    <>
      <Card className="overflow-hidden">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
                <TargetIcon className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="text-lg">{target.title}</CardTitle>
                {target.description && (
                  <p className="text-sm text-muted-foreground mt-1">{target.description}</p>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2">
              {/* Select Mode button */}
              {totalTasks > 0 && (
                <Button
                  variant={isSelectMode ? "secondary" : "outline"}
                  size="sm"
                  className="h-8 text-xs px-2.5"
                  onClick={() => {
                    setIsSelectMode(!isSelectMode)
                    setSelectedTaskIds([])
                  }}
                >
                  {isSelectMode ? "Cancel Select" : "Select Tasks"}
                </Button>
              )}

              {/* Add Subtask button */}
              <AddTaskDialog
                targets={allTargets}
                defaultTargetId={target.id}
                triggerButton={
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 gap-1.5 text-xs px-2.5"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    Add Subtask
                  </Button>
                }
              />

              {/* Expand/Collapse chevron */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={() => setIsExpanded(!isExpanded)}
              >
                <ChevronDown
                  className={cn(
                    'h-4 w-4 transition-transform duration-300 ease-in-out',
                    isExpanded ? 'rotate-0' : '-rotate-90'
                  )}
                />
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
                onClick={() => setIsDeleteDialogOpen(true)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">
                {completedTasks} of {totalTasks} subtasks completed
              </span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>

        {/* Animated expand/collapse using CSS grid trick */}
        <div
          className={cn(
            'grid transition-[grid-template-rows] duration-300 ease-in-out',
            isExpanded ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <CardContent className="border-t pt-4">
              {/* Floating selection action bar */}
              {isSelectMode && selectedTaskIds.length > 0 && (
                <div className="flex flex-wrap items-center justify-between gap-2 rounded-lg bg-primary/5 border border-primary/20 p-2.5 mb-3 text-sm animate-in slide-in-from-top duration-200">
                  <span className="font-medium text-primary">
                    {selectedTaskIds.length} task{selectedTaskIds.length > 1 ? 's' : ''} selected
                  </span>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">Move to:</span>
                    <Select 
                      disabled={isMoving}
                      onValueChange={(val) => handleMoveTasks(val)}
                    >
                      <SelectTrigger className="h-8 w-[160px] bg-background">
                        <SelectValue placeholder="Select target..." />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">None (Daily task)</SelectItem>
                        {allTargets
                          .filter(t => t.id !== target.id)
                          .map(t => (
                            <SelectItem key={t.id} value={t.id}>
                              {t.title}
                            </SelectItem>
                          ))
                        }
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              )}

              {target.tasks && target.tasks.length > 0 ? (
                <div className="flex flex-col gap-2">
                  {target.tasks.map(task => (
                    <TaskItem
                      key={task.id}
                      task={task}
                      showDate
                      targets={allTargets}
                      showSelection={isSelectMode}
                      isSelected={selectedTaskIds.includes(task.id)}
                      onSelectChange={(checked) => handleSelectTask(task.id, checked)}
                    />
                  ))}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No subtasks yet. Click &ldquo;Add Subtask&rdquo; to link tasks to this target.
                </p>
              )}
            </CardContent>
          </div>
        </div>
      </Card>

      <DeleteConfirmDialog
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={handleDeleteConfirm}
        target={target}
      />
    </>
  )
}

interface TargetsListProps {
  targets: Target[]
  isLoading: boolean
}

export function TargetsList({ targets, isLoading }: TargetsListProps) {
  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[1, 2].map((i) => (
          <div key={i} className="h-36 animate-pulse rounded-xl bg-muted/20 border border-border" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Targets &amp; Goals</h2>
          <p className="text-sm text-muted-foreground">
            Track your long-term goals with subtasks
          </p>
        </div>
        <AddTargetDialog />
      </div>

      {targets.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <TargetIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No targets yet</p>
            <p className="text-sm text-muted-foreground">
              Create a target to track your goals
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-4">
          {targets.map(target => (
            <TargetCard key={target.id} target={target} allTargets={targets} />
          ))}
        </div>
      )}
    </div>
  )
}
