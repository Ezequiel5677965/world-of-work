export interface AuthUser {
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operador';
}

export interface StoredAuthData {
  users: Array<{
    username: string;
    password: string;
    name: string;
    email: string;
    role: 'admin' | 'operador';
  }>;
}
