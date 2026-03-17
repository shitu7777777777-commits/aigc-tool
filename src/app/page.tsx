'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Copy, Check, RefreshCw, FileText, Globe, Zap, Upload, User, LogIn, X, Eye, EyeOff, Shield, CloudLightning, Lock, CheckCircle } from 'lucide-react';

type Language = 'zh' | 'en';
type Mode = 'standard' | 'deep';
type TaskStatus = 'pending' | 'processing' | 'completed' | 'failed';

interface RegionInfo { country: string; currency: string; currencySymbol: string; pricePerThousand: number; }
interface UserInfo { userId: number; email: string; nickname: string; balance: number; monthlyPackage: boolean; monthlyWordsLimit?: number; monthlyWordsUsed?: number; }
interface TaskResult { taskId: string; status?: TaskStatus; result?: string; error?: string; }

const translations = {
  zh: { title: 'AI降', subtitle: '一键降AI，全平台检测无忧', inputPlaceholder: '请输入需要降AI的文本...', submit: '立即降AI', submitting: '处理中...', language: '语言', mode: '模式', standard: '标准', deep: '深度', wordCount: '字数', price: '价格', result: '结果', copy: '复制', login: '登录', logout: '退出', balance: '余额' },
  en: { title: 'AI Rewriter', subtitle: 'One-click AI detection removal', inputPlaceholder: 'Enter text...', submit: 'Start', submitting: 'Processing...', language: 'Lang', mode: 'Mode', standard: 'Standard', deep: 'Deep', wordCount: 'Words', price: 'Price', result: 'Result', copy: 'Copy', login: 'Login', logout: 'Logout', balance: 'Balance' }
};

