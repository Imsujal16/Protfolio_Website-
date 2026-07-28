import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Force manual scroll restoration, scroll to top, and home URL reset on module load
if (typeof window !== 'undefined') {
  if ('scrollRestoration' in window.history) {
    window.history.scrollRestoration = 'manual';
  }
  if (window.location.hash || window.location.pathname !== '/') {
    window.history.replaceState(null, '', '/');
  }
  window.scrollTo(0, 0);

  // Before unload: reset scroll position so Chrome/browser saves 0 as restored position
  window.addEventListener('beforeunload', () => {
    window.scrollTo(0, 0);
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)

