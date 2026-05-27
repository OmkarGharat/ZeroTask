'use client'

import { Target } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Trash2, ChevronDown, ChevronUp, Target as TargetIcon, Plus } from 'lucide-react'
import { deleteTarget, getTargetProgress } from '@/lib/data'
import { TaskItem } from './task-item'
import { AddTaskDialog } from './add-task-dialog'
import { AddTargetDialog } from './add-target-dialog'
import { useSWRConfig } from 'swr'
import { useState } from 'react'
import { cn } from '@/lib/utils'

interface TargetCardProps {
  target: Target
  allTargets: Target[]
}

function TargetCard({ target, allTargets }: TargetCardProps) {
  const [isExpanded, setIsExpanded] = useState(true)
  const { mutate } = useSWRConfig()
  const progress = getTargetProgress(target)
  const totalTasks = target.tasks?.length || 0
  const completedTasks = target.tasks?.filter(t => t.is_completed).length || 0

  const handleDelete = async () => {
    try {
      await deleteTarget(target.id)
      mutate('targets')
    } catch (error) {
      console.error('Failed to delete target:', error)
    }
  }

  return (
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
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 hover:bg-destructive/10 hover:text-destructive"
              onClick={handleDelete}
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

      {isExpanded && (
        <CardContent className="border-t pt-4">
          {target.tasks && target.tasks.length > 0 ? (
            <div className="flex flex-col gap-2">
              {target.tasks.map(task => (
                <TaskItem key={task.id} task={task} showDate />
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4">
              No subtasks yet. Add tasks and link them to this target.
            </p>
          )}
        </CardContent>
      )}
    </Card>
  )
}

interface TargetsListProps {
  targets: Target[]
  isLoading: boolean
}

export function TargetsList({ targets, isLoading }: TargetsListProps) {
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-pulse text-muted-foreground">Loading targets...</div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-foreground">Targets & Goals</h2>
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
