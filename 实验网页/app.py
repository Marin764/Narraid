from flask import Flask, render_template, request, jsonify
import whisper_timestamped as whisper
import numpy as np
import os
from pydub import AudioSegment
import json
import tempfile
import sys
import logging
import traceback
import torch
from logging.handlers import RotatingFileHandler
from datetime import datetime
import re
import torchaudio
import io
import base64
import wave
import struct
import soundfile as sf
import librosa
import torchaudio.transforms as T
from whisper_timestamped import transcribe_timestamped

# 配置日志
def setup_logger():
    if not os.path.exists('logs'):
        os.makedirs('logs')
    
    log_filename = f'logs/app_{datetime.now().strftime("%Y%m%d")}.log'
    formatter = logging.Formatter(
        '%(asctime)s - %(levelname)s - %(filename)s:%(lineno)d - %(message)s'
    )
    
    file_handler = RotatingFileHandler(
        log_filename,
        maxBytes=10*1024*1024,
        backupCount=5,
        encoding='utf-8'
    )
    file_handler.setFormatter(formatter)
    
    console_handler = logging.StreamHandler()
    console_handler.setFormatter(formatter)
    
    logger = logging.getLogger()
    logger.setLevel(logging.DEBUG)
    logger.addHandler(file_handler)
    logger.addHandler(console_handler)
    
    return logger

logger = setup_logger()
app = Flask(__name__)

# 配置上传文件夹
UPLOAD_FOLDER = 'static/uploads'
if not os.path.exists(UPLOAD_FOLDER):
    os.makedirs(UPLOAD_FOLDER)

app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# 加载模型
try:
    logger.info("正在加载模型...")
    cache_dir = os.path.expanduser("~/.cache/whisper")
    if not os.path.exists(cache_dir):
        os.makedirs(cache_dir)
    model = whisper.load_model("base", device="cpu", download_root=cache_dir)
    logger.info(f"模型类型: {type(model)}")
    logger.info("模型加载成功！")
except Exception as e:
    logger.error(f"模型加载失败: {str(e)}")
    logger.error(traceback.format_exc())
    sys.exit(1)

def process_audio(audio_data):
    """处理音频数据"""
    try:
        logger.info("开始处理音频数据...")
        logger.debug(f"输入音频数据类型: {type(audio_data)}")
        logger.debug(f"输入音频数据长度: {len(audio_data)}")
        
        # 转换音频格式
        logger.info("转换音频格式...")
        audio = AudioSegment.from_file(io.BytesIO(audio_data))
        logger.debug(f"音频格式: {audio.frame_rate}Hz, {audio.channels}通道, {audio.duration_seconds}秒")
        
        # 转换为WAV格式
        logger.info("转换为WAV格式...")
        wav_data = io.BytesIO()
        audio.export(wav_data, format="wav")
        wav_data.seek(0)
        logger.debug(f"WAV数据大小: {len(wav_data.getvalue())}字节")
        
        # 读取音频数据
        logger.info("读取音频数据...")
        with wave.open(wav_data, 'rb') as wav_file:
            frames = wav_file.readframes(wav_file.getnframes())
            rate = wav_file.getframerate()
            logger.debug(f"采样率: {rate}Hz")
            logger.debug(f"总帧数: {wav_file.getnframes()}")
            
        # 转换为numpy数组
        logger.info("转换为numpy数组...")
        audio_array = np.frombuffer(frames, dtype=np.int16).astype(np.float32) / 32768.0
        logger.debug(f"音频数组形状: {audio_array.shape}")
        logger.debug(f"音频数组类型: {audio_array.dtype}")
        
        return audio_array, rate
    except Exception as e:
        logger.error(f"音频处理失败: {str(e)}", exc_info=True)
        raise

def transcribe_audio(audio_data):
    """使用whisper-timestamped进行语音识别"""
    try:
        logger.info("开始加载模型...")
        model = whisper.load_model("base")
        logger.info(f"模型加载完成，类型: {type(model)}")
        
        # 设置转录选项
        transcribe_options = {
            "language": "zh",
            "task": "transcribe",
            "vad": True,
            "trust_whisper_timestamps": False,
            "refine_whisper_precision": 0.02,
            "plot_word_alignment": False
        }
        logger.info(f"转录选项: {json.dumps(transcribe_options, ensure_ascii=False)}")
        
        logger.info("开始转录...")
        logger.debug(f"输入音频数据类型: {type(audio_data)}, 形状: {audio_data.shape}")
        result = transcribe_timestamped(model, audio_data, **transcribe_options)
        logger.info(f"转录完成，结果: {json.dumps(result, ensure_ascii=False, indent=2)}")
        
        # 验证结果格式
        if not isinstance(result, dict):
            logger.error(f"转录结果格式错误，期望dict类型，实际为: {type(result)}")
            raise ValueError("转录结果格式错误")
            
        if 'segments' not in result:
            logger.error("转录结果缺少segments字段")
            raise ValueError("转录结果缺少segments字段")
            
        for i, segment in enumerate(result['segments']):
            if 'words' not in segment:
                logger.error(f"段落 {i} 缺少words字段")
                raise ValueError(f"段落 {i} 缺少words字段")
            logger.debug(f"段落 {i}: {len(segment['words'])}个词")
            
        return result
    except Exception as e:
        logger.error(f"转录过程中出错: {str(e)}", exc_info=True)
        raise

