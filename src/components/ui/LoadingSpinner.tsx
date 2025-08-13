import { Loader2 } from 'lucide-react'
import { cn } from '@/utils/helpers'

interface LoadingSpinnerProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
  text?: string
}

const sizeMap = {
  sm: 'h-4 w-4',
  md: 'h-6 w-6',
  lg: 'h-8 w-8'
}

export function LoadingSpinner({ size = 'md', className, text }: LoadingSpinnerProps) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Loader2 className={cn('animate-spin', sizeMap[size])} />
      {text && <span className="text-sm text-gray-600">{text}</span>}
    </div>
  )
}

export function PageLoading({ text = 'Loading...' }: { text?: string }) {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <LoadingSpinner size="lg" text={text} />
    </div>
  )
}
