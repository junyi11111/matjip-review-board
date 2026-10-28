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

---

## 2026-10-28 · 4단계: BE-03 작성자 권한 (커밋 전)

### 수정한 파일과 함수: `backend-express/src/auth.js` — `assertOwner(userId, authorId)`
- 원래 역할: TODO BE-03 주석만 있는 빈 함수. 누구나 모든 글을 수정·삭제할 수 있었다.
- 변경 내용과 이유: `userId !== authorId`이면 `ApiError(403, "FORBIDDEN", ...)`를 던진다. `userId`는 BE-02에서 검증된 숫자 ID, `authorId`는 DB에 저장된 글의 작성자 ID이므로 요청 본문이나 토큰 내용을 직접 믿지 않는다. 두 값이 모두 number임을 확인한 뒤 엄격 비교(`!==`) 사용.
- 출처: AI가 작성

**수정하지 않은 파일(확인만 함)**
- `app.js` `POST /api/posts`: 작성자 ID는 `currentUserId(req)` 결과로 결정. `fields()`가 `title`, `content` 외의 키를 400으로 거부하므로 본문의 `authorId`/`userId`는 반영될 수 없다.
- `app.js` `PUT`/`DELETE /api/posts/:id`: `currentUserId`(401) → `postId`(ID 형식 400) → `getPost`(404) → `assertOwner`(403) → `fields`(PUT만, 400) → `store.update`/`store.remove`. 명세의 인증 → 글 존재 → 권한 → 입력 검증 → 변경 순서와 일치. 깨진 JSON은 `express.json()`이 라우트 전에 400 처리(명세에서 허용).
- `store.js` `update`: `UPDATE posts SET title=?,content=?,updated_at=?`만 실행하므로 `author_id`, `created_at`은 바뀌지 않는다.

### 실제로 실행한 확인과 결과
**타입 확인**: 코드 수정 없이 `auth.js`·`store.js`를 직접 import하는 임시 스크립트를 실제 DB의 **사본**으로 실행(`DB_FILE=<사본>`, `node --env-file=.env`). `userId = 1 typeof number`, `authorId = 1 typeof number`, `userId === authorId: true`. 실행 전후 실제 `data/board.sqlite`의 md5 동일, 사본은 삭제.

**수동 시험** (토큰 원문 미출력)
| 요청 | 결과 |
|---|---|
| Alice 글 생성 | 201, `authorId: 1` |
| Bob → Alice 글 수정 / 삭제 | 둘 다 403 `FORBIDDEN` |
| Bob → Alice 글에 공백 제목 | 403 `FORBIDDEN` (400 아님 → 권한이 입력 검증보다 먼저) |
| Bob → Alice 글에 `authorId` 추가 필드 | 403 `FORBIDDEN` |
| 403 전후 공개 조회 비교 | title·content·authorId·createdAt·updatedAt 모두 동일 |
| Bob → 없는 글 수정 / 삭제 | 둘 다 404 `NOT_FOUND` |
| 토큰 없이 → 없는 글 수정 / 삭제 | 둘 다 401 `TOKEN_REQUIRED` (404보다 인증이 먼저) |
| Alice → 자기 글 공백 제목 | 400 `BAD_INPUT` |
| Alice → 자기 글 수정 | 200, authorId 1 유지, createdAt 유지, updatedAt 변경 |
| Bob 등록 + `authorId:1` / `userId:1` / `id:1` | 모두 400 `BAD_INPUT`, 글 수 1 → 1 (새 글 생성 안 됨) |
| Bob 정상 등록 | 201, `authorId: 2`, `authorName: Bob` |
| Alice → Bob 글 수정 | 403 `FORBIDDEN` |
| Bob → 자기 글 수정 | 200 |
| Alice → 자기 글 삭제 | 204, 이후 공개 조회 404 |
| Bob → 자기 글 삭제 | 204 |

**`python3 tools/check_api.py --mode final`** (기본 TTL 90, 토큰 가림)
- `All 40 checks passed (final)`, 종료 코드 0.
- BE-02 때 PASS 15건 대비 **새로 통과한 25건**:
  - BE-03 때문에 통과: `Bob denied PUT`, `Bob denied DELETE`, `failed request leaves data unchanged` ×3
  - BE-02 때는 403에서 멈춰 실행되지 않았던 항목: `no token DELETE`, `reject authorId`, `reject userId`, `input validation` ×4, `tampered GET /me`, `tampered POST /posts`, `tampered PUT /posts/{id}`, `tampered DELETE /posts/{id}`, `owner update`, `create post`(Bob), `Bob own update`, `missing protected PUT`, `missing protected DELETE`, `delete owned test post` ×2, `deleted post missing` ×2

**`python3 tools/check_api.py --mode final --expiry`** (`TOKEN_TTL=3 npm start` 서버)
- `All 48 checks passed (final)`, 종료 코드 0. TTL 3초 때문에 중간에 만료되는 일 없이 통과.
- 만료 항목: `Waiting 4 seconds for expiration` 후 `expired GET /me`, `expired POST /posts`, `expired PUT /posts/{id}`, `expired DELETE /posts/{id}` 모두 PASS (401 `TOKEN_EXPIRED`).

**정리**: 수동 시험 글 2개(id 5, 6)는 시험 안에서 삭제. `check_api.py` 두 번의 실행은 스스로 시험 글을 삭제(`delete owned test post` PASS). 각 실행 후 `GET /api/posts` → `[]`. 기본 서버와 TTL=3 서버 모두 종료, 8000·5173 포트 비어 있음 확인.

### 미확인
- 화면 동작: 프론트가 아직 토큰을 보내지 않음(FE-02 미구현). 화면에서 등록·수정·삭제는 401로 실패할 것으로 예상하지만 이번에 화면으로 확인하지 않음.
- 서버 재시작 후 데이터 유지: 미확인.

### BE-03 커밋
- `feat(BE-03): 작성자 권한 검사 구현` — `e0faac9b96721d06e9157e3797cbf4fe5b3e479d` (`auth.js`, worklog 4단계 기록. `.env`는 `git status --ignored`에서 `!!`로 제외 확인, 스테이징 diff에 실제 키·토큰 원문 없음 확인)
- 자동 검사 결과(커밋 대상 코드로 실행): `check_api.py --mode final` 40건 모두 통과(exit 0), `--mode final --expiry`(`TOKEN_TTL=3` 서버) 48건 모두 통과(exit 0). 백엔드 BE-01~03 완료.

