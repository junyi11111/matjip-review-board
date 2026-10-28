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
