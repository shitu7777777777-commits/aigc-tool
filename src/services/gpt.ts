import OpenAI from 'openai';
import config from '../config';
import { Language, ProcessMode } from '../types';

// 初始化OpenAI客户端
const openai = new OpenAI({
  apiKey: config.openai.apiKey,
});

// 中文标准模式提示词
const PROMPTS = {
  [Language.ZH]: {
    [ProcessMode.STANDARD]: `请将以下AI生成的文本改写成更自然、更像人类写作的风格。要求：
1. 保持原文的核心意思不变
2. 增加词汇多样性，避免重复用词
3. 适当使用口语化表达
4. 句式要有变化，长短句交替
5. 可以适当加入过渡词
6. 避免过于规整的句式
原文：{content}
请直接输出改写后的内容，不要添加任何解释。`,
    [ProcessMode.DEEP]: `请对以下文本进行深度改写，使其完全不像AI生成的内容。
【核心要点】- 保持专业度：
1. 【句式多样】长句短句交替，避免过于规整
2. 【词汇替换】替换部分词汇，但保持文章整体专业、正向
3. 【句式变化】适当变换句式，但不要加入太多口语化内容
4. 【轻微人类特征】
   - 偶尔一个小停顿（加个逗号或括号补充）
   - 偶尔换个说法表达同样意思
   - 避免所有句子都是一个模式
5. 【逻辑保持】保持原文的论证逻辑和结构
6. 【保持原意】核心观点和事实完全不变
【重要】这篇文章可能是学术论文/正式文档，请保持整体专业度，只在句式词汇层面微调，不要加入太多口语词。
原文：{content}
请直接输出改写后的内容，不要添加任何解释。`,
  },
  [Language.EN]: {
    [ProcessMode.STANDARD]: `Rewrite the following AI-generated text to make it sound more natural and human-written.
Requirements:
1. Keep the original meaning intact
2. Vary vocabulary, avoid repetition
3. Use some informal expressions naturally
4. Mix sentence lengths (short and long)
5. Add transition words where appropriate
6. Avoid overly structured patterns
Original text:
{content}
Output only the rewritten content without any explanations.`,
    [ProcessMode.DEEP]: `Rewrite the following AI-generated text to make it sound less like AI-written, while maintaining professionalism.
【Core Requirements - Keep it Professional】
1. 【Vary sentence length】Mix short and long sentences naturally
2. 【Vocabulary variation】Replace some words while keeping the tone formal and professional
3. 【Sentence structure】Vary sentence patterns, but don't add too many colloquial expressions
4. 【Subtle human traits】
   - Occasional pause (add a comma or parenthetical)
   - Occasionally express the same idea differently
   - Avoid uniform sentence patterns
5. 【Maintain logic】Keep the original argumentation structure
6. 【Keep meaning】Core points and facts must remain unchanged
【Important】This may be an academic paper or formal document. Please maintain overall professionalism. Only make subtle adjustments to sentence structure and vocabulary. Do not add too many informal expressions.
Original text:
{content}
Output only the rewritten content.`,
  },
};

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
  const prompt = PROMPTS[language][mode].replace('{content}', text);
  
  try {
    const response = await openai.chat.completions.create({
      model: config.openai.model,
      messages: [
        {
          role: 'system',
          content: prompt,
        },
      ],
      temperature: 0.8, // 较高温度，增加随机性，更像人类
      max_tokens: text.length * 2, // 预留足够空间
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
