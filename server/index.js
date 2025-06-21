require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// PostgreSQL 연결 설정 (환경변수 또는 기본값 사용)
const pool = new Pool({
  user: process.env.PGUSER || 'postgres',
  host: process.env.PGHOST || 'localhost',
  database: process.env.PGDATABASE || 'postgres',
  password: process.env.PGPASSWORD || 'password',
  port: process.env.PGPORT ? parseInt(process.env.PGPORT) : 5432,
});

// 1. 메뉴 목록 조회
app.get('/api/menus', async (req, res) => {
  try {
    const menus = await pool.query('SELECT * FROM Menus ORDER BY id');
    const options = await pool.query('SELECT * FROM Options ORDER BY menu_id, id');
    // 메뉴별 옵션 매핑
    const menuList = menus.rows.map(menu => ({
      ...menu,
      options: options.rows.filter(opt => opt.menu_id === menu.id)
    }));
    res.json(menuList);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 주문 생성 및 재고 차감
app.post('/api/orders', async (req, res) => {
  const { items, total_price } = req.body;
  if (!Array.isArray(items) || typeof total_price !== 'number') {
    return res.status(400).json({ error: 'Invalid order data' });
  }
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    // 재고 차감
    for (const item of items) {
      const menuId = item.menu_id;
      const quantity = item.quantity;
      const stockRes = await client.query('SELECT stock FROM Menus WHERE id = $1 FOR UPDATE', [menuId]);
      if (!stockRes.rows.length || stockRes.rows[0].stock < quantity) {
        throw new Error('재고 부족');
      }
      await client.query('UPDATE Menus SET stock = stock - $1 WHERE id = $2', [quantity, menuId]);
    }
    // 주문 저장
    const insertRes = await client.query(
      'INSERT INTO Orders (items, total_price, created_at) VALUES ($1, $2, NOW()) RETURNING *',
      [JSON.stringify(items), total_price]
    );
    await client.query('COMMIT');
    res.json(insertRes.rows[0]);
  } catch (err) {
    await client.query('ROLLBACK');
    res.status(500).json({ error: err.message });
  } finally {
    client.release();
  }
});

// 3. 주문 상세 조회
app.get('/api/orders/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const orderRes = await pool.query('SELECT * FROM Orders WHERE id = $1', [id]);
    if (!orderRes.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(orderRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DB 연결 테스트 라우트
app.get('/api/db-health', async (req, res) => {
  try {
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    res.status(500).json({ status: 'error', error: err.message });
  }
});

app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' });
});

// 1. 관리자 - 메뉴 재고 현황
app.get('/api/admin/menus', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, name, stock FROM Menus ORDER BY id');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 2. 관리자 - 주문 현황
app.get('/api/admin/orders', async (req, res) => {
  try {
    const result = await pool.query('SELECT id, items, total_price, created_at, status FROM Orders ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 3. 관리자 - 주문 상태 변경 (제조 중/완료)
app.patch('/api/admin/orders/:id/status', async (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  if (!['제조 중', '완료'].includes(status)) {
    return res.status(400).json({ error: '잘못된 status 값' });
  }
  try {
    const updateRes = await pool.query(
      'UPDATE Orders SET status = $1 WHERE id = $2 RETURNING id, status',
      [status, id]
    );
    if (!updateRes.rows.length) {
      return res.status(404).json({ error: 'Order not found' });
    }
    res.json(updateRes.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// 4. 관리자 - 메뉴 재고 증감
app.patch('/api/admin/menus/:id/stock', async (req, res) => {
  const { id } = req.params;
  const { diff } = req.body;
  if (typeof diff !== 'number') {
    return res.status(400).json({ error: 'diff 값이 필요합니다.' });
  }
  try {
    const result = await pool.query(
      'UPDATE Menus SET stock = GREATEST(stock + $1, 0) WHERE id = $2 RETURNING id, stock',
      [diff, id]
    );
    if (!result.rows.length) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    res.json(result.rows[0]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
}); 