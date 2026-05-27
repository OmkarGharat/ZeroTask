import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { Button } from '@/components/ui/button'
import { CheckCircle2, ListTodo, Target, Calendar, ArrowRight } from 'lucide-react'
import Link from 'next/link'

export default async function HomePage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (user) {
    redirect('/dashboard')
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-7 w-7 text-emerald-500" />
          <span className="text-xl font-bold text-foreground">ZeroTask</span>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/auth/login">Login</Link>
          </Button>
          <Button asChild>
            <Link href="/auth/sign-up">Get Started</Link>
          </Button>
        </div>
      </header>

      {/* Hero Section */}
      <main className="container py-20">
        <div className="flex flex-col items-center text-center gap-8 max-w-3xl mx-auto">
          <div className="flex items-center gap-2 rounded-full border border-border bg-muted px-4 py-1.5 text-sm text-muted-foreground">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            Your productivity companion
          </div>
          
          <h1 className="text-4xl font-bold tracking-tight text-foreground sm:text-6xl text-balance">
            Organize your tasks, achieve your{' '}
            <span className="text-emerald-500">goals</span>
          </h1>
          
          <p className="text-lg text-muted-foreground max-w-2xl text-pretty">
            ZeroTask helps you manage daily tasks, track long-term goals, and stay productive 
            with intuitive day, week, and month views.
          </p>

          <div className="flex flex-col sm:flex-row gap-4">
            <Button size="lg" asChild className="gap-2">
              <Link href="/auth/sign-up">
                Start for free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/auth/login">Sign in</Link>
            </Button>
          </div>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-500/10 mb-4">
              <ListTodo className="h-6 w-6 text-emerald-500" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Daily Tasks</h3>
            <p className="text-sm text-muted-foreground">
              Organize tasks by priority and type. Mark as complete and track your daily progress.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-amber-500/10 mb-4">
              <Target className="h-6 w-6 text-amber-500" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Goals & Targets</h3>
            <p className="text-sm text-muted-foreground">
              Set long-term targets with subtasks. Track progress with visual indicators.
            </p>
          </div>

          <div className="flex flex-col items-center text-center p-6 rounded-lg border border-border bg-card">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-blue-500/10 mb-4">
              <Calendar className="h-6 w-6 text-blue-500" />
            </div>
            <h3 className="text-lg font-semibold text-card-foreground mb-2">Multiple Views</h3>
            <p className="text-sm text-muted-foreground">
              Switch between day, week, and month views. Plan ahead and stay organized.
            </p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="container py-8 border-t border-border">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <CheckCircle2 className="h-5 w-5 text-emerald-500" />
            <span className="text-sm">ZeroTask</span>
          </div>
          <p className="text-sm text-muted-foreground">
            Built with Next.js and Supabase
          </p>
        </div>
      </footer>
    </div>
  )
}
