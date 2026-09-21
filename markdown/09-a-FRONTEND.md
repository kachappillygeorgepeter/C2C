# 09 — Frontend Architecture

## Route Map

```
/                         → Landing page (role selection + login CTA)
/login                    → Shared login page
/register                 → Role-aware registration

/student/*                → Protected (STUDENT only)
  /student/dashboard
  /student/profile
  /student/opportunities
  /student/opportunities/:id
  /student/applications
  /student/applications/:id
  /student/notifications

/recruiter/*              → Protected (RECRUITER only)
  /recruiter/dashboard
  /recruiter/company
  /recruiter/jobs
  /recruiter/jobs/new
  /recruiter/jobs/:id
  /recruiter/jobs/:id/edit
  /recruiter/jobs/:id/applicants
  /recruiter/applicants/:appId
  /recruiter/interviews

/admin/*                  → Protected (ADMIN only)
  /admin/dashboard
  /admin/approvals
  /admin/companies
  /admin/companies/:id
  /admin/jobs
  /admin/jobs/:id
  /admin/users
  /admin/applications
  /admin/analytics
  /admin/announcements
  /admin/audit-logs
```

---

## Protected Route Guard

```tsx
// client/src/app/ProtectedRoute.tsx
import { Navigate, Outlet } from 'react-router-dom'
import { useAuthStore } from '@/store/authStore'

export const ProtectedRoute = ({ allowedRoles }: { allowedRoles: Role[] }) => {
  const { user, accessToken } = useAuthStore()

  if (!accessToken) return <Navigate to="/login" replace />
  if (!allowedRoles.includes(user!.role)) return <Navigate to="/unauthorized" replace />

  return <Outlet />
}

// In router:
<Route element={<ProtectedRoute allowedRoles={['STUDENT']} />}>
  <Route path="/student/*" element={<StudentLayout />} />
</Route>
```

> The server still enforces authorization — this guard is **UX only**.

---

## Auth Store (Zustand)

```ts
// client/src/store/authStore.ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface AuthState {
  user: User | null
  accessToken: string | null
  setAuth: (user: User, token: string) => void
  setAccessToken: (token: string) => void
  logout: () => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      accessToken: null,
      setAuth: (user, accessToken) => set({ user, accessToken }),
      setAccessToken: (accessToken) => set({ accessToken }),
      logout: () => set({ user: null, accessToken: null })
    }),
    {
      name: 'auth-storage',
      partialize: (s) => ({ user: s.user })
      // accessToken intentionally NOT persisted — refresh on load
    }
  )
)
```

---

## TanStack Query Setup

```tsx
// client/src/app/QueryProvider.tsx
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 2,    // 2 minutes
      retry: (failureCount, error: any) => {
        if (error?.response?.status === 401) return false  // don't retry auth errors
        return failureCount < 2
      }
    }
  }
})

export const QueryProvider = ({ children }: { children: React.ReactNode }) => (
  <QueryClientProvider client={queryClient}>
    {children}
    <ReactQueryDevtools initialIsOpen={false} />
  </QueryClientProvider>
)
```

---

## Key Query Hooks

```ts
// client/src/features/student/hooks/useOpportunities.ts
export const useOpportunities = (filters: OpportunityFilters) =>
  useQuery({
    queryKey: ['opportunities', filters],
    queryFn: () => api.get('/students/opportunities', { params: filters }).then(r => r.data)
  })

// client/src/features/student/hooks/useEligibility.ts
export const useEligibility = (jobId: string) =>
  useQuery({
    queryKey: ['eligibility', jobId],
    queryFn: () => api.get(`/students/opportunities/${jobId}/eligibility`).then(r => r.data),
    enabled: !!jobId
  })

// client/src/features/recruiter/hooks/useApplicants.ts
export const useApplicants = (jobId: string, filters: ApplicantFilters) =>
  useQuery({
    queryKey: ['applicants', jobId, filters],
    queryFn: () => api.get(`/recruiters/jobs/${jobId}/applicants`, { params: filters }).then(r => r.data)
  })

// Mutation with cache invalidation
export const useApplyToJob = (jobId: string) =>
  useMutation({
    mutationFn: (data: ApplyPayload) =>
      api.post(`/students/opportunities/${jobId}/apply`, data).then(r => r.data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['opportunities'] })
      queryClient.invalidateQueries({ queryKey: ['applications'] })
      toast.success('Application submitted successfully!')
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.error ?? 'Application failed')
    }
  })
```

