-- JSON 데이터 상태 확인
-- pgAdmin에서 실행하여 실제 데이터 상태를 확인하세요

-- 1. 최근 주문 데이터 확인
SELECT '=== 최근 주문 데이터 ===' as info;
SELECT 
  id,
  items::text as items_text,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC 
LIMIT 3;

-- 2. JSON 타입 확인
SELECT '=== JSON 타입 확인 ===' as info;
SELECT 
  id,
  jsonb_typeof(items) as json_type,
  CASE 
    WHEN items IS NULL THEN 'NULL'
    WHEN items::text = '' THEN '빈 문자열'
    WHEN items::text = 'null' THEN '문자열 null'
    ELSE '유효한 JSON'
  END as status
FROM Orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 3. JSON 배열 길이 확인
SELECT '=== JSON 배열 길이 확인 ===' as info;
SELECT 
  id,
  jsonb_array_length(items) as array_length,
  items::text as items_text
FROM Orders 
WHERE jsonb_typeof(items) = 'array'
ORDER BY created_at DESC 
LIMIT 5; 