import {ErrorInfo, memo, PureComponent, ReactNode} from 'react'

interface ErrorBoundaryProps {
  errorEl?: ReactNode
  onError?(): void
  children?: ReactNode
}

interface ErrorBoundaryState {
  error?: Error
  errorInfo?: ErrorInfo
}

class ErrorBoundary extends PureComponent<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props)
    this.setState({error: undefined, errorInfo: undefined})
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    this.setState({
      error,
      errorInfo,
    })
  }

  render() {
    if (this.state.errorInfo) {
      return (
        <div>
          <h2>Something went wrong.</h2>
          <details style={{whiteSpace: 'pre-wrap'}}>
            {this.state.error && this.state.error.toString()}
            <br />
            {this.state.errorInfo.componentStack}
          </details>
        </div>
      )
    }
    return this.props.children
  }
}

export default memo(ErrorBoundary)
