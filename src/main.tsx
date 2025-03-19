import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

// Initialize environment variables from public/env-config.js
declare global {
  interface Window {
    _env_: Record<string, string>;
  }
}

// Make environment variables available to Vite's import.meta.env
if (typeof window !== 'undefined' && window._env_) {
  Object.keys(window._env_).forEach(key => {
    // @ts-ignore - Dynamically adding to import.meta.env
    import.meta.env[key] = window._env_[key];
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