---

## 2026-10-28 · 5단계: FE-01 로그인 상태 연결, FE-02 토큰 첨부 (커밋 전)

### 수정한 파일과 함수: `frontend-react/src/api.js`
**`authorizationHeaders()` (FE-02)**
- 원래 역할: TODO와 함께 항상 빈 객체 `{}` 반환 → 어떤 요청에도 토큰이 붙지 않음.
- 변경: `session.accessToken`이 있을 때만 `{ Authorization: "Bearer <토큰>" }`, 없으면 `{}`. 토큰이 없을 때 헤더 키 자체가 생기지 않아 `Bearer undefined`가 나갈 수 없다.
- 공개 목록·상세: 사용자 결정으로 `request()` 구조를 그대로 둠. 로그인 상태에서는 목록·상세에도 토큰이 붙지만 서버 GET 라우트는 토큰을 읽지 않으므로 동작 차이 없음. 로그아웃 상태에서는 헤더 없이 조회.

**`login(email, password)` (FE-01)**
- 원래 역할: TODO와 함께 즉시 예외("로그인 연결은 학생 구현 항목입니다…")를 던져 서버에 요청하지 않음.
- 변경: `clearSession()`을 먼저 호출한 뒤 `request("/auth/login", {method:"POST", body: JSON.stringify({email, password})})`. 성공하면 `session = {accessToken, user}`로 모듈 변수(메모리)에만 저장하고 `user` 반환. 실패하면 `request()`가 서버의 `message`로 오류를 던진다.
- `clearSession()`을 먼저 부르는 이유: (1) 기존 사용자 토큰이 로그인 요청에 붙지 않게, (2) 로그인 실패 시 이전 사용자 화면이 남지 않고 로그아웃 상태가 되게.
- localStorage/sessionStorage 미사용, 디버깅용 console 출력 없음.
- 출처: AI가 작성 (공개 조회 토큰 처리 방식은 사용자가 기본안으로 결정)

**수정하지 않은 파일**: `main.jsx`. 로그인 폼 `onSubmit` → `run(() => login(...))`, `run()`의 `catch`가 `setMessage(e.message)`로 오류 표시, `finally`가 `setUser(getSession().user)`로 로그인 표시("○○님 로그인 중"/"로그아웃 상태")를 이미 연결하고 있어 FE-01에 필요한 변경이 없었다. 테스트 계정 미리 입력도 그대로 둠(사용자 요청).

### 실제로 실행한 확인과 결과
백엔드(`npm start`)와 Vite 개발 서버(`npm run dev`, 5173)를 띄우고 Playwright 브라우저로 화면을 조작. 요청마다 브라우저가 실제로 보낸 `Authorization` 헤더를 기록(토큰은 앞 10자 + payload의 sub만 표시). `alert`/`confirm`은 시험 페이지 안에서만 기록용 함수로 대체(소스 수정 아님).

| 단계 | 화면 | 요청 → 응답 | Authorization 헤더 |
|---|---|---|---|
| 첫 로드 | "로그아웃 상태" | GET /api/posts → 200 | 없음 |
| 틀린 비밀번호 | 상태 "이메일 또는 비밀번호를 확인하세요." / "로그아웃 상태" | POST /api/auth/login → 401 | 없음 |
| Alice 로그인 | 상태 "로그인했습니다." / "Alice님 로그인 중" | POST /api/auth/login → 200 | 없음 |
| Alice 내 정보 조회 | alert "Alice (alice@class.test)" | GET /api/me → 200 | Bearer (sub=1) |
| Alice 글 등록 | "게시글을 저장했습니다." | POST /api/posts → 201, 이어서 GET /api/posts → 200 | Bearer (sub=1) |
| Alice 상세·수정 | "게시글을 저장했습니다." | GET /api/posts/12 → 200, PUT /api/posts/12 → 200 | Bearer (sub=1) |
| 로그인 상태에서 틀린 비밀번호 | 오류 메시지 / "로그아웃 상태"로 바뀜 | POST /api/auth/login → 401 | 없음 |
| Alice 재로그인 → Bob 로그인 | "Bob님 로그인 중" | POST /api/auth/login → 200 (두 번) | 없음 (Alice 로그인 상태에서 보낸 Bob 로그인 요청에도 없음) |
| Bob 내 정보 조회 | alert "Bob (bob@class.test)" | GET /api/me → 200 | Bearer (sub=2) |
| Bob이 Alice 글 삭제 | 상태 "본인이 작성한 글만 수정·삭제할 수 있습니다." | DELETE /api/posts/12 → 403 | Bearer (sub=2) |
| 새로고침 | "로그아웃 상태" (메모리 저장이므로 해제) | GET /api/posts → 200 | 없음 |
| 로그아웃 상태 상세 | 상세 제목 표시, "게시글을 불러왔습니다." | GET /api/posts/12 → 200 | 없음 |

- 토큰 노출: 화면 본문에 `eyJ` 문자열 없음. 브라우저 콘솔 전체(debug 수준 포함)에 토큰 출력 없음 — 콘솔 오류는 favicon 404와 의도한 401·403 요청 실패 표시뿐.
- 저장소: 브라우저 `localStorage`·`sessionStorage` 항목 수 0. `frontend-react/src`에서 `localStorage|sessionStorage|console.log/debug/info` 검색 결과 없음.
- 첫 번째 Playwright 실행은 alert 처리 방식 문제로 결과 문자열을 돌려받지 못함. 그 실행이 만든 시험 글(id 11)을 확인하고, 같은 시나리오를 alert/confirm 대체 방식으로 다시 실행해 위 결과를 얻음.
- 정리: 시험 글 id 11, 12를 Alice 토큰으로 삭제(각 204), 이후 `GET /api/posts` → `[]`. 백엔드·Vite 서버 종료, 8000·5173 포트 비어 있음 확인.

