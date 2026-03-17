'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Copy, Check, RefreshCw, FileText, Globe, Zap, Upload, User, LogIn, X, Eye, EyeOff, Shield, CloudLightning, Lock, CheckCircle, Crown } from 'lucide-react';

export default function Home() {
  const [uiLang, setUiLang] = useState('zh');
  const [textLang, setTextLang] = useState('zh');
  const [mode, setMode] = useState('standard');
  const [text, setText] = useState('');
  const [result, setResult] = useState<any>(null);
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [region, setRegion] = useState<any>(null);
  const [showAuth, setShowAuth] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [user, setUser] = useState<any>(null);
  const [email, setEmail] = useState('');
  const [pwd, setPwd] = useState('');
  const [cpwd, setCpwd] = useState('');
  const [nick, setNick] = useState('');
  const [showPwd, setShowPwd] = useState(false);
  const [err, setErr] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const t: any = {
    zh: { 
      title: '爱降', 
      subtitle: '一键降AI，全平台检测无忧', 
      desc: '爱降是专注降低AIGC生成痕迹的在线工具，采用智能语义重构技术，深度适配并有效应对知网、维普、万方、格子达、Turnitin、GPTzero等主流检测平台，一键消除AI特征，降低AIGC检测率，让文本回归真人原创质感。',
      p: '请输入文本或上传文档...', 
      b: '立即降AI', 
      textLang: '文本语言',
      mode: '模式', 
      std: '标准', 
      deep: '深度', 
      wc: '字数', 
      pr: '价格', 
      pricePerThousand: '每千字2元', 
      rs: '结果', 
      cp: '复制', 
      in: '登录', 
      up: '上传文档', 
      lg: '退出', 
      reg: '注册', 
      pricing: '套餐', 
      uploading: '解析中...',
      features: ['降AIGC率', '全平台适配', '语义改写', '安全私密', '极速处理'],
      featureDesc: ['精准消除AI生成痕迹', '支持知网维普万方TurnitinGPTzero', '不改原意不降质量', '文档不上云不存储', '粘贴即用一键生成'],
      footer: '本工具仅提供文本表达优化服务，用于辅助提升原创性与可读性，不替代原创写作，不鼓励学术不端。'
    },
    en: { 
      title: 'AI Remover', 
      subtitle: 'Remove AI Detection, All Platforms', 
      desc: 'AI Remover uses intelligent semantic restructuring to effectively bypass AI detection platforms including Turnitin, GPTZero, and more.',
      p: 'Enter text or upload document...', 
      b: 'Remove AI', 
      textLang: 'Text Lang',
      mode: 'Mode', 
      std: 'Standard', 
      deep: 'Deep', 
      wc: 'Words', 
      pr: 'Price', 
      pricePerThousand: '$0.5/1k words', 
      rs: 'Result', 
      cp: 'Copy', 
      in: 'Login', 
      up: 'Upload', 
      lg: 'Logout', 
      reg: 'Register', 
      pricing: 'Pricing', 
      uploading: 'Processing...',
      features: ['Remove AI', 'All Platforms', 'Semantic', 'Secure', 'Fast'],
      featureDesc: ['Eliminate AI traces', 'Works with all detectors', 'Keep original meaning', 'No cloud storage', 'One-click result'],
      footer: 'This tool provides text optimization services to improve originality and readability.'
    }
  };

  useEffect(() => {
    fetch('/api/region').then(r => r.json()).then(d => { if (d.code === 200) setRegion(d.data); }).catch(() => { });
    const uid = localStorage.getItem('userId');
    if (uid) fetch('/api/user', { headers: { 'x-user-id': uid } }).then(r => r.json()).then(d => { if (d.code === 200) setUser(d.data); }).catch(() => { });
  }, []);

  // Auto detect text language based on content
  const hasChinese = /[\u4e00-\u9fa5]/.test(text);
  const effectiveLang = hasChinese ? 'zh' : textLang;
  const wc = !text.trim() ? 0 : (effectiveLang === 'zh' ? text.replace(/\s/g, '').length : text.trim().split(/\s+/).length);
  const cur = region?.currencySymbol || (uiLang === 'zh' ? '¥' : '$');
  const pricePerThousandLabel = region?.country === 'CN' ? '每千字2元' : '$0.5/1k words';
  const pp = region?.pricePerThousand || (textLang === 'zh' ? 2 : 0.5);
  const price = Math.ceil(wc / 1000) * pp;

  const submit = async () => {
    if (!text.trim() || submitting) return;
    const uid = localStorage.getItem('userId');
    if (!uid) { alert(uiLang === 'zh' ? '请先登录' : 'Please login first'); setShowAuth(true); return; }
    setSubmitting(true);
    try {
      const r = await fetch('/api/task/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': uid }, body: JSON.stringify({ text, language: textLang, mode }) });
      const d = await r.json();
      if (d.code === 200) setResult(d.data);
      else alert(d.message || (uiLang === 'zh' ? '失败' : 'Failed'));
    } catch (e) { alert(uiLang === 'zh' ? '错误' : 'Error'); }
    setSubmitting(false);
  };

  const copy = () => { if (result?.result) { navigator.clipboard.writeText(result.result); setCopied(true); setTimeout(() => setCopied(false), 2000); } };
  const reset = () => { setText(''); setResult(null); };
  const logout = () => { localStorage.removeItem('token'); localStorage.removeItem('userId'); setUser(null); };

  const upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploading(true);
    const fd = new FormData();
    fd.append('file', file);
    try {
      const r = await fetch('/api/upload', { method: 'POST', body: fd });
      const d = await r.json();
      if (d.code === 200) { setText(d.data.text); alert((uiLang === 'zh' ? '上传成功！' : 'Success!') + d.data.wordCount + (textLang === 'zh' ? '字' : ' words')); }
      else { alert(d.message || (uiLang === 'zh' ? '上传失败' : 'Failed')); }
    } catch (e) { alert(uiLang === 'zh' ? '上传失败' : 'Failed'); }
    setIsUploading(false);
  };

  const auth = async () => {
    setErr('');
    if (authMode === 'register' && pwd !== cpwd) { setErr(uiLang === 'zh' ? '密码不一致' : 'Passwords do not match'); return; }
    if (authMode === 'register' && pwd.length < 8) { setErr(uiLang === 'zh' ? '密码至少8位' : 'Min 8 characters'); return; }
    try {
      const r = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: authMode, email, password: pwd, nickname: nick }) });
      const d = await r.json();
      if (d.code === 200) { localStorage.setItem('token', d.data.token); localStorage.setItem('userId', d.data.userId); setUser(d.data); setShowAuth(false); setEmail(''); setPwd(''); setCpwd(''); setNick(''); }
      else setErr(d.message);
    } catch (e) { setErr(uiLang === 'zh' ? '请求失败' : 'Request failed'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold">{t[uiLang].title}</h1>
            {region && <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{region.country === 'CN' ? 'CN' : 'EN'}</span>}
          </div>
          <div className="flex items-center gap-3">
            <a href="/pricing" className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm flex items-center gap-1"><Crown className="w-4 h-4" />{t[uiLang].pricing}</a>
            <button onClick={() => setUiLang(uiLang === 'zh' ? 'en' : 'zh')} className="px-3 py-2 bg-slate-100 rounded-lg text-sm">{uiLang === 'zh' ? 'EN' : '中文'}</button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm"><span className="text-blue-700">{user.nickname}</span><span className="text-slate-400 mx-1">|</span><span className="text-green-600">{user.monthlyPackage ? `${(user.monthlyWordsLimit || 0) - (user.monthlyWordsUsed || 0)}${uiLang === 'zh' ? '字' : 'words'}` : `${cur}${user.balance}`}</span></div>
                <button onClick={logout} className="text-sm text-slate-500">{t[uiLang].lg}</button>
              </div>
            ) : (<button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">{t[uiLang].in}</button>)}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">{t[uiLang].subtitle}</h2>
          <p className="text-slate-600 max-w-2xl mx-auto">{t[uiLang].desc}</p>
        </div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[Shield, CheckCircle, FileText, Lock, CloudLightning].map((Icon, i) => (
            <div key={i} className="bg-white p-3 rounded-xl text-center shadow-sm border">
              <Icon className="w-5 h-5 mx-auto mb-1 text-blue-500" />
              <span className="text-xs font-medium text-slate-700">{t[uiLang].features[i]}</span>
              <p className="text-xs text-slate-400 mt-1">{t[uiLang].featureDesc[i]}</p>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between">
            <div className="flex gap-4">
              <div><span className="text-xs text-slate-500 block mb-1">{t[uiLang].textLang}</span><div className="flex gap-1"><button onClick={() => setTextLang('zh')} className={`px-3 py-1 rounded text-sm ${textLang === 'zh' ? 'bg-blue-500 text-white' : 'bg-white'}`}>中文</button><button onClick={() => setTextLang('en')} className={`px-3 py-1 rounded text-sm ${textLang === 'en' ? 'bg-blue-500 text-white' : 'bg-white'}`}>EN</button></div></div>
              <div><span className="text-xs text-slate-500 block mb-1">{t[uiLang].mode}</span><div className="flex gap-1"><button onClick={() => setMode('standard')} className={`px-3 py-1 rounded text-sm ${mode === 'standard' ? 'bg-purple-500 text-white' : 'bg-white'}`}>{t[uiLang].std}</button><button onClick={() => setMode('deep')} className={`px-3 py-1 rounded text-sm ${mode === 'deep' ? 'bg-purple-500 text-white' : 'bg-white'}`}>{t[uiLang].deep}</button></div></div>
            </div>
            <div className="flex gap-4 text-sm"><span className="text-slate-500">{pricePerThousandLabel}</span><span>{t[uiLang].wc}: <b>{wc}</b></span><span>{t[uiLang].pr}: <b className="text-blue-600">{cur}{price}</b></span></div>
          </div>
          <div className="p-6">
            {!result ? (
              <>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 mb-4 bg-blue-50">
                  <Upload className="w-8 h-8 mx-auto text-blue-500" />
                  <p className="text-blue-600 font-medium mt-2">{isUploading ? t[uiLang].uploading : t[uiLang].up}</p>
                  <p className="text-slate-400 text-sm">.docx / .txt</p>
                </div>
                <input ref={fileRef} type="file" accept=".docx,.txt" onChange={upload} className="hidden" />
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder={t[uiLang].p} className="w-full h-48 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500" />
                <div className="mt-4 flex justify-end"><button onClick={submit} disabled={!text.trim() || submitting} className="px-6 py-3 bg-blue-500 text-white rounded-xl disabled:opacity-50 flex items-center gap-2">{submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}{submitting ? t[uiLang].uploading : t[uiLang].b}</button></div>
              </>
            ) : (
              <div className="space-y-4">
                <div className={`p-3 rounded-xl ${result.status === 'completed' ? 'bg-green-50' : 'bg-slate-50'}`}><span className={result.status === 'completed' ? 'text-green-700' : 'text-slate-600'}>{result.status === 'completed' ? t[uiLang].rs : (result.status === 'failed' ? (uiLang === 'zh' ? '处理失败' : 'Failed') : (uiLang === 'zh' ? '处理中...' : 'Processing...'))}</span></div>
                {result.result && <div className="p-4 bg-slate-50 rounded-xl"><div className="flex justify-between mb-2"><span className="text-sm font-medium">{t[uiLang].rs}</span><button onClick={copy} className="text-sm text-blue-500">{copied ? t[uiLang].cp : t[uiLang].cp}</button></div><p className="whitespace-pre-wrap">{result.result}</p></div>}
                <button onClick={reset} className="w-full py-3 bg-slate-100 rounded-xl">{t[uiLang].b}</button>
              </div>
            )}
          </div>
        </div>
        <p className="text-center text-xs text-slate-400 mt-6">{t[uiLang].footer}</p>
      </main>
      {showAuth && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6"><div className="flex justify-between mb-4"><h2 className="text-xl font-bold">{authMode === 'login' ? t[uiLang].in : t[uiLang].reg}</h2><button onClick={() => setShowAuth(false)}><X className="w-5 h-5" /></button></div><div className="space-y-3"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" className="w-full p-2 border rounded-lg" />{authMode === 'register' && <input type="text" value={nick} onChange={e => setNick(e.target.value)} placeholder="Nickname" className="w-full p-2 border rounded-lg" />}<div className="relative"><input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="Password" className="w-full p-2 border rounded-lg pr-8" /><button onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-2">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>{authMode === 'register' && <input type="password" value={cpwd} onChange={e => setCpwd(e.target.value)} placeholder="Confirm Password" className="w-full p-2 border rounded-lg" />}{err && <p className="text-red-500 text-sm">{err}</p>}<button onClick={auth} className="w-full py-3 bg-blue-500 text-white rounded-lg">{authMode === 'login' ? t[uiLang].in : t[uiLang].reg}</button><p className="text-center text-sm text-slate-500">{authMode === 'login' ? (uiLang === 'zh' ? '没有账号？' : 'No account?') : (uiLang === 'zh' ? '已有账号？' : 'Has account?')}<button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-500 ml-1">{authMode === 'login' ? t[uiLang].reg : t[uiLang].in}</button></p></div></div></div>)}
    </div>
  );
}
