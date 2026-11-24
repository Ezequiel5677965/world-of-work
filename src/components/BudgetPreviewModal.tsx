import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  Copy, 
  X, 
  Edit3, 
  Check, 
  Phone,
  Layers,
  FileText,
  AlignLeft
} from 'lucide-react';
import { Budget, CompanySettings } from '../types/budget';
import { formatCurrency, formatDate, calculateExpiryDate, generateWhatsAppMessage } from '../utils/formatters';

interface BudgetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  budget: Budget;
  companySettings: CompanySettings;
  onEdit: () => void;
}

export const BudgetPreviewModal: React.FC<BudgetPreviewModalProps> = ({
  isOpen,
  onClose,
  budget,
  companySettings,
  onEdit
}) => {
  const [copied, setCopied] = useState(false);
  const [mode, setMode] = useState<'resumido' | 'completo'>('resumido');

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleWhatsApp = () => {
    const encoded = generateWhatsAppMessage(budget, companySettings.companyName);
    const cleanPhone = budget.client.phone.replace(/[^0-9]/g, '');
    const url = cleanPhone.length >= 8
      ? `https://wa.me/${cleanPhone}?text=${encoded}`
      : `https://wa.me/?text=${encoded}`;
    window.open(url, '_blank');
  };

  const handleCopyText = async () => {
    const rawText = decodeURIComponent(generateWhatsAppMessage(budget, companySettings.companyName));
    try {
      await navigator.clipboard.writeText(rawText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      alert('No se pudo copiar automáticamente. Puedes usar el botón de WhatsApp directo.');
    }
  };

  const expiryDate = calculateExpiryDate(budget.createdAt, budget.validityDays);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-start justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white shadow-2xl max-w-3xl w-full border border-slate-300 flex flex-col my-1 sm:my-6 print:my-0 print:border-none print:shadow-none print:max-w-full">
        
        {/* Barra superior de herramientas (Sticky y adaptable a móvil) */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between px-3 sm:px-6 py-2.5 sm:py-3 bg-slate-950 text-white gap-2 border-b-2 border-[#e1261c] shadow-md no-print">
          
          {/* Selector de modo: Resumido vs Detallado */}
          <div className="flex items-center gap-1.5">
            <div className="inline-flex border border-slate-800 bg-slate-900 p-0.5">
              <button
                type="button"
                onClick={() => setMode('resumido')}
                className={`px-2.5 py-1 text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                  mode === 'resumido'
                    ? 'bg-[#e1261c] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <AlignLeft className="w-3.5 h-3.5" />
                <span>Resumido</span>
              </button>
              <button
                type="button"
                onClick={() => setMode('completo')}
                className={`px-2.5 py-1 text-xs font-black transition cursor-pointer flex items-center gap-1 ${
                  mode === 'completo'
                    ? 'bg-[#e1261c] text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <FileText className="w-3.5 h-3.5" />
                <span>Detallado</span>
              </button>
            </div>
          </div>

          {/* Botones de acción móvil-friendly */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={handlePrint}
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-[#e1261c] hover:bg-[#c81e15] text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="px-2.5 sm:px-3.5 py-1.5 text-xs font-black uppercase tracking-wider bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1 transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-2 sm:px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition cursor-pointer"
              title="Copiar texto resumen"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span className="hidden sm:inline">{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={onEdit}
              className="px-2 sm:px-3 py-1.5 text-xs font-bold bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Editar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* ============================================================== */}
        {/* DOCUMENTO RESUMIDO Y DIRECTO (ADAPTADO A MÓVIL Y A4 IMPRESO) */}
        {/* ============================================================== */}
        <div className="p-4 sm:p-8 md:p-12 bg-white print:p-0 text-slate-900 font-sans print-container">
          
          {/* CABECERA: Empresa vs Datos de Presupuesto */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-4 border-b-2 border-slate-900 gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 bg-[#e1261c] inline-block shrink-0"></span>
                <h1 className="text-lg sm:text-2xl font-black text-slate-950 uppercase tracking-tight">
                  {companySettings.companyName || 'MAQUINITA - MOVIMIENTO DE SUELO'}
                </h1>
              </div>
              <p className="text-[11px] sm:text-xs font-bold text-slate-600 uppercase tracking-wider mt-0.5">
                Movimiento de suelo • Excavaciones • Bobcat
              </p>
              <div className="text-xs text-slate-600 mt-1.5 space-y-0.5">
                {companySettings.phone && (
                  <p className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <span>Tel / WhatsApp: <strong>{companySettings.phone}</strong></span>
                  </p>
                )}
                {companySettings.city && (
                  <p className="text-slate-500">{companySettings.city}</p>
                )}
              </div>
            </div>

            <div className="border border-slate-400 p-2.5 sm:p-3 bg-slate-50 sm:text-right w-full sm:w-auto min-w-[190px]">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500 block">
                Presupuesto
              </span>
              <p className="text-base sm:text-lg font-mono font-black text-slate-950 mt-0.5">
                {budget.code}
              </p>
              <div className="text-[11px] sm:text-xs text-slate-600 mt-1 font-mono space-y-0.5">
                <p>Fecha: <strong className="text-slate-900">{formatDate(budget.createdAt)}</strong></p>
                <p>Válido hasta: <strong className="text-slate-900">{expiryDate}</strong></p>
              </div>
            </div>
          </div>

          {/* DATOS DE CLIENTE Y OBRA */}
          <div className="my-4 border border-slate-300 bg-white grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-300 text-xs">
            <div className="p-2.5 sm:p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Cliente:
              </span>
              <p className="text-sm font-bold text-slate-950">
                {budget.client.name || 'Cliente Particular'}
              </p>
              {budget.client.phone && (
                <p className="text-slate-600 mt-0.5">Tel: {budget.client.phone}</p>
              )}
            </div>

            <div className="p-2.5 sm:p-3">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-0.5">
                Lugar de Obra / Trabajo:
              </span>
              <p className="text-sm font-bold text-slate-950">
                {budget.project.title || 'Movimiento de Suelo'}
              </p>
              {budget.project.location && (
                <p className="text-slate-600 mt-0.5">Ubicación: {budget.project.location}</p>
              )}
            </div>
          </div>

          {/* SÓLO SI ELIGIÓ MODO DETALLADO: Memoria técnica */}
          {mode === 'completo' && budget.soilCalculation && budget.soilCalculation.bankVolumeM3 > 0 && (
            <div className="border border-slate-300 mb-4 p-3 text-xs bg-slate-50">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-700 block mb-1.5 flex items-center gap-1">
                <Layers className="w-3.5 h-3.5 text-[#e1261c]" />
                Cálculo Volumétrico Estimado:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-[11px]">
                <div>Área: <strong>{budget.soilCalculation.areaM2} m²</strong></div>
                <div>Vol. firme: <strong>{budget.soilCalculation.bankVolumeM3} m³</strong></div>
                <div>Vol. suelto: <strong>{budget.soilCalculation.looseVolumeM3} m³</strong></div>
                <div>Camiones: <strong>{budget.soilCalculation.truckTrips} viajes</strong> ({budget.soilCalculation.truckCapacityM3} m³)</div>
              </div>
            </div>
          )}

          {/* TABLA PRINCIPAL DE TRABAJOS Y PRECIOS (SCROLLABLE EN PANTALLAS MUY CHICAS) */}
          <div className="border border-slate-400 mb-4 overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse min-w-[320px]">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] sm:text-[11px] border-b border-slate-800">
                  <th className="py-2 px-2.5 sm:px-3">Descripción de Trabajos / Equipos</th>
                  <th className="py-2 px-2 sm:px-3 text-center w-20 sm:w-24">Cantidad</th>
                  <th className="py-2 px-2 sm:px-3 text-right w-24 sm:w-32">Precio Unit.</th>
                  <th className="py-2 px-2 sm:px-3 text-right w-28 sm:w-36">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {budget.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/70'}>
                    <td className="py-2 sm:py-2.5 px-2.5 sm:px-3">
                      <p className="font-bold text-slate-950 text-xs">{item.name}</p>
                      {item.description && (
                        <p className="text-[10px] sm:text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-center font-mono font-bold text-slate-800 text-xs">
                      {item.quantity} <span className="text-slate-500 font-normal">{item.unit}</span>
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono text-slate-700 text-xs">
                      {formatCurrency(item.unitPrice, companySettings.currency)}
                    </td>
                    <td className="py-2 sm:py-2.5 px-2 sm:px-3 text-right font-mono font-black text-slate-950 text-xs sm:text-sm">
                      {formatCurrency(item.total, companySettings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* CIERRE: CONDICIONES DE PAGO Y TOTAL FINAL */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-start break-inside-avoid">
            
            {/* Condiciones simples y banco */}
            <div className="sm:col-span-7 border border-slate-300 p-3 text-xs space-y-2">
              <div>
                <span className="font-bold text-slate-800 text-[10px] block uppercase tracking-wide">
                  Forma de Pago:
                </span>
                <p className="text-slate-700 text-xs mt-0.5">
                  {budget.paymentTerms || '50% de anticipo al inicio, saldo al finalizar los trabajos.'}
                </p>
              </div>

              {companySettings.bankInfo && (
                <div className="pt-2 border-t border-slate-200">
                  <span className="font-bold text-slate-800 text-[10px] block uppercase tracking-wide">
                    Datos para Transferencia:
                  </span>
                  <p className="font-mono text-slate-800 text-xs bg-slate-50 p-1.5 border border-slate-200 mt-0.5">
                    {companySettings.bankInfo}
                  </p>
                </div>
              )}

              {budget.generalNotes && (
                <p className="text-[11px] text-slate-500 pt-1 border-t border-slate-200 italic">
                  Nota: {budget.generalNotes}
                </p>
              )}
            </div>

            {/* Total general directo (Estilo Bobcat) */}
            <div className="sm:col-span-5 border-2 border-slate-900 p-3.5 bg-slate-50 text-right font-mono">
              <span className="text-[11px] font-sans font-bold uppercase tracking-wider text-slate-600 block">
                TOTAL PRESUPUESTO
              </span>
              <p className="text-xl sm:text-2xl font-black text-slate-950 mt-1 tracking-tight">
                {formatCurrency(budget.total, companySettings.currency)}
              </p>
              <p className="text-[10px] font-sans text-slate-500 mt-1">
                Validez: {budget.validityDays} días
              </p>
            </div>
          </div>

          {/* FIRMA SIMPLE */}
          <div className="mt-8 sm:mt-12 pt-3 border-t border-slate-300 flex justify-between items-end text-xs text-slate-500 break-inside-avoid">
            <div>
              <p className="text-[11px] font-bold text-slate-800">
                {companySettings.companyName || 'Movimiento de Suelo'}
              </p>
              <p className="text-[10px] text-slate-400">Presupuesto sujeto a confirmación</p>
            </div>

            <div className="w-40 sm:w-48 text-center border-t border-slate-400 pt-1 text-[11px] text-slate-700">
              Firma y Conformidad
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
