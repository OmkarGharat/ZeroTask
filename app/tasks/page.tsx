'use client'

import { useState, useEffect, Suspense } from 'react'
import { ViewMode } from '@/lib/types'
import { useTasks, useTargets, useAllTasks, getDateRange } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard-header'
import { DateNavigator } from '@/components/date-navigator'
import { ViewModeSwitcher } from '@/components/view-mode-switcher'
import { DayView } from '@/components/day-view'
import { WeekView } from '@/components/week-view'
import { MonthView } from '@/components/month-view'
import { AllTasksView, FilterType } from '@/components/all-tasks-view'
import { useSearchParams } from 'next/navigation'
import { cn } from '@/lib/utils'

function TasksWorkspace() {
  const searchParams = useSearchParams()
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [viewMode, setViewMode] = useState<ViewMode>('day')
  const [listFilter, setListFilter] = useState<FilterType>('all')

  // Check for URL search parameters to sync filters from stats overview
  useEffect(() => {
    const urlFilter = searchParams.get('filter') as FilterType | null
    if (urlFilter) {
      setViewMode('all')
      setListFilter(urlFilter)
    }
  }, [searchParams])

  const dateRange = getDateRange(viewMode === 'all' ? 'day' : viewMode, selectedDate)
  const { data: tasks = [], isLoading: tasksLoading } = useTasks(dateRange.start, dateRange.end)
  const { data: allTasks = [], isLoading: allTasksLoading } = useAllTasks()
  const { data: targets = [], isLoading: targetsLoading } = useTargets()

  const handleViewModeChange = (mode: ViewMode) => {
    setViewMode(mode)
  }

  const handleDateChange = (date: Date) => {
    setSelectedDate(date)
  }

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date)
    setViewMode('day')
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Navigation Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {viewMode !== 'all' ? (
          <DateNavigator
            selectedDate={selectedDate}
            viewMode={viewMode}
            onDateChange={handleDateChange}
          />
        ) : (
          <h2 className="text-xl font-bold text-foreground tracking-tight">
            All Tasks
          </h2>
        )}
        <ViewModeSwitcher
          viewMode={viewMode}
          onViewModeChange={handleViewModeChange}
        />
      </div>

      {/* Task Views Wrapper */}
      <div className="relative min-h-[420px]">
        {/* Day View */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            viewMode === 'day'
              ? "opacity-100 translate-y-0 relative visible"
              : "opacity-0 translate-y-2 absolute top-0 left-0 w-full pointer-events-none invisible"
          )}
        >
          <DayView
            tasks={tasks}
            selectedDate={selectedDate}
            targets={targets}
            isLoading={tasksLoading && viewMode === 'day'}
          />
        </div>

        {/* Week View */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            viewMode === 'week'
              ? "opacity-100 translate-y-0 relative visible"
              : "opacity-0 translate-y-2 absolute top-0 left-0 w-full pointer-events-none invisible"
          )}
        >
          <WeekView
            tasks={tasks}
            selectedDate={selectedDate}
            targets={targets}
            isLoading={tasksLoading && viewMode === 'week'}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* Month View */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            viewMode === 'month'
              ? "opacity-100 translate-y-0 relative visible"
              : "opacity-0 translate-y-2 absolute top-0 left-0 w-full pointer-events-none invisible"
          )}
        >
          <MonthView
            tasks={tasks}
            selectedDate={selectedDate}
            targets={targets}
            isLoading={tasksLoading && viewMode === 'month'}
            onDateSelect={handleDateSelect}
          />
        </div>

        {/* All Tasks / List View */}
        <div
          className={cn(
            "transition-all duration-300 ease-in-out",
            viewMode === 'all'
              ? "opacity-100 translate-y-0 relative visible"
              : "opacity-0 translate-y-2 absolute top-0 left-0 w-full pointer-events-none invisible"
          )}
        >
          <AllTasksView
            tasks={allTasks}
            isLoading={allTasksLoading && viewMode === 'all'}
            filter={listFilter}
            onFilterChange={setListFilter}
          />
        </div>
      </div>
    </div>
  )
}

export default function TasksPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-6 animate-page-fade-in">
        <Suspense fallback={
          <div className="flex flex-col gap-4 animate-pulse">
            <div className="h-10 bg-muted/20 w-[300px] rounded" />
            <div className="h-[400px] bg-muted/20 w-full rounded" />
          </div>
        }>
          <TasksWorkspace />
        </Suspense>
      </main>
    </div>
  )
}
