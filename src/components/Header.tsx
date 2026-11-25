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
    <header className="sticky top-0 z-30 bg-white border-b-2 border-slate-900 shadow-xs no-print w-full">
      {/* Filete superior de acento */}
      <div className="h-1 bg-[#e1261c] w-full"></div>

      {/* Fila 1: Logo y Botones Principales (Despejados y sin apretarse) */}
      <div className="max-w-xl mx-auto px-3 sm:px-4 py-2 flex items-center justify-between gap-2">
        {/* Marca */}
        <div 
          onClick={() => onNavigate('editor')}
          className="flex items-center gap-2 cursor-pointer select-none shrink-0"
        >
          <div className="w-8 h-8 bg-slate-950 text-white flex items-center justify-center border border-slate-950 relative overflow-hidden shrink-0">
            <Truck className="w-4 h-4 text-white" />
            <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e1261c]"></div>
          </div>
          
          <div>
            <div className="flex items-center gap-1 leading-none">
              <span className="font-black text-sm tracking-tight text-slate-950 uppercase">
                {companySettings.companyName || 'World of Work'}
              </span>
              <span className="text-[9px] font-black uppercase bg-[#e1261c] text-white px-1.5 py-0.2">
                VIAL
              </span>
            </div>
            <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-none">
              Presupuestos de Suelo
            </p>
          </div>
        </div>

        {/* Botones de acción derecha */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onNewBudget}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-black uppercase tracking-wider bg-[#e1261c] hover:bg-[#c81e15] active:scale-95 text-white transition cursor-pointer shadow-xs"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Nuevo</span>
          </button>

          <button
            onClick={onOpenSettings}
            title="Configuración de Tarifas"
            className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
          >
            <Settings2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Fila 2: Pestañas de navegación claras (Grande, legible y cómodo para los dedos) */}
      <div className="border-t border-slate-200 bg-slate-50">
        <div className="max-w-xl mx-auto px-3 sm:px-4 grid grid-cols-2 gap-2 py-1.5">
          <button
            onClick={() => onNavigate('editor')}
            className={`py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              currentView === 'editor'
                ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-[#e1261c]" />
            <span>Editor</span>
          </button>

          <button
            onClick={() => onNavigate('history')}
            className={`py-1.5 text-xs font-black uppercase tracking-wider transition flex items-center justify-center gap-1.5 border cursor-pointer ${
              currentView === 'history'
                ? 'bg-slate-950 text-white border-slate-950 shadow-xs'
                : 'bg-white text-slate-700 border-slate-300 hover:bg-slate-100'
            }`}
          >
            <History className="w-3.5 h-3.5" />
            <span>Historial</span>
            {savedCount > 0 && (
              <span className={`px-1.5 py-0.2 text-[10px] font-black ${
                currentView === 'history' ? 'bg-[#e1261c] text-white' : 'bg-slate-200 text-slate-800'
              }`}>
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
