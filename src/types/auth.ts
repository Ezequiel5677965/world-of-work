export interface AuthUser {
  id?: string;
  username: string;
  name: string;
  email: string;
  role: 'admin' | 'operador';
  createdAt?: string;
}

export interface StoredUser {
  id?: string;
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
