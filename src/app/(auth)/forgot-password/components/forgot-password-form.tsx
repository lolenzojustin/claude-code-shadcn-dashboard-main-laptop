"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Loader2, Mail } from "lucide-react"
import { getFirebaseAuthErrorMessage, resetPassword } from "@/lib/firebase/auth"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type ForgotPasswordValues = z.infer<typeof forgotPasswordSchema>

export function ForgotPasswordForm({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const [isSent, setIsSent] = useState(false)

  const form = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await toast.promise(resetPassword(values.email), {
        loading: "Đang gửi email đặt lại mật khẩu...",
        success: () => {
          setIsSent(true)
          return (
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-green-500" />
              Đã gửi email đặt lại mật khẩu. Vui lòng kiểm tra hộp thư.
            </div>
          )
        },
        error: (err) => getFirebaseAuthErrorMessage(err),
      })
    } catch {
      // error handled by toast.promise
    }
  }

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader className="text-center">
          <CardTitle className="text-xl">Forgot your password?</CardTitle>
          <CardDescription>
            Enter your email address and we&apos;ll send you a link to reset
            your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isSent ? (
            <div className="flex flex-col items-center gap-4 py-4 text-center">
              <div className="flex size-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900/30">
                <Mail className="size-6 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-1">
                <p className="font-medium">Check your email</p>
                <p className="text-sm text-muted-foreground">
                  We sent a password reset link to your email address.
                </p>
              </div>
              <Button
                variant="outline"
                className="cursor-pointer"
                onClick={() => {
                  setIsSent(false)
                  form.reset()
                }}
              >
                Send again
              </Button>
            </div>
          ) : (
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="grid gap-6">
                <div className="grid gap-3">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    disabled={form.formState.isSubmitting}
                    {...form.register("email")}
                  />
                  {form.formState.errors.email && (
                    <p className="text-sm text-destructive">
                      {form.formState.errors.email.message}
                    </p>
                  )}
                </div>
                <Button
                  type="submit"
                  className="w-full cursor-pointer"
                  disabled={form.formState.isSubmitting}
                >
                  {form.formState.isSubmitting && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Send Reset Link
                </Button>
                <div className="text-center text-sm">
                  Remember your password?{" "}
                  <a href="/sign-in" className="underline underline-offset-4">
                    Back to sign in
                  </a>
                </div>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
