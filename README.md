# 리뷰 클레임 수집기

크롬 확장프로그램으로 현재 보고 있는 네이버 스마트스토어/브랜드스토어 페이지의 리뷰 DOM을 읽고, 웹앱에서 localStorage로 저장/관리하는 도구입니다.

## 현재 구조

```text
extension/
  manifest.json
  popup.html
  popup.js
  content.js

app/review-collector/
  page.tsx        # Vercel 배포용 웹앱 (/review-collector)
  server.mjs      # 로컬 개발용 Express 서버
  index.html      # 로컬 개발용 화면
  client.js       # 로컬 개발용 화면 스크립트
  styles.css
```

Vercel 1차 배포 버전은 서버 DB나 서버리스 메모리 큐를 사용하지 않습니다. 리뷰 데이터는 웹앱을 여는 브라우저의 `localStorage`에 저장됩니다.

## 로컬 실행

의존성을 설치합니다.

```bash
npm install
```

로컬 Express 버전을 실행합니다.

```bash
npm run review:app
```

Windows PowerShell에서 `npm` 실행 정책 오류가 나면 아래 명령어를 사용하세요.

```powershell
npm.cmd run review:app
```

로컬 웹앱:

```text
http://localhost:4174
```

## Vercel 배포

이 프로젝트는 루트 프로젝트 그대로 Vercel에 배포합니다.

```bash
npm run build
```

Vercel 설정:

- framework: Next.js
- build command: `npm run build`
- output: `.next`
- 배포 후 웹앱 경로: `https://내프로젝트.vercel.app/review-collector`

`vercel.json`도 포함되어 있습니다.

## 크롬 확장프로그램 설치

1. 크롬에서 `chrome://extensions`로 이동합니다.
2. 개발자 모드를 ON으로 켭니다.
3. `압축해제된 확장 프로그램 로드`를 누릅니다.
4. 아래 폴더를 선택합니다.

```text
C:\Users\DS\contentos\extension
```

## 배포 후 전송 대상 URL 변경

1. 네이버 상품 페이지에서 리뷰 탭을 엽니다.
2. 확장프로그램을 클릭합니다.
3. `전송 대상 URL`에 배포된 Vercel URL을 입력합니다.

```text
https://내프로젝트.vercel.app/review-collector
```

4. 품목명/업체명을 입력하고 `현재 페이지 리뷰 수집`을 누릅니다.
5. `웹앱으로 열어 전달`을 누르면 Vercel 웹앱이 열리고 리뷰가 localStorage에 저장됩니다.
6. 대량 데이터나 전달 실패 시 `JSON 다운로드`를 누른 뒤 Vercel 웹앱에서 JSON 업로드를 사용합니다.

## 확장프로그램 수정 후 다시 로드

`extension/manifest.json`, `extension/popup.js`, `extension/content.js`, `extension/popup.html`을 수정한 뒤에는 반드시 Chrome에서 확장프로그램을 새로고침해야 합니다.

1. `chrome://extensions`로 이동합니다.
2. `리뷰 클레임 수집기` 카드의 새로고침 버튼을 누릅니다.
3. 이미 열려 있던 네이버 상품 페이지도 새로고침합니다.

## 사용 흐름

1. 네이버 상품 페이지에서 리뷰 탭을 엽니다.
2. 확장프로그램을 클릭합니다.
3. `현재 페이지 리뷰 수집`을 누릅니다.
4. 팝업에서 수집 로그와 리뷰 후보 10개 미리보기를 확인합니다.
5. Vercel 웹앱으로 열어 전달하거나 JSON 파일을 다운로드합니다.
6. Vercel 웹앱에서 리뷰 목록을 확인합니다.
7. 필요하면 CSV를 다운로드합니다.

## 수집 범위

- 현재 활성 탭의 DOM만 읽습니다.
- 새 탭은 Vercel 웹앱으로 리뷰를 전달할 때만 엽니다.
- 네이버 URL을 직접 fetch하지 않습니다.
- 브라우저 자동화 도구를 사용하지 않습니다.
- 자동 페이지 이동, 로그인 우회, 캡차 우회, 차단 회피 기능은 없습니다.
