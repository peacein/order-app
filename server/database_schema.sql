-- Render PostgreSQL 데이터베이스 스키마
-- 이 파일을 pgAdmin에서 실행하여 테이블을 생성하세요

-- Menus 테이블 생성
CREATE TABLE IF NOT EXISTS Menus (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL,
    stock INTEGER NOT NULL DEFAULT 0,
    image_url VARCHAR(255),
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Options 테이블 생성
CREATE TABLE IF NOT EXISTS Options (
    id SERIAL PRIMARY KEY,
    menu_id INTEGER REFERENCES Menus(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    price INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Orders 테이블 생성
CREATE TABLE IF NOT EXISTS Orders (
    id SERIAL PRIMARY KEY,
    items JSONB NOT NULL,
    total_price INTEGER NOT NULL,
    status VARCHAR(20) DEFAULT '대기 중',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- 인덱스 생성 (성능 향상)
CREATE INDEX IF NOT EXISTS idx_menus_name ON Menus(name);
CREATE INDEX IF NOT EXISTS idx_options_menu_id ON Options(menu_id);
CREATE INDEX IF NOT EXISTS idx_orders_created_at ON Orders(created_at);
CREATE INDEX IF NOT EXISTS idx_orders_status ON Orders(status); 