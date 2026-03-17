// 任务状态枚举
export enum TaskStatus {
  PENDING = 'pending',
  PROCESSING = 'processing',
  COMPLETED = 'completed',
  FAILED = 'failed',
}

// 语言枚举
export enum Language {
  ZH = 'zh',
  EN = 'en',
}

// 处理模式
export enum ProcessMode {
  STANDARD = 'standard',
  DEEP = 'deep',
}

// 支付方式
export enum PaymentMethod {
  WECHAT = 'wechat',
  ALIPAY = 'alipay',
  STRIPE = 'stripe',
  PAYPAL = 'paypal',
}

// 支付状态
export enum PaymentStatus {
  PENDING = 'pending',
  PAID = 'paid',
  FAILED = 'failed',
  REFUNDED = 'refunded',
}

// 用户类型
export interface User {
  id: number;
  openid?: string;
  email?: string;
  nickname?: string;
  avatar?: string;
  balance: number;
  monthlyPackage: boolean;
  monthlyExpire?: Date;
  monthlyWordsLimit: number;
  monthlyWordsUsed: number;
  createdAt: Date;
  updatedAt: Date;
  status: number;
}

// 任务类型
export interface Task {
  id: number;
  taskNo: string;
  userId: number;
  originalText: string;
  convertedText?: string;
  wordCount: number;
  language: Language;
  mode: ProcessMode;
  status: TaskStatus;
  errorMessage?: string;
  apiCost?: number;
  createdAt: Date;
  updatedAt: Date;
  completedAt?: Date;
}

// 订单类型
export interface Order {
  id: number;
  userId: number;
  orderNo: string;
  amount: number;
  currency: string;
  paymentMethod?: PaymentMethod;
  paymentStatus: PaymentStatus;
  transactionId?: string;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

// API响应类型
export interface ApiResponse<T = any> {
  code: number;
  message: string;
  data?: T;
}

// 提交任务请求
export interface SubmitTaskRequest {
  text: string;
  language: Language;
  mode: ProcessMode;
}

// 提交任务响应
export interface SubmitTaskResponse {
  taskId: string;
  position: number;
  estimatedTime: string;
}

// 查询任务响应
export interface QueryTaskResponse {
  status: TaskStatus;
  result?: string;
  error?: string;
}
