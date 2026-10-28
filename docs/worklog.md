# 작업 기록 (worklog)

- 선택 조합: frontend-react + backend-express + SQLite(`backend-express/data/board.sqlite`)
- 주제: 맛집 후기 게시판
- 출처 구분 표기: `제공 코드 유지` / `AI가 작성` / `AI 초안 후 사용자 수정`
- 실행하지 않은 확인은 "미확인"으로 적는다. 비밀 키와 실제 토큰 값은 이 문서에 적지 않는다.

---

## 2026-10-28 · 0단계: 준비와 구조 파악 (코드 수정 없음)

### 수정한 파일
- 소스 코드 수정 없음.
- 새로 만든 파일: `docs/worklog.md` (이 문서) — 출처: AI가 작성
- 실행 결과로 생긴 파일(커밋 대상 아님):
  - `backend-express/node_modules/`, `frontend-react/node_modules/` (`npm ci`)
  - `backend-express/data/board.sqlite` (서버 시작 시 자동 생성)

### 실행 환경
- macOS, Node.js v26.8.2, npm 11.19.1 (README 요구: Node 20.19 이상 → 충족)
- 과제 폴더는 아직 git 저장소가 아님 (`git status` → not a git repository)

### 실제로 실행한 확인과 결과
| 확인 | 방법 | 결과 |
|---|---|---|
| 백엔드 의존성 설치 | `backend-express`에서 `npm ci` | 성공. `npm audit`: body-parser(high), qs(moderate) 2건 보고됨 — 조치하지 않음 |
| 프론트 의존성 설치 | `frontend-react`에서 `npm ci` | 성공, 취약점 0건. fsevents install script 경고만 표시 |
| 백엔드 실행 | `npm start` (`.env` 없이) | 콘솔: `게시판 시작 코드 http://127.0.0.1:8000 — 인증 TODO 미완성` |
| health | `curl -i http://127.0.0.1:8000/api/health` | `HTTP/1.1 200 OK`, `{"status":"ok","stack":"express"}` |
| 프록시 경유 health | `curl http://127.0.0.1:5173/api/health` | 200, 동일 JSON |
| 로그인 API | `POST /api/auth/login` (Alice 정상 계정) | 501 `{"code":"NOT_IMPLEMENTED",...}` — 의도된 미완성 상태 |
| 토큰 없이 /api/me | `curl /api/me` | 200, Alice 정보 반환 — 데모 ID 1 때문 (최종본에서는 401이어야 함) |
| 자체 검사 | `python3 tools/check_api.py --mode starter` | `All 14 checks passed (starter)` |
| 화면 CRUD | Playwright 브라우저로 http://127.0.0.1:5173 조작 | 비로그인 상태에서 등록 → 목록(1개) → 상세 → 수정(제목 변경 반영) → 삭제(확인창 수락, 목록 0개) 모두 성공. 작성자는 데모 Alice로 표시 |
| 화면 로그인 버튼 | 같은 브라우저에서 클릭 | 상태 메시지 "로그인 연결은 학생 구현 항목입니다. FE-01을 완성하세요." — 서버 요청 없이 프론트에서 바로 예외 |
| 브라우저 콘솔 | Playwright 콘솔 로그 | 오류 1건: `/favicon.ico` 404 (기능과 무관) |

- 시험용 글은 삭제했으며 확인 후 `GET /api/posts` 결과는 `[]`.
- 확인 후 백엔드·프론트 서버를 모두 종료함.

### 미확인
- `npm run build` / `npm run preview`(4173 포트) 빌드본 실행 — 미확인
- 서버 재시작 후 데이터 유지 — 미확인
- Vue·FastAPI·Spring 템플릿 — 선택하지 않았으므로 실행하지 않음

---

## 2026-10-28 · 1단계: .gitignore 보완과 git 초기화 (소스 코드 수정 없음)

### 수정한 파일: `.gitignore` (함수 없음)
- 제공 코드의 원래 역할: `node_modules/`, `dist/`, `.venv/`, `__pycache__/`, `*.pyc`, `target/`, `data/`, `.env`, `.DS_Store` 제외
- 변경 내용: 기존 9줄 유지, 아래 줄 추가
  - `*.sqlite`, `*.sqlite.tmp` — `DB_FILE`로 경로를 바꿔도 DB와 `store.js` `flush()`의 임시 파일이 커밋되지 않도록
  - `.env.*`, `!.env.example` — `.env.local` 같은 변형 파일 제외, 예시 파일은 커밋 유지
  - `*.log`, `npm-debug.log*`, `.idea/`, `.vscode/` — 로그·에디터 설정 제외
