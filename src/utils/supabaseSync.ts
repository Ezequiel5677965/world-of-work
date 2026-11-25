import { supabase } from './supabaseClient';
import { Budget } from '../types/budget';
import { getSavedBudgets, getActiveUserKey, getUserIdentifier } from './storage';

function budgetToRow(b: Budget, userId?: string) {
  const finalUserId = b.userId || userId || getUserIdentifier();
  return {
    id: b.id,
    user_id: finalUserId,
    code: b.code,
    created_at: b.createdAt,
    client: b.client,
    project: b.project,
    soil_calculation: b.soilCalculation,
    items: b.items,
    subtotal_items: b.subtotalItems,
    margin_percent: b.marginPercent,
    margin_amount: b.marginAmount,
    subtotal_with_margin: b.subtotalWithMargin,
    include_tax: b.includeTax,
    tax_percent: b.taxPercent,
    tax_amount: b.taxAmount,
    discount_percent: b.discountPercent,
    discount_amount: b.discountAmount,
    total: b.total,
    payment_terms: b.paymentTerms,
    validity_days: b.validityDays,
    status: b.status,
    general_notes: b.generalNotes || '',
    updated_at: new Date().toISOString()
  };
}

function rowToBudget(r: any): Budget {
  return {
    id: r.id,
    userId: r.user_id,
    code: r.code,
    createdAt: r.created_at,
    client: r.client || { name: '', phone: '', location: '' },
    project: r.project || { title: '', location: '', type: 'desmonte_nivelacion' },
    soilCalculation: r.soil_calculation,
    items: r.items || [],
    subtotalItems: Number(r.subtotal_items || 0),
    marginPercent: Number(r.margin_percent || 20),
    marginAmount: Number(r.margin_amount || 0),
    subtotalWithMargin: Number(r.subtotal_with_margin || 0),
    includeTax: Boolean(r.include_tax),
    taxPercent: Number(r.tax_percent || 21),
    taxAmount: Number(r.tax_amount || 0),
    discountPercent: Number(r.discount_percent || 0),
    discountAmount: Number(r.discount_amount || 0),
    total: Number(r.total || 0),
    paymentTerms: r.payment_terms || '',
    validityDays: Number(r.validity_days || 15),
    status: r.status || 'borrador',
    generalNotes: r.general_notes || ''
  };
}

// Subir o actualizar presupuesto en la nube (con user_id obligatorio)
export async function syncBudgetToRemote(budget: Budget, userId?: string): Promise<boolean> {
  try {
    const row = budgetToRow(budget, userId);
    const { error } = await supabase
      .from('budgets')
      .upsert(row, { onConflict: 'id' });

    if (error) {
      console.warn('Error guardando en Supabase (se mantendrá local):', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción al conectar con Supabase:', err);
    return false;
  }
}

// Eliminar presupuesto en la nube (respetando aislamiento de usuario)
export async function deleteBudgetFromRemote(budgetId: string, userId?: string): Promise<boolean> {
  try {
    const targetUserId = userId || getUserIdentifier();
    let query = supabase.from('budgets').delete().eq('id', budgetId);
    if (targetUserId && targetUserId !== 'general') {
      query = query.eq('user_id', targetUserId);
    }

    const { error } = await query;
    if (error) {
      console.warn('Error eliminando en Supabase:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Excepción al eliminar en Supabase:', err);
    return false;
  }
}

// Descargar ÚNICAMENTE los presupuestos pertenecientes al usuario actual
export async function fetchRemoteBudgets(userId?: string): Promise<Budget[] | null> {
  try {
    const targetUserId = userId || getUserIdentifier();
    if (!targetUserId || targetUserId === 'guest') {
      return [];
    }

    // Aislamiento estricto: solo consultar los registros del usuario actual
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', targetUserId)
      .order('created_at', { ascending: false });

    if (error) {
      console.warn('Error trayendo presupuestos de Supabase:', error.message);
      return null;
    }

    if (!data) return [];
    return data.map(rowToBudget);
  } catch (err) {
    console.warn('Fallo al conectar con Supabase:', err);
    return null;
  }
}

// Sincronización completa bidireccional aislada por usuario (Offline-First)
export async function syncAllBudgets(userId?: string): Promise<{ success: boolean; count: number }> {
  try {
    const targetUserId = userId || getUserIdentifier();
    if (!targetUserId || targetUserId === 'guest') {
      return { success: true, count: 0 };
    }

    const localBudgets = getSavedBudgets(targetUserId);
    const remoteBudgets = await fetchRemoteBudgets(targetUserId);

    if (remoteBudgets === null) {
      return { success: false, count: localBudgets.length };
    }

    // Mapa por ID exclusivo de este usuario
    const mergedMap = new Map<string, Budget>();

    // 1. Agregar locales del usuario
    localBudgets.forEach(b => mergedMap.set(b.id, b));

    // 2. Fusionar remotos del usuario
    remoteBudgets.forEach(remote => {
      mergedMap.set(remote.id, remote);
    });

    // 3. Subir los locales del usuario que no estaban en la nube
    for (const local of localBudgets) {
      const existsInRemote = remoteBudgets.some(r => r.id === local.id);
      if (!existsInRemote) {
        await syncBudgetToRemote(local, targetUserId);
      }
    }

    const mergedList = Array.from(mergedMap.values());
    mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Guardar en el almacenamiento local exclusivo de este usuario
    const userKey = getActiveUserKey(targetUserId);
    localStorage.setItem(`wow_budgets_${userKey}`, JSON.stringify(mergedList));

    return { success: true, count: mergedList.length };
  } catch (err) {
    console.warn('Error en sincronización aislada:', err);
    return { success: false, count: 0 };
  }
}
