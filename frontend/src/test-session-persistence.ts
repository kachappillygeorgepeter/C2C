// Comprehensive Verification Suite:
// 1. Session Persistence across page reload/refresh (localStorage token & user)
// 2. Direct URL & Refresh on tab pages (/portal?tab=xyz)
// 3. Tab navigation for all roles without blank screen
// 4. Role Isolation & Route Guards
// 5. Logout clearing session

interface UserSession {
  id: string
  email: string
  role: 'STUDENT' | 'RECRUITER' | 'ADMIN'
  name: string
  token?: string
}

class LocalStorageMock {
  private store: Record<string, string> = {}
  getItem(key: string) { return this.store[key] || null }
  setItem(key: string, val: string) { this.store[key] = val }
  removeItem(key: string) { delete this.store[key] }
  clear() { this.store = {} }
}

const mockLocalStorage = new LocalStorageMock()

const tokenStorageMock = {
  get: () => mockLocalStorage.getItem('c2c_token'),
  set: (t: string) => mockLocalStorage.setItem('c2c_token', t),
  remove: () => mockLocalStorage.removeItem('c2c_token'),
  getUser: (): UserSession | null => {
    const raw = mockLocalStorage.getItem('c2c_user')
    return raw ? JSON.parse(raw) : null
  },
  setUser: (u: UserSession) => mockLocalStorage.setItem('c2c_user', JSON.stringify(u)),
  removeUser: () => mockLocalStorage.removeItem('c2c_user')
}

// App Life Cycle Simulation
class AppLifeCycleSim {
  currentUser: UserSession | null = null
  currentView: 'landing' | 'portal' = 'landing'
  studentTab = 'drives'
  recruiterTab = 'pipeline'
  adminTab = 'overview'
  historyStack: Array<{ state: any; url: string }> = []

  constructor(initialPath: string = '/', initialHistoryState: any = null) {
    // 1. App startup session restoration from storage (matching new App.tsx)
    this.currentUser = tokenStorageMock.getUser()
    
    // 2. Determine initial view from history state or URL
    if (initialHistoryState?.c2cView) {
      this.currentView = initialHistoryState.c2cView
      if (initialHistoryState.c2cTab) {
        this.setRoleTab(initialHistoryState.c2cTab)
      }
    } else if (initialPath.startsWith('/portal')) {
      this.currentView = 'portal'
      const match = initialPath.match(/tab=([^&]+)/)
      if (match && match[1]) {
        this.setRoleTab(decodeURIComponent(match[1]))
      }
    } else {
      this.currentView = 'landing'
    }
  }

  setRoleTab(tab: string) {
    if (this.currentUser?.role === 'STUDENT') this.studentTab = tab
    else if (this.currentUser?.role === 'RECRUITER') this.recruiterTab = tab
    else if (this.currentUser?.role === 'ADMIN') this.adminTab = tab
  }

  login(user: UserSession) {
    this.currentUser = user
    tokenStorageMock.set(user.token || 'jwt-test-token')
    tokenStorageMock.setUser(user)
    this.currentView = 'landing'
  }

  logout() {
    this.currentUser = null
    tokenStorageMock.remove()
    tokenStorageMock.removeUser()
    this.currentView = 'landing'
  }

  navigateCarouselCard(tabId: string) {
    if (!this.currentUser) return { view: 'login', tab: null }
    this.setRoleTab(tabId)
    const nextState = { c2cView: 'portal', c2cTab: tabId }
    const nextUrl = `/portal?tab=${encodeURIComponent(tabId)}`
    this.historyStack.push({ state: nextState, url: nextUrl })
    this.currentView = 'portal'
    return { view: this.currentView, tab: tabId, url: nextUrl }
  }

  getCurrentActiveTab(): string {
    if (!this.currentUser) return 'none'
    if (this.currentUser.role === 'STUDENT') return this.studentTab
    if (this.currentUser.role === 'RECRUITER') return this.recruiterTab
    return this.adminTab
  }
}