### 남은 한계와 미확인
- `request()`의 TODO FE-03(401 시 세션 해제)은 이번 범위가 아님 → 토큰 만료 후에도 화면에는 "○○님 로그인 중"이 남는다(미확인, FE-03에서 처리 예정).
- `canEdit`가 항상 true라 Bob에게도 Alice 글의 수정·삭제 버튼이 보인다(서버가 403으로 막음). FE-04 범위.
- 빌드본(`npm run build`/`preview`)에서의 동작: 미확인.

### FE-01, FE-02 커밋
- `feat(FE-01,FE-02): 로그인 연결과 토큰 전송 구현` — `e0c4b4e73c21e71d69447d617c2f2173f09dcabf` (`frontend-react/src/api.js`, worklog 5단계 기록. `.env`는 `git status --ignored`에서 `!!`로 제외 확인, 스테이징 diff에 실제 키·토큰 원문 없음 확인)

---

## 2026-10-28 · 6단계: FE-03 응답 코드별 처리, FE-04 작성자별 버튼·로그아웃·화면 정리 (커밋 전)

### 수정한 파일과 함수
**1) `frontend-react/src/api.js`**
- 1행 TODO 주석 삭제.
- `MESSAGES`(신규 상수): code별 화면 문구. INVALID_CREDENTIALS / TOKEN_REQUIRED / INVALID_TOKEN / TOKEN_EXPIRED / FORBIDDEN / NOT_FOUND. BAD_INPUT은 어느 칸이 문제인지 알려 주는 서버 문구("title 입력을 확인하세요." 등)를 그대로 쓴다.
- `request()` — 원래 역할: 204면 `null`, 아니면 `response.json()`; 실패 시 서버 `message`로 오류를 던짐(TODO FE-03: 401 처리 없음).
  - 변경: 401이면 `clearSession()`으로 메모리 토큰·사용자 해제. 화면 로그인 표시는 `main.jsx` `run()`의 `finally`(`setUser(getSession().user)`)가 이어서 갱신. 403은 해제하지 않음. 오류 문구는 `MESSAGES[code]` → 서버 `message` → `요청을 처리하지 못했습니다. (HTTP n)` 순.
  - 204는 원래도 파싱하지 않았음(확인만 함, 동작 유지).
- `canEdit(post)` — 원래: 항상 `true`. 변경: `session.user !== null && post.authorId === session.user.id`. 최종 판단은 서버 403.
- 출처: AI가 작성

**2) `frontend-react/src/main.jsx`** (`App`)
- 상태 초기값: 이메일·비밀번호 `"alice@class.test"`, `"Classroom!2026"` → `""` (제출본에 비밀번호 하드코딩 제거).
- `run()` catch: 404이면 `setSelected(null)`, `setEditing(null)`, `refresh()`로 목록 갱신. 입력값은 지우지 않음. 400·401·403은 문구만 표시하고 입력값 유지.
- `save()`: 맨 앞에서 `getSession().user`가 없으면 "후기를 쓰려면 먼저 로그인하세요." 표시 후 요청하지 않음.
- 헤더: `WEB SERVICE DESIGN · STARTER` → `WEB SERVICE DESIGN · 맛집 후기`, `우리의 기록` → `맛집 후기 게시판`, 소개 문구 → "다녀온 맛집의 솔직한 후기를 나눠 보세요."
- 데모 배너("시작 코드: 인증 미완성 · 글쓰기는 데모 작성자 Alice로…") → 서비스 안내 "후기는 누구나 읽을 수 있고, 작성은 로그인한 사용자만 할 수 있습니다. 수정·삭제는 작성자 본인만 가능합니다."
- 로그인 카드의 테스트 계정 안내 문구(이메일 2개와 "공통 비밀번호: …") **삭제** — 화면에 비밀번호가 출력되고 있었음.
- 로그아웃 버튼: 로그아웃 상태에서 비활성. 클릭 시 기존 `clearSession()`·`setUser(null)`에 `reset()` 추가(수정 모드·입력 폼 비움).
- 작성 카드: 비로그인 시 "후기를 쓰려면 먼저 로그인하세요." 표시, `등록`/`수정 저장` 버튼 비활성(`disabled={busy || !user}`).
- 빈 목록 문구: "첫 번째 기록을 남겨 보세요." → "첫 번째 맛집 후기를 남겨 보세요."
- 수정·삭제 버튼은 기존 `canEdit(selected) && …` 구조로 타인 글에서 숨겨짐(구조 변경 없음).
- 출처: AI가 작성 (문구 방향과 서비스 이름 "맛집 후기 게시판"은 사용자 지정)

**3) `frontend-react/index.html`** — `<title>우리의 기록 | JWT 게시판 과제</title>` → `<title>맛집 후기 게시판</title>`. 서비스 이름은 사용자가 나중에 확정 예정. 출처: AI가 작성(이름은 사용자 지정).

### 요구사항 외 개선 (사용자 승인 후 반영)
- **내용**: `request()`에서 204가 아닌 응답을 `response.json().catch(() => null)`로 읽고, `data?.code`/`data?.message`로 접근.
- **이유**: 본문이 JSON이 아닌 실패 응답(예: 백엔드가 꺼져 Vite 프록시가 `502 text/plain`을 반환)에서 원래 코드는 `response.json()`이 SyntaxError를 던져 파싱 오류 문구가 화면에 그대로 뜨거나, 파싱에 성공해도 `data`가 없으면 `data.message` 접근에서 다시 오류가 날 수 있다. 개선 후에는 "요청을 처리하지 못했습니다. (HTTP 502)"처럼 상태 코드가 담긴 안내가 표시된다.
- **확인**: 백엔드를 중지하고 화면에서 로그인 → 프록시 응답 `502 content-type=text/plain`, 화면 상태 "요청을 처리하지 못했습니다. (HTTP 502)", 처리되지 않은 JS 오류 0건. 원래 코드에서 어떤 문구가 나왔는지는 코드 분석으로만 판단했고 실행해 보지 않음 → 미확인.

### 메모: 테스트 계정 안내 위치 변경
- 화면의 테스트 계정 안내(Alice·Bob 이메일, 공통 비밀번호)를 지웠다. 교수자가 재현할 수 있도록 **제출용 README(`docs/06_제출용_README.md` 양식의 "4 테스트 계정과 DB" 항목)에 테스트 계정을 적을 예정**. 실제 JWT·비밀 키는 README에도 넣지 않는다.

