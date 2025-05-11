export async function transcribeAudio(audioData: Blob): Promise<string> {
  const formData = new FormData();
  formData.append('audio', audioData);

  const response = await fetch('/api/speech', {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.error || '语音识别失败');
  }

  const data = await response.json();
  return data.text;
} 