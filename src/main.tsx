import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Add error boundary and console logging
console.log('🚀 Starting Taste of India App...');

try {
  const rootElement = document.getElementById('root');
  if (!rootElement) {
    throw new Error('Root element not found!');
  }
  
  console.log('✅ Root element found, creating React root...');
  const root = createRoot(rootElement);
  
  console.log('✅ Rendering App component...');
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ App rendered successfully!');
} catch (error) {
  console.error('❌ Error rendering app:', error);
  
  // Fallback: render error message
  const rootElement = document.getElementById('root');
  if (rootElement) {
    rootElement.innerHTML = `
      <div style="padding: 20px; font-family: Arial, sans-serif; background: #f0f0f0; color: #333;">
        <h1>🍛 Taste of India</h1>
        <h2>Application Error</h2>
        <p>There was an error loading the application:</p>
        <pre style="background: #fff; padding: 10px; border-radius: 5px; overflow: auto;">${error.message}</pre>
        <button onclick="location.reload()" style="padding: 10px 20px; background: #532734; color: white; border: none; border-radius: 5px; cursor: pointer;">
          Reload Page
        </button>
      </div>
    `;
  }
}
