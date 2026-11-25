/**
 * Módulo de Seguridad y Sanitización para World of Work
 */

// 1. Sanitización de textos para prevenir ataques XSS (Cross-Site Scripting)
export function sanitizeText(input: string): string {
  if (!input) return '';
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

// 2. Hash criptográfico seguro con Web Crypto API (SHA-256)
export async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const salt = 'world_of_work_secure_salt_2026_';
  const data = encoder.encode(salt + password);
  
  if (window.crypto && window.crypto.subtle) {
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  // Fallback simple si SubtleCrypto no estuviera disponible
  let hash = 0;
  const str = salt + password;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0;
  }
  return 'fb_' + Math.abs(hash).toString(16);
}

// 3. Sistema Anti-Fuerza Bruta (Rate Limiting)
const RATE_LIMIT_KEY = 'wow_sec_rate_limit_v1';
const MAX_ATTEMPTS = 5;
const LOCKOUT_DURATION_MS = 60 * 1000; // 60 segundos de bloqueo

interface RateLimitData {
  attempts: number;
  lockedUntil: number | null;
}

export function getRateLimitStatus(): { isLocked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    if (!raw) return { isLocked: false, remainingSeconds: 0 };
    
    const data: RateLimitData = JSON.parse(raw);
    if (data.lockedUntil && Date.now() < data.lockedUntil) {
      const remainingSeconds = Math.ceil((data.lockedUntil - Date.now()) / 1000);
      return { isLocked: true, remainingSeconds };
    }
    
    // Si el tiempo ya pasó, reiniciar
    if (data.lockedUntil && Date.now() >= data.lockedUntil) {
      clearRateLimit();
    }
    return { isLocked: false, remainingSeconds: 0 };
  } catch {
    return { isLocked: false, remainingSeconds: 0 };
  }
}

export function recordFailedLoginAttempt(): { isNowLocked: boolean; remainingSeconds: number } {
  try {
    const raw = localStorage.getItem(RATE_LIMIT_KEY);
    let data: RateLimitData = raw ? JSON.parse(raw) : { attempts: 0, lockedUntil: null };
    
    data.attempts += 1;
    if (data.attempts >= MAX_ATTEMPTS) {
      data.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
      localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
      return { isNowLocked: true, remainingSeconds: 60 };
    }
    
    localStorage.setItem(RATE_LIMIT_KEY, JSON.stringify(data));
    return { isNowLocked: false, remainingSeconds: 0 };
  } catch {
    return { isNowLocked: false, remainingSeconds: 0 };
  }
}

export function clearRateLimit(): void {
  try {
    localStorage.removeItem(RATE_LIMIT_KEY);
  } catch {}
}

// 4. Validación de fortaleza de contraseñas
export function evaluatePasswordStrength(password: string): {
  isValid: boolean;
  score: 'debil' | 'media' | 'fuerte';
  message?: string;
} {
  if (password.length < 6) {
    return { isValid: false, score: 'debil', message: 'Debe tener al menos 6 caracteres.' };
  }
  
  const hasNumbers = /\d/.test(password);
  const hasLetters = /[a-zA-Z]/.test(password);
  const hasSpecial = /[^a-zA-Z0-9]/.test(password);
  
  if (hasNumbers && hasLetters && hasSpecial && password.length >= 8) {
    return { isValid: true, score: 'fuerte' };
  }
  if ((hasNumbers && hasLetters) || password.length >= 8) {
    return { isValid: true, score: 'media' };
  }
  return { isValid: true, score: 'debil', message: 'Recomendado: combinar letras y números.' };
}
