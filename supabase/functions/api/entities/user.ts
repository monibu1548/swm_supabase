import { User as SupabaseUser } from "https://esm.sh/@supabase/supabase-js@2";

export class ServiceUser {
  // ServiceUser 클래스는 사용자 정보를 담는 클래스입니다.
  // SupabaseUser 클래스를 이용해 생성합니다.
  // 필요한 정보가 있다면 추가할 수 있습니다.
  id: string;
  email: string | null;
  createdAt: string;

  constructor(id: string, email: string | null, createdAt: string) {
    this.id = id;
    this.email = email;
    this.createdAt = createdAt;
  }

  static fromUser(user: SupabaseUser): ServiceUser {
    return new ServiceUser(
      user.id,
      user.email ?? null,
      user.created_at,
    );
  }
}
