import { authMiddleware } from "../middleware/authMiddleware.ts";
import { UserController } from "./../controllers/userController.ts";
import { Hono } from "https://deno.land/x/hono/mod.ts";

const userRouter = new Hono();
const userController = new UserController();

userRouter.use(authMiddleware);

userRouter.post(
  "/v1/fcmToken",
  (c) => userController.postFCMTokenV1(c),
);

userRouter.get(
  "/v1/fcmToken",
  (c) => userController.getFCMTokensV1(c),
);

userRouter.delete(
  "/v1/fcmToken",
  (c) => userController.deleteFCMTokenV1(c),
);

export default userRouter;
