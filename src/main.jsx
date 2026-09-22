import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import './index.css'
import App from './App.jsx'
import { TeamsProvider } from './context/TeamsProvider'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <TeamsProvider>
        <App />
      </TeamsProvider>
    </BrowserRouter>
  </StrictMode>,
)