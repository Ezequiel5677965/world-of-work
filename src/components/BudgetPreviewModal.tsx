import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  Copy, 
  X, 
  Edit3, 
  Check, 
  MapPin, 
  Phone, 
  Mail, 
  Layers, 
  Truck, 
  Calendar,
  Building,
  ShieldCheck
} from 'lucide-react';
import { Budget, CompanySettings } from '../types/budget';
import { formatCurrency, formatDate, generateWhatsAppMessage } from '../utils/formatters';
import { getWorkTypeLabel } from '../utils/soilCalculations';

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

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-2 sm:p-4 print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white rounded-2xl shadow-2xl max-w-4xl w-full border border-slate-200 overflow-hidden flex flex-col my-4 print:my-0 print:border-none print:shadow-none print:max-w-full">
        {/* Barra superior de acciones (Oculta al imprimir) */}
        <div className="flex flex-wrap items-center justify-between px-6 py-3.5 bg-slate-900 text-white gap-3 no-print">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-400">
              Vista de Presupuesto Formal
            </span>
            <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
              {budget.code}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-amber-500 hover:bg-amber-600 text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Guardar en PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="px-3.5 py-1.5 text-xs font-bold rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-xs"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
              title="Copiar texto formateado"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? '¡Copiado!' : 'Copiar texto'}</span>
            </button>

            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-semibold rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* HOJA DE PRESUPUESTO FORMAL (Imprimible) */}
        <div className="p-8 sm:p-12 bg-white print:p-0 text-slate-900 font-sans print-container">
          {/* Cabecera / Membrete */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-6 border-b-2 border-amber-500 gap-6">
            <div className="space-y-1 max-w-md">
              <h1 className="text-2xl font-black tracking-tight text-slate-950 uppercase flex items-center gap-2">
                <span>{companySettings.companyName || 'Maquinita'}</span>
              </h1>
              <p className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                Movimiento de Suelo • Excavaciones • Equipos Viales
              </p>
              <div className="text-xs text-slate-500 pt-1 space-y-0.5">
                {companySettings.ownerName && (
                  <p className="font-semibold text-slate-700">Resp: {companySettings.ownerName}</p>
                )}
                {companySettings.cuit && <p>CUIT: {companySettings.cuit}</p>}
                {companySettings.address && (
                  <p className="flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" /> {companySettings.address}
                  </p>
                )}
                <div className="flex items-center gap-3 pt-0.5">
                  {companySettings.phone && (
                    <span className="flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> {companySettings.phone}
                    </span>
                  )}
                  {companySettings.email && (
                    <span className="flex items-center gap-1">
                      <Mail className="w-3 h-3 text-slate-400" /> {companySettings.email}
                    </span>
                  )}
                </div>
              </div>
            </div>

            <div className="text-right sm:self-start bg-slate-50 sm:bg-transparent p-4 sm:p-0 rounded-xl w-full sm:w-auto">
              <span className="inline-block px-3 py-1 text-xs font-black uppercase tracking-wider bg-amber-100 text-amber-900 rounded-md mb-2">
                Presupuesto Oficial
              </span>
              <p className="text-xl font-mono font-extrabold text-slate-900">{budget.code}</p>
              <p className="text-xs text-slate-500 mt-1 flex items-center justify-end gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Fecha: <strong className="text-slate-700">{formatDate(budget.createdAt)}</strong>
              </p>
              <p className="text-xs text-slate-500">
                Validez: <strong className="text-slate-700">{budget.validityDays} días</strong>
              </p>
            </div>
          </div>

          {/* Bloque: Datos del Cliente y Obra */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-6">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Datos del Cliente
              </span>
              <p className="font-bold text-slate-900 text-sm">{budget.client.name || 'Cliente Particular'}</p>
              {budget.client.phone && (
                <p className="text-xs text-slate-600 mt-0.5">Tel: {budget.client.phone}</p>
              )}
              {budget.client.email && (
                <p className="text-xs text-slate-600">Email: {budget.client.email}</p>
              )}
              {budget.client.location && (
                <p className="text-xs text-slate-600 mt-0.5">Domicilio: {budget.client.location}</p>
              )}
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block mb-2">
                Lugar de Obra y Proyecto
              </span>
              <p className="font-bold text-slate-900 text-sm">
                {budget.project.title || getWorkTypeLabel(budget.project.type)}
              </p>
              <p className="text-xs text-slate-600 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                <span>{budget.project.location || 'A convenir / En sitio'}</span>
              </p>
              {budget.project.startDate && (
                <p className="text-xs text-slate-600 mt-0.5">
                  Fecha estimada de inicio: {formatDate(budget.project.startDate)}
                </p>
              )}
            </div>
          </div>

          {/* Ficha Técnica Volumétrica (Si existe cálculo de suelo) */}
          {budget.soilCalculation && budget.soilCalculation.bankVolumeM3 > 0 && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50/60 border border-amber-200/80">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-amber-200/60">
                <span className="text-xs font-bold text-amber-900 flex items-center gap-1.5 uppercase tracking-wide">
                  <Layers className="w-4 h-4 text-amber-600" />
                  Memoria de Cálculo de Suelo y Logística
                </span>
                <span className="text-xs font-semibold text-amber-800">
                  {getWorkTypeLabel(budget.soilCalculation.workType)}
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Área de trabajo:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {budget.soilCalculation.areaM2} m²
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Volumen en banco:</span>
                  <span className="font-extrabold text-slate-900 text-sm">
                    {budget.soilCalculation.bankVolumeM3} m³
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">
                    Volumen esponjado (+{budget.soilCalculation.customSwellPercent}%):
                  </span>
                  <span className="font-extrabold text-amber-800 text-sm">
                    {budget.soilCalculation.looseVolumeM3} m³
                  </span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Camiones calculados:</span>
                  <span className="font-extrabold text-slate-900 text-sm flex items-center gap-1">
                    <Truck className="w-3.5 h-3.5 text-amber-600" />
                    {budget.soilCalculation.truckTrips} viajes ({budget.soilCalculation.truckCapacityM3} m³)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Tabla de Trabajos, Maquinarias y Recursos */}
          <div className="overflow-hidden rounded-xl border border-slate-200 mb-6">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-2.5 px-3">#</th>
                  <th className="py-2.5 px-3">Descripción de Trabajos / Equipos</th>
                  <th className="py-2.5 px-3 text-center">Cant.</th>
                  <th className="py-2.5 px-3 text-center">Unidad</th>
                  <th className="py-2.5 px-3 text-right">Precio Unit.</th>
                  <th className="py-2.5 px-3 text-right">Subtotal</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {budget.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                    <td className="py-2.5 px-3 font-mono text-slate-400 text-center">{idx + 1}</td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-900">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-500 mt-0.5">{item.description}</p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-bold text-slate-800">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-500">{item.unit}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-slate-700">
                      {formatCurrency(item.unitPrice, companySettings.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-extrabold text-slate-900">
                      {formatCurrency(item.total, companySettings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Totales y Condiciones */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start break-inside-avoid">
            {/* Condiciones comerciales y bancarias */}
            <div className="sm:col-span-7 space-y-3">
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block mb-1">
                  Condiciones Comerciales y de Pago:
                </span>
                <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                  {budget.paymentTerms || '50% de anticipo al inicio de los trabajos, saldo contra certificación/finalización de obra.'}
                </p>
              </div>

              {companySettings.bankInfo && (
                <div className="p-3 rounded-xl bg-slate-50 border border-slate-200 text-xs flex items-start gap-2">
                  <Building className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-bold text-slate-800 text-[11px] block">
                      Datos para Transferencia / Cobranza:
                    </span>
                    <span className="text-slate-600 font-mono text-[11px]">
                      {companySettings.bankInfo}
                    </span>
                  </div>
                </div>
              )}

              {budget.generalNotes && (
                <p className="text-[11px] text-slate-500 italic">
                  * Nota: {budget.generalNotes}
                </p>
              )}
            </div>

            {/* Cuadro de Totales */}
            <div className="sm:col-span-5 bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2">
              <div className="flex justify-between text-xs text-slate-600">
                <span>Subtotal Trabajos y Recursos:</span>
                <span className="font-bold text-slate-900">
                  {formatCurrency(budget.subtotalItems, companySettings.currency)}
                </span>
              </div>

              {budget.discountAmount > 0 && (
                <div className="flex justify-between text-xs text-emerald-600">
                  <span>Bonificación / Descuento ({budget.discountPercent}%):</span>
                  <span className="font-bold">
                    -{formatCurrency(budget.discountAmount, companySettings.currency)}
                  </span>
                </div>
              )}

              {budget.includeTax && (
                <div className="flex justify-between text-xs text-slate-600">
                  <span>IVA ({budget.taxPercent}%):</span>
                  <span className="font-bold text-slate-900">
                    +{formatCurrency(budget.taxAmount, companySettings.currency)}
                  </span>
                </div>
              )}

              <div className="pt-2 border-t-2 border-slate-300 flex justify-between items-baseline">
                <div>
                  <span className="text-sm font-black uppercase tracking-tight text-slate-950 block">
                    TOTAL PRESUPUESTO
                  </span>
                  <span className="text-[10px] text-slate-500">Iva / Impuestos según detalle</span>
                </div>
                <span className="text-2xl font-black text-amber-600">
                  {formatCurrency(budget.total, companySettings.currency)}
                </span>
              </div>
            </div>
          </div>

          {/* Pie de página y firma */}
          <div className="mt-12 pt-6 border-t border-slate-200 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-400 gap-4 break-inside-avoid">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>Cotización respaldada por {companySettings.companyName || 'Maquinita'}</span>
            </div>
            <div className="w-48 text-center pt-8 border-t border-slate-300 text-[11px] text-slate-500">
              Firma y Aclaración
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
