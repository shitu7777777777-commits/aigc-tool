import { NextRequest, NextResponse } from 'next/server';
import { query, insert, update } from '@/lib/db';
import { v4 as uuidv4 } from 'uuid';
import crypto from 'crypto';

// 简单哈希密码
function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

// 生成JWT令牌（简化版）
function generateToken(userId: number): string {
  const payload = `${userId}:${Date.now()}`;
  return Buffer.from(payload).toString('base64');
}

// 密码强度验证
function validatePassword(password: string): { valid: boolean; message: string } {
  if (password.length < 8) {
    return { valid: false, message: '密码至少需要8位' };
  }
  if (!/[A-Z]/.test(password)) {
    return { valid: false, message: '密码必须包含大写字母' };
  }
  if (!/[a-z]/.test(password)) {
    return { valid: false, message: '密码必须包含小写字母' };
  }
  if (!/[0-9]/.test(password)) {
    return { valid: false, message: '密码必须包含数字' };
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    return { valid: false, message: '密码必须包含特殊符号' };
  }
  return { valid: true, message: '密码强度通过' };
}

// 注册
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, email, password, nickname } = body;
    
    if (action === 'register') {
      // 密码强度验证
      const pwdCheck = validatePassword(password);
      if (!pwdCheck.valid) {
        return NextResponse.json({
          code: 400,
          message: pwdCheck.message + '，请使用大小写字母、数字和特殊符号的组合',
        }, { status: 400 });
      }
      
      // 注册
      if (!email || !password) {
        return NextResponse.json({
          code: 400,
          message: '邮箱和密码不能为空',
        }, { status: 400 });
      }
      
      // 检查邮箱是否已存在
      const existing = await query<any[]>(
        'SELECT id FROM users WHERE email = ?',
        [email]
      );
      
      if (existing.length > 0) {
        return NextResponse.json({
          code: 400,
          message: '该邮箱已注册',
        }, { status: 400 });
      }
      
      // 创建用户
      const userId = await insert('users', {
        email,
        password_hash: hashPassword(password),
        nickname: nickname || email.split('@')[0],
        balance: 0,
        monthly_package: 0,
        monthly_words_limit: 0,
        monthly_words_used: 0,
        status: 1,
      });
      
      const token = generateToken(userId);
      
      return NextResponse.json({
        code: 200,
        message: '注册成功',
        data: {
          userId,
          token,
          email,
          nickname: nickname || email.split('@')[0],
          balance: 0,
        },
      });
    }
    
    if (action === 'login') {
      // 登录
      if (!email || !password) {
        return NextResponse.json({
          code: 400,
          message: '邮箱和密码不能为空',
        }, { status: 400 });
      }
      
      const users = await query<any[]>(
        'SELECT * FROM users WHERE email = ? AND password_hash = ?',
        [email, hashPassword(password)]
      );
      
      if (users.length === 0) {
        return NextResponse.json({
          code: 401,
          message: '邮箱或密码错误',
        }, { status: 401 });
      }
      
      const user = users[0];
      const token = generateToken(user.id);
      
      return NextResponse.json({
        code: 200,
        message: '登录成功',
        data: {
          userId: user.id,
          token,
          email: user.email,
          nickname: user.nickname,
          balance: user.balance,
          monthlyPackage: user.monthly_package,
          monthlyExpire: user.monthly_expire,
        },
      });
    }
    
    return NextResponse.json({
      code: 400,
      message: '无效的操作',
    }, { status: 400 });
    
  } catch (error: any) {
    console.error('用户操作失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}

// 获取当前用户信息
export async function GET(request: NextRequest) {
  try {
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        code: 401,
        message: '未登录',
      }, { status: 401 });
    }
    
    const users = await query<any[]>(
      'SELECT id, email, nickname, avatar, balance, monthly_package, monthly_expire, monthly_words_limit, monthly_words_used, created_at FROM users WHERE id = ?',
      [parseInt(userId)]
    );
    
    if (users.length === 0) {
      return NextResponse.json({
        code: 404,
        message: '用户不存在',
      }, { status: 404 });
    }
    
    const user = users[0];
    
    return NextResponse.json({
      code: 200,
      message: '获取成功',
      data: {
        userId: user.id,
        email: user.email,
        nickname: user.nickname,
        avatar: user.avatar,
        balance: user.balance,
        monthlyPackage: user.monthly_package,
        monthlyExpire: user.monthly_expire,
        monthlyWordsLimit: user.monthly_words_limit,
        monthlyWordsUsed: user.monthly_words_used,
        createdAt: user.created_at,
      },
    });
  } catch (error: any) {
    console.error('获取用户信息失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}
