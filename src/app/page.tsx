'use client';

import { useState, useEffect } from 'react';
import { ArrowRight, Copy, Check, RefreshCw, FileText, Globe, Zap } from 'lucide-react';

type Language = 'zh' | 'en';
type Mode = 'standard' | 'deep';
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface TaskResult {
  taskId: string;
  position?: number;
  estimatedTime?: string;
  status?: TaskStatus;
  result?: string;
  error?: string;
}

const translations = {
  zh: {
    title: 'AIGC降重工具',
    subtitle: '将AI生成的文本转化为更自然的人类写作风格',
    inputPlaceholder: '请输入需要降重的文本...',
    submit: '开始降重',
    submitting: '处理中...',
    language: '语言',
    mode: '模式',
    standard: '标准模式',
    deep: '深度模式',
    standardDesc: '轻度降重，保持原意',
    deepDesc: '彻底改写，降低AI检测率',
    wordCount: '字数',
    price: '预估价格',
    result: '降重结果',
    copy: '复制结果',
    copied: '已复制',
    retry: '重新处理',
    queue: '排队中',
    processing: '处理中',
    completed: '完成',
    failed: '失败',
    position: '前方排队',
    estimatedTime: '预计等待',
    error: '处理失败',
    second: '秒',
    minute: '分钟',
    yuan: '元',
  },
  en: {
    title: 'AIGC Rewriter',
    subtitle: 'Transform AI-generated text into natural human writing style',
    inputPlaceholder: 'Enter the text you want to rewrite...',
    submit: 'Start Rewriting',
    submitting: 'Processing...',
    language: 'Language',
    mode: 'Mode',
    standard: 'Standard',
    deep: 'Deep',
    standardDesc: 'Light rewriting, keep original meaning',
    deepDesc: 'Thorough rewriting, reduce AI detection',
    wordCount: 'Words',
    price: 'Est. Price',
    result: 'Result',
    copy: 'Copy',
    copied: 'Copied',
    retry: 'Retry',
    queue: 'In Queue',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    position: 'Position',
    estimatedTime: 'Est. Time',
    error: 'Error',
    second: 's',
    minute: 'min',
    yuan: '$',
  },
};

