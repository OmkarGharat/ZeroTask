'use client'

import { useState, useEffect } from 'react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { AlertTriangle, ShieldAlert, HeartCrack, Flame } from 'lucide-react'
import { Task, Target } from '@/lib/types'

interface DeleteConfirmDialogProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  task?: Task
  target?: Target
}

export function DeleteConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  task,
  target,
}: DeleteConfirmDialogProps) {
  const [countdown, setCountdown] = useState(3)
  const [isConfirmEnabled, setIsConfirmEnabled] = useState(false)

  useEffect(() => {
    if (isOpen) {
      setCountdown(3)
      setIsConfirmEnabled(false)
    }
  }, [isOpen])

  useEffect(() => {
    if (!isOpen) return

    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
      return () => clearTimeout(timer)
    } else {
      setIsConfirmEnabled(true)
    }
  }, [countdown, isOpen])

  const getPersuasiveContent = () => {
    if (target) {
      return {
        title: `Destroy Target: "${target.title}"?`,
        icon: <ShieldAlert className="h-10 w-10 text-destructive animate-bounce" />,
        message: "Wait! Deleting this target will also soft-delete ALL of its linked subtasks! You worked hard to plan these milestones. Are you absolutely certain you want to clear this entire goal from your horizon?",
        warning: "This action will sweep the target and its subtasks into the Recycle Bin."
      }
    }

    if (task) {
      const isHigh = task.priority === 'high'
      const isInProgress = task.status === 'in-progress'
      const isLinkedToTarget = !!task.target_id

      if (isHigh) {
        return {
          title: "Hold on! That's a HIGH Priority Task!",
          icon: <Flame className="h-10 w-10 text-red-500 animate-pulse" />,
          message: `"${task.title}" is marked as High Priority. Dropping this task might throw off your entire day's momentum. Are you sure you want to give up on this critical goal?`,
          warning: "High priority tasks are crucial milestones. Think twice!"
        }
      }

      if (isInProgress) {
        return {
          title: "But you already started working on it!",
          icon: <Flame className="h-10 w-10 text-sky-500 animate-pulse" />,
          message: `"${task.title}" is currently In Progress. You've already invested precious time and energy into this. Giving up now means starting over later. Keep pushing!`,
          warning: "Abandoning active progress hurts productivity."
        }
      }

      if (isLinkedToTarget) {
        return {
          title: "This task is part of a bigger Goal!",
          icon: <AlertTriangle className="h-10 w-10 text-amber-500 animate-bounce" />,
          message: `"${task.title}" is linked to a long-term target. Deleting it will lower your overall goal progress rate and delay your achievements. Can you complete it instead?`,
          warning: "Deleting goal subtasks affects target progress percentages."
        }
      }

      return {
        title: "Are you sure you want to delete this task?",
        icon: <HeartCrack className="h-10 w-10 text-muted-foreground" />,
        message: `Every task you complete is a step closer to your best self. Deleting "${task.title}" might seem easy now, but staying disciplined will reward you later!`,
        warning: "This task will be moved to the Recycle Bin."
      }
    }

    return {
      title: "Confirm Deletion",
      icon: <AlertTriangle className="h-10 w-10 text-destructive" />,
      message: "Are you sure you want to delete this item? It will be moved to the Recycle Bin.",
      warning: "You can restore this item from the Recycle Bin later."
    }
  }

  const content = getPersuasiveContent()

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[450px] border-destructive/20 shadow-lg animate-in fade-in zoom-in-95 duration-200">
        <DialogHeader className="flex flex-col items-center text-center gap-3">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-destructive/10">
            {content.icon}
          </div>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground">
            {content.title}
          </DialogTitle>
          <DialogDescription className="text-sm text-muted-foreground leading-relaxed">
            {content.message}
          </DialogDescription>
        </DialogHeader>

        <div className="my-2 rounded-lg bg-muted/50 border p-3 text-center">
          <p className="text-xs font-medium text-destructive flex items-center justify-center gap-1.5">
            <AlertTriangle className="h-3.5 w-3.5" />
            {content.warning}
          </p>
        </div>

        <DialogFooter className="flex flex-col sm:flex-row gap-2 mt-4">
          <Button
            type="button"
            variant="outline"
            className="flex-1 transition-all hover:bg-accent"
            onClick={onClose}
          >
            No, keep it!
          </Button>
          <Button
            type="button"
            variant="destructive"
            className="flex-1 min-w-[140px] font-semibold transition-all relative overflow-hidden"
            onClick={() => {
              if (isConfirmEnabled) {
                onConfirm()
                onClose()
              }
            }}
            disabled={!isConfirmEnabled}
          >
            {isConfirmEnabled ? (
              "Yes, delete it anyway"
            ) : (
              <span className="flex items-center justify-center gap-1.5">
                Reflecting... ({countdown}s)
              </span>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
