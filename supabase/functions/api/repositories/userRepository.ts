export class UserRepository {
  // userID를 이용해 해당 유저의 FCM 토큰 목록을 반환하는 함수
  async getFCMTokensByUserID(userID: string): Promise<string[]> {
    // TODO: 다음 Supabase Database 강의에서 구현

    // FCM 토큰 배열 반환
    return ["token_1", "token_2", "token_3", "token_4"];
  }

  // userID와 fcmToken을 인풋으로 받아서 DB에 추가하는 함수
  async addFCMToken(userID: string, fcmToken: string): Promise<boolean> {
    // TODO: 다음 Supabase Database 강의에서 구현

    return true;
  }

  // userID와 fcmToken을 인풋으로 받아서 DB에서 삭제하는 함수
  async deleteFCMToken(userID: string, fcmToken: string): Promise<boolean> {
    // TODO: 다음 Supabase Database 강의에서 구현

    return true;
  }
}
