import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { ArrowLeft, Mail, Send, Building2, CheckCircle } from 'lucide-react'

const forgotPasswordSchema = z.object({
  email: z.string().email('Please enter a valid email address')
})

type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>

export function ForgotPassword() {
  const [isLoading, setIsLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema)
  })

  const email = watch('email')

  const onSubmit = async (data: ForgotPasswordInput) => {
    setIsLoading(true)
    try {
      // API call would go here
      console.log('Reset password for:', data.email)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      setEmailSent(true)
      addToast({
        type: 'success',
        message: 'Password reset instructions sent to your email!'
      })
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to send reset email. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleResend = async () => {
    setIsLoading(true)
    try {
      await new Promise(resolve => setTimeout(resolve, 1000))
      addToast({
        type: 'success',
        message: 'Reset email sent again!'
      })
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to resend email.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="text-center pb-6">
              <div className="flex items-center justify-center mb-6">
                <div className="bg-green-600 rounded-xl p-3 mr-3">
                  <CheckCircle className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">Email Sent</h1>
                  <p className="text-sm text-gray-600">Check your inbox</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold text-gray-900">
                Check Your Email
              </CardTitle>
              <p className="text-gray-600">
                We've sent password reset instructions to
              </p>
              <p className="font-medium text-blue-600">{email}</p>
            </CardHeader>
            
            <CardContent className="space-y-6">
              <div className="text-center space-y-4">
                <div className="bg-blue-50 rounded-lg p-4">
                  <Mail className="h-12 w-12 text-blue-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-600">
                    Please check your email and click the link to reset your password. 
                    The link will expire in 24 hours.
                  </p>
                </div>

                <div className="text-sm text-gray-600">
                  Didn't receive the email? Check your spam folder or{' '}
                  <button
                    onClick={handleResend}
                    disabled={isLoading}
                    className="text-blue-600 hover:text-blue-800 font-medium underline"
                  >
                    {isLoading ? 'Sending...' : 'try again'}
                  </button>
                </div>
              </div>

              <div className="text-center">
                <Link
                  to="/login"
                  className="inline-flex items-center text-gray-600 hover:text-gray-800"
                >
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Sign In
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
          <CardHeader className="text-center pb-6">
            <div className="flex items-center justify-center mb-6">
              <div className="bg-blue-600 rounded-xl p-3 mr-3">
                <Building2 className="h-6 w-6 text-white" />
              </div>
              <div className="text-left">
                <h1 className="text-xl font-bold text-gray-900">Conference Manager</h1>
                <p className="text-sm text-gray-600">Accommodation System</p>
              </div>
            </div>
            <CardTitle className="text-2xl font-bold">Forgot Password?</CardTitle>
            <p className="text-gray-600">
              No worries! Enter your email and we'll send you reset instructions.
            </p>
          </CardHeader>
          
          <CardContent>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email address"
                    {...register('email')}
                    className="h-11 pl-10"
                    disabled={isLoading}
                  />
                </div>
                {errors.email && (
                  <p className="text-sm text-red-600">{errors.email.message}</p>
                )}
              </div>

              <Button
                type="submit"
                className="w-full h-11"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <LoadingSpinner className="mr-2 h-4 w-4" />
                    Sending Reset Link...
                  </>
                ) : (
                  <>
                    <Send className="mr-2 h-4 w-4" />
                    Send Reset Link
                  </>
                )}
              </Button>
            </form>

            <div className="mt-6 text-center">
              <Link
                to="/login"
                className="inline-flex items-center text-gray-600 hover:text-gray-800"
              >
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Sign In
              </Link>
            </div>

            <div className="mt-6 text-center">
              <p className="text-sm text-gray-600">
                Don't have an account?{' '}
                <Link
                  to="/register"
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
