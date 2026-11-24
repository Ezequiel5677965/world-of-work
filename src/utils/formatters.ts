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
    return '15 dias';
  }
}

export function generateWhatsAppMessage(budget: Budget, companyName: string): string {
  const lineItemsText = budget.items
    .map((item, idx) => `  ${idx + 1}) ${item.name} (${item.quantity} ${item.unit}): ${formatCurrency(item.total)}`)
    .join('\n');

  const expiry = calculateExpiryDate(budget.createdAt, budget.validityDays);

  const message = `*PRESUPUESTO - ${companyName || 'MOVIMIENTO DE SUELO'}*
---------------------------------------------
*Presupuesto Nº:* ${budget.code}
*Fecha:* ${formatDate(budget.createdAt)}
*Validez:* ${budget.validityDays} dias (hasta ${expiry})

*Cliente:* ${budget.client.name || 'Particular'}
*Obra:* ${budget.project.location || 'En obra'}
*Trabajo:* ${budget.project.title || 'Movimiento de Suelo'}
---------------------------------------------
*DETALLE DE TRABAJOS Y EQUIPOS:*
${lineItemsText || '  (Sin items cargados)'}
---------------------------------------------
*TOTAL A PAGAR: ${formatCurrency(budget.total)}*
---------------------------------------------
*Forma de Pago:* ${budget.paymentTerms || '50% de anticipo al inicio, saldo al finalizar los trabajos.'}
${budget.generalNotes ? `*Observaciones:* ${budget.generalNotes}\n` : ''}
Quedamos a disposicion para coordinar el inicio de los trabajos.`;

  return encodeURIComponent(message);
}
