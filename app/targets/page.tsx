'use client'

import { useTargets } from '@/lib/data'
import { DashboardHeader } from '@/components/dashboard-header'
import { TargetsList } from '@/components/targets-list'

export default function TargetsPage() {
  const { data: targets = [], isLoading } = useTargets()

  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-6 animate-page-fade-in">
        <TargetsList targets={targets} isLoading={isLoading} />
      </main>
    </div>
  )
}
