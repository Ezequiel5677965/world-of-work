export type SoilType = 'tierra_negra' | 'tosca_arcillosa' | 'suelo_seleccionado' | 'roca_escombros' | 'arena';

export interface SoilTypeInfo {
  id: SoilType;
  name: string;
  swellFactor: number; // e.g. 1.25 (+25% volume when excavated)
  description: string;
}

export type WorkType = 
  | 'desmonte_nivelacion' 
  | 'excavacion_pileta' 
  | 'zanja_cimientos' 
  | 'relleno_compactacion' 
  | 'limpieza_desmalezado';

export interface SoilCalculation {
  workType: WorkType;
  length: number; // metros
  width: number; // metros
  depth: number; // metros
  diameter?: number; // para pozos circulares
  shape: 'rectangular' | 'circular' | 'direct_m2';
  directArea?: number; // si ya sabe los m²
  soilType: SoilType;
  customSwellPercent: number; // % ej: 25
  truckCapacityM3: number; // ej: 6m³ (chasis simple), 8m³ (chasis doble), 18m³ (batea)
  // Valores calculados
  areaM2: number;
  bankVolumeM3: number; // Volumen en banco (compacto)
  looseVolumeM3: number; // Volumen esponjado (suelto para transporte)
  truckTrips: number; // Cantidad de viajes de camión
  estimatedHoursBobcat?: number; // Compatibilidad retroactiva
  estimatedHoursMini: number; // Estimación horas minicargadora
  estimatedHoursRetro: number; // Estimación horas retroexcavadora
}

export type ItemCategory = 'maquinaria' | 'material' | 'transporte' | 'mano_de_obra' | 'personalizado';

export interface BudgetItem {
  id: string;
  category: ItemCategory;
  name: string;
  description?: string;
  quantity: number;
  unit: 'hs' | 'días' | 'm³' | 'viajes' | 'm²' | 'flete' | 'global' | 'un';
  unitPrice: number; // Costo unitario
  total: number;
}

export interface CompanySettings {
  companyName: string;
  ownerName: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  cuit: string;
  bankInfo: string;
  currency: string; // ej: "$"
  defaultMargin: number; // ej: 25 (%)
  defaultValidityDays: number; // ej: 15
}

export interface PriceCatalogItem {
  id: string;
  category: ItemCategory;
  name: string;
  unit: BudgetItem['unit'];
  defaultPrice: number;
  description: string;
}

export interface ClientData {
  name: string;
  phone: string;
  email?: string;
  location: string;
  notes?: string;
}

export interface ProjectData {
  title: string;
  location: string;
  type: WorkType;
  estimatedDays?: number;
  startDate?: string;
}

export type BudgetStatus = 'borrador' | 'enviado' | 'aprobado' | 'rechazado';

export interface Budget {
  id: string;
  code: string; // ej: "MS-2026-001"
  createdAt: string;
  client: ClientData;
  project: ProjectData;
  soilCalculation?: SoilCalculation;
  items: BudgetItem[];
  subtotalItems: number;
  marginPercent: number; // Ganancia/imprevistos comercial
  marginAmount: number;
  subtotalWithMargin: number;
  includeTax: boolean;
  taxPercent: number; // IVA ej 21%
  taxAmount: number;
  discountPercent: number; // Descuento opcional
  discountAmount: number;
  total: number;
  paymentTerms: string;
  validityDays: number;
  status: BudgetStatus;
  generalNotes?: string;
}
