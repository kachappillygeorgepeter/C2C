import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  onReset?: () => void
}

interface State {
  hasError: boolean
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error caught by ErrorBoundary:', error, errorInfo)
  }

  public handleReset = () => {
    this.setState({ hasError: false, error: null })
    if (this.props.onReset) {
      this.props.onReset()
    } else {
      window.location.href = '/'
    }
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div
          style={{
            minHeight: '100svh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            backgroundColor: '#F8FAFC',
            color: '#0F172A',
            fontFamily: 'Inter, system-ui, sans-serif',
            textAlign: 'center'
          }}
        >
          <div
            style={{
              maxWidth: '480px',
              backgroundColor: '#FFFFFF',
              border: '1px solid #E2E8F0',
              borderRadius: '16px',
              padding: '32px 24px',
              boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.08)'
            }}
          >
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: '#FEE2E2',
                color: '#DC2626',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '22px',
                marginBottom: '16px'
              }}
            >
              ⚠
            </div>
            <h2
              style={{
                fontSize: '20px',
                fontWeight: '800',
                margin: '0 0 8px 0',
                color: '#0F172A',
                fontFamily: 'Outfit, Inter, sans-serif'
              }}
            >
              Something went wrong
            </h2>
            <p
              style={{
                fontSize: '13px',
                color: '#64748B',
                lineHeight: 1.5,
                margin: '0 0 20px 0'
              }}
            >
              {this.state.error?.message ||
                'An unexpected error occurred while rendering this page.'}
            </p>
            <button
              onClick={this.handleReset}
              style={{
                padding: '10px 20px',
                backgroundColor: '#0F172A',
                color: '#FFFFFF',
                border: 'none',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: '700',
                cursor: 'pointer',
                transition: 'transform 0.15s ease'
              }}
            >
              Return to Home Hub
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary
