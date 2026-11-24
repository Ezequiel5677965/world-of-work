import React, { useState } from 'react';
import { 
  Search, 
  Eye, 
  Trash2, 
  Copy, 
  Share2, 
  Calendar, 
  MapPin, 
  PlusCircle, 
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
          className={`appearance-none text-[11px] font-bold px-2.5 py-1 pr-6 rounded-full border border-slate-200 cursor-pointer ${current.bg} ${current.text} focus:outline-none`}
        >
          <option value="borrador">Borrador</option>
          <option value="enviado">Enviado</option>
          <option value="aprobado">Aprobado</option>
          <option value="rechazado">Rechazado</option>
        </select>
        <Icon className={`w-3 h-3 absolute right-2 top-2 pointer-events-none ${current.text}`} />
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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      {/* Barra de Búsqueda y Filtros */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
        <div>
          <h2 className="text-xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <span>Historial de Presupuestos</span>
            <span className="text-xs font-bold bg-amber-100 text-amber-800 px-2.5 py-0.5 rounded-full">
              {budgets.length} en total
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Consultá presupuestos guardados, duplicalos para obras similares o actualizá su estado
          </p>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {/* Input Buscador */}
          <div className="relative flex-1 sm:w-64">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Buscar por cliente, obra o Nº..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          {/* Filtro Estado */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-xs font-semibold rounded-xl border border-slate-200 bg-white text-slate-700 focus:outline-none shadow-2xs"
          >
            <option value="todos">Todos los estados</option>
            <option value="aprobado">Aprobados</option>
            <option value="enviado">Enviados</option>
            <option value="borrador">Borradores</option>
            <option value="rechazado">Rechazados</option>
          </select>
        </div>
      </div>

      {/* Lista de Presupuestos */}
      {filtered.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8 shadow-xs">
          <div className="w-12 h-12 bg-amber-100 rounded-full flex items-center justify-center mx-auto text-amber-600 mb-3">
            <PlusCircle className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-base">No hay presupuestos guardados</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto mt-1 mb-4">
            {searchTerm || statusFilter !== 'todos'
              ? 'No se encontraron presupuestos que coincidan con los filtros aplicados.'
              : 'Todavía no generaste ningún presupuesto. ¡Comenzá a armar tu primer presupuesto de movimiento de suelo!'}
          </p>
          <button
            onClick={onNewBudget}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold rounded-xl transition shadow-sm"
          >
            + Crear Nuevo Presupuesto
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map(budget => (
            <div
              key={budget.id}
              className="bg-white rounded-2xl border border-slate-200 hover:border-amber-400 p-5 shadow-xs hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Cabecera tarjeta */}
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <span className="font-mono text-xs font-black text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {budget.code}
                  </span>
                  {getStatusBadge(budget.status, budget.id)}
                </div>

                {/* Cliente y Obra */}
                <h4 className="font-bold text-slate-900 text-base leading-tight mb-1">
                  {budget.client.name || 'Sin nombre de cliente'}
                </h4>
                <p className="text-xs font-semibold text-amber-800 truncate mb-2">
                  {budget.project.title || 'Movimiento de Suelo'}
                </p>

                {budget.project.location && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mb-2 truncate">
                    <MapPin className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>{budget.project.location}</span>
                  </p>
                )}

                {/* Resumen volumétrico si tiene */}
                {budget.soilCalculation && budget.soilCalculation.bankVolumeM3 > 0 && (
                  <div className="p-2 rounded-lg bg-amber-50/70 border border-amber-200/60 text-[11px] text-amber-900 mb-3 flex items-center justify-between">
                    <span>Volumen: <strong>{budget.soilCalculation.bankVolumeM3} m³</strong></span>
                    <span>Camiones: <strong>{budget.soilCalculation.truckTrips} viajes</strong></span>
                  </div>
                )}

                {/* Importe Total */}
                <div className="my-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block">
                    Total Cotizado
                  </span>
                  <span className="text-xl font-black text-slate-950">
                    {formatCurrency(budget.total, companySettings.currency)}
                  </span>
                </div>
              </div>

              {/* Acciones y Fecha */}
              <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-xs text-slate-400">
                <span className="flex items-center gap-1 text-[11px]">
                  <Calendar className="w-3.5 h-3.5" />
                  {formatDate(budget.createdAt)}
                </span>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onSelectBudget(budget)}
                    title="Ver formalmente (PDF / Imprimir)"
                    className="p-1.5 text-slate-600 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition"
                  >
                    <Eye className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => handleShareWhatsApp(budget)}
                    title="Compartir por WhatsApp"
                    className="p-1.5 text-slate-600 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onDuplicateBudget(budget)}
                    title="Duplicar para una nueva obra similar"
                    className="p-1.5 text-slate-600 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition"
                  >
                    <Copy className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => onEditBudget(budget)}
                    title="Editar presupuesto"
                    className="px-2.5 py-1 text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg transition"
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
                    className="p-1.5 text-slate-300 hover:text-rose-600 rounded-lg transition"
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
