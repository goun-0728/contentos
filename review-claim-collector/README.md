# 리뷰 클레임 수집기

네이버 스마트스토어/브랜드스토어 페이지에서 보이는 리뷰를 크롬 확장프로그램으로 수집하고, 웹앱에서 localStorage로 저장/관리하는 독립 프로젝트입니다.

## 구성

```text
review-claim-collector/
  index.html
  app/
    main.jsx
    styles.css
  public/
  extension/
    manifest.json
    popup.html
    popup.js
    content.js
  package.json
  vercel.json
  README.md
```

이 프로젝트는 기존 `contentos`의 페이지, admin, tools, detail-page-generator, blog/article 기능과 분리되어 있습니다.

## 웹앱

- Vercel 배포 시 루트(`/`)가 리뷰 클레임 수집기입니다.
- 서버 DB를 사용하지 않습니다.
- 리뷰는 현재 브라우저의 `localStorage`에 저장됩니다.
- JSON 업로드, JSON 붙여넣기, CSV 다운로드, JSON 백업, 전체 삭제를 지원합니다.

## 로컬 실행

```bash
npm install
npm run dev
```

로컬 URL:

```text
http://localhost:5173
```

## Vercel 배포

Vercel에서 이 폴더(`review-claim-collector`)를 프로젝트 루트로 선택해 배포합니다.

```bash
npm run build
```

Vercel 설정:

- framework: Vite
- build command: `npm run build`
- output directory: `dist`
- 배포 후 웹앱 URL: `https://내프로젝트.vercel.app`

## 크롬 확장프로그램 설치

1. 크롬에서 `chrome://extensions`로 이동합니다.
2. 개발자 모드를 ON으로 켭니다.
3. `압축해제된 확장 프로그램 로드`를 누릅니다.
4. 아래 폴더를 선택합니다.

```text
C:\Users\DS\contentos\review-claim-collector\extension
```

## 배포 후 전송 대상 URL 설정

1. 네이버 상품 페이지에서 리뷰 탭을 엽니다.
2. 확장프로그램을 클릭합니다.
3. `전송 대상 URL`에 배포된 Vercel URL을 입력합니다.

```text
https://내프로젝트.vercel.app
```

4. 품목명/업체명을 입력합니다.
5. `현재 페이지 리뷰 수집`을 누릅니다.
6. 미리보기와 디버그 로그를 확인합니다.
7. `웹앱으로 열어 전달`을 누르면 Vercel 웹앱이 열리고 리뷰가 localStorage에 저장됩니다.
8. 전달이 어렵거나 백업이 필요하면 `JSON 다운로드` 후 웹앱에서 업로드합니다.

## 확장프로그램 수정 후 다시 로드

`extension/manifest.json`, `extension/popup.js`, `extension/content.js`, `extension/popup.html`을 수정한 뒤에는 반드시 Chrome에서 확장프로그램을 새로고침해야 합니다.

1. `chrome://extensions`로 이동합니다.
2. `리뷰 클레임 수집기` 카드의 새로고침 버튼을 누릅니다.
3. 이미 열려 있던 네이버 상품 페이지도 새로고침합니다.

## 수집 범위

- 현재 활성 탭의 DOM만 읽습니다.
- 네이버 URL을 직접 fetch하지 않습니다.
- 자동 페이지 이동, 로그인 우회, 캡차 우회, 차단 회피 기능은 없습니다.
- 확장프로그램은 리뷰 후보를 JSON으로 전달하거나 다운로드합니다.
