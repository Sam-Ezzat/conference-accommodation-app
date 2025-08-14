import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ErrorBoundary } from './components/ui/ErrorBoundary'
import { ToastContainer, useToast } from './components/ui/Toast'
import { Layout } from './components/layout/Layout'
import { AuthGuard } from './components/auth/AuthGuard'
import { Dashboard } from './pages/Dashboard'
import { Events } from './pages/Events'
import { Accommodations } from './pages/Accommodations'
import { Attendees } from './pages/Attendees'
import { Assignments } from './pages/Assignments'
import { FormBuilder } from './pages/FormBuilder'
import { Transportation } from './pages/Transportation'
import { Communication } from './pages/Communication'
import { Reports } from './pages/Reports'
import { Login } from './pages/Login'
import { Register } from './pages/Register'
import { ForgotPassword } from './pages/ForgotPassword'
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
          <Routes>
            {/* Auth routes - without Layout */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />
            
            {/* Protected routes with AuthGuard and Layout */}
            <Route path="/" element={
              <AuthGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/dashboard" element={
              <AuthGuard>
                <Layout>
                  <Dashboard />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/events/*" element={
              <AuthGuard>
                <Layout>
                  <Events />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/accommodations/*" element={
              <AuthGuard>
                <Layout>
                  <Accommodations />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/attendees/*" element={
              <AuthGuard>
                <Layout>
                  <Attendees />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/assignments/*" element={
              <AuthGuard>
                <Layout>
                  <Assignments />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/form-builder/*" element={
              <AuthGuard>
                <Layout>
                  <FormBuilder />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/transportation/*" element={
              <AuthGuard>
                <Layout>
                  <Transportation />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/communication/*" element={
              <AuthGuard>
                <Layout>
                  <Communication />
                </Layout>
              </AuthGuard>
            } />
            <Route path="/reports/*" element={
              <AuthGuard>
                <Layout>
                  <Reports />
                </Layout>
              </AuthGuard>
            } />
          </Routes>
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
