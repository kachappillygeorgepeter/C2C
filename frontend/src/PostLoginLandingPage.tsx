import React, { useMemo } from 'react'
import { UserSession } from './api'
import { ThreeDCarousel, ThreeDCarouselItem } from '@/components/ui/3d-carousel'

export interface LandingPageProps {
  user: UserSession
  onNavigateTab: (tabId: string) => void
  onSignOut: () => void
  jobsCount?: number
  applicationsCount?: number
  interviewsCount?: number
  pendingCount?: number
  studentsAuditCount?: number
  auditLogsCount?: number
  liveJobs?: Array<{ company: string; allowedDepts?: string[]; title?: string }>
}

export interface NavCardItem {
  id: string
  label: string
  description: string
  countLabel?: string
  badge?: string
  icon: React.ReactNode
}

export interface HiringCompanyItem {
  name: string
  streams: string[]
  hiringRoles: string
  initials: string
}

// Fallback / standard hiring companies covering CSE, ECE, MECH, BIO and more
const DEFAULT_HIRING_COMPANIES: HiringCompanyItem[] = [
  { name: 'Google Cloud India', streams: ['CSE', 'ECE'], hiringRoles: 'Cloud Systems, ML', initials: 'G' },
  { name: 'Microsoft India', streams: ['CSE', 'ISE'], hiringRoles: 'Software Engineering', initials: 'MS' },
  { name: 'Amazon Web Services', streams: ['CSE', 'ECE'], hiringRoles: 'Distributed Systems', initials: 'AWS' },
  { name: 'QuantEdge Analytics', streams: ['CSE', 'MATH'], hiringRoles: 'Quant Trading', initials: 'QE' },
  { name: 'Cisco Systems', streams: ['ECE', 'CSE'], hiringRoles: 'Network & SDN', initials: 'CS' },
  { name: 'Texas Instruments', streams: ['ECE'], hiringRoles: 'Embedded Systems', initials: 'TI' },
  { name: 'Tata Motors EV Tech', streams: ['MECH', 'ECE'], hiringRoles: 'EV Powertrain', initials: 'TM' },
  { name: 'Siemens Digital', streams: ['MECH', 'ROBOTICS'], hiringRoles: 'Industrial Automation', initials: 'SIE' },
  { name: 'Biocon Biologics', streams: ['BIO', 'CHEM'], hiringRoles: 'Bioinformatics', initials: 'BIO' },
  { name: 'Adobe Systems', streams: ['CSE'], hiringRoles: 'Applied AI & Creative Cloud', initials: 'AD' },
  { name: 'Nexus Technologies', streams: ['CSE', 'ECE'], hiringRoles: 'Full Stack Cloud', initials: 'NX' }
]

