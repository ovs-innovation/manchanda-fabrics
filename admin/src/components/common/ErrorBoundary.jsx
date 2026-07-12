import React, { Component } from "react";
import { FiAlertCircle, FiRefreshCw } from "react-icons/fi";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an uncaught exception:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-6">
          <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-2xl shadow-xl border border-gray-100 dark:border-gray-700/55 p-8 text-center">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-red-50 dark:bg-red-950/30 text-red-500 dark:text-red-400 rounded-full">
                <FiAlertCircle className="w-12 h-12" />
              </div>
            </div>
            
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-2">
              Something went wrong
            </h1>
            
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-8 font-light">
              We encountered an unexpected error while loading this page. Please try reloading.
            </p>

            <button
              onClick={this.handleReload}
              className="w-full inline-flex items-center justify-center gap-2 px-6 py-3 bg-store-600 hover:bg-store-700 text-white rounded-xl text-sm font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-store-500 focus:ring-offset-2"
            >
              <FiRefreshCw className="w-4 h-4 animate-spin-hover" />
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
