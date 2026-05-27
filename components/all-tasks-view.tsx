'use client'

import { useState, useMemo } from 'react'
import { Task } from '@/lib/types'
import { TaskItem } from './task-item'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Search, ListTodo, CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react'
import { isPast, isToday } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'

export type FilterType = 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue'

interface AllTasksViewProps {
  tasks: Task[]
  isLoading: boolean
  filter: FilterType
  onFilterChange: (filter: FilterType) => void
}

export function AllTasksView({ tasks, isLoading, filter, onFilterChange }: AllTasksViewProps) {
  const [searchQuery, setSearchQuery] = useState('')

  // Calculate task counts for each filter
  const counts = useMemo(() => {
    const pending = tasks.filter(t => t.status === 'pending').length
    const inProgress = tasks.filter(t => t.status === 'in-progress').length
    const completed = tasks.filter(t => t.status === 'completed').length
    const overdue = tasks.filter(
      t => t.status !== 'completed' && isPast(parseLocalDate(t.due_date)) && !isToday(parseLocalDate(t.due_date))
    ).length

    return {
      all: tasks.length,
      pending,
      inProgress,
      completed,
      overdue,
    }
  }, [tasks])

  // Filter tasks based on selected status and search query
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // 1. Status Filter
      if (filter === 'pending' && task.status !== 'pending') return false
      if (filter === 'in-progress' && task.status !== 'in-progress') return false
      if (filter === 'completed' && task.status !== 'completed') return false
      if (filter === 'overdue') {
        const isTaskOverdue =
          task.status !== 'completed' &&
          isPast(parseLocalDate(task.due_date)) &&
          !isToday(parseLocalDate(task.due_date))
        if (!isTaskOverdue) return false
      }

      // 2. Search query filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        const titleMatch = task.title.toLowerCase().includes(query)
        const descMatch = task.description?.toLowerCase().includes(query) ?? false
        if (!titleMatch && !descMatch) return false
      }

      return true
    })
  }, [tasks, filter, searchQuery])

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="h-16 bg-muted/30 rounded-lg" />
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Search and Filters Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
          />
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap gap-2">
          <Button
            variant={filter === 'all' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('all')}
            className="gap-2"
          >
            <ListTodo className="h-4 w-4" />
            All
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {counts.all}
            </Badge>
          </Button>

          <Button
            variant={filter === 'pending' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('pending')}
            className="gap-2"
          >
            <Clock className="h-4 w-4 text-amber-500" />
            Pending
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {counts.pending}
            </Badge>
          </Button>

          <Button
            variant={filter === 'in-progress' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('in-progress')}
            className="gap-2"
          >
            <Activity className="h-4 w-4 text-sky-500" />
            In Progress
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {counts.inProgress}
            </Badge>
          </Button>

          <Button
            variant={filter === 'completed' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('completed')}
            className="gap-2"
          >
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            Completed
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {counts.completed}
            </Badge>
          </Button>

          <Button
            variant={filter === 'overdue' ? 'default' : 'outline'}
            size="sm"
            onClick={() => onFilterChange('overdue')}
            className="gap-2"
          >
            <AlertTriangle className="h-4 w-4 text-red-500" />
            Overdue
            <Badge variant="secondary" className="ml-1 px-1.5 py-0 text-xs">
              {counts.overdue}
            </Badge>
          </Button>
        </div>
      </div>

      {/* Task List */}
      {filteredTasks.length === 0 ? (
        <Card className="border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-16 text-center">
            <ListTodo className="h-12 w-12 text-muted-foreground/30 mb-4" />
            <h3 className="text-lg font-medium text-foreground">No tasks found</h3>
            <p className="text-sm text-muted-foreground max-w-sm mt-1">
              {searchQuery
                ? `No tasks match search "${searchQuery}". Try refining your query.`
                : `There are no ${filter === 'all' ? '' : filter} tasks currently.`}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="flex flex-col gap-2">
          {filteredTasks.map((task) => (
            <TaskItem key={task.id} task={task} />
          ))}
        </div>
      )}
    </div>
  )
}