def analyze_intervals(segments):
    """分析字与字之间的间隔"""
    try:
        logger.info("开始分析间隔...")
        results = []
        
        for i, segment in enumerate(segments):
            logger.info(f"处理段落 {i+1}/{len(segments)}: {segment.get('text', '')}")
            words = segment.get('words', [])
            if not words:
                logger.warning(f"段落 {i+1} 中没有单词")
                continue
                
            logger.debug(f"段落 {i+1} 包含 {len(words)} 个词")
            intervals = []
            word_details = []
            
            # 将文本按字拆分
            text = segment['text'].replace(" ", "")
            chars = list(text)
            logger.debug(f"拆分后的字符: {chars}")
            
            # 遍历每个字
            for j, char in enumerate(chars):
                logger.debug(f"处理字符 {j+1}/{len(chars)}: {char}")
                
                # 找到包含当前字的词
                current_word = None
                for word in words:
                    if char in word['text']:
                        current_word = word
                        break
                
                if current_word:
                    logger.debug(f"找到包含字符 '{char}' 的词: {current_word['text']}")
                    # 计算当前字在词中的位置比例
                    char_pos = current_word['text'].index(char)
                    total_chars = len(current_word['text'])
                    logger.debug(f"字符位置: {char_pos+1}/{total_chars}")
                    
                    # 计算当前字的开始和结束时间
                    if total_chars == 1:
                        start = current_word['start']
                        end = current_word['end']
                    else:
                        duration = current_word['end'] - current_word['start']
                        start = current_word['start'] + (duration * char_pos / total_chars)
                        end = start + (duration / total_chars)
                    
                    logger.debug(f"字符时间: 开始={start:.3f}s, 结束={end:.3f}s")
                    
                    char_info = {
                        'text': char,
                        'start': start,
                        'end': end,
                        'duration': end - start
                    }
                    
                    # 计算到下一个字的间隔
                    if j < len(chars) - 1:
                        next_char = chars[j + 1]
                        next_word = None
                        for word in words:
                            if next_char in word['text']:
                                next_word = word
                                break
                        
                        if next_word:
                            logger.debug(f"找到下一个字符 '{next_char}' 的词: {next_word['text']}")
                            next_char_pos = next_word['text'].index(next_char)
                            next_total_chars = len(next_word['text'])
                            
                            if next_total_chars == 1:
                                next_start = next_word['start']
                            else:
                                next_duration = next_word['end'] - next_word['start']
                                next_start = next_word['start'] + (next_duration * next_char_pos / next_total_chars)
                            
                            interval = next_start - end
                            char_info['interval_to_next'] = interval
                            intervals.append(interval)
                            logger.debug(f"字符 '{char}' 到 '{next_char}' 的间隔: {interval:.3f}秒")
                        else:
                            logger.warning(f"未找到下一个字符 '{next_char}' 的词")
                            char_info['interval_to_next'] = 0
                    else:
                        char_info['interval_to_next'] = 0
                        logger.debug(f"最后一个字符 '{char}' 没有后续间隔")
                    
                    word_details.append(char_info)
                else:
                    logger.warning(f"未找到包含字符 '{char}' 的词")
            
            if intervals:
                avg_interval = np.mean(intervals)
                std_interval = np.std(intervals)
                logger.info(f"段落 {i+1} 统计: 平均间隔={avg_interval:.3f}秒, 标准差={std_interval:.3f}秒")
            else:
                avg_interval = 0
                std_interval = 0
                logger.warning(f"段落 {i+1} 没有可计算的间隔")
            
            results.append({
                'text': segment['text'],
                'avg_interval': avg_interval,
                'std_interval': std_interval,
                'word_details': word_details
            })
        
        logger.info("间隔分析完成")
        return results
    except Exception as e:
        logger.error(f"间隔分析过程中出错: {str(e)}", exc_info=True)
        raise

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        logger.error("没有文件上传")
        return jsonify({'error': '没有文件上传'}), 400
    
    file = request.files['file']
    if file.filename == '':
        logger.error("没有选择文件")
        return jsonify({'error': '没有选择文件'}), 400
    
    if file:
        temp_file_path = None
        try:
            logger.info("开始处理上传的文件...")
            with tempfile.NamedTemporaryFile(delete=False, suffix='.wav') as temp_file:
                temp_file_path = temp_file.name
                logger.info(f"创建临时文件: {temp_file_path}")
                file.save(temp_file_path)
                logger.info("文件保存成功")
                
                # 转换音频格式
                logger.info("开始转换音频格式...")
                audio = AudioSegment.from_file(temp_file_path)
                logger.info(f"原始音频信息: 通道数={audio.channels}, 采样率={audio.frame_rate}, 时长={len(audio)/1000}秒")
                
                audio = audio.set_channels(1)
                audio = audio.set_frame_rate(16000)
                logger.info(f"转换后音频信息: 通道数={audio.channels}, 采样率={audio.frame_rate}")
                
                audio.export(temp_file_path, format="wav")
                logger.info("音频格式转换完成")
                
                # 加载音频数据
                logger.info("开始加载音频数据...")
                audio_data = whisper.load_audio(temp_file_path)
                if audio_data is None:
                    raise Exception("音频加载失败")
                logger.info(f"音频数据加载成功，形状: {audio_data.shape}, 类型: {audio_data.dtype}")
                
                # 确保音频数据格式正确
                if len(audio_data.shape) == 1:
                    audio_data = torch.from_numpy(audio_data).float()
                if len(audio_data.shape) == 2:
                    audio_data = audio_data.squeeze(0)
                logger.info(f"处理后的音频数据形状: {audio_data.shape}, 类型: {audio_data.dtype}")
                
                # 转录
                logger.info("开始转录...")
                logger.info("设置转录参数...")
                transcribe_options = {
                    "language": "zh",
                    "task": "transcribe",
                    "vad": True,  # 启用语音活动检测
                    "trust_whisper_timestamps": False,  # 不信任原始时间戳
                    "refine_whisper_precision": 0.02,  # 提升对齐精度
                    "plot_word_alignment": False  # 不生成对齐图
                }
                logger.info(f"转录参数: {json.dumps(transcribe_options, ensure_ascii=False)}")
                
                try:
                    logger.info("开始执行转录...")
                    result = transcribe_timestamped(model, audio_data, **transcribe_options)
                    
                    if not result:
                        raise Exception("转录结果为空")
                    
                    logger.info(f"转录完成，结果: {json.dumps(result, ensure_ascii=False, indent=2)}")
                    
                    # 处理结果，添加时间戳
                    logger.info("开始处理转录结果...")
                    processed_segments = []
                    for segment in result['segments']:
                        logger.info(f"处理段落: {segment['text']}")
                        words = []
                        for i, word in enumerate(segment['words']):
                            logger.debug(f"处理单词: {word['text']}")
                            word_info = {
                                'text': word['text'],
                                'start': word['start'],
                                'end': word['end'],
                                'duration': word['end'] - word['start'],
                                'interval_to_next': 0
                            }
                            
                            # 计算到下一个字的间隔
                            if i < len(segment['words']) - 1:
                                next_word = segment['words'][i + 1]
                                interval = next_word['start'] - word['end']
                                word_info['interval_to_next'] = interval
                                logger.debug(f"单词 {word['text']} 到 {next_word['text']} 的间隔: {interval:.3f}秒")
                            
                            words.append(word_info)
                        
                        processed_segment = {
                            'text': segment['text'],
                            'start': segment['start'],
                            'end': segment['end'],
                            'words': words
                        }
                        processed_segments.append(processed_segment)
                    
                    # 分析间隔
                    logger.info("开始分析间隔...")
                    interval_results = analyze_intervals(processed_segments)
                    logger.info(f"间隔分析完成，结果: {json.dumps(interval_results, ensure_ascii=False, indent=2)}")
                    
                    return jsonify({
                        'transcription': processed_segments,
                        'interval_analysis': interval_results
                    })
                    
                except Exception as e:
                    logger.error(f"转录过程中出现错误: {str(e)}")
                    logger.error(traceback.format_exc())
                    return jsonify({'error': f"转录失败: {str(e)}"}), 500
                
        except Exception as e:
            logger.error(f"处理过程中出现错误: {str(e)}")
            logger.error(traceback.format_exc())
            return jsonify({'error': str(e)}), 500
        finally:
            if temp_file_path and os.path.exists(temp_file_path):
                try:
                    os.unlink(temp_file_path)
                    logger.info(f"临时文件已删除: {temp_file_path}")
                except Exception as e:
                    logger.error(f"删除临时文件失败: {str(e)}")

