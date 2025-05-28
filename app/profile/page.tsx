'use client';

import { useState, useEffect } from 'react';

interface WordInfo {
  text: string;
  start: number;
  end: number;
  duration: number;
  interval_to_next: number;
}

interface Segment {
  text: string;
  start: number;
  end: number;
  words: WordInfo[];
}

interface IntervalAnalysis {
  text: string;
  avg_interval: number;
  std_interval: number;
}

interface TranscriptionResult {
  transcription: Segment[];
  interval_analysis: IntervalAnalysis[];
}

export default function Profile() {
  const [history, setHistory] = useState<TranscriptionResult[]>([]);

  useEffect(() => {
    // 从localStorage加载历史记录
    const savedHistory = localStorage.getItem('speechHistory');
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory));
    }
  }, []);

  const getIntervalClass = (interval: number) => {
    if (interval < 0.2) return 'bg-green-100';
    if (interval < 0.4) return 'bg-yellow-100';
    return 'bg-red-100';
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="p-4 text-center border-b bg-white">
        <h1 className="text-2xl font-bold text-[#00a0a0]">NarrAid</h1>
        <div className="absolute top-4 right-4">
          <h2 className="text-xl font-medium text-[#00a0a0]">个人中心</h2>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <h3 className="text-xl font-semibold mb-4">练习统计</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-600">练习次数</span>
              <span className="text-[#00a0a0] font-medium block mt-2">{history.length}次</span>
            </div>
            <div className="bg-gray-50 p-4 rounded-lg">
              <span className="text-gray-600">平均分数</span>
              <span className="text-[#00a0a0] font-medium block mt-2">
                {history.length > 0
                  ? Math.round(
                      history.reduce(
                        (acc, curr) =>
                          acc +
                          curr.interval_analysis.reduce(
                            (sum, analysis) => sum + (1 - analysis.avg_interval) * 100,
                            0
                          ) / curr.interval_analysis.length,
                        0
                      ) / history.length
                    )
                  : 0}
                分
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-semibold mb-4">练习历史</h3>
          <div className="space-y-6">
            {history.map((record, index) => (
              <div key={index} className="border rounded-lg p-4">
                <div className="mb-4">
                  <h4 className="font-medium mb-2">识别文本：</h4>
                  <p className="text-gray-700">{record.transcription[0]?.text}</p>
                </div>
                <div className="mb-4">
                  <h4 className="font-medium mb-2">字词分析：</h4>
                  <div className="flex flex-wrap gap-2">
                    {record.transcription[0]?.words.map((word, wordIndex) => (
                      <div
                        key={wordIndex}
                        className={`p-2 rounded ${getIntervalClass(word.interval_to_next)}`}
                      >
                        <div className="font-medium">{word.text}</div>
                        <div className="text-xs text-gray-600">
                          <div>开始: {word.start.toFixed(2)}s</div>
                          <div>结束: {word.end.toFixed(2)}s</div>
                          <div>持续: {word.duration.toFixed(2)}s</div>
                          <div>停顿: {word.interval_to_next.toFixed(2)}s</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
                <div>
                  <h4 className="font-medium mb-2">间隔分析：</h4>
                  {record.interval_analysis.map((analysis, analysisIndex) => (
                    <div key={analysisIndex} className="text-sm text-gray-600">
                      <div>平均间隔: {analysis.avg_interval.toFixed(2)}秒</div>
                      <div>间隔标准差: {analysis.std_interval.toFixed(2)}秒</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
