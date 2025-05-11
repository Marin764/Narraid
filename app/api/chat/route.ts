import { NextRequest, NextResponse } from 'next/server';

const BAILIAN_API_KEY = process.env.YUNBAILIAN_API_KEY;
const BAILIAN_API_URL = 'https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions';

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const response = await fetch(BAILIAN_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${BAILIAN_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'qwen-max',
        messages: messages,
        temperature: 0.7,
        max_tokens: 1500,
      }),
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error?.message || '对话请求失败');
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('对话错误:', error);
    return NextResponse.json(
      { error: '服务器内部错误' },
      { status: 500 }
    );
  }
} 