### 확인한 설계 질문
- `request()`의 401 처리가 로그인 실패(INVALID_CREDENTIALS)에도 실행되어 `login()` 맨 앞의 `clearSession()`과 겹친다. `clearSession()`은 세션을 빈 값으로 덮어쓰기만 하므로 두 번 불러도 결과가 같다(멱등). `login()`의 첫 호출은 이전 토큰이 로그인 요청에 붙지 않게 하는 역할, `request()`의 호출은 모든 보호 API 401에 공통으로 적용되는 역할이라 둘 다 의도한 동작으로 유지. 화면 확인: 틀린 비밀번호 → "이메일 또는 비밀번호가 올바르지 않습니다." / "로그아웃 상태"로 정상.

### 실제로 실행한 확인과 결과
백엔드 + Vite 개발 서버, Playwright 브라우저. `alert`/`confirm`은 시험 페이지 안에서만 기록용 함수로 대체. 401(변조·헤더 없음)과 403 화면 시험은 버튼으로 만들 수 없어 **시험 브라우저 안에서만** `page.route`로 요청 헤더·URL을 바꿨다(소스 수정 아님). 토큰 원문 미출력.

| 확인 | 결과 |
|---|---|
| 첫 화면 | title "맛집 후기 게시판", 이메일·비밀번호 빈 칸, "후기를 쓰려면 먼저 로그인하세요." 표시, `등록`·`로그아웃` 비활성, "로그아웃 상태" |
| 틀린 비밀번호 (401 INVALID_CREDENTIALS) | "이메일 또는 비밀번호가 올바르지 않습니다." / 로그아웃 상태 |
| Alice 로그인 → 등록(201) | "Alice님 로그인 중", 작성 안내 숨김·등록 활성, 자기 글에 수정·삭제 버튼 보임 |
| 공백 제목 등록 (400) | "title 입력을 확인하세요.", 입력값 그대로(제목 `"   "`, 내용 유지), 로그인 유지 |
| Bob 로그인 → Alice 글 상세 | 수정·삭제 버튼 **없음**. Bob 자기 글에는 수정 버튼 보임 |
| Bob이 Alice 글 수정 (화면, 403) | "본인이 작성한 후기만 수정·삭제할 수 있습니다.", **"Bob님 로그인 중" 유지**, 입력값 유지, Alice 글 제목 그대로 |
| Bob이 Alice 글 수정·삭제 (curl, 403) | PUT·DELETE 모두 403 `FORBIDDEN`, 공개 조회로 글 원본 유지, 같은 Bob 토큰 `/me` 200 (토큰 유효) |
| 변조 토큰 /me (401 INVALID_TOKEN) | "로그인 정보가 올바르지 않습니다. 다시 로그인하세요." / 로그아웃 상태, 로그아웃·등록 버튼 비활성 |
| 헤더 없는 /me (401 TOKEN_REQUIRED) | "로그인이 필요합니다. 로그인한 뒤 다시 시도하세요." / 로그아웃 상태 |
| 상세를 연 뒤 화면 밖에서 삭제 → 다시 조회 (404) | "후기를 찾을 수 없습니다. 목록을 새로 불러왔습니다.", 상세 해제, 목록에서 사라짐, 로그인 유지 |
| 화면에서 삭제 (204) | "게시글을 삭제했습니다.", 목록에서 사라짐, 상세 해제, 삭제 중 새 콘솔 오류 0건 |
| 로그아웃 버튼 (Bob 수정 중) | 즉시 "로그아웃 상태", 수정 버튼 사라짐, 폼 비워짐, 카드 "새 글 작성", 등록 비활성 |
| `TOKEN_TTL=3` 서버: 로그인 → 5초 후 등록 (401 TOKEN_EXPIRED) | POST /api/posts 401, "로그인 시간이 만료되었습니다. 다시 로그인하세요." / 로그아웃 상태, 등록 비활성·작성 안내 표시, 입력값 유지, 글 생성 안 됨 |
| 성공 안내 오표시 | 위 모든 실패에서 성공 문구("저장했습니다" 등)가 뜨지 않음 |
| 화면 문구 | 화면 본문·title에 STARTER, 데모, TODO, `Classroom!2026`, 공통 비밀번호, 우리의 기록, `eyJ` 모두 없음 |
| 콘솔 | 오류 6건은 모두 의도한 401·400·403·404 요청 실패 표시. 처리되지 않은 JS 오류 없음 |
| 빌드 | `rm -rf dist && npm run build` 성공. `dist/`는 `.gitignore:2:dist/`로 제외 |
| 빌드 후 문구 검색 (`src`, `index.html`, `dist`) | STARTER, 데모, TODO, `Classroom!2026`, 공통 비밀번호, 우리의 기록, `alice@class.test`, `bob@class.test`, localStorage, sessionStorage, console.log — 모두 없음. "맛집 후기 게시판"은 `dist/index.html`과 번들 JS에 있음 |
| `check_api.py --mode final` (백엔드 변경 없음 재확인) | 40건 통과, exit 0 |

- 시험 진행 중 Playwright 스크립트의 입력칸 지정 방식 문제(`getByLabel`이 textarea 내용까지 이름으로 읽음)로 두 번 중간에 멈췄다. 그때 생긴 시험 글 id 13, 14를 API로 삭제하고 입력칸을 요소 선택자로 바꿔 처음부터 다시 실행해 위 결과를 얻음.
- 정리: 화면 시험 글(id 15·17 화면/API 삭제, id 16 Bob 글), curl 시험 글(id 18) 모두 삭제, 각 단계 후 `GET /api/posts` → `[]`. 백엔드·TTL=3 백엔드·Vite 모두 종료, 8000·5173·4173 포트 비어 있음.

### 미확인
- `npm run preview`(4173)로 빌드본 화면 전체 확인 — 빌드와 번들 문구 검색만 함
- 백엔드 재시작 후 글·작성자·내용 유지 — 미확인
- 원래 코드에서 JSON이 아닌 실패 응답 시 화면 문구 — 실행하지 않음(코드 분석만)

### FE-03, FE-04 커밋
- `feat(FE-03,FE-04): 응답 처리와 작성자별 버튼, 로그아웃 구현` — `fc0c5e047cac2ef403ba215f2c21af922c134d18` (`frontend-react/index.html`, `src/api.js`, `src/main.jsx`, worklog 6단계 기록. `.env`·`dist/`는 `git status --ignored`에서 `!!`로 제외 확인, 스테이징 diff에 실제 키·토큰 원문 없음 확인). 구현 단계(BE-01~03, FE-01~04) 완료.

