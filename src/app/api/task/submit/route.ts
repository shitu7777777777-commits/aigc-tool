import { NextRequest, NextResponse } from 'next/server';
import { submitTask, getTaskStatusByNo, getUserTasks } from '@/services/task';
import { Language, ProcessMode } from '@/types';

// 提交任务
export async function POST(request: NextRequest) {
  try {
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
    
    // 临时使用userId=1
    const userId = 1;
    
    const result = await submitTask(userId, text, language, mode);
    
    return NextResponse.json({
      code: 200,
      message: '任务提交成功',
      data: result,
    });
  } catch (error: any) {
    console.error('提交任务失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}
