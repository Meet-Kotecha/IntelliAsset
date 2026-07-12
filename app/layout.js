import './globals.css'
import { Providers } from './providers'
import { Toaster } from 'sonner'
import { GeistSans } from 'geist/font/sans'   // ← Add this
import { GeistMono } from 'geist/font/mono'   // ← Add this (optional)

export const metadata = {
  title: 'IntelliAsset — AI-Powered Asset Management',
  description: 'Enterprise asset management platform with AI Copilot & Predictive Maintenance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable} dark`}>
      <head>
        <script dangerouslySetInnerHTML={{__html:`window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);`}} />
      </head>
      <body className="bg-background text-foreground antialiased font-sans">
        <Providers>{children}</Providers>
        <Toaster theme="dark" position="top-right" richColors />
      </body>
    </html>
  )
}