export default function Home() {
  const [lang, setLang] = useState<Language>('zh');
  const [mode, setMode] = useState<Mode>('standard');
  const [inputText, setInputText] = useState('');
  const [taskId, setTaskId] = useState('');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [copied, setCopied] = useState(false);
  const t = translations[lang];

  // 计算字数和价格
  const wordCount = lang === 'zh' 
    ? inputText.replace(/\s/g, '').length 
    : inputText.trim().split(/\s+/).filter(w => w.length > 0).length;
  
  const price = Math.ceil(wordCount / 1000) * (lang === 'zh' ? 2 : 0.5);

  // 提交任务
  const handleSubmit = async () => {
    if (!inputText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/task/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text: inputText,
          language: lang,
          mode: mode,
        }),
      });
      const data = await res.json();
      
      if (data.code === 200) {
        setTaskId(data.data.taskId);
        setResult(data.data);
        setIsPolling(true);
      } else {
        alert(data.message || '提交失败');
      }
    } catch (error) {
      console.error('提交失败:', error);
      alert('提交失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  // 轮询任务状态
  useEffect(() => {
    if (!isPolling || !taskId) return;

    const poll = async () => {
      try {
        const res = await fetch(`/api/task/${taskId}`);
        const data = await res.json();
        
        if (data.code === 200) {
          setResult(data.data);
          
          if (data.data.status === 'completed' || data.data.status === 'failed') {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error('查询失败:', error);
      }
    };

    const interval = setInterval(poll, 3000);
    return () => clearInterval(interval);
  }, [isPolling, taskId]);

  // 复制结果
  const handleCopy = () => {
    if (result?.result) {
      navigator.clipboard.writeText(result.result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // 重置
  const handleReset = () => {
    setInputText('');
    setTaskId('');
    setResult(null);
    setIsPolling(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <Zap className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-xl font-bold text-slate-800">{t.title}</h1>
          </div>
          
          <button
            onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')}
            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 transition-colors"
          >
            <Globe className="w-4 h-4" />
            <span className="text-sm font-medium">{lang === 'zh' ? 'EN' : '中文'}</span>
          </button>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero */}
        <div className="text-center mb-8">
          <p className="text-slate-600">{t.subtitle}</p>
        </div>

        {/* Main Card */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 overflow-hidden">
          {/* Options Bar */}
          <div className="bg-slate-50 px-6 py-4 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-6">
              {/* Language Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.language}</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setLang('zh')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      lang === 'zh' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    中文
                  </button>
                  <button
                    onClick={() => setLang('en')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      lang === 'en' 
                        ? 'bg-blue-500 text-white' 
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    English
                  </button>
                </div>
              </div>

              {/* Mode Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-500 mb-1">{t.mode}</label>
                <div className="flex gap-1">
                  <button
                    onClick={() => setMode('standard')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      mode === 'standard' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.standard}
                  </button>
                  <button
                    onClick={() => setMode('deep')}
                    className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                      mode === 'deep' 
                        ? 'bg-purple-500 text-white' 
                        : 'bg-white text-slate-600 hover:bg-slate-100'
                    }`}
                  >
                    {t.deep}
                  </button>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="flex items-center gap-4 text-sm">
              <div className="flex items-center gap-1.5 text-slate-600">
                <FileText className="w-4 h-4" />
                <span>{t.wordCount}: <strong>{wordCount}</strong></span>
              </div>
              <div className="text-slate-600">
                {t.price}: <strong className="text-blue-600">{lang === 'zh' ? `${price} ${t.yuan}` : `${t.yuan}${price}`}</strong>
              </div>
            </div>
          </div>

          {/* Input Area */}
          <div className="p-6">
            {!result ? (
              <>
                <textarea
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={t.inputPlaceholder}
                  className="w-full h-64 p-4 border border-slate-200 rounded-xl resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent text-base leading-relaxed"
                />
                
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleSubmit}
                    disabled={!inputText.trim() || isSubmitting}
                    className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                  >
                    {isSubmitting ? (
                      <>
                        <RefreshCw className="w-5 h-5 animate-spin" />
                        {t.submitting}
                      </>
                    ) : (
                      <>
                        {t.submit}
                        <ArrowRight className="w-5 h-5" />
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              /* Result Area */
              <div className="space-y-4">
                {/* Status */}
                <div className={`px-4 py-3 rounded-xl flex items-center justify-between ${
                  result.status === 'completed' ? 'bg-green-50 text-green-700' :
                  result.status === 'failed' ? 'bg-red-50 text-red-700' :
                  result.status === 'processing' ? 'bg-blue-50 text-blue-700' :
                  'bg-yellow-50 text-yellow-700'
                }`}>
                  <div className="flex items-center gap-2">
                    {result.status === 'pending' && <RefreshCw className="w-5 h-5 animate-spin" />}
                    {result.status === 'processing' && <RefreshCw className="w-5 h-5 animate-spin" />}
                    {result.status === 'completed' && <Check className="w-5 h-5" />}
                    {result.status === 'failed' && <span className="text-lg">✕</span>}
                    <span className="font-medium">
                      {result.status === 'pending' && `${t.queue}...`}
                      {result.status === 'processing' && t.processing}
                      {result.status === 'completed' && t.completed}
                      {result.status === 'failed' && t.error}
                    </span>
                  </div>
                  
                  {result.status === 'pending' && result.position && (
                    <span className="text-sm">{t.position} ${t.position === 1 ? '' : ''} | {t.estimatedTime}: {result.estimatedTime}</span>
                  )}
                </div>

                {/* Result Text */}
                {result.result && (
                  <div className="relative">
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-slate-600">{t.result}</span>
                        <button
                          onClick={handleCopy}
                          className="flex items-center gap-1 px-3 py-1 text-sm text-slate-600 hover:text-blue-600 transition-colors"
                        >
                          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                          {copied ? t.copied : t.copy}
                        </button>
                      </div>
                      <p className="whitespace-pre-wrap text-slate-800 leading-relaxed">{result.result}</p>
                    </div>
                  </div>
                )}

                {/* Error Message */}
                {result.error && (
                  <div className="p-4 bg-red-50 rounded-xl text-red-700">
                    {result.error}
                  </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-3">
                  {result.status === 'completed' && (
                    <button
                      onClick={handleReset}
                      className="flex-1 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      {t.submit} ↻
                    </button>
                  )}
                  {(result.status === 'failed' || result.status === 'completed') && (
                    <button
                      onClick={() => {
                        setResult(null);
                        setTaskId('');
                        setIsPolling(false);
                      }}
                      className="flex-1 py-3 bg-gradient-to-r from-blue-500 to-purple-600 text-white font-medium rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all"
                    >
                      {result.status === 'failed' ? t.retry : t.submit} ↻
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Mode Description */}
        <div className="mt-6 grid grid-cols-2 gap-4">
          <div className={`p-4 rounded-xl border transition-all ${
            mode === 'standard' ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-white'
          }`}>
            <h3 className="font-medium text-slate-800 mb-1">{t.standard}</h3>
            <p className="text-sm text-slate-600">{t.standardDesc}</p>
          </div>
          <div className={`p-4 rounded-xl border transition-all ${
            mode === 'deep' ? 'border-purple-300 bg-purple-50' : 'border-slate-200 bg-white'
          }`}>
            <h3 className="font-medium text-slate-800 mb-1">{t.deep}</h3>
            <p className="text-sm text-slate-600">{t.deepDesc}</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="text-center py-8 text-slate-400 text-sm">
        © 2026 AIGC Rewriter. All rights reserved.
      </footer>
    </div>
  );
}
