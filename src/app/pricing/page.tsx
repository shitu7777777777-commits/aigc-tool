'use client';

import { useState, useEffect } from 'react';
import { Check, CreditCard, Zap, Crown, Shield, FileText, Globe } from 'lucide-react';

type Language = 'zh' | 'en';

interface Package {
  id: number;
  name: string;
  nameEn: string;
  price: number;
  currency: string;
  wordsLimit: number;
  description: string;
  descriptionEn: string;
}

interface RegionInfo {
  country: string;
  currency: string;
  currencySymbol: string;
}

const translations = {
  zh: {
    title: '套餐中心',
    subtitle: '选择适合您的套餐',
    buy: '立即购买',
    current: '当前套餐',
    features: ['优先处理', '更多字数'],
    words: '字',
    month: '月',
  },
  en: {
    title: 'Pricing Plans',
    subtitle: 'Choose your plan',
    buy: 'Subscribe Now',
    current: 'Current Plan',
    features: ['Faster Processing', 'More Words'],
    words: 'words',
    month: '/month',
  },
};

export default function Pricing() {
  const [lang, setLang] = useState<Language>('zh');
  const [region, setRegion] = useState<RegionInfo | null>(null);
  const t = translations[lang];

  useEffect(() => {
    fetch('/api/region')
      .then(res => res.json())
      .then(data => {
        if (data.code === 200) {
          setRegion(data.data);
          if (data.data.country !== 'CN') {
            setLang('en');
          }
        }
      })
      .catch(console.error);
  }, []);

  // 套餐数据
  const packages: Package[] = region?.country === 'CN' 
    ? [
        { id: 2, name: '包月基础版', nameEn: 'Basic', price: 39, currency: '¥', wordsLimit: 30000, description: '每月3万字', descriptionEn: '30,000 words/month' },
        { id: 3, name: '包月进阶版', nameEn: 'Pro', price: 49, currency: '¥', wordsLimit: 50000, description: '每月5万字', descriptionEn: '50,000 words/month' },
        { id: 4, name: '包月旗舰版', nameEn: 'Enterprise', price: 59, currency: '¥', wordsLimit: 70000, description: '每月7万字', descriptionEn: '70,000 words/month' },
      ]
    : [
        { id: 2, name: 'Basic', nameEn: 'Basic', price: 11, currency: '$', wordsLimit: 30000, description: '30,000 words/month', descriptionEn: '30,000 words/month' },
        { id: 3, name: 'Pro', nameEn: 'Pro', price: 22, currency: '$', wordsLimit: 70000, description: '70,000 words/month', descriptionEn: '70,000 words/month' },
        { id: 4, name: 'Enterprise', nameEn: 'Enterprise', price: 46, currency: '$', wordsLimit: 100000, description: '100,000 words/month', descriptionEn: '100,000 words/month' },
      ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 py-12">
      <div className="max-w-6xl mx-auto px-4">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">{t.title}</h1>
          <p className="text-slate-600 text-lg">{t.subtitle}</p>
          {region && (
            <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm">
              <Globe className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">
                {region.country === 'CN' ? '🇨🇳 中国大陆' : '🌍 Global'}
              </span>
            </div>
          )}
        </div>

        {/* Packages Grid */}
        <div className="grid md:grid-cols-3 gap-8">
          {packages.map((pkg, index) => (
            <div 
              key={pkg.id}
              className={`relative bg-white rounded-2xl shadow-xl border-2 overflow-hidden ${
                index === 1 ? 'border-blue-500 ring-4 ring-blue-500/20' : 'border-slate-200'
              }`}
            >
              {/* Popular Badge */}
              {index === 1 && (
                <div className="absolute top-0 left-0 right-0 bg-gradient-to-r from-blue-500 to-purple-600 text-white text-center py-2 text-sm font-medium">
                  <Crown className="inline w-4 h-4 mr-1" />
                  {lang === 'zh' ? '最受欢迎' : 'Most Popular'}
                </div>
              )}

              <div className="p-8 pt-12">
                {/* Package Name */}
                <h3 className="text-2xl font-bold text-slate-800 mb-2">
                  {lang === 'zh' ? pkg.name : pkg.nameEn}
                </h3>
                <p className="text-slate-500 mb-6">
                  {lang === 'zh' ? pkg.description : pkg.descriptionEn}
                </p>

                {/* Price */}
                <div className="mb-8">
                  <span className="text-4xl font-bold text-slate-800">
                    {pkg.currency}{pkg.price}
                  </span>
                  <span className="text-slate-500">/{t.month}</span>
                </div>

                {/* Features */}
                <ul className="space-y-3 mb-8">
                  <li className="flex items-center gap-3 text-slate-600">
                    <Check className="w-5 h-5 text-green-500" />
                    <span>{lang === 'zh' ? `${pkg.wordsLimit.toLocaleString()} ${t.words}` : `${pkg.wordsLimit.toLocaleString()} ${t.words}`}</span>
                  </li>
                  {t.features.map((feature, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600">
                      <Check className="w-5 h-5 text-green-500" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Buy Button */}
                <button className={`w-full py-4 rounded-xl font-medium transition-all ${
                  index === 1
                    ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 shadow-lg'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                }`}>
                  <CreditCard className="inline w-5 h-5 mr-2" />
                  {t.buy}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <p className="text-center text-slate-400 mt-12 text-sm">
          {lang === 'zh' 
            ? '套餐价格包含税费，购买后立即生效' 
            : 'All prices include tax. Subscription starts immediately after purchase.'}
        </p>
      </div>
    </div>
  );
}
