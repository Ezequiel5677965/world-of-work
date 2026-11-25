import { Budget, CompanySettings, PriceCatalogItem } from '../types/budget';
import { DEFAULT_CATALOG, DEFAULT_COMPANY_SETTINGS } from '../data/defaultCatalog';
import { syncBudgetToRemote, deleteBudgetFromRemote } from './supabaseSync';
import { getCurrentSession } from './auth';

export function getActiveUserKey(userId?: string): string {
  if (userId && userId.trim()) {
    return userId.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
  }
  const session = getCurrentSession();
  if (session) {
    const id = session.id || session.email || session.username;
    if (id && id.trim()) {
      return id.toLowerCase().trim().replace(/[^a-z0-9_-]/g, '_');
    }
  }
  return 'guest';
}

export function getUserIdentifier(userId?: string): string {
  if (userId && userId.trim()) {
    return userId.trim().toLowerCase();
  }
  const session = getCurrentSession();
  if (session) {
    return (session.email || session.username || session.id || 'general').trim().toLowerCase();
  }
  return 'general';
}

// --- Presupuestos Aislados por Usuario ---
export function getSavedBudgets(userId?: string): Budget[] {
  try {
    const userKey = getActiveUserKey(userId);
    const storageKey = `wow_budgets_${userKey}`;
    const raw = localStorage.getItem(storageKey);
    if (!raw) return [];
    const list: Budget[] = JSON.parse(raw);
    return Array.isArray(list) ? list : [];
  } catch (e) {
    console.error('Error cargando presupuestos de localStorage', e);
    return [];
  }
}

export function saveBudget(budget: Budget, userId?: string): void {
  try {
    const userIdentifier = getUserIdentifier(userId);
    const userKey = getActiveUserKey(userId);
    const storageKey = `wow_budgets_${userKey}`;

    // Asegurar que el presupuesto lleve el identificador del usuario propietario
    budget.userId = budget.userId || userIdentifier;

    const list = getSavedBudgets(userKey);
    const index = list.findIndex(b => b.id === budget.id);
    if (index >= 0) {
      list[index] = budget;
    } else {
      list.unshift(budget); // nuevo al principio
    }
    localStorage.setItem(storageKey, JSON.stringify(list));

    // Sincronización transparente con Supabase para este usuario
    syncBudgetToRemote(budget, userIdentifier).catch(() => {});
  } catch (e) {
    console.error('Error guardando presupuesto', e);
  }
}

export function deleteBudget(id: string, userId?: string): void {
  try {
    const userIdentifier = getUserIdentifier(userId);
    const userKey = getActiveUserKey(userId);
    const storageKey = `wow_budgets_${userKey}`;

    const list = getSavedBudgets(userKey).filter(b => b.id !== id);
    localStorage.setItem(storageKey, JSON.stringify(list));

    // Eliminar en Supabase en segundo plano con aislamiento
    deleteBudgetFromRemote(id, userIdentifier).catch(() => {});
  } catch (e) {
    console.error('Error eliminando presupuesto', e);
  }
}

// --- Configuración de Empresa Aislada por Usuario ---
export function getCompanySettings(userId?: string): CompanySettings {
  try {
    const userKey = getActiveUserKey(userId);
    const raw = localStorage.getItem(`wow_settings_${userKey}`);
    if (!raw) return DEFAULT_COMPANY_SETTINGS;
    return { ...DEFAULT_COMPANY_SETTINGS, ...JSON.parse(raw) };
  } catch (e) {
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export function saveCompanySettings(settings: CompanySettings, userId?: string): void {
  try {
    const userKey = getActiveUserKey(userId);
    localStorage.setItem(`wow_settings_${userKey}`, JSON.stringify(settings));
  } catch (e) {
    console.error('Error guardando configuración', e);
  }
}

// --- Catálogo de Precios Aislado por Usuario ---
export function getPriceCatalog(userId?: string): PriceCatalogItem[] {
  try {
    const userKey = getActiveUserKey(userId);
    const raw = localStorage.getItem(`wow_catalog_${userKey}`);
    if (!raw) return DEFAULT_CATALOG;
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATALOG;
  } catch (e) {
    return DEFAULT_CATALOG;
  }
}

export function savePriceCatalog(catalog: PriceCatalogItem[], userId?: string): void {
  try {
    const userKey = getActiveUserKey(userId);
    localStorage.setItem(`wow_catalog_${userKey}`, JSON.stringify(catalog));
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
