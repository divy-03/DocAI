import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false,
      error: null,
      errorInfo: null
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen bg-mocha-base dark:bg-mocha-base light:bg-latte-base flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-mocha-mantle dark:bg-mocha-mantle light:bg-latte-mantle rounded-xl shadow-lg p-8 text-center border border-mocha-surface0 dark:border-mocha-surface0 light:border-latte-surface0">
            <div className="text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-mocha-text dark:text-mocha-text light:text-latte-text mb-4">
              Oops! Something went wrong
            </h2>
            <p className="text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 mb-6">
              We're sorry for the inconvenience. Please try refreshing the page.
            </p>
            <button
              onClick={() => window.location.reload()}
              className="px-6 py-3 bg-mocha-mauve dark:bg-mocha-mauve light:bg-latte-mauve text-mocha-crust dark:text-mocha-crust light:text-latte-base rounded-lg hover:bg-mocha-lavender dark:hover:bg-mocha-lavender light:hover:bg-latte-lavender font-semibold transition duration-200"
            >
              Refresh Page
            </button>
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <details className="mt-6 text-left">
                <summary className="cursor-pointer text-sm text-mocha-subtext0 dark:text-mocha-subtext0 light:text-latte-subtext0 hover:text-mocha-text dark:hover:text-mocha-text light:hover:text-latte-text">
                  Error Details (Dev Only)
                </summary>
                <pre className="mt-2 p-4 bg-mocha-surface0 dark:bg-mocha-surface0 light:bg-latte-surface0 text-mocha-text dark:text-mocha-text light:text-latte-text rounded text-xs overflow-auto">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
