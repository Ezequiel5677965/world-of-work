import { AuthUser, StoredAuthData, StoredUser } from '../types/auth';
import { hashPassword, getRateLimitStatus, recordFailedLoginAttempt, clearRateLimit } from './security';
import { supabase } from './supabaseClient';

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
    const local = localStorage.getItem(STORAGE_KEY_SESSION);
    if (local) return JSON.parse(local);

    const session = sessionStorage.getItem(STORAGE_KEY_SESSION);
    if (session) return JSON.parse(session);

    return null;
  } catch {
    return null;
  }
}

export async function loginUser(
  identifier: string, 
  password: string, 
  remember: boolean = true
): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  // 1. Verificar protección anti-fuerza bruta
  const rateLimit = getRateLimitStatus();
  if (rateLimit.isLocked) {
    return { 
      success: false, 
      error: `Demasiados intentos fallidos. Por seguridad, esperá ${rateLimit.remainingSeconds} segundos.` 
    };
  }

  const cleanId = identifier.trim().toLowerCase();
  const cleanPass = password.trim();

  if (!cleanId || !cleanPass) {
    return { success: false, error: 'Por favor completá todos los campos.' };
  }

  const authData = getAuthData();
  const inputHash = await hashPassword(cleanPass);

  // Buscar coincidencia por hash seguro o contraseña plana original
  const userIndex = authData.users.findIndex(
    u => (u.username.toLowerCase() === cleanId || u.email.toLowerCase() === cleanId) &&
         (u.passwordHash === inputHash || u.password === cleanPass)
  );

  if (userIndex === -1) {
    const lockInfo = recordFailedLoginAttempt();
    if (lockInfo.isNowLocked) {
      return { 
        success: false, 
        error: `Acceso bloqueado por 60 segundos debido a 5 intentos fallidos.` 
      };
    }
    return { success: false, error: 'Usuario o contraseña incorrectos.' };
  }

  // Éxito: limpiar intentos fallidos
  clearRateLimit();

  const found = authData.users[userIndex];

  // Si tenía contraseña plana, migrar automáticamente a hash seguro
  if (!found.passwordHash) {
    found.passwordHash = inputHash;
    delete found.password;
    saveAuthData(authData);
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

// 2. Registro de Nuevos Usuarios
export async function registerUser(params: {
  name: string;
  email: string;
  password: string;
  remember?: boolean;
}): Promise<{ success: boolean; user?: AuthUser; error?: string }> {
  const cleanName = params.name.trim();
  const cleanEmail = params.email.trim().toLowerCase();
  const cleanPass = params.password.trim();

  if (!cleanName || !cleanEmail || !cleanPass) {
    return { success: false, error: 'Todos los campos son obligatorios.' };
  }

  // Validación de formato de correo
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(cleanEmail)) {
    return { success: false, error: 'Por favor ingresá un correo electrónico válido.' };
  }

  if (cleanPass.length < 6) {
    return { success: false, error: 'La contraseña debe tener al menos 6 caracteres.' };
  }

  const authData = getAuthData();
  const generatedUsername = cleanEmail.split('@')[0];

  // Verificar si ya existe
  const exists = authData.users.some(
    u => u.email.toLowerCase() === cleanEmail || u.username.toLowerCase() === generatedUsername
  );

  if (exists) {
    return { success: false, error: 'Ya existe una cuenta con este correo electrónico.' };
  }

  // 1. Guardar en Supabase Auth en la nube si hay conexión
  try {
    await supabase.auth.signUp({
      email: cleanEmail,
      password: cleanPass,
      options: {
        data: { full_name: cleanName }
      }
    });
  } catch (err) {
    console.warn('Registro en Supabase pospuesto (modo offline):', err);
  }

  // 2. Guardar usuario con hash seguro
  const passwordHash = await hashPassword(cleanPass);
  const newUser: StoredUser = {
    username: generatedUsername,
    passwordHash,
    name: cleanName,
    email: cleanEmail,
    role: 'admin',
    createdAt: new Date().toISOString()
  };

  authData.users.push(newUser);
  saveAuthData(authData);

  const authUser: AuthUser = {
    username: newUser.username,
    name: newUser.name,
    email: newUser.email,
    role: newUser.role,
    createdAt: newUser.createdAt
  };

  // Crear sesión
  const serialized = JSON.stringify(authUser);
  if (params.remember !== false) {
    localStorage.setItem(STORAGE_KEY_SESSION, serialized);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
  } else {
    sessionStorage.setItem(STORAGE_KEY_SESSION, serialized);
    localStorage.removeItem(STORAGE_KEY_SESSION);
  }

  return { success: true, user: authUser };
}

export function logoutUser(): void {
  try {
    localStorage.removeItem(STORAGE_KEY_SESSION);
    sessionStorage.removeItem(STORAGE_KEY_SESSION);
  } catch (e) {
    console.error('Error al cerrar sesión', e);
  }
}

export async function changeUserPassword(
  username: string, 
  currentPass: string, 
  newPass: string
): Promise<{ success: boolean; error?: string }> {
  if (!newPass || newPass.length < 6) {
    return { success: false, error: 'La nueva contraseña debe tener al menos 6 caracteres.' };
  }

  const authData = getAuthData();
  const userIndex = authData.users.findIndex(
    u => u.username.toLowerCase() === username.toLowerCase()
  );

  if (userIndex === -1) {
    return { success: false, error: 'Usuario no encontrado.' };
  }

  const currentHash = await hashPassword(currentPass);
  const user = authData.users[userIndex];

  // Comprobar contraseña actual
  const isMatch = (user.passwordHash && user.passwordHash === currentHash) ||
                  (user.password && user.password === currentPass);

  if (!isMatch) {
    return { success: false, error: 'La contraseña actual ingresada es incorrecta.' };
  }

  // Actualizar con hash seguro
  user.passwordHash = await hashPassword(newPass);
  delete user.password;
  saveAuthData(authData);

  return { success: true };
}
