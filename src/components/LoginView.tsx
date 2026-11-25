import React, { useState } from 'react';
import { Truck, Lock, User, Eye, EyeOff, ArrowRight, ShieldCheck, AlertCircle } from 'lucide-react';
import { AuthUser } from '../types/auth';
import { loginUser } from '../utils/auth';
import { supabase } from '../utils/supabaseClient';

interface LoginViewProps {
  onLoginSuccess: (user: AuthUser) => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ onLoginSuccess }) => {
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    setTimeout(() => {
      const result = loginUser(identifier, password, remember);
      setIsLoading(false);

      if (result.success && result.user) {
        onLoginSuccess(result.user);
      } else {
        setError(result.error || 'Credenciales inválidas.');
      }
    }, 200);
  };

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

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4 selection:bg-[#e1261c] selection:text-white">
      {/* Tarjeta principal de acceso */}
      <div className="max-w-md w-full bg-white border-2 border-slate-900 shadow-2xl relative overflow-hidden">
        
        {/* Filete superior rojo de acento */}
        <div className="h-1.5 bg-[#e1261c] w-full"></div>

        {/* Encabezado de Marca */}
        <div className="p-6 pb-4 bg-slate-900 text-white text-center border-b border-slate-800">
          <div className="w-12 h-12 bg-white text-slate-950 mx-auto flex items-center justify-center border-2 border-[#e1261c] shadow-md mb-3">
            <Truck className="w-6 h-6 text-[#e1261c]" />
          </div>

          <div className="flex items-center justify-center gap-1.5 mb-1">
            <h1 className="text-xl font-black uppercase tracking-tight text-white">
              World of Work
            </h1>
            <span className="text-[10px] font-black uppercase bg-[#e1261c] text-white px-1.5 py-0.2">
              VIAL
            </span>
          </div>

          <p className="text-xs text-slate-400 font-medium">
            Sistema de Presupuestos & Movimiento de Suelo
          </p>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          
          <div className="text-center pb-1">
            <h2 className="text-sm font-black uppercase tracking-wider text-slate-900 flex items-center justify-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-[#e1261c]" />
              <span>Acceso de Operador</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Ingresá tus credenciales para continuar
            </p>
          </div>

          {/* Mensaje de error */}
          {error && (
            <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2 animate-fade-in">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Campo Usuario */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
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
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="Ej. admin o ezequiel"
                className="w-full pl-9 pr-3 py-2 text-xs font-bold bg-slate-50 border border-slate-300 focus:bg-white focus:outline-none focus:border-[#e1261c] transition"
              />
            </div>
          </div>

          {/* Campo Contraseña */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-slate-700 mb-1">
              Contraseña
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <Lock className="w-4 h-4" />
              </div>
              <input
                type={showPassword ? 'text' : 'password'}
                required
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
          <div className="flex items-center justify-between text-xs pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="w-4 h-4 text-[#e1261c] border-slate-300 rounded focus:ring-[#e1261c]"
              />
              <span className="font-bold text-slate-700 text-[11px]">Recordar en este celular</span>
            </label>
          </div>

          {/* Botón Ingresar */}
          <button
            type="submit"
            disabled={isLoading || isGoogleLoading}
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
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
              />
            </svg>
            <span>{isGoogleLoading ? 'Conectando con Google...' : 'Acceder con Google'}</span>
          </button>

          {/* Atajo rápido de credenciales por defecto */}
          <div className="pt-2 border-t border-slate-200 text-center">
            <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wide block mb-1.5">
              Acceso rápido por defecto:
            </span>
            <div className="flex justify-center gap-2">
              <button
                type="button"
                onClick={() => handleQuickFill('admin', 'admin')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-mono font-bold text-slate-700 cursor-pointer transition"
              >
                admin / admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('ezequiel', '1234')}
                className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 border border-slate-300 text-[10px] font-mono font-bold text-slate-700 cursor-pointer transition"
              >
                ezequiel / 1234
              </button>
            </div>
          </div>

        </form>

        {/* Pie de tarjeta */}
        <div className="bg-slate-50 px-6 py-2.5 border-t border-slate-200 text-center">
          <p className="text-[10px] text-slate-400 font-medium">
            World of Work © 2026 • Modo Seguro y Offline
          </p>
        </div>

      </div>
    </div>
  );
};
