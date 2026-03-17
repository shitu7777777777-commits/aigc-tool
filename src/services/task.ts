import { v4 as uuidv4 } from 'uuid';
import { query, insert, update } from '../lib/db';
import { pushTask, getQueueLength, setTaskStatus, getTaskStatus } from '../lib/redis';
import { rewriteText, countWords, estimatePrice, estimateProcessingTime } from '../services/gpt';
import { 
  Task, 
  TaskStatus, 
  Language, 
  ProcessMode, 
  SubmitTaskResponse,
  QueryTaskResponse 
} from '../types';

// 生成任务编号
function generateTaskNo(): string {
  const timestamp = Date.now().toString(36);
  const random = uuidv4().split('-')[0];
  return `T${timestamp}${random}`.toUpperCase();
}

// 提交任务
export async function submitTask(
  userId: number,
  text: string,
  language: Language,
  mode: ProcessMode
): Promise<SubmitTaskResponse> {
  // 1. 统计字数
  const wordCount = countWords(text, language);
  
  // 2. 估算价格
  const price = estimatePrice(wordCount, language);
  
  // 3. 创建任务记录
  const taskNo = generateTaskNo();
  const taskId = await insert('tasks', {
    task_no: taskNo,
    user_id: userId,
    original_text: text,
    word_count: wordCount,
    language,
    mode,
    status: TaskStatus.PENDING,
  });
  
  // 4. 加入任务队列
  await pushTask(taskNo);
  
  // 5. 获取队列位置
  const queueLength = await getQueueLength();
  
  // 6. 设置初始状�?  await setTaskStatus(taskNo, TaskStatus.PENDING);
  
  // 7. 计算预计时间
  const estimatedTime = estimateProcessingTime(wordCount, queueLength);
  
  return {
    taskId: taskNo,
    position: queueLength,
    estimatedTime: estimatedTime < 60 ? `${Math.ceil(estimatedTime)}秒` : `${Math.ceil(estimatedTime / 60)}分钟`,
  };
}

// 查询任务状�?export async function getTaskStatusByNo(taskNo: string): Promise<QueryTaskResponse> {
  // 1. 先从Redis获取缓存状�?  const cachedStatus = await getTaskStatus(taskNo);
  
  // 2. 从数据库获取任务详情
  const tasks = await query<Task[]>(
    'SELECT * FROM tasks WHERE task_no = ?',
    [taskNo]
  );
  
  if (!tasks || tasks.length === 0) {
    return {
      status: TaskStatus.FAILED,
      error: '任务不存�?,
    };
  }
  
  const task = tasks[0] as any;
  
  // 3. 返回状�?  return {
    status: task.status as TaskStatus,
    result: task.status === TaskStatus.COMPLETED ? task.converted_text : undefined,
    error: task.error_message || undefined,
  };
}

// 处理任务（Worker调用�?export async function processTask(taskNo: string): Promise<void> {
  try {
    // 1. 更新状态为处理�?    await setTaskStatus(taskNo, TaskStatus.PROCESSING);
    await query('UPDATE tasks SET status = ? WHERE task_no = ?', [TaskStatus.PROCESSING, taskNo]);
    
    // 2. 获取任务内容
    const tasks = await query<Task[]>(
      'SELECT * FROM tasks WHERE task_no = ?',
      [taskNo]
    );
    
    if (!tasks || tasks.length === 0) {
      throw new Error('任务不存�?);
    }
    
    const task = tasks[0] as any;
    
    // 3. 调用GPT改写
    const result = await rewriteText(
      task.original_text,
      task.language as Language,
      task.mode as ProcessMode
    );
    
    // 4. 更新任务结果
    await query(
      'UPDATE tasks SET converted_text = ?, status = ?, completed_at = NOW() WHERE task_no = ?',
      [result, TaskStatus.COMPLETED, taskNo]
    );
    
    // 5. 更新Redis状�?    await setTaskStatus(taskNo, TaskStatus.COMPLETED, 3600); // 缓存1小时
    
    console.log(`�?任务 ${taskNo} 处理完成`);
  } catch (error: any) {
    // 6. 处理失败
    console.error(`�?任务 ${taskNo} 处理失败:`, error);
    
    await query(
      'UPDATE tasks SET status = ?, error_message = ? WHERE task_no = ?',
      [TaskStatus.FAILED, error.message, taskNo]
    );
    
    await setTaskStatus(taskNo, TaskStatus.FAILED, 3600);
  }
}

// 获取用户任务列表
export async function getUserTasks(userId: number, limit: number = 20, offset: number = 0): Promise<Task[]> {
  return await query<Task[]>(
    'SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?',
    [userId, limit, offset]
  );
}

export default {
  submitTask,
  getTaskStatusByNo,
  processTask,
  getUserTasks,
};
