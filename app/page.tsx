"use client"

import Link from "next/link"
import Image from "next/image"
import { useEffect, useState } from "react"

export default function Home() {
  const [imageHistory, setImageHistory] = useState<string[]>([])

  useEffect(() => {
    const savedImages = localStorage.getItem('generatedImages')
    if (savedImages) {
      setImageHistory(JSON.parse(savedImages))
    }
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-center text-2xl font-bold text-[#00a0a0] mb-8">NarrAid</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        <Link href="/exercise/naming" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">命名练习</span>
        </Link>

        <Link href="/exercise/retelling" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">复述练习</span>
        </Link>

        <Link href="/exercise/expansion" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">扩句练习</span>
        </Link>

        <Link href="/exercise/description" className="exercise-card p-8 flex items-center justify-center h-64">
          <span className="text-2xl text-[#00a0a0] font-medium">看图说话</span>
        </Link>
      </div>

      <h2 className="text-center text-2xl font-bold text-[#00a0a0] mb-8">生成图片历史</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {imageHistory.length > 0 ? (
          imageHistory.map((imageUrl, index) => (
            <div key={index} className="history-card">
              <Image 
                src={imageUrl} 
                alt={`生成图片 ${index + 1}`} 
                width={400} 
                height={300} 
                className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
              />
            </div>
          ))
        ) : (
          <div className="col-span-full text-center text-gray-500">
            暂无生成图片历史记录
          </div>
        )}
      </div>
    </div>
  )
}
