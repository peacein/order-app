# 프로젝트 폴더 구조

```
order-app/
  ├── docs/
  │     └── PRD.md
  ├── server/
  │     ├── index.js
  │     ├── package-lock.json
  │     └── package.json
  ├── ui/
  │     ├── eslint.config.js
  │     ├── index.html
  │     ├── package-lock.json
  │     ├── package.json
  │     ├── public/
  │     │     ├── images/
  │     │     │     ├── americano-hot.jpg
  │     │     │     ├── americano-ice.jpg
  │     │     │     └── latte.jpg
  │     │     └── vite.svg
  │     ├── README.md
  │     ├── src/
  │     │     ├── App.css
  │     │     ├── App.jsx
  │     │     ├── assets/
  │     │     │     └── react.svg
  │     │     ├── index.css
  │     │     └── main.jsx
  │     └── vite.config.js
```

## 폴더 및 파일 설명

- **docs/**: 프로젝트 관련 문서가 저장되는 폴더입니다.
  - **PRD.md**: 제품 요구 사항 문서(Product Requirements Document)입니다.
  - **project_structure.md**: 프로젝트 폴더 구조와 각 파일의 역할을 설명하는 문서입니다.

- **server/**: 백엔드 서버 코드가 위치한 폴더입니다.
  - **index.js**: 서버의 메인 엔트리 파일로, 서버 실행 및 라우팅 등의 핵심 로직이 작성됩니다.
  - **package.json**: 백엔드 프로젝트의 의존성, 스크립트, 메타데이터가 정의되어 있습니다.
  - **package-lock.json**: 설치된 의존성의 정확한 버전이 기록된 파일입니다.

- **ui/**: 프런트엔드(React 기반) 애플리케이션 코드가 위치한 폴더입니다.
  - **eslint.config.js**: 코드 스타일 및 문법 검사 도구(ESLint) 설정 파일입니다.
  - **index.html**: 프런트엔드 앱의 기본 HTML 파일입니다.
  - **package.json**: 프런트엔드 프로젝트의 의존성, 스크립트, 메타데이터가 정의되어 있습니다.
  - **package-lock.json**: 설치된 의존성의 정확한 버전이 기록된 파일입니다.
  - **public/**: 정적 파일(이미지, 아이콘 등)이 저장되는 폴더입니다.
    - **images/**: 메뉴 이미지 등 다양한 이미지 파일이 위치합니다.
    - **vite.svg**: Vite 로고 SVG 파일입니다.
  - **README.md**: 프런트엔드 프로젝트에 대한 설명 및 사용법이 작성된 문서입니다.
  - **src/**: 실제 프런트엔드 소스 코드가 위치한 폴더입니다.
    - **App.jsx**: React의 메인 컴포넌트 파일입니다.
    - **App.css**: App.jsx에서 사용하는 스타일 파일입니다.
    - **index.css**: 전체 앱에 적용되는 전역 스타일 파일입니다.
    - **main.jsx**: React 앱의 진입점(entry point) 파일입니다.
    - **assets/**: 추가적인 정적 자산(예: 아이콘 등)이 저장되는 폴더입니다.
      - **react.svg**: React 로고 SVG 파일입니다.
  - **vite.config.js**: Vite(프런트엔드 빌드 도구) 설정 파일입니다. 