import sys
import json

def analyze_intervals(segments):
    processed_segments = []
    for segment in segments:
        words = segment['words']
        # 计算每个字的停顿
        for i, word in enumerate(words):
            word['duration'] = word['end'] - word['start']
            word['interval_to_next'] = 0
            if i < len(words) - 1:
                next_word = words[i + 1]
                word['interval_to_next'] = next_word['start'] - word['end']
        processed_segments.append({
            'text': segment['text'],
            'start': segment['start'],
            'end': segment['end'],
            'words': words
        })
    # 分析间隔
    interval_results = []
    for segment in processed_segments:
        intervals = [word['interval_to_next'] for word in segment['words'] if word['interval_to_next'] > 0]
        if intervals:
            avg_interval = sum(intervals) / len(intervals)
            std_interval = (sum((x - avg_interval) ** 2 for x in intervals) / len(intervals)) ** 0.5
        else:
            avg_interval = 0
            std_interval = 0
        interval_results.append({
            'text': segment['text'],
            'avg_interval': avg_interval,
            'std_interval': std_interval
        })
    return {
        'transcription': processed_segments,
        'interval_analysis': interval_results
    }

if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("Usage: python analyze_interval.py <segments_json_file>")
        sys.exit(1)
    segments_file = sys.argv[1]
    with open(segments_file, 'r', encoding='utf-8') as f:
        segments = json.load(f)
    result = analyze_intervals(segments)
    print(json.dumps(result, ensure_ascii=False)) 