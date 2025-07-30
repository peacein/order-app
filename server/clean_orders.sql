-- 잘못된 주문 데이터 정리
-- pgAdmin에서 실행하여 문제를 해결하세요

-- 1. 현재 Orders 테이블 상태 확인
SELECT '=== 현재 Orders 테이블 상태 ===' as info;
SELECT COUNT(*) as total_orders FROM Orders;

-- 2. 잘못된 데이터 삭제
DELETE FROM Orders WHERE 
  items IS NULL OR 
  items = '' OR 
  items = 'null' OR
  items = '[]' OR
  items = '{}';

-- 3. 삭제 후 상태 확인
SELECT '=== 삭제 후 Orders 테이블 상태 ===' as info;
SELECT COUNT(*) as remaining_orders FROM Orders;

-- 4. 남은 데이터 확인
SELECT '=== 남은 주문 데이터 ===' as info;
SELECT 
  id,
  items,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. 올바른 형식의 테스트 데이터 삽입
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 1, "quantity": 2, "options": []}, {"menu_id": 3, "quantity": 1, "options": []}]',
  10000,
  '주문 접수',
  NOW()
);

-- 6. 추가 테스트 데이터
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 2, "quantity": 1, "options": []}]',
  3000,
  '제조 중',
  NOW() - INTERVAL '1 hour'
);

-- 7. 최종 확인
SELECT '=== 최종 주문 데이터 ===' as info;
SELECT 
  id,
  items,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC; 