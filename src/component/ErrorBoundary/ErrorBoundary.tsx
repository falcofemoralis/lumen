import { Component, ErrorInfo, ReactNode } from 'react';
import { restartApp } from 'Util/Device';

import { ErrorDetails } from './ErrorDetails';

interface Props {
  children: ReactNode
  catchErrors: 'always' | 'dev' | 'prod' | 'never'
}

interface State {
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  state = { error: null, errorInfo: null };

  // To avoid unnecessary re-renders
  shouldComponentUpdate(nextProps: Readonly<Props>, nextState: Readonly<State>): boolean {
    const { error } = this.state;

    return nextState.error !== error;
  }

  // If an error in a child is encountered, this will run
  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Only set errors if enabled
    if (!this.isEnabled()) {
      return;
    }
    // Catch errors in any components below and re-render with error message
    this.setState({
      error,
      errorInfo,
    });

    // You can also log error messages to an error reporting service here
    // This is a great place to put BugSnag, Sentry, crashlytics, etc:
    // reportCrash(error)
  }

  // Reset the error back to null
  resetError = () => {
    // this.setState({ error: null, errorInfo: null });
    restartApp();
  };

  // Only enable if we're catching errors in the right environment
  isEnabled(): boolean {
    const { catchErrors } = this.props;

    return (
      catchErrors === 'always' ||
      (catchErrors === 'dev' && __DEV__) ||
      (catchErrors === 'prod' && !__DEV__)
    );
  }

  // Render an error UI if there's an error; otherwise, render children
  render() {
    const { error, errorInfo } = this.state;
    const { children } = this.props;

    return this.isEnabled() && error ? (
      <ErrorDetails
        onReset={ this.resetError }
        error={ error }
        errorInfo={ errorInfo }
      />
    ) : (
      children
    );
  }
}

export default ErrorBoundary;