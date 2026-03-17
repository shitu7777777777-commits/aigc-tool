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
};

const pool: Pool = mysql.createPool(poolConfig);

export async function testConnection(): Promise<boolean> {
  try {
    const connection = await pool.getConnection();
    await connection.ping();
    connection.release();
    console.log('MySQL connected');
    return true;
  } catch (error) {
    console.error('MySQL connection failed:', error);
    return false;
  }
}

export async function query<T = any>(sql: string, params: any[] = []): Promise<T> {
  const [rows] = await pool.execute(sql, params);
  return rows as T;
}

export async function insert(table: string, data: Record<string, any>): Promise<number> {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${table} (${keys.join(', ')}) VALUES (${placeholders})`;
  const result = await pool.execute(sql, values);
  return (result as any).insertId;
}

export async function update(table: string, data: Record<string, any>, where: string, params: any[] = []): Promise<number> {
  const sets = Object.keys(data).map(k => `${k} = ?`).join(', ');
  const values = [...Object.values(data), ...params];
  const sql = `UPDATE ${table} SET ${sets} WHERE ${where}`;
  const result = await pool.execute(sql, values);
  return (result as any).affectedRows;
}

export async function remove(table: string, where: string, params: any[] = []): Promise<number> {
  const sql = `DELETE FROM ${table} WHERE ${where}`;
  const result = await pool.execute(sql, params);
  return (result as any).affectedRows;
}

export default { pool, testConnection, query, insert, update, remove };
