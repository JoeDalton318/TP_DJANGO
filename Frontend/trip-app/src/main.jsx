import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

console.log('🔄 main.jsx loading...');

const rootElement = document.getElementById('root');
console.log('📍 Root element:', rootElement);

if (rootElement) {
  const root = createRoot(rootElement);
  console.log('✅ Root created, rendering App...');
  
  root.render(
    <StrictMode>
      <App />
    </StrictMode>
  );
  
  console.log('✅ App rendered');
} else {
  console.error('❌ Root element not found!');
}
