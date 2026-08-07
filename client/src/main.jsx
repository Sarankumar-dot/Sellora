import { StrictMode } from 'react'
import { QueryClientProvider } from '@tanstack/react-query'
import { MotionConfig } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { createRoot } from 'react-dom/client'
import App from '@/App.jsx'
import AnimatedToast from '@/animations/AnimatedToast.jsx'
import { queryClient } from '@/config/queryClient.js'
import { AuthProvider } from '@/context/AuthContext.jsx'
import '@/styles/index.css'

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <MotionConfig reducedMotion="user">
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <App />
          <Toaster position="top-right" toastOptions={{ duration: 4000 }}>
            {(toast) => <AnimatedToast toast={toast} />}
          </Toaster>
        </AuthProvider>
      </QueryClientProvider>
    </MotionConfig>
  </StrictMode>,
)
