'use client'

import { DashboardHeader } from '@/components/dashboard-header'
import { RecycleBinList } from '@/components/recycle-bin-list'

export default function RecycleBinPage() {
  return (
    <div className="min-h-screen bg-background">
      <DashboardHeader />
      <main className="container py-6 animate-page-fade-in">
        <RecycleBinList />
      </main>
    </div>
  )
}
