import { Budget } from '../types/budget';

export function formatCurrency(amount: number, currency: string = '$'): string {
  if (isNaN(amount)) return `${currency} 0,00`;
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
  return `${currency} ${formatted}`;
}

export function formatDate(dateString: string): string {
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return dateString;
  }
}

export function calculateExpiryDate(dateString: string, validityDays: number): string {
  try {
    const date = new Date(dateString);
    date.setDate(date.getDate() + (validityDays || 15));
    return date.toLocaleDateString('es-AR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  } catch {
    return '15 días posteriores';
  }
}

export function generateWhatsAppMessage(budget: Budget, companyName: string): string {
  const lineItemsText = budget.items
    .map((item, idx) => `  ${idx + 1}. ${item.name} (${item.quantity} ${item.unit}) -> ${formatCurrency(item.total)}`)
    .join('\n');

  let soilSummary = '';
  if (budget.soilCalculation && budget.soilCalculation.bankVolumeM3 > 0) {
    const sc = budget.soilCalculation;
    soilSummary = `\n📐 *MEMORIA TÉCNICA:*
  • Área de intervención: ${sc.areaM2} m²
  • Volumen en banco: ${sc.bankVolumeM3} m³
  • Volumen esponjado (+${sc.customSwellPercent}%): ${sc.looseVolumeM3} m³
  • Logística estimada: ${sc.truckTrips} viajes de camión (${sc.truckCapacityM3} m³/viaje)\n`;
  }

  const message = `*COTIZACIÓN COMERCIAL - ${companyName}*
📄 *Presupuesto Nº:* ${budget.code}
📅 *Fecha de Emisión:* ${formatDate(budget.createdAt)}
⏳ *Validez:* ${budget.validityDays} días corridos (hasta ${calculateExpiryDate(budget.createdAt, budget.validityDays)})

👤 *Comitente / Cliente:* ${budget.client.name}
📍 *Emplazamiento de Obra:* ${budget.project.location || budget.project.title || 'Según lo conversado'}
${soilSummary}
📋 *Planilla de Trabajos y Equipamiento:*
${lineItemsText}

💵 *TOTAL GENERAL: ${formatCurrency(budget.total)}*
📌 *Condiciones:* ${budget.paymentTerms || '50% anticipo al inicio, saldo contra finalización.'}

_Propuesta formal sujeta a confirmación técnica de equipos y transitabilidad climática._`;

  return encodeURIComponent(message);
}