- 출처: AI가 작성 (추가할 줄 목록은 사용자가 지정)

### git 초기화
- `git init -b main` 실행 (사용자 git 설정은 기존 global 값 사용, 임의 설정 없음)

### 실제로 실행한 확인과 결과
| 확인 | 방법 | 결과 |
|---|---|---|
| 커밋 후보 목록 | `git add -A --dry-run` | 64개 (그중 사용하지 않는 템플릿 3개 폴더 33개 포함) |
| 금지 파일 포함 여부 | 후보 목록에서 node_modules, data/, dist/, .sqlite, .env, .DS_Store 검색 | 없음 |
| 무시 규칙 적용 | `git check-ignore -v` | `node_modules/`(2곳), `backend-express/data/board.sqlite`(`data/` 규칙), `.DS_Store` 제외 확인 |
| `.env.example` 포함 | 후보 목록 검색 | `backend-express/.env.example` 포함됨 |

### 사용하지 않는 템플릿 삭제
- 사용자 요청으로 `frontend-vue/`, `backend-fastapi/`, `backend-spring/` 삭제 (사용자가 별도 백업 보유)
- 삭제 후 `git add -A --dry-run` 결과: 커밋 후보 31개 (위 표의 64개는 삭제 전 수치)

### 커밋 (사용자 요청으로 두 번에 나눔)
| 커밋 | ID | 내용 |
|---|---|---|
| `chore: 시작 코드 원본` | `8fcb0e7747866b189eb46ef2bae7857282796fea` | 제공 파일 29개 + 원래 9줄 `.gitignore` (보완본과 worklog 제외) — 제공 코드 원본 기준점 |
| `chore: .gitignore 보완과 작업 기록 추가` | `1435191ebf71aba3ca0dfb24bb516d02cb9ff0c1` | 보완한 `.gitignore`(+11줄), `docs/worklog.md` |

- 첫 커밋 방법: 보완한 `.gitignore`를 임시 보관 → 앞 9줄만 남긴 상태로 `git add -A` 후 `docs/worklog.md` 스테이징 해제 → 커밋 → 보완본 복원
- 확인: 각 커밋 전 `git status --short`로 대상 확인, `git diff --cached --name-only`에서 `.env`, `node_modules`, `data/`, `dist/`, `*.sqlite` 검색 → 두 커밋 모두 해당 없음
- 이 커밋 ID 기록은 세 번째 커밋 `docs: 커밋 ID 기록`으로 남김

---

## 2026-10-28 · 2단계: BE-01 로그인과 JWT 발급 (커밋 전)

### 수정한 파일과 함수
**1) `backend-express/src/auth.js` — `loadConfig()`(신규), 모듈 최상단 `config`, `issueToken(user)`**
- 원래 역할: `issueToken`이 `501 NOT_IMPLEMENTED`를 던지는 자리표시 함수. 설정 검사 없음.
- 변경 내용과 이유:
  - `loadConfig()`를 추가해 모듈 로드(서버 시작) 시 한 번 실행. `JWT_SECRET`이 빈 값 / 제공 예시 값 / 64자리 16진수가 아니면 오류를 던져 시작을 거부한다(BE-01 요구). 오류 메시지에 키 값은 넣지 않는다.
  - 통과한 키는 `Buffer.from(secret, "hex")`로 32바이트 키로 변환(명세 "사용 시 bytes로 변환").
  - `TOKEN_TTL`이 양의 정수가 아니면 시작 거부, 기본 90. 이유: `app.js` 57행이 `expiresIn`을 `Number(process.env.TOKEN_TTL || 90)`로 따로 계산하므로, 잘못된 값이면 응답 `expiresIn`과 실제 `exp`가 어긋날 수 있다.
  - `JWT_ISSUER`, `JWT_AUDIENCE`는 환경변수 우선, 없으면 `webservice-class`, `board-api`. 출처: `docs/02_API명세.md` 83~84행(JWT 설정과 검증 표), `.env.example` 5~6행.
  - `issueToken`: 501 제거. `jsonwebtoken`(package.json에 9.0.3으로 이미 포함)의 `jwt.sign({}, key, {algorithm:"HS256", subject:String(user.id), issuer, audience, expiresIn:ttl})`. 페이로드를 빈 객체로 두고 옵션으로만 클레임을 넣어 비밀번호·해시·이메일이 토큰에 들어가지 않게 했다. 서명은 라이브러리 사용(직접 구현 없음).
  - `currentUserId`, `assertOwner`(BE-02/03)는 수정하지 않음.
