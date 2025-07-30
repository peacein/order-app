# Render PostgreSQL 데이터베이스 마이그레이션 가이드

## 1. Render 데이터베이스 정보 확인

Render 대시보드에서 다음 정보를 확인하세요:
- **Host**: 데이터베이스 호스트 주소
- **Database**: 데이터베이스 이름
- **User**: 사용자 이름
- **Password**: 비밀번호
- **Port**: 포트 번호 (보통 5432)
- **External Database URL**: 전체 연결 문자열

## 2. pgAdmin에서 데이터베이스 연결

### 2.1 pgAdmin에서 새 서버 추가
1. pgAdmin 실행
2. 우클릭 → "Create" → "Server..."
3. **General** 탭:
   - Name: `Render Database` (원하는 이름)
4. **Connection** 탭:
   - Host: Render에서 제공한 호스트 주소
   - Port: 5432 (또는 제공된 포트)
   - Database: 데이터베이스 이름
   - Username: 사용자 이름
   - Password: 비밀번호
   - Save password 체크

### 2.2 연결 테스트
- "Save" 클릭 후 연결이 성공하는지 확인

## 3. 테이블 생성

### 3.1 스키마 실행
1. pgAdmin에서 연결된 데이터베이스 선택
2. **Query Tool** 열기 (SQL 아이콘 클릭)
3. `server/database_schema.sql` 파일 내용을 복사하여 붙여넣기
4. **Execute** 버튼 클릭하여 테이블 생성

### 3.2 생성된 테이블 확인
- **Schemas** → **public** → **Tables**에서 다음 테이블들이 생성되었는지 확인:
  - `menus`
  - `options` 
  - `orders`

## 4. 초기 데이터 삽입

### 4.1 메뉴 및 옵션 데이터 삽입
1. **Query Tool**에서 새 쿼리 열기
2. `server/initial_data.sql` 파일 내용을 복사하여 붙여넣기
3. **Execute** 버튼 클릭하여 초기 데이터 삽입

### 4.2 데이터 확인
```sql
-- 메뉴 데이터 확인
SELECT * FROM menus;

-- 옵션 데이터 확인  
SELECT * FROM options;
```

## 5. 환경 변수 설정

### 5.1 로컬 개발 환경
1. `server` 폴더에 `.env` 파일 생성
2. `server/env_example.txt` 내용을 참고하여 실제 값으로 설정:

```env
# Render에서 제공하는 DATABASE_URL 사용 (권장)
DATABASE_URL=postgresql://username:password@host:port/database

# 또는 개별 환경 변수
PGUSER=your_username
PGHOST=your_host
PGDATABASE=your_database
PGPASSWORD=your_password
PGPORT=5432
NODE_ENV=production
```

### 5.2 Render 배포 환경
Render 대시보드에서 환경 변수 설정:
1. **Environment** 섹션으로 이동
2. **Environment Variables** 추가:
   - `DATABASE_URL`: Render에서 제공하는 전체 연결 문자열
   - `NODE_ENV`: `production`

## 6. 연결 테스트

### 6.1 서버 실행 및 테스트
```bash
cd server
npm start
```

### 6.2 API 엔드포인트 테스트
- `GET /api/db-health`: 데이터베이스 연결 상태 확인
- `GET /api/menus`: 메뉴 목록 조회
- `GET /api/admin/menus`: 관리자 메뉴 현황

## 7. 문제 해결

### 7.1 연결 오류
- SSL 설정 확인: `ssl: { rejectUnauthorized: false }`
- 방화벽/네트워크 설정 확인
- Render 데이터베이스 상태 확인

### 7.2 테이블 없음 오류
- 스키마가 올바르게 실행되었는지 확인
- 데이터베이스 선택이 올바른지 확인

### 7.3 권한 오류
- Render 데이터베이스 사용자 권한 확인
- 테이블 생성 권한 확인

## 8. 백업 및 복원

### 8.1 데이터 백업
```sql
-- pgAdmin에서 백업
-- 우클릭 → Backup → Custom 형식으로 백업
```

### 8.2 데이터 복원
```sql
-- pgAdmin에서 복원
-- 우클릭 → Restore → 백업 파일 선택
```

## 주의사항

1. **Orders 테이블**: 요청사항에 따라 초기 데이터를 삽입하지 않았습니다.
2. **SSL 연결**: Render PostgreSQL은 SSL 연결을 요구합니다.
3. **환경 변수**: 실제 값으로 교체해야 합니다.
4. **보안**: `.env` 파일을 Git에 커밋하지 마세요. 