---

## 2026-10-28 · 7단계: 빌드본 검증과 데이터 유지 확인 (코드 수정 없음)

### 수정한 파일
- 소스 코드 수정 없음. 이 기록만 추가. 출처: AI가 작성

### 실제로 실행한 확인과 결과
**빌드와 실행** (`frontend-react`)
- `npm ci` 성공(fsevents install script 경고만) → `rm -rf dist && npm run build` 성공(`dist/index.html`, `assets/index-*.css`, `assets/index-*.js`), `dist/index.html`의 title "맛집 후기 게시판".
- 백엔드 `npm start`(기본 TTL 90) + `npm run preview` → `http://127.0.0.1:4173/` 200 `text/html`.
- 화면이 개발 소스(`/src/main.jsx`)가 아니라 빌드 결과(`/assets/index-*.js`, `/assets/index-*.css`)를 받는 것을 네트워크 기록으로 확인.

**프록시** (`vite.config.js`의 `preview.proxy`)
- 브라우저의 API 요청은 모두 `http://127.0.0.1:4173/api/...`로 나가고 응답 헤더 `X-Powered-By: Express`, 상태 코드 200/201/204가 백엔드 응답과 일치 → 4173 프록시가 8000 백엔드로 전달. 개발 모드(5173)와 같은 동작.
- `curl http://127.0.0.1:4173/api/health` → 200 `{"status":"ok","stack":"express"}`.
- 백엔드를 끈 동안 `4173/api/posts` → 502 (프록시가 백엔드에 의존함을 확인).

**빌드본 화면 기능** (Playwright, `alert`/`confirm`은 시험 페이지에서만 대체, 토큰 앞부분만 기록)
| 확인 | 요청 → 응답 | 결과 |
|---|---|---|
| 첫 로드 | GET /api/posts → 200 (Authorization 없음) | "로그아웃 상태" |
| Alice 로그인 | POST /api/auth/login → 200 (헤더 없음) | "Alice님 로그인 중" |
| Alice 후기 등록 | POST /api/posts → 201 (Bearer) | 저장 안내, 자기 글 수정 버튼 보임 |
| 임시 글 등록 → 수정 → 삭제 | POST 201 → PUT /api/posts/22 200 → DELETE /api/posts/22 204 (모두 Bearer) | 수정 제목 반영, 삭제 후 목록에서 사라짐 |
| Bob 로그인 → 후기 등록 | POST /api/auth/login 200 → POST /api/posts 201 | "Bob님 로그인 중" |
| Bob이 Alice 후기 상세 | GET /api/posts/21 → 200 | 수정·삭제 버튼 없음 |
| 로그아웃 버튼 | — | 즉시 "로그아웃 상태", 등록 비활성 |
| Alice 로그인 후 새로고침 | GET /api/posts → 200 (Authorization 없음) | "로그아웃 상태"(메모리 토큰 해제, 정상) |
| 새로고침 후 비로그인 상세 | GET /api/posts/23 → 200 (Authorization 없음) | "성수동 수제 파스타", 작성자 Bob, 수정 버튼 없음 |
| 화면 문구 | — | STARTER·데모·`Classroom!2026`·`eyJ` 없음, 처리되지 않은 JS 오류 0건 |

**데이터 유지**
- `backend-express/data/board.sqlite` 존재(12288 bytes), 파일 헤더 `SQLite format 3`.
- 재시작 전 글 2개 기록 → 백엔드 프로세스 종료(8000 응답 없음 확인) → 같은 폴더(`backend-express`)에서 `npm start` 재실행.
- 재시작 전후 `GET /api/posts` 응답을 파일로 저장해 `cmp` 비교 → **완전히 동일**(id·작성자·제목·내용·createdAt·updatedAt).
- 재시작 후 4173 화면 새로고침 → 목록에 두 글 그대로 표시.

**남겨 둔 확인용 글** (사용자 요청으로 삭제하지 않음, 화면 캡처용)
- id **21**: "을지로 노포 국밥집" — 작성자 Alice
- id **23**: "성수동 수제 파스타" — 작성자 Bob
- (id 22는 CRUD 시험용 임시 글로 화면에서 삭제)

**종료하지 않은 서버** (사용자 요청): 백엔드 `127.0.0.1:8000`, 빌드본 preview `127.0.0.1:4173` 실행 중.

### 발견한 점 (수정하지 않음)
- 백엔드 시작 시 터미널 로그가 여전히 "게시판 시작 코드 http://127.0.0.1:8000 — 인증 TODO 미완성"이다(`app.js` `app.listen` 콜백, 0단계 목록의 항목). 화면에는 나오지 않지만 제출본에서는 문구 정리가 필요할 수 있음 — 수정 여부 미결정.

### 미확인
- 새 폴더에 clone한 뒤 README만으로 재현 — 아직 README 미작성, 미확인
- `check_api.py --mode final`을 이번 빌드본 단계에서 다시 실행하지 않음(백엔드 코드 변경 없음, 직전 6단계에서 40건 통과)

---

## 2026-10-28 · 8단계: 시작 코드 안내 문구 제거와 화면 문구 정리

### 수정한 파일과 함수
**1) `backend-express/src/app.js` — `app.listen` 콜백의 시작 로그**
- 원래 역할: 서버 시작 시 `게시판 시작 코드 http://127.0.0.1:8000 — 인증 TODO 미완성` 출력.
- 변경: `맛집 후기 게시판 API — http://127.0.0.1:<PORT>`. 인증 구현이 끝났는데 미완성 안내가 남아 있어 교수자가 서버를 켤 때 오해할 수 있으므로 정리. 시작 실패 처리 로직은 그대로.
- 출처: AI가 작성 (문구는 사용자 예시를 따름)

