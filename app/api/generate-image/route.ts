import { NextResponse } from 'next/server'

async function pollImageResult(apiKey: string, taskId: string, maxTries = 20, interval = 2000) {
  const url = `https://dashscope.aliyuncs.com/api/v1/tasks/${taskId}`;
  for (let i = 0; i < maxTries; i++) {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    const data = await res.json();
    // 官方文档：output.task_status === 'SUCCEEDED'，results[0].url
    if (data.output && data.output.task_status === 'SUCCEEDED' && data.output.results && data.output.results[0]?.url) {
      return data.output.results[0].url;
    }
    if (data.output && data.output.task_status === 'FAILED') {
      throw new Error(data.output.message || '图片生成失败');
    }
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  throw new Error('图片生成超时，请稍后重试');
}

export async function POST(request: Request) {
  try {
    const { prompt } = await request.json()
    const apiKey = process.env.YUNBAILIAN_IMAGE_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'FLUX API Key 未配置' }, { status: 500 })
    }
    if (!prompt || typeof prompt !== 'string' || !prompt.trim()) {
      return NextResponse.json({ error: '提示词不能为空' }, { status: 400 })
    }

    // 1. 发起异步生图请求（官方推荐方式）
    const response = await fetch('https://dashscope.aliyuncs.com/api/v1/services/aigc/text2image/image-synthesis', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'X-DashScope-Async': 'enable'
      },
      body: JSON.stringify({
        model: 'flux-dev',
        input: {
          prompt: prompt
        },
        parameters: {
          size: '1024*1024'
        }
      })
    })

    const data = await response.json()
    if (!response.ok) {
      let errorMsg = data.message || data.error_msg || JSON.stringify(data)
      return NextResponse.json({ error: errorMsg }, { status: 500 })
    }
    if (!data.output || !data.output.task_id) {
      return NextResponse.json({ error: '未获取到task_id' }, { status: 500 })
    }

    // 2. 轮询获取图片结果（官方推荐方式）
    let imageUrl = ''
    try {
      imageUrl = await pollImageResult(apiKey, data.output.task_id)
    } catch (e: any) {
      return NextResponse.json({ error: e.message || '图片生成失败' }, { status: 500 })
    }
    if (!imageUrl) {
      return NextResponse.json({ error: '未获取到图片链接' }, { status: 500 })
    }
    return NextResponse.json({ imageUrl })
  } catch (error: any) {
    console.error('生成图片错误:', error)
    return NextResponse.json({ error: error?.message || '生成图片失败' }, { status: 500 })
  }
} 