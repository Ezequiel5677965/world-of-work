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
      {/* Filete superior icónico Bobcat */}
      <div className="h-1 bg-[#e1261c] w-full"></div>

      <div className="max-w-2xl mx-auto px-3 sm:px-4">
        <div className="flex items-center justify-between h-13 sm:h-14 gap-2">
          
          {/* Logo & Marca compacto para celular */}
          <div 
            onClick={() => onNavigate('editor')}
            className="flex items-center gap-2 cursor-pointer select-none shrink-0"
          >
            <div className="w-8 h-8 bg-slate-950 text-white flex items-center justify-center border border-slate-950 relative overflow-hidden">
              <Truck className="w-4 h-4 text-white" />
              <div className="absolute bottom-0 inset-x-0 h-0.5 bg-[#e1261c]"></div>
            </div>
            
            <div>
              <div className="flex items-center gap-1 leading-none">
                <span className="font-black text-sm tracking-tight text-slate-950 uppercase">
                  {companySettings.companyName || 'Maquinita'}
                </span>
                <span className="text-[9px] font-black uppercase bg-[#e1261c] text-white px-1 py-0.2">
                  Bobcat
                </span>
              </div>
              <p className="text-[9px] text-slate-500 font-semibold mt-0.5 leading-none">
                Presupuestos de Suelo
              </p>
            </div>
          </div>

          {/* Acciones principales compactas (entran perfecto en cualquier celular) */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Botón Nuevo */}
            <button
              onClick={onNewBudget}
              className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-black uppercase tracking-wider bg-[#e1261c] hover:bg-[#c81e15] active:scale-95 text-white transition cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5 stroke-[3]" />
              <span>Nuevo</span>
            </button>

            {/* Selector Editor / Historial */}
            <div className="inline-flex border border-slate-300 bg-slate-100 p-0.5">
              <button
                onClick={() => onNavigate('editor')}
                title="Editor de Presupuestos"
                className={`px-2 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer ${
                  currentView === 'editor'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <Sparkles className="w-3 h-3 text-[#e1261c]" />
                <span className="hidden xs:inline text-[11px]">Editor</span>
              </button>

              <button
                onClick={() => onNavigate('history')}
                title="Historial de Presupuestos"
                className={`px-2 py-1 text-xs font-bold transition flex items-center gap-1 relative cursor-pointer ${
                  currentView === 'history'
                    ? 'bg-slate-950 text-white'
                    : 'text-slate-700 hover:text-slate-950'
                }`}
              >
                <History className="w-3 h-3" />
                <span className="hidden xs:inline text-[11px]">Historial</span>
                {savedCount > 0 && (
                  <span className="px-1 text-[9px] font-black bg-[#e1261c] text-white">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>

            {/* Ajustes */}
            <button
              onClick={onOpenSettings}
              title="Configuración de Tarifas"
              className="p-1.5 text-slate-700 hover:text-slate-950 hover:bg-slate-100 border border-slate-300 transition cursor-pointer"
            >
              <Settings2 className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </div>
    </header>
  );
};
