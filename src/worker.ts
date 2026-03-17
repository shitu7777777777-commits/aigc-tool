import config from './config/index';
import { popTask, getQueueLength } from '../lib/redis';
import { processTask } from '../services/task';

console.log('🚀 Worker启动中...');

async function runWorker() {
  console.log('✅ Worker已就绪，等待任务...');
  
  while (true) {
    try {
      // 获取队列长度
      const queueLen = await getQueueLength();
      
      if (queueLen > 0) {
        console.log(`📋 当前队列: ${queueLen}个任务`);
      }
      
      // 从队列取出任务（阻塞等待，最多10秒）
      const taskNo = await popTask(10);
      
      if (taskNo) {
        console.log(`🎯 开始处理任务: ${taskNo}`);
        await processTask(taskNo);
      }
    } catch (error) {
      console.error('❌ Worker错误:', error);
      // 等待后继续
      await new Promise(resolve => setTimeout(resolve, 5000));
    }
  }
}

// 启动Worker
runWorker();