export default function PostLoginLandingPage({
  user,
  onNavigateTab,
  onSignOut,
  jobsCount = 0,
  applicationsCount = 0,
  interviewsCount = 0,
  pendingCount = 0,
  studentsAuditCount = 0,
  auditLogsCount = 0,
  liveJobs = []
}: LandingPageProps) {
  // Extract display name or fallback
  const displayName = useMemo(() => {
    if (user.name && user.name.trim()) {
      const cleaned = user.name.split('(')[0].trim()
      if (cleaned) return cleaned
    }
    if (user.email) {
      return user.email.split('@')[0]
    }
    return 'there'
  }, [user])

  // Map tabs based on role strictly matching App.tsx definitions
  const roleCards = useMemo<NavCardItem[]>(() => {
    if (user.role === 'STUDENT') {
      return [
        {
          id: 'drives',
          label: 'Active Drives',
          countLabel: `${jobsCount} Openings`,
          badge: 'High Priority',
          description: 'Explore campus recruitment drives, verify criteria, and submit one-click applications.',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
            </svg>
          )
        },
        {
          id: 'my-applications',
          label: 'My Applications',
          countLabel: `${applicationsCount} Tracked`,
          badge: 'Live Status',
          description: 'Monitor application status stages, shortlists, assessment invites, and schedules.',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
              <line x1="16" y1="13" x2="8" y2="13"/>
              <line x1="16" y1="17" x2="8" y2="17"/>
              <polyline points="10 9 9 9 8 9"/>
            </svg>
          )
        },
        {
          id: 'eligibility',
          label: 'Eligibility Calculator',
          countLabel: 'AI Gap Analysis',
          badge: 'Resume Sync',
          description: 'Simulate CGPA cutoffs, manage backlogs, upload PDF resume, and evaluate drive matches.',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2"/>
              <line x1="8" y1="6" x2="16" y2="6"/>
              <line x1="16" y1="14" x2="16" y2="14"/>
              <line x1="8" y1="14" x2="8" y2="14"/>
              <line x1="12" y1="14" x2="12" y2="14"/>
              <line x1="8" y1="18" x2="8" y2="18"/>
              <line x1="12" y1="18" x2="12" y2="18"/>
              <line x1="16" y1="18" x2="16" y2="18"/>
            </svg>
          )
        }
      ]
    }

    if (user.role === 'RECRUITER') {
      return [
        {
          id: 'pipeline',
          label: 'Applicant Funnel',
          countLabel: `${applicationsCount} Applicants`,
          badge: 'Screening',
          description: 'Review candidate applications, examine verified profiles, and update candidate stages.',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
            </svg>
          )
        },
        {
          id: 'post-job',
          label: '+ Post New Opening',
          countLabel: `${jobsCount} Drives Active`,
          badge: 'Publish',
          description: 'Configure compensation packages, department eligibility cutoffs, and launch campus drives.',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="8" x2="12" y2="16"/>
              <line x1="8" y1="12" x2="16" y2="12"/>
            </svg>
          )
        },
        {
          id: 'schedule',
          label: 'Interview Schedules',
          countLabel: `${interviewsCount} Scheduled`,
          badge: 'Calendar',
          description: 'Schedule technical, managerial, and HR rounds with candidate meeting invites.',
          icon: (
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
              <line x1="16" y1="2" x2="16" y2="6"/>
              <line x1="8" y1="2" x2="8" y2="6"/>
              <line x1="3" y1="10" x2="21" y2="10"/>
            </svg>
          )
        }
      ]
    }

    // ADMIN
    return [
      {
        id: 'overview',
        label: 'Placement Cell Overview',
        countLabel: 'Institutional Metrics',
        badge: 'Executive',
        description: 'Aggregate placement percentages, tier-1 package averages, and company benchmarks.',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"/>
            <rect x="14" y="3" width="7" height="7"/>
            <rect x="14" y="14" width="7" height="7"/>
            <rect x="3" y="14" width="7" height="7"/>
          </svg>
        )
      },
      {
        id: 'approvals',
        label: 'Pending Approvals',
        countLabel: `${pendingCount} Items Pending`,
        badge: pendingCount > 0 ? 'Action Required' : 'All Clear',
        description: 'Review accreditation filings, employer documentation, and authorize upcoming drives.',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
            <path d="M9 12l2 2 4-4"/>
          </svg>
        )
      },
      {
        id: 'students-audit',
        label: 'Student Academic Audit',
        countLabel: `${studentsAuditCount} Profiles`,
        badge: 'Verification',
        description: 'Audit verified university transcripts, enforce single-offer rules, and review credentials.',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/>
            <circle cx="9" cy="7" r="4"/>
            <path d="M23 21v-2a4 4 0 0 0-3-3.87"/>
            <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
          </svg>
        )
      },
      {
        id: 'audit-logs',
        label: 'Institutional Audit Logs',
        countLabel: `${auditLogsCount} Logged Events`,
        badge: 'Security',
        description: 'Tamper-evident audit ledger tracking role assignments, offers, overrides, and changes.',
        icon: (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
            <polyline points="10 9 9 9 8 9"/>
          </svg>
        )
      }
    ]
  }, [user.role, jobsCount, applicationsCount, interviewsCount, pendingCount, studentsAuditCount, auditLogsCount])

  // Map roleCards to ThreeDCarouselItem format
  const carouselItems = useMemo<ThreeDCarouselItem[]>(() => {
    return roleCards.map((card) => ({
      id: card.id,
      label: card.label,
      description: card.description,
      countLabel: card.countLabel,
      badge: card.badge,
      icon: card.icon,
      onClick: () => onNavigateTab(card.id)
    }))
  }, [roleCards, onNavigateTab])

  // Merge live jobs companies with default hiring list
  const hiringCompanies = useMemo(() => {
    const list: HiringCompanyItem[] = [...DEFAULT_HIRING_COMPANIES]
    if (liveJobs && liveJobs.length > 0) {
      liveJobs.forEach((lj) => {
        if (lj.company && !list.some((c) => c.name.toLowerCase() === lj.company.toLowerCase())) {
          list.unshift({
            name: lj.company,
            streams: lj.allowedDepts && lj.allowedDepts.length > 0 ? lj.allowedDepts : ['CSE', 'ECE'],
            hiringRoles: lj.title || 'Campus Recruitment Drive',
            initials: lj.company.slice(0, 2).toUpperCase()
          })
        }
      })
    }
    return list
  }, [liveJobs])

  return (
    <div
      className="c2c-landing-page"
      style={{
        minHeight: '100svh',
        width: '100%',
        backgroundColor: '#F8FAFC',
        color: '#0F172A',
        display: 'flex',
        flexDirection: 'column',
        fontFamily: 'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, sans-serif',
        overflowX: 'hidden'
      }}
    >
      <style>{`
        @keyframes landingFadeIn {
          0% { opacity: 0; transform: translateY(14px); }
          100% { opacity: 1; transform: translateY(0); }
        }

        @keyframes marqueeLoop {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }

        .landing-fade {
          animation: landingFadeIn 350ms cubic-bezier(0.16, 1, 0.3, 1) both;
        }

        /* Marquee Strip */
        .c2c-marquee-container {
          overflow: hidden;
          position: relative;
          width: 100%;
          padding: 8px 0;
          mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
          -webkit-mask-image: linear-gradient(to right, transparent 0%, black 6%, black 94%, transparent 100%);
        }

        .c2c-marquee-track {
          display: flex;
          gap: 14px;
          width: max-content;
          animation: marqueeLoop 36s linear infinite;
        }

        .c2c-marquee-track:hover {
          animation-play-state: paused;
        }

        .c2c-company-pill {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          padding: 9px 16px;
          background: #FFFFFF;
          border: 1px solid #E2E8F0;
          border-radius: 12px;
          box-shadow: 0 1px 3px rgba(15, 23, 42, 0.04);
          transition: transform 0.15s ease, border-color 0.15s ease, box-shadow 0.15s ease;
          white-space: nowrap;
          cursor: pointer;
        }

        .c2c-company-pill:hover {
          transform: translateY(-2px);
          border-color: #0F172A;
          box-shadow: 0 4px 12px rgba(15, 23, 42, 0.08);
        }
      `}</style>

      {/* Top Header Bar */}
      <header
        style={{
          height: '64px',
          borderBottom: '1px solid #E2E8F0',
          backgroundColor: '#FFFFFF',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          position: 'sticky',
          top: 0,
          zIndex: 40
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: '#0F172A',
              color: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: '800',
              fontSize: '13px',
              letterSpacing: '-0.02em'
            }}
          >
            C2C
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: '800', letterSpacing: '-0.02em', fontFamily: 'Outfit, Inter, sans-serif', color: '#0F172A' }}>
              C2C Placement System
            </div>
            <div style={{ fontSize: '11px', color: '#64748B', fontWeight: '500' }}>
              Campus To Career Gateway
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: '700',
              letterSpacing: '0.04em',
              backgroundColor: '#F1F5F9',
              color: '#0F172A',
              border: '1px solid #E2E8F0'
            }}
          >
            <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#0F172A' }} />
            {user.role}
          </div>

          <button
            onClick={onSignOut}
            className="outline-btn"
            style={{
              padding: '6px 14px',
              fontSize: '12px',
              fontWeight: '600',
              borderRadius: '8px',
              border: '1px solid #CBD5E1',
              color: '#0F172A',
              backgroundColor: '#FFFFFF'
            }}
            title="Sign out of current session"
          >
            Sign Out
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main
        style={{
          flex: 1,
          maxWidth: '1140px',
          width: '100%',
          margin: '0 auto',
          padding: '36px 24px 50px 24px',
          display: 'flex',
          flexDirection: 'column',
          gap: '36px'
        }}
      >
        {/* 1. Greeting Section */}
        <section className="landing-fade" style={{ textAlign: 'center', maxWidth: '720px', margin: '0 auto' }}>
          <h1
            style={{
              fontSize: 'clamp(26px, 4vw, 36px)',
              fontWeight: '800',
              lineHeight: 1.2,
              margin: 0,
              letterSpacing: '-0.03em',
              fontFamily: 'Outfit, Inter, sans-serif',
              color: '#0F172A'
            }}
          >
            Welcome, {displayName}! Where to today?
          </h1>
        </section>

        {/* 2. Role-Based 3D Cylinder Carousel of Navigation Boxes */}
        <section
          className="landing-fade"
          style={{ position: 'relative', width: '100%' }}
          aria-label="Workflow destinations 3D cylinder carousel"
        >
          {/* 3D Cylinder Component */}
          <ThreeDCarousel
            items={carouselItems}
            onItemClick={(item) => onNavigateTab(item.id)}
            spinDuration={45}
            resumeDelay={1.8}
          />
        </section>

        {/* 3. "Companies Hiring Now" Sliding Strip */}
        <section className="landing-fade">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '14px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: '800', margin: 0, letterSpacing: '-0.02em', fontFamily: 'Outfit, Inter, sans-serif', color: '#0F172A' }}>
              Companies Actively Hiring
            </h2>
          </div>

          {/* Continuous Loop Strip */}
          <div className="c2c-marquee-container" aria-label="Companies actively hiring marquee">
            <div className="c2c-marquee-track">
              {/* Render twice for continuous seamless loop */}
              {[...hiringCompanies, ...hiringCompanies].map((comp, idx) => (
                <div
                  key={`${comp.name}-${idx}`}
                  className="c2c-company-pill"
                  onClick={() => onNavigateTab(user.role === 'STUDENT' ? 'drives' : user.role === 'RECRUITER' ? 'pipeline' : 'overview')}
                  title={`View opportunities at ${comp.name}`}
                >
                  {/* Initials Badge */}
                  <div
                    style={{
                      width: '30px',
                      height: '30px',
                      borderRadius: '8px',
                      backgroundColor: '#0F172A',
                      color: '#FFFFFF',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontWeight: '800',
                      fontSize: '11px',
                      flexShrink: 0
                    }}
                  >
                    {comp.initials}
                  </div>

                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: '#0F172A' }}>
                      {comp.name}
                    </div>
                    <div style={{ fontSize: '11px', color: '#64748B', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '1px' }}>
                      <span>{comp.hiringRoles}</span>
                      <span>&bull;</span>
                      <span style={{ display: 'inline-flex', gap: '4px' }}>
                        {comp.streams.map((s) => (
                          <span
                            key={s}
                            style={{
                              fontSize: '9px',
                              fontWeight: '700',
                              padding: '1px 5px',
                              borderRadius: '4px',
                              backgroundColor: '#F1F5F9',
                              color: '#475569',
                              border: '1px solid #E2E8F0'
                            }}
                          >
                            {s}
                          </span>
                        ))}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
    </div>
  )
}
