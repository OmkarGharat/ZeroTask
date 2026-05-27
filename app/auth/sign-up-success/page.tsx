import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { CheckCircle2, Mail } from 'lucide-react'
import Link from 'next/link'

export default function SignUpSuccessPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center bg-background p-6 md:p-10">
      <div className="w-full max-w-sm">
        <div className="flex flex-col gap-6">
          <div className="flex items-center justify-center gap-2 text-2xl font-bold text-foreground">
            <CheckCircle2 className="h-8 w-8 text-emerald-500" />
            ZeroTask
          </div>
          <Card className="border-border bg-card">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10">
                <Mail className="h-8 w-8 text-emerald-500" />
              </div>
              <CardTitle className="text-2xl text-card-foreground">Check your email</CardTitle>
              <CardDescription>
                {"We've sent you a confirmation link. Please check your email to verify your account."}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center text-sm text-muted-foreground">
                Already verified?{' '}
                <Link
                  href="/auth/login"
                  className="text-foreground underline underline-offset-4 hover:text-primary"
                >
                  Login
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
