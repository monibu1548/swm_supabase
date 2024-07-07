import { ServiceUser } from "../entities/user.ts";
import { supabase } from "./../lib/supabase.ts";
import { Context, Next } from "https://deno.land/x/hono/mod.ts";

// 인증 미들웨어 함수 정의
export async function authMiddleware(c: Context, next: Next) {
  // 클라이언트로부터 Authorization 헤더를 받아옵니다.
  const authHeader = c.req.header("Authorization");
  // Authorization 헤더가 없거나 Bearer로 시작하지 않으면 401 Unauthorized 응답을 보냅니다.
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ code: 401, message: "Unauthorized" }, 401);
  }

  // Authorization 헤더에서 JWT 토큰을 추출합니다.
  const jwt = authHeader.split(" ")[1];
  // JWT 토큰을 검증하고 사용자 정보를 가져옵니다.
  const serviceUser = await decodeJWT(jwt);
  // JWT 토큰 검증에 실패하거나 사용자 정보가 없으면 401 Unauthorized 응답을 보냅니다.
  if (!serviceUser) {
    return c.json({ code: 401, message: "Unauthorized" }, 401);
  }

  // 검증된 사용자 정보를 컨텍스트에 저장합니다.
  c.set("user", serviceUser);

  // 다음 미들웨어 또는 핸들러를 호출합니다.
  await next();
}

// JWT 토큰을 검증하고 사용자 정보를 가져오는 함수 정의
async function decodeJWT(jwt: string): Promise<ServiceUser | null> {
  // Supabase를 사용하여 JWT 토큰을 검증하고 사용자 정보를 가져옵니다.
  const { data, error } = await supabase.auth.getUser(jwt);

  // JWT 검증에 실패하면 오류 메시지를 로그에 출력하고 null을 반환합니다.
  if (error) {
    console.error("JWT verification failed:", error.message);
    return null;
  }

  // 사용자 정보가 없으면 로그에 출력하고 null을 반환합니다.
  if (data.user == null) {
    console.error("User not exist");
    return null;
  }

  // 사용자 정보를 ServiceUser 객체로 변환하여 반환합니다.
  return ServiceUser.fromUser(data.user);
}
