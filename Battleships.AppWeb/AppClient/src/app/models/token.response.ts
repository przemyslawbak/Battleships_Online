import { Role } from "./role";

export interface TokenResponse {
  token: string,
  email: string,
  user: string,
  refreshToken: string,
  displayName: string,
  role: Role
}
