import { Budget, CompanySettings, PriceCatalogItem } from '../types/budget';
import { DEFAULT_CATALOG, DEFAULT_COMPANY_SETTINGS } from '../data/defaultCatalog';
import { syncBudgetToRemote, deleteBudgetFromRemote } from './supabaseSync';

const STORAGE_KEYS = {
  BUDGETS: 'maquinita_budgets_v1',
  SETTINGS: 'maquinita_settings_v1',
  CATALOG: 'maquinita_catalog_v1',
  CURRENT_DRAFT: 'maquinita_current_draft_v1',
};

// --- Presupuestos ---
export function getSavedBudgets(): Budget[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.BUDGETS);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error cargando presupuestos de localStorage', e);
    return [];
  }
}

export function saveBudget(budget: Budget): void {
  try {
    const list = getSavedBudgets();
    const index = list.findIndex(b => b.id === budget.id);
    if (index >= 0) {
      list[index] = budget;
    } else {
      list.unshift(budget); // nuevo al principio
    }
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(list));

    // Sincronización transparente con Supabase en segundo plano
    syncBudgetToRemote(budget).catch(() => {});
  } catch (e) {
    console.error('Error guardando presupuesto', e);
  }
}

export function deleteBudget(id: string): void {
  try {
    const list = getSavedBudgets().filter(b => b.id !== id);
    localStorage.setItem(STORAGE_KEYS.BUDGETS, JSON.stringify(list));

    // Eliminar en Supabase en segundo plano
    deleteBudgetFromRemote(id).catch(() => {});
  } catch (e) {
    console.error('Error eliminando presupuesto', e);
  }
}

// --- Configuración de Empresa ---
export function getCompanySettings(): CompanySettings {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.SETTINGS);
    if (!raw) return DEFAULT_COMPANY_SETTINGS;
    return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export function saveCompanySettings(settings: CompanySettings): void {
  try {
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));
  } catch (e) {
    console.error('Error guardando configuración', e);
  }
}

// --- Catálogo de Precios ---
export function getPriceCatalog(): PriceCatalogItem[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEYS.CATALOG);
    if (!raw) return DEFAULT_CATALOG;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATALOG;
  } catch (e) {
    return DEFAULT_CATALOG;
  }
}

export function savePriceCatalog(catalog: PriceCatalogItem[]): void {
  try {
    localStorage.setItem(STORAGE_KEYS.CATALOG, JSON.stringify(catalog));
  } catch (e) {
    console.error('Error guardando catálogo', e);
  }
}

// Generador de número de presupuesto consecutivo
export function generateNextBudgetCode(existingBudgets: Budget[]): string {
  const year = new Date().getFullYear();
  const countThisYear = existingBudgets.filter(b => b.code?.includes(`${year}`)).length + 1;
  const padded = String(countThisYear).padStart(3, '0');
  return `MS-${year}-${padded}`;
}
