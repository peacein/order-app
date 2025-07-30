-- 테스트용 주문 데이터 생성
-- pgAdmin에서 실행하여 테스트 주문을 생성하세요

-- 1. 기존 주문 삭제 (선택사항)
-- DELETE FROM Orders;

-- 2. 테스트 주문 데이터 삽입
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 1, "quantity": 2, "options": []}, {"menu_id": 3, "quantity": 1, "options": []}]',
  10000,
  '주문 접수',
  NOW()
);

-- 3. 삽입된 데이터 확인
SELECT '테스트 주문 데이터:' as info;
SELECT id, items, total_price, status, created_at FROM Orders ORDER BY created_at DESC;

-- 4. JSON 파싱 테스트
SELECT 
  id,
  items,
  json_array_length(items::json) as item_count,
  (items::json->0->>'menu_id')::int as first_menu_id,
  (items::json->0->>'quantity')::int as first_quantity
FROM Orders 
ORDER BY created_at DESC; 