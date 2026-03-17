import { NextRequest, NextResponse } from 'next/server';
import { query } from '@/lib/db';
import { Language, ProcessMode } from '@/types';
import { countWords, estimatePrice } from '@/services/gpt';

// 提交任务
export async function POST(request: NextRequest) {
  try {
    // 从请求头获取用户ID
    const userId = request.headers.get('x-user-id');
    
    if (!userId) {
      return NextResponse.json({
        code: 401,
        message: '请先登录',
      }, { status: 401 });
    }
    
    const body = await request.json();
    const { text, language = 'zh', mode = 'standard' } = body;
    
    // 参数验证
    if (!text || text.trim().length === 0) {
      return NextResponse.json({
        code: 400,
        message: '文本不能为空',
      }, { status: 400 });
    }
    
    if (text.length > 50000) {
      return NextResponse.json({
        code: 400,
        message: '文本长度不能超过50000字',
      }, { status: 400 });
    }
    
    // 验证语言和模式
    if (!Object.values(Language).includes(language)) {
      return NextResponse.json({
        code: 400,
        message: '无效的语言类型',
      }, { status: 400 });
    }
    
    if (!Object.values(ProcessMode).includes(mode)) {
      return NextResponse.json({
        code: 400,
        message: '无效的处理模式',
      }, { status: 400 });
    }
    
    // 获取用户信息
    const users = await query<any[]>(
      'SELECT * FROM users WHERE id = ?',
      [parseInt(userId)]
    );
    
    if (!users || users.length === 0) {
      return NextResponse.json({
        code: 401,
        message: '用户不存在',
      }, { status: 401 });
    }
    
    const user = users[0];
    const wordCount = countWords(text, language);
    const price = estimatePrice(wordCount, language);
    
    // 检查套餐或余额
    let canUse = false;
    let message = '';
    
    if (user.monthly_package && user.monthly_words_limit > 0) {
      // 有套餐，检查剩余字数
      const remainingWords = (user.monthly_words_limit || 0) - (user.monthly_words_used || 0);
      if (remainingWords >= wordCount) {
        canUse = true;
        message = '使用套餐';
      } else {
        canUse = false;
        message = '套餐字数不足，请升级套餐或购买单次';
      }
    }
    
    // 如果套餐不能用，检查余额
    if (!canUse) {
      if (user.balance >= price) {
        canUse = true;
        message = '使用余额支付';
      } else {
        // 余额也不够
        return NextResponse.json({
          code: 402,
          message: '余额不足，请先充值或购买套餐',
          data: {
            required: price,
            current: user.balance,
            wordCount,
            needUpgrade: true,
          }
        }, { status: 402 });
      }
    }
    
    // 扣费或扣字数
    if (user.monthly_package && user.monthly_words_limit > 0) {
      const remainingWords = (user.monthly_words_limit || 0) - (user.monthly_words_used || 0);
      if (remainingWords >= wordCount) {
        // 扣套餐字数
        await query(
          'UPDATE users SET monthly_words_used = monthly_words_used + ? WHERE id = ?',
          [wordCount, user.id]
        );
      }
    } else {
      // 扣余额
      await query(
        'UPDATE users SET balance = balance - ? WHERE id = ?',
        [price, user.id]
      );
    }
    
    // 记录余额变动
    await query(
      'INSERT INTO balance_logs (user_id, amount, balance_before, balance_after, type, related_id, description) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [
        user.id,
        -price,
        user.balance,
        user.balance - price,
        'task',
        0,
        `消耗${wordCount}字`
      ]
    );
    
    // TODO: 实际提交任务到队列（需要实现）
    
    return NextResponse.json({
      code: 200,
      message: message,
      data: {
        taskId: 'T' + Date.now(),
        wordCount,
        price,
        balance: user.balance - price,
      },
    });
  } catch (error: any) {
    console.error('提交任务失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}
