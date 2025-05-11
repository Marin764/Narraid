import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import Sidebar from "@/components/sidebar"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "NarrAid",
  description: "语言学习应用",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <div className="flex min-h-screen bg-[#f0f9fa]">
          <Sidebar />
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  )
}
