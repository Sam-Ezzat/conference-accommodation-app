import { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { LoadingSpinner } from '@/components/ui/LoadingSpinner'

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('auth_token')
      const user = localStorage.getItem('user')
      
      if (token && user) {
        try {
          // Verify token is valid (in a real app, you'd verify with the server)
          const userData = JSON.parse(user)
          if (userData && userData.id) {
            setIsAuthenticated(true)
          } else {
            setIsAuthenticated(false)
            localStorage.removeItem('auth_token')
            localStorage.removeItem('user')
          }
        } catch (error) {
          setIsAuthenticated(false)
          localStorage.removeItem('auth_token')
          localStorage.removeItem('user')
        }
      } else {
        setIsAuthenticated(false)
      }
      
      setIsLoading(false)
    }

    checkAuth()
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <LoadingSpinner className="h-8 w-8 mx-auto mb-4" />
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    // Redirect to login with return URL
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  return <>{children}</>
}