**2) `frontend-react/src/main.jsx` — `App` 화면 문구**
- 상단 소개: "다녀온 맛집의 솔직한 후기를 나눠 보세요." → "자신만의 맛집을 공유하세요!"
- 작성 카드 제목: `editing ? "게시글 수정" : "새 글 작성"` → `"새 글 작성"`만 "후기 작성"으로. "게시글 수정", "게시글 목록"은 유지.
- 서비스 이름, 안내 배너, 오류 문구는 변경 없음(사용자 지정).
- 출처: AI 초안 후 사용자 수정 (6단계 AI 초안 문구를 사용자가 확정 문구로 지정)

### 실제로 실행한 확인과 결과
- 백엔드 재시작 로그: `맛집 후기 게시판 API — http://127.0.0.1:8000`
- `rm -rf dist && npm run build` 성공 → `npm run preview`(4173) 화면: title "맛집 후기 게시판", 라벨 "WEB SERVICE DESIGN · 맛집 후기", h1 "맛집 후기 게시판", 소개 "자신만의 맛집을 공유하세요!", 배너 그대로, 카드 제목 `["로그인","후기 작성","게시글 목록 2개","게시글 상세"]`. 화면에 시작 코드·TODO·미완성·데모·STARTER·테스트 비밀번호 없음. 콘솔 오류는 favicon 404 1건.
- 빌드 결과 검색: `dist`에 "자신만의 맛집을 공유하세요!", "후기 작성" 있음, "새 글 작성"·이전 소개 문구 없음.
- `grep -rnE "시작 코드|TODO|미완성|데모|STARTER" backend-express frontend-react` (node_modules·data·package-lock 제외, dist 포함): 소스·빌드에는 없음. **남은 곳은 제공 README 2개뿐**:
  - `backend-express/README.md:1` "# Express 백엔드 시작 코드"
  - `frontend-react/README.md:1` "# React 프론트 시작 코드", `:12` "시작 코드는 공개 CRUD가 동작하지만 로그인은 미완성입니다."
  - 제공 안내 문서라 이번에 수정하지 않음 — 제출 README 작성 때 처리 여부 결정 필요(미결정).
- `python3 tools/check_api.py --mode final`: 40건 통과, exit 0.
- 남겨 둔 글 id 21(Alice "을지로 노포 국밥집"), id 23(Bob "성수동 수제 파스타") 그대로 유지.

### 커밋
- 이 기록과 7단계(빌드본 검증·데이터 유지) 기록을 코드 변경과 함께 `fix: 시작 코드 안내 문구 제거와 화면 문구 정리`로 커밋(사용자 요청). 커밋 ID는 다음 기록에 남긴다.
- 8단계 커밋: `fix: 시작 코드 안내 문구 제거와 화면 문구 정리` — `69f519bd30c08baa677105ff90fa44212cf935e1`

---

## 2026-10-28 · 9단계: curl 요청 500 원인 분석과 500 오류 로깅 추가

### 증상 (사용자 보고)
- curl로 `PUT /api/posts/27`(Alice 본인 글) → 500 `INTERNAL_ERROR`, `POST /api/posts`(Bob) → 500. 그런데 27번 글은 조회하면 "(수정)"이 붙고 updatedAt도 갱신된 상태. 같은 토큰의 `PUT /api/posts/999999`는 정상 404.

### 원인 분석 (실제 확인한 내용)
- 백엔드 로그에는 시작 줄 하나뿐이고 스택 트레이스가 없었다. `app.js` 오류 미들웨어가 예상하지 못한 오류를 500 JSON으로 바꾸기만 하고 출력하지 않기 때문.
- 프로젝트 폴더가 서버 실행 중에 `~/Downloads/JWT-Assignment`에서 `~/Desktop/JWT-Assignment`로 옮겨져 있었다(서버는 18:24에 Downloads 경로에서 시작, 프로세스 cwd는 이동을 따라감).
- `store.js` 11행은 DB 경로를 서버 시작 시 절대경로로 한 번 정한다 → 서버는 계속 사라진 Downloads 경로에 저장하려 했다.
- `store.update`/`store.create`는 메모리 DB에 먼저 반영(`db.run`)한 뒤 `flush()`로 파일에 쓰는데, `flush()`의 `writeFileSync(…/board.sqlite.tmp)`가 ENOENT로 실패 → 500. 메모리에는 이미 반영되어 조회 시 수정된 것처럼 보였다. 404 요청은 글 존재 확인에서 끝나 `flush()`까지 가지 않아 정상.
- 증거: DB 파일 수정 시각 22:05:40, 27번 updatedAt 13:15:28Z(=22:15:28 KST). 파일(읽기 전용 사본)에는 27번 "(수정)" 없음·31번 없음, 서버 메모리(GET)에는 둘 다 있음.
- 재현: 실제 `store.js`를 임시 DB로 불러 폴더를 옮긴 뒤 update/create → 둘 다 `ENOENT … board.sqlite.tmp`, 메모리만 바뀌고 파일은 그대로임을 확인.
- 같은 시점 4173 preview도 옛 경로의 `dist/`를 보고 있어 `GET /` 404였다. 사용자가 브라우저에서 200/201을 본 작업은 폴더 이동 전(22:05 이전)이었을 것으로 추정 — 미확인.
- 결론: 코드 결함이 아니라 실행 중 폴더 이동에 따른 저장 실패. 교수자가 clone해 실행하는 시나리오에는 해당 없음.

### 조치 1: 서버를 새 경로에서 재실행 (코드 수정 없음)
- 기존 백엔드·preview 종료 → `~/Desktop/JWT-Assignment/frontend-react`에서 `rm -rf dist && npm run build` → 백엔드 `npm start`, `npm run preview` 재실행. 두 프로세스 cwd가 Desktop 경로임을 `lsof`로 확인, 4173 `/` → 200.
- 재시작 후 `GET /api/posts`: 21, 23, 27, 28. **27번은 "(수정)" 없는 원래 내용, 31번 없음**(메모리에만 있던 변경은 파일에 없으므로 사라짐 — 예상대로).

