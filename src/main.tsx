import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { HashRouter } from 'react-router'
import '@fontsource/playfair-display/cyrillic-400.css'
import '@fontsource/playfair-display/cyrillic-600.css'
import '@fontsource/playfair-display/cyrillic-700.css'
import '@fontsource/playfair-display/cyrillic-400-italic.css'
import '@fontsource/playfair-display/cyrillic-600-italic.css'
import '@fontsource/manrope/cyrillic-400.css'
import '@fontsource/manrope/cyrillic-500.css'
import '@fontsource/manrope/cyrillic-600.css'
import '@fontsource/manrope/cyrillic-700.css'
import './index.css'
import App from './App.tsx'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <HashRouter>
      <App />
    </HashRouter>
  </StrictMode>,
)
