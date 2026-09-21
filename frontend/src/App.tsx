import React from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useAuthStore } from './store/authStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { AppLayout } from './components/layout/AppLayout'

// Student Pages
import { StudentDashboard } from './pages/student/StudentDashboard'
import { OpportunitiesPage } from './pages/student/OpportunitiesPage'
import { OpportunityDetailPage } from './pages/student/OpportunityDetailPage'
import { ApplicationsPage } from './pages/student/ApplicationsPage'
import { StudentProfilePage } from './pages/student/StudentProfilePage'

// Recruiter Pages
import { RecruiterDashboard } from './pages/recruiter/RecruiterDashboard'
import { JobApplicationsPipelinePage } from './pages/recruiter/JobApplicationsPipelinePage'
import { NewJobPage } from './pages/recruiter/NewJobPage'

// Admin Pages
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { CompanyApprovalsPage } from './pages/admin/CompanyApprovalsPage'
import { AuditTrailPage } from './pages/admin/AuditTrailPage'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1
    }
  }
})

// Protected Route Guard
const ProtectedRoute: React.FC<{ children: React.ReactNode; allowedRoles?: string[] }> = ({
  children,
  allowedRoles
}) => {
  const { user, isAuthenticated } = useAuthStore()

  if (!isAuthenticated || !user) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />
  }

  return <AppLayout>{children}</AppLayout>
}

// Landing / Redirect Handler
const HomeRedirect: React.FC = () => {
  const { user, isAuthenticated } = useAuthStore()
  if (!isAuthenticated || !user) return <Navigate to="/login" replace />
  if (user.role === 'STUDENT') return <Navigate to="/student/dashboard" replace />
  if (user.role === 'RECRUITER') return <Navigate to="/recruiter/dashboard" replace />
  return <Navigate to="/admin/dashboard" replace />
}

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<HomeRedirect />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />

          {/* Student Routes */}
          <Route
            path="/student/dashboard"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/opportunities"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <OpportunitiesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/opportunities/:id"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <OpportunityDetailPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/applications"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <ApplicationsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/student/profile"
            element={
              <ProtectedRoute allowedRoles={['STUDENT']}>
                <StudentProfilePage />
              </ProtectedRoute>
            }
          />

          {/* Recruiter Routes */}
          <Route
            path="/recruiter/dashboard"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <RecruiterDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/new"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <NewJobPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/recruiter/jobs/:id/applications"
            element={
              <ProtectedRoute allowedRoles={['RECRUITER']}>
                <JobApplicationsPipelinePage />
              </ProtectedRoute>
            }
          />

          {/* Admin Routes */}
          <Route
            path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/companies"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <CompanyApprovalsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin/audit"
            element={
              <ProtectedRoute allowedRoles={['ADMIN']}>
                <AuditTrailPage />
              </ProtectedRoute>
            }
          />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
export default App
