import { supabase } from './supabaseClient';
import { Budget, CompanySettings, PriceCatalogItem } from '../types/budget';
import { getSavedBudgets, saveBudget } from './storage';

function budgetToRow(b: Budget) {
  return {
    id: b.id,
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

// Subir o actualizar presupuesto en la nube
export async function syncBudgetToRemote(budget: Budget): Promise<boolean> {
  try {
    const row = budgetToRow(budget);
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

// Eliminar presupuesto en la nube
export async function deleteBudgetFromRemote(budgetId: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', budgetId);

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

// Descargar todos los presupuestos de la nube y fusionar con los locales
export async function fetchRemoteBudgets(): Promise<Budget[] | null> {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select('*')
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

// Sincronización completa bidireccional (Offline-First)
export async function syncAllBudgets(): Promise<{ success: boolean; count: number }> {
  try {
    const localBudgets = getSavedBudgets();
    const remoteBudgets = await fetchRemoteBudgets();

    if (remoteBudgets === null) {
      return { success: false, count: localBudgets.length };
    }

    // Mapa por ID
    const mergedMap = new Map<string, Budget>();

    // 1. Agregar locales
    localBudgets.forEach(b => mergedMap.set(b.id, b));

    // 2. Fusionar remotos
    remoteBudgets.forEach(remote => {
      mergedMap.set(remote.id, remote);
    });

    // 3. Subir los locales que no estaban en la nube
    for (const local of localBudgets) {
      const existsInRemote = remoteBudgets.some(r => r.id === local.id);
      if (!existsInRemote) {
        await syncBudgetToRemote(local);
      }
    }

    const mergedList = Array.from(mergedMap.values());
    mergedList.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    // Guardar en localStorage
    localStorage.setItem('maquinita_budgets_v1', JSON.stringify(mergedList));

    return { success: true, count: mergedList.length };
  } catch (e) {
    console.error('Error en sincronización general:', e);
    return { success: false, count: 0 };
  }
}

// Comprobar estado de conexión con Supabase
export async function checkSupabaseConnection(): Promise<boolean> {
  try {
    const { error } = await supabase.from('budgets').select('id').limit(1);
    return !error;
  } catch {
    return false;
  }
}
