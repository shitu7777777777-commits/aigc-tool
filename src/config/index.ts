// 数据库配置
// 开发环境使用环境变量，生产环境使用云数据库

interface DbConfig {
  host: string;
  port: number;
  user: string;
  password: string;
  database: string;
}

interface RedisConfig {
  host: string;
  port: number;
  password?: string;
  db?: number;
}

interface AppConfig {
  port: number;
  env: 'development' | 'production';
  
  // 数据库
  mysql: DbConfig;
  redis: RedisConfig;
  
  // OpenAI
  openai: {
    apiKey: string;
    model: string;
  };
  
  // 支付配置
  payment: {
    wechat: {
      appId: string;
      mchId: string;
      apiKey: string;
    };
    alipay: {
      appId: string;
      privateKey: string;
      alipayPublicKey: string;
    };
    stripe: {
      secretKey: string;
      webhookSecret: string;
    };
    paypal: {
      clientId: string;
      clientSecret: string;
    };
  };
  
  // JWT
  jwt: {
    secret: string;
    expiresIn: string;
  };
}

const config: AppConfig = {
  port: parseInt(process.env.PORT || '3000', 10),
  env: (process.env.NODE_ENV as 'development' | 'production') || 'development',
  
  // MySQL - 开发环境可用本地， 生产用云数据库
  mysql: {
    host: process.env.MYSQL_HOST || 'localhost',
    port: parseInt(process.env.MYSQL_PORT || '3306', 10),
    user: process.env.MYSQL_USER || 'root',
    password: process.env.MYSQL_PASSWORD || '',
    database: process.env.MYSQL_DATABASE || 'aigc_tool',
  },
  
  // Redis - 开发环境可用本地，生产用云Redis
  redis: {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379', 10),
    password: process.env.REDIS_PASSWORD,
    db: parseInt(process.env.REDIS_DB || '0', 10),
  },
  
  // OpenAI
  openai: {
    apiKey: process.env.OPENAI_API_KEY || '',
    model: process.env.GPT_MODEL || 'gpt-4o-mini',
  },
  
  // 支付配置
  payment: {
    wechat: {
      appId: process.env.WECHAT_APP_ID || '',
      mchId: process.env.WECHAT_MCH_ID || '',
      apiKey: process.env.WECHAT_API_KEY || '',
    },
    alipay: {
      appId: process.env.ALIPAY_APP_ID || '',
      privateKey: process.env.ALIPAY_PRIVATE_KEY || '',
      alipayPublicKey: process.env.ALIPAY_PUBLIC_KEY || '',
    },
    stripe: {
      secretKey: process.env.STRIPE_SECRET_KEY || '',
      webhookSecret: process.env.STRIPE_WEBHOOK_SECRET || '',
    },
    paypal: {
      clientId: process.env.PAYPAL_CLIENT_ID || '',
      clientSecret: process.env.PAYPAL_CLIENT_SECRET || '',
    },
  },
  
  // JWT
  jwt: {
    secret: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  },
};

export default config;
