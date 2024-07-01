import { supabase } from "../api/lib/supabase.ts";

interface PushNotificationParams {
  userId: string;
  body?: string;
  title?: string;
}

// fcm_notifications 테이블에 데이터를 추가하여 특정 유저에게 푸시 알림을 발송하도록 적재
export const enqueuePushNotification = async (
  { userId, body, title }: PushNotificationParams,
) => {
  const { data, error } = await supabase
    .from("fcm_notifications")
    .insert([
      { user_id: userId, body: body || null, title: title || null },
    ]);

  if (error) {
    console.error("Error enqueuing push notification:", error);
    throw error;
  }

  return data;
};
