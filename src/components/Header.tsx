import React from 'react';
import { Plus, History, Settings2, Sparkles, Truck } from 'lucide-react';
import { CompanySettings } from '../types/budget';

interface HeaderProps {
  currentView: 'editor' | 'history';
  onNavigate: (view: 'editor' | 'history') => void;
  onNewBudget: () => void;
  onOpenSettings: () => void;
  savedCount: number;
  companySettings: CompanySettings;
}

export const Header: React.FC<HeaderProps> = ({
  currentView,
  onNavigate,
  onNewBudget,
  onOpenSettings,
  savedCount,
  companySettings
}) => {
  return (
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-900 shadow-sm no-print">
      {/* Filete superior icónico Bobcat: Blanco con franja roja */}
      <div className="h-1.5 bg-[#e1261c] w-full"></div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-14 sm:h-16 gap-2">
          
          {/* Logo & Marca estilo Bobcat */}
          <div className="flex items-center gap-2.5 min-w-0">
            {/* Ícono de minicargadora con estética Bobcat (Fondo negro, acento rojo Bobcat) */}
            <div className="w-9 h-9 sm:w-10 sm:h-10 bg-slate-950 text-white flex items-center justify-center border-2 border-slate-950 shrink-0 relative overflow-hidden shadow-xs">
              <Truck className="w-5 h-5 text-white" />
              <div className="absolute bottom-0 inset-x-0 h-1 bg-[#e1261c]"></div>
            </div>
            
            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="font-black text-sm sm:text-base tracking-tight text-slate-950 truncate uppercase">
                  {companySettings.companyName || 'Maquinita'}
                </span>
                <span className="hidden xs:inline-block text-[9px] font-black uppercase tracking-wider bg-[#e1261c] text-white px-1.5 py-0.2">
                  Bobcat
                </span>
              </div>
              <p className="text-[10px] sm:text-xs text-slate-500 truncate font-medium">
                Movimiento de Suelo & Presupuestos
              </p>
            </div>
          </div>

          {/* Acciones principales adaptadas a Celular */}
          <div className="flex items-center gap-1.5 sm:gap-3 shrink-0">
            {/* Botón Nuevo Presupuesto */}
            <button
              onClick={onNewBudget}
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 text-xs font-black uppercase tracking-wider bg-[#e1261c] hover:bg-[#c81e15] active:scale-95 text-white transition shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4 stroke-[3]" />
              <span className="hidden xs:inline">Nuevo</span>
            </button>

            {/* Selector de Vistas: Generador vs Historial */}
            <div className="inline-flex p-0.5 bg-slate-100 border border-slate-300">
              <button
                onClick={() => onNavigate('editor')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  currentView === 'editor'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-[#e1261c]" />
                <span className="hidden sm:inline">Editor</span>
              </button>

              <button
                onClick={() => onNavigate('history')}
                className={`px-2.5 sm:px-3 py-1 sm:py-1.5 text-xs font-bold transition flex items-center gap-1 relative cursor-pointer ${
                  currentView === 'history'
                    ? 'bg-slate-950 text-white shadow-xs'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <History className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Historial</span>
                {savedCount > 0 && (
                  <span className="ml-0.5 px-1.5 py-0.2 text-[10px] font-black bg-[#e1261c] text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>

            {/* Botón Configurar Precios */}
            <button
              onClick={onOpenSettings}
              title="Configuración y Tarifas"
              className="p-1.5 sm:p-2 text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
