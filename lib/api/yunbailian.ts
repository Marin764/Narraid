import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.YUNBAILIAN_API_KEY,
  baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

export type Message = {
  role: 'system' | 'user' | 'assistant';
  content: string;
};

export type ExerciseType = 'naming' | 'retelling' | 'expansion' | 'description';
export type TestType = 'naming' | 'retelling' | 'expansion' | 'description';

export async function callLanguageModel(
  messages: Message[],
  options: {
    exerciseType?: ExerciseType;
    testType?: TestType;
    temperature?: number;
    maxTokens?: number;
  } = {}
) {
  try {
    const completion = await client.chat.completions.create({
      model: "qwen-plus",
      messages,
      temperature: options.temperature ?? 0.7,
      max_tokens: options.maxTokens,
      stream: false,
    });

    return completion.choices[0].message.content;
  } catch (error) {
    console.error('Error calling language model:', error);
    throw error;
  }
} 