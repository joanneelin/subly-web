import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Subly — Campus Subletting',
  description: 'Find and list sublets with other students at your university.',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