### 조치 2: `backend-express/src/app.js` — 오류 처리 미들웨어(`app.use((error, req, res, next) => …)`)
- 원래 역할: ApiError는 해당 상태, JSON 파싱 오류는 400, 나머지는 500으로 `{code, message}` 응답. 401이면 `WWW-Authenticate: Bearer`. 오류를 출력하지 않음.
- 변경: `status === 500`일 때만 `console.error(\`[500] ${req.method} ${req.path}\`, error)`. 응답 본문은 그대로("서버 오류가 발생했습니다." — 경로·스택 미노출). 요청 헤더·본문은 출력하지 않으므로 토큰·비밀번호가 로그에 들어가지 않는다.
- 이유: 이번처럼 500의 원인을 서버 로그로 바로 확인할 수 있게.
- 출처: AI가 작성 (사용자가 조치 방향 2-(a) 선택)
- 바꾸지 않은 것: `store.js`의 "메모리 반영 후 파일 저장" 구조는 제공 코드이고 고치려면 범위가 커서 유지. 보고서에 **알려진 한계: 서버 실행 중 프로젝트 폴더를 옮기면 저장이 실패하고(500) 변경이 메모리에만 남는다 → 서버를 같은 폴더에서 다시 실행해야 함**으로 기록 예정.

### 실제로 실행한 확인과 결과
| 확인 | 결과 |
|---|---|
| Alice 토큰 `PUT /api/posts/27` (사용자가 보낸 것과 같은 본문) | **200**, content "…(수정)" |
| Bob 토큰 `POST /api/posts` | **201**, id 31 |
| 파일 저장 여부 | DB 파일 시각 22:34:18 → 22:34:32로 갱신, 읽기 전용 사본에서 27번 "(수정)"·31번 존재 확인 |
| Bob 시험 글 정리 | `DELETE /api/posts/31` 204 → 조회 404, 파일에서도 31번 0건 |
| 500 로깅 (별도 시험 서버, 포트 8099·임시 DB, 실행 중 DB 폴더 이동 후 POST) | 응답 500 `INTERNAL_ERROR`(경로 미노출). 로그에 `[500] POST /api/posts Error: ENOENT … board.sqlite.tmp`와 스택(`flush` store.js:19 → `create` store.js:56 → app.js:71) 출력 |
| 로그의 민감 정보 | 토큰 원문·`eyJ` 패턴·JWT_SECRET·Authorization/Bearer·테스트 비밀번호 문자열 모두 없음 |
| `python3 tools/check_api.py --mode final` | 40건 통과, exit 0. 실서버 로그의 `[500]` 기록 0건 |
| 남은 글 | 21(Alice), 23(Bob), 27(Alice, "(수정)" 반영), 28(Alice) |
| 실행 중 서버 | 백엔드 8000, preview 4173 (Desktop 경로) |

- 시험 서버(8099)는 종료, 임시 DB 삭제. 시험용 읽기 전용 DB 사본도 삭제.

### 미확인
- 사용자가 브라우저에서 200/201을 본 시점(폴더 이동 전이었는지) — 미확인
- 9단계 커밋: `fix: 500 오류 로깅 추가` — `691db35e420709ca24fa84e24f95df09f378d8f4`

---

## 2026-10-28 · 10단계: 제출용 README, 테스트 증거, GitHub 업로드, 새 폴더 재현

### T15 증거 출력 (코드 수정 없음)
- 사용자 요청으로 백엔드를 SIGINT로 종료 → 같은 `backend-express` 폴더에서 `npm start` → 재시작 전후 `GET /api/posts`를 `diff`로 비교하는 스크립트를 실행(작업 폴더 밖 임시 파일). 결과 "재시작 전후 응답이 완전히 같습니다." 사용자가 같은 스크립트를 `!`로 직접 실행해 캡처(`docs/evidence/14`, `15`).
- 사용자가 보낸 요청으로 생긴 34번 "Bob 테스트 글"은 사용자 확인 후 Bob 토큰으로 삭제(204, 이후 404).

### 수정한 파일: `README.md` (루트)
- 원래 역할: 과제 배포용 안내 문서.
- 변경: `docs/06_제출용_README.md` 양식 순서대로 새로 작성해 덮어씀(사용자 지시). 서비스 소개(202312906 박준이), 실제 폴더 구조, 실행 환경(macOS 26.5.2, Node v26.8.2, Express 5.3.0, jsonwebtoken 9.0.3, dotenv 18.0.7, React 19.3.0, Vite 8.3.4, sql.js 1.14.2), clone·백엔드·프론트 명령, `.env` 생성과 JWT_SECRET 생성 방법(실제 키 없음), TOKEN_TTL, 테스트 계정, DB 위치·초기화·재시작 유지 결과, 구현 완료 범위, 알려진 한계, 테스트 요약(실제 실행 결과만), 핵심 구현, AI 활용 요약, 제출 확인 체크리스트.
- 백엔드·프론트 실행 명령 부분은 사용자가 채팅에서 확인 후 승인.
- 보고서 `docs/report.pdf`는 아직 없음 — 사용자가 보고서 완성 후 추가 예정(링크는 유지).
- 참고 자료: 과제 제공 문서와 시작 코드만(사용자 확인).
- 출처: AI 초안 후 사용자 확인

### 추가한 파일: `docs/evidence/` 캡처 15장 (사용자 작성)
- 커밋 전 15장을 모두 열어 확인. 1차 확인에서 `08_curl_403.png`(터미널 첫 줄에 JWT payload 일부와 서명 전체가 그대로 보임)와 `03_me_Authorization헤더.png`(가린 테두리 둘레로 글자 조각이 보임)를 발견해 커밋 전 중단하고 사용자에게 알림.
- 사용자가 두 파일을 다시 가림 → 원본 해상도로 확대해 재확인. 03은 값 영역 완전 가림, 08은 2차에서 첫 줄이 남아 다시 알림 → 3차에서 첫 줄까지 가려진 것을 확인. 나머지 13장은 토큰 원문 없음(터미널 캡처는 `$A`, `$B`, `${TOKEN}XXXX` 변수만 사용).
- PNG 파일 내용에서 `eyJ…` 패턴·실제 JWT_SECRET 문자열 검색: 없음.

### 커밋 전 점검 결과
- `git status`: `M README.md`, `?? docs/evidence/`(15장) → 커밋 대상 16개. `.env`·`node_modules`·`dist`·`data/`·`*.sqlite`는 `!!`(무시)로 대상 아님.
- git 히스토리 전체(커밋 15개, 패치 약 858KB)에서 실제 JWT_SECRET 0건, JWT 형태 문자열 0건. 히스토리에 `.env`·DB·node_modules·dist·data 파일 없음.
- `backend-fastapi`, `backend-spring`, `frontend-vue` 없음.
- 첫 검색에서 `grep -c` 결과가 셸 변수로 비어 출력되어, node로 다시 세어 0건 확인.

