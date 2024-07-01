import {
  firebaseClientEmail,
  firebasePrivateKey,
  firebaseProjectID,
} from "../environments.ts";
import { JWT } from "npm:google-auth-library@9";
import { supabase } from "../api/lib/supabase.ts";

// fcm_notifications 테이블의 레코드를 나타내는 인터페이스
interface UserNotificationRecord {
  id: string;
  user_id: string;
  title: string | null;
  body: string | null;
}

// Webhook 페이로드를 나타내는 인터페이스
interface UserNotificationWebhookPayload {
  type: "INSERT";
  table: string;
  record: UserNotificationRecord;
  schema: "public";
}

// 캐시된 액세스 토큰 및 만료 시간
let cachedAccessToken: string | null = null;
let tokenExpirationTime: number | null = null;

// 웹훅 엔드포인트
Deno.serve(async (req) => {
  const payload: UserNotificationWebhookPayload = await req.json();

  // FCM 토큰 조회
  const { data, error } = await supabase
    .from("fcm_tokens")
    .select("fcm_token")
    .eq("user_id", payload.record.user_id);

  const completedAt = new Date().toISOString();

  // FCM 토큰이 없거나 오류가 발생한 경우 처리
  if (error || !data || data.length === 0) {
    console.error("Error fetching FCM tokens:", error || "No FCM tokens found");
    await updateNotificationResult(
      payload.record.id,
      completedAt,
      { "NOT_EXIST_USER": [] },
    ).catch((err) =>
      console.error("Error updating result for non-existent user:", err)
    );
    return new Response(
      JSON.stringify({ error: "No FCM tokens found for the user" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 404,
      },
    );
  }

  const fcmTokens = data.map((row: { fcm_token: string }) => row.fcm_token);

  try {
    // FCM 알림을 보내기 위한 액세스 토큰 가져오기
    const accessToken = await getAccessToken({
      clientEmail: firebaseClientEmail,
      privateKey: firebasePrivateKey,
    });

    // 각 FCM 토큰에 대해 알림 전송
    const notificationPromises = fcmTokens.map((token) =>
      sendNotification(token, payload.record, accessToken)
    );

    // 모든 알림 전송 작업 완료 대기
    const results = await Promise.all(notificationPromises);

    // 결과 요약
    const resultSummary: { [key: string]: string[] } = { "SUCCESS": [] };
    results.forEach(({ fcmToken, status }) => {
      if (status === "SUCCESS") {
        resultSummary["SUCCESS"].push(fcmToken);
      } else {
        if (!resultSummary[status]) {
          resultSummary[status] = [];
        }
        resultSummary[status].push(fcmToken);
      }
    });

    // 데이터베이스에 결과 업데이트
    await updateNotificationResult(
      payload.record.id,
      completedAt,
      resultSummary,
    ).catch((err) => console.error("Error updating notification result:", err));

    return new Response(JSON.stringify({ results }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error sending FCM messages:", err);
    await updateNotificationResult(
      payload.record.id,
      completedAt,
      { "SEND_ERROR": [] },
    ).catch((err) =>
      console.error("Error updating result for send error:", err)
    );
    return new Response(
      JSON.stringify({ error: "Failed to send FCM messages" }),
      {
        headers: { "Content-Type": "application/json" },
        status: 500,
      },
    );
  }
});

// FCM 알림을 보내기 위한 액세스 토큰 가져오기
const getAccessToken = async ({
  clientEmail,
  privateKey,
}: {
  clientEmail: string;
  privateKey: string;
}): Promise<string> => {
  const now = Date.now();
  if (cachedAccessToken && tokenExpirationTime && now < tokenExpirationTime) {
    return cachedAccessToken;
  }

  const jwtClient = new JWT({
    email: clientEmail,
    key: privateKey,
    scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
  });

  const tokens = await jwtClient.authorize();

  cachedAccessToken = tokens.access_token!;
  // 토큰 만료 시간 설정
  tokenExpirationTime = tokens.expiry_date!;

  return cachedAccessToken;
};

// 단일 FCM 토큰에 알림 전송
const sendNotification = async (
  fcmToken: string,
  record: UserNotificationRecord,
  accessToken: string,
): Promise<{ fcmToken: string; status: string }> => {
  try {
    const res = await fetch(
      `https://fcm.googleapis.com/v1/projects/${firebaseProjectID}/messages:send`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          message: {
            token: fcmToken,
            notification: {
              title: record.title,
              body: record.body,
            },
          },
        }),
      },
    );

    const resData = await res.json();

    if (res.status < 200 || 299 < res.status) {
      const errorCode = resData.error?.details?.[0]?.errorCode ||
        resData.error?.status || "UNKNOWN_ERROR";
      console.error("Error sending FCM message:", errorCode);
      return { fcmToken, status: errorCode };
    } else {
      return { fcmToken, status: "SUCCESS" };
    }
  } catch (err) {
    console.error("Error sending FCM message:", err);
    return { fcmToken, status: "SEND_ERROR" };
  }
};

// 데이터베이스에 결과 업데이트
const updateNotificationResult = async (
  id: string,
  completedAt: string,
  result: { [key: string]: string[] },
) => {
  try {
    const { error } = await supabase
      .from("fcm_notifications")
      .update({ completed_at: completedAt, result: JSON.stringify(result) })
      .eq("id", id);

    if (error) {
      console.error("Error updating notification result:", error);
      throw error;
    }
  } catch (err) {
    console.error("Exception updating notification result:", err);
    throw err;
  }
};
