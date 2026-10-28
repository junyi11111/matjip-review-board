# 맛집 후기 게시판

웹서비스설계 JWT 게시판 과제입니다. 누구나 맛집 후기를 읽을 수 있고, 로그인한 사용자만 후기를 쓰며, 자신이 쓴 후기만 수정·삭제할 수 있습니다.

## 작성자와 서비스 소개

- 학번 / 이름: 202312906 / 박준이
- 서비스 목적과 대상 사용자: 다녀온 맛집의 후기를 가볍게 공유하는 게시판입니다. 학교 주변이나 동네 맛집 정보를 찾는 학생이 대상입니다. 후기 열람은 로그인 없이 가능하고, 작성은 로그인한 사용자만 할 수 있습니다. 다른 사람의 후기는 수정·삭제할 수 없도록 서버에서 작성자를 검사합니다.
- 선택한 기술: React + Express (SQLite 파일 DB)
- 주요 기능: 후기 목록·상세 공개 조회, 이메일·비밀번호 로그인과 JWT 발급, 내 정보 조회, 로그인 사용자의 후기 작성, 작성자 본인만 수정·삭제, 토큰 없음·변조·만료(401)와 권한 부족(403)·입력 오류(400)·없는 글(404) 안내, 로그아웃

## 보고서와 테스트 증거

- [구현 보고서 PDF](docs/report.pdf)
- [테스트 증거](docs/evidence/)
- [작업 기록](docs/worklog.md): 단계별 수정 파일·함수, 변경 이유, 출처 구분, 실제 실행한 확인 결과

## 프로젝트 구조

```text
.
├── README.md
├── .gitignore
├── backend-express/        # Express API 서버
│   ├── .env.example        # 환경설정 예시 (실제 .env는 커밋하지 않음)
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── app.js          # 라우트, 입력 검사, 오류 응답
│       ├── auth.js         # JWT 발급·검증, 작성자 권한 검사
│       ├── store.js        # SQLite(sql.js) 저장소
│       ├── users.js        # 테스트 계정과 비밀번호 검증(제공 코드)
│       └── errors.js
├── frontend-react/         # React + Vite 화면
│   ├── index.html
│   ├── vite.config.js      # /api 프록시 → 127.0.0.1:8000
│   ├── package.json
│   ├── package-lock.json
│   └── src/
│       ├── api.js          # API 호출, 메모리 토큰 보관, 응답 코드별 처리
│       ├── main.jsx        # 화면
│       └── style.css
├── tools/
│   └── check_api.py        # 제공된 API 자동 검사 스크립트
└── docs/
    ├── report.pdf          # 구현 보고서
    ├── evidence/           # 화면·요청 캡처
    ├── worklog.md          # 작업 기록
    └── 01~07_*.md 등       # 과제 제공 문서
```

## 실행 환경

| 항목 | 사용 버전 |
|---|---|
| 운영체제 | macOS 26.5.2 (Apple Silicon) |
| 프론트 런타임 Node.js | v26.8.2 (요구: 20.19 이상), npm 11.19.1 |
| 백엔드 런타임 | Node.js v26.8.2 |
| 프레임워크 | Express 5.3.0, jsonwebtoken 9.0.3, dotenv 18.0.7 / React 19.3.0, Vite 8.3.4 |
| 데이터 저장 | SQLite (필수) — sql.js 1.14.2, 파일 `backend-express/data/board.sqlite` |
| 자체 검사 도구 | Python 3 (표준 라이브러리만 사용, 3.14.6에서 실행) |

## 설치와 실행

터미널 두 개를 사용합니다. 터미널 A는 백엔드, 터미널 B는 프론트입니다. 각 포트에는 서버를 하나만 실행합니다.

### 1 저장소 복제

```sh
git clone https://github.com/junyi11111/matjip-review-board.git
cd matjip-review-board
```

### 2 백엔드 준비와 실행 (터미널 A)

저장소 루트에서 시작합니다.

