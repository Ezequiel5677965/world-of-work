import React from 'react';
import { Shovel, PlusCircle, History, Settings2, Sparkles } from 'lucide-react';
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
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo & Brand */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center text-white shadow-md shadow-amber-500/20 ring-2 ring-amber-400/30">
              <Shovel className="w-5 h-5 -rotate-12" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-extrabold text-lg tracking-tight text-slate-900">
                  {companySettings.companyName || 'Maquinita'}
                </span>
                <span className="text-[11px] font-bold uppercase tracking-wider bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full border border-amber-200">
                  Suelo & Equipos
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Presupuestos rápidos y cálculo de m³ de movimiento de suelo
              </p>
            </div>
          </div>

          {/* Navigation & Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Botón Nuevo Presupuesto */}
            <button
              onClick={onNewBudget}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 text-sm font-semibold rounded-lg bg-amber-500 text-white hover:bg-amber-600 active:scale-95 transition shadow-sm shadow-amber-500/25"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Nuevo Presupuesto</span>
            </button>

            {/* Selector de Vistas */}
            <div className="flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200">
              <button
                onClick={() => onNavigate('editor')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 ${
                  currentView === 'editor'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                <span>Generador</span>
              </button>

              <button
                onClick={() => onNavigate('history')}
                className={`px-3 py-1.5 text-xs font-semibold rounded-md transition flex items-center gap-1.5 relative ${
                  currentView === 'history'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <History className="w-3.5 h-3.5 text-slate-500" />
                <span>Historial</span>
                {savedCount > 0 && (
                  <span className="ml-1 px-1.5 py-0.2 text-[10px] font-bold bg-amber-500 text-white rounded-full">
                    {savedCount}
                  </span>
                )}
              </button>
            </div>

            {/* Ajustes / Precios */}
            <button
              onClick={onOpenSettings}
              title="Configurar Precios de Máquinas y Datos de Empresa"
              className="p-2 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg border border-slate-200 transition"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
