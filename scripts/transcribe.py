import sys
import whisper_timestamped as whisper
import tempfile
import os
import json

def transcribe_audio(audio_path):
    try:
        print(f"开始加载模型...", file=sys.stderr)
        # 加载模型
        model = whisper.load_model("base")
        print(f"模型加载完成", file=sys.stderr)
        
        # 设置转录选项
        transcribe_options = {
            "language": "zh",
            "task": "transcribe",
            "vad": False,
            "trust_whisper_timestamps": False,
            "refine_whisper_precision": 0.02,
            "plot_word_alignment": False
        }
        
        print(f"开始转录音频: {audio_path}", file=sys.stderr)
        # 转录音频
        result = whisper.transcribe_timestamped(model, audio_path, **transcribe_options)
        print(f"音频转录完成", file=sys.stderr)
        
        # 只返回分段和完整文本
        segments = result['segments']
        text = ''.join([seg['text'] for seg in segments])
        
        if not text:
            print("警告: 转录结果为空", file=sys.stderr)
        
        print(f"转录文本: {text}", file=sys.stderr)
        return {
            'segments': segments,
            'text': text
        }
    except Exception as e:
        print(f"错误: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("用法: python transcribe.py <audio_file_path>", file=sys.stderr)
        sys.exit(1)
        
    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(f"错误: 找不到音频文件: {audio_path}", file=sys.stderr)
        sys.exit(1)
    
    print(f"音频文件大小: {os.path.getsize(audio_path)} bytes", file=sys.stderr)
    result = transcribe_audio(audio_path)
    print(json.dumps(result, ensure_ascii=False)) 