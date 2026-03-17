import mysql, { Pool, PoolOptions } from 'mysql2/promise';
import config from '../config/index';

const poolConfig: PoolOptions = {
  host: config.mysql.host,
  port: config.mysql.port,
  user: config.mysql.user,
  password: config.mysql.password,
  database: config.mysql.database,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0,
};

// 鍒涘缓杩炴帴姹?const pool: Pool = mysql.createPool(poolConfig);

// 娴嬭瘯杩炴帴
export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('鉁?MySQL杩炴帴鎴愬姛');
    return true;
  } catch (error) {
    console.error('鉂?MySQL杩炴帴澶辫触:', error);
    return false;
  }
}

// 閫氱敤鏌ヨ鏂规硶
export async function query<T>(sql: string, params?: any[]): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

// 鎻掑叆鏁版嵁
export async function insert(table: string, data: Record<string, any>): Promise<number> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await pool.execute(sql, values);
  return (result[0] as any).insertId;
}

// 鏇存柊鏁版嵁
export async function update(table: string, id: number, data: Record<string, any>): Promise<boolean> {
  const sets = Object.keys(data).map(key => `${key} = ?`).join(', ');
  const values = [...Object.values(data), id];
  
  const sql = `UPDATE ${table} SET ${sets} WHERE id = ?`;
  const result = await pool.execute(sql, values);
  return (result[0] as any).affectedRows > 0;
}

// 鍒犻櫎鏁版嵁
export async function remove(table: string, id: number): Promise<boolean> {
  const sql = `DELETE FROM ${table} WHERE id = ?`;
  const result = await pool.execute(sql, [id]);
  return (result[0] as any).affectedRows > 0;
}

export default pool;
