'use client'

import { createClient } from '@/lib/supabase/client'
import { Task, Target } from '@/lib/types'
import useSWR from 'swr'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, parseISO, isWithinInterval } from 'date-fns'

const supabase = createClient()

// Fetch tasks for a date range
export function useTasks(startDate: Date, endDate: Date) {
  const key = `tasks-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
  
  return useSWR(key, async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .gte('due_date', format(startDate, 'yyyy-MM-dd'))
      .lte('due_date', format(endDate, 'yyyy-MM-dd'))
      .order('due_date', { ascending: true })
      .order('priority', { ascending: true })
    
    if (error) throw error
    return data as Task[]
  })
}

// Fetch all tasks
export function useAllTasks() {
  return useSWR('all-tasks', async () => {
    const { data, error } = await supabase
      .from('tasks')
      .select('*')
      .order('due_date', { ascending: true })
    
    if (error) throw error
    return data as Task[]
  })
}

// Fetch targets with their tasks
export function useTargets() {
  return useSWR('targets', async () => {
    const { data: targets, error: targetsError } = await supabase
      .from('targets')
      .select('*')
      .order('created_at', { ascending: false })
    
    if (targetsError) throw targetsError

    const { data: tasks, error: tasksError } = await supabase
      .from('tasks')
      .select('*')
      .not('target_id', 'is', null)
    
    if (tasksError) throw tasksError

    // Map tasks to their targets
    const targetsWithTasks = (targets as Target[]).map(target => ({
      ...target,
      tasks: (tasks as Task[]).filter(task => task.target_id === target.id)
    }))

    return targetsWithTasks
  })
}

// Create a new task
export async function createTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('tasks')
    .insert({ status: 'pending', ...task, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as Task
}

// Update a task
export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

// Delete a task
export async function deleteTask(id: string) {
  const { error } = await supabase
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Create a new target
export async function createTarget(target: Omit<Target, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tasks'>) {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase
    .from('targets')
    .insert({ ...target, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as Target
}

// Update a target
export async function updateTarget(id: string, updates: Partial<Target>) {
  const { data, error } = await supabase
    .from('targets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Target
}

// Delete a target
export async function deleteTarget(id: string) {
  const { error } = await supabase
    .from('targets')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Helper functions for date ranges
export function getDateRange(view: 'day' | 'week' | 'month', selectedDate: Date) {
  switch (view) {
    case 'day':
      return { start: selectedDate, end: selectedDate }
    case 'week':
      return { start: startOfWeek(selectedDate, { weekStartsOn: 1 }), end: endOfWeek(selectedDate, { weekStartsOn: 1 }) }
    case 'month':
      return { start: startOfMonth(selectedDate), end: endOfMonth(selectedDate) }
  }
}

// Get tasks for a specific date
export function getTasksForDate(tasks: Task[], date: Date) {
  return tasks.filter(task => isSameDay(parseISO(task.due_date), date))
}

// Get week days array
export function getWeekDays(date: Date) {
  const start = startOfWeek(date, { weekStartsOn: 1 })
  return Array.from({ length: 7 }, (_, i) => addDays(start, i))
}

// Calculate completion percentage for a target
export function getTargetProgress(target: Target) {
  if (!target.tasks || target.tasks.length === 0) return 0
  const completed = target.tasks.filter(t => t.is_completed).length
  return Math.round((completed / target.tasks.length) * 100)
}
