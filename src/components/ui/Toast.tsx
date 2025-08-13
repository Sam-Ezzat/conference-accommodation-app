import { useState, useEffect } from 'react'
import { CheckCircle, XCircle, AlertCircle, Info, X } from 'lucide-react'
import { cn } from '@/utils/helpers'

export type ToastType = 'success' | 'error' | 'warning' | 'info'

export interface Toast {
  id: string
  type: ToastType
  message: string
  duration?: number
}

interface ToastItemProps {
  toast: Toast
  onRemove: (id: string) => void
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertCircle,
  info: Info
}

const colors = {
  success: 'bg-green-50 border-green-200 text-green-800',
  error: 'bg-red-50 border-red-200 text-red-800',
  warning: 'bg-yellow-50 border-yellow-200 text-yellow-800',
  info: 'bg-blue-50 border-blue-200 text-blue-800'
}

function ToastItem({ toast, onRemove }: ToastItemProps) {
  const [isVisible, setIsVisible] = useState(false)
  const Icon = icons[toast.type]

  useEffect(() => {
    setIsVisible(true)
    
    const timer = setTimeout(() => {
      setIsVisible(false)
      setTimeout(() => onRemove(toast.id), 300)
    }, toast.duration || 5000)

    return () => clearTimeout(timer)
  }, [toast, onRemove])

  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 rounded-lg border shadow-sm transition-all duration-300 min-w-[300px] max-w-md',
        colors[toast.type],
        isVisible ? 'opacity-100 transform translate-x-0' : 'opacity-0 transform translate-x-full'
      )}
    >
      <Icon className="h-5 w-5 flex-shrink-0" />
      <p className="flex-1 text-sm font-medium">{toast.message}</p>
      <button
        onClick={() => {
          setIsVisible(false)
          setTimeout(() => onRemove(toast.id), 300)
        }}
        className="flex-shrink-0 rounded-full p-1 hover:bg-black/10 transition-colors"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  )
}

export function ToastContainer({ toasts, onRemove }: { 
  toasts: Toast[]
  onRemove: (id: string) => void 
}) {
  return (
    <div className="fixed top-4 right-4 z-50 space-y-2">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onRemove={onRemove} />
      ))}
    </div>
  )
}

// Hook for managing toasts
export function useToast() {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = (toast: Omit<Toast, 'id'>) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { ...toast, id }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  const success = (message: string, duration?: number) => {
    addToast({ type: 'success', message, duration })
  }

  const error = (message: string, duration?: number) => {
    addToast({ type: 'error', message, duration })
  }

  const warning = (message: string, duration?: number) => {
    addToast({ type: 'warning', message, duration })
  }

  const info = (message: string, duration?: number) => {
    addToast({ type: 'info', message, duration })
  }

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info
  }
}