```sh
cd backend-express
npm ci
cp .env.example .env
```

Windows PowerShell에서는 `cp` 대신 `Copy-Item .env.example .env`를 사용합니다.

새 비밀 키를 만들고 `.env`의 `JWT_SECRET=` 값을 출력된 64자리 16진수로 바꿉니다.

```sh
node -e "console.log(require('node:crypto').randomBytes(32).toString('hex'))"
```

```sh
npm start
```

- 환경설정 예시 파일: `backend-express/.env.example`
- JWT_SECRET 설정 방법: 위 명령으로 만든 32바이트 난수(64자리 16진수)를 `.env`에만 넣습니다. 출력된 키는 저장소·보고서·캡처에 남기지 않습니다. `JWT_SECRET`이 비어 있거나, 64자리 16진수가 아니거나, 예시 값 그대로면 서버가 시작을 거부합니다.
- TOKEN_TTL: 기본 90초(`.env`의 `TOKEN_TTL=90`). 만료 테스트는 macOS/Linux `TOKEN_TTL=3 npm start`, PowerShell `$env:TOKEN_TTL="3"; npm start`로 실행합니다.
- 백엔드 주소: http://127.0.0.1:8000
- 정상 실행 확인 방법: 터미널에 `맛집 후기 게시판 API — http://127.0.0.1:8000`이 출력되고, 브라우저나 `curl http://127.0.0.1:8000/api/health`에서 `{"status":"ok","stack":"express"}`가 보입니다.

### 3 프론트 빌드와 로컬 실행 (터미널 B)

백엔드를 켜 둔 채 새 터미널에서 저장소 루트부터 실행합니다.

```sh
cd frontend-react
npm ci
npm run build
npm run preview
```

- 최종 확인 주소: http://127.0.0.1:4173
- 개발 중 실행: `npm run dev`, http://127.0.0.1:5173
- API 연결 방식과 포트 변경 방법: 화면은 `/api/...`로 요청하고, Vite의 `preview.proxy`(4173)와 `server.proxy`(5173)가 `http://127.0.0.1:8000`으로 전달합니다. 백엔드 포트를 바꾸면 `frontend-react/vite.config.js`의 두 프록시 주소를 함께 바꾸고 프론트 서버를 다시 시작합니다. `dist/index.html`을 직접 열지 않습니다.
- 종료: 프론트와 백엔드를 실행한 각 터미널에서 Ctrl+C
- 코드 변경 후 재실행: 프론트는 preview를 종료하고 `npm run build` → `npm run preview`, 백엔드는 Ctrl+C 후 같은 `backend-express` 폴더에서 `npm start`

### 4 테스트 계정과 DB

| 사용자 | 이메일 | 실습용 비밀번호 |
|---|---|---|
| Alice | alice@class.test | Classroom!2026 |
| Bob | bob@class.test | Classroom!2026 |

- SQLite 파일 위치와 자동 생성 방식: `backend-express/data/board.sqlite`. 서버를 처음 시작할 때 폴더·파일·테이블이 자동 생성되며, 처음에는 글이 없습니다. 테스트 계정은 서버 시작 시 메모리에 준비됩니다.
- DB 초기화 방법: 백엔드를 Ctrl+C로 종료한 뒤 `backend-express/data/board.sqlite`만 삭제하고 다시 `npm start`합니다. 기존 글이 모두 지워집니다.
- 서버 재시작 후 데이터 유지 확인 결과: 글 2개를 만든 뒤 백엔드를 종료하고 같은 폴더에서 다시 실행했을 때 `GET /api/posts` 응답이 재시작 전과 완전히 같았습니다(id·작성자·제목·내용·작성/수정 시각). 4173 화면에서도 두 글이 그대로 보였습니다.

위 계정은 과제 전용 테스트 계정입니다. 실제 서비스 계정 정보나 서버 비밀 키를 기록하지 않습니다.

## 구현 완료 범위