### 커밋과 업로드
- `docs: 제출용 README와 테스트 증거 추가` — `559b24b18a3fd8adf6d9c74640c32ea3c08a44ec`
- gh 2.100.0, `junyi11111` 계정 로그인(scope `repo` 포함) 확인 → `gh repo create matjip-review-board --private --source=. --remote=origin --push`.
- 저장소: https://github.com/junyi11111/matjip-review-board (PRIVATE, 기본 브랜치 main). push 직후 원격 `main` SHA = 로컬 HEAD = `559b24b…`.

### 새 폴더 재현 테스트 (README 명령만 사용)
- 준비: 같은 포트를 쓰기 위해 기존 백엔드·preview 종료. 빈 폴더 `~/Desktop/clone-test`(항목 0개)에서 시작.
| README 절 | 실행한 명령 | 결과 |
|---|---|---|
| 1 | `git clone https://github.com/junyi11111/matjip-review-board.git`, `cd matjip-review-board` | 성공, HEAD `559b24b…`, 템플릿 폴더 없음 |
| 2 | `cd backend-express`, `npm ci` | 성공(81개 패키지, npm audit 안내만 표시) |
| 2 | `cp .env.example .env` | `.env` 생성 |
| 2 | `node -e "…randomBytes(32)…"` → `.env`의 `JWT_SECRET=` 교체 | 64자리 hex, 예시 값과 다름 확인. 키를 로그에 남기지 않으려고 출력을 화면에 표시하지 않고 바로 `.env`에 넣음(README의 수동 붙여넣기와 결과 동일) |
| 2 | `npm start` | `맛집 후기 게시판 API — http://127.0.0.1:8000`, `data/board.sqlite` 자동 생성 |
| 2 | `curl http://127.0.0.1:8000/api/health` | `{"status":"ok","stack":"express"}` HTTP 200 |
| 3 | `cd frontend-react`, `npm ci` | 성공(종료 코드 0, fsevents install script 경고만) |
| 3 | `npm run build` | vite v8.3.4, 16 modules, `built in 413ms` |
| 3 | `npm run preview` | `Local: http://127.0.0.1:4173/` |
| 확인 | `GET 4173/` / `4173/api/health` / `4173/api/posts` | 200 text/html, title "맛집 후기 게시판" / 200 health / 200 `[]`(새 DB) |
| 확인 | 브라우저(4173): Alice 로그인 → 후기 등록 → 새로고침 | 로그인 200, 등록 201, 목록 1개, 새로고침 후 비로그인으로도 목록 1개, JS 오류 0건 |
- README대로 했을 때 막힌 단계: 없음. JWT_SECRET 교체는 README가 명령이 아니라 "출력값으로 바꾼다"는 안내로 제시하는 수동 단계.
- 정리: clone 서버 종료, `~/Desktop/clone-test` 삭제(존재하지 않음 확인). 원래 폴더에서 프론트 재빌드 후 백엔드(8000)·preview(4173) 재실행, 원래 DB 글 21·23·27·28 그대로.

### 미확인
- `docs/report.pdf` — 아직 없음(사용자가 마지막에 추가 예정), GitHub에서 보고서 링크 열림 여부 미확인
- 교수자 계정의 저장소 접근 권한(private이므로 collaborator 초대 필요 여부) — 미확인
- 10단계 커밋: `docs: 제출 준비와 재현 테스트 기록` — `24ca57f5c91770fdee3bb11ba2db2f1cb4f29b64`

---

## 2026-10-28 · 11단계: 보고서 PDF 추가와 저장소 공개

### 추가한 파일: `docs/report.pdf`
- 사용자가 저장했다고 한 `docs/report.pdf`는 없었고, 23:53에 저장된 `~/Desktop/03보고서_202312906_박준이.pdf`(19쪽, 제목·학번·이름·저장소 URL 포함)가 있어 이 파일을 보고서로 판단.
- push 전 검사: `pdftotext`로 추출한 텍스트에서 JWT 형태 문자열 0건, 실제 JWT_SECRET 0건, 64자리 hex 0건. `pdfimages -list` 결과 포함 이미지 0개.
- 원본은 그대로 두고 `docs/report.pdf`로 복사(`cmp`로 동일 확인) → `docs: 보고서 PDF 추가` — `e40500a2100223921c33548380c033cadfee47c6`, push.
- GitHub 확인(당시 private): contents API에서 `docs/report.pdf` 703,087 bytes, blob sha `6311dfa`가 로컬과 동일. 렌더링된 README의 링크가 `docs/report.pdf`를 가리키고, 그 경로로 내려받은 파일이 로컬과 동일. 비로그인 접근은 private이라 404.
- 출처: 사용자 작성(보고서), 복사·커밋은 AI가 실행

### 공개 전 점검 (커밋 18개 전체)
- 히스토리에 등장한 파일 경로 47개 중 `.env`·`*.sqlite`·`node_modules/`·`dist/`·`data/` 없음(`.env.example`만 있음).
- 전체 패치에서 실제 JWT_SECRET 0건, JWT 형태 문자열 0건, `eyJ`로 시작하는 긴 문자열 0건, 08 캡처에 보였던 토큰 조각 문자열 없음, 64자리 hex 0건.
- PNG·PDF blob 17개(모든 버전)에 텍스트로 박힌 키·JWT 없음.
- `03_me_Authorization헤더.png`, `08_curl_403.png`는 커밋된 버전이 각 1개(`559b24b`)이고, 가림을 확인한 현재 파일과 같음 → 가리기 전 버전은 히스토리에 없음.
- 첫 시도에서 zsh 반복문 변수 이름 `path`가 실행 경로 변수(`PATH`)를 덮어써 바이너리 검사가 실패 → 변수 이름을 바꿔 다시 실행해 위 결과를 얻음.

### 저장소 공개
- 사용자 요청으로 이 기록을 커밋·push한 뒤 `gh repo edit --visibility public`으로 공개 전환. 공개 후 확인 결과와 최종 SHA는 채팅 보고에 정리(이 기록 자체가 마지막 커밋에 포함되므로 그 SHA는 여기에 적을 수 없음).
