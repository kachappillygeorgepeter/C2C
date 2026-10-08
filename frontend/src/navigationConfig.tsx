import React from 'react'
import { UserRole } from './KexsioSignInCard'

export interface TabIconProps {
  width?: number
  height?: number
  className?: string
}

export interface TabConfig {
  id: string
  label: string
  badge?: string
  description?: string
  icon: (props?: TabIconProps) => React.ReactNode
}

export interface RoleNavigationConfig {
  defaultTabId: string
  tabs: TabConfig[]
}

export const ROLE_NAVIGATION_CONFIG: Record<UserRole, RoleNavigationConfig> = {
  STUDENT: {
    defaultTabId: 'drives',
    tabs: [
      {
        id: 'drives',
        label: 'Active Drives',
        badge: 'High Priority',
        description: 'Explore campus recruitment drives, verify criteria, and submit one-click applications.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
            <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
          </svg>
        )
      },
      {
        id: 'my-applications',
        label: 'My Applications',
        badge: 'Live Status',
        description: 'Monitor application status stages, shortlists, assessment invites, and schedules.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      },
      {
        id: 'eligibility',
        label: 'Eligibility Calculator',
        badge: 'Interactive',
        description: 'Simulate CGPA, backlogs & departmental qualification against tier-1 enterprise hiring bars.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="4" y="2" width="16" height="20" rx="2" />
            <line x1="8" y1="6" x2="16" y2="6" />
            <line x1="16" y1="14" x2="16" y2="14" />
            <line x1="8" y1="14" x2="8" y2="14" />
            <line x1="12" y1="14" x2="12" y2="14" />
            <line x1="8" y1="18" x2="8" y2="18" />
            <line x1="12" y1="18" x2="12" y2="18" />
            <line x1="16" y1="18" x2="16" y2="18" />
          </svg>
        )
      }
    ]
  },
  RECRUITER: {
    defaultTabId: 'pipeline',
    tabs: [
      {
        id: 'pipeline',
        label: 'Applicant Funnel',
        badge: 'Active Reviews',
        description: 'Screen candidate resumes, shortlist talent, advance pipeline stages, and update review decisions.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
          </svg>
        )
      },
      {
        id: 'post-job',
        label: 'Post New Opportunity',
        badge: 'Create Drive',
        description: 'Publish placement and internship openings with custom CGPA cutoffs and branch constraints.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="8" x2="12" y2="16" />
            <line x1="8" y1="12" x2="16" y2="12" />
          </svg>
        )
      },
      {
        id: 'schedule',
        label: 'Interview Calendar',
        badge: 'Rounds',
        description: 'Coordinate technical rounds, schedule video meetings, and communicate directly with candidates.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
            <line x1="16" y1="2" x2="16" y2="6" />
            <line x1="8" y1="2" x2="8" y2="6" />
            <line x1="3" y1="10" x2="21" y2="10" />
          </svg>
        )
      }
    ]
  },
  ADMIN: {
    defaultTabId: 'overview',
    tabs: [
      {
        id: 'overview',
        label: 'Placement Cell Overview',
        badge: 'Executive',
        description: 'Review institutional placement stats, company participation, package statistics, and drives.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" />
            <rect x="14" y="3" width="7" height="7" />
            <rect x="14" y="14" width="7" height="7" />
            <rect x="3" y="14" width="7" height="7" />
          </svg>
        )
      },
      {
        id: 'approvals',
        label: 'Pending Approvals',
        badge: 'Governance',
        description: 'Authenticate new recruiter registrations and scrutinize job postings prior to campus publishing.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
            <path d="M9 12l2 2 4-4" />
          </svg>
        )
      },
      {
        id: 'students-audit',
        label: 'Student Academic Audit',
        badge: 'Verification',
        description: 'Audit verified student profiles, check CGPA consistency, and inspect department certifications.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        )
      },
      {
        id: 'audit-logs',
        label: 'Institutional Audit Logs',
        badge: 'Compliance',
        description: 'Immutable timeline tracking system security events, role updates, and platform activity.',
        icon: ({ width = 18, height = 18 }: TabIconProps = {}) => (
          <svg width={width} height={height} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
            <polyline points="14 2 14 8 20 8" />
            <line x1="16" y1="13" x2="8" y2="13" />
            <line x1="16" y1="17" x2="8" y2="17" />
            <polyline points="10 9 9 9 8 9" />
          </svg>
        )
      }
    ]
  }
}

/**
 * Returns whether a given tab ID is valid for the specified user role.
 */
export function isValidTabForRole(role: UserRole, tabId: string | null | undefined): boolean {
  if (!tabId) return false
  const config = ROLE_NAVIGATION_CONFIG[role]
  if (!config) return false
  return config.tabs.some((t) => t.id === tabId)
}

/**
 * Returns the default tab ID for a role.
 */
export function getDefaultTabForRole(role: UserRole): string {
  const config = ROLE_NAVIGATION_CONFIG[role]
  return config ? config.defaultTabId : 'drives'
}

/**
 * Constructs the canonical portal URL for a given tab.
 */
export function getPortalTabUrl(tabId: string): string {
  return `/portal?tab=${encodeURIComponent(tabId)}`
}


