import React from 'react'
import { ApplicationStatus } from '../../types'
import { Badge } from './Badge'

export const StatusBadge: React.FC<{ status: ApplicationStatus | string }> = ({ status }) => {
  switch (status) {
    case 'APPLIED':
      return <Badge variant="info">Applied</Badge>
    case 'UNDER_REVIEW':
      return <Badge variant="warning">Under Review</Badge>
    case 'SHORTLISTED':
      return <Badge variant="purple">Shortlisted</Badge>
    case 'INTERVIEW_SCHEDULED':
      return <Badge variant="purple">Interview Scheduled</Badge>
    case 'SELECTED':
      return <Badge variant="success">Selected / Offered</Badge>
    case 'REJECTED':
      return <Badge variant="danger">Not Selected</Badge>
    case 'WITHDRAWN':
      return <Badge variant="default">Withdrawn</Badge>
    default:
      return <Badge variant="default">{status}</Badge>
  }
}
