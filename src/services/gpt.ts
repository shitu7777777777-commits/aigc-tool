import OpenAI from 'openai';
import config from '../config';
import { Language, ProcessMode } from '../types';
import { getPrompt, fillPrompt } from './prompts';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// 计算字数（中英文分开）
export function countWords(text: string, language: Language): number {
  if (language === Language.ZH) {
    // 中文：计算字符数（不含空格）
    return text.replace(/\s/g, '').length;
  } else {
    // 英文：计算单词数
    return text.trim().split(/\s+/).filter(w => w.length > 0).length;
  }
}

// 估算价格（分）
export function estimatePrice(wordCount: number, language: Language): number {
  const pricePerThousand = language === Language.ZH ? 2 : 0.5; // 元或美元
  const thousandWords = Math.ceil(wordCount / 1000);
  return thousandWords * pricePerThousand;
}

// 调用GPT进行降重
export async function rewriteText(
  text: string,
  language: Language,
  mode: ProcessMode
): Promise<string> {
  // 获取对应语言和模式的提示词
  const promptTemplate = getPrompt(language, mode);
  const prompt = fillPrompt(promptTemplate, text);
  
  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      temperature: 0.7, // 适中温度，保持学术性的同时增加变化
      max_tokens: text.length * 2, // 预留足够空间
      top_p: 0.9,
    });
    
    const result = response.choices[0]?.message?.content || '';
    
    if (!result) {
      throw new Error('GPT返回为空');
    }
    
    return result;
  } catch (error) {
    console.error('GPT调用失败:', error);
    throw error;
  }
}

// 估算处理时间（秒）
export function estimateProcessingTime(wordCount: number, queueLength: number): number {
  // 假设每个任务平均处理时间 = 字数 / 1000 * 3秒
  const avgTaskTime = Math.ceil(wordCount / 1000) * 3;
  // 加上队列等待时间
  return avgTaskTime + queueLength * 30; // 每个等待任务约30秒
}

export default {
  countWords,
  estimatePrice,
  rewriteText,
  estimateProcessingTime,
};
