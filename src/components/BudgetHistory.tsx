import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  Copy, 
  Share2, 
  Calendar, 
  MapPin, 
  Plus, 
  CheckCircle, 
  Clock, 
  AlertCircle
} from 'lucide-react';
import { Budget, BudgetStatus, CompanySettings } from '../types/budget';
import { formatCurrency, formatDate, generateWhatsAppMessage } from '../utils/formatters';

interface BudgetHistoryProps {
  budgets: Budget[];
  companySettings: CompanySettings;
  onSelectBudget: (budget: Budget) => void;
  onEditBudget: (budget: Budget) => void;
  onDuplicateBudget: (budget: Budget) => void;
  onDeleteBudget: (id: string) => void;
  onUpdateStatus: (id: string, status: BudgetStatus) => void;
  onNewBudget: () => void;
}

export const BudgetHistory: React.FC<BudgetHistoryProps> = ({
  budgets,
  companySettings,
  onSelectBudget,
  onEditBudget,
  onDuplicateBudget,
  onDeleteBudget,
  onUpdateStatus,
  onNewBudget
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('todos');

  const filtered = budgets.filter(b => {
    const matchesSearch = 
      b.client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.project.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
      b.project.title.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'todos' || b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const getStatusBadge = (status: BudgetStatus, budgetId: string) => {
    const config: Record<BudgetStatus, { label: string; bg: string; text: string; icon: any }> = {
      borrador: { label: 'Borrador', bg: 'bg-slate-100', text: 'text-slate-700', icon: Clock },
      enviado: { label: 'Enviado', bg: 'bg-blue-100', text: 'text-blue-800', icon: AlertCircle },
      aprobado: { label: 'Aprobado', bg: 'bg-emerald-100', text: 'text-emerald-800', icon: CheckCircle },
      rechazado: { label: 'Rechazado', bg: 'bg-rose-100', text: 'text-rose-800', icon: AlertCircle }
    };

    const current = config[status] || config.borrador;
    const Icon = current.icon;

    return (
      <div className="relative inline-block">
        <select
          value={status}
          onChange={(e) => onUpdateStatus(budgetId, e.target.value as BudgetStatus)}
          className={`appearance-none text-[11px] font-bold px-2 py-0.5 pr-5 border border-slate-300 cursor-pointer ${current.bg} ${current.text} focus:outline-none`}
        >
          <option value="borrador">Borrador</option>
          <option value="enviado">Enviado</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <Icon className={`w-3 h-3 absolute right-1.5 top-1.5 pointer-events-none ${current.text}`} />
      </div>
    );
  };

  const handleShareWhatsApp = (budget: Budget) => {
    const encoded = generateWhatsAppMessage(budget, companySettings.companyName);
    const cleanPhone = budget.client.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 8
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  return (
    <div className="max-w-xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-5 space-y-3.5">
      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b-2 border-slate-900 pb-3">
        <div>
          <h2 className="text-lg sm:text-xl font-black text-slate-950 uppercase tracking-tight flex items-center gap-2">
            <span>Historial de Presupuestos</span>
            <span className="text-[10px] font-mono font-bold bg-[#e1261c] text-white px-2 py-0.5">
              {budgets.length}
            </span>
          </h2>
          <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
            Consultá, duplicá o actualizá los presupuestos generados.
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Input Buscador */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            <input
              type="text"
              placeholder="Buscar cliente, obra o Nº..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs font-bold border border-slate-300 bg-white text-slate-800 focus:outline-none"
          >
            <option value="todos">Todos</option>
            <option value="aprobado">Aprobados</option>
            <option value="enviado">Enviados</option>
            <option value="borrador">Borradores</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Lista de Presupuestos */}
      {filtered.length === 0 ? (
        <div className="text-center py-12 bg-white border-2 border-dashed border-slate-300 p-6">
          <p className="text-sm font-bold text-slate-800">No se encontraron presupuestos</p>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm || statusFilter !== 'todos'
              ? 'Probá cambiando el texto de búsqueda o el filtro.'
              : 'Todavía no hay presupuestos guardados.'}
          </p>
          <button
            onClick={onNewBudget}
            className="px-4 py-2 bg-[#e1261c] hover:bg-[#c81e15] text-white text-xs font-black uppercase tracking-wider transition cursor-pointer"
          >
            + Crear Primer Presupuesto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
          {filtered.map(budget => (
            <div
              key={budget.id}
              className="bg-white border-2 border-slate-900 p-4 shadow-xs flex flex-col justify-between hover:border-[#e1261c] transition"
            >
              <div>
                {/* Cabecera tarjeta */}
                <div className="flex items-center justify-between pb-2 border-b border-slate-200 mb-2">
                  <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 border border-slate-200">
                    {budget.code}
                  </span>
                  {getStatusBadge(budget.status, budget.id)}
                </div>

                {/* Cliente y Obra */}
                <h4 className="font-black text-slate-950 text-sm leading-tight mb-0.5">
                  {budget.client.name || 'Sin nombre de cliente'}
                </h4>
                <p className="text-xs font-bold text-[#e1261c] truncate mb-1">
                  {budget.project.title || 'Movimiento de Suelo'}
                </p>

                {budget.project.location && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{budget.project.location}</span>
                  </p>
                )}

                {/* Importe Total */}
                <div className="my-2 p-2 bg-slate-50 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    Total
                  </span>
                  <span className="text-xl font-black text-slate-950 font-mono">
                    {formatCurrency(budget.total, companySettings.currency)}
                  </span>
                </div>
              </div>

              {/* Acciones y Fecha */}
              <div className="pt-2 border-t border-slate-200 mt-2 flex items-center justify-between text-xs text-slate-500">
                <span className="flex items-center gap-1 text-[11px] font-mono">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  {formatDate(budget.createdAt)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectBudget(budget)}
                    title="Ver formalmente (PDF / Imprimir)"
                    className="p-1.5 text-slate-700 hover:text-[#e1261c] hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(budget)}
                    title="WhatsApp"
                    className="p-1.5 text-slate-700 hover:text-emerald-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDuplicateBudget(budget)}
                    title="Duplicar para una nueva obra"
                    className="p-1.5 text-slate-700 hover:text-blue-600 hover:bg-slate-100 border border-slate-200 transition cursor-pointer"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditBudget(budget)}
                    title="Editar"
                    className="px-2 py-1 text-[11px] font-black uppercase tracking-wider bg-slate-950 text-white hover:bg-slate-800 transition cursor-pointer"
                  >
                    Editar
                  </button>

                  <button
                    onClick={() => {
                      if (confirm(`¿Eliminar el presupuesto ${budget.code}?`)) {
                        onDeleteBudget(budget.id);
                      }
                    }}
                    title="Eliminar"
                    className="p-1.5 text-slate-300 hover:text-rose-600 transition cursor-pointer"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
