export interface AuthUser {
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operador';
  createdAt?: string;
}

export interface StoredUser {
  username: string;
  password?: string;
  passwordHash?: string;
  name: string;
  email: string;
  role: 'admin' | 'operador';
  createdAt?: string;
}

export interface StoredAuthData {
  users: StoredUser[];
}
