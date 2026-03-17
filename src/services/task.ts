import { v4 as uuidv4 } from 'uuid';
import { query, insert } from '../lib/db';
import { pushTask, getQueueLength, setTaskStatus, getTaskStatus } from '../lib/redis';
import { rewriteText, countWords, estimatePrice, estimateProcessingTime } from '../services/gpt';
import { TaskStatus, Language, ProcessMode } from '../types';

function generateTaskNo(): string {
  const timestamp = Date.now().toString(36);
  const random = uuidv4().split('-')[0];
  return `T${timestamp}${random}`.toUpperCase();
}

export async function submitTask(userId: number, text: string, language: Language, mode: ProcessMode) {
  const wordCount = countWords(text, language);
  const price = estimatePrice(wordCount, language);
  const taskNo = generateTaskNo();
  
  await insert('tasks', {
    task_no: taskNo,
    user_id: userId,
    original_text: text,
    word_count: wordCount,
    language,
    mode,
    status: TaskStatus.PENDING,
  });
  
  await pushTask(taskNo);
  const queueLength = await getQueueLength();
  await setTaskStatus(taskNo, TaskStatus.PENDING);
  const estimatedTime = estimateProcessingTime(wordCount, queueLength);
  
  return {
    taskId: taskNo,
    position: queueLength,
    estimatedTime: estimatedTime < 60 ? `${Math.ceil(estimatedTime)}s` : `${Math.ceil(estimatedTime / 60)}min`,
  };
}

export async function getTaskStatusByNo(taskNo: string) {
  const cachedStatus = await getTaskStatus(taskNo);
  const tasks = await query<any[]>('SELECT * FROM tasks WHERE task_no = ?', [taskNo]);
  
  if (!tasks || tasks.length === 0) {
    return { status: TaskStatus.FAILED, error: 'Task not found' };
  }
  
  const task = tasks[0];
  return {
    status: task.status,
    result: task.status === TaskStatus.COMPLETED ? task.converted_text : undefined,
    error: task.error_message || undefined,
  };
}

export async function processTask(taskNo: string): Promise<void> {
  try {
    await setTaskStatus(taskNo, TaskStatus.PROCESSING);
    await query('UPDATE tasks SET status = ? WHERE task_no = ?', [TaskStatus.PROCESSING, taskNo]);
    
    const tasks = await query<any[]>('SELECT * FROM tasks WHERE task_no = ?', [taskNo]);
    if (!tasks || tasks.length === 0) {
      throw new Error('Task not found');
    }
    
    const task = tasks[0];
    const result = await rewriteText(task.original_text, task.language, task.mode);
    
    await query('UPDATE tasks SET converted_text = ?, status = ?, completed_at = NOW() WHERE task_no = ?', [result, TaskStatus.COMPLETED, taskNo]);
    await setTaskStatus(taskNo, TaskStatus.COMPLETED, 3600);
    
    console.log(`Task ${taskNo} completed`);
  } catch (error: any) {
    console.error(`Task ${taskNo} failed:`, error.message);
    await query('UPDATE tasks SET status = ?, error_message = ? WHERE task_no = ?', [TaskStatus.FAILED, error.message, taskNo]);
    await setTaskStatus(taskNo, TaskStatus.FAILED, 3600);
  }
}

export async function getUserTasks(userId: number, limit: number = 20, offset: number = 0) {
  return await query<any[]>('SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC LIMIT ? OFFSET ?', [userId, limit, offset]);
}

export default { submitTask, getTaskStatusByNo, processTask, getUserTasks };
