-- AIGC降重工具站 - MySQL数据库初始化脚本
-- 版本: 1.0
-- 创建时间: 2026-03-17

-- 创建数据库
CREATE DATABASE IF NOT EXISTS aigc_tool DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE aigc_tool;

-- 用户表
CREATE TABLE IF NOT EXISTS users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    openid VARCHAR(128) DEFAULT NULL COMMENT '微信OpenID',
    email VARCHAR(255) DEFAULT NULL COMMENT '邮箱',
    password_hash VARCHAR(255) DEFAULT NULL COMMENT '密码哈希',
    nickname VARCHAR(100) DEFAULT NULL COMMENT '昵称',
    avatar VARCHAR(500) DEFAULT NULL COMMENT '头像URL',
    balance DECIMAL(10, 2) DEFAULT 0.00 COMMENT '余额(元)',
    monthly_package TINYINT(1) DEFAULT 0 COMMENT '是否包月: 0-否 1-是',
    monthly_expire DATETIME DEFAULT NULL COMMENT '包月过期时间',
    monthly_words_limit INT DEFAULT 0 COMMENT '包月字数限制',
    monthly_words_used INT DEFAULT 0 COMMENT '包月已用字数',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP COMMENT '注册时间',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT '更新时间',
    status TINYINT(1) DEFAULT 1 COMMENT '状态: 0-禁用 1-正常',
    INDEX idx_openid (openid),
    INDEX idx_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='用户表';

-- 订单表
CREATE TABLE IF NOT EXISTS orders (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    order_no VARCHAR(64) NOT NULL COMMENT '订单号',
    amount DECIMAL(10, 2) NOT NULL COMMENT '金额(元)',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币: CNY-人民币 USD-美元',
    payment_method VARCHAR(20) DEFAULT NULL COMMENT '支付方式: wechat-alipay-stripe-paypal',
    payment_status VARCHAR(20) DEFAULT 'pending' COMMENT '支付状态: pending-paid-failed-refunded',
    transaction_id VARCHAR(128) DEFAULT NULL COMMENT '第三方交易号',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_order_no (order_no),
    INDEX idx_payment_status (payment_status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='订单表';

-- 任务表
CREATE TABLE IF NOT EXISTS tasks (
    id INT PRIMARY KEY AUTO_INCREMENT,
    task_no VARCHAR(64) NOT NULL COMMENT '任务编号',
    user_id INT NOT NULL COMMENT '用户ID',
    original_text TEXT NOT NULL COMMENT '原文',
    converted_text TEXT DEFAULT NULL COMMENT '改写后文本',
    word_count INT NOT NULL DEFAULT 0 COMMENT '字数',
    language VARCHAR(10) NOT NULL DEFAULT 'zh' COMMENT '语言: zh-中文 en-英文',
    mode VARCHAR(20) NOT NULL DEFAULT 'standard' COMMENT '模式: standard-标准 deep-深度',
    status VARCHAR(20) NOT NULL DEFAULT 'pending' COMMENT '状态: pending-processing-completed-failed',
    error_message VARCHAR(500) DEFAULT NULL COMMENT '错误信息',
    api_cost DECIMAL(10, 4) DEFAULT 0.0000 COMMENT 'API成本',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL COMMENT '完成时间',
    INDEX idx_user_id (user_id),
    INDEX idx_task_no (task_no),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='任务表';

-- 用户余额变动记录表
CREATE TABLE IF NOT EXISTS balance_logs (
    id INT PRIMARY KEY AUTO_INCREMENT,
    user_id INT NOT NULL COMMENT '用户ID',
    amount DECIMAL(10, 2) NOT NULL COMMENT '变动金额(正数-增加 负数-扣减)',
    balance_before DECIMAL(10, 2) NOT NULL COMMENT '变动前余额',
    balance_after DECIMAL(10, 2) NOT NULL COMMENT '变动后余额',
    type VARCHAR(30) NOT NULL COMMENT '类型: recharge消费-task扣费-subscription包月-refund退款',
    related_id INT DEFAULT NULL COMMENT '关联ID(订单ID/任务ID等)',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_user_id (user_id),
    INDEX idx_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='余额变动记录表';

-- 套餐表
CREATE TABLE IF NOT EXISTS packages (
    id INT PRIMARY KEY AUTO_INCREMENT,
    name VARCHAR(100) NOT NULL COMMENT '套餐名称',
    name_en VARCHAR(100) NOT NULL COMMENT '套餐名称(英文)',
    price DECIMAL(10, 2) NOT NULL COMMENT '价格',
    currency VARCHAR(10) DEFAULT 'CNY' COMMENT '货币',
    words_limit INT NOT NULL COMMENT '字数限制',
    validity_days INT NOT NULL COMMENT '有效期(天)',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    description_en VARCHAR(500) DEFAULT NULL COMMENT '描述(英文)',
    sort_order INT DEFAULT 0 COMMENT '排序',
    status TINYINT(1) DEFAULT 1 COMMENT '状态: 0-下架 1-上架',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_sort_order (sort_order)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='套餐表';

-- 初始化默认套餐数据
INSERT INTO packages (name, name_en, price, currency, words_limit, validity_days, description, description_en, sort_order) VALUES
('单次付费', 'Pay Per Use', 0.00, 'CNY', 0, 0, '按千字计费，不限时间', 'Pay by word count, no time limit', 1),
('包月基础版', 'Monthly Basic', 49.00, 'CNY', 50000, 30, '每月5万字', '50,000 words per month', 2),
('包月进阶版', 'Monthly Pro', 99.00, 'CNY', 100000, 30, '每月10万字', '100,000 words per month', 3),
('包月旗舰版', 'Monthly Enterprise', 199.00, 'CNY', 300000, 30, '每月30万字', '300,000 words per month', 4);

-- 系统配置表
CREATE TABLE IF NOT EXISTS settings (
    id INT PRIMARY KEY AUTO_INCREMENT,
    setting_key VARCHAR(100) NOT NULL COMMENT '配置键',
    setting_value TEXT DEFAULT NULL COMMENT '配置值',
    description VARCHAR(500) DEFAULT NULL COMMENT '描述',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE INDEX idx_setting_key (setting_key)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COMMENT='系统配置表';

-- 初始化默认配置
INSERT INTO settings (setting_key, setting_value, description) VALUES
('price_per_thousand_words_cny', '2.00', '中文单次价格(元/千字)'),
('price_per_thousand_words_usd', '0.50', '英文单次价格(美元/千字)'),
('gpt_model', 'gpt-4o-mini', 'GPT模型'),
('max_concurrent_tasks', '5', '最大并发任务数'),
('queue_timeout_minutes', '10', '队列超时时间(分钟)'),
('task_max_words', '50000', '单次任务最大字数');
