'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Copy, Check, RefreshCw, FileText, Globe, Zap, Upload, User, LogIn, X, Eye, EyeOff, Shield, CloudLightning, Lock, CheckCircle, Crown } from 'lucide-react';

export default function Home() {
  const [lang, setLang] = useState('zh');
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
    zh: { t: 'AI降', s: '一键降AI，全平台检测无忧', p: '请输入文本或上传文档...', b: '立即降AI', l: '语言', m: '模式', std: '标准', deep: '深度', wc: '字数', pr: '价格', rs: '结果', cp: '复制', in: '登录', up: '上传文档', lg: '退出', bl: '余额', reg: '注册', pricing: '套餐', uploading: '解析中...' },
    en: { t: 'AI', s: 'Remove AI Detection', p: 'Enter text...', b: 'Start', l: 'Lang', m: 'Mode', std: 'Std', deep: 'Deep', wc: 'Words', pr: 'Price', rs: 'Result', cp: 'Copy', in: 'Login', up: 'Upload', lg: 'Logout', bl: 'Balance', reg: 'Register', pricing: 'Pricing', uploading: 'Parsing...' }
  };

  useEffect(() => {
    fetch('/api/region').then(r => r.json()).then(d => { if (d.code === 200) setRegion(d.data); }).catch(() => { });
    const uid = localStorage.getItem('userId');
    if (uid) fetch('/api/user', { headers: { 'x-user-id': uid } }).then(r => r.json()).then(d => { if (d.code === 200) setUser(d.data); }).catch(() => { });
  }, []);

  const wc = lang === 'zh' ? text.replace(/\s/g, '').length : text.trim().split(/\s+/).length;
  const cur = region?.currencySymbol || (lang === 'zh' ? '¥' : '$');
  const pp = region?.pricePerThousand || (lang === 'zh' ? 2 : 0.5);
  const price = Math.ceil(wc / 1000) * pp;

  const submit = async () => {
    if (!text.trim() || submitting) return;
    const uid = localStorage.getItem('userId');
    if (!uid) { alert('请先登录'); setShowAuth(true); return; }
    setSubmitting(true);
    try {
      const r = await fetch('/api/task/submit', { method: 'POST', headers: { 'Content-Type': 'application/json', 'x-user-id': uid }, body: JSON.stringify({ text, language: lang, mode }) });
      const d = await r.json();
      if (d.code === 200) setResult(d.data);
      else alert(d.message || '失败');
    } catch (e) { alert('错误'); }
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
      if (d.code === 200) { setText(d.data.text); alert('上传成功！' + d.data.wordCount + '字'); }
      else { alert(d.message || '上传失败'); }
    } catch (e) { alert('上传失败'); }
    setIsUploading(false);
  };

  const auth = async () => {
    setErr('');
    if (authMode === 'register' && pwd !== cpwd) { setErr('密码不一致'); return; }
    if (authMode === 'register' && pwd.length < 8) { setErr('密码至少8位'); return; }
    try {
      const r = await fetch('/api/user', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: authMode, email, password: pwd, nickname: nick }) });
      const d = await r.json();
      if (d.code === 200) { localStorage.setItem('token', d.data.token); localStorage.setItem('userId', d.data.userId); setUser(d.data); setShowAuth(false); setEmail(''); setPwd(''); setCpwd(''); setNick(''); }
      else setErr(d.message);
    } catch (e) { setErr('请求失败'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm border-b sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white" /></div>
            <h1 className="text-xl font-bold">{t[lang].t}</h1>
            {region && <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{region.country === 'CN' ? 'CN' : 'EN'}</span>}
          </div>
          <div className="flex items-center gap-3">
            <a href="/pricing" className="px-3 py-2 bg-gradient-to-r from-amber-500 to-orange-500 text-white rounded-lg text-sm flex items-center gap-1"><Crown className="w-4 h-4" />{t[lang].pricing}</a>
            <button onClick={() => setLang(lang === 'zh' ? 'en' : 'zh')} className="px-3 py-2 bg-slate-100 rounded-lg text-sm">{lang === 'zh' ? 'EN' : '中文'}</button>
            {user ? (
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm"><span className="text-blue-700">{user.nickname}</span><span className="text-slate-400 mx-1">|</span><span className="text-green-600">{user.monthlyPackage ? `${(user.monthlyWordsLimit || 0) - (user.monthlyWordsUsed || 0)}字` : `${cur}${user.balance}`}</span></div>
                <button onClick={logout} className="text-sm text-slate-500">{t[lang].lg}</button>
              </div>
            ) : (<button onClick={() => { setAuthMode('login'); setShowAuth(true); }} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">{t[lang].in}</button>)}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-slate-800">{t[lang].s}</h2></div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[Shield, CheckCircle, FileText, Lock, CloudLightning].map((Icon, i) => (<div key={i} className="bg-white p-3 rounded-xl text-center shadow-sm border"><Icon className="w-5 h-5 mx-auto mb-1 text-blue-500" /><span className="text-xs">{['降AIGC', '全平台', '语义改写', '安全私密', '极速处理'][i]}</span></div>))}
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between">
            <div className="flex gap-4">
              <div><span className="text-xs text-slate-500 block mb-1">{t[lang].l}</span><div className="flex gap-1"><button onClick={() => setLang('zh')} className={`px-3 py-1 rounded text-sm ${lang === 'zh' ? 'bg-blue-500 text-white' : 'bg-white'}`}>中文</button><button onClick={() => setLang('en')} className={`px-3 py-1 rounded text-sm ${lang === 'en' ? 'bg-blue-500 text-white' : 'bg-white'}`}>EN</button></div></div>
              <div><span className="text-xs text-slate-500 block mb-1">{t[lang].m}</span><div className="flex gap-1"><button onClick={() => setMode('standard')} className={`px-3 py-1 rounded text-sm ${mode === 'standard' ? 'bg-purple-500 text-white' : 'bg-white'}`}>{t[lang].std}</button><button onClick={() => setMode('deep')} className={`px-3 py-1 rounded text-sm ${mode === 'deep' ? 'bg-purple-500 text-white' : 'bg-white'}`}>{t[lang].deep}</button></div></div>
            </div>
            <div className="flex gap-4 text-sm"><span>{t[lang].wc}: <b>{wc}</b></span><span>{t[lang].pr}: <b className="text-blue-600">{cur}{price}</b></span></div>
          </div>
          <div className="p-6">
            {!result ? (
              <>
                <div onClick={() => fileRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 mb-4 bg-blue-50">
                  <Upload className="w-8 h-8 mx-auto text-blue-500" />
                  <p className="text-blue-600 font-medium mt-2">{isUploading ? t[lang].uploading : t[lang].up}</p>
                  <p className="text-slate-400 text-sm">支持 .docx 和 .txt 文件</p>
                </div>
                <input ref={fileRef} type="file" accept=".docx,.txt" onChange={upload} className="hidden" />
                <textarea value={text} onChange={e => setText(e.target.value)} placeholder={t[lang].p} className="w-full h-48 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500" />
                <div className="mt-4 flex justify-end"><button onClick={submit} disabled={!text.trim() || submitting} className="px-6 py-3 bg-blue-500 text-white rounded-xl disabled:opacity-50 flex items-center gap-2">{submitting ? <RefreshCw className="w-5 h-5 animate-spin" /> : null}{submitting ? t[lang].uploading : t[lang].b}</button></div>
              </>
            ) : (
              <div className="space-y-4">
                <div className={`p-3 rounded-xl ${result.status === 'completed' ? 'bg-green-50' : 'bg-slate-50'}`}><span className={result.status === 'completed' ? 'text-green-700' : 'text-slate-600'}>{result.status === 'completed' ? t[lang].rs : (result.status === 'failed' ? '处理失败' : '处理中...')}</span></div>
                {result.result && <div className="p-4 bg-slate-50 rounded-xl"><div className="flex justify-between mb-2"><span className="text-sm font-medium">{t[lang].rs}</span><button onClick={copy} className="text-sm text-blue-500">{copied ? t[lang].cp : t[lang].cp}</button></div><p className="whitespace-pre-wrap">{result.result}</p></div>}
                <button onClick={reset} className="w-full py-3 bg-slate-100 rounded-xl">{t[lang].b}</button>
              </div>
            )}
          </div>
        </div>
      </main>
      {showAuth && (<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"><div className="bg-white rounded-2xl w-full max-w-sm p-6"><div className="flex justify-between mb-4"><h2 className="text-xl font-bold">{authMode === 'login' ? t[lang].in : t[lang].reg}</h2><button onClick={() => setShowAuth(false)}><X className="w-5 h-5" /></button></div><div className="space-y-3"><input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="邮箱" className="w-full p-2 border rounded-lg" />{authMode === 'register' && <input type="text" value={nick} onChange={e => setNick(e.target.value)} placeholder="昵称" className="w-full p-2 border rounded-lg" />}<div className="relative"><input type={showPwd ? 'text' : 'password'} value={pwd} onChange={e => setPwd(e.target.value)} placeholder="密码" className="w-full p-2 border rounded-lg pr-8" /><button onClick={() => setShowPwd(!showPwd)} className="absolute right-2 top-2">{showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div>{authMode === 'register' && <input type="password" value={cpwd} onChange={e => setCpwd(e.target.value)} placeholder="确认密码" className="w-full p-2 border rounded-lg" />}{err && <p className="text-red-500 text-sm">{err}</p>}<button onClick={auth} className="w-full py-3 bg-blue-500 text-white rounded-lg">{authMode === 'login' ? t[lang].in : t[lang].reg}</button><p className="text-center text-sm text-slate-500">{authMode === 'login' ? '没有账号？' : '已有账号？'}<button onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')} className="text-blue-500 ml-1">{authMode === 'login' ? t[lang].reg : t[lang].in}</button></p></div></div></div>)}
    </div>
  );
}
