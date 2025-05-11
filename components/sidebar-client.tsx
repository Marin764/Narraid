"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, FileText, LineChart } from "lucide-react"

export default function SidebarClient() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/" && pathname === "/") return true
    if (path === "/test" && pathname.startsWith("/test")) return true
    if (path === "/profile" && pathname.startsWith("/profile")) return true
    return false
  }

  return (
    <div className="w-[92px] bg-[#00a0a0] text-white flex flex-col items-center">
      <div className="h-[92px]"></div>

      <Link
        href="/"
        className={`w-full py-6 flex flex-col items-center justify-center ${isActive("/") ? "bg-white text-[#00a0a0]" : ""}`}
      >
        <div
          className={`w-12 h-12 rounded-full ${isActive("/") ? "bg-[#00a0a0]" : "bg-white"} flex items-center justify-center`}
        >
          <Brain className={`w-6 h-6 ${isActive("/") ? "text-white" : "text-[#00a0a0]"}`} />
        </div>
        <span className="mt-2 text-sm">练习</span>
      </Link>

      <Link
        href="/test"
        className={`w-full py-6 flex flex-col items-center justify-center ${isActive("/test") ? "bg-white text-[#00a0a0]" : ""}`}
      >
        <div
          className={`w-12 h-12 rounded-full ${isActive("/test") ? "bg-[#00a0a0]" : "bg-white"} flex items-center justify-center`}
        >
          <FileText className={`w-6 h-6 ${isActive("/test") ? "text-white" : "text-[#00a0a0]"}`} />
        </div>
        <span className="mt-2 text-sm">测试</span>
      </Link>

      <Link
        href="/profile"
        className={`w-full py-6 flex flex-col items-center justify-center ${isActive("/profile") ? "bg-white text-[#00a0a0]" : ""}`}
      >
        <div
          className={`w-12 h-12 rounded-full ${isActive("/profile") ? "bg-[#00a0a0]" : "bg-white"} flex items-center justify-center`}
        >
          <LineChart className={`w-6 h-6 ${isActive("/profile") ? "text-white" : "text-[#00a0a0]"}`} />
        </div>
        <span className="mt-2 text-sm">我的</span>
      </Link>
    </div>
  )
}
