import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Header from "./components/Header"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "AsyncAPI Metrics Dashboard",
  description: "AsyncAPI Metrics Dashboard",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="mx-auto w-full max-w-screen-2xl px-4 sm:px-6 lg:px-16">
          <Header />
          {children}
        </div>
      </body>
    </html>
  )
}
