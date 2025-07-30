-- 주문 데이터 JSON 파싱 문제 진단
-- pgAdmin에서 실행하여 문제를 확인하세요

-- 1. 현재 Orders 테이블 상태 확인
SELECT '=== Orders 테이블 상태 ===' as info;
SELECT COUNT(*) as total_orders FROM Orders;

-- 2. items 컬럼 데이터 타입 확인
SELECT '=== items 컬럼 타입 확인 ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'items';

-- 3. 최근 주문 데이터 확인 (텍스트로)
SELECT '=== 최근 주문 데이터 (텍스트) ===' as info;
SELECT 
  id,
  items::text as items_text,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. JSON 유효성 검사
SELECT '=== JSON 유효성 검사 ===' as info;
SELECT 
  id,
  CASE 
    WHEN items IS NULL THEN 'NULL'
    WHEN items::text = '' THEN '빈 문자열'
    WHEN items::text = 'null' THEN '문자열 null'
    WHEN jsonb_typeof(items) = 'array' THEN '유효한 JSON 배열'
    WHEN jsonb_typeof(items) = 'object' THEN '유효한 JSON 객체'
    ELSE '기타: ' || jsonb_typeof(items)
  END as json_status,
  CASE 
    WHEN items IS NULL THEN 'NULL'
    WHEN items::text = '' THEN '빈 문자열'
    WHEN items::text = 'null' THEN '문자열 null'
    ELSE LEFT(items::text, 100) || CASE WHEN LENGTH(items::text) > 100 THEN '...' ELSE '' END
  END as items_preview
FROM Orders 
ORDER BY created_at DESC 
LIMIT 10; 