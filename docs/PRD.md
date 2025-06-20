# 커피 주문 앱 PRD (Product Requirements Document)

## 1. 개요
이 문서는 커피 주문 앱의 요구사항과 기능을 정의합니다. 사용자와 관리자를 위한 두 가지 주요 화면을 제공하며, 기본적인 주문 및 관리 기능을 구현합니다.

## 2. 목표
- 사용자가 쉽게 메뉴를 주문할 수 있는 인터페이스 제공
- 관리자가 주문 현황과 재고를 효율적으로 관리할 수 있는 기능 제공
- 기본적인 기능을 중심으로 한 안정적인 서비스 구현

## 3. 주요 기능

### 3.1 사용자 화면
#### 메뉴 주문
- 메뉴 목록 표시
- 메뉴별 옵션 선택 기능
- 장바구니 기능
  - 메뉴 담기
  - 수량 조절
  - 주문하기

### 3.2 관리자 화면
#### 재고 관리
- 메뉴별 재고 현황 표시
- 재고 수량 관리 기능

#### 주문 관리
- 주문 목록 확인
- 주문 상태 관리 (접수/준비중/완료)

## 4. 기술 스택
- 프론트엔드: React.js, Javascript
- 백엔드: Node.js, Express
- 데이터베이스: PostgreSQL

## 5. 데이터베이스 스키마

### Menu (메뉴)
```javascript
{
  id: String,
  name: String,
  price: Number,
  description: String,
  stock: Number,
  options: [{
    name: String,
    price: Number
  }]
}
```

### Order (주문)
```javascript
{
  id: String,
  items: [{
    menuId: String,
    quantity: Number,
    options: [String]
  }],
  status: String, // 'pending', 'preparing', 'completed'
  createdAt: Date,
  totalPrice: Number
}
```

## 6. 개발 일정
1. 기획 및 요구사항 정의 (현재 단계)
2. 데이터베이스 설계
3. 프론트엔드 개발
4. 백엔드 개발
5. 데이터베이스 구축
6. 테스트 및 배포

## 7. 제한사항
- 기본적인 기능 구현에 집중
- 복잡한 기능은 제외
- 안정성과 사용성 중심의 개발 