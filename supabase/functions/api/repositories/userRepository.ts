import { supabase } from "../lib/supabase.ts";

export class UserRepository {
  // userID를 이용해 해당 유저의 FCM 토큰 목록을 반환하는 함수
  async getFCMTokensByUserID(userID: string): Promise<string[]> {
    // fcm_tokens 테이블에서 해당 유저의 FCM 토큰을 조회
    const { data: tokensData, error: tokensError } = await supabase
      .from("fcm_tokens")
      .select("fcm_token")
      .eq("user_id", userID);

    // 조회 시 에러가 발생하면 빈 배열 반환
    if (tokensError) {
      console.error("Error fetching FCM tokens:", tokensError.message);
      return [];
    }

    // FCM 토큰 배열 반환
    return tokensData.map((token: { fcm_token: string }) => token.fcm_token);
  }

  // userID와 fcmToken을 인풋으로 받아서 DB에 추가 또는 업데이트하는 함수
  async addFCMToken(userID: string, fcmToken: string): Promise<boolean> {
    // fcm_tokens 테이블에서 동일한 fcmToken이 존재하는지 확인
    const { data: existingToken, error: selectError } = await supabase
      .from("fcm_tokens")
      .select("*")
      .eq("fcm_token", fcmToken)
      .single();

    // 선택 시 에러가 발생하면 false 반환
    if (selectError && selectError.code !== "PGRST116") { // 'PGRST116'은 no rows 에러 코드
      console.error("Error selecting FCM token:", selectError.message);
      return false;
    }

    // 동일한 fcmToken이 존재하면 user_id를 업데이트
    if (existingToken) {
      const { error: updateError } = await supabase
        .from("fcm_tokens")
        .update({ user_id: userID })
        .eq("fcm_token", fcmToken);

      // 업데이트 시 에러가 발생하면 false 반환
      if (updateError) {
        console.error("Error updating FCM token:", updateError.message);
        return false;
      }

      // 성공적으로 업데이트되면 true 반환
      return true;
    } else {
      // 동일한 fcmToken이 없으면 새로운 행 추가
      const { error: insertError } = await supabase
        .from("fcm_tokens")
        .insert([{ user_id: userID, fcm_token: fcmToken }]);

      // 삽입 시 에러가 발생하면 false 반환
      if (insertError) {
        console.error("Error inserting FCM token:", insertError.message);
        return false;
      }

      // 성공적으로 삽입되면 true 반환
      return true;
    }
  }

  // userID와 fcmToken을 인풋으로 받아서 DB에서 삭제하는 함수
  async deleteFCMToken(userID: string, fcmToken: string): Promise<boolean> {
    // fcm_tokens 테이블에서 FCM 토큰 삭제
    const { error: deleteError } = await supabase
      .from("fcm_tokens")
      .delete()
      .eq("user_id", userID)
      .eq("fcm_token", fcmToken);

    // 삭제 시 에러가 발생하면 false 반환
    if (deleteError) {
      console.error("Error deleting FCM token:", deleteError.message);
      return false;
    }

    // 성공적으로 삭제되면 true 반환
    return true;
  }
}
