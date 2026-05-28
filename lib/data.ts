'use client'

import { createClient } from '@/lib/supabase/client'
import { Task, Target } from '@/lib/types'
import useSWR from 'swr'
import { format, startOfWeek, endOfWeek, startOfMonth, endOfMonth, addDays, isSameDay, parseISO, isWithinInterval } from 'date-fns'

const supabase = () => createClient()

// Fetch tasks for a date range
export function useTasks(startDate: Date, endDate: Date) {
  const key = `tasks-${format(startDate, 'yyyy-MM-dd')}-${format(endDate, 'yyyy-MM-dd')}`
  
  return useSWR(key, async () => {
    const { data, error } = await supabase()
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .gte('due_date', format(startDate, 'yyyy-MM-dd'))
      .lte('due_date', format(endDate, 'yyyy-MM-dd'))
      .order('due_date', { ascending: true })
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data as Task[]
  })
}

// Fetch all tasks
export function useAllTasks() {
  return useSWR('all-tasks', async () => {
    const { data, error } = await supabase()
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .order('due_date', { ascending: true })
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (error) throw error
    return data as Task[]
  })
}

// Fetch targets with their tasks
export function useTargets() {
  return useSWR('targets', async () => {
    const { data: targets, error: targetsError } = await supabase()
      .from('targets')
      .select('*')
      .is('deleted_at', null)
      .order('created_at', { ascending: false })
    
    if (targetsError) throw targetsError

    const { data: tasks, error: tasksError } = await supabase()
      .from('tasks')
      .select('*')
      .is('deleted_at', null)
      .not('target_id', 'is', null)
      .order('position', { ascending: true })
      .order('created_at', { ascending: true })
    
    if (tasksError) throw tasksError

    // Map tasks to their targets
    const targetsWithTasks = (targets as Target[]).map(target => ({
      ...target,
      tasks: (tasks as Task[]).filter(task => task.target_id === target.id)
    }))

    return targetsWithTasks
  })
}

// Fetch deleted tasks for Recycle Bin
export function useDeletedTasks() {
  return useSWR('deleted-tasks', async () => {
    const { data, error } = await supabase()
      .from('tasks')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    
    if (error) throw error
    return data as Task[]
  })
}

// Fetch deleted targets for Recycle Bin
export function useDeletedTargets() {
  return useSWR('deleted-targets', async () => {
    const { data, error } = await supabase()
      .from('targets')
      .select('*')
      .not('deleted_at', 'is', null)
      .order('deleted_at', { ascending: false })
    
    if (error) throw error
    return data as Target[]
  })
}

// Create a new task
export async function createTask(task: Omit<Task, 'id' | 'user_id' | 'created_at' | 'updated_at'>) {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) throw new Error('Not authenticated')

  // Default position is the current epoch to place it at the bottom
  const defaultPosition = Date.now()

  const { data, error } = await supabase()
    .from('tasks')
    .insert({ 
      status: 'pending', 
      position: defaultPosition, 
      ...task, 
      user_id: user.id 
    })
    .select()
    .single()

  if (error) throw error
  return data as Task
}

// Update a task
export async function updateTask(id: string, updates: Partial<Task>) {
  const { data, error } = await supabase()
    .from('tasks')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Task
}

// Soft delete a task
export async function deleteTask(id: string, reason: string | null = null) {
  const { error } = await supabase()
    .from('tasks')
    .update({ 
      deleted_at: new Date().toISOString(),
      deleted_reason: reason
    })
    .eq('id', id)

  if (error) throw error
}

// Restore a soft-deleted task
export async function restoreTask(id: string) {
  const { error } = await supabase()
    .from('tasks')
    .update({ 
      deleted_at: null,
      deleted_reason: null
    })
    .eq('id', id)

  if (error) throw error
}

// Permanently delete a task
export async function permanentDeleteTask(id: string) {
  const { error } = await supabase()
    .from('tasks')
    .delete()
    .eq('id', id)

  if (error) throw error
}

// Create a new target
export async function createTarget(target: Omit<Target, 'id' | 'user_id' | 'created_at' | 'updated_at' | 'tasks'>) {
  const { data: { user } } = await supabase().auth.getUser()
  if (!user) throw new Error('Not authenticated')

  const { data, error } = await supabase()
    .from('targets')
    .insert({ ...target, user_id: user.id })
    .select()
    .single()

  if (error) throw error
  return data as Target
}

// Update a target
export async function updateTarget(id: string, updates: Partial<Target>) {
  const { data, error } = await supabase()
    .from('targets')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .select()
    .single()

  if (error) throw error
  return data as Target
}

// Soft delete a target and its tasks
export async function deleteTarget(id: string) {
  const now = new Date().toISOString()

  // First soft-delete all tasks inside the target
  const { error: tasksError } = await supabase()
    .from('tasks')
    .update({ 
      deleted_at: now,
      deleted_reason: 'Target deleted'
    })
    .eq('target_id', id)

  if (tasksError) throw tasksError

  // Soft-delete the target itself
  const { error: targetError } = await supabase()
    .from('targets')
    .update({ deleted_at: now })
    .eq('id', id)

  if (targetError) throw targetError
}

// Restore a soft-deleted target
export async function restoreTarget(id: string) {
  // Restore the target itself
  const { error: targetError } = await supabase()
    .from('targets')
    .update({ deleted_at: null })
    .eq('id', id)

  if (targetError) throw targetError

  // Restore tasks that were soft-deleted because the target was deleted
  const { error: tasksError } = await supabase()
    .from('tasks')
    .update({ 
      deleted_at: null,
      deleted_reason: null
    })
    .eq('target_id', id)
    .eq('deleted_reason', 'Target deleted')

  if (tasksError) throw tasksError
}

// Permanently delete a target
export async function permanentDeleteTarget(id: string) {
  // First permanently delete or unlink all tasks under this target (unlinking is safer, or delete if soft-deleted)
  const { error: tasksError } = await supabase()
    .from('tasks')
    .delete()
    .eq('target_id', id)

  if (tasksError) throw tasksError

  // Permanently delete the target itself
  const { error: targetError } = await supabase()
    .from('targets')
    .delete()
    .eq('id', id)

  if (targetError) throw targetError
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
