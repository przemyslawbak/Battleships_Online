import { UserRole } from "./user-role.model";

export interface LoginResponse {
  token: string,
  email: string,
  user: string,
  refreshToken: string,
  displayName: string,
  role: UserRole
}
