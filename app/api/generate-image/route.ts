import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    
    if (!prompt) {
      return NextResponse.json({ error: '提示词不能为空' }, { status: 400 })
    }

    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/generation', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.YUNBAILIAN_API_KEY}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'false'
      },
      body: JSON.stringify({
        model: 'wanx-v2',
        input: {
          prompt: prompt
        },
        parameters: {
          style: 'photographic',
          size: '1024*1024',
          n: 1,
          seed: Math.floor(Math.random() * 1000000)
        }
      })
    })

    if (!response.ok) {
      const error = await response.json()
      console.error('生成图片失败:', error)
      return NextResponse.json({ error: '生成图片失败' }, { status: 500 })
    }

    const data = await response.json()
    return NextResponse.json({ imageUrl: data.output.images[0].url })
  } catch (error) {
    console.error('生成图片错误:', error)
    return NextResponse.json({ error: '生成图片失败' }, { status: 500 })
  }
} 