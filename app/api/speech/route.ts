import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

const APPID = '5b56efef';
const APIKey = '39457bf7df9de04a6b3739b07e97ed38';
const APISecret = 'NThmZmQzNzljNGJmMjRhODdkOWRlODUz';

function getWebsocketUrl() {
  const url = 'wss://iat-api.xfyun.cn/v2/iat';
  const host = 'iat-api.xfyun.cn';
  const date = new Date().toUTCString();
  const algorithm = 'hmac-sha256';
  const headers = 'host date request-line';
  const signatureOrigin = `host: ${host}\ndate: ${date}\nGET /v2/iat HTTP/1.1`;
  const signatureSha = crypto.createHmac('sha256', APISecret).update(signatureOrigin).digest('base64');
  const authorizationOrigin = `api_key="${APIKey}", algorithm="${algorithm}", headers="${headers}", signature="${signatureSha}"`;
  const authorization = Buffer.from(authorizationOrigin).toString('base64');

  return `${url}?authorization=${authorization}&date=${encodeURIComponent(date)}&host=${host}`;
}

// 将WebM音频转换为PCM格式
async function convertWebmToPcm(audioBuffer: ArrayBuffer): Promise<Int16Array> {
  // 创建一个AudioContext
  const audioContext = new AudioContext({
    sampleRate: 16000  // 设置采样率为16kHz
  });

  // 解码音频数据
  const audioData = await audioContext.decodeAudioData(audioBuffer);
  
  // 获取音频通道数据
  const channelData = audioData.getChannelData(0);
  
  // 将Float32Array转换为Int16Array
  const pcmData = new Int16Array(channelData.length);
  for (let i = 0; i < channelData.length; i++) {
    // 将-1到1的浮点数转换为-32768到32767的整数
    pcmData[i] = Math.max(-32768, Math.min(32767, Math.round(channelData[i] * 32767)));
  }

  return pcmData;
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json({ error: '没有收到音频文件' }, { status: 400 });
    }

    console.log('收到音频文件:', {
      name: audioFile.name,
      type: audioFile.type,
      size: audioFile.size
    });

    // 将音频文件转换为ArrayBuffer
    const audioBuffer = await audioFile.arrayBuffer();
    console.log('音频ArrayBuffer大小:', audioBuffer.byteLength, 'bytes');
    
    // 将音频数据转换为Base64字符串
    const audioData = Buffer.from(audioBuffer).toString('base64');
    console.log('Base64音频数据长度:', audioData.length);

    // 获取WebSocket URL
    const wsUrl = getWebsocketUrl();
    console.log('生成的WebSocket URL:', wsUrl);

    // 返回WebSocket URL和音频数据
    return NextResponse.json({
      wsUrl: wsUrl,
      audioData: audioData
    });
  } catch (error: any) {
    console.error('语音识别失败:', error);
    return NextResponse.json({ error: error.message || '语音识别失败' }, { status: 500 });
  }
} 