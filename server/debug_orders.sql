-- 주문 데이터 구조 확인
-- pgAdmin에서 실행하여 실제 주문 데이터를 확인하세요

-- 1. Orders 테이블의 모든 데이터 확인
SELECT '=== Orders 테이블 전체 데이터 ===' as info;
SELECT id, items, total_price, status, created_at FROM Orders ORDER BY created_at DESC;

-- 2. items 컬럼의 JSON 구조 확인
SELECT '=== JSON 구조 분석 ===' as info;
SELECT 
  id,
  items,
  json_typeof(items) as json_type,
  json_array_length(items::json) as array_length
FROM Orders 
WHERE items IS NOT NULL;

-- 3. 첫 번째 주문의 상세 분석
SELECT '=== 첫 번째 주문 상세 분석 ===' as info;
SELECT 
  id,
  items,
  (items::json->0) as first_item,
  (items::json->0->>'menu_id') as first_menu_id,
  (items::json->0->>'quantity') as first_quantity,
  (items::json->0->>'options') as first_options
FROM Orders 
ORDER BY created_at DESC 
LIMIT 1;

-- 4. 메뉴 ID 목록 확인
SELECT '=== 주문에 포함된 메뉴 ID들 ===' as info;
SELECT DISTINCT 
  json_array_elements(items::json)->>'menu_id' as menu_id
FROM Orders 
WHERE items IS NOT NULL;

-- 5. Menus 테이블 확인
SELECT '=== Menus 테이블 데이터 ===' as info;
SELECT id, name, price FROM Menus ORDER BY id; 