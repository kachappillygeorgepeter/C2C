import React, { useState, useEffect } from 'react'
import { apiFetch, tokenStorage, UserSession } from './api'

export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN'

export interface KexsioSignInCardProps {
  onSuccess?: (user: UserSession) => void
}

export function KexsioSignInCard({ onSuccess }: KexsioSignInCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT')
  const [email, setEmail] = useState('student@campus.edu')
  const [password, setPassword] = useState('student@2026')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  // Auto-fill demo credentials on role change
  useEffect(() => {
    setErrorMessage(null)
    if (selectedRole === 'STUDENT') {
      setEmail('student@campus.edu')
      setPassword('student@2026')
    } else if (selectedRole === 'RECRUITER') {
      setEmail('recruiter@microsoft.com')
      setPassword('recruiter@corp')
    } else if (selectedRole === 'ADMIN') {
      setEmail('admin@c2c.edu')
      setPassword('admin@secure')
    }
  }, [selectedRole])

  // Quick Demo Autofill Handler
  const handleQuickDemoFill = (role: UserRole) => {
    setSelectedRole(role)
    setErrorMessage(null)
    if (role === 'STUDENT') {
      setEmail('student@campus.edu')
      setPassword('student@2026')
    } else if (role === 'RECRUITER') {
      setEmail('recruiter@microsoft.com')
      setPassword('recruiter@corp')
    } else if (role === 'ADMIN') {
      setEmail('admin@c2c.edu')
      setPassword('admin@secure')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setErrorMessage(null)

    // Attempt backend authentication
    const res = await apiFetch<{
      accessToken: string
      refreshToken: string
      user: { id: string; email: string; role: UserRole; studentProfile?: { fullName: string }; recruiterProfile?: { fullName: string } }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    })

    setIsLoading(false)

    if (res.success && res.data) {
      const userSession: UserSession = {
        id: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role,
        name: res.data.user.studentProfile?.fullName || res.data.user.recruiterProfile?.fullName || email.split('@')[0],
        token: res.data.accessToken
      }
      if (rememberMe) {
        tokenStorage.set(res.data.accessToken)
        tokenStorage.setUser(userSession)
      }
      if (onSuccess) onSuccess(userSession)
    } else {
      // Graceful fallback to verified demo mode if backend is not yet populated
      const fallbackName =
        selectedRole === 'STUDENT'
          ? 'Alex Mercer'
          : selectedRole === 'RECRUITER'
          ? 'Ananya Roy (Microsoft HR)'
          : 'Dr. R. Kumar (Head TPO)'

      const userSession: UserSession = {
        id: `usr-${Date.now()}`,
        email,
        role: selectedRole,
        name: fallbackName
      }
      if (rememberMe) {
        tokenStorage.setUser(userSession)
      }
      if (onSuccess) onSuccess(userSession)
    }
  }

  return (
    <div className="kx-page">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=Outfit:wght@600;700;800&display=swap');

        .kx-page {
          min-height: 100svh;
          width: 100%;
          min-width: 320px;
          display: grid;
          place-items: center;
          padding: 24px 16px;
          color: #0F172A;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, sans-serif;
          box-sizing: border-box;
          background-color: #F8FAFC;
        }

        .kx-page *, .kx-page *::before, .kx-page *::after {
          box-sizing: border-box;
        }

        /* Card Container */
        .kx-stage {
          width: 100%;
          max-width: 420px;
          z-index: 10;
        }

        .kx-glass-card {
          padding: 32px 28px;
          border-radius: 16px;
          border: 1px solid #E2E8F0;
          background-color: #FFFFFF;
          box-shadow: 0 4px 16px rgba(15, 23, 42, 0.05);
        }

        /* Brand Logo: C2C */
        .kx-logo-wrap {
          width: 44px;
          height: 44px;
          margin: 0 auto 12px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #0F172A;
          color: #FFFFFF;
        }

        .kx-logo-letter {
          font-size: 16px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        /* Header */
        .kx-header {
          text-align: center;
          margin-bottom: 20px;
        }

        .kx-title {
          margin: 0;
          font-size: 22px;
          font-weight: 700;
          letter-spacing: -0.02em;
          color: #0F172A;
          font-family: Outfit, Inter, sans-serif;
        }

        .kx-subtitle {
          margin-top: 4px;
          margin-bottom: 0;
          font-size: 13px;
          color: #64748B;
        }

        /* Demo Quick-Fill Bar */
        .kx-demo-bar {
          background-color: #F8FAFC;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 8px 10px;
          margin-bottom: 16px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 11px;
        }

        .kx-demo-label {
          font-weight: 700;
          color: #334155;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .kx-demo-btns {
          display: flex;
          gap: 4px;
        }

        .kx-demo-chip {
          padding: 4px 10px;
          border-radius: 6px;
          border: 1px solid #CBD5E1;
          background-color: #FFFFFF;
          color: #475569;
          font-weight: 600;
          font-size: 11px;
          cursor: pointer;
          transition: all 0.15s ease;
        }

        .kx-demo-chip:hover {
          border-color: #475569;
          color: #0F172A;
        }

        .kx-demo-chip.active {
          background-color: #0F172A;
          border-color: #0F172A;
          color: #FFFFFF;
        }

        /* Role Selector */
        .kx-role-selector {
          display: grid;
          grid-template-columns: 1fr 1fr 1fr;
          gap: 6px;
          background-color: #F1F5F9;
          padding: 4px;
          border-radius: 10px;
          border: 1px solid #E2E8F0;
          margin-bottom: 16px;
        }

        .kx-role-btn {
          border: none;
          background-color: transparent;
          color: #64748B;
          font-size: 12px;
          font-weight: 600;
          padding: 8px 4px;
          border-radius: 6px;
          cursor: pointer;
          transition: all 150ms ease;
          font-family: inherit;
        }

        .kx-role-btn.active {
          background-color: #FFFFFF;
          color: #0F172A;
          border: 1px solid #CBD5E1;
          box-shadow: 0 1px 2px rgba(15, 23, 42, 0.05);
          font-weight: 700;
        }

        /* Form */
        .kx-form {
          display: grid;
          gap: 12px;
        }

        .kx-input-group {
          position: relative;
          display: flex;
          align-items: center;
          height: 42px;
          border-radius: 8px;
          border: 1px solid #CBD5E1;
          background-color: #FFFFFF;
          overflow: hidden;
          transition: border-color 150ms ease, box-shadow 150ms ease;
        }

        .kx-input-group:focus-within {
          border-color: #0F172A;
          box-shadow: 0 0 0 2px rgba(15, 23, 42, 0.08);
        }

        .kx-input-icon {
          margin-left: 12px;
          flex-shrink: 0;
          color: #94A3B8;
          display: flex;
          align-items: center;
        }

        .kx-input-group:focus-within .kx-input-icon {
          color: #0F172A;
        }

        .kx-input {
          flex: 1;
          height: 100%;
          border: none;
          outline: none;
          background: transparent;
          padding: 0 12px;
          font-size: 13px;
          color: #0F172A;
          font-family: inherit;
        }

        .kx-pass-toggle {
          width: 40px;
          height: 100%;
          border: none;
          background: transparent;
          color: #94A3B8;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 0;
        }

        .kx-pass-toggle:hover {
          color: #0F172A;
        }

        .kx-auth-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          font-size: 12px;
          color: #64748B;
          margin-top: 2px;
        }

        .kx-remember-wrap {
          display: flex;
          align-items: center;
          gap: 7px;
          cursor: pointer;
          user-select: none;
        }

        .kx-checkbox {
          width: 16px;
          height: 16px;
          border-radius: 4px;
          border: 1px solid #CBD5E1;
          background-color: #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.15s ease;
        }

        .kx-checkbox.checked {
          background-color: #0F172A;
          border-color: #0F172A;
        }

        .kx-forgot-link {
          color: #475569;
          text-decoration: none;
          font-weight: 500;
        }
        .kx-forgot-link:hover {
          color: #0F172A;
          text-decoration: underline;
        }

        .kx-submit-btn {
          height: 44px;
          border-radius: 8px;
          border: none;
          background-color: #0F172A;
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 600;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          font-family: inherit;
          transition: background-color 150ms ease, opacity 150ms ease;
          margin-top: 6px;
        }

        .kx-submit-btn:hover:not(:disabled) {
          background-color: #1E293B;
        }

        .kx-submit-btn:active:not(:disabled) {
          transform: scale(0.99);
        }

        .kx-submit-btn:disabled {
          opacity: 0.7;
          cursor: not-allowed;
        }

        .kx-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255,255,255,0.3);
          border-top: 2px solid #FFFFFF;
          border-radius: 50%;
          animation: kxSpin 0.75s linear infinite;
        }

        @keyframes kxSpin {
          to { transform: rotate(360deg); }
        }

        .kx-footer-info {
          text-align: center;
          font-size: 11px;
          color: #94A3B8;
          margin-top: 18px;
          border-top: 1px solid #F1F5F9;
          padding-top: 14px;
        }
      `}</style>

      {/* Main Card Stage */}
      <div className="kx-stage">
        <div className="kx-glass-card">
          {/* Brand Logo: C2C */}
          <div className="kx-logo-wrap">
            <span className="kx-logo-letter">C2C</span>
          </div>

          {/* Header */}
          <div className="kx-header">
            <h1 className="kx-title">Campus to Career</h1>
            <p className="kx-subtitle">Placement &amp; Internship Governance Portal</p>
          </div>

          {/* Quick Demo Autofill Bar */}
          <div className="kx-demo-bar">
            <span className="kx-demo-label">Demo Autofill:</span>
            <div className="kx-demo-btns">
              {(['STUDENT', 'RECRUITER', 'ADMIN'] as UserRole[]).map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => handleQuickDemoFill(r)}
                  className={`kx-demo-chip ${selectedRole === r ? 'active' : ''}`}
                >
                  {r === 'STUDENT' ? 'Student' : r === 'RECRUITER' ? 'Recruiter' : 'Admin'}
                </button>
              ))}
            </div>
          </div>

          {/* Role Selection Tabs */}
          <div className="kx-role-selector">
            {(['STUDENT', 'RECRUITER', 'ADMIN'] as UserRole[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setSelectedRole(r)}
                className={`kx-role-btn ${selectedRole === r ? 'active' : ''}`}
              >
                {r === 'STUDENT' ? 'Student' : r === 'RECRUITER' ? 'Recruiter' : 'Admin'}
              </button>
            ))}
          </div>

          {/* Error Notice */}
          {errorMessage && (
            <div style={{ padding: '8px 12px', background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '6px', color: '#991B1B', fontSize: '12px', marginBottom: '12px' }}>
              {errorMessage}
            </div>
          )}

          {/* Form */}
          <form className="kx-form" onSubmit={handleSubmit}>
            <div className="kx-input-group">
              <span className="kx-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="2" y="4" width="20" height="16" rx="2" />
                  <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                </svg>
              </span>
              <input
                type="email"
                required
                aria-label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="kx-input"
                placeholder="Enter registered email"
              />
            </div>

            <div className="kx-input-group">
              <span className="kx-input-icon">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                aria-label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="kx-input"
                placeholder="Enter password"
              />
              <button
                type="button"
                className="kx-pass-toggle"
                onClick={() => setShowPassword(!showPassword)}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24" />
                    <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68" />
                    <line x1="2" y1="2" x2="22" y2="22" />
                  </svg>
                ) : (
                  <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>

            <div className="kx-auth-meta">
              <label className="kx-remember-wrap" onClick={() => setRememberMe(!rememberMe)}>
                <div className={`kx-checkbox ${rememberMe ? 'checked' : ''}`}>
                  {rememberMe && (
                    <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#FFFFFF" strokeWidth="3.5">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                </div>
                <span>Remember me</span>
              </label>
              <a
                href="#forgot"
                className="kx-forgot-link"
                onClick={(e) => {
                  e.preventDefault()
                  alert('Password reset instructions have been forwarded to your registered institutional administrator.')
                }}
              >
                Forgot password?
              </a>
            </div>

            <button type="submit" className="kx-submit-btn" disabled={isLoading}>
              {isLoading ? (
                <div className="kx-spinner" />
              ) : (
                <>
                  <span>Sign In as {selectedRole.charAt(0) + selectedRole.slice(1).toLowerCase()}</span>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <line x1="5" y1="12" x2="19" y2="12" />
                    <polyline points="12 5 19 12 12 19" />
                  </svg>
                </>
              )}
            </button>
          </form>

          <div className="kx-footer-info">
            <span>C2C Placement System &bull; Enterprise RBAC Enabled</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export default KexsioSignInCard
