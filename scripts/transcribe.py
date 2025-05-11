import sys
import whisper_timestamped as whisper
import tempfile
import os

def transcribe_audio(audio_path):
    try:
        # 加载模型
        model = whisper.load_model("base")
        
        # 转录音频
        result = whisper.transcribe(model, audio_path, language="zh")
        
        # 提取文本
        text = result.get("text", "")
        
        return text
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python transcribe.py <audio_file_path>")
        sys.exit(1)
        
    audio_path = sys.argv[1]
    if not os.path.exists(audio_path):
        print(f"Error: Audio file not found: {audio_path}", file=sys.stderr)
        sys.exit(1)
        
    try:
        text = transcribe_audio(audio_path)
        print(text)
    except Exception as e:
        print(f"Error: {str(e)}", file=sys.stderr)
        sys.exit(1) 