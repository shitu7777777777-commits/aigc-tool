import { NextRequest, NextResponse } from 'next/server';

// 简单的IP地区判断（生产环境建议用纯真IP库或第三方服务）
function detectCountry(ip: string): 'CN' | 'US' | 'OTHER' {
  // 本地开发环境默认返回CN
  if (!ip || ip === '127.0.0.1' || ip === '::1' || ip.startsWith('192.168.') || ip.startsWith('10.')) {
    return 'CN';
  }
  
  // 这里可以用第三方服务如 ipapi.co
  // 简化版：实际项目建议接入真实IP库
  return 'CN';
}

// 获取用户IP
function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  if (forwarded) {
    return forwarded.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') || '127.0.0.1';
}

export async function GET(request: NextRequest) {
  try {
    const ip = getClientIP(request);
    const country = detectCountry(ip);
    
    // 根据地区返回定价
    const pricing = country === 'CN' 
      ? {
          currency: 'CNY',
          currencySymbol: '¥',
          pricePerThousand: 2,
          locale: 'zh-CN',
        }
      : {
          currency: 'USD',
          currencySymbol: '$',
          pricePerThousand: 0.5,
          locale: 'en-US',
        };
    
    return NextResponse.json({
      code: 200,
      message: '获取成功',
      data: {
        country,
        ip,
        ...pricing,
      },
    });
  } catch (error: any) {
    console.error('获取地区信息失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}
