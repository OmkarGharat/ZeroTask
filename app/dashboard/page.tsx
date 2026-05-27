'use client'

import { ViewMode, Task } from '@/lib/types'
import { useTargets, useAllTasks } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard-header'
import { TargetsList } from '@/components/targets-list'
import { StatsCards } from '@/components/stats-cards'
import { DashboardCharts } from '@/components/dashboard-charts'
import { useRouter } from 'next/navigation'
import { cn, parseLocalDate } from '@/lib/utils'
import { isToday, isPast } from 'date-fns'

function DashboardGreeting({ tasks, isLoading }: { tasks: Task[]; isLoading: boolean }) {
  if (isLoading) {
    return (
      <div className="h-28 w-full animate-pulse bg-muted/20 rounded-xl border border-border" />
    )
  }

  // Get current hour for greeting
  const hour = new Date().getHours()
  let greetingWord = 'Hello'
  if (hour < 12) greetingWord = 'Good Morning'
  else if (hour < 17) greetingWord = 'Good Afternoon'
  else greetingWord = 'Good Evening'

  const pending = tasks.filter(t => t.status === 'pending' || t.status === 'in-progress')
  const todayCount = pending.filter(t => isToday(parseLocalDate(t.due_date))).length
  const overdueCount = pending.filter(t => isPast(parseLocalDate(t.due_date)) && !isToday(parseLocalDate(t.due_date))).length

  let message = ''
  if (overdueCount > 0 && todayCount > 0) {
    message = `You have ${todayCount} task${todayCount > 1 ? 's' : ''} due today and ${overdueCount} task${overdueCount > 1 ? 's' : ''} overdue. Let's tackle them first!`
  } else if (overdueCount > 0) {
    message = `You have ${overdueCount} overdue task${overdueCount > 1 ? 's' : ''} that need${overdueCount === 1 ? 's' : ''} attention. Let's catch up today!`
  } else if (todayCount > 0) {
    message = `You have ${todayCount} task${todayCount > 1 ? 's' : ''} due today. Have a productive day!`
  } else {
    message = "Your schedule is clear for today! Enjoy your day or add some new goals."
  }

  return (
    <div className="rounded-xl border border-primary/10 bg-gradient-to-r from-primary/5 via-primary/0 to-transparent p-6 shadow-sm">
      <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
        {greetingWord}!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground max-w-2xl leading-relaxed">
        {message}
      </p>
    </div>
  )
}

export default function DashboardPage() {
  const router = useRouter()
  const { data: allTasks = [], isLoading: allTasksLoading } = useAllTasks()
  const { data: targets = [], isLoading: targetsLoading } = useTargets()

  const handleStatsCardClick = (filter: string) => {
    router.push(`/tasks?filter=${filter}`)
  }

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      
      <main className="container py-6 animate-page-fade-in">
        <div className="flex flex-col gap-6">
          {/* Productivity Greeting */}
          <DashboardGreeting tasks={allTasks} isLoading={allTasksLoading} />

          {/* Stats Overview */}
          <StatsCards tasks={allTasks} isLoading={allTasksLoading} onCardClick={handleStatsCardClick} />

          {/* Visual Progress Analytics */}
          <DashboardCharts tasks={allTasks} isLoading={allTasksLoading} />

          {/* Targets Section */}
          <div className="mt-4 flex flex-col gap-4">
            <h2 className="text-xl font-bold text-foreground tracking-tight">
              Long-term Targets
            </h2>
            <TargetsList targets={targets} isLoading={targetsLoading} />
          </div>
        </div>
      </main>
    </div>
  )
}

