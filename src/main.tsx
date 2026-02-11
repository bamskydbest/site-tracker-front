import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { RouterProvider } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.js'
import { SocketProvider } from './context/SocketContext.js'
import { VisitProvider } from './context/VisitContext.js'
import router from './router/index.js'
import './index.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <SocketProvider>
        <VisitProvider>
          <RouterProvider router={router} />
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: { borderRadius: '8px', fontSize: '14px' },
            }}
          />
        </VisitProvider>
      </SocketProvider>
    </AuthProvider>
  </StrictMode>,
)
