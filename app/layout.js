import './globals.css'
import { Providers } from './providers'
import { ThemeProvider } from './theme-provider'
import { Toaster } from 'sonner'
import { GeistSans } from 'geist/font/sans'
import { GeistMono } from 'geist/font/mono'

export const metadata = {
  title: 'IntelliAsset — AI-Powered Asset Management',
  description: 'Enterprise asset management platform with AI Copilot & Predictive Maintenance',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${GeistSans.variable} ${GeistMono.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{__html:`window.addEventListener("error",function(e){if(e.error instanceof DOMException&&e.error.name==="DataCloneError"&&e.message&&e.message.includes("PerformanceServerTiming")){e.stopImmediatePropagation();e.preventDefault()}},true);`}} />
      </head>
      <body className="bg-background text-foreground antialiased font-sans">
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <Providers>{children}</Providers>
          <Toaster theme="dark" position="top-right" richColors />
        </ThemeProvider>
      </body>
    </html>
  )
}