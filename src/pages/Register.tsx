import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'
import { useToast } from '@/components/ui/Toast'
import { 
  Eye, 
  EyeOff, 
  UserPlus, 
  Building2, 
  Mail, 
  User, 
  Lock,
  Check
} from 'lucide-react'

// Register validation schema
const registerSchema = z.object({
  firstName: z.string().min(2, 'First name must be at least 2 characters'),
  lastName: z.string().min(2, 'Last name must be at least 2 characters'),
  username: z.string().min(3, 'Username must be at least 3 characters'),
  email: z.string().email('Please enter a valid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  organizationName: z.string().min(2, 'Organization name must be at least 2 characters'),
  role: z.enum(['organizer', 'assistant', 'viewer'], { required_error: 'Role is required' }),
  agreeToTerms: z.boolean().refine(val => val === true, 'You must agree to the terms and conditions')
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ["confirmPassword"],
})

type RegisterInput = z.infer<typeof registerSchema>

export function Register() {
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const navigate = useNavigate()
  const { addToast } = useToast()

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema)
  })

  const password = watch('password')

  // Password strength checker
  const getPasswordStrength = (password: string) => {
    if (!password) return { score: 0, label: '', color: '' }
    
    let score = 0
    if (password.length >= 8) score++
    if (/[A-Z]/.test(password)) score++
    if (/[a-z]/.test(password)) score++
    if (/[0-9]/.test(password)) score++
    if (/[^A-Za-z0-9]/.test(password)) score++
    
    if (score <= 2) return { score, label: 'Weak', color: 'text-red-600' }
    if (score === 3) return { score, label: 'Fair', color: 'text-orange-600' }
    if (score === 4) return { score, label: 'Good', color: 'text-yellow-600' }
    return { score, label: 'Strong', color: 'text-green-600' }
  }

  const passwordStrength = getPasswordStrength(password || '')

  const onSubmit = async (data: RegisterInput) => {
    setIsLoading(true)
    try {
      // API call would go here - using data for registration
      console.log('Registration data:', data)
      await new Promise(resolve => setTimeout(resolve, 2000)) // Simulate API call
      
      addToast({
        type: 'success',
        message: 'Account created successfully! Please check your email to verify your account.'
      })
      
      navigate('/login')
    } catch (error) {
      addToast({
        type: 'error',
        message: 'Failed to create account. Please try again.'
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 flex items-center justify-center p-4">
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        
        {/* Left Side - Branding & Info */}
        <div className="hidden lg:block space-y-8 sticky top-8">
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
              Join Our Platform
            </h2>
            <p className="text-xl text-gray-600 mb-8">
              Create your account and start managing conference accommodations with ease.
            </p>
          </div>

          {/* Features */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h3 className="font-semibold text-gray-900 mb-3">What you get:</h3>
              <ul className="space-y-3">
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Complete event management dashboard</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Automated room assignment system</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Dynamic form builder for registrations</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Real-time communication tools</span>
                </li>
                <li className="flex items-center space-x-3">
                  <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                  <span className="text-gray-700">Comprehensive reporting and analytics</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Right Side - Registration Form */}
        <div className="w-full max-w-md mx-auto">
          <Card className="shadow-xl border-0 bg-white/80 backdrop-blur-sm">
            <CardHeader className="space-y-1 text-center pb-6">
              <div className="lg:hidden flex items-center justify-center mb-4">
                <div className="bg-blue-600 rounded-xl p-3 mr-3">
                  <Building2 className="h-6 w-6 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-xl font-bold text-gray-900">Conference Manager</h1>
                  <p className="text-sm text-gray-600">Accommodation System</p>
                </div>
              </div>
              <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
              <p className="text-gray-600">
                Fill in your details to get started
              </p>
            </CardHeader>
            
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                {/* Personal Information */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <Input
                        id="firstName"
                        type="text"
                        placeholder="John"
                        {...register('firstName')}
                        className="h-10 pl-10"
                        disabled={isLoading}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="text-xs text-red-600">{errors.firstName.message}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      type="text"
                      placeholder="Doe"
                      {...register('lastName')}
                      className="h-10"
                      disabled={isLoading}
                    />
                    {errors.lastName && (
                      <p className="text-xs text-red-600">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="username">Username</Label>
                  <Input
                    id="username"
                    type="text"
                    placeholder="johndoe"
                    {...register('username')}
                    className="h-10"
                    disabled={isLoading}
                  />
                  {errors.username && (
                    <p className="text-xs text-red-600">{errors.username.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="john@example.com"
                      {...register('email')}
                      className="h-10 pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-xs text-red-600">{errors.email.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="organizationName">Organization</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="organizationName"
                      type="text"
                      placeholder="Your Organization"
                      {...register('organizationName')}
                      className="h-10 pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.organizationName && (
                    <p className="text-xs text-red-600">{errors.organizationName.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    {...register('role')}
                    className="w-full h-10 px-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    disabled={isLoading}
                  >
                    <option value="">Select your role</option>
                    <option value="organizer">Event Organizer</option>
                    <option value="assistant">Assistant</option>
                    <option value="viewer">Viewer</option>
                  </select>
                  {errors.role && (
                    <p className="text-xs text-red-600">{errors.role.message}</p>
                  )}
                </div>

                {/* Password */}
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? 'text' : 'password'}
                      placeholder="Create a strong password"
                      {...register('password')}
                      className="h-10 pl-10 pr-10"
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
                  
                  {password && (
                    <div className="flex items-center space-x-2">
                      <div className={`text-xs font-medium ${passwordStrength.color}`}>
                        {passwordStrength.label}
                      </div>
                      <div className="flex-1 bg-gray-200 rounded-full h-1">
                        <div
                          className={`h-1 rounded-full transition-all ${
                            passwordStrength.score <= 2 ? 'bg-red-500' :
                            passwordStrength.score === 3 ? 'bg-orange-500' :
                            passwordStrength.score === 4 ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${(passwordStrength.score / 5) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                  
                  {errors.password && (
                    <p className="text-xs text-red-600">{errors.password.message}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirm Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="confirmPassword"
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="Confirm your password"
                      {...register('confirmPassword')}
                      className="h-10 pl-10 pr-10"
                      disabled={isLoading}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
                      disabled={isLoading}
                    >
                      {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && (
                    <p className="text-xs text-red-600">{errors.confirmPassword.message}</p>
                  )}
                </div>

                {/* Terms and Conditions */}
                <div className="flex items-start space-x-2">
                  <input
                    id="agreeToTerms"
                    type="checkbox"
                    {...register('agreeToTerms')}
                    className="mt-1 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    disabled={isLoading}
                  />
                  <Label htmlFor="agreeToTerms" className="text-sm leading-5">
                    I agree to the{' '}
                    <Link to="/terms" className="text-blue-600 hover:text-blue-800">
                      Terms of Service
                    </Link>{' '}
                    and{' '}
                    <Link to="/privacy" className="text-blue-600 hover:text-blue-800">
                      Privacy Policy
                    </Link>
                  </Label>
                </div>
                {errors.agreeToTerms && (
                  <p className="text-xs text-red-600">{errors.agreeToTerms.message}</p>
                )}

                <Button
                  type="submit"
                  className="w-full h-10"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <LoadingSpinner className="mr-2 h-4 w-4" />
                      Creating Account...
                    </>
                  ) : (
                    <>
                      <UserPlus className="mr-2 h-4 w-4" />
                      Create Account
                    </>
                  )}
                </Button>
              </form>

              <div className="mt-6 text-center">
                <p className="text-sm text-gray-600">
                  Already have an account?{' '}
                  <Link
                    to="/login"
                    className="text-blue-600 hover:text-blue-800 font-medium"
                  >
                    Sign in
                  </Link>
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
