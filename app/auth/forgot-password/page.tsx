"use client"

import { useState } from "react"
import Link from "next/link"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Church, ArrowLeft, CheckCircle, Mail, Loader2 } from "lucide-react"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordForm = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [email, setEmail] = useState("")

  const form = useForm<ForgotPasswordForm>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  })

  const onSubmit = async (data: ForgotPasswordForm) => {
    setIsLoading(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))
      setEmail(data.email)
      setIsSubmitted(true)
    } catch (error) {
      console.error("Forgot password error:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center space-x-2 mb-6">
              <div className="bg-blue-600 p-2 rounded-lg">
                <Church className="h-8 w-8 text-white" />
              </div>
              <span className="text-2xl font-bold text-gray-900">ChurchFlow</span>
            </div>
            <div className="bg-green-100 p-4 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Mail className="h-8 w-8 text-green-600" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">Check Your Email</CardTitle>
            <CardDescription className="text-gray-600">
              We've sent a password reset link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <Alert className="border-blue-200 bg-blue-50">
              <CheckCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                If you don't see the email in your inbox within a few minutes, please check your spam folder.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <Button
                onClick={() => {
                  setIsSubmitted(false)
                  form.reset()
                }}
                variant="outline"
                className="w-full"
              >
                Try Different Email
              </Button>

              <Link href="/auth/login" className="block">
                <Button variant="ghost" className="w-full">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md shadow-xl border-0">
        <CardHeader className="text-center pb-6">
          <div className="flex items-center justify-center space-x-2 mb-6">
            <div className="bg-blue-600 p-2 rounded-lg">
              <Church className="h-8 w-8 text-white" />
            </div>
            <span className="text-2xl font-bold text-gray-900">ChurchFlow</span>
          </div>
          <CardTitle className="text-2xl font-bold text-gray-900">Forgot Password?</CardTitle>
          <CardDescription className="text-gray-600">
            No worries! Enter your email address and we'll send you a link to reset your password.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-gray-700">Email Address</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="Enter your email address" className="h-11" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" className="w-full h-11" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Mail className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>
          </Form>

          <div className="mt-6 text-center">
            <Link href="/auth/login" className="inline-flex items-center text-blue-600 hover:text-blue-500 font-medium">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Sign In
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
