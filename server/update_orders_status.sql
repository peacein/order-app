-- Orders 테이블 status 칼럼 기본값 변경
-- pgAdmin에서 실행하여 기존 데이터베이스의 기본값을 변경하세요

-- 1. 기존 기본값 제거
ALTER TABLE Orders ALTER COLUMN status DROP DEFAULT;

-- 2. 새로운 기본값 설정
ALTER TABLE Orders ALTER COLUMN status SET DEFAULT '주문 접수';

-- 3. 기존 '대기 중' 데이터를 '주문 접수'로 변경
UPDATE Orders SET status = '주문 접수' WHERE status = '대기 중';

-- 4. 변경 확인
SELECT 'Orders 테이블 status 값 확인:' as info;
SELECT id, status, created_at FROM Orders ORDER BY created_at DESC;

-- 5. 기본값 확인
SELECT 'Orders 테이블 기본값 확인:' as info;
SELECT column_name, column_default 
FROM information_schema.columns 
WHERE table_name = 'orders' AND column_name = 'status'; 