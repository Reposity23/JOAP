export type Role = 'ADMIN' | 'EMPLOYEE';
export interface User {
  _id: string;
  username: string;
  role: Role;
  isActive: boolean;
}
