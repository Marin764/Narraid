import { NextRequest, NextResponse } from 'next/server';
import { spawn } from 'child_process';
import fs from 'fs';
import path from 'path';

export async function POST(request: NextRequest) {
  try {
    const { segmentsFile } = await request.json();
    if (!segmentsFile || typeof segmentsFile !== 'string') {
      return NextResponse.json({ error: '缺少 segmentsFile 参数' }, { status: 400 });
    }
    // 检查文件是否存在
    if (!fs.existsSync(segmentsFile)) {
      return NextResponse.json({ error: 'segments 文件不存在' }, { status: 400 });
    }
    // 调用 analyze_interval.py
    const pythonProcess = spawn('python3', [
      path.join(process.cwd(), 'scripts/analyze_interval.py'),
      segmentsFile
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
        // 清理 segments 临时文件
        try {
          fs.unlinkSync(segmentsFile);
        } catch (err) {
          console.error('清理 segments 文件失败:', err);
        }
        if (code === 0) {
          try {
            const result = JSON.parse(output);
            resolve(NextResponse.json(result));
          } catch (err) {
            reject(new Error('解析Python脚本输出失败'));
          }
        } else {
          reject(new Error(`Python脚本执行失败: ${error}`));
        }
      });
    });
  } catch (error) {
    console.error('停顿分析错误:', error);
    return NextResponse.json({ error: '停顿分析失败' }, { status: 500 });
  }
} 