export default function Home() {
  const [lang, setLang] = useState<Language>('zh');
  const [mode, setMode] = useState<Mode>('standard');
  const [inputText, setInputText] = useState('');
  const [taskId, setTaskId] = useState('');
  const [result, setResult] = useState<TaskResult | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const [region, setRegion] = useState<RegionInfo | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [user, setUser] = useState<UserInfo | null>(null);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [nickname, setNickname] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const t = translations[lang];

  useEffect(() => {
    fetch('/api/region').then(r=>r.json()).then(d=>{ if(d.code===200) setRegion(d.data); }).catch(()=>{});
    const uid = localStorage.getItem('userId');
    if(uid) fetch('/api/user',{headers:{'x-user-id':uid}}).then(r=>r.json()).then(d=>{ if(d.code===200) setUser(d.data); }).catch(()=>{});
  }, []);

  const wordCount = lang==='zh'? inputText.replace(/\s/g,'').length : inputText.trim().split(/\s+/).length;
  const currencySymbol = region?.currencySymbol||(lang==='zh'?'¥':'$');
  const pricePerThousand = region?.pricePerThousand||(lang==='zh'?2:0.5);
  const price = Math.ceil(wordCount/1000)*pricePerThousand;

  const handleSubmit = async () => {
    if(!inputText.trim()||isSubmitting) return;
    const uid = localStorage.getItem('userId');
    if(!uid){ alert('请先登录'); setShowAuthModal(true); return; }
    setIsSubmitting(true);
    try {
      const res = await fetch('/api/task/submit',{method:'POST',headers:{'Content-Type':'application/json','x-user-id':uid},body:JSON.stringify({text:inputText,language:lang,mode})});
      const data = await res.json();
      if(data.code===200){ setTaskId(data.data.taskId); setResult(data.data); }
      else alert(data.message||'失败');
    }catch(e){ alert('错误'); }
    setIsSubmitting(false);
  };

  const handleCopy = () => { if(result?.result){ navigator.clipboard.writeText(result.result); setCopied(true); setTimeout(()=>setCopied(false),2000); } };
  const handleReset = () => { setInputText(''); setTaskId(''); setResult(null); };
  const handleLogout = () => { localStorage.removeItem('token'); localStorage.removeItem('userId'); setUser(null); };
  const handleFileUpload = async (file:File) => {
    if(!file) return;
    const fd = new FormData(); fd.append('file',file);
    const res = await fetch('/api/upload',{method:'POST',body:fd});
    const data = await res.json();
    if(data.code===200) setInputText(data.data.text);
  };
  const handleAuth = async () => {
    setAuthError('');
    if(authMode==='register'&&password!==confirmPassword){ setAuthError('密码不一致'); return; }
    try {
      const res = await fetch('/api/user',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:authMode,email,password,nickname})});
      const data = await res.json();
      if(data.code===200){ localStorage.setItem('token',data.data.token); localStorage.setItem('userId',data.data.userId); setUser(data.data); setShowAuthModal(false); setEmail(''); setPassword(''); setConfirmPassword(''); setNickname(''); }
      else setAuthError(data.message);
    }catch(e){ setAuthError('请求失败'); }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <header className="bg-white/90 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-4xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center"><Zap className="w-6 h-6 text-white"/></div>
            <h1 className="text-xl font-bold text-slate-800">{t.title}</h1>
            {region && <span className="text-xs px-2 py-1 bg-slate-100 rounded-full">{region.country==='CN'?'CN':'EN'}</span>}
          </div>
          <div className="flex items-center gap-3">
            <button onClick={()=>setLang(lang==='zh'?'en':'zh')} className="px-3 py-2 bg-slate-100 rounded-lg text-sm">{lang==='zh'?'EN':'中文'}</button>
            {user?(
              <div className="flex items-center gap-2">
                <div className="px-3 py-2 bg-blue-50 rounded-lg text-sm">
                  <span className="text-blue-700">{user.nickname}</span>
                  <span className="text-slate-400 mx-1">|</span>
                  <span className="text-green-600">{user.monthlyPackage?`${(user.monthlyWordsLimit||0)-(user.monthlyWordsUsed||0)}字`:`${currencySymbol}${user.balance}`}</span>
                </div>
                <button onClick={handleLogout} className="text-sm text-slate-500">{t.logout}</button>
              </div>
            ):(<button onClick={()=>{setAuthMode('login');setShowAuthModal(true)}} className="px-4 py-2 bg-blue-500 text-white rounded-lg text-sm">{t.login}</button>)}
          </div>
        </div>
      </header>
      <main className="max-w-4xl mx-auto px-4 py-8">
        <div className="text-center mb-8"><h2 className="text-3xl font-bold text-slate-800 mb-2">{t.subtitle}</h2></div>
        <div className="grid grid-cols-5 gap-2 mb-6">
          {[{icon:Shield,text:'降AIGC'},{icon:CheckCircle,text:'全平台'},{icon:FileText,text:'语义改写'},{icon:Lock,text:'安全私密'},{icon:CloudLightning,text:'极速处理'}].map((item,i)=>(
            <div key={i} className="bg-white p-3 rounded-xl text-center shadow-sm border"><item.icon className="w-5 h-5 mx-auto mb-1 text-blue-500"/><span className="text-xs">{item.text}</span></div>
          ))}
        </div>
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
          <div className="bg-slate-50 px-6 py-4 flex flex-wrap items-center justify-between">
            <div className="flex gap-4">
              <div><span className="text-xs text-slate-500 block mb-1">{t.language}</span><div className="flex gap-1"><button onClick={()=>setLang('zh')} className={`px-3 py-1 rounded text-sm ${lang==='zh'?'bg-blue-500 text-white':'bg-white'}`}>中文</button><button onClick={()=>setLang('en')} className={`px-3 py-1 rounded text-sm ${lang==='en'?'bg-blue-500 text-white':'bg-white'}`}>EN</button></div></div>
              <div><span className="text-xs text-slate-500 block mb-1">{t.mode}</span><div className="flex gap-1"><button onClick={()=>setMode('standard')} className={`px-3 py-1 rounded text-sm ${mode==='standard'?'bg-purple-500 text-white':'bg-white'}`}>{t.standard}</button><button onClick={()=>setMode('deep')} className={`px-3 py-1 rounded text-sm ${mode==='deep'?'bg-purple-500 text-white':'bg-white'}`}>{t.deep}</button></div></div>
            </div>
            <div className="flex gap-4 text-sm"><span>{t.wordCount}: <b>{wordCount}</b></span><span>{t.price}: <b className="text-blue-600">{currencySymbol}{price}</b></span></div>
          </div>
          <div className="p-6">
            {!result?(
              <>
                <div onClick={()=>fileInputRef.current?.click()} className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center cursor-pointer hover:border-blue-400 mb-4"><Upload className="w-8 h-8 mx-auto text-slate-400"/><p className="text-slate-500 text-sm">上传文档</p></div>
                <input ref={fileInputRef} type="file" accept=".docx,.txt" onChange={e=>handleFileUpload(e.target.files?.[0]!)} className="hidden"/>
                <textarea value={inputText} onChange={e=>setInputText(e.target.value)} placeholder={t.inputPlaceholder} className="w-full h-48 p-4 border rounded-xl resize-none focus:ring-2 focus:ring-blue-500"/>
                <div className="mt-4 flex justify-end"><button onClick={handleSubmit} disabled={!inputText.trim()||isSubmitting} className="px-6 py-3 bg-blue-500 text-white rounded-xl disabled:opacity-50">{isSubmitting?'...':t.submit}</button></div>
              </>
            ):(
              <div className="space-y-4">
                <div className={`p-3 rounded-xl ${result.status==='completed'?'bg-green-50':'bg-slate-50'}`}>
                  <span className={result.status==='completed'?'text-green-700':'text-slate-600'}>{result.status==='completed'?t.result:'处理中...'}</span>
                </div>
                {result.result && <div className="p-4 bg-slate-50 rounded-xl"><div className="flex justify-between mb-2"><span className="text-sm">{t.result}</span><button onClick={handleCopy} className="text-sm text-blue-500">{copied?'OK':t.copy}</button></div><p className="whitespace-pre-wrap">{result.result}</p></div>}
                <button onClick={handleReset} className="w-full py-3 bg-slate-100 rounded-xl">{t.submit}</button>
              </div>
            )}
          </div>
        </div>
      </main>
      {showAuthModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl w-full max-w-sm p-6">
            <div className="flex justify-between mb-4"><h2 className="text-xl font-bold">{authMode==='login'?t.login:'注册'}</h2><button onClick={()=>setShowAuthModal(false)}><X className="w-5 h-5"/></button></div>
            <div className="space-y-3">
              <input type="email" value={email} onChange={e=>setEmail(e.target.value)} placeholder="邮箱" className="w-full p-2 border rounded-lg"/>
              {authMode==='register' && <input type="text" value={nickname} onChange={e=>setNickname(e.target.value)} placeholder="昵称" className="w-full p-2 border rounded-lg"/>}
              <div className="relative"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} placeholder="密码" className="w-full p-2 border rounded-lg pr-8"/><button onClick={()=>setShowPassword(!showPassword)} className="absolute right-2 top-2">{showPassword?<EyeOff className="w-4 h-4"/>:<Eye className="w-4 h-4"/>}</button></div>
              {authMode==='register' && <input type="password" value={confirmPassword} onChange={e=>setConfirmPassword(e.target.value)} placeholder="确认密码" className="w-full p-2 border rounded-lg"/>}
              {authError && <p className="text-red-500 text-sm">{authError}</p>}
              <button onClick={handleAuth} className="w-full py-3 bg-blue-500 text-white rounded-lg">{authMode==='login'?t.login:'注册'}</button>
              <p className="text-center text-sm text-slate-500">{authMode==='login'?'没有账号？':'已有账号？'}<button onClick={()=>setAuthMode(authMode==='login'?'register':'login')} className="text-blue-500 ml-1">{authMode==='login'?'注册':'登录'}</button></p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
