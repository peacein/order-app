-- 올바른 형식의 테스트 주문 데이터 생성
-- pgAdmin에서 실행하여 테스트 주문을 생성하세요

-- 1. 기존 테스트 데이터 삭제 (선택사항)
-- DELETE FROM Orders WHERE total_price = 10000;

-- 2. 올바른 형식의 테스트 주문 데이터 삽입
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 1, "quantity": 2, "options": []}, {"menu_id": 3, "quantity": 1, "options": []}]',
  10000,
  '주문 접수',
  NOW()
);

-- 3. 다른 형식의 테스트 주문도 추가
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 2, "quantity": 1, "options": [1, 2]}]',
  5500,
  '제조 중',
  NOW() - INTERVAL '1 hour'
);

-- 4. 삽입된 데이터 확인
SELECT '=== 삽입된 테스트 주문 ===' as info;
SELECT 
  id,
  items,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 5. JSON 파싱 테스트
SELECT '=== JSON 파싱 테스트 ===' as info;
SELECT 
  id,
  json_array_length(items::json) as item_count,
  (items::json->0->>'menu_id')::int as first_menu_id,
  (items::json->0->>'quantity')::int as first_quantity
FROM Orders 
ORDER BY created_at DESC 
LIMIT 3; 