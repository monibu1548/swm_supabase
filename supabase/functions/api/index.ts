import { Hono } from "https://deno.land/x/hono/mod.ts";
import userRouter from "./routers/userRouter.ts";

// Hono 인스턴스를 생성하여 애플리케이션을 설정합니다.
const app = new Hono();

// 기본 경로를 "/api"로 설정하고, "/users" 경로에 대해 userRouter를 설정합니다.
app.basePath("/api")
  .route("/users", userRouter);

// 애플리케이션을 시작하여 요청을 수신합니다.
Deno.serve(app.fetch);
