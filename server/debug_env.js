// 환경 변수 디버그 스크립트
require('dotenv').config();

console.log('=== 환경 변수 확인 ===');
console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
console.log('PGUSER:', process.env.PGUSER);
console.log('PGHOST:', process.env.PGHOST);
console.log('PGDATABASE:', process.env.PGDATABASE);
console.log('PGPASSWORD:', process.env.PGPASSWORD ? 'SET' : 'NOT SET');
console.log('PGPORT:', process.env.PGPORT);
console.log('NODE_ENV:', process.env.NODE_ENV);

// 데이터베이스 연결 테스트
const { Pool } = require('pg');

const pool = new Pool(
  process.env.DATABASE_URL ? {
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  } : {
    user: process.env.PGUSER || 'postgres',
    host: process.env.PGHOST || 'localhost',
    database: process.env.PGDATABASE || 'postgres',
    password: process.env.PGPASSWORD || 'password',
    port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
    ssl: process.env.NODE_ENV === 'production' ? {
      rejectUnauthorized: false
    } : false,
  }
);

async function testConnection() {
  try {
    console.log('\n=== 데이터베이스 연결 테스트 ===');
    const result = await pool.query('SELECT NOW()');
    console.log('✅ 데이터베이스 연결 성공:', result.rows[0]);
    
    // 테이블 존재 확인
    const tables = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    console.log('📋 존재하는 테이블:', tables.rows.map(row => row.table_name));
    
    // Menus 테이블 데이터 확인
    try {
      const menus = await pool.query('SELECT COUNT(*) FROM Menus');
      console.log('🍽️ Menus 테이블 레코드 수:', menus.rows[0].count);
    } catch (err) {
      console.log('❌ Menus 테이블 오류:', err.message);
    }
    
  } catch (err) {
    console.log('❌ 데이터베이스 연결 실패:', err.message);
  } finally {
    await pool.end();
  }
}

testConnection(); 