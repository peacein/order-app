-- 테이블 상태 확인 스크립트
-- pgAdmin에서 실행하여 현재 상태를 확인하세요

-- 1. Menus 테이블 확인
SELECT 'Menus 테이블 데이터:' as info;
SELECT id, name, price, stock FROM Menus ORDER BY id;

-- 2. Options 테이블 확인
SELECT 'Options 테이블 데이터:' as info;
SELECT id, menu_id, name, price FROM Options ORDER BY menu_id, id;

-- 3. 테이블 구조 확인
SELECT 'Menus 테이블 구조:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'menus' 
ORDER BY ordinal_position;

SELECT 'Options 테이블 구조:' as info;
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'options' 
ORDER BY ordinal_position; 