/**
 * Application Entry Point
 * Mounts the React component tree to the DOM and enforces strict mode 
 * to catch potential lifecycle or hook issues during development.
 */
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';

import App from './App.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);