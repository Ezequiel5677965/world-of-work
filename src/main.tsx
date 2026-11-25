import React from 'react';
import ReactDOM from 'react-dom/client';
import { App } from './App';
import './style.css';

// Registrar Service Worker para PWA instalable
if ('serviceWorker' in navigator && !window.location.host.startsWith('localhost:')) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').catch((err) => {
      console.log('SW registration error:', err);
    });
  });
}

const rootElement = document.getElementById('root');

if (!rootElement) {
  throw new Error('Elemento root no encontrado en el DOM');
}

ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
