import { useState, useEffect } from 'react'
import { BrowserRouter as Router, Routes, Route, NavLink, Navigate } from 'react-router-dom'
import './App.css'

// Google Fonts 적용 (index.html에서 link 추가 필요)

function Navbar() {
  return (
    <nav className="navbar">
      <div className="logo pacifico-font">COZY</div>
      <div className="nav-links">
        <NavLink to="/order" className={({ isActive }) => isActive ? 'nav-active' : undefined}>주문하기</NavLink>
        <NavLink to="/admin" className={({ isActive }) => isActive ? 'nav-active' : undefined}>관리자</NavLink>
      </div>
    </nav>
  )
}

function OrderPage() {
  const [menuList, setMenuList] = useState([]);
  const [cart, setCart] = useState([]);
  const [selectedOptions, setSelectedOptions] = useState({});
  const [loading, setLoading] = useState(false);

  // 메뉴 목록 서버에서 불러오기
  useEffect(() => {
    fetch('http://localhost:4000/api/menus')
      .then(res => res.json())
      .then(data => setMenuList(data))
      .catch(() => setMenuList([]));
  }, []);

  // 옵션 체크박스 변경 핸들러
  const handleOptionChange = (menuId, optionIdx) => {
    setSelectedOptions((prev) => {
      const prevOptions = prev[menuId] || [];
      if (prevOptions.includes(optionIdx)) {
        return { ...prev, [menuId]: prevOptions.filter((idx) => idx !== optionIdx) };
      } else {
        return { ...prev, [menuId]: [...prevOptions, optionIdx] };
      }
    });
  };

  // 장바구니 담기 (같은 메뉴+옵션 조합이면 수량만 증가)
  const handleAddToCart = (menu) => {
    const options = (selectedOptions[menu.id] || []).map(idx => menu.options[idx]);
    setCart((prev) => {
      const key = menu.id + '_' + options.map(o => o.id).join(',');
      const foundIdx = prev.findIndex(item => (item.menu.id + '_' + item.options.map(o => o.id).join(',')) === key);
      if (foundIdx > -1) {
        // 수량이 1씩만 증가하도록 안전하게 map 사용
        return prev.map((item, idx) =>
          idx === foundIdx
            ? { ...item, quantity: item.quantity + 1 }
            : item
        );
      } else {
        return [
          ...prev,
          {
            id: Date.now(),
            menu,
            options,
            quantity: 1,
          },
        ];
      }
    });
    setSelectedOptions((prev) => ({ ...prev, [menu.id]: [] }));
  };

  // 장바구니에서 항목 삭제
  const handleRemoveFromCart = (id) => {
    setCart((prev) => prev.filter(item => item.id !== id));
  };

  // 장바구니 합계 계산
  const getTotal = () => {
    return cart.reduce((sum, item) => {
      const optionTotal = item.options.reduce((oSum, o) => oSum + o.price, 0);
      return sum + (item.menu.price + optionTotal) * item.quantity;
    }, 0);
  };

  // 주문하기 버튼 클릭
  const handleOrder = async () => {
    if (cart.length === 0) return;
    setLoading(true);
    try {
      const items = cart.map(item => ({
        menu_id: item.menu.id,
        quantity: item.quantity,
        options: item.options.map(opt => opt.id)
      }));
      const res = await fetch('http://localhost:4000/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ items, total_price: getTotal() })
      });
      if (!res.ok) throw new Error('주문 실패');
      setCart([]);
      alert('주문이 완료되었습니다!');
    } catch (e) {
      alert('주문에 실패했습니다: ' + e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="menu-list">
        {menuList.map((menu) => (
          <div className="menu-card" key={menu.id}>
            <img src={menu.image_url} alt={menu.name} className="menu-img" />
            <div className="menu-title">{menu.name}</div>
            <div className="menu-price">{menu.price?.toLocaleString()}원</div>
            <div className="menu-options">
              {menu.options?.map((opt, idx) => (
                <label key={opt.id} className="option-label">
                  <input
                    type="checkbox"
                    checked={selectedOptions[menu.id]?.includes(idx) || false}
                    onChange={() => handleOptionChange(menu.id, idx)}
                  />
                  {opt.name} {opt.price > 0 ? `(+${opt.price.toLocaleString()}원)` : ''}
                </label>
              ))}
            </div>
            <button className="btn-primary" onClick={() => handleAddToCart(menu)}>
              담기
            </button>
          </div>
        ))}
      </div>
      <div className="cart-section">
        <div className="cart-list">
          <h3>장바구니</h3>
          {cart.length === 0 ? (
            <div>장바구니가 비어 있습니다.</div>
          ) : (
            <div>
              {cart.map((item) => (
                <div className="cart-item" key={item.id}>
                  <div className="cart-item-content">
                    <span>{item.menu.name}</span>
                    {item.options.length > 0 && (
                      <span className="cart-options">
                        ({item.options.map(o => o.name).join(', ')})
                      </span>
                    )}
                    <span> x {item.quantity}</span>
                  </div>
                  <span className="cart-price">
                    {(item.menu.price + item.options.reduce((s, o) => s + o.price, 0)).toLocaleString()}원
                  </span>
                  <button className="cart-remove" onClick={() => handleRemoveFromCart(item.id)}>
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
        <div className="cart-summary">
          <div className="cart-total">
            합계: <b>{getTotal().toLocaleString()}원</b>
          </div>
          <button className="btn-primary" style={{ width: '100%' }} disabled={cart.length === 0 || loading} onClick={handleOrder}>
            {loading ? '주문 중...' : '주문하기'}
          </button>
        </div>
      </div>
    </div>
  );
}

function AdminPage() {
  // 샘플 데이터
  const [dashboard, setDashboard] = useState({
    totalOrders: 12,
    pending: 3,
    making: 2,
    completed: 7,
  });
  const [stocks, setStocks] = useState([
    { id: 1, name: '아메리카노 (HOT)', stock: 4 },
    { id: 2, name: '아메리카노 (ICE)', stock: 8 },
    { id: 3, name: '카페라떼', stock: 0 },
  ]);
  const [orders, setOrders] = useState([
    { id: 1, date: '2024-06-17 10:12', menu: '아메리카노 (HOT)', price: 3000, status: '주문 접수' },
    { id: 2, date: '2024-06-17 10:15', menu: '카페라떼', price: 4000, status: '주문 접수' },
    { id: 3, date: '2024-06-17 10:18', menu: '아메리카노 (ICE)', price: 3500, status: '제조 중' },
  ]);

  // 재고 증감
  const handleStockChange = (id, diff) => {
    setStocks((prev) => prev.map(item =>
      item.id === id ? { ...item, stock: Math.max(0, item.stock + diff) } : item
    ));
  };

  // 주문 상태 변경
  const handleOrderStatus = (id) => {
    setOrders((prev) => prev.map(order =>
      order.id === id && order.status === '주문 접수'
        ? { ...order, status: '제조 중' }
        : order
    ));
  };

  // 재고 상태 텍스트
  const getStockStatus = (stock) => {
    if (stock === 0) return <span className="stock-status soldout">품절</span>;
    if (stock < 5) return <span className="stock-status warning">주의</span>;
    return <span className="stock-status normal">정상</span>;
  };

  return (
    <div className="admin-page">
      {/* 대시보드 */}
      <div className="dashboard-cards">
        <div className="dashboard-card">총 주문 <div className="dashboard-value">{dashboard.totalOrders}</div></div>
        <div className="dashboard-card">주문 접수 <div className="dashboard-value">{dashboard.pending}</div></div>
        <div className="dashboard-card">제조 중 <div className="dashboard-value">{dashboard.making}</div></div>
        <div className="dashboard-card">제조 완료 <div className="dashboard-value">{dashboard.completed}</div></div>
      </div>

      {/* 재고 현황 */}
      <div className="stock-section">
        <h3>재고 현황</h3>
        <div className="stock-list">
          {stocks.map((item) => (
            <div className="stock-card" key={item.id}>
              <div className="stock-name">{item.name}</div>
              <div className="stock-count">{item.stock}개 {getStockStatus(item.stock)}</div>
              <div className="stock-btns">
                <button className="btn-stock" onClick={() => handleStockChange(item.id, -1)} disabled={item.stock === 0}>-</button>
                <button className="btn-stock" onClick={() => handleStockChange(item.id, 1)}>+</button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주문 현황 */}
      <div className="order-section">
        <h3>주문 현황</h3>
        <div className="order-list">
          {orders.length === 0 ? (
            <div>주문이 없습니다.</div>
          ) : (
            <table className="order-table">
              <thead>
                <tr>
                  <th>일시</th>
                  <th>메뉴</th>
                  <th>금액</th>
                  <th>상태</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id}>
                    <td>{order.date}</td>
                    <td>{order.menu}</td>
                    <td>{order.price.toLocaleString()}원</td>
                    <td>{order.status}</td>
                    <td>
                      {order.status === '주문 접수' && (
                        <button className="btn-primary" style={{padding: '0.3em 0.8em', fontSize: '0.95em'}} onClick={() => handleOrderStatus(order.id)}>
                          제조 시작
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Navbar />
      <main className="main-container">
        <Routes>
          <Route path="/order" element={<OrderPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="*" element={<Navigate to="/order" />} />
        </Routes>
      </main>
    </Router>
  )
}

export default App
