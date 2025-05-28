"use client"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Brain, LineChart } from "lucide-react"

export default function SidebarClient() {
  const pathname = usePathname()

  const isActive = (path: string) => {
    if (path === "/exercise/naming" && pathname.startsWith("/exercise")) return true
    if (path === "/profile" && pathname.startsWith("/profile")) return true
    return false
  }

  return (
    <div className="w-[92px] bg-[#00a0a0] text-white flex flex-col items-center">
      <div className="h-[92px]"></div>

      <Link
        href="/exercise/naming"
        className={`w-full py-6 flex flex-col items-center justify-center ${isActive("/exercise/naming") ? "bg-white text-[#00a0a0]" : ""}`}
      >
        <div
          className={`w-12 h-12 rounded-full ${isActive("/exercise/naming") ? "bg-[#00a0a0]" : "bg-white"} flex items-center justify-center`}
        >
          <Brain className={`w-6 h-6 ${isActive("/exercise/naming") ? "text-white" : "text-[#00a0a0]"}`} />
        </div>
        <span className="mt-2 text-sm">练习</span>
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
        <span className="mt-2 text-sm">统计</span>
      </Link>
    </div>
  )
}
