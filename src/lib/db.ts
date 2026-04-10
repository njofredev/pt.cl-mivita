import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST,
  database: process.env.POSTGRES_DATABASE,
  user: process.env.POSTGRES_USER,
  password: process.env.POSTGRES_PASSWORD,
  port: parseInt(process.env.POSTGRES_PORT || '5432'),
  ssl: false, // Set to true if required by your provider
});

export const initDb = async () => {
  const queryText = `
    CREATE TABLE IF NOT EXISTS mivita_consultations (
      id SERIAL PRIMARY KEY,
      rut VARCHAR(20) NOT NULL,
      status VARCHAR(50) NOT NULL,
      timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;
  try {
    await pool.query(queryText);
    console.log('Database initialized successfully');
  } catch (error) {
    console.error('Error initializing database:', error);
  }
};

export const logConsultation = async (rut: string, status: string) => {
  const queryText = 'INSERT INTO mivita_consultations(rut, status) VALUES($1, $2)';
  try {
    await pool.query(queryText, [rut, status]);
  } catch (error) {
    console.error('Error logging consultation:', error);
  }
};

export default pool;
