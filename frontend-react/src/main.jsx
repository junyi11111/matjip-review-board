import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import { api, login, getSession, clearSession, canEdit } from "./api";
import "./style.css";
function App() {
  const [posts, setPosts] = useState([]),
    [selected, setSelected] = useState(null);
  const [title, setTitle] = useState(""),
    [content, setContent] = useState(""),
    [editing, setEditing] = useState(null);
  const [email, setEmail] = useState(""),
    [password, setPassword] = useState("");
  const [user, setUser] = useState(null),
    [message, setMessage] = useState("게시판을 불러오는 중입니다."),
    [busy, setBusy] = useState(false);
  const refresh = async () => setPosts(await api.list());
  async function run(action, success) {
    setBusy(true);
    try {
      await action();
      setMessage(success);
    } catch (e) {
      setMessage(e.message);
      // FE-03: 404면 선택·수정 상태를 풀고 목록을 갱신합니다. 입력값은 지우지 않습니다.
      if (e.status === 404) {
        setSelected(null);
        setEditing(null);
        await refresh().catch(() => {});
      }
    } finally {
      setUser(getSession().user);
      setBusy(false);
    }
  }
  useEffect(() => {
    run(refresh, "게시판이 준비되었습니다.");
  }, []);
  function reset() {
    setTitle("");
    setContent("");
    setEditing(null);
  }
  async function save(e) {
    e.preventDefault();
    if (!getSession().user) {
      setMessage("후기를 쓰려면 먼저 로그인하세요.");
      return;
    }
    await run(async () => {
      const p = editing
        ? await api.update(editing, { title, content })
        : await api.create({ title, content });
      setSelected(p);
      reset();
      await refresh();
    }, "게시글을 저장했습니다.");
  }
  return (
    <main>
      <header>
        <span className="eyebrow">WEB SERVICE DESIGN · 맛집 후기</span>
        <h1>맛집 후기 게시판</h1>
        <p className="muted">다녀온 맛집의 솔직한 후기를 나눠 보세요.</p>
      </header>
      <p className="banner">
        후기는 누구나 읽을 수 있고, 작성은 로그인한 사용자만 할 수 있습니다.
        수정·삭제는 작성자 본인만 가능합니다.
      </p>
      <div role="status" className="message">
        {message}
      </div>
      <div className="grid">
        <aside>
          <section className="card">
            <h2>로그인</h2>
            <p>{user ? `${user.name}님 로그인 중` : "로그아웃 상태"}</p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                run(() => login(email, password), "로그인했습니다.");
              }}
            >
              <label>
                이메일
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                비밀번호
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <div className="actions">
                <button disabled={busy}>로그인</button>
                <button
                  type="button"
                  className="secondary"
                  disabled={!user}
                  onClick={() => {
                    clearSession();
                    setUser(null);
                    reset();
                    setMessage("이 탭의 로그인 상태를 해제했습니다.");
                  }}
                >
                  로그아웃
                </button>
              </div>
            </form>
            <button
              className="secondary"
              disabled={busy}
              onClick={() =>
                run(async () => {
                  const me = await api.me();
                  setSelected(null);
                  alert(`${me.name} (${me.email})`);
                }, "내 정보 조회를 완료했습니다.")
              }
            >
              내 정보 조회
            </button>
          </section>
          <section className="card">
            <h2>{editing ? "게시글 수정" : "새 글 작성"}</h2>
            {!user && (
              <p className="muted">후기를 쓰려면 먼저 로그인하세요.</p>
            )}
            <form onSubmit={save}>
              <label>
                제목
                <input
                  maxLength={100}
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                />
              </label>
              <label>
                내용
                <textarea
                  maxLength={5000}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  required
                />
              </label>
              <div className="actions">
                <button disabled={busy || !user}>
                  {editing ? "수정 저장" : "등록"}
                </button>
                <button type="button" className="secondary" onClick={reset}>
                  입력 초기화
                </button>
              </div>
            </form>
          </section>
        </aside>
        <div>
          <section className="card">
            <h2>
              게시글 목록 <small>{posts.length}개</small>
            </h2>
            {posts.length === 0 ? (
              <p>첫 번째 맛집 후기를 남겨 보세요.</p>
            ) : (
              posts.map((p) => (
                <article className="post" key={p.id}>
                  <button
                    className="post-title"
                    disabled={busy}
                    onClick={() =>
                      run(
                        async () => setSelected(await api.detail(p.id)),
                        "게시글을 불러왔습니다.",
                      )
                    }
                  >
                    {p.title}
                  </button>
                  <p>
                    <small>
                      {p.authorName} · {new Date(p.createdAt).toLocaleString()}
                    </small>
                  </p>
                </article>
              ))
            )}
          </section>
          <section className="card">
            <h2>게시글 상세</h2>
            {selected ? (
              <>
                <h3>{selected.title}</h3>
                <p className="content">{selected.content}</p>
                <p>
                  <small>작성자 {selected.authorName}</small>
                </p>
                {canEdit(selected) && (
                  <div className="actions">
                    <button
                      className="secondary"
                      onClick={() => {
                        setEditing(selected.id);
                        setTitle(selected.title);
                        setContent(selected.content);
                      }}
                    >
                      수정
                    </button>
                    <button
                      className="danger"
                      disabled={busy}
                      onClick={() => {
                        if (confirm("게시글을 삭제할까요?"))
                          run(async () => {
                            await api.remove(selected.id);
                            setSelected(null);
                            reset();
                            await refresh();
                          }, "게시글을 삭제했습니다.");
                      }}
                    >
                      삭제
                    </button>
                  </div>
                )}
              </>
            ) : (
              <p className="muted">목록에서 제목을 선택하세요.</p>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
createRoot(document.getElementById("root")).render(<App />);
