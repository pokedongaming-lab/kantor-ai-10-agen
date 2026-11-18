/**
 * GlbErrorBoundary.tsx
 *
 * React ErrorBoundary that wraps GLB character loading.
 * On error: logs a warning and renders the fallback (primitive character).
 * The app never crashes due to a failed GLB load.
 */

import { Component, type ErrorInfo, type ReactNode } from 'react';

interface Props {
  children: ReactNode;
  /** Rendered when GLB loading throws. Defaults to a simple status message. */
  fallback?: ReactNode;
  /** Agent key — used to build a helpful log message. */
  agentKey?: string;
}

interface State {
  hasError: boolean;
  errorMessage: string;
}

export class GlbErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false, errorMessage: '' };
  }

  static getDerivedStateFromError(error: unknown): State {
    const msg = error instanceof Error ? error.message : String(error);
    return { hasError: true, errorMessage: msg };
  }

  componentDidCatch(error: unknown, info: ErrorInfo) {
    const agentLabel = this.props.agentKey ? `[${this.props.agentKey}]` : '[GLB]';
    console.warn(
      `${agentLabel} GLB character failed to load — falling back to primitive geometry.`,
      error,
      info.componentStack,
    );
  }

  render() {
    if (this.state.hasError) {
      if (this.props.fallback !== undefined) {
        return this.props.fallback;
      }
      return (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            fontSize: '11px',
            color: '#888',
            opacity: 0.6,
          }}
          title={`GLB load failed: ${this.state.errorMessage}`}
        >
          {/* Primitive character placeholder (simple emoji stand-in) */}
          🧊
        </div>
      );
    }
    return this.props.children;
  }
}

export default GlbErrorBoundary;
