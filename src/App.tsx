import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ToastContainer, useToast } from './components/ui/Toast'
import { Layout } from './components/layout/Layout'
import { Dashboard } from './pages/Dashboard'
import { Events } from './pages/Events'
import { Accommodations } from './pages/Accommodations'
import { Attendees } from './pages/Attendees'
import { Assignments } from './pages/Assignments'
import { FormBuilder } from './pages/FormBuilder'
import { Transportation } from './pages/Transportation'
import { Communication } from './pages/Communication'
import { Reports } from './pages/Reports'
import './styles/globals.css'

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      gcTime: 1000 * 60 * 10, // 10 minutes (renamed from cacheTime)
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors
        if (error instanceof Error && error.message.includes('4')) {
          return false
        }
        return failureCount < 3
      }
    },
    mutations: {
      retry: 1
    }
  },
})

function AppContent() {
  const { toasts, removeToast } = useToast()

  return (
    <>
      <Router>
        <ErrorBoundary>
          <Layout>
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/dashboard" element={<Dashboard />} />
              <Route path="/events/*" element={<Events />} />
              <Route path="/accommodations/*" element={<Accommodations />} />
              <Route path="/attendees/*" element={<Attendees />} />
              <Route path="/assignments/*" element={<Assignments />} />
              <Route path="/form-builder/*" element={<FormBuilder />} />
              <Route path="/transportation/*" element={<Transportation />} />
              <Route path="/communication/*" element={<Communication />} />
              <Route path="/reports/*" element={<Reports />} />
            </Routes>
          </Layout>
        </ErrorBoundary>
      </Router>
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </>
  )
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <AppContent />
      </ErrorBoundary>
    </QueryClientProvider>
  )
}

export default App
