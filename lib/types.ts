export type Priority = 'high' | 'medium' | 'low'
export type TaskType = 'long-term' | 'short-term'
export type TaskStatus = 'pending' | 'in-progress' | 'completed'

export interface Task {
  id: string
  user_id: string
  title: string
  description: string | null
  due_date: string
  priority: Priority
  task_type: TaskType
  status: TaskStatus
  is_completed: boolean
  target_id: string | null
  position: number | null
  completed_at: string | null
  deleted_at: string | null
  deleted_reason: string | null
  created_at: string
  updated_at: string
}

export interface Target {
  id: string
  user_id: string
  title: string
  description: string | null
  deleted_at: string | null
  created_at: string
  updated_at: string
  tasks?: Task[]
}

export type ViewMode = 'day' | 'week' | 'month' | 'all'
