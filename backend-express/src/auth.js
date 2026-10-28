import jwt from "jsonwebtoken";
import { ApiError } from "./errors.js";
import { findPublic } from "./users.js";
// 서버 시작 시 인증 설정을 검사합니다. 오류 메시지에는 키 값을 넣지 않습니다.
const EXAMPLE_SECRET = "REPLACE_WITH_RANDOM_64_HEX_CHARACTERS";
function loadConfig() {
  const secret = process.env.JWT_SECRET ?? "";
  if (!secret) throw new Error("JWT_SECRET이 비어 있습니다. .env를 설정하세요.");
  if (secret === EXAMPLE_SECRET)
    throw new Error("JWT_SECRET이 제공 예시 값입니다. 새 난수로 바꾸세요.");
  if (!/^[0-9a-fA-F]{64}$/.test(secret))
    throw new Error("JWT_SECRET은 64자리 16진수(32바이트)여야 합니다.");
  const ttl = process.env.TOKEN_TTL ?? "90";
  if (!/^[1-9]\d*$/.test(ttl))
    throw new Error("TOKEN_TTL은 양의 정수(초)여야 합니다.");
  return {
    key: Buffer.from(secret, "hex"),
    issuer: process.env.JWT_ISSUER || "webservice-class",
    audience: process.env.JWT_AUDIENCE || "board-api",
    ttl: Number(ttl),
  };
}
const config = loadConfig();
export function issueToken(user) {
  // BE-01: HS256, sub(문자열 ID)·exp·iss·aud만 담습니다. 비밀번호·해시는 넣지 않습니다.
  return jwt.sign({}, config.key, {
    algorithm: "HS256",
    subject: String(user.id),
    issuer: config.issuer,
    audience: config.audience,
    expiresIn: config.ttl,
  });
}
export function currentUserId(req) {
  // BE-02: Bearer 추출 → verify(HS256 고정, 서명·만료·iss·aud) → exp·sub 확인 → 실제 계정 확인.
  const match = /^Bearer\s+(\S+)$/i.exec(req.get("Authorization") ?? "");
  if (!match)
    throw new ApiError(401, "TOKEN_REQUIRED", "로그인이 필요합니다.");
  let payload;
  try {
    payload = jwt.verify(match[1], config.key, {
      algorithms: ["HS256"],
      issuer: config.issuer,
      audience: config.audience,
    });
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError)
      throw new ApiError(401, "TOKEN_EXPIRED", "로그인이 만료되었습니다.");
    if (error instanceof jwt.JsonWebTokenError)
      throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
    throw error;
  }
  // jsonwebtoken은 exp가 없으면 만료 검사를 건너뛰므로 직접 확인합니다.
  if (
    typeof payload !== "object" ||
    typeof payload.exp !== "number" ||
    typeof payload.sub !== "string" ||
    !/^[1-9]\d*$/.test(payload.sub)
  )
    throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
  const user = findPublic(Number(payload.sub));
  if (!user)
    throw new ApiError(401, "INVALID_TOKEN", "유효하지 않은 토큰입니다.");
  return user.id;
}
export function assertOwner(userId, authorId) {
  // TODO BE-03: 다른 작성자이면 403 FORBIDDEN. 현재는 검사하지 않습니다.
}