- 출처: AI가 작성

**2) `backend-express/.env.example` — 1행 주석**
- 원래 역할: TODO 주석과 설정 예시(자리표시 키 포함).
- 변경: TODO 주석을 키 생성 방법과 "자리표시자 그대로면 시작 거부" 안내 3줄로 교체. `JWT_SECRET` 값은 자리표시자 그대로 유지.
- 출처: AI가 작성 (생성 명령은 `backend-express/README.md`의 명령과 같음)

**3) `backend-express/.env` — 새 파일, git 제외**
- `.env.example`의 설정 줄을 복사하고 `JWT_SECRET`만 `crypto.randomBytes(32)` 난수로 교체. 키는 화면·로그·문서에 출력하지 않고 파일에 바로 기록(권한 600).
- 출처: AI가 생성 명령 실행

**수정하지 않은 파일**: `app.js`(로그인 라우트가 이미 입력 검사 → `verifyCredentials` → `issueToken` 순서), `users.js`(제공 비밀번호 검증 그대로 사용), `errors.js`, `tools/check_api.py`, 프론트 전체.
- 이메일 형식: 사용자 결정으로 `app.js`를 수정하지 않음. `"abc"`처럼 `@` 없는 문자열은 400이 아니라 401 INVALID_CREDENTIALS로 둔다.

### 실제로 실행한 확인과 결과
| 확인 | 방법 | 결과 |
|---|---|---|
| `.env` 키 형식 | Node로 64자리 hex 여부, 예시 값과 다른지 true/false만 출력 | `64hex: true`, `differs from example: true` |
| `.env` git 제외 | `git check-ignore -v backend-express/.env` | `.gitignore:8:.env` 규칙으로 무시됨 |
| `.env.example`에 실제 키 없음 | 실제 키 문자열로 `.env.example`과 프로젝트 전체(node_modules·.git·.env 제외) 검색 | 둘 다 없음. `.env.example` 4행은 자리표시자 |
| 시작 거부: 빈 값 | `JWT_SECRET= node src/app.js` | exit 1, `JWT_SECRET이 비어 있습니다.` |
| 시작 거부: 형식 오류 | `JWT_SECRET=abc node src/app.js` | exit 1, `64자리 16진수(32바이트)여야 합니다.` |
| 시작 거부: 예시 값 | `JWT_SECRET=REPLACE_WITH_RANDOM_64_HEX_CHARACTERS node src/app.js` | exit 1, `제공 예시 값입니다.` |
| 거부 메시지에 키 노출 | 위 3건 출력에서 시험 값과 실제 키 문자열 검색 | 모두 포함되지 않음 |
| Alice 정상 로그인 | `curl POST /api/auth/login` | 200, `expiresIn: 90`, `user: {id:1, name:"Alice", email:"alice@class.test"}` |
| 틀린 비밀번호 | 〃 | 401 `INVALID_CREDENTIALS` |
| 없는 계정 | 〃 | 401 `INVALID_CREDENTIALS` |
| `@` 없는 문자열 `"abc"` | 〃 | 401 `INVALID_CREDENTIALS` (결정대로) |
| email 누락 / 숫자 / 공백만 / 추가 필드 / 깨진 JSON | 〃 | 모두 400 `BAD_INPUT` |
| 토큰 구조 | base64url 디코드(Bob 로그인) | 세그먼트 3개, header `{alg:"HS256", typ:"JWT"}`, payload 키 `iat, exp, aud, iss, sub`, `sub`는 문자열 `"2"`, `iss=webservice-class`, `aud=board-api`, `exp-iat=90`, 비밀번호·해시·salt 키 없음 |
| 서명 | `.env` 키로 `jwt.verify(algorithms:["HS256"], issuer, audience)` | 통과(sub=1). 다른 키로는 `invalid signature` |
| 자체 검사 | `python3 tools/check_api.py --mode starter` | exit 1. PASS 6건(health, public list, bad ID, missing ID, wrong password, unknown email), `FAIL JWT intentionally unfinished: expected HTTP 501, got 200` |

