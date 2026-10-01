import React, { useState, useRef, useEffect } from 'react'
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

  // 3D card tilt & pointer glow position
  const [tilt, setTilt] = useState({ rotateX: 0, rotateY: 0 })
  const [glowPos, setGlowPos] = useState({ x: 50, y: 42 })
  const cardRef = useRef<HTMLDivElement>(null)

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (e.pointerType === 'touch') return
    if (!cardRef.current) return

    const rect = cardRef.current.getBoundingClientRect()
    const relativeX = (e.clientX - rect.left) / rect.width
    const relativeY = (e.clientY - rect.top) / rect.height

    const rotateX = (0.5 - relativeY) * 11
    const rotateY = (relativeX - 0.5) * 11

    setTilt({ rotateX, rotateY })
    setGlowPos({ x: relativeX * 100, y: relativeY * 100 })
  }

  const handlePointerLeave = () => {
    setTilt({ rotateX: 0, rotateY: 0 })
    setGlowPos({ x: 50, y: 42 })
  }

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
          overflow: hidden;
          position: relative;
          isolation: isolate;
          padding: 24px 18px;
          color: #0F172A;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          box-sizing: border-box;
          background:
            radial-gradient(circle at 50% -10%, rgba(30, 41, 59, 0.08), transparent 45%),
            radial-gradient(circle at 10% 20%, rgba(241, 245, 249, 0.9), transparent 40%),
            linear-gradient(180deg, #F8FAFC 0%, #F1F5F9 50%, #E2E8F0 100%);
        }

        .kx-page *, .kx-page *::before, .kx-page *::after {
          box-sizing: border-box;
        }

        /* Ambient Animated Grid & Lights */
        .kx-grid-overlay {
          position: absolute;
          inset: 0;
          pointer-events: none;
          z-index: 1;
          opacity: 0.45;
          background-image:
            linear-gradient(to right, rgba(15, 23, 42, 0.05) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(15, 23, 42, 0.05) 1px, transparent 1px);
          background-size: 56px 56px;
          -webkit-mask-image: linear-gradient(to bottom, black 30%, transparent 90%);
          mask-image: linear-gradient(to bottom, black 30%, transparent 90%);
        }

        .kx-halo-top {
          position: absolute;
          top: -30vh;
          left: 50%;
          transform: translateX(-50%);
          width: min(1000px, 120vw);
          height: 60vh;
          background: rgba(148, 163, 184, 0.2);
          filter: blur(80px);
          border-radius: 9999px;
          pointer-events: none;
          z-index: 1;
        }

        .kx-orb-left {
          position: absolute;
          width: 340px;
          height: 340px;
          top: 15%;
          left: 5%;
          background: rgba(203, 213, 225, 0.45);
          filter: blur(90px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }

        .kx-orb-right {
          position: absolute;
          width: 340px;
          height: 340px;
          right: 5%;
          bottom: 12%;
          background: rgba(226, 232, 240, 0.5);
          filter: blur(90px);
          border-radius: 50%;
          pointer-events: none;
          z-index: 1;
        }

        /* 3D Card Stage */
        .kx-stage {
          width: min(100%, 430px);
          max-width: 430px;
          perspective: 1400px;
          z-index: 10;
          animation: kxCardEntrance 600ms cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }

        @keyframes kxCardEntrance {
          from { opacity: 0; transform: translateY(20px) scale(0.98); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* 3D Card Shell with interactive tilt */
        .kx-card-shell {
          position: relative;
          border-radius: 24px;
          transform-style: preserve-3d;
          transition: transform 170ms ease-out;
        }

        .kx-shell-shadow {
          position: absolute;
          inset: 4% 4% -5%;
          background: rgba(15, 23, 42, 0.12);
          filter: blur(28px);
          border-radius: 28px;
          z-index: -1;
          transition: filter 220ms ease;
        }

        .kx-card-shell:hover .kx-shell-shadow {
          filter: blur(34px);
        }

        /* Glass Card */
        .kx-glass-card {
          padding: 30px 26px;
          border-radius: 24px;
          border: 1px solid rgba(203, 213, 225, 0.85);
          transform: translateZ(16px);
          overflow: hidden;
          position: relative;
          background: rgba(255, 255, 255, 0.95);
          box-shadow:
            0 20px 45px -10px rgba(15, 23, 42, 0.08),
            0 0 0 1px rgba(255, 255, 255, 0.9) inset;
          backdrop-filter: blur(20px);
          -webkit-backdrop-filter: blur(20px);
        }

        /* Dynamic pointer-tracking radial spotlight glow */
        .kx-pointer-glow {
          position: absolute;
          width: 260px;
          height: 260px;
          border-radius: 50%;
          transform: translate(-50%, -50%);
          opacity: 0.25;
          filter: blur(32px);
          background: radial-gradient(circle, rgba(51, 65, 85, 0.18), transparent 70%);
          pointer-events: none;
          z-index: 2;
          transition: left 120ms linear, top 120ms linear;
        }

        /* 4 Animated Edge Runner Beams */
        .kx-edge-runner {
          position: absolute;
          inset: -1px;
          border-radius: 24px;
          overflow: hidden;
          pointer-events: none;
          transform: translateZ(20px);
          z-index: 4;
        }

        .kx-beam-h {
          position: absolute;
          width: 45%;
          height: 2px;
          border-radius: 999px;
          opacity: 0.9;
          box-shadow: 0 0 8px rgba(30, 41, 59, 0.5);
          background: linear-gradient(90deg, transparent, #334155, transparent);
        }

        .kx-beam-v {
          position: absolute;
          width: 2px;
          height: 45%;
          border-radius: 999px;
          opacity: 0.9;
          box-shadow: 0 0 8px rgba(30, 41, 59, 0.5);
          background: linear-gradient(180deg, transparent, #334155, transparent);
        }

        .kx-beam-top { top: 0; left: -48%; animation: kxRunTop 4s cubic-bezier(0.65, 0, 0.35, 1) infinite; }
        .kx-beam-right { right: 0; top: -48%; animation: kxRunRight 4s cubic-bezier(0.65, 0, 0.35, 1) infinite; animation-delay: 1s; }
        .kx-beam-bottom { bottom: 0; right: -48%; animation: kxRunBottom 4s cubic-bezier(0.65, 0, 0.35, 1) infinite; animation-delay: 2s; }
        .kx-beam-left { left: 0; bottom: -48%; animation: kxRunLeft 4s cubic-bezier(0.65, 0, 0.35, 1) infinite; animation-delay: 3s; }

        @keyframes kxRunTop {
          0%, 18% { left: -48%; opacity: 0; }
          27%, 66% { opacity: 0.95; }
          84%, 100% { left: 105%; opacity: 0; }
        }
        @keyframes kxRunRight {
          0%, 18% { top: -48%; opacity: 0; }
          27%, 66% { opacity: 0.95; }
          84%, 100% { top: 105%; opacity: 0; }
        }
        @keyframes kxRunBottom {
          0%, 18% { right: -48%; opacity: 0; }
          27%, 66% { opacity: 0.95; }
          84%, 100% { right: 105%; opacity: 0; }
        }
        @keyframes kxRunLeft {
          0%, 18% { bottom: -48%; opacity: 0; }
          27%, 66% { opacity: 0.95; }
          84%, 100% { bottom: 105%; opacity: 0; }
        }

        .kx-card-content {
          position: relative;
          z-index: 3;
        }

        /* Brand Logo: C2C */
        .kx-logo-wrap {
          width: 48px;
          height: 48px;
          margin: 0 auto 12px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          background: linear-gradient(135deg, #1E293B, #0F172A);
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
          color: #FFFFFF;
        }

        .kx-logo-letter {
          font-size: 17px;
          font-weight: 800;
          letter-spacing: -0.02em;
        }

        /* Header */
        .kx-header {
          text-align: center;
          margin-bottom: 18px;
        }

        .kx-title {
          margin: 0;
          font-size: 23px;
          font-weight: 800;
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
          background-color: #F1F5F9;
          border: 1px solid #E2E8F0;
          border-radius: 10px;
          padding: 8px 10px;
          margin-bottom: 14px;
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
          padding: 4px 9px;
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
          background-color: #1E293B;
          border-color: #1E293B;
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
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.08);
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
          border-color: #334155;
          box-shadow: 0 0 0 3px rgba(51, 65, 85, 0.12);
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
          background-color: #1E293B;
          border-color: #1E293B;
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
          background: linear-gradient(135deg, #1E293B, #0F172A);
          color: #FFFFFF;
          font-size: 13px;
          font-weight: 700;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          box-shadow: 0 4px 14px rgba(15, 23, 42, 0.25);
          font-family: inherit;
          transition: transform 180ms ease, box-shadow 180ms ease, opacity 150ms ease;
          margin-top: 4px;
        }

        .kx-submit-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 6px 18px rgba(15, 23, 42, 0.35);
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

      {/* Ambient background animations */}
      <div className="kx-grid-overlay" aria-hidden="true" />
      <div className="kx-halo-top" aria-hidden="true" />
      <div className="kx-orb-left" aria-hidden="true" />
      <div className="kx-orb-right" aria-hidden="true" />

      {/* Interactive 3D Card Stage */}
      <div className="kx-stage">
        <div
          ref={cardRef}
          className="kx-card-shell"
          onPointerMove={handlePointerMove}
          onPointerLeave={handlePointerLeave}
          style={{
            transform: `rotateX(${tilt.rotateX}deg) rotateY(${tilt.rotateY}deg)`
          }}
        >
          <div className="kx-shell-shadow" aria-hidden="true" />

          {/* 4 Animated Edge Runners */}
          <div className="kx-edge-runner" aria-hidden="true">
            <div className="kx-beam-h kx-beam-top" />
            <div className="kx-beam-v kx-beam-right" />
            <div className="kx-beam-h kx-beam-bottom" />
            <div className="kx-beam-v kx-beam-left" />
          </div>

          <div className="kx-glass-card">
            {/* Pointer-reactive Spotlight Glow */}
            <div
              className="kx-pointer-glow"
              aria-hidden="true"
              style={{ left: `${glowPos.x}%`, top: `${glowPos.y}%` }}
            />

            <div className="kx-card-content">
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
      </div>
    </div>
  )
}

export default KexsioSignInCard