@app.route('/transcribe', methods=['POST'])
def transcribe():
    """处理音频转录请求"""
    try:
        logger.info("收到转录请求")
        if 'audio' not in request.files:
            logger.error("请求中没有音频文件")
            return jsonify({'error': '没有音频文件'}), 400
            
        audio_file = request.files['audio']
        if not audio_file:
            logger.error("音频文件为空")
            return jsonify({'error': '音频文件为空'}), 400
            
        logger.info(f"接收到音频文件: {audio_file.filename}")
        audio_data = audio_file.read()
        
        # 处理音频
        logger.info("开始处理音频...")
        audio_array, sample_rate = process_audio(audio_data)
        logger.info(f"音频处理完成: {len(audio_array)}采样点, {sample_rate}Hz")
        
        # 转录
        logger.info("开始转录...")
        transcription_result = transcribe_audio(audio_array)
        logger.info("转录完成")
        
        # 分析间隔
        logger.info("开始分析间隔...")
        interval_analysis = analyze_intervals(transcription_result['segments'])
        logger.info("间隔分析完成")
        
        response = {
            'transcription': transcription_result['segments'],
            'interval_analysis': interval_analysis
        }
        
        logger.info("请求处理完成")
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"处理请求时出错: {str(e)}", exc_info=True)
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True, port=5001) 