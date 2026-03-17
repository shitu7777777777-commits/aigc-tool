import { createClient, RedisClientType } from 'redis';
import config from '../config/index';

let client: RedisClientType | null = null;

export async function getRedisClient(): Promise<RedisClientType> {
  if (client && client.isOpen) {
    return client;
  }
  
  client = createClient({
    socket: { host: config.redis.host, port: config.redis.port },
    password: config.redis.password,
    database: config.redis.db,
  });
  
  client.on('error', (err) => console.error('Redis error:', err));
  await client.connect();
  console.log('Redis connected');
  return client;
}

export const QUEUE_KEYS = {
  TASK_QUEUE: 'aigc:task:queue',
  PROCESSING: 'aigc:task:processing',
  TASK_STATUS: (taskId: string) => `aigc:task:status:${taskId}`,
};

export async function pushTask(taskId: string, priority: number = 0): Promise<void> {
  const redis = await getRedisClient();
  await redis.zAdd(QUEUE_KEYS.TASK_QUEUE, { score: priority, value: taskId });
}

export async function popTask(timeout: number = 0): Promise<string | null> {
  const redis = await getRedisClient();
  if (timeout > 0) {
    const result = await redis.bzPopMin(QUEUE_KEYS.TASK_QUEUE, timeout);
    return (result as any)?.element || null;
  } else {
    const result = await redis.zPopMin(QUEUE_KEYS.TASK_QUEUE);
    return (result as any)?.element || null;
  }
}

export async function getQueueLength(): Promise<number> {
  const redis = await getRedisClient();
  return await redis.zCard(QUEUE_KEYS.TASK_QUEUE);
}

export async function setTaskStatus(taskId: string, status: string, ttl: number = 3600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(QUEUE_KEYS.TASK_STATUS(taskId), ttl, status);
}

export async function getTaskStatus(taskId: string): Promise<string | null> {
  const redis = await getRedisClient();
  return await redis.get(QUEUE_KEYS.TASK_STATUS(taskId));
}

export async function markProcessing(taskId: string, ttl: number = 600): Promise<void> {
  const redis = await getRedisClient();
  await redis.setEx(QUEUE_KEYS.PROCESSING, ttl, taskId);
}

export async function unmarkProcessing(taskId: string): Promise<void> {
  const redis = await getRedisClient();
  await redis.del(QUEUE_KEYS.PROCESSING);
}

export default { getRedisClient, pushTask, popTask, getQueueLength, setTaskStatus, getTaskStatus };
