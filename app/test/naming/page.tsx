"use client"
import Image from "next/image"
import { Mic, User } from "lucide-react"

export default function NamingTest() {
  return (
    <div>
      <div className="p-4 text-center border-b">
        <h1 className="text-2xl font-bold text-[#00a0a0]">命名测试</h1>
      </div>

      <div className="p-8">
        <div className="flex items-start mb-8">
          <div className="w-12 h-12 rounded-full bg-[#e6f7f8] flex items-center justify-center border-2 border-[#00a0a0] shrink-0">
            <span className="text-[#00a0a0] font-bold">AI</span>
          </div>

          <div className="ml-4 flex-1">
            <div className="relative w-full max-w-sm h-72 mb-4">
              <Image src="/images/mug.png" alt="测试图片" fill style={{ objectFit: "contain" }} />
            </div>

            <div className="ai-message">
              <div className="flex items-center">
                <Mic size={16} className="text-[#00a0a0] mr-2" />
                <span className="text-gray-400">......</span>
              </div>
              <div className="mt-2">这是什么？</div>
            </div>
          </div>
        </div>

        <div className="flex justify-end mb-8">
          <div className="user-message">
            <div className="flex items-center justify-end">
              <span className="text-gray-400">......</span>
              <Mic size={16} className="text-[#00a0a0] ml-2" />
            </div>
            <div className="mt-2">水杯</div>
          </div>

          <div className="ml-4">
            <div className="w-12 h-12 rounded-full bg-[#00a0a0] flex items-center justify-center text-white">
              <User size={24} />
            </div>
          </div>
        </div>

        <div className="text-sm text-gray-500 mb-8">我的，记录题录类型及训练频次，评估分数</div>

        <div className="mt-auto">
          <button className="mic-button">
            <Mic size={32} />
          </button>
        </div>
      </div>
    </div>
  )
}
