require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { Pool } = require('pg');

const app = express();
const PORT = process.env.PGPORT || 4000;

app.use(cors());
app.use(express.json());

// PostgreSQL 연결 설정 (환경변수 또는 기본값 사용)
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

// 데이터베이스 연결 상태 모니터링
pool.on('connect', () => {
  console.log('Database connected successfully');
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
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
    console.log('DB Health Check - Environment variables:');
    console.log('DATABASE_URL:', process.env.DATABASE_URL ? 'SET' : 'NOT SET');
    console.log('PGUSER:', process.env.PGUSER);
    console.log('PGHOST:', process.env.PGHOST);
    console.log('PGDATABASE:', process.env.PGDATABASE);
    console.log('PGPORT:', process.env.PGPORT);
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const result = await pool.query('SELECT NOW()');
    res.json({ status: 'ok', time: result.rows[0].now });
  } catch (err) {
    console.error('DB Health Check Error:', err);
    res.status(500).json({ 
      status: 'error', 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
  }
});

// 간단한 주문 테스트 API
app.get('/api/test-orders', async (req, res) => {
  try {
    console.log('테스트 주문 API 호출됨');
    
    // 1. 데이터베이스 연결 테스트
    const dbTest = await pool.query('SELECT NOW()');
    console.log('DB 연결 성공:', dbTest.rows[0]);
    
    // 2. Orders 테이블 존재 확인
    const tableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `);
    console.log('Orders 테이블 존재:', tableCheck.rows[0].exists);
    
    // 3. Orders 테이블 데이터 확인
    const ordersCheck = await pool.query('SELECT COUNT(*) as count FROM Orders');
    console.log('Orders 레코드 수:', ordersCheck.rows[0].count);
    
    // 4. Menus 테이블 데이터 확인
    const menusCheck = await pool.query('SELECT COUNT(*) as count FROM Menus');
    console.log('Menus 레코드 수:', menusCheck.rows[0].count);
    
    res.json({
      db_connected: true,
      orders_table_exists: tableCheck.rows[0].exists,
      orders_count: ordersCheck.rows[0].count,
      menus_count: menusCheck.rows[0].count
    });
  } catch (err) {
    console.error('테스트 API 오류:', err);
    res.status(500).json({ 
      error: err.message,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined
    });
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
  console.log('주문 현황 API 호출됨');
  try {
    console.log('데이터베이스 연결 확인 중...');
    const result = await pool.query('SELECT id, items, total_price, created_at, status FROM Orders ORDER BY created_at DESC');
    console.log('주문 데이터 조회 성공, 레코드 수:', result.rows.length);
    
    // 메뉴 정보를 한 번에 가져오기
    let menuMap = new Map();
    let optionMap = new Map();
    try {
      const menuResult = await pool.query('SELECT id, name FROM Menus');
      menuResult.rows.forEach(menu => {
        menuMap.set(menu.id, menu.name);
      });
      console.log('메뉴 정보 로드 완료:', menuMap);
      
      // 옵션 정보도 한 번에 가져오기
      const optionResult = await pool.query('SELECT id, name FROM Options');
      optionResult.rows.forEach(option => {
        optionMap.set(option.id, option.name);
      });
      console.log('옵션 정보 로드 완료:', optionMap);
    } catch (menuErr) {
      console.error('메뉴/옵션 정보 로드 실패:', menuErr);
      // 메뉴 정보 로드 실패해도 주문 처리는 계속 진행
    }
    
    // 주문 데이터 처리
    console.log('주문 데이터 처리 중...');
    const processedOrders = result.rows.map(order => {
      try {
        console.log('주문 ID:', order.id, 'items:', order.items);
        
        // items가 null이거나 빈 문자열인 경우 처리
        if (!order.items || order.items === 'null' || order.items === '') {
          console.log('주문 ID:', order.id, 'items가 비어있음');
          return {
            ...order,
            menu_names: '주문 정보 없음'
          };
        }
        
        // JSON 파싱 시도
        let items;
        try {
          console.log('주문 ID:', order.id, 'items 원본:', order.items);
          console.log('주문 ID:', order.id, 'items 타입:', typeof order.items);
          
          // PostgreSQL JSONB는 이미 객체로 변환됨
          if (order.items && typeof order.items === 'object') {
            items = order.items;
            console.log('주문 ID:', order.id, 'items가 이미 객체임:', items);
          } else if (order.items && typeof order.items === 'string') {
            // 문자열인 경우에만 파싱
            items = JSON.parse(order.items);
            console.log('주문 ID:', order.id, '문자열에서 파싱된 items:', items);
          } else {
            console.error('주문 ID:', order.id, 'items가 null이거나 예상치 못한 타입:', order.items);
            return {
              ...order,
              menu_names: '주문 데이터 없음'
            };
          }
        } catch (parseError) {
          console.error('JSON 파싱 실패 (주문 ID:', order.id, '):', parseError);
          console.error('문제가 된 items 데이터:', order.items);
          console.error('items 타입:', typeof order.items);
          console.error('items 길이:', order.items ? order.items.length : 'N/A');
          return {
            ...order,
            menu_names: 'JSON 파싱 오류'
          };
        }
        
        // items가 배열이 아닌 경우 처리
        if (!Array.isArray(items)) {
          console.log('주문 ID:', order.id, 'items가 배열이 아님:', typeof items);
          return {
            ...order,
            menu_names: '주문 형식 오류'
          };
        }
        
        const menuNames = items.map(item => {
          console.log('주문 ID:', order.id, 'item:', item);
          
          // item이 올바른 형식인지 확인
          if (!item || typeof item !== 'object') {
            return '잘못된 주문 항목';
          }
          
          const menuId = item.menu_id;
          const quantity = item.quantity;
          const options = item.options || [];
          
          if (!menuId || !quantity) {
            return '주문 정보 불완전';
          }
          
          // 메뉴 이름 가져오기
          const menuName = menuMap.get(menuId) || `메뉴 ID ${menuId}`;
          
          // 옵션 이름으로 변환
          const optionNames = options.map(optionId => {
            return optionMap.get(optionId) || `옵션 ID ${optionId}`;
          });
          
          // 옵션이 있는 경우 표시
          const optionsText = optionNames.length > 0 ? ` (옵션: ${optionNames.join(', ')})` : '';
          
          return `${menuName} x${quantity}${optionsText}`;
        });
        
        return {
          ...order,
          menu_names: menuNames.join(', ')
        };
      } catch (parseError) {
        console.error('JSON 파싱 오류 (주문 ID:', order.id, '):', parseError);
        console.error('문제가 된 items 데이터:', order.items);
        return {
          ...order,
          menu_names: '주문 정보 오류'
        };
      }
    });
    
    console.log('처리된 주문 데이터:', processedOrders);
    res.json(processedOrders);
  } catch (err) {
    console.error('주문 현황 조회 오류:', err);
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