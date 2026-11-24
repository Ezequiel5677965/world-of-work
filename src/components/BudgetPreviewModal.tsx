import React, { useState } from 'react';
import { 
  Printer, 
  Share2, 
  Copy, 
  X, 
  Edit3, 
  Check, 
  ShieldCheck,
  FileCheck2,
  HardHat
} from 'lucide-react';
import { Budget, CompanySettings } from '../types/budget';
import { formatCurrency, formatDate, calculateExpiryDate, generateWhatsAppMessage } from '../utils/formatters';
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

  const expiryDate = calculateExpiryDate(budget.createdAt, budget.validityDays);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/85 backdrop-blur-xs flex items-start justify-center p-2 sm:p-6 print:p-0 print:bg-white print:static print:z-auto">
      <div className="bg-white rounded-xl shadow-2xl max-w-4xl w-full border border-slate-300 flex flex-col my-2 sm:my-6 print:my-0 print:border-none print:shadow-none print:max-w-full">
        {/* Barra superior de herramientas (Sticky y siempre a mano) */}
        <div className="sticky top-0 z-30 flex flex-wrap items-center justify-between px-4 sm:px-6 py-3 bg-slate-900 text-white gap-3 border-b border-slate-800 shadow-md no-print rounded-t-xl">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-amber-500/20 text-amber-400 rounded-md">
              <FileCheck2 className="w-4 h-4" />
            </div>
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Cotización Comercial Oficial
              </span>
              <span className="text-[11px] font-mono text-slate-400">
                Documento Nº: <strong className="text-white">{budget.code}</strong>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={handlePrint}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-amber-500 hover:bg-amber-600 text-slate-950 flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Imprimir / Descargar PDF</span>
            </button>

            <button
              onClick={handleWhatsApp}
              className="px-3.5 py-1.5 text-xs font-bold rounded-md bg-emerald-600 hover:bg-emerald-700 text-white flex items-center gap-1.5 transition shadow-xs cursor-pointer"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>Enviar por WhatsApp</span>
            </button>

            <button
              onClick={handleCopyText}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
              title="Copiar texto resumen"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copiado' : 'Copiar'}</span>
            </button>

            <button
              onClick={onEdit}
              className="px-3 py-1.5 text-xs font-medium rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 flex items-center gap-1.5 transition cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Editar</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-md transition cursor-pointer ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* DOCUMENTO FORMAL IMPRIMIBLE (ESTILO MEMBRETE DE INGENIERÍA Y CONSTRUCCIÓN) */}
        <div className="p-8 sm:p-12 bg-white print:p-0 text-slate-900 font-sans print-container">
          
          {/* Filete superior institucional */}
          <div className="h-2 bg-gradient-to-r from-slate-900 via-slate-800 to-amber-600 mb-8 rounded-xs print:mb-6"></div>

          {/* CABECERA / MEMBRETE CORPORATIVO */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 pb-6 border-b-2 border-slate-900 items-start">
            {/* Identidad de la Empresa */}
            <div className="sm:col-span-7 space-y-1.5">
              <div className="flex items-center gap-2">
                <div className="w-9 h-9 rounded-lg bg-slate-900 text-amber-400 flex items-center justify-center font-black text-lg border border-slate-800">
                  <HardHat className="w-5 h-5" />
                </div>
                <div>
                  <h1 className="text-xl sm:text-2xl font-black tracking-tight text-slate-950 uppercase leading-none">
                    {companySettings.companyName || 'MAQUINITA & MOVIMIENTO DE SUELO'}
                  </h1>
                  <span className="text-[10px] font-bold text-amber-700 uppercase tracking-widest block mt-0.5">
                    Servicios de Ingeniería Vial • Excavaciones • Movimiento de Suelos
                  </span>
                </div>
              </div>

              {/* Ficha institucional de la empresa */}
              <div className="text-[11px] text-slate-600 pt-2 grid grid-cols-2 gap-x-4 gap-y-0.5 border-t border-slate-200 mt-2">
                {companySettings.ownerName && (
                  <p><span className="font-semibold text-slate-800">Titular/Resp:</span> {companySettings.ownerName}</p>
                )}
                {companySettings.cuit && (
                  <p><span className="font-semibold text-slate-800">CUIT:</span> {companySettings.cuit}</p>
                )}
                {companySettings.address && (
                  <p className="col-span-2"><span className="font-semibold text-slate-800">Base Operativa:</span> {companySettings.address}</p>
                )}
                {companySettings.phone && (
                  <p><span className="font-semibold text-slate-800">Tel/WhatsApp:</span> {companySettings.phone}</p>
                )}
                {companySettings.email && (
                  <p><span className="font-semibold text-slate-800">Email:</span> {companySettings.email}</p>
                )}
              </div>
            </div>

            {/* Cuadro Oficial de Presupuesto */}
            <div className="sm:col-span-5 border border-slate-300 rounded-lg overflow-hidden bg-slate-50/70">
              <div className="bg-slate-900 text-white text-center py-1 px-3">
                <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                  Presupuesto Comercial
                </span>
              </div>
              <div className="p-3 text-xs space-y-1.5 font-mono">
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-sans text-[11px]">Nº Documento:</span>
                  <span className="font-bold text-sm text-slate-900">{budget.code}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-sans text-[11px]">Fecha de Emisión:</span>
                  <span className="font-bold text-slate-800">{formatDate(budget.createdAt)}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-200 pb-1">
                  <span className="text-slate-500 font-sans text-[11px]">Validez de Oferta:</span>
                  <span className="font-bold text-slate-800">{budget.validityDays} días ({expiryDate})</span>
                </div>
                <div className="flex justify-between items-center pt-0.5">
                  <span className="text-slate-500 font-sans text-[11px]">Moneda:</span>
                  <span className="font-bold text-slate-800">Pesos Argentinos (ARS)</span>
                </div>
              </div>
            </div>
          </div>

          {/* CUADROS ESTRUCTURADOS: COMITENTE Y EMPLAZAMIENTO DE OBRA */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-5">
            {/* Datos del Cliente */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                  1. Datos del Comitente / Cliente
                </span>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="text-slate-900 font-bold text-sm">
                  {budget.client.name || 'Cliente Particular'}
                </p>
                {budget.client.phone && (
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Teléfono:</span> {budget.client.phone}
                  </p>
                )}
                {budget.client.email && (
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Correo:</span> {budget.client.email}
                  </p>
                )}
                {budget.client.location && (
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Domicilio:</span> {budget.client.location}
                  </p>
                )}
              </div>
            </div>

            {/* Datos de la Obra */}
            <div className="border border-slate-300 rounded-lg overflow-hidden">
              <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                  2. Emplazamiento y Objeto de los Trabajos
                </span>
              </div>
              <div className="p-3 text-xs space-y-1">
                <p className="text-slate-900 font-bold text-sm">
                  {budget.project.title || getWorkTypeLabel(budget.project.type)}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Ubicación de Obra:</span>{' '}
                  {budget.project.location || 'A convenir / En sitio del comitente'}
                </p>
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Tipo de Trabajo:</span>{' '}
                  {getWorkTypeLabel(budget.project.type)}
                </p>
                {budget.project.startDate && (
                  <p className="text-slate-600">
                    <span className="font-semibold text-slate-700">Inicio Previsto:</span>{' '}
                    {formatDate(budget.project.startDate)}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* MEMORIA TÉCNICA VOLUMÉTRICA (CÓMPUTO DE SUELO DE INGENIERÍA) */}
          {budget.soilCalculation && budget.soilCalculation.bankVolumeM3 > 0 && (
            <div className="border border-slate-300 rounded-lg overflow-hidden mb-5">
              <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5 flex justify-between items-center">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                  3. Memoria Técnica y Cómputo Volumétrico Estimado
                </span>
                <span className="text-[10px] font-bold text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                  Parámetros de Suelo
                </span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-5 divide-x divide-y sm:divide-y-0 divide-slate-200 text-center bg-white text-xs">
                <div className="p-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">Superficie</span>
                  <span className="font-bold text-slate-900 text-sm">{budget.soilCalculation.areaM2}</span>
                  <span className="text-[10px] text-slate-500 ml-0.5">m²</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">Cota / Espesor</span>
                  <span className="font-bold text-slate-900 text-sm">{budget.soilCalculation.depth}</span>
                  <span className="text-[10px] text-slate-500 ml-0.5">m</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">Vol. en Banco</span>
                  <span className="font-bold text-slate-900 text-sm">{budget.soilCalculation.bankVolumeM3}</span>
                  <span className="text-[10px] text-slate-500 ml-0.5">m³</span>
                </div>
                <div className="p-2.5">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">
                    Vol. Esponjado (+{budget.soilCalculation.customSwellPercent}%)
                  </span>
                  <span className="font-bold text-slate-900 text-sm">{budget.soilCalculation.looseVolumeM3}</span>
                  <span className="text-[10px] text-slate-500 ml-0.5">m³</span>
                </div>
                <div className="p-2.5 col-span-2 sm:col-span-1 bg-slate-50/70">
                  <span className="text-[10px] font-semibold text-slate-500 block uppercase">Plan Logístico</span>
                  <span className="font-extrabold text-slate-950 text-sm">{budget.soilCalculation.truckTrips}</span>
                  <span className="text-[10px] text-slate-600 block leading-tight">
                    viajes ({budget.soilCalculation.truckCapacityM3} m³)
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* PLANILLA DE CÓMPUTO Y PRESUPUESTO DETALLADA */}
          <div className="border border-slate-300 rounded-lg overflow-hidden mb-5">
            <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5">
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                4. Planilla de Trabajos, Maquinaria y Suministros
              </span>
            </div>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[10px] border-b border-slate-800">
                  <th className="py-2.5 px-3 w-12 text-center">Ítem</th>
                  <th className="py-2.5 px-3">Descripción de Tareas / Equipamiento</th>
                  <th className="py-2.5 px-3 text-center w-20">Cantidad</th>
                  <th className="py-2.5 px-3 text-center w-16">Unidad</th>
                  <th className="py-2.5 px-3 text-right w-32">Precio Unit. (ARS)</th>
                  <th className="py-2.5 px-3 text-right w-36">Subtotal Neto</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {budget.items.map((item, idx) => (
                  <tr key={item.id} className={idx % 2 === 0 ? 'bg-white' : 'bg-slate-50/60'}>
                    <td className="py-2.5 px-3 font-mono text-slate-500 text-center font-bold text-[11px]">
                      {String(idx + 1).padStart(2, '0')}
                    </td>
                    <td className="py-2.5 px-3">
                      <p className="font-bold text-slate-950 text-xs">{item.name}</p>
                      {item.description && (
                        <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">{item.description}</p>
                      )}
                    </td>
                    <td className="py-2.5 px-3 text-center font-mono font-bold text-slate-900">
                      {item.quantity}
                    </td>
                    <td className="py-2.5 px-3 text-center text-slate-600 font-medium text-[11px]">
                      {item.unit}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono text-slate-800">
                      {formatCurrency(item.unitPrice, companySettings.currency)}
                    </td>
                    <td className="py-2.5 px-3 text-right font-mono font-bold text-slate-950">
                      {formatCurrency(item.total, companySettings.currency)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* LIQUIDACIÓN ECONÓMICA Y CONDICIONES (CUADRO DE CIERRE) */}
          <div className="grid grid-cols-1 sm:grid-cols-12 gap-6 items-start break-inside-avoid">
            {/* Condiciones Comerciales, Plazos y Operatoria */}
            <div className="sm:col-span-7 space-y-3">
              <div className="border border-slate-300 rounded-lg overflow-hidden">
                <div className="bg-slate-100/90 border-b border-slate-200 px-3 py-1.5">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-700">
                    5. Condiciones Comerciales y Protocolo de Ejecución
                  </span>
                </div>
                <div className="p-3 text-xs space-y-2 text-slate-700 leading-relaxed">
                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">a) Forma de Pago:</span>
                    <p className="text-slate-600 text-[11px]">
                      {budget.paymentTerms || '50% de anticipo para reserva y movilización de equipos; 50% restante contra certificación de fin de obra.'}
                    </p>
                  </div>

                  <div>
                    <span className="font-bold text-slate-900 block text-[11px]">b) Disponibilidad Técnica y Clima:</span>
                    <p className="text-slate-600 text-[11px]">
                      El inicio de las actividades queda condicionado a la disponibilidad de equipos en la fecha pautada y a condiciones climáticas favorables que permitan la transitabilidad y compactación del suelo.
                    </p>
                  </div>

                  {companySettings.bankInfo && (
                    <div className="pt-1.5 border-t border-slate-200">
                      <span className="font-bold text-slate-900 block text-[11px]">c) Datos para Transferencia Bancaria:</span>
                      <p className="font-mono text-slate-800 text-[11px] bg-slate-50 p-1.5 rounded border border-slate-200 mt-0.5">
                        {companySettings.bankInfo}
                      </p>
                    </div>
                  )}

                  {budget.generalNotes && (
                    <div className="pt-1 border-t border-slate-200 text-[11px] text-slate-500 italic">
                      * Observaciones: {budget.generalNotes}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Cuadro Financiero de Cierre (Balance de Totales) */}
            <div className="sm:col-span-5 border-2 border-slate-900 rounded-lg overflow-hidden bg-slate-50/70">
              <div className="bg-slate-900 text-white px-3 py-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-400">
                  Liquidación Económica Final
                </span>
              </div>
              <div className="p-4 space-y-2 text-xs font-mono">
                <div className="flex justify-between items-center text-slate-600">
                  <span className="font-sans text-[11px]">Subtotal Trabajos y Equipos:</span>
                  <span className="font-bold text-slate-900">
                    {formatCurrency(budget.subtotalItems, companySettings.currency)}
                  </span>
                </div>

                {budget.discountAmount > 0 && (
                  <div className="flex justify-between items-center text-emerald-700">
                    <span className="font-sans text-[11px]">Bonificación Comercial ({budget.discountPercent}%):</span>
                    <span className="font-bold">
                      -{formatCurrency(budget.discountAmount, companySettings.currency)}
                    </span>
                  </div>
                )}

                {budget.includeTax && (
                  <div className="flex justify-between items-center text-slate-600">
                    <span className="font-sans text-[11px]">I.V.A. ({budget.taxPercent}%):</span>
                    <span className="font-bold text-slate-900">
                      +{formatCurrency(budget.taxAmount, companySettings.currency)}
                    </span>
                  </div>
                )}

                {/* Gran Total */}
                <div className="pt-3 border-t-2 border-slate-900 mt-2">
                  <span className="text-[10px] font-sans font-extrabold uppercase tracking-wider text-slate-500 block">
                    Total General de la Propuesta
                  </span>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-[11px] font-sans font-semibold text-slate-600">Total Final ARS:</span>
                    <span className="text-2xl font-black text-slate-950 tracking-tight">
                      {formatCurrency(budget.total, companySettings.currency)}
                    </span>
                  </div>
                  <p className="text-[9px] font-sans text-slate-400 mt-1">
                    * Precios válidos por {budget.validityDays} días corridos desde su emisión.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* FIRMAS Y CONFORMIDAD INSTITUCIONAL */}
          <div className="mt-14 pt-6 border-t border-slate-300 grid grid-cols-2 gap-12 text-xs break-inside-avoid">
            <div className="text-center">
              <div className="h-12 border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-900 uppercase text-[11px]">Por la Empresa Contratista</p>
              <p className="text-[10px] text-slate-500">{companySettings.ownerName || 'Responsable Técnico / Comercial'}</p>
              <p className="text-[10px] text-slate-400">{companySettings.companyName || 'Movimiento de Suelo'}</p>
            </div>

            <div className="text-center">
              <div className="h-12 border-b border-slate-400 mb-2"></div>
              <p className="font-bold text-slate-900 uppercase text-[11px]">Aceptación y Conformidad del Comitente</p>
              <p className="text-[10px] text-slate-500">Firma, Aclaración y DNI / CUIT</p>
              <p className="text-[10px] text-slate-400">Fecha de Aprobación: _____ / _____ / 202___</p>
            </div>
          </div>

          {/* Pie de página de documento */}
          <div className="mt-8 pt-3 border-t border-slate-200 flex justify-between items-center text-[10px] text-slate-400 font-mono break-inside-avoid">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-sans">Documento oficial emitido bajo normas y especificaciones de obra vial</span>
            </div>
            <span>Página 1 de 1 • Ref: {budget.code}</span>
          </div>

        </div>
      </div>
    </div>
  );
};
