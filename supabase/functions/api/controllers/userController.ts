import { Context } from "https://deno.land/x/hono/mod.ts";
import { UserService } from "../services/userService.ts";

// UserController 클래스는 FCM 토큰을 관리하기 위한 컨트롤러입니다.
export class UserController {
  private userService: UserService;

  // 생성자에서는 UserService 인스턴스를 초기화합니다.
  constructor() {
    this.userService = new UserService();
  }

  // postFCMTokenV1 메서드는 FCM 토큰을 추가하는 API 엔드포인트입니다.
  async postFCMTokenV1(c: Context) {
    // 요청에서 fcmToken을 추출합니다.
    const { fcmToken } = await c.req.json();

    // fcmToken이 없는 경우 에러 메시지를 반환합니다.
    if (!fcmToken) {
      return c.json("Missing userID or fcmToken");
    }

    // UserService를 통해 FCM 토큰을 추가합니다.
    const result = await this.userService.addFCMToken("mock_user_id", fcmToken);

    // 결과에 따라 적절한 메시지를 반환합니다.
    return c.json(
      result ? "FCM token added successfully" : "Failed to add FCM token",
    );
  }

  // getFCMTokensV1 메서드는 특정 사용자의 FCM 토큰들을 가져오는 API 엔드포인트입니다.
  async getFCMTokensV1(c: Context) {
    // UserService를 통해 사용자 ID에 해당하는 FCM 토큰들을 가져옵니다.
    const tokens = await this.userService.getFCMTokensByUserID("mock_user_id");

    // 토큰 목록을 JSON 형식으로 반환합니다.
    return c.json(tokens);
  }

  // deleteFCMTokenV1 메서드는 FCM 토큰을 삭제하는 API 엔드포인트입니다.
  async deleteFCMTokenV1(c: Context) {
    // 요청에서 fcmToken을 추출합니다.
    const { fcmToken } = await c.req.json();

    // fcmToken이 없는 경우 에러 메시지를 반환합니다.
    if (!fcmToken) {
      return c.json("Missing userID or fcmToken");
    }

    // UserService를 통해 FCM 토큰을 삭제합니다.
    const result = await this.userService.deleteFCMToken(
      "mock_user_id",
      fcmToken,
    );

    // 결과에 따라 적절한 메시지를 반환합니다.
    return c.json(
      result ? "FCM token deleted successfully" : "Failed to delete FCM token",
    );
  }
}
