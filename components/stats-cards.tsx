'use client'

import { Task } from '@/lib/types'
import { Card, CardContent } from '@/components/ui/card'
import { CheckCircle2, Clock, AlertTriangle, Activity } from 'lucide-react'
import { isToday, isPast } from 'date-fns'
import { parseLocalDate, cn } from '@/lib/utils'

interface StatsCardsProps {
  tasks: Task[]
  isLoading: boolean
  onCardClick?: (filter: 'all' | 'pending' | 'in-progress' | 'completed' | 'overdue') => void
}

export function StatsCards({ tasks, isLoading, onCardClick }: StatsCardsProps) {
  const totalTasks = tasks.length
  const completedTasks = tasks.filter(t => t.status === 'completed').length
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length
  const pendingTasks = tasks.filter(t => t.status === 'pending').length
  const overdueTasks = tasks.filter(t => t.status !== 'completed' && isPast(parseLocalDate(t.due_date)) && !isToday(parseLocalDate(t.due_date))).length
  const todayTasks = tasks.filter(t => t.status !== 'completed' && isToday(parseLocalDate(t.due_date))).length
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  const stats = [
    {
      title: 'Completed',
      value: completedTasks,
      subtitle: `${completionRate}% completion rate`,
      icon: CheckCircle2,
      iconColor: 'text-emerald-500',
      bgColor: 'bg-emerald-500/10',
      filter: 'completed' as const,
    },
    {
      title: 'In Progress',
      value: inProgressTasks,
      subtitle: 'Currently active',
      icon: Activity,
      iconColor: 'text-sky-500',
      bgColor: 'bg-sky-500/10',
      filter: 'in-progress' as const,
    },
    {
      title: 'Pending',
      value: pendingTasks,
      subtitle: `${todayTasks} due today`,
      icon: Clock,
      iconColor: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
      filter: 'pending' as const,
    },
    {
      title: 'Overdue',
      value: overdueTasks,
      subtitle: overdueTasks > 0 ? 'Needs attention' : 'All caught up!',
      icon: AlertTriangle,
      iconColor: overdueTasks > 0 ? 'text-red-500' : 'text-muted-foreground',
      bgColor: overdueTasks > 0 ? 'bg-red-500/10' : 'bg-muted',
      filter: 'overdue' as const,
    },
  ]

  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="h-20 bg-muted rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => (
        <Card
          key={stat.title}
          className={cn(
            "transition-all duration-200",
            onCardClick && "cursor-pointer hover:border-primary/50 hover:shadow-md active:scale-[0.98]"
          )}
          onClick={() => onCardClick?.(stat.filter)}
        >
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <p className="text-3xl font-bold text-foreground">{stat.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{stat.subtitle}</p>
              </div>
              <div className={`flex h-12 w-12 items-center justify-center rounded-lg ${stat.bgColor}`}>
                <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
