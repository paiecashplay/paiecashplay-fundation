import mysql from 'mysql2/promise';

// Configuration pour Google Cloud SQL
const dbConfig = {
  // Pour connexion via socket Unix (recommandé en production)
  socketPath: process.env.DB_SOCKET_PATH,
  // Pour connexion TCP (développement local)
  host: process.env.DB_HOST,
  port: parseInt(process.env.DB_PORT || '3306'),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  // Configuration SSL pour Cloud SQL
  ssl: process.env.NODE_ENV === 'production' ? {
    rejectUnauthorized: false
  } : false,
  // Pool de connexions optimisé pour Cloud SQL
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
  charset: 'utf8mb4',
  // Options MySQL2 valides
  keepAliveInitialDelay: 0,
  enableKeepAlive: true
};

// Filtrer les informations sensibles pour les logs
const logConfig = {
  host: dbConfig.host,
  socketPath: dbConfig.socketPath,
  database: dbConfig.database,
  user: dbConfig.user,
  ssl: !!dbConfig.ssl
};
console.log("Cloud SQL Config ", logConfig);

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
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute(query, params);
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
  } finally {
    if (connection) connection.release();
  }
}

// Fonction pour les insertions avec ID retourné
export async function executeInsert(
  query: string, 
  params: any[] = []
): Promise<QueryResult> {
  let connection;
  try {
    connection = await pool.getConnection();
    const [result] = await connection.execute(query, params) as any;
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
  } finally {
    if (connection) connection.release();
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
  let connection;
  try {
    connection = await pool.getConnection();
    const [rows] = await connection.execute('SELECT 1 as test');
    return true;
  } catch (error) {
    console.error('Database connection failed:', error);
    return false;
  } finally {
    if (connection) connection.release();
  }
}

export default pool;