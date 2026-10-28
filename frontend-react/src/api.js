let session = { accessToken: "", user: null };
// FE-03: 응답 code별 화면 안내. BAD_INPUT은 어느 칸이 문제인지 알려 주는 서버 문구를 씁니다.
const MESSAGES = {
  INVALID_CREDENTIALS: "이메일 또는 비밀번호가 올바르지 않습니다.",
  TOKEN_REQUIRED: "로그인이 필요합니다. 로그인한 뒤 다시 시도하세요.",
  INVALID_TOKEN: "로그인 정보가 올바르지 않습니다. 다시 로그인하세요.",
  TOKEN_EXPIRED: "로그인 시간이 만료되었습니다. 다시 로그인하세요.",
  FORBIDDEN: "본인이 작성한 후기만 수정·삭제할 수 있습니다.",
  NOT_FOUND: "후기를 찾을 수 없습니다. 목록을 새로 불러왔습니다.",
};
export const getSession = () => session;
export function clearSession() {
  session = { accessToken: "", user: null };
}
function authorizationHeaders() {
  // FE-02: 메모리의 토큰이 있을 때만 Bearer 헤더를 만듭니다.
  return session.accessToken
    ? { Authorization: `Bearer ${session.accessToken}` }
    : {};
}
export async function request(path, options = {}) {
  const response = await fetch(`/api${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...authorizationHeaders(),
      ...options.headers,
    },
  });
  // 204는 본문이 없으므로 파싱하지 않습니다. 본문이 JSON이 아닌 실패 응답도 null로 처리합니다.
  const data =
    response.status === 204 ? null : await response.json().catch(() => null);
  if (!response.ok) {
    // FE-03: 401이면 메모리의 토큰·사용자를 지웁니다. 403은 로그인 상태를 유지합니다.
    if (response.status === 401) clearSession();
    const error = new Error(
      MESSAGES[data?.code] ||
        data?.message ||
        `요청을 처리하지 못했습니다. (HTTP ${response.status})`,
    );
    error.status = response.status;
    error.code = data?.code;
    throw error;
  }
  return data;
}
export async function login(email, password) {
  // FE-01: 이전 세션을 먼저 지워 기존 토큰이 로그인 요청에 붙지 않게 하고,
  // 실패하면 로그아웃 상태로 남깁니다. 토큰은 메모리(session)에만 둡니다.
  clearSession();
  const data = await request("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
  session = { accessToken: data.accessToken, user: data.user };
  return data.user;
}
export function canEdit(post) {
  // FE-04: 로그인 사용자가 작성자일 때만 버튼을 보입니다. 최종 판단은 서버(403)가 합니다.
  return session.user !== null && post.authorId === session.user.id;
}
export const api = {
  list: () => request("/posts"),
  detail: (id) => request(`/posts/${id}`),
  create: (input) =>
    request("/posts", { method: "POST", body: JSON.stringify(input) }),
  update: (id, input) =>
    request(`/posts/${id}`, { method: "PUT", body: JSON.stringify(input) }),
  remove: (id) => request(`/posts/${id}`, { method: "DELETE" }),
  me: () => request("/me"),
};
