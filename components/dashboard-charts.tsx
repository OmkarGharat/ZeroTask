'use client'

import { Task } from '@/lib/types'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts'
import { TrendingUp, BarChart3, Clock } from 'lucide-react'
import { parseISO, startOfDay } from 'date-fns'
import { parseLocalDate } from '@/lib/utils'

interface DashboardChartsProps {
  tasks: Task[]
  isLoading: boolean
}

function isTaskCompletedLate(task: Task): boolean {
  if (!task.is_completed || !task.completed_at || !task.due_date) return false
  const completedDay = startOfDay(parseISO(task.completed_at))
  const dueDay = parseLocalDate(task.due_date)
  return completedDay > dueDay
}

export function DashboardCharts({ tasks, isLoading }: DashboardChartsProps) {
  if (isLoading) {
    return (
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <Card key={i} className="h-[300px] animate-pulse">
            <CardContent className="h-full bg-muted/20" />
          </Card>
        ))}
      </div>
    )
  }

  if (tasks.length === 0) {
    return (
      <Card className="border-dashed">
        <CardContent className="flex flex-col items-center justify-center py-12 text-center text-muted-foreground">
          <TrendingUp className="h-8 w-8 mb-2 opacity-40" />
          <p className="text-sm font-medium">No analytics data available</p>
          <p className="text-xs">Add tasks to see progress rings and priority breakdowns.</p>
        </CardContent>
      </Card>
    )
  }

  // 1. Completion Rate Calculation
  const completed = tasks.filter(t => t.status === 'completed').length
  const inProgress = tasks.filter(t => t.status === 'in-progress').length
  const pending = tasks.filter(t => t.status === 'pending').length
  const completionRate = tasks.length > 0 ? Math.round((completed / tasks.length) * 100) : 0

  const completionData = [
    { name: 'Completed', value: completed, color: 'oklch(0.65 0.18 140)' }, // Emerald
    { name: 'In Progress', value: inProgress, color: 'oklch(0.60 0.16 230)' }, // Sky Blue
    { name: 'Pending', value: pending, color: 'oklch(0.9 0.02 0 / 0.15)' },  // Muted
  ]

  // 2. Priority Distribution Calculation
  const priorityData = [
    { name: 'High', count: tasks.filter(t => t.priority === 'high').length, fill: 'oklch(0.60 0.18 20)' },
    { name: 'Medium', count: tasks.filter(t => t.priority === 'medium').length, fill: 'oklch(0.75 0.15 70)' },
    { name: 'Low', count: tasks.filter(t => t.priority === 'low').length, fill: 'oklch(0.65 0.18 140)' },
  ]

  // 3. On-Time vs Late Completion Breakdown
  const completedTasks = tasks.filter(t => t.status === 'completed')
  const completedOnTime = completedTasks.filter(t => !isTaskCompletedLate(t)).length
  const completedLate = completedTasks.filter(t => isTaskCompletedLate(t)).length
  const overdueIncomplete = tasks.filter(
    t => t.status !== 'completed' && parseLocalDate(t.due_date) < startOfDay(new Date())
  ).length

  const completionQualityData = [
    { name: 'On Time', count: completedOnTime, fill: 'oklch(0.65 0.18 140)' },  // Emerald
    { name: 'Late Done', count: completedLate, fill: 'oklch(0.75 0.15 70)' },    // Amber
    { name: 'Still Overdue', count: overdueIncomplete, fill: 'oklch(0.55 0.18 20)' }, // Red
  ]

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {/* Completion Rate Chart */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-primary" />
            Task Completion Rate
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col items-center justify-center relative min-h-[220px]">
          {tasks.length > 0 ? (
            <>
              <div className="relative w-full h-[180px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={completionData}
                      cx="50%"
                      cy="50%"
                      innerRadius={55}
                      outerRadius={75}
                      paddingAngle={3}
                      dataKey="value"
                    >
                      {completionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        color: 'var(--foreground)'
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <span className="text-3xl font-extrabold text-foreground">{completionRate}%</span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">Progress</span>
                </div>
              </div>
              <div className="flex flex-wrap justify-center gap-3 text-xs font-medium text-muted-foreground mt-2">
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.65_0.18_140)]" />
                  Completed ({completed})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-[oklch(0.60_0.16_230)]" />
                  In Progress ({inProgress})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2.5 w-2.5 rounded-full bg-muted-foreground/30" />
                  Pending ({pending})
                </span>
              </div>
            </>
          ) : (
            <p className="text-xs text-muted-foreground">No tasks available</p>
          )}
        </CardContent>
      </Card>

      {/* Priority Distribution Chart */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-primary" />
            Task Priorities
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col justify-center min-h-[220px]">
          <div className="w-full h-[180px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={priorityData}
                layout="vertical"
                margin={{ left: -10, right: 10, top: 10, bottom: 5 }}
              >
                <XAxis type="number" hide />
                <YAxis
                  dataKey="name"
                  type="category"
                  stroke="var(--muted-foreground)"
                  fontSize={11}
                  tickLine={false}
                  axisLine={false}
                  width={55}
                />
                <Tooltip
                  cursor={{ fill: 'var(--muted)', opacity: 0.15 }}
                  contentStyle={{
                    background: 'var(--popover)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '12px',
                    color: 'var(--foreground)'
                  }}
                />
                <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.fill} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Completion Quality Chart — On-Time vs Late vs Still Overdue */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b">
          <CardTitle className="text-sm font-semibold flex items-center gap-2">
            <Clock className="h-4 w-4 text-primary" />
            Completion Quality
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6 flex flex-col justify-center min-h-[220px]">
          {completedTasks.length > 0 || overdueIncomplete > 0 ? (
            <>
              <div className="w-full h-[155px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={completionQualityData}
                    layout="vertical"
                    margin={{ left: -10, right: 10, top: 5, bottom: 5 }}
                  >
                    <XAxis type="number" hide />
                    <YAxis
                      dataKey="name"
                      type="category"
                      stroke="var(--muted-foreground)"
                      fontSize={10}
                      tickLine={false}
                      axisLine={false}
                      width={72}
                    />
                    <Tooltip
                      cursor={{ fill: 'var(--muted)', opacity: 0.15 }}
                      contentStyle={{
                        background: 'var(--popover)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '12px',
                        color: 'var(--foreground)'
                      }}
                    />
                    <Bar dataKey="count" radius={[0, 4, 4, 0]} barSize={16}>
                      {completionQualityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
              {/* Summary Pills */}
              <div className="flex flex-wrap justify-center gap-2 mt-3 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[oklch(0.65_0.18_140)]" />
                  On Time ({completedOnTime})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[oklch(0.75_0.15_70)]" />
                  Late Done ({completedLate})
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[oklch(0.55_0.18_20)]" />
                  Still Overdue ({overdueIncomplete})
                </span>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center text-muted-foreground gap-2">
              <Clock className="h-7 w-7 opacity-30" />
              <p className="text-xs">Complete some tasks to see quality breakdown</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