| 기능 | 완료 여부 | 주요 파일 또는 함수 |
|---|---|---|
| 공개 목록과 상세 | 완료 | `backend-express/src/app.js` GET 라우트, `frontend-react/src/api.js` `api.list`·`api.detail` |
| 로그인과 JWT 발급 | 완료 | `auth.js` `loadConfig`·`issueToken`, `api.js` `login` |
| JWT 검증과 내 정보 조회 | 완료 | `auth.js` `currentUserId`, `app.js` `GET /api/me` |
| 글 작성과 작성자 저장 | 완료 | `app.js` `POST /api/posts`(작성자는 검증된 토큰의 사용자), `api.js` `authorizationHeaders` |
| 본인 글 수정·삭제 | 완료 | `auth.js` `assertOwner`, `api.js` `canEdit`, `main.jsx` 상세 버튼 |
| 토큰 만료와 로그아웃 | 완료 | `auth.js` `TOKEN_EXPIRED` 처리, `api.js` `request`(401 시 세션 해제), `main.jsx` 로그아웃 버튼 |
| 입력 오류와 권한 오류 처리 | 완료 | `app.js` `fields`, `auth.js` `assertOwner`(403), `api.js` `MESSAGES`, `main.jsx` `run`(404 시 목록 갱신) |

알려진 문제와 미완성 기능:
- 백엔드 실행 중에 프로젝트 폴더를 다른 위치로 옮기면 DB 파일 저장이 실패하여 수정·작성 요청이 500을 반환하고 변경이 메모리에만 남습니다. 서버를 새 위치의 `backend-express` 폴더에서 다시 실행하면 해결됩니다. 이때 500 원인은 서버 로그에 `[500] …` 형식으로 출력됩니다.
- 로그인 상태는 브라우저 메모리에만 보관하므로 새로고침하면 로그아웃됩니다(과제 요구사항에 따른 정상 동작).

## 테스트 방법과 결과 요약

- 실행한 검사 명령과 실행 위치: 백엔드를 실행한 상태에서 저장소 루트에서 `python3 tools/check_api.py --mode final` → 40건 통과. `TOKEN_TTL=3`으로 백엔드를 다시 실행한 뒤 `python3 tools/check_api.py --mode final --expiry` → 48건 통과. 화면 검사는 `npm run build` 후 4173 빌드본에서 수행.
- Alice/Bob 권한 구분 확인 결과: Bob 토큰으로 Alice 글을 수정·삭제하면 403 `FORBIDDEN`이고, 이후 공개 조회에서 글 내용·작성자·시각이 바뀌지 않았습니다. 화면에서는 Bob에게 Alice 글의 수정·삭제 버튼이 보이지 않습니다. Bob은 자기 글을 수정(200)·삭제(204)할 수 있습니다.
- HTTP 상태와 오류 code 확인: 로그인 200, 등록 201, 수정 200, 삭제 204 / 입력 오류·추가 필드(authorId·userId) 400 `BAD_INPUT`, 토큰 없음 401 `TOKEN_REQUIRED`, 변조·다른 키·iss/aud 불일치·없는 사용자 401 `INVALID_TOKEN`, 만료 401 `TOKEN_EXPIRED`, 타인 글 403 `FORBIDDEN`, 없는 글 404 `NOT_FOUND`. 상세 결과는 보고서 4장 참고.
- 응답 헤더와 본문 확인: 등록 201에 `Location: /api/posts/{id}`, 보호 API 401에 `WWW-Authenticate: Bearer`, 삭제 204는 빈 본문(프론트는 204를 JSON으로 파싱하지 않음).
- 토큰 없음·변조·만료 확인 결과: 세 경우 모두 401과 각각의 code를 반환하고, 화면은 로그아웃 상태로 바뀌며 code별 안내(로그인 필요 / 로그인 정보 오류 / 만료 후 재로그인)를 표시합니다. 입력 중이던 내용은 지워지지 않습니다.
- 전체 T01~T17 결과와 증거: [보고서 4장](docs/report.pdf), [docs/evidence/](docs/evidence/)