- **예상된 실패(시작 코드 상태를 검사하는 항목)**: starter 모드의 `JWT intentionally unfinished`는 정상 로그인이 501인지 검사한다. BE-01로 200이 되었으므로 실패가 맞다. 스크립트가 첫 실패에서 멈춰 그 뒤 starter 항목(create post, detail, update demo, bad input, no client author, delete)은 실행되지 않았다 → 이번 단계에서 미확인. `check_api.py`는 수정하지 않음.
- 주의: 이 FAIL 메시지가 테스트 계정의 토큰 원문을 터미널에 출력했다. 90초 TTL로 이미 만료됐고 이 문서에는 옮기지 않았다.
- 401 INVALID_CREDENTIALS 응답에도 `WWW-Authenticate: Bearer`가 붙는다(`app.js` 오류 미들웨어가 모든 401에 추가). 제공 코드 동작이며 이번에 바꾸지 않음.
- 확인 후 백엔드 서버 종료.

### 미확인
- `--mode final` 검사 — BE-02/03 미구현이므로 실행하지 않음
- `TOKEN_TTL` 변경(예: 3초) 시 `exp-iat`와 `expiresIn` 반영 — 미확인
- 프론트 화면에서 로그인 — FE-01 미구현이므로 미확인

### BE-01 커밋
- `feat(BE-01): JWT 발급과 비밀 키 검사 구현` — `c7c2658425a20c1486621ab3bc5b380519ccf3cd` (`.env.example`, `auth.js`, worklog 2단계 기록. `.env`는 `git status --ignored`에서 `!!`로 제외 확인, 스테이징 diff에 실제 키 없음 확인)
- 커밋 전 재확인(2026-10-28): `jwt.sign` 옵션 중복 여부 점검 → 중복 없음(`issuer`·`audience` 2회 출현은 `loadConfig` 반환 객체와 `jwt.sign` 옵션이 서로 다른 객체이기 때문), 파일 수정 없음. Alice 로그인 재실행 → 200, `sub="1"`, `iss=webservice-class`, `aud=board-api`, `exp-iat=90`.

---

## 2026-10-28 · 3단계: BE-02 토큰 검증과 /me (커밋 전)

### 수정한 파일과 함수: `backend-express/src/auth.js` — `currentUserId(req)`, import 1줄
- 원래 역할: TODO BE-02 주석과 함께 항상 데모 사용자 ID `1`을 반환. 토큰을 보지 않아 비로그인 상태에서도 글 작성·수정·삭제가 가능했다.
- 변경 내용과 이유:
  - `return 1` 제거. `Authorization` 헤더를 `/^Bearer\s+(\S+)$/i`로 확인하고, 없거나 형식이 다르면 401 `TOKEN_REQUIRED`. 인증 방식 이름(`Bearer`)은 HTTP 규칙상 대소문자를 구분하지 않으므로 `i` 플래그 사용.
  - `jwt.verify(token, config.key, {algorithms:["HS256"], issuer, audience})`로 서명·알고리즘·만료·iss·aud 검증(decode 미사용). `TokenExpiredError` → 401 `TOKEN_EXPIRED`, 그 밖의 `JsonWebTokenError`(서명 오류·형식 오류·iss/aud 불일치·alg none 등) → 401 `INVALID_TOKEN`. JWT 오류가 아닌 예외는 다시 던져 500으로 드러나게 했다.
  - `jsonwebtoken`은 exp가 없으면 만료 검사를 건너뛰므로 `typeof payload.exp === "number"`를 직접 확인. `sub`는 문자열이고 양의 정수 형태여야 한다. 아니면 401 `INVALID_TOKEN`.
  - `users.js`의 `findPublic(Number(sub))`로 실제 계정 존재 확인(없으면 401 `INVALID_TOKEN`). 이를 위해 `import { findPublic } from "./users.js"` 추가. 검증된 숫자 ID만 반환.
  - `assertOwner`(BE-03)는 수정하지 않음.
- 출처: AI가 작성

**수정하지 않은 파일**: `app.js`. `GET /api/me`는 이미 `currentUserId` → `findPublic`으로 `{id, name, email}`만 반환하고, 보호 라우트(POST/PUT/DELETE)는 첫 줄에서 `currentUserId`를 호출하며, 오류 미들웨어가 모든 401에 `WWW-Authenticate: Bearer`를 붙인다. 확인만 함. `tools/check_api.py`도 수정하지 않음.