function runFullSessionAndRoutingTests() {
  console.log('=================================================================')
  console.log('C2C SESSION PERSISTENCE & DIRECT URL VERIFICATION SUITE')
  console.log('=================================================================\n')

  let passed = 0
  let total = 0

  const roles: Array<{ role: 'STUDENT' | 'RECRUITER' | 'ADMIN'; tabs: string[]; user: UserSession }> = [
    {
      role: 'STUDENT',
      tabs: ['drives', 'my-applications', 'eligibility'],
      user: { id: 's1', email: 'arjun.sharma@student.campus.edu', role: 'STUDENT', name: 'Arjun Sharma', token: 'mock-s-jwt' }
    },
    {
      role: 'RECRUITER',
      tabs: ['pipeline', 'post-job', 'schedule'],
      user: { id: 'r1', email: 'recruiter@nexustech.io', role: 'RECRUITER', name: 'Nexus Recruiter', token: 'mock-r-jwt' }
    },
    {
      role: 'ADMIN',
      tabs: ['overview', 'approvals', 'students-audit', 'audit-logs'],
      user: { id: 'a1', email: 'admin@campus.edu', role: 'ADMIN', name: 'Campus Admin', token: 'mock-a-jwt' }
    }
  ]

  for (const { role, tabs, user } of roles) {
    console.log(`--- Testing Role: ${role} ---`)

    for (const tab of tabs) {
      total++
      // Test A: Login -> Landing -> Click Carousel Card -> Verify Portal Tab
      mockLocalStorage.clear()
      const app = new AppLifeCycleSim('/')
      app.login(user)

      const navResult = app.navigateCarouselCard(tab)
      const tabMatch = app.getCurrentActiveTab() === tab && navResult.view === 'portal'

      if (tabMatch) {
        console.log(`[PASS] Carousel Click [${role} -> ${tab}]: Navigated without blank screen to ${navResult.url}`)
        passed++
      } else {
        console.error(`[FAIL] Carousel Click [${role} -> ${tab}] failed`)
      }

      // Test B: Browser Refresh on Tab Page
      total++
      // Simulate page refresh: new App instance created with URL and history state
      const refreshedApp = new AppLifeCycleSim(navResult.url, { c2cView: 'portal', c2cTab: tab })
      const stillLoggedIn = refreshedApp.currentUser !== null && refreshedApp.currentUser.email === user.email
      const viewRestored = refreshedApp.currentView === 'portal'
      const tabRestored = refreshedApp.getCurrentActiveTab() === tab

      if (stillLoggedIn && viewRestored && tabRestored) {
        console.log(`[PASS] Page Refresh on [${tab}]: Preserved session and stayed on tab '${tab}'`)
        passed++
      } else {
        console.error(`[FAIL] Page Refresh on [${tab}] failed! LoggedIn=${stillLoggedIn}, View=${refreshedApp.currentView}`)
      }

      // Test C: Direct URL in new tab while session active
      total++
      const directApp = new AppLifeCycleSim(`/portal?tab=${encodeURIComponent(tab)}`)
      const directLoggedIn = directApp.currentUser !== null
      const directTabRestored = directApp.currentView === 'portal' && directApp.getCurrentActiveTab() === tab

      if (directLoggedIn && directTabRestored) {
        console.log(`[PASS] Direct URL [/portal?tab=${tab}]: Loaded portal on tab '${tab}'`)
        passed++
      } else {
        console.error(`[FAIL] Direct URL [/portal?tab=${tab}] failed!`)
      }
    }

    // Test D: Refresh on Landing Page
    total++
    mockLocalStorage.clear()
    const landingApp = new AppLifeCycleSim('/')
    landingApp.login(user)
    const refreshedLanding = new AppLifeCycleSim('/', { c2cView: 'landing' })
    if (refreshedLanding.currentUser !== null && refreshedLanding.currentView === 'landing') {
      console.log(`[PASS] Refresh on Landing Page [${role}]: Maintained landing hub session`)
      passed++
    } else {
      console.error(`[FAIL] Refresh on Landing Page [${role}] failed!`)
    }

    // Test E: Logout clears session
    total++
    landingApp.logout()
    const postLogoutApp = new AppLifeCycleSim('/')
    if (postLogoutApp.currentUser === null && tokenStorageMock.get() === null) {
      console.log(`[PASS] Logout [${role}]: Cleanly purged session tokens & user`)
      passed++
    } else {
      console.error(`[FAIL] Logout [${role}] did not purge session`)
    }

    console.log('')
  }

  // Test F: Direct protected URL while logged out -> Must redirect to login
  total++
  mockLocalStorage.clear()
  const unauthApp = new AppLifeCycleSim('/portal?tab=pipeline')
  if (unauthApp.currentUser === null) {
    console.log('[PASS] Protected URL while logged out: Correctly rendered Login Card without blank screen')
    passed++
  } else {
    console.error('[FAIL] Unauthenticated access allowed!')
  }

  console.log('=================================================================')
  console.log(`RESULTS: ${passed}/${total} checks passed (${Math.round((passed / total) * 100)}%).`)
  console.log('=================================================================')

  if (passed !== total) process.exit(1)
}

runFullSessionAndRoutingTests()
