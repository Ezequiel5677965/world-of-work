import { AuthUser, StoredAuthData } from '../types/auth';

const STORAGE_KEY_AUTH = 'wow_auth_data_v1';
const STORAGE_KEY_SESSION = 'wow_auth_session_v1';

const DEFAULT_AUTH_DATA: StoredAuthData = {
  users: [
    {
      username: 'admin',
      password: 'admin',
      name: 'Ezequiel (Administrador)',
      email: 'contacto@worldofwork.com',
      role: 'admin'
    },
    {
      username: 'ezequiel',
      password: '1234',
      name: 'Ezequiel',
      email: 'eze.epet20@gmail.com',
      role: 'admin'
    }
  ]
};

function getAuthData(): StoredAuthData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_AUTH);
    if (!raw) {
      localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(DEFAULT_AUTH_DATA));
      return DEFAULT_AUTH_DATA;
    }
    return JSON.parse(raw);
  } catch {
    return DEFAULT_AUTH_DATA;
  }
}

export function saveAuthData(data: StoredAuthData): void {
  try {
    localStorage.setItem(STORAGE_KEY_AUTH, JSON.stringify(data));
  } catch (e) {
    console.error('Error guardando datos de autenticación', e);
  }
}

export function getCurrentSession(): AuthUser | null {
  try {
    // 1. Revisar persistencia de localStorage (recordar sesión)
    const local = localStorage.getItem(STORAGE_KEY_SESSION);
    if (local) return JSON.parse(local);

    // 2. Revisar sessionStorage (sesión temporal)
    const session = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (session) return JSON.parse(session);

    return null;
  } catch {
    return null;
  }
}

export function loginUser(
  identifier: string, 
  password: string, 
  remember: boolean = true
): { success: boolean; user?: AuthUser; error?: string } {
  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Por favor completá todos los campos.' };
  }

  const authData = getAuthData();
  const found = authData.users.find(
    u => (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) && u.password === cleanPass
  );

  if (!found) {
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  const user: AuthUser = {
    username: found.username,
    name: found.name,
    email: found.email,
    role: found.role
  };

  const serialized = JSON.stringify(user);
  if (remember) {
    localStorage.setItem(STORAGE_KEY_SESSION, serialized);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
  } else {
    sessionStorage.setItem(STORAGE_KEY_SESSION, serialized);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }

  return { success: true, user };
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error('Error al cerrar sesión', e);
  }
}

export function changeUserPassword(
  username: string, 
  currentPass: string, 
  newPass: string
): { success: boolean; error?: string } {
  if (!newPass || newPass.length < 4) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 4 caracteres.' };
  }

  const authData = getAuthData();
  const userIndex = authData.users.findIndex(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (userIndex === -1) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  if (authData.users[userIndex].password !== currentPass) {
    return { success: false, error: 'La contraseña actual ingresada es incorrecta.' };
  }

  authData.users[userIndex].password = newPass;
  saveAuthData(authData);

  return { success: true };
}
