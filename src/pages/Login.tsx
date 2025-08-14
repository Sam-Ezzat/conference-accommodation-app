import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { loginSchema, LoginInput } from '@/utils/validation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { Eye, EyeOff, LogIn, Users, Building2 } from 'lucide-react'
import { apiClient } from '@/services/api'

export function Login() {
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()
  const { addToast } = useToast()

  // Get the return URL from the state (set by AuthGuard) or default to dashboard
  const from = location.state?.from?.pathname || '/dashboard'

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema)
  })

  const onSubmit = async (data: LoginInput) => {
    setIsLoading(true)
    try {
      const response = await apiClient.login(data)
      localStorage.setItem('auth_token', response.token)
      localStorage.setItem('user', JSON.stringify(response.user))
      
      addToast({
        type: 'success',
        message: `Welcome back, ${response.user.firstName}!`
      })
      
      // Navigate to the intended destination or dashboard
      navigate(from, { replace: true })
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Invalid username or password'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
        
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:block space-y-8">
          <div className="text-center lg:text-left">
            <div className="flex items-center justify-center lg:justify-start mb-6">
              <div className="bg-blue-600 rounded-xl p-3 mr-4">
                <Building2 className="h-8 w-8 text-white" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  Conference Manager
                </h1>
                <p className="text-gray-600">Accommodation Management System</p>
              </div>
            </div>
            
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Welcome Back
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Sign in to manage your conference accommodations, attendees, and events seamlessly.
            </p>
          </div>

          {/* Feature highlights */}
          <div className="space-y-4">
            <div className="flex items-center space-x-3">
              <div className="bg-green-100 rounded-full p-2">
                <Users className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Attendee Management</h3>
                <p className="text-gray-600 text-sm">Efficiently manage registrations and participant data</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-blue-100 rounded-full p-2">
                <Building2 className="h-5 w-5 text-blue-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Smart Room Assignment</h3>
                <p className="text-gray-600 text-sm">Automated accommodation assignment with preferences</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <div className="bg-purple-100 rounded-full p-2">
                <LogIn className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Real-time Dashboard</h3>
                <p className="text-gray-600 text-sm">Monitor event status and analytics in real-time</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Login Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-8">
              <div className="lg:hidden flex items-center justify-center mb-4">
                <div className="bg-blue-600 rounded-xl p-3 mr-3">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">Conference Manager</h1>
                  <p className="text-sm text-gray-600">Accommodation System</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Sign In</CardTitle>
              <p className="text-gray-600">
                Enter your credentials to access your account
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="Enter your username"
                    {...register('username')}
                    className="h-11"
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-sm text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Enter your password"
                      {...register('password')}
                      className="h-11 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.password && (
                    <p className="text-sm text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <input
                      id="remember"
                      type="checkbox"
                      className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <Label htmlFor="remember" className="text-sm">
                      Remember me
                    </Label>
                  </div>
                  <Link
                    to="/forgot-password"
                    className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>

                <Button
                  type="submit"
                  className="w-full h-11"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <LogIn className="mr-2 h-4 w-4" />
                      Sign In
                    </>
                  )}
                </Button>
              </form>

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

              {/* Demo credentials */}
              <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-xs text-gray-600 font-medium mb-2">Demo Credentials:</p>
                <div className="text-xs text-gray-500 space-y-1">
                  <p>Admin: <code className="bg-white px-1 rounded">admin</code> / <code className="bg-white px-1 rounded">admin123</code></p>
                  <p>Organizer: <code className="bg-white px-1 rounded">organizer</code> / <code className="bg-white px-1 rounded">org123</code></p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
