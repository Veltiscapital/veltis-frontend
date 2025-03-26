/**
 * Veltis Error Handler
 * This script helps catch and report errors in production
 */

(function() {
  // Store original console methods
  const originalConsoleError = console.error;
  const originalConsoleWarn = console.warn;
  
  // Error tracking state
  const errorState = {
    errors: [],
    warnings: [],
    maxErrors: 10,
    initialized: false,
    appStartTime: Date.now()
  };
  
  // Initialize error tracking
  function initErrorTracking() {
    if (errorState.initialized) return;
    
    // Override console.error
    console.error = function() {
      // Call original method
      originalConsoleError.apply(console, arguments);
      
      // Track error
      const errorMessage = Array.from(arguments).map(arg => {
        if (arg instanceof Error) {
          return `${arg.name}: ${arg.message}\n${arg.stack || ''}`;
        }
        return String(arg);
      }).join(' ');
      
      if (errorState.errors.length < errorState.maxErrors) {
        errorState.errors.push({
          message: errorMessage,
          timestamp: new Date().toISOString(),
          timeSinceLoad: Date.now() - errorState.appStartTime
        });
      }
    };
    
    // Override console.warn
    console.warn = function() {
      // Call original method
      originalConsoleWarn.apply(console, arguments);
      
      // Track warning
      const warningMessage = Array.from(arguments).map(arg => String(arg)).join(' ');
      
      if (errorState.warnings.length < errorState.maxErrors) {
        errorState.warnings.push({
          message: warningMessage,
          timestamp: new Date().toISOString(),
          timeSinceLoad: Date.now() - errorState.appStartTime
        });
      }
    };
    
    // Global error handler
    window.addEventListener('error', function(event) {
      const errorInfo = {
        message: event.message,
        source: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        stack: event.error ? event.error.stack : '',
        timestamp: new Date().toISOString(),
        timeSinceLoad: Date.now() - errorState.appStartTime
      };
      
      if (errorState.errors.length < errorState.maxErrors) {
        errorState.errors.push(errorInfo);
      }
      
      // Check if we should redirect to fallback
      checkFatalErrors();
    });
    
    // Unhandled promise rejection handler
    window.addEventListener('unhandledrejection', function(event) {
      const errorInfo = {
        message: event.reason instanceof Error ? event.reason.message : String(event.reason),
        stack: event.reason instanceof Error ? event.reason.stack : '',
        timestamp: new Date().toISOString(),
        timeSinceLoad: Date.now() - errorState.appStartTime
      };
      
      if (errorState.errors.length < errorState.maxErrors) {
        errorState.errors.push(errorInfo);
      }
      
      // Check if we should redirect to fallback
      checkFatalErrors();
    });
    
    errorState.initialized = true;
  }
  
  // Check if we should redirect to fallback page
  function checkFatalErrors() {
    // If we have multiple errors in the first few seconds, it might be a fatal issue
    const criticalStartupPeriod = 5000; // 5 seconds
    const timeSinceLoad = Date.now() - errorState.appStartTime;
    
    if (timeSinceLoad < criticalStartupPeriod && errorState.errors.length >= 3) {
      redirectToFallback();
    }
  }
  
  // Redirect to fallback page
  function redirectToFallback() {
    // Avoid redirect loops
    if (window.location.pathname === '/fallback.html') return;
    
    // Prepare error information
    const errorInfo = JSON.stringify({
      errors: errorState.errors,
      warnings: errorState.warnings,
      userAgent: navigator.userAgent,
      timestamp: new Date().toISOString()
    });
    
    // Redirect to fallback page with error information
    window.location.href = `/fallback.html?error=${encodeURIComponent(errorInfo)}`;
  }
  
  // Expose API
  window.VeltisErrorHandler = {
    getErrors: function() {
      return [...errorState.errors];
    },
    getWarnings: function() {
      return [...errorState.warnings];
    },
    redirectToFallback: redirectToFallback
  };
  
  // Initialize
  initErrorTracking();
})(); 