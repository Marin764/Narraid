"use client"

import { useState, useRef, useEffect } from "react"
import Image from "next/image"
import { Mic, Image as ImageIcon, User } from "lucide-react"

const APPID = '5b56efef'  // 讯飞开放平台的APPID

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

interface WordInfo {
  text: string;
  start: number;
  end: number;
  duration: number;
  interval_to_next: number;
}

interface Segment {
  text: string;
  start: number;
  end: number;
  words: WordInfo[];
}

interface IntervalAnalysis {
  text: string;
  avg_interval: number;
  std_interval: number;
}

interface TranscriptionResult {
  transcription: Segment[];
  interval_analysis: IntervalAnalysis[];
}

export default function NamingExercise() {
  const [selectedImage, setSelectedImage] = useState("/images/cup1.png")
  const [isRecording, setIsRecording] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)
  const [isGenerating, setIsGenerating] = useState(false)
  const [generatedImages, setGeneratedImages] = useState<string[]>([])
  const [messages, setMessages] = useState<Message[]>([
    { role: 'assistant', content: '这是什么？' }
  ])
  const [activeTab, setActiveTab] = useState<'practice' | 'history'>('practice')
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const audioChunksRef = useRef<Blob[]>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const streamRef = useRef<MediaStream | null>(null)

  // 从localStorage加载历史记录
  useEffect(() => {
    const savedMessages = localStorage.getItem('chatHistory')
    if (savedMessages) {
      setMessages(JSON.parse(savedMessages))
    }
  }, [])

  // 保存对话历史到localStorage
  useEffect(() => {
    if (messages.length > 1) { // 只有当有新消息时才保存
      localStorage.setItem('chatHistory', JSON.stringify(messages))
    }
  }, [messages])

  // 从localStorage加载生成的图片历史
  useEffect(() => {
    const savedImages = localStorage.getItem('generatedImages')
    if (savedImages) {
      setGeneratedImages(JSON.parse(savedImages))
    }
  }, [])

  // 保存生成的图片历史到localStorage
  useEffect(() => {
    if (generatedImages.length > 0) {
      localStorage.setItem('generatedImages', JSON.stringify(generatedImages))
    }
  }, [generatedImages])

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  // 刷新对话
  const refreshChat = () => {
    setMessages([{ role: 'assistant', content: '这是什么？' }])
    localStorage.removeItem('chatHistory')
  }

  // 校验prompt有效性
  function isValidPrompt(prompt: string) {
    if (!prompt) return false;
    if (prompt.trim().length < 2) return false;
    if (/^[\p{P}\p{S}\s]+$/u.test(prompt)) return false; // 纯标点或空格
    return true;
  }

  const generateImage = async (rawPrompt: string) => {
    // 回溯到最近一个有效prompt
    let prompt = rawPrompt;
    if (!isValidPrompt(prompt)) {
      const reversed = [...messages].reverse();
      prompt = reversed.find(m => m.role === 'user' && isValidPrompt(m.content))?.content || '';
    }
    if (!isValidPrompt(prompt)) {
      alert('没有可用的有效提示词，无法生成图片');
      return;
    }
    try {
      setIsGenerating(true)
      const response = await fetch('/api/generate-image', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt }),
      })

      const data = await response.json()
      if (!response.ok) {
        throw new Error(data.error || '生成图片失败')
      }

      if (data.imageUrl) {
        // 保存新生成的图片到历史记录
        setGeneratedImages(prev => {
          const newImages = [data.imageUrl, ...prev]
          if (newImages.length > 12) newImages.length = 12 // 最多保存12张
          return newImages
        })
        // 更新当前显示的图片
        setSelectedImage(data.imageUrl)
      }
    } catch (error: any) {
      console.error('生成图片失败:', error)
      alert('生成图片失败：' + (error?.message || '未知错误'))
    } finally {
      setIsGenerating(false)
    }
  }

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      
      // 使用 PCM 格式录制
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: 'audio/webm;codecs=opus',
        audioBitsPerSecond: 16000
      })
      mediaRecorderRef.current = mediaRecorder
      audioChunksRef.current = []

      mediaRecorder.ondataavailable = (event) => {
        console.log('收到音频数据:', event.data.size, 'bytes')
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data)
        }
      }

      mediaRecorder.start(100)
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

  // 添加useEffect来处理录音结束事件
  useEffect(() => {
    if (!isRecording && mediaRecorderRef.current) {
      const handleStop = async () => {
        setIsProcessing(true)
        try {
          await new Promise(resolve => setTimeout(resolve, 100))
          
          console.log('录音结束，收集到', audioChunksRef.current.length, '个音频块')
          const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm;codecs=opus' })
          console.log('音频Blob大小:', audioBlob.size, 'bytes')
          
          if (audioBlob.size === 0) {
            throw new Error('录音数据为空')
          }

          // 将音频转换为 PCM 格式
          const audioContext = new AudioContext({ sampleRate: 16000 })
          const arrayBuffer = await audioBlob.arrayBuffer()
          const audioBuffer = await audioContext.decodeAudioData(arrayBuffer)
          
          // 获取音频数据并转换为 Int16Array
          const pcmData = new Int16Array(audioBuffer.length)
          const channelData = audioBuffer.getChannelData(0)
          for (let i = 0; i < channelData.length; i++) {
            pcmData[i] = Math.max(-32768, Math.min(32767, Math.round(channelData[i] * 32767)))
          }

          // 创建 PCM 格式的 Blob
          const pcmBlob = new Blob([pcmData], { type: 'audio/L16;rate=16000' })
          
          const formData = new FormData()
          formData.append('audio', pcmBlob)

          console.log('开始发送语音识别请求...')
          const response = await fetch('/api/speech', {
            method: 'POST',
            body: formData,
          })

          if (!response.ok) {
            const errorData = await response.json()
            throw new Error(errorData.error || '语音识别失败')
          }

          const { wsUrl, audioData: base64Audio } = await response.json()
          console.log('收到WebSocket URL和音频数据')
          console.log('音频数据长度:', base64Audio.length)

          // 建立WebSocket连接
          const ws = new WebSocket(wsUrl)
          let result = ''
          let isCompleted = false

          await new Promise((resolve, reject) => {
            ws.onopen = () => {
              console.log('WebSocket连接已建立')
              const params = {
                common: {
                  app_id: APPID
                },
                business: {
                  language: "zh_cn",
                  domain: "iat",
                  accent: "mandarin",
                  sample_rate: "16000",
                  vad_eos: 5000,
                  dwa: "wpgs",
                  ptt: 1,
                  pcm: 1,
                  vinfo: 1,
                  nbest: 1,
                  wbest: 1,
                  pd: "speech",
                  rlang: "zh_cn"
                },
                data: {
                  status: 0,
                  format: "audio/L16;rate=16000",
                  encoding: "raw",
                  audio: base64Audio
                }
              }
              console.log('发送音频数据到讯飞服务器，参数:', JSON.stringify(params, null, 2))
              ws.send(JSON.stringify(params))

              setTimeout(() => {
                if (!isCompleted) {
                  const endParams = {
                    data: {
                      status: 2
                    }
                  }
                  console.log('发送结束标识')
                  ws.send(JSON.stringify(endParams))
                }
              }, 2000)
            }

            ws.onmessage = (event) => {
              console.log('收到讯飞服务器响应:', event.data)
              const response = JSON.parse(event.data)
              console.log('解析后的响应:', JSON.stringify(response, null, 2))
              
              if (response.code !== 0) {
                console.error('讯飞API错误:', response)
                ws.close()
                reject(new Error(`讯飞API错误: ${response.message}`))
                return
              }

              const resultData = response.data
              if (resultData && resultData.result) {
                console.log('收到识别结果:', JSON.stringify(resultData.result, null, 2))
                // 处理动态修正结果
                if (resultData.result.pgs === "rpl") {
                  // 替换之前的结果
                  const [start, end] = resultData.result.rg
                  result = result.split('').slice(0, start).join('') + 
                           resultData.result.ws.map((item: any) => 
                             item.cw.map((w: any) => w.w).join('')
                           ).join('') +
                           result.split('').slice(end).join('')
                } else if (resultData.result.ws && resultData.result.ws.length > 0) {
                  // 追加结果
                  const words = resultData.result.ws.map((item: any) => 
                    item.cw.map((w: any) => w.w).join('')
                  ).join('')
                  if (words) {
                    result += words
                  }
                }
                console.log('当前识别结果:', result)
              }

              if (response.data && response.data.status === 2) {
                console.log('语音识别完成')
                isCompleted = true
                ws.close()
                resolve(result)
              }
            }

            ws.onerror = (error) => {
              console.error('WebSocket错误:', error)
              reject(new Error('语音识别服务连接失败'))
            }

            ws.onclose = () => {
              console.log('WebSocket连接关闭，最终结果:', result)
              if (result) {
                resolve(result)
              } else if (!isCompleted) {
                reject(new Error('语音识别结果为空'))
              }
            }
          })

          if (!result) {
            throw new Error('语音识别结果为空')
          }

          console.log('语音识别成功，结果:', result)

          // 3. 立即显示文本到对话框
          const newMessages: Message[] = [...messages, { role: 'user', content: result }]
          setMessages(newMessages)

          // 4. 调用AI对话
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
          // 彻底清理
          mediaRecorderRef.current = null
          if (streamRef.current) {
            streamRef.current.getTracks().forEach(track => track.stop())
            streamRef.current = null
          }
        }
      }

      mediaRecorderRef.current.onstop = handleStop
    }
  }, [isRecording, messages])

  return (
    <div className="min-h-screen bg-[#f0f9fa]">
      <div className="p-4 text-center border-b bg-white">
        <h1 className="text-2xl font-bold text-[#00a0a0]">NarrAid</h1>
        <div className="absolute top-4 right-4">
          <div className="flex gap-4">
            <button
              onClick={() => setActiveTab('practice')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'practice'
                  ? 'bg-[#00a0a0] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              练习
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2 rounded-lg ${
                activeTab === 'history'
                  ? 'bg-[#00a0a0] text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              历史
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-col md:flex-row h-[calc(100vh-64px)]">
        <div className="flex-1 p-8 flex flex-col items-center bg-[#f0f9fa]">
          <div className="relative w-full max-w-md aspect-square mb-8">
            <Image 
              src={selectedImage} 
              alt="练习图片" 
              fill 
              style={{ objectFit: "contain" }} 
              className="rounded-lg"
            />
          </div>

          <div className="flex gap-4 mb-8">
            <button
              onClick={() => generateImage(messages[messages.length - 2]?.content || '')}
              disabled={isGenerating}
              className="px-4 py-2 bg-[#00a0a0] text-white rounded-lg hover:bg-[#008080] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              <ImageIcon size={20} />
              {isGenerating ? '生成中...' : '生成图片'}
            </button>
            <button
              onClick={refreshChat}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/>
                <path d="M21 3v5h-5"/>
                <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"/>
                <path d="M8 16H3v5"/>
              </svg>
              刷新对话
            </button>
          </div>
        </div>

        <div className="flex-1 p-8 bg-white rounded-tl-3xl flex flex-col">
          {activeTab === 'practice' ? (
            <>
              <div className="flex-1 overflow-y-auto mb-4">
                {messages.map((message, index) => (
                  <div key={index} className={`flex items-center mb-4 ${message.role === 'user' ? 'justify-end' : ''}`}>
                    {message.role === 'assistant' && (
                      <div className="w-12 h-12 rounded-full bg-[#e6f7f8] flex items-center justify-center border-2 border-[#00a0a0] shrink-0">
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
                    {message.role === 'user' && (
                      <div className="w-12 h-12 rounded-full bg-[#00a0a0] flex items-center justify-center text-white ml-2 shrink-0">
                        <User size={24} />
                      </div>
                    )}
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="flex justify-center">
                <button 
                  className={`mic-button ${isRecording ? 'bg-red-500' : ''} ${isProcessing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  onClick={() => {
                    if (isRecording) {
                      stopRecording()
                    } else {
                      startRecording()
                    }
                  }}
                  disabled={isProcessing}
                >
                  <Mic size={32} />
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 overflow-y-auto">
              <div className="space-y-4">
                {generatedImages.map((image, index) => (
                  <div key={index} className="bg-white rounded-lg shadow-md overflow-hidden">
                    <div className="relative w-full aspect-square">
                      <Image
                        src={image}
                        alt={`历史图片 ${index + 1}`}
                        fill
                        style={{ objectFit: "contain" }}
                        className="rounded-lg"
                      />
                    </div>
                    <div className="p-4">
                      <p className="text-sm text-gray-500">
                        生成时间：{new Date().toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}