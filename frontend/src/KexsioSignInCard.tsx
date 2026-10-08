import React, { useState, useRef, useEffect } from 'react'
import { apiFetch, tokenStorage, UserSession } from './api'
import { supabase, isSupabaseConfigured } from './supabaseClient'
import loginSchoolImg from '../imgs/login_school.jpg'

export type UserRole = 'STUDENT' | 'RECRUITER' | 'ADMIN'

export interface KexsioSignInCardProps {
  onSuccess?: (user: UserSession) => void
}

export function KexsioSignInCard({ onSuccess }: KexsioSignInCardProps) {
  const [selectedRole, setSelectedRole] = useState<UserRole>('STUDENT')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
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

  // Clear errors when role switches
  useEffect(() => {
    setErrorMessage(null)
  }, [selectedRole])


  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (isLoading) return
    setIsLoading(true)
    setErrorMessage(null)

    // Attempt backend authentication with Supabase/Prisma verified accounts
    const res = await apiFetch<{
      accessToken: string
      refreshToken: string
      user: { id: string; email: string; role: UserRole; studentProfile?: { fullName: string }; recruiterProfile?: { fullName: string } }
    }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email: username.trim(), password })
    })

    setIsLoading(false)

    if (res.success && res.data) {
      const userSession: UserSession = {
        id: res.data.user.id,
        email: res.data.user.email,
        role: res.data.user.role,
        name: res.data.user.studentProfile?.fullName || res.data.user.recruiterProfile?.fullName || username.trim(),
        token: res.data.accessToken
      }
      if (rememberMe) {
        tokenStorage.set(res.data.accessToken)
        tokenStorage.setUser(userSession)
      }
      if (onSuccess) onSuccess(userSession)
    } else {
      setErrorMessage(res.error || 'Invalid username or password. Please try again.')
    }
  }


  // Google OAuth via Supabase
  const handleGoogleSignIn = async () => {
    if (!isSupabaseConfigured) {
      alert(
        'Supabase is not configured yet! Please provide your VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in frontend/.env to enable Google OAuth.'
      )
      return
    }

    try {
      setIsLoading(true)
      localStorage.setItem('c2c_oauth_role', selectedRole)

      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      })

      if (error) {
        setErrorMessage(error.message)
        setIsLoading(false)
      }
    } catch (err: any) {
      setErrorMessage(err.message || 'Google Sign-In failed.')
      setIsLoading(false)
    }
  }


  return (
    <div className="kx-page">
      <style>{`

        .kx-page {
          min-height: 100svh;
          width: 100%;
          min-width: 320px;
          display: flex;
          flex-direction: column;
          overflow-x: hidden;
          position: relative;
          isolation: isolate;
          padding: 0;
          color: #0F172A;
          font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
          box-sizing: border-box;
          background: #FFFFFF;
        }

        @media (min-width: 1024px) {
          .kx-page {
            flex-direction: row;
            height: 100svh;
            overflow: hidden;
          }
        }

        .kx-page *, .kx-page *::before, .kx-page *::after {
          box-sizing: border-box;
        }

        /* Left Image Panel */
        .kx-image-panel {
          display: none;
          position: relative;
          overflow: hidden;
          background: #0F172A;
        }

        @media (min-width: 1024px) {
          .kx-image-panel {
            display: flex;
            flex: 1 1 50%;
            max-width: 50%;
            height: 100%;
            position: relative;
            flex-direction: column;
            justify-content: flex-end;
            padding: 48px;
          }
        }

        .kx-image-panel-img {
          position: absolute;
          inset: 0;
          width: 100%;
          height: 100%;
          object-fit: cover;
          object-position: center;
          transition: transform 0.6s ease;
        }

        .kx-image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            180deg,
            rgba(15, 23, 42, 0.25) 0%,
            rgba(15, 23, 42, 0.45) 50%,
            rgba(15, 23, 42, 0.88) 100%
          );
          z-index: 2;
        }

        .kx-image-content {
          position: relative;
          z-index: 3;
          color: #FFFFFF;
          max-width: 520px;
        }

        /* Mobile / Tablet Top Banner */
        .kx-image-banner {
          display: block;
          position: relative;
          width: 100%;
          height: 180px;
          overflow: hidden;
          background: #0F172A;
        }

        @media (min-width: 640px) {
          .kx-image-banner {
            height: 220px;
          }
        }

        @media (min-width: 1024px) {
          .kx-image-banner {
            display: none;
          }
        }

        /* Right Form Panel */
        .kx-form-panel {
          flex: 1 1 100%;
          display: flex;
          align-items: center;
          justify-content: center;
          position: relative;
          padding: 32px 20px;
          min-height: 100svh;
          overflow-y: auto;
        }

        @media (min-width: 1024px) {
          .kx-form-panel {
            flex: 1 1 50%;
            max-width: 50%;
            min-height: 100%;
            height: 100%;
            padding: 40px 32px;
          }
        }

        /* Ambient Animated Grid & Lights inside form panel */
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
          top: -25vh;
          left: 50%;
          transform: translateX(-50%);
          width: min(800px, 120vw);
          height: 50vh;
          background: rgba(148, 163, 184, 0.2);
          filter: blur(80px);
          border-radius: 9999px;
          pointer-events: none;
          z-index: 1;
        }

        .kx-orb-left {
          position: absolute;
          width: 280px;
          height: 280px;
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
          width: 280px;
          height: 280px;
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
          opacity: 1;
          animation: kxCardEntrance 450ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        @keyframes kxCardEntrance {
          0% { opacity: 0; transform: translateY(16px) scale(0.98); }
          100% { opacity: 1; transform: translateY(0) scale(1); }
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

        .kx-submit-btn:focus-visible {
          outline: none;
          box-shadow: 0 0 0 2px #FFFFFF, 0 0 0 4px #0F172A;
        }

        .kx-submit-btn:disabled {
          opacity: 0.65;
          cursor: not-allowed;
          transform: none;
          box-shadow: none;
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

        .kx-back-home {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          margin-bottom: 14px;
          font-size: 12px;
          font-weight: 600;
          color: #475569;
          text-decoration: none;
          cursor: pointer;
          transition: color 0.15s ease;
        }
        .kx-back-home:hover {
          color: #0F172A;
          text-decoration: underline;
        }
      `}</style>

      {/* Left Full-Height Image Panel (Desktop >= 1024px) */}
      <div className="kx-image-panel" aria-label="Campus recruitment and university life">
        <img
          src={loginSchoolImg}
          alt="Campus To Career - University placement and career gateway"
          className="kx-image-panel-img"
        />
        <div className="kx-image-overlay" aria-hidden="true" />
        <div className="kx-image-content">
          <h1
            style={{
              fontSize: '32px',
              fontWeight: '800',
              lineHeight: 1.25,
              margin: 0,
              fontFamily: 'Outfit, Inter, sans-serif',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 12px rgba(15, 23, 42, 0.75)'
            }}
          >
            C2C - Campus To Career
          </h1>
        </div>
      </div>

      {/* Top Image Banner for Tablet / Mobile (< 1024px) */}
      <div className="kx-image-banner" aria-label="Campus recruitment banner">
        <img
          src={loginSchoolImg}
          alt="Campus To Career banner"
          className="kx-image-panel-img"
        />
        <div className="kx-image-overlay" aria-hidden="true" />
        <div style={{ position: 'absolute', inset: 0, zIndex: 3, display: 'flex', alignItems: 'flex-end', padding: '16px 20px', color: '#FFFFFF' }}>
          <div
            style={{
              fontSize: '18px',
              fontWeight: '800',
              fontFamily: 'Outfit, Inter, sans-serif',
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              textShadow: '0 2px 8px rgba(15, 23, 42, 0.8)'
            }}
          >
            C2C - Campus To Career
          </div>
        </div>
      </div>

      {/* Right Login Panel */}
      <div className="kx-form-panel">
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
              {/* Brand Logo & Header */}
              <div
                style={{ textDecoration: 'none', color: 'inherit', display: 'block', cursor: 'default' }}
                title="Campus To Career"
              >
                <div className="kx-logo-wrap">
                  <span className="kx-logo-letter">C2C</span>
                </div>

                <div className="kx-header">
                  <h1 className="kx-title">Campus to Career</h1>
                  <p className="kx-subtitle">Placement &amp; Internship Governance Portal</p>
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
                      <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </span>
                  <input
                    type="text"
                    required
                    aria-label="Username or Email"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="kx-input"
                    placeholder={
                      selectedRole === 'STUDENT'
                        ? 'Username (e.g. userstudent)'
                        : selectedRole === 'RECRUITER'
                        ? 'Username (e.g. userrecruiter)'
                        : 'Username (e.g. useradmin)'
                    }
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

                {/* OAuth Divider */}
                <div style={{ display: 'flex', alignItems: 'center', margin: '14px 0 10px 0', gap: '10px' }}>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                  <span style={{ fontSize: '11px', fontWeight: '600', color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.04em' }}>or</span>
                  <div style={{ flex: 1, height: '1px', backgroundColor: '#E2E8F0' }} />
                </div>

                {/* Google Sign-in Button */}
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={isLoading}
                  style={{
                    width: '100%',
                    height: '42px',
                    borderRadius: '8px',
                    border: '1px solid #CBD5E1',
                    backgroundColor: '#FFFFFF',
                    color: '#0F172A',
                    fontSize: '13px',
                    fontWeight: '600',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '10px',
                    cursor: 'pointer',
                    transition: 'all 0.15s ease',
                    boxShadow: '0 1px 2px rgba(15, 23, 42, 0.04)'
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F8FAFC'; e.currentTarget.style.borderColor = '#94A3B8' }}
                  onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = '#FFFFFF'; e.currentTarget.style.borderColor = '#CBD5E1' }}
                >
                  <svg width="18" height="18" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.66v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.15z"/>
                    <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                    <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.16 0 9.98 0 12c0 2.02.45 3.84 1.25 5.42l4.03-3.15z"/>
                    <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
                  </svg>
                  <span>Continue with Google</span>
                </button>
              </form>


              <div className="kx-footer-info" style={{ marginTop: '16px' }}>
                <span>C2C Placement System &bull; Enterprise RBAC Enabled</span>

              </div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  )
}

export default KexsioSignInCard
