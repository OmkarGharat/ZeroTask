'use client'

import { useState } from 'react'
import { Target } from '@/lib/types'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Target as TargetIcon, Plus } from 'lucide-react'
import { createTarget } from '@/lib/data'
import { useSWRConfig } from 'swr'

export function AddTargetDialog() {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { mutate } = useSWRConfig()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!title) return

    setIsLoading(true)
    try {
      await createTarget({
        title,
        description: description || null,
      })
      
      mutate('targets')
      
      // Reset form
      setTitle('')
      setDescription('')
      setOpen(false)
    } catch (error) {
      console.error('Failed to create target:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <TargetIcon className="h-4 w-4" />
          New Target
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Create New Target</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4 mt-4">
          <div className="grid gap-2">
            <Label htmlFor="target-title">Title</Label>
            <Input
              id="target-title"
              placeholder="e.g., Learn a new programming language"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="target-description">Description (optional)</Label>
            <Textarea
              id="target-description"
              placeholder="Describe your goal..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <Button type="submit" className="mt-2" disabled={isLoading}>
            {isLoading ? 'Creating...' : 'Create Target'}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  )
}
