-- 간단한 진단 스크립트 (PostgreSQL 호환)
-- pgAdmin에서 실행하여 문제를 진단하세요

-- 1. Orders 테이블 기본 정보
SELECT '=== Orders 테이블 기본 정보 ===' as info;
SELECT COUNT(*) as total_orders FROM Orders;

-- 2. 최근 주문 데이터 확인
SELECT '=== 최근 주문 데이터 ===' as info;
SELECT 
  id,
  items,
  total_price,
  status,
  created_at
FROM Orders 
ORDER BY created_at DESC 
LIMIT 3;

-- 3. items 컬럼 상태 확인
SELECT '=== items 컬럼 상태 ===' as info;
SELECT 
  id,
  CASE 
    WHEN items IS NULL THEN 'NULL'
    WHEN items = '' THEN '빈 문자열'
    WHEN items = 'null' THEN '문자열 null'
    ELSE '데이터 있음'
  END as items_status
FROM Orders 
ORDER BY created_at DESC 
LIMIT 5;

-- 4. 올바른 형식의 테스트 데이터 삽입
INSERT INTO Orders (items, total_price, status, created_at) VALUES
(
  '[{"menu_id": 1, "quantity": 2, "options": []}, {"menu_id": 3, "quantity": 1, "options": []}]',
  10000,
  '주문 접수',
  NOW()
);

-- 5. 삽입 확인
SELECT '=== 삽입된 테스트 데이터 ===' as info;
SELECT 
  id,
  items,
  total_price,
  status
FROM Orders 
ORDER BY created_at DESC 
LIMIT 1; 