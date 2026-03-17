import { NextRequest, NextResponse } from 'next/server';
import { getTaskStatusByNo } from '@/services/task';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ taskId: string }> }
) {
  try {
    const { taskId } = await params;
    
    if (!taskId) {
      return NextResponse.json({
        code: 400,
        message: '任务ID不能为空',
      }, { status: 400 });
    }
    
    const result = await getTaskStatusByNo(taskId);
    
    return NextResponse.json({
      code: 200,
      message: '查询成功',
      data: result,
    });
  } catch (error: any) {
    console.error('查询任务失败:', error);
    return NextResponse.json({
      code: 500,
      message: error.message || '服务器错误',
    }, { status: 500 });
  }
}
