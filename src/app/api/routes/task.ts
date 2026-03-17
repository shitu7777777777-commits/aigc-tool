import { Router, Request, Response } from 'express';
import { submitTask, getTaskStatusByNo, getUserTasks } from '../services/task';
import { Language, ProcessMode, TaskStatus } from '../types';

const router = Router();

// 提交任务
router.post('/submit', async (req: Request, res: Response) => {
  try {
    const { text, language = 'zh', mode = 'standard' } = req.body;
    
    // 参数验证
    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        code: 400,
        message: '文本不能为空',
      });
    }
    
    if (text.length > 50000) {
      return res.status(400).json({
        code: 400,
        message: '文本长度不能超过50000字',
      });
    }
    
    // 验证语言和模式
    if (!Object.values(Language).includes(language)) {
      return res.status(400).json({
        code: 400,
        message: '无效的语言类型',
      });
    }
    
    if (!Object.values(ProcessMode).includes(mode)) {
      return res.status(400).json({
        code: 400,
        message: '无效的处理模式',
      });
    }
    
    // 临时使用userId=1（后续接入用户系统后从session获取）
    const userId = 1;
    
    // 提交任务
    const result = await submitTask(userId, text, language, mode);
    
    res.json({
      code: 200,
      message: '任务提交成功',
      data: result,
    });
  } catch (error: any) {
    console.error('提交任务失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误',
    });
  }
});

// 查询任务状态
router.get('/task/:taskId', async (req: Request, res: Response) => {
  try {
    const { taskId } = req.params;
    
    if (!taskId) {
      return res.status(400).json({
        code: 400,
        message: '任务ID不能为空',
      });
    }
    
    const result = await getTaskStatusByNo(taskId);
    
    res.json({
      code: 200,
      message: '查询成功',
      data: result,
    });
  } catch (error: any) {
    console.error('查询任务失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误',
    });
  }
});

// 获取用户任务列表
router.get('/tasks', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 20;
    const offset = parseInt(req.query.offset as string) || 0;
    
    // 临时使用userId=1
    const userId = 1;
    
    const tasks = await getUserTasks(userId, limit, offset);
    
    res.json({
      code: 200,
      message: '查询成功',
      data: tasks,
    });
  } catch (error: any) {
    console.error('获取任务列表失败:', error);
    res.status(500).json({
      code: 500,
      message: error.message || '服务器错误',
    });
  }
});

// 健康检查
router.get('/health', (req: Request, res: Response) => {
  res.json({
    code: 200,
    message: 'OK',
    data: {
      timestamp: new Date().toISOString(),
      status: 'running',
    },
  });
});

export default router;
