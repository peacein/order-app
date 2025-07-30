-- 간단한 주문 데이터 확인
-- pgAdmin에서 실행하여 현재 상태를 확인하세요

-- 1. Orders 테이블에 데이터가 있는지 확인
SELECT 'Orders 테이블 레코드 수:' as info;
SELECT COUNT(*) as total_orders FROM Orders;

-- 2. 실제 주문 데이터 확인
SELECT '실제 주문 데이터:' as info;
SELECT id, items, total_price, status FROM Orders ORDER BY created_at DESC LIMIT 3;

-- 3. Menus 테이블 확인
SELECT 'Menus 테이블 데이터:' as info;
SELECT id, name, price FROM Menus ORDER BY id;

-- 4. JSON 파싱 테스트
SELECT 'JSON 파싱 테스트:' as info;
SELECT 
  id,
  items,
  CASE 
    WHEN items IS NULL THEN 'NULL'
    WHEN items = '' THEN '빈 문자열'
    WHEN items = 'null' THEN '문자열 null'
    ELSE '데이터 있음'
  END as items_status
FROM Orders 
ORDER BY created_at DESC 
LIMIT 3; 