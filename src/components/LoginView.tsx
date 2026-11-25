import React, { useState, useEffect } from 'react';
import { 
  Truck, 
  Lock, 
  User, 
  Mail, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  ShieldCheck, 
  AlertCircle, 
  CheckCircle2, 
  UserPlus, 
  LogIn, 
  KeyRound 
} from 'lucide-react';
import { AuthUser } from '../types/auth';
import { loginUser, registerUser } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';
import { evaluatePasswordStrength, getRateLimitStatus } from '../utils/security';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  
  // Estados de Login
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  
  // Estados de Registro
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regConfirm, setRegConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);

  // Estados de control
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [lockoutSec, setLockoutSec] = useState<number>(0);

  // Comprobar bloqueo por fuerza bruta al cargar
  useEffect(() => {
    const status = getRateLimitStatus();
    if (status.isLocked) {
      setLockoutSec(status.remainingSeconds);
    }
  }, []);

  // Contador de bloqueo en tiempo real
  useEffect(() => {
    if (lockoutSec <= 0) return;
    const timer = setInterval(() => {
      setLockoutSec(prev => {
        if (prev <= 1) {
          setError(null);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [lockoutSec]);

  // Manejador de Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);
    setIsLoading(true);

    try {
      const result = await loginUser(identifier, password, remember);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Credenciales inválidas.');
        const status = getRateLimitStatus();
        if (status.isLocked) {
          setLockoutSec(status.remainingSeconds);
        }
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Error en el inicio de sesión.');
    }
  };

  // Manejador de Registro
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    if (regPassword !== regConfirm) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    const strength = evaluatePasswordStrength(regPassword);
    if (!strength.isValid) {
      setError(strength.message || 'La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    setIsLoading(true);

    try {
      const result = await registerUser({
        name: regName,
        email: regEmail,
        password: regPassword,
        remember: true
      });

      setIsLoading(false);

      if (result.success && result.user) {
        setSuccessMsg('¡Cuenta creada con éxito! Ingresando...');
        setTimeout(() => {
          onLoginSuccess(result.user!);
        }, 800);
      } else {
        setError(result.error || 'No se pudo crear la cuenta.');
      }
    } catch (err: any) {
      setIsLoading(false);
      setError(err?.message || 'Error al procesar el registro.');
    }
  };

  // Inicio con Google
  const handleGoogleLogin = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const { error: oauthError } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin
        }
      });
      if (oauthError) {
        setError(`Error de Google: ${oauthError.message}`);
        setIsGoogleLoading(false);
      }
    } catch (err: any) {
      setError(err?.message || 'No se pudo conectar con el servicio de Google.');
      setIsGoogleLoading(false);
    }
  };

  const handleQuickFill = (u: string, p: string) => {
    setIdentifier(u);
    setPassword(p);
    setError(null);
  };

  const passwordStrength = regPassword ? evaluatePasswordStrength(regPassword) : null;

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-3 sm:p-4 selection:bg-[#e1261c] selection:text-white">
      {/* Tarjeta principal de acceso */}
      <div className="max-w-md w-full bg-white border-2 border-slate-900 shadow-2xl relative overflow-hidden">
        
        {/* Filete superior rojo de acento */}
        <div className="h-1.5 bg-[#e1261c] w-full"></div>

        {/* Encabezado de Marca */}
        <div className="p-5 pb-3 bg-slate-900 text-white text-center border-b border-slate-800">
          <div className="w-11 h-11 bg-white text-slate-950 mx-auto flex items-center justify-center border-2 border-[#e1261c] shadow-md mb-2.5">
            <Truck className="w-5 h-5 text-[#e1261c]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-0.5">
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight text-white">
              World of Work
            </h1>
            <span className="text-[10px] font-black uppercase bg-[#e1261c] text-white px-1.5 py-0.2">
              VIAL
            </span>
          </div>

          <p className="text-[11px] text-slate-400 font-medium">
            Sistema de Presupuestos & Movimiento de Suelo
          </p>
        </div>

        {/* Selector de Modo: Iniciar Sesión vs Registrarse */}
        <div className="grid grid-cols-2 border-b-2 border-slate-900 bg-slate-100 text-xs">
          <button
            type="button"
            onClick={() => { setMode('login'); setError(null); }}
            className={`py-2.5 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'login'
                ? 'bg-white text-slate-950 border-b-2 border-[#e1261c]'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <LogIn className="w-3.5 h-3.5 text-[#e1261c]" />
            <span>Iniciar Sesión</span>
          </button>

          <button
            type="button"
            onClick={() => { setMode('register'); setError(null); }}
            className={`py-2.5 font-black uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer ${
              mode === 'register'
                ? 'bg-white text-slate-950 border-b-2 border-[#e1261c]'
                : 'text-slate-500 hover:text-slate-950'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5 text-[#e1261c]" />
            <span>Crear Cuenta</span>
          </button>
        </div>

        {/* Mensajes de Alerta y Seguridad */}
        <div className="px-5 pt-3">
          {lockoutSec > 0 && (
            <div className="p-2.5 bg-amber-50 border border-amber-300 text-amber-900 text-xs font-bold flex items-center gap-2 mb-2">
              <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
              <span>Bloqueo de seguridad: esperá {lockoutSec} segundos para reintentar.</span>
            </div>
          )}

          {error && lockoutSec === 0 && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in mb-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {successMsg && (
            <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fade-in mb-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{successMsg}</span>
            </div>
          )}
        </div>

        {/* FORMULARIO DE INICIO DE SESIÓN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSubmit} className="p-5 pt-2 space-y-3.5">
            
            {/* Campo Usuario */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Usuario o Email
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  autoCapitalize="none"
                  autoCorrect="off"
                  disabled={lockoutSec > 0}
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="admin o ezequiel"
                  className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
                />
              </div>
            </div>

            {/* Campo Contraseña */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Contraseña
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  required
                  disabled={lockoutSec > 0}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-9 pr-10 py-2 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                  title={showPassword ? 'Ocultar' : 'Mostrar'}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Checkbox Recordar */}
            <div className="flex items-center justify-between text-xs pt-0.5">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={remember}
                  onChange={(e) => setRemember(e.target.checked)}
                  className="w-3.5 h-3.5 text-[#e1261c] border-slate-300 rounded focus:ring-[#e1261c]"
                />
                <span className="font-bold text-slate-700 text-[11px]">Recordar en este celular</span>
              </label>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={isLoading || isGoogleLoading || lockoutSec > 0}
              className="w-full py-2.5 px-4 bg-[#e1261c] hover:bg-[#c81e15] active:scale-98 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50"
            >
              <span>{isLoading ? 'Ingresando...' : 'Iniciar Sesión'}</span>
              <ArrowRight className="w-4 h-4 stroke-[3]" />
            </button>

            {/* Separador */}
            <div className="relative flex items-center justify-center pt-1 pb-1">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase text-slate-400 shrink-0">
                o continuar con
              </span>
              <div className="border-t border-slate-200 w-full"></div>
            </div>

            {/* Botón de Google Oficial */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Conectando con Google...' : 'Acceder con Google'}</span>
            </button>

            {/* Atajos de acceso rápido */}
            <div className="pt-2 border-t border-slate-200 text-center">
              <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1">
                Acceso rápido por defecto:
              </span>
              <div className="flex justify-center gap-2">
                <button
                  type="button"
                  onClick={() => handleQuickFill('admin', 'admin')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-mono font-bold text-slate-700 cursor-pointer"
                >
                  admin / admin
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickFill('ezequiel', '1234')}
                  className="px-2 py-0.5 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-mono font-bold text-slate-700 cursor-pointer"
                >
                  ezequiel / 1234
                </button>
              </div>
            </div>

          </form>
        )}

        {/* FORMULARIO DE REGISTRO / CREAR CUENTA */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSubmit} className="p-5 pt-2 space-y-3">
            
            {/* Nombre Completo */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Nombre y Apellido *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ej. Juan Pérez"
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Correo Electrónico *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Mail className="w-4 h-4" />
                </div>
                <input
                  type="email"
                  required
                  autoCapitalize="none"
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  placeholder="juan@empresa.com"
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
                />
              </div>
            </div>

            {/* Contraseña */}
            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700">
                  Contraseña *
                </label>
                {passwordStrength && (
                  <span className={`text-[9px] font-bold uppercase px-1 py-0.2 ${
                    passwordStrength.score === 'fuerte' ? 'bg-emerald-100 text-emerald-800' :
                    passwordStrength.score === 'media' ? 'bg-amber-100 text-amber-800' :
                    'bg-rose-100 text-rose-800'
                  }`}>
                    Seguridad: {passwordStrength.score}
                  </span>
                )}
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  type={showRegPassword ? 'text' : 'password'}
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full pl-9 pr-10 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
                />
                <button
                  type="button"
                  onClick={() => setShowRegPassword(!showRegPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-700 cursor-pointer"
                >
                  {showRegPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirmar Contraseña */}
            <div>
              <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
                Confirmar Contraseña *
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <KeyRound className="w-4 h-4" />
                </div>
                <input
                  type="password"
                  required
                  value={regConfirm}
                  onChange={(e) => setRegConfirm(e.target.value)}
                  placeholder="Repetí la contraseña"
                  className="w-full pl-9 pr-3 py-1.5 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
                />
              </div>
            </div>

            {/* Aviso de seguridad criptográfica */}
            <div className="p-2 bg-slate-50 border border-slate-200 text-[10px] text-slate-600 flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Contraseña protegida con cifrado SHA-256 y respaldo en Supabase.</span>
            </div>

            {/* Botón Registrarse */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-2.5 px-4 bg-[#e1261c] hover:bg-[#c81e15] active:scale-98 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer shadow-md disabled:opacity-50 mt-1"
            >
              <span>{isLoading ? 'Registrando...' : 'Crear Cuenta y Entrar'}</span>
              <UserPlus className="w-4 h-4" />
            </button>

            {/* Separador */}
            <div className="relative flex items-center justify-center pt-1 pb-1">
              <div className="border-t border-slate-200 w-full"></div>
              <span className="bg-white px-2.5 text-[10px] font-bold uppercase text-slate-400 shrink-0">
                o registrarse con
              </span>
              <div className="border-t border-slate-200 w-full"></div>
            </div>

            {/* Botón Registrarse con Google */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || isGoogleLoading}
              className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 active:bg-slate-100 border border-slate-300 text-slate-700 font-bold text-xs flex items-center justify-center gap-2.5 transition cursor-pointer shadow-xs disabled:opacity-50"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              <span>{isGoogleLoading ? 'Conectando con Google...' : 'Registrarse con Google'}</span>
            </button>

          </form>
        )}

        {/* Pie de tarjeta */}
        <div className="bg-slate-50 px-5 py-2.5 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            World of Work © 2026 • Cifrado de Datos & Modo Offline
          </p>
        </div>

      </div>
    </div>
  );
};
