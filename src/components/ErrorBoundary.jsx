import { Component } from 'react'

export default class ErrorBoundary extends Component {
  state = { error: null }

  static getDerivedStateFromError(error) {
    return { error }
  }

  render() {
    if (this.state.error) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-[#F4F5F7] p-6">
          <div className="bg-white rounded-2xl border border-red-200 shadow p-8 max-w-lg w-full">
            <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center mb-4">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
            </div>
            <h2 className="text-lg font-bold text-slate-800 mb-2">Something went wrong</h2>
            <p className="text-sm text-slate-500 mb-4">{this.state.error?.message || 'An unexpected error occurred.'}</p>
            <pre className="text-xs bg-slate-50 border rounded p-3 overflow-auto max-h-40 text-red-600 mb-4">
              {this.state.error?.stack}
            </pre>
            <button
              onClick={() => { this.setState({ error: null }); window.location.reload() }}
              className="btn-primary"
            >
              Reload page
            </button>
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
