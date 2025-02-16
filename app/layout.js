import './globals.css'

export const metadata = {
  title: 'Estate Planner',
  description: 'Personal property inventory management',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
