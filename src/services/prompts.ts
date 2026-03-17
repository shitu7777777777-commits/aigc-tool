import { Language, ProcessMode } from '../types';

// 中文标准模式提示词
const ZH_STANDARD = `请将以下AI生成的中文学术论文文本进行降AI处理，使其更符合人类写作特征，同时保持学术性。

## 【核心原则】
1. 保持原文的专业术语和学术表达不变
2. 保持论证逻辑和结构完整
3. 核心观点、数据、引用必须完全保留

## 【降AI特征 - 必须消除】
### 词汇层面
- 避免过于书面化的连接词：如"因此"、"此外"、"同时"、"综上所述"等
- 避免AI常用模式词组：如"值得注意的是"、"需要指出的是"、"显而易见的是"
- 适当使用更口语化但不失专业的表达

### 句式层面
- 打破句子长度均匀分布：长短句交替，长句不超过40字
- 避免"首先-其次-最后"等规整结构，可使用"一方面...另一方面..."、"首先...然后..."
- 适当使用设问句、反问句、感叹句增加变化
- 可插入括号补充说明，模拟人类思考过程

### 段落层面
- 适当添加过渡句，但不要太完美
- 保持段落主题明确，但允许轻微的逻辑跳跃
- 可在段落开头加一句引入性语句

### 人类写作特征（轻微添加）
- 偶尔使用"可以说"、"某种程度上"、"某种意义上"等限定词
- 偶尔使用"这个"、"那种"等指代词
- 适当使用"坦白说"、"实话说"、"客观来说"等插入语
- 句子间可使用少量留白（句号分隔）

## 【绝对禁止】
- 不要添加口水话或网络用语
- 不要改变原文的专业术语
- 不要改变数据、事实、引用
- 不要改变论文的论证逻辑
- 不要降低文章的学术性

## 【输出要求】
- 直接输出改写后的完整文本
- 不要添加任何解释、评论、标注
- 保持原文的分段格式
- 全文使用中文标点符号

原文：
{content}`;

// 中文深度模式提示词
const ZH_DEEP = `请将以下AI生成的中文学术论文文本进行深度降AI处理，在通过AI检测的同时保持高度学术性。

## 【核心原则 - 学术性优先】
1. 保留所有专业术语、学术词汇
2. 保留完整的研究方法、实验步骤描述
3. 保留数据、结论、引用
4. 保持论文的学术结构和论证逻辑

## 【深度降AI策略】
### 词汇重构
- 替换AI特征词为多样化表达（同义词库）
- 书面词→学术口语词：如"因此"→"所以"、"本文认为"→"我们认为"
- 避免连续使用相同连接词
- 使用学科特定表达替代通用表达

### 句式重构
- 复杂长句拆分（拆为2-3个短句）
- 短句合并为复合句（增加句式变化）
- 主动句与被动句交替使用
- 陈述句与设问句交替
- 适当使用倒装句、强调句

### 段落重构
- 段落内部添加细节补充
- 添加逻辑过渡词（但不要太完美）
- 适当添加"需要说明的是"、"补充一点"等
- 允许段落间有轻微的内容重复（模拟人类写作）

### 人类写作微特征
- 添加限定词："在一定程度上"、"在某种意义上"、"可以说"
- 添加指代词："前者"、"后者"、"上述观点"
- 添加思考痕迹："值得注意的是（其实也未必）"、"从这个角度看（也可以这么理解）"
- 使用括号进行补充说明

## 【学术性保障】
- 专业术语必须保留
- 研究方法描述必须完整
- 数据和结论不能改变
- 引用格式保持不变
- 逻辑推理链条必须完整

## 【输出要求】
- 直接输出完整改写文本
- 不添加任何解释或注释
- 保持原文格式和分段
- 使用中文标点

原文：
{content}`;

// 英文标准模式提示词
const EN_STANDARD = `Rewrite the following AI-generated academic paper text to reduce AI detection while maintaining academic quality.

## [Core Principles]
1. Keep all technical terms and academic expressions
2. Maintain the argument structure and logic
3. Preserve all data, facts, and citations

## [AI Features to Remove]
### Vocabulary
- Avoid overly formal connectors: "therefore", "moreover", "furthermore", "consequently"
- Avoid AI patterns: "it is worth noting that", "it can be seen that", "as can be seen"
- Use more natural academic expressions

### Sentence Structure
- Vary sentence length (mix short 10-15 words with longer 25-35 words)
- Avoid "firstly-secondly-finally" patterns
- Use occasional questions, exclamations
- Add parenthetical clarifications

### Paragraph Level
- Add transitional sentences (but not too perfect)
- Allow slight logical jumps
- Add introductory phrases

### Human Writing Features
- Use hedging words: "to some extent", "arguably", "in a sense"
- Use demonstratives: "this phenomenon", "such an approach"
- Add thinking markers: "it should be noted that", "one could argue that"

## [Strict Prohibitions]
- Do NOT add colloquialisms or slang
- Do NOT change technical terms
- Do NOT alter data or facts
- Do NOT change argument logic
- Do NOT reduce academic quality

## [Output Requirements]
- Output only the rewritten text
- No explanations or annotations
- Maintain original paragraph structure
- Use proper English punctuation

Original text:
{content}`;

// 英文深度模式提示词
const EN_DEEP = `Perform deep AI rewriting on the following academic paper text to pass AI detection while maintaining high academic standards.

## [Core Principles - Academic Quality First]
1. Preserve all technical terminology
2. Keep research methodology descriptions complete
3. Maintain all data and conclusions
4. Retain citation formats
5. Keep argument logic intact

## [Deep Rewriting Strategy]
### Vocabulary Reconstruction
- Replace AI-pattern words with synonyms
- Formal → Academic natural: "therefore"→"so"/"thus", "the author suggests"→"we suggest"
- Avoid consecutive identical connectors
- Use discipline-specific expressions

### Sentence Reconstruction
- Split complex long sentences (into 2-3 shorter ones)
- Merge short sentences into compound structures
- Alternate active and passive voice
- Mix declarative and interrogative
- Use occasional emphatic/inverted structures

### Paragraph Reconstruction
- Add details within paragraphs
- Add logical transitions (but not overly perfect)
- Add "it should be noted", "additionally", "in addition"
- Allow slight content repetition between paragraphs

### Human Writing Micro-Features
- Add hedging: "to some extent", "arguably", "in a sense"
- Add demonstratives: "the former", "the latter"
- Add thinking traces: "notably", "one could argue"
- Use parentheses for clarifications

## [Academic Quality Guarantee]
- Technical terms: MUST keep
- Research methods: MUST keep complete
- Data and conclusions: MUST NOT change
- Citation formats: MUST keep
- Logical chain: MUST maintain

## [Output Requirements]
- Output complete rewritten text only
- No explanations or comments
- Maintain original formatting
- Use English punctuation

Original text:
{content}`;

// 提示词映射
const PROMPTS = {
  [Language.ZH]: {
    [ProcessMode.STANDARD]: ZH_STANDARD,
    [ProcessMode.DEEP]: ZH_DEEP,
  },
  [Language.EN]: {
    [ProcessMode.STANDARD]: EN_STANDARD,
    [ProcessMode.DEEP]: EN_DEEP,
  },
};

// 获取提示词
export function getPrompt(language: Language, mode: ProcessMode): string {
  return PROMPTS[language][mode];
}

// 替换占位符
export function fillPrompt(prompt: string, content: string): string {
  return prompt.replace('{content}', content);
}

export default {
  getPrompt,
  fillPrompt,
};
