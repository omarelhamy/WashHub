import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './lib/i18n'
import './index.css'
import App from './App.tsx'

import { setRtl } from './lib/i18n'
import { initTheme } from './lib/theme'
setRtl(localStorage.getItem('lang') || 'en')
initTheme()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
