import sql from 'mssql';

const config = {
  user: process.env.ERP_USER!,
  password: process.env.ERP_PASSWORD!,
  database: process.env.ERP_DATABASE!,
  server: process.env.ERP_SERVER!,
  port: parseInt(process.env.ERP_PORT || '1433'),
  pool: {
    max: 10,
    min: 0,
    idleTimeoutMillis: 30000,
  },
  options: {
    encrypt: true,
    trustServerCertificate: true,
    enableKeepAlive: true,
  },
};

let pool: sql.ConnectionPool;

export async function initDatabase() {
  try {
    pool = new sql.ConnectionPool(config);
    await pool.connect();
    console.log('✅ Conectado ao SQL Server');
  } catch (error) {
    console.error('❌ Erro ao conectar ao SQL Server:', error);
    throw error;
  }
}

export async function query(sql: string) {
  try {
    if (!pool || !pool.connected) {
      await initDatabase();
    }
    const result = await pool.query(sql);
    return result.recordset;
  } catch (error) {
    console.error('❌ Erro ao executar query:', error);
    throw error;
  }
}

export async function closeDatabaseConnection() {
  if (pool) {
    await pool.close();
    console.log('✅ Conexão com SQL Server fechada');
  }
}
