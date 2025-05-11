"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Mic, Image as ImageIcon } from "lucide-react"

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

export default function NamingExercise() {
  const [selectedImage, setSelectedImage] = useState("/images/cup1.png")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '这是什么？' }
  ])
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const generateImage = async (prompt: string) => {
    try {
      setIsGenerating(true)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      if (!response.ok) {
        throw new Error('生成图片失败')
      }

      const data = await response.json()
      if (data.imageUrl) {
        setSelectedImage(data.imageUrl)
      }
    } catch (error) {
      console.error('生成图片失败:', error)
      alert('生成图片失败，请重试')
    } finally {
      setIsGenerating(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus'
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.onstop = async () => {
        setIsProcessing(true)
        try {
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
          const formData = new FormData()
          formData.append('audio', audioBlob)

          // 调用语音识别API
          const response = await fetch('/api/speech', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            throw new Error('语音识别失败')
          }

          const data = await response.json()
          const text = data.text

          // 添加用户消息
          const newMessages: Message[] = [...messages, { role: 'user', content: text }]
          setMessages(newMessages)

          // 调用AI对话
          const chatResponse = await fetch('/api/chat', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              messages: newMessages
            }),
          })

          if (!chatResponse.ok) {
            throw new Error('对话请求失败')
          }

          const chatData = await chatResponse.json()
          const assistantMessage: Message = {
            role: 'assistant',
            content: chatData.choices[0].message.content
          }
          setMessages([...newMessages, assistantMessage])
        } catch (error) {
          console.error('处理失败:', error)
          alert('处理失败，请重试')
        } finally {
          setIsProcessing(false)
        }

        // 停止所有音轨
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop())
          streamRef.current = null
        }
      }

      mediaRecorder.start()
      setIsRecording(true)
    } catch (error) {
      console.error('无法访问麦克风:', error)
      alert('无法访问麦克风，请确保已授予权限')
    }
  }

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }

  return (
    <div className="min-h-screen">
      <div className="p-4 text-center border-b">
        <h1 className="text-2xl font-bold text-[#00a0a0]">NarrAid</h1>
        <div className="absolute top-4 right-4">
          <h2 className="text-xl font-medium text-[#00a0a0]">命名练习</h2>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        <div className="flex-1 p-8 flex flex-col items-center">
          <div className="relative w-full max-w-md h-96 mb-8">
            <Image src={selectedImage} alt="练习图片" fill style={{ objectFit: "contain" }} />
          </div>

          <div className="thumbnail-container">
            <div className="thumbnail active">
              <Image src="/images/cup1.png" alt="杯子1" width={100} height={100} style={{ objectFit: "cover" }} />
            </div>
            <div className="thumbnail">
              <Image src="/images/mug.png" alt="杯子2" width={100} height={100} style={{ objectFit: "cover" }} />
            </div>
            <div className="thumbnail">
              <Image src="/images/cup1.png" alt="杯子3" width={100} height={100} style={{ objectFit: "cover" }} />
            </div>
          </div>

          <button
            className={`mt-4 px-4 py-2 rounded-full flex items-center gap-2 ${
              isGenerating ? 'bg-gray-400' : 'bg-[#00a0a0] hover:bg-[#008080]'
            } text-white transition-colors`}
            onClick={() => {
              const lastUserMessage = messages.findLast(m => m.role === 'user')
              if (lastUserMessage) {
                generateImage(lastUserMessage.content)
              }
            }}
            disabled={isGenerating}
          >
            <ImageIcon size={20} />
            {isGenerating ? '生成中...' : '生成图片'}
          </button>
        </div>

        <div className="flex-1 p-8 bg-white rounded-tl-3xl flex flex-col">
          <div className="flex-1 overflow-y-auto mb-4">
            {messages.map((message, index) => (
              <div key={index} className={`flex items-center mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                {message.role === 'assistant' && (
                  <div className="w-12 h-12 rounded-full bg-[#e6f7f8] flex items-center justify-center border-2 border-[#00a0a0]">
                    <span className="text-[#00a0a0] font-bold">AI</span>
                  </div>
                )}
                <div className={`message ml-2 ${message.role === 'user' ? 'user-message' : 'ai-message'}`}>
                  <div className="flex items-center">
                    <Mic size={16} className="text-[#00a0a0] mr-2" />
                    <span className="text-gray-400">......</span>
                  </div>
                  <div className="mt-2">{message.content}</div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>

          <div className="flex justify-center">
            <button 
              className={`mic-button ${isRecording ? 'bg-red-500' : ''} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
              onMouseDown={startRecording}
              onMouseUp={stopRecording}
              onMouseLeave={stopRecording}
              disabled={isProcessing}
            >
              <Mic size={32} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
