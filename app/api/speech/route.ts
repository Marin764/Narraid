import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import path from 'path';
import fs from 'fs';
import { promisify } from 'util';
import { exec } from 'child_process';

const execAsync = promisify(exec);

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const audioFile = formData.get('audio') as File;
    
    if (!audioFile) {
      return NextResponse.json(
        { error: '未找到音频文件' },
        { status: 400 }
      );
    }

    // 将音频文件转换为Buffer
    const audioBuffer = Buffer.from(await audioFile.arrayBuffer());
    
    // 创建临时文件
    const tempDir = '/tmp';
    const timestamp = Date.now();
    const webmPath = path.join(tempDir, `audio-${timestamp}.webm`);
    const wavPath = path.join(tempDir, `audio-${timestamp}.wav`);
    
    // 写入WebM文件
    fs.writeFileSync(webmPath, audioBuffer);
    
    try {
      // 使用ffmpeg将WebM转换为WAV
      await execAsync(`ffmpeg -i ${webmPath} -acodec pcm_s16le -ar 16000 -ac 1 ${wavPath}`);
      
      // 运行Python脚本进行语音识别
      const pythonProcess = spawn('python3', [
        path.join(process.cwd(), 'scripts/transcribe.py'),
        wavPath
      ]);

      let output = '';
      let error = '';

      pythonProcess.stdout.on('data', (data) => {
        output += data.toString();
      });

      pythonProcess.stderr.on('data', (data) => {
        error += data.toString();
      });

      return new Promise((resolve, reject) => {
        pythonProcess.on('close', (code) => {
          // 清理临时文件
          try {
            fs.unlinkSync(webmPath);
            fs.unlinkSync(wavPath);
          } catch (err) {
            console.error('清理临时文件失败:', err);
          }

          if (code === 0) {
            resolve(NextResponse.json({ text: output.trim() }));
          } else {
            reject(new Error(`Python脚本执行失败: ${error}`));
          }
        });
      });
    } catch (error) {
      // 清理临时文件
      try {
        fs.unlinkSync(webmPath);
        fs.unlinkSync(wavPath);
      } catch (err) {
        console.error('清理临时文件失败:', err);
      }
      
      console.error('处理音频文件失败:', error);
      return NextResponse.json({ error: '处理音频文件失败' }, { status: 500 });
    }
  } catch (error) {
    console.error('语音识别错误:', error);
    return NextResponse.json({ error: '语音识别失败' }, { status: 500 });
  }
} 