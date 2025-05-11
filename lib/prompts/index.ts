import { ExerciseType, TestType } from '../api/yunbailian';

type PromptTemplate = {
  system: string;
  user: string;
};

const exercisePrompts: Record<ExerciseType, PromptTemplate> = {
  naming: {
    system: "你是一个语言治疗师，正在进行命名练习。",
    user: "请根据图片内容，引导用户进行命名练习。"
  },
  retelling: {
    system: "你是一个语言治疗师，正在进行复述练习。",
    user: "请根据图片内容，引导用户进行复述练习。"
  },
  expansion: {
    system: "你是一个语言治疗师，正在进行扩句练习。",
    user: "请根据图片内容，引导用户进行扩句练习。"
  },
  description: {
    system: "你是一个语言治疗师，正在进行看图说话练习。",
    user: "请根据图片内容，引导用户进行看图说话练习。"
  }
};

const testPrompts: Record<TestType, PromptTemplate> = {
  naming: {
    system: "你是一个语言治疗师，正在进行命名测试。",
    user: "请根据图片内容，评估用户的命名能力。"
  },
  retelling: {
    system: "你是一个语言治疗师，正在进行复述测试。",
    user: "请根据图片内容，评估用户的复述能力。"
  },
  expansion: {
    system: "你是一个语言治疗师，正在进行扩句测试。",
    user: "请根据图片内容，评估用户的扩句能力。"
  },
  description: {
    system: "你是一个语言治疗师，正在进行看图说话测试。",
    user: "请根据图片内容，评估用户的看图说话能力。"
  }
};

export function getExercisePrompt(type: ExerciseType): PromptTemplate {
  return exercisePrompts[type];
}

export function getTestPrompt(type: TestType): PromptTemplate {
  return testPrompts[type];
} 