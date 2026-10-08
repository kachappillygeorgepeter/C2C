import React from 'react'
import { Link } from 'react-router-dom'
import { tokenStorage } from './api'

export default function Footer() {
  const currentYear = new Date().getFullYear()
  const hasSession = !!tokenStorage.get()

  return (
    <footer
      role="contentinfo"
      aria-label="Campus To Career Footer"
      className="c2c-universal-footer"
      style={{
        backgroundColor: '#0F172A',
        color: '#FFFFFF',
        width: '100%',
        flexShrink: 0,
        position: 'relative',
        fontFamily: 'Inter, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif'
      }}
    >
      <style>{`
        .c2c-universal-footer a {
          color: #FFFFFF !important;
          text-decoration: none;
          transition: opacity 0.15s ease;
        }
        .c2c-universal-footer a:hover {
          text-decoration: underline;
          opacity: 0.85;
        }
        .c2c-universal-footer a:focus-visible {
          outline: 2px solid #FFFFFF;
          outline-offset: 3px;
          border-radius: 4px;
        }
        @media (max-width: 640px) {
          .c2c-footer-grid {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '20px 24px 14px 24px'
        }}
      >
        {/* Main grid */}
        <div
          className="c2c-footer-grid"
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '20px',
            alignItems: 'start'
          }}
        >
          {/* Brand */}
          <div>
            <div
              style={{
                fontSize: '15px',
                fontWeight: '800',
                color: '#FFFFFF',
                fontFamily: 'Outfit, Inter, sans-serif',
                letterSpacing: '-0.02em',
                marginBottom: '6px'
              }}
            >
              C2C – Campus To Career
            </div>
            <p
              style={{
                fontSize: '12px',
                lineHeight: 1.5,
                color: 'rgba(255,255,255,0.65)',
                margin: 0,
                maxWidth: '280px'
              }}
            >
              Unified campus placement ecosystem connecting students, recruiters, and placement officers.
            </p>
          </div>

          {/* Quick Links */}
          <nav aria-label="Footer Quick Links">
            <div
              style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '8px'
              }}
            >
              Quick Links
            </div>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {hasSession ? (
                <>
                  <li>
                    <Link to="/landing" style={{ fontSize: '13px', fontWeight: '500' }}>Home Hub</Link>
                  </li>
                  <li>
                    <Link to="/portal" style={{ fontSize: '13px', fontWeight: '500' }}>Portal Dashboard</Link>
                  </li>
                </>
              ) : (
                <li>
                  <Link to="/login" style={{ fontSize: '13px', fontWeight: '500' }}>Sign In</Link>
                </li>
              )}
            </ul>
          </nav>

          {/* Contact */}
          <div>
            <div
              style={{
                fontSize: '10px',
                fontWeight: '700',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                color: 'rgba(255,255,255,0.5)',
                marginBottom: '8px'
              }}
            >
              Contact
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '13px' }}>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.55)', marginRight: '4px' }}>Email:</span>
                <a href="mailto:helpdesk@example.in" style={{ fontWeight: '500' }}>helpdesk@example.in</a>
              </div>
              <div>
                <span style={{ color: 'rgba(255,255,255,0.55)', marginRight: '4px' }}>Location:</span>
                <span style={{ fontWeight: '500' }}>Vellore, TN</span>
              </div>
            </div>
          </div>
        </div>

        {/* Divider */}
        <hr
          style={{
            border: 'none',
            borderTop: '1px solid rgba(255,255,255,0.12)',
            margin: '14px 0 10px 0'
          }}
        />

        {/* Bottom bar */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '8px',
            fontSize: '11px',
            color: 'rgba(255,255,255,0.55)'
          }}
        >
          <div>© {currentYear} C2C – Campus To Career. All rights reserved.</div>
          <div style={{ fontWeight: '600', color: 'rgba(255,255,255,0.75)' }}>Made by George Peter</div>
        </div>
      </div>
    </footer>
  )
}
