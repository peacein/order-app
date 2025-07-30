-- Render PostgreSQL 초기 데이터 삽입 (수정된 버전)
-- 이 파일을 pgAdmin에서 실행하여 초기 데이터를 삽입하세요
-- Orders 테이블은 비워둡니다 (요청사항에 따라)

-- 1. 기존 데이터 삭제 (순서 중요)
DELETE FROM Options;
DELETE FROM Menus;

-- 2. Menus 테이블 초기 데이터 삽입
INSERT INTO Menus (name, price, stock, image_url, description) VALUES
('아메리카노 (HOT)', 3000, 20, '/images/americano-hot.jpg', '깊고 진한 에스프레소와 뜨거운 물로 만든 클래식 아메리카노'),
('아메리카노 (ICE)', 3000, 20, '/images/americano-ice.jpg', '깊고 진한 에스프레소와 차가운 물로 만든 시원한 아메리카노'),
('카페라떼', 4000, 20, '/images/latte.jpg', '부드러운 우유와 에스프레소가 조화를 이룬 클래식 라떼');

-- 3. Options 테이블 초기 데이터 삽입
INSERT INTO Options (menu_id, name, price) VALUES
-- 아메리카노 (HOT) 옵션
(1, '샷 추가', 500),
(1, '시럽 추가', 0),

-- 아메리카노 (ICE) 옵션  
(2, '샷 추가', 500),
(2, '시럽 추가', 0),

-- 카페라떼 옵션
(3, '샷 추가', 500),
(3, '시럽 추가', 0);

-- 4. 삽입된 데이터 확인
SELECT 'Menus 테이블:' as table_name;
SELECT id, name, price, stock FROM Menus ORDER BY id;

SELECT 'Options 테이블:' as table_name;
SELECT id, menu_id, name, price FROM Options ORDER BY menu_id, id; 