---

## Shared Component Inventory

### Layout
- `<AppShell role="student|recruiter|admin" />` — sidebar + header + content area
- `<Sidebar />` — role-aware nav links with active state
- `<Header />` — breadcrumbs + notification bell + user avatar dropdown
- `<PageWrapper title="...">` — consistent page title + back button

### Data Display
- `<KPICard label icon value trend />` — dashboard stat cards
- `<DataTable columns data pagination />` — sortable, filterable table
- `<StatusBadge status />` — color-coded badge per status
- `<StatusTimeline history />` — vertical timeline for application history
- `<ApplicationPipeline stages currentStage />` — horizontal step tracker
- `<JobCard job applied eligible />` — opportunity card for browse view

### Forms
- `<ProfileForm />` — tabbed student profile editor
- `<JobPostingWizard />` — multi-step recruiter job form
- `<ApplyModal open jobId />` — application submission modal
- `<RejectionModal open onConfirm />` — admin rejection with required reason

### Charts (Recharts)
- `<FunnelChart data />` — hiring funnel
- `<DeptDistributionChart data />` — department breakdown
- `<ApplicationsOverTimeChart data />` — line chart
- `<PlacementRateChart data />` — bar chart

### Feedback
- `<EmptyState icon title description action />` — no data states
- `<LoadingSkeleton rows />` — content placeholder
- `<ErrorState retry />` — error with retry

---

## Responsive Strategy

| Breakpoint | Target | Key changes |
|-----------|--------|-------------|
| `sm` (640px+) | Large phone | Single column layouts |
| `md` (768px+) | Tablet | Sidebar collapses to icon-only |
| `lg` (1024px+) | Laptop | Full sidebar, 2-col cards |
| `xl` (1280px+) | Desktop | 3-col cards, expanded dashboard |

- Filters: sticky sidebar on desktop → bottom sheet / drawer on mobile
- Tables: horizontal scroll wrapper on small screens
- Charts: responsive `width="100%"` in Recharts containers
- Job cards: 1 col → 2 col → 3 col with CSS grid

---

## Form Validation (Zod + React Hook Form)

```ts
// Shared Zod schema (used on client for UX, same schema on server for truth)
export const applySchema = z.object({
  coverLetter: z.string().min(50, 'Cover letter must be at least 50 characters').max(2000),
  resumeUrl: z.string().url('Must be a valid URL').optional()
})

// In component:
const { register, handleSubmit, formState: { errors } } = useForm({
  resolver: zodResolver(applySchema)
})
```

---

## Notification Bell Component

```tsx
const NotificationBell = () => {
  const { data: count } = useQuery({
    queryKey: ['notifications', 'unread-count'],
    queryFn: () => api.get('/notifications/unread-count').then(r => r.data.count),
    refetchInterval: 30_000  // poll every 30s
  })

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button className="relative">
          <Bell size={20} />
          {count > 0 && (
            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full
                             text-xs w-4 h-4 flex items-center justify-center">
              {count > 9 ? '9+' : count}
            </span>
          )}
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0">
        <NotificationPanel />
      </PopoverContent>
    </Popover>
  )
}
```

---

## UI Design Principles

| Principle | Implementation |
|-----------|---------------|
| Status at a glance | Color-coded badges on every status field |
| Progressive disclosure | Cards expand for details rather than separate pages |
| Consistent feedback | Toast on every mutation (success + error) |
| Skeletons > spinners | Loading skeletons match the shape of content |
| Empty states | Every list has a meaningful empty state with CTA |
| Accessible | shadcn/ui components are ARIA-compliant by default |
| No content layout shift | Min-height on containers during load |
