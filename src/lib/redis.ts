import { createClient, RedisClientType } from 'redis';
import config from '../config';

let client: RedisClientType | null = null;

// 创建Redis客户端
export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }
  
  client = createClient({
    socket: {
      host: config.redis.host,
      port: config.redis.port,
    },
    password: config.redis.password,
    database: config.redis.db,
  });
  
  client.on('error', (err) => {
    console.error('❌ Redis错误:', err);
  });
  
  await client.connect();
  console.log('✅ Redis连接成功');
  
  return client;
}

// 任务队列相关
export const QUEUE_KEYS = {
  TASK_QUEUE: 'aigc:task:queue',
  PROCESSING: 'aigc:task:processing',
  TASK_STATUS: (taskId: string) => `aigc:task:status:${taskId}`,
  USER_TASKS: (userId: number) => `aigc:user:${userId}:tasks`,
};

// 添加任务到队列
export async function pushTask(taskId: string, priority: number = 0): Promise<void> {
  const redis = await getRedisClient();
  // 使用有序集合，score作为优先级(越低越优先)
  await redis.zAdd(QUEUE_KEYS.TASK_QUEUE, {
    score: priority,
    value: taskId,
  });
}

// 从队列取出任务
export async function popTask(timeout: number = 0): Promise<string | null> {
  const redis = await getRedisClient();
  
  if (timeout > 0) {
    // 阻塞等待
    const result = await redis.bzPopMin(QUEUE_KEYS.TASK_QUEUE, timeout);
    return result?.element || null;
  } else {
    // 立即取
    const result = await redis.zPopMin(QUEUE_KEYS.TASK_QUEUE);
    return result?.element || null;
  }
}

// 获取队列长度
export async function getQueueLength(): Promise<number> {
  const redis = await getRedisClient();
  return await redis.zCard(QUEUE_KEYS.TASK_QUEUE);
}

// 设置任务状态
export async function setTaskStatus(taskId: string, status: string, ttl: number = 3600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(QUEUE_KEYS.TASK_STATUS(taskId), ttl, status);
}

// 获取任务状态
export async function getTaskStatus(taskId: string): Promise<string | null> {
  const redis = await getRedisClient();
  return await redis.get(QUEUE_KEYS.TASK_STATUS(taskId));
}

// 标记任务正在处理
export async function markProcessing(taskId: string, ttl: number = 600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(QUEUE_KEYS.PROCESSING, ttl, taskId);
}

// 移除处理中标记
export async function unmarkProcessing(taskId: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(QUEUE_KEYS.PROCESSING);
}

export default { getRedisClient, pushTask, popTask, getQueueLength, setTaskStatus, getTaskStatus };