## 핵심 구현 설명

1. 로그인: `api.js` `login`이 이메일·비밀번호를 `POST /api/auth/login`으로 보냅니다. 서버(`app.js`)는 제공된 `users.js` `verifyCredentials`로 비밀번호를 검증하고, `auth.js` `issueToken`이 HS256 JWT(`sub`, `iss`, `aud`, `exp`)를 발급합니다. 비밀 키는 `.env`의 `JWT_SECRET`을 32바이트로 변환해 사용합니다.
2. 토큰 보관·전송: 프론트는 토큰과 사용자 정보를 모듈 변수(메모리)에만 보관하고 localStorage·sessionStorage는 쓰지 않습니다. `authorizationHeaders`가 토큰이 있을 때만 `Authorization: Bearer <JWT>`를 붙입니다.
3. 서버 검증: `auth.js` `currentUserId`가 Bearer 형식을 확인한 뒤 `jwt.verify`(HS256 고정, 서명·만료·iss·aud)로 검증하고, exp 존재·sub 형식·실제 계정 존재까지 확인한 사용자 ID만 라우트에 넘깁니다.
4. 작성자 권한: 수정·삭제는 인증 → 글 존재(404) → `assertOwner`(403) → 입력 검사(400) → 저장 순서로 처리합니다. 작성자 ID는 요청 본문이 아니라 검증된 토큰에서만 정합니다.
5. 화면 처리: `api.js` `request`가 401이면 세션을 지우고 code별 안내를 만들며, `main.jsx`는 작성자 본인에게만 수정·삭제 버튼을 보여 주고 404면 목록을 다시 불러옵니다.

## AI 활용 요약과 참고 자료

- AI 사용 여부: 사용
- 도구와 사용 목적: Claude Code (Anthropic, Claude Opus 5.5 모델). 시작 코드 구조 파악, 단계별 구현 초안 작성(BE-01~03, FE-01~04), 검증 요청 실행(curl·브라우저 자동화·`check_api.py`), 오류 원인 분석(500 응답), README·작업 기록 정리.
- 반영 위치와 직접 수정·검증한 내용: `backend-express/src/auth.js`, `backend-express/src/app.js`(시작 로그, 500 로그), `backend-express/.env.example`(안내 주석), `frontend-react/src/api.js`, `frontend-react/src/main.jsx`, `frontend-react/index.html`, `.gitignore`. 각 단계마다 변경 계획을 먼저 확인한 뒤 승인했고, 이메일 형식 오류를 401로 둘지, 공개 조회에 토큰을 보낼지, 화면 문구 등은 직접 결정했습니다. 모든 단계에서 실제 요청 결과를 확인한 뒤 커밋했습니다.
- 상세 활용 기록: [docs/worklog.md](docs/worklog.md), 보고서 5장
- 참고한 수업 자료·외부 코드·공식 문서: 과제 제공 문서(`docs/01_과제공지`, `02_API명세`, `03_구현체크리스트`, `05_테스트시나리오`, `07_로컬실행안내`)와 제공 시작 코드. 외부 코드를 복사해 사용하지 않았습니다.

## 제출 확인

- [x] README의 안내 문구를 실제 내용으로 교체했다.
- [ ] 새 폴더에 clone하여 README만으로 설치·환경설정·빌드·로컬 실행했다.
- [x] 4173번 빌드 화면에서 API 연결과 전체 필수 기능을 확인했다.
- [ ] GitHub에서 보고서와 증거 링크가 열린다.
- [ ] 교수자가 저장소를 열람·복제할 수 있다.
- [ ] 비밀 키·실제 토큰·DB·node_modules·.venv·target을 커밋하지 않았다.
- [ ] 최종 push 후 저장소 URL과 제출 기준 커밋 SHA를 LMS에 제출했다.
