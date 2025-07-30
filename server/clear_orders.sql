-- Orders 테이블의 모든 데이터 삭제
-- pgAdmin에서 실행하여 주문 데이터를 모두 지우세요

-- 1. 삭제 전 상태 확인
SELECT '=== 삭제 전 Orders 테이블 상태 ===' as info;
SELECT COUNT(*) as total_orders FROM Orders;

-- 2. 모든 주문 데이터 삭제
DELETE FROM Orders;

-- 3. 삭제 후 상태 확인
SELECT '=== 삭제 후 Orders 테이블 상태 ===' as info;
SELECT COUNT(*) as remaining_orders FROM Orders;

-- 4. 테이블 구조 확인 (데이터는 없지만 테이블은 유지됨)
SELECT '=== Orders 테이블 구조 확인 ===' as info;
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'orders' 
ORDER BY ordinal_position; 