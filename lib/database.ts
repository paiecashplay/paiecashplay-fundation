import mysql from 'mysql2/promise';

// Configuration de la base de données
const dbConfig = {
  host: process.env.DB_HOST || 'q2gen47hi68k1yrb.chr7pe7iynqr.eu-west-1.rds.amazonaws.com',
  user: process.env.DB_USER || 'egqmgini2mt3f6yr',
  password: process.env.DB_PASSWORD || 'hksdhy11y2sw1lce',
  database: process.env.DB_NAME || 'l7qlv4g9lclui5wr',
  waitForConnections: true,
  connectionLimit: 3,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// Pool de connexions
const pool = mysql.createPool(dbConfig);

// Interface pour les résultats de requête
export interface QueryResult<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  insertId?: string;
}

// Fonction utilitaire pour exécuter des requêtes
export async function executeQuery<T = any>(
  query: string, 
  params: any[] = []
): Promise<QueryResult<T>> {
  try {
    const [rows] = await pool.execute(query, params);
    return {
      success: true,
      data: rows as T
    };
  } catch (error: any) {
    console.error('Database query error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction pour les insertions avec ID retourné
export async function executeInsert(
  query: string, 
  params: any[] = []
): Promise<QueryResult> {
  try {
    const [result] = await pool.execute(query, params) as any;
    return {
      success: true,
      insertId: result.insertId,
      data: result
    };
  } catch (error: any) {
    console.error('Database insert error:', error);
    return {
      success: false,
      error: error.message
    };
  }
}

// Fonction pour les transactions
export async function executeTransaction(queries: Array<{query: string, params?: any[]}>) {
  const connection = await pool.getConnection();
  try {
    await connection.beginTransaction();
    
    const results = [];
    for (const {query, params = []} of queries) {
      const [result] = await connection.execute(query, params);
      results.push(result);
    }
    
    await connection.commit();
    return { success: true, data: results };
  } catch (error: any) {
    await connection.rollback();
    console.error('Transaction error:', error);
    return { success: false, error: error.message };
  } finally {
    connection.release();
  }
}

// Test de connexion
export async function testConnection(): Promise<boolean> {
  try {
    const [rows] = await pool.execute('SELECT 1 as test');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  }
}

export default pool;