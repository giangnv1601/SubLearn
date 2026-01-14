import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import {  BrowserRouter } from "react-router"
import { Toaster } from "sonner"
import { AuthProvider } from '@/contexts'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Toaster richColors />
        <App />
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
)