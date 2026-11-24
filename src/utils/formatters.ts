import { Budget } from '../types/budget';

export function formatCurrency(amount: number, currency: string = '$'): string {
  if (isNaN(amount)) return `${currency} 0`;
  const formatted = new Intl.NumberFormat('es-AR', {
    minimumFractionDigits: 0,
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

export function generateWhatsAppMessage(budget: Budget, companyName: string): string {
  const lineItemsText = budget.items
    .map(item => `  • ${item.name} (${item.quantity} ${item.unit}): ${formatCurrency(item.total)}`)
    .join('\n');

  let soilSummary = '';
  if (budget.soilCalculation && budget.soilCalculation.bankVolumeM3 > 0) {
    const sc = budget.soilCalculation;
    soilSummary = `\n🚜 *Estimación de Suelo:*
  • Volumen excavado/base: ${sc.bankVolumeM3} m³
  • Volumen esponjado: ${sc.looseVolumeM3} m³
  • Viajes de camión est.: ${sc.truckTrips} viajes (${sc.truckCapacityM3} m³/viaje)\n`;
  }

  const message = `*PRESUPUESTO - ${companyName}*
📄 *Nº:* ${budget.code}
📅 *Fecha:* ${formatDate(budget.createdAt)}
👤 *Cliente:* ${budget.client.name}
📍 *Obra:* ${budget.project.location || budget.project.title || 'Según lo conversado'}
${soilSummary}
📋 *Detalle de Trabajos y Recursos:*
${lineItemsText}

💰 *TOTAL: ${formatCurrency(budget.total)}*
⏳ *Validez:* ${budget.validityDays} días.
📌 *Condiciones:* ${budget.paymentTerms || 'A convenir.'}

_Quedamos a tu entera disposición por cualquier consulta para coordinar el inicio._`;

  return encodeURIComponent(message);
}
