import React, { useMemo } from 'react'
import { UserSession } from './api'
import { ThreeDCarousel, ThreeDCarouselItem } from '@/components/ui/3d-carousel'
import { ROLE_NAVIGATION_CONFIG } from './navigationConfig'
import Footer from './Footer'

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

  // Helper to dynamically attach live counts based on tab id & role
  const getTabCountLabel = (tabId: string): string => {
    switch (tabId) {
      case 'drives':
        return `${jobsCount} Openings`
      case 'my-applications':
        return `${applicationsCount} Tracked`
      case 'eligibility':
        return 'AI Gap Analysis'
      case 'pipeline':
        return `${applicationsCount} Applicants`
      case 'post-job':
        return `${jobsCount} Drives Active`
      case 'schedule':
        return `${interviewsCount} Scheduled`
      case 'overview':
        return 'Institutional Metrics'
      case 'approvals':
        return `${pendingCount} Items Pending`
      case 'students-audit':
        return `${studentsAuditCount} Profiles`
      case 'audit-logs':
        return `${auditLogsCount} Logged Events`
      default:
        return 'View Details'
    }
  }

  // Derive cards from shared navigation config per role
  const roleCards = useMemo<NavCardItem[]>(() => {
    const config = ROLE_NAVIGATION_CONFIG[user.role]
    const tabList = config ? config.tabs : []

    return tabList.map((tab) => ({
      id: tab.id,
      label: tab.label,
      description: tab.description || '',
      badge: tab.badge,
      countLabel: getTabCountLabel(tab.id),
      icon: tab.icon({ width: 22, height: 22 })
    }))
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

      {/* Universal Footer */}
      <Footer />
    </div>
  )
}