### 실제로 실행한 확인과 결과
검증 스크립트(Node, 작업 폴더 밖 임시 파일)로 실행. 시험 토큰은 `.env` 키 또는 임의 키로 생성했고 키·토큰 원문은 출력하지 않음.

| 요청 (`GET /api/me` 기준) | 결과 | WWW-Authenticate |
|---|---|---|
| 토큰 없음 | 401 `TOKEN_REQUIRED` | Bearer |
| `Bearer` 없이 토큰만 | 401 `TOKEN_REQUIRED` | Bearer |
| `Bearer ` 뒤 빈 값 | 401 `TOKEN_REQUIRED` | Bearer |
| `Basic abc` | 401 `TOKEN_REQUIRED` | Bearer |
| Alice 정상 토큰 | 200 `{"id":1,"name":"Alice","email":"alice@class.test"}` — 응답 키 `id, name, email`, password/hash/salt 키 없음 | — |
| 서명 부분 변조 | 401 `INVALID_TOKEN` | Bearer |
| payload 변조(sub=2, 서명 유지) | 401 `INVALID_TOKEN` | Bearer |
| 다른 키로 서명 | 401 `INVALID_TOKEN` | Bearer |
| iss 다름 / aud 다름 | 각각 401 `INVALID_TOKEN` | Bearer |
| 없는 사용자 sub=999 | 401 `INVALID_TOKEN` | Bearer |
| sub=`"abc"` / sub 숫자 타입 | 각각 401 `INVALID_TOKEN` | Bearer |
| exp 없음(정상 서명) | 401 `INVALID_TOKEN` | Bearer |
| alg=none / HS512 | 각각 401 `INVALID_TOKEN` | Bearer |
| `bearer`(소문자) + 정상 토큰 | 200 Alice | — |
| 토큰 없이 POST /posts, PUT /posts/1, DELETE /posts/1 | 모두 401 `TOKEN_REQUIRED` | Bearer |
| `TOKEN_TTL=3 npm start` 후 로그인 | `expiresIn: 3`, `exp-iat = 3`, 발급 직후 /me 200 | — |
| 5초 후 같은 토큰으로 /me, POST /posts | 둘 다 401 `TOKEN_EXPIRED` | Bearer |
| 토큰 없이 GET /posts, GET /posts/3 | 둘 다 200 (Alice 토큰으로 만든 시험 글 id=3, `authorId: 1`, 201 + `Location: /api/posts/3`) | — |

- 시험 글 id=3은 Alice 토큰으로 삭제(204), 이후 목록 `[]`.

**`python3 tools/check_api.py --mode final`** (토큰은 가려서 확인)
- PASS 15건: `health`, `public list`, `bad ID`, `missing ID`, `wrong password`, `unknown email`, `no token me`, `no token create`, `login alice@class.test`, `login bob@class.test`, `Alice me`, `Bob me`, `create post`, `public detail`, `no token PUT`
- `FAIL Bob denied PUT: expected HTTP 403, got 200` → **예상된 실패(BE-03 미구현)**. `assertOwner`가 비어 있어 Bob 토큰으로 Alice 글이 실제로 수정되었다.
- 스크립트가 남긴 시험 글 id=4(`Cleanup may be needed for post IDs: [4]`)를 Alice 토큰으로 삭제 → 204, 이후 `GET /posts/4` 404, 목록 `[]`.
- 종료 코드: 실행 명령의 실수로 값을 받지 못함(출력란 공백). 스크립트 코드상 실패 시 `sys.exit(1)`.
- 확인 후 기본 서버와 `TOKEN_TTL=3` 서버를 모두 종료, 8000·5173 포트 비어 있음 확인.

### 영향과 미확인
- 프론트는 아직 토큰을 보내지 않으므로(FE-02 미구현) **화면에서 글 등록·수정·삭제는 401로 실패한다**. 목록·상세 조회는 가능. 화면 동작은 미확인.
- `--mode final --expiry`: 403 항목에서 만료 단계 전에 멈추므로 실행하지 않음 → 미확인(만료 동작은 위 수동 시험으로 확인).
- `--mode starter`: 사용자 요청으로 다시 실행하지 않음.

### BE-02 커밋
- `feat(BE-02): JWT 검증과 사용자 확인 구현` — `c505e8848a834bbdfb49d22516c8b6f5407850f4` (`auth.js`, worklog 3단계 기록. `.env`는 `git status --ignored`에서 `!!`로 제외 확인, 스테이징 diff에 실제 키·토큰 원문 없음 확인)
