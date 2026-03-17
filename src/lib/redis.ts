import { createClient, RedisClientType } from 'redis';
import config from '../config';

let client: RedisClientType | null = null;

// 鍒涘缓Redis瀹㈡埛绔?export async function getRedisClient(): Promise<RedisClientType> {
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
    console.error('鉂?Redis閿欒:', err);
  });
  
  await client.connect();
  console.log('鉁?Redis杩炴帴鎴愬姛');
  
  return client;
}

// 浠诲姟闃熷垪鐩稿叧
export const QUEUE_KEYS = {
  TASK_QUEUE: 'aigc:task:queue',
  PROCESSING: 'aigc:task:processing',
  TASK_STATUS: (taskId: string) => `aigc:task:status:${taskId}`,
  USER_TASKS: (userId: number) => `aigc:user:${userId}:tasks`,
};

// 娣诲姞浠诲姟鍒伴槦鍒?export async function pushTask(taskId: string, priority: number = 0): Promise<void> {
  const redis = await getRedisClient();
  // 浣跨敤鏈夊簭闆嗗悎锛宻core浣滀负浼樺厛绾?瓒婁綆瓒婁紭鍏?
  await redis.zAdd(QUEUE_KEYS.TASK_QUEUE, {
    score: priority,
    value: taskId,
  });
}

// 浠庨槦鍒楀彇鍑轰换鍔?export async function popTask(timeout: number = 0): Promise<string | null> {
  const redis = await getRedisClient();
  
  if (timeout > 0) {
    // 闃诲绛夊緟
    const result = await redis.bzPopMin(QUEUE_KEYS.TASK_QUEUE, timeout);
    return result?.element || null;
  } else {
    // 绔嬪嵆鍙?    const result = await redis.zPopMin(QUEUE_KEYS.TASK_QUEUE);
    return result?.element || null;
  }
}

// 鑾峰彇闃熷垪闀垮害
export async function getQueueLength(): Promise<number> {
  const redis = await getRedisClient();
  return await redis.zCard(QUEUE_KEYS.TASK_QUEUE);
}

// 璁剧疆浠诲姟鐘舵€?export async function setTaskStatus(taskId: string, status: string, ttl: number = 3600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(QUEUE_KEYS.TASK_STATUS(taskId), ttl, status);
}

// 鑾峰彇浠诲姟鐘舵€?export async function getTaskStatus(taskId: string): Promise<string | null> {
  const redis = await getRedisClient();
  return await redis.get(QUEUE_KEYS.TASK_STATUS(taskId));
}

// 鏍囪浠诲姟姝ｅ湪澶勭悊
export async function markProcessing(taskId: string, ttl: number = 600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(QUEUE_KEYS.PROCESSING, ttl, taskId);
}

// 绉婚櫎澶勭悊涓爣璁?export async function unmarkProcessing(taskId: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(QUEUE_KEYS.PROCESSING);
}

export default { getRedisClient, pushTask, popTask, getQueueLength, setTaskStatus, getTaskStatus };
