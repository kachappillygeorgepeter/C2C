import React from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import {
  GraduationCap,
  Briefcase,
  ShieldCheck,
  LogOut,
  LayoutDashboard,
  FileText,
  Building2,
  Users,
  Search,
  Bell
} from 'lucide-react'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  // Generate navigation links based on role
  const getNavLinks = () => {
    if (user?.role === 'STUDENT') {
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: LayoutDashboard },
        { label: 'Opportunities', path: '/student/opportunities', icon: Search },
        { label: 'My Applications', path: '/student/applications', icon: FileText },
        { label: 'Academic Profile', path: '/student/profile', icon: GraduationCap }
      ]
    }
    if (user?.role === 'RECRUITER') {
      return [
        { label: 'Dashboard', path: '/recruiter/dashboard', icon: LayoutDashboard },
        { label: 'My Job Postings', path: '/recruiter/jobs', icon: Briefcase },
        { label: 'Company Profile', path: '/recruiter/company', icon: Building2 }
      ]
    }
    if (user?.role === 'ADMIN') {
      return [
        { label: 'Analytics Dashboard', path: '/admin/dashboard', icon: LayoutDashboard },
        { label: 'Company Approvals', path: '/admin/companies', icon: Building2 },
        { label: 'Job Approvals', path: '/admin/jobs', icon: Briefcase },
        { label: 'Student Directory', path: '/admin/students', icon: Users },
        { label: 'Audit Trail', path: '/admin/audit', icon: ShieldCheck }
      ]
    }
    return []
  }

  const navLinks = getNavLinks()

  return (
    <div className="min-h-screen flex bg-slate-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 flex flex-col fixed inset-y-0 z-20">
        <div className="h-16 flex items-center px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white font-black text-lg shadow-sm shadow-indigo-500/30">
              C
            </div>
            <span className="font-extrabold text-lg tracking-tight text-slate-900">
              C2C <span className="text-indigo-600 font-bold text-xs tracking-normal">PORTAL</span>
            </span>
          </Link>
        </div>

        {/* Role Badge */}
        <div className="px-5 py-4">
          <div className="p-3.5 bg-slate-50 border border-slate-200/60 rounded-2xl">
            <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">Active Session</p>
            <p className="text-xs font-bold text-slate-800 truncate mt-0.5">{user?.email}</p>
            <span className="inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200/60">
              {user?.role}
            </span>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
          {navLinks.map((item) => {
            const Icon = item.icon
            const active = location.pathname.startsWith(item.path)
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all duration-150 active:scale-[0.98] ${
                  active
                    ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/30'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <Icon className={`w-4 h-4 ${active ? 'text-white' : 'text-slate-400'}`} />
                {item.label}
              </Link>
            )
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-100">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-all duration-150 active:scale-95 cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 pl-64 flex flex-col min-h-screen">
        <header className="h-16 bg-white border-b border-slate-200 sticky top-0 z-10 flex items-center justify-between px-8">
          <div className="text-xs text-slate-500 font-medium">
            Campus Placement & Enterprise Recruitment Platform
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-xl relative transition-all active:scale-95 cursor-pointer">
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-indigo-600" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center font-bold text-xs text-indigo-700 shadow-sm">
              {user?.email[0].toUpperCase()}
            </div>
          </div>
        </header>

        <main className="p-8 flex-1 max-w-7xl w-full mx-auto">
          {children}
        </main>
      </div>
    </div>
  )
}

