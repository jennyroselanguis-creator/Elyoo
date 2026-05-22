import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: '' };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || 'Something went wrong' };
  }

  componentDidCatch(error, info) {
    console.error('App error:', error, info);
  }

  handleReset = () => {
    try {
      localStorage.removeItem('elyoo-local-products');
      Object.keys(localStorage).forEach((key) => {
        if (key.startsWith('elyoo-img-')) localStorage.removeItem(key);
      });
    } catch {
      /* ignore */
    }
    window.location.href = '/';
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="app-error-fallback">
          <h1>Something went wrong</h1>
          <p>{this.state.message}</p>
          <p className="app-error-hint">
            This can happen if product photos used too much browser storage. Try clearing
            local catalog data and reload.
          </p>
          <button type="button" className="btn btn-primary" onClick={this.handleReset}>
            Clear local products &amp; reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
