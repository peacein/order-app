-- JSON 오류 진단 및 수정
-- pgAdmin에서 실행하여 문제를 해결하세요

-- 1. 문제가 되는 데이터 확인
SELECT '=== 문제가 되는 데이터 확인 ===' as info;
SELECT 
  id,
  items,
  LENGTH(items::text) as items_length,
  LEFT(items::text, 50) as items_preview
FROM Orders 
WHERE items IS NOT NULL
ORDER BY created_at DESC;

-- 2. 잘못된 JSON 데이터 삭제 (선택사항)
-- DELETE FROM Orders WHERE items IS NULL OR items = '' OR items = 'null';

-- 3. 올바른 형식의 테스트 데이터 삽입
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 1, "quantity": 2, "options": []}, {"menu_id": 3, "quantity": 1, "options": []}]',
  10000,
  '주문 접수',
  NOW()
);

-- 4. 삽입된 데이터 확인
SELECT '=== 삽입된 테스트 데이터 ===' as info;
SELECT 
  id,
  items,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC 
LIMIT 3;

-- 5. JSON 파싱 테스트
SELECT '=== JSON 파싱 테스트 ===' as info;
SELECT 
  id,
  CASE 
    WHEN items IS NULL THEN 'NULL'
    WHEN items = '' THEN '빈 문자열'
    WHEN items = 'null' THEN '문자열 null'
    ELSE '데이터 있음'
  END as items_status,
  CASE 
    WHEN items IS NULL OR items = '' OR items = 'null' THEN '파싱 불가'
    ELSE '파싱 가능'
  END as json_status
FROM Orders 
ORDER BY created_at DESC 
LIMIT 5; 