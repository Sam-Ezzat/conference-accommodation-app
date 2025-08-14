import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, X, Check } from 'lucide-react'

interface ConfirmDialogProps {
  isOpen: boolean
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'danger' | 'warning' | 'info'
  onConfirm: () => void
  onCancel: () => void
  isLoading?: boolean
}

export function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger',
  onConfirm,
  onCancel,
  isLoading = false
}: ConfirmDialogProps) {
  if (!isOpen) return null

  const variantConfig = {
    danger: {
      icon: <AlertTriangle className="h-5 w-5 text-red-500" />,
      confirmButtonClass: 'bg-red-600 hover:bg-red-700 text-white',
      iconBgClass: 'bg-red-100'
    },
    warning: {
      icon: <AlertTriangle className="h-5 w-5 text-yellow-500" />,
      confirmButtonClass: 'bg-yellow-600 hover:bg-yellow-700 text-white',
      iconBgClass: 'bg-yellow-100'
    },
    info: {
      icon: <Check className="h-5 w-5 text-blue-500" />,
      confirmButtonClass: 'bg-blue-600 hover:bg-blue-700 text-white',
      iconBgClass: 'bg-blue-100'
    }
  }

  const config = variantConfig[variant]

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <div className={`p-2 rounded-full ${config.iconBgClass}`}>
                {config.icon}
              </div>
              {title}
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onCancel} disabled={isLoading}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p className="text-gray-600">{message}</p>
            <div className="flex gap-3">
              <Button
                variant="outline"
                onClick={onCancel}
                disabled={isLoading}
                className="flex-1"
              >
                {cancelText}
              </Button>
              <Button
                onClick={onConfirm}
                disabled={isLoading}
                className={`flex-1 ${config.confirmButtonClass}`}
              >
                {isLoading ? 'Processing...' : confirmText}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
