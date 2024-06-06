import { UserRepository } from "./../repositories/userRepository.ts";

export class UserService {
  private userRepository: UserRepository;

  constructor() {
    this.userRepository = new UserRepository();
  }

  // userID를 이용해 해당 유저의 FCM 토큰 목록을 반환하는 함수
  async getFCMTokensByUserID(userID: string): Promise<string[]> {
    return await this.userRepository.getFCMTokensByUserID(userID);
  }

  // userID와 fcmToken을 인풋으로 받아서 DB에 추가하는 함수
  async addFCMToken(userID: string, fcmToken: string): Promise<boolean> {
    return await this.userRepository.addFCMToken(userID, fcmToken);
  }

  // userID와 fcmToken을 인풋으로 받아서 DB에서 삭제하는 함수
  async deleteFCMToken(userID: string, fcmToken: string): Promise<boolean> {
    return await this.userRepository.deleteFCMToken(userID, fcmToken);
  }
}
