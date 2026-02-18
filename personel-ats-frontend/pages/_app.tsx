import '../styles/globals.css'
import 'react-day-picker/dist/style.css'
import type { AppProps } from 'next/app'
import React from 'react'
import { ToastProvider } from '../src/lib/ToastContext'
import { AuthProvider } from '../src/lib/AuthContext'
import { QueryProvider } from '../src/lib/QueryProvider'

export default function MyApp({ Component, pageProps }: AppProps) {
  return (
    <QueryProvider>
      <AuthProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </AuthProvider>
    </QueryProvider>
  )
}
