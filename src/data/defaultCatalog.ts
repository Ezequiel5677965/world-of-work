import { PriceCatalogItem, SoilTypeInfo, CompanySettings } from '../types/budget';

export const SOIL_TYPES: SoilTypeInfo[] = [
  {
    id: 'tierra_negra',
    name: 'Tierra Negra / Vegetal',
    swellFactor: 1.25,
    description: 'Suelo superficial orgánico. Esponjamiento típico ~25%.'
  },
  {
    id: 'tosca_arcillosa',
    name: 'Tosca / Suelo Arcilloso',
    swellFactor: 1.20,
    description: 'Suelo firme y duro. Esponjamiento típico ~20%.'
  },
  {
    id: 'suelo_seleccionado',
    name: 'Suelo Seleccionado / Relleno',
    swellFactor: 1.18,
    description: 'Material para base compactada. Esponjamiento ~18%.'
  },
  {
    id: 'arena',
    name: 'Arena / Suelo Arenoso',
    swellFactor: 1.15,
    description: 'Suelo disgregable. Esponjamiento ~15%.'
  },
  {
    id: 'roca_escombros',
    name: 'Escombros / Suelo pedregoso',
    swellFactor: 1.40,
    description: 'Demoliciones y escombros. Esponjamiento alto ~40%.'
  }
];

export const DEFAULT_CATALOG: PriceCatalogItem[] = [
  // MAQUINARIA
  {
    id: 'mini_cargadora',
    category: 'maquinaria',
    name: 'Minicargadora frontal (por hora)',
    unit: 'hs',
    defaultPrice: 38000,
    description: 'Nivelación ágil, espacios reducidos, desparrame de tierra y tosca.'
  },
  {
    id: 'retro_pala',
    category: 'maquinaria',
    name: 'Retroexcavadora / Pala Mixta (por hora)',
    unit: 'hs',
    defaultPrice: 55000,
    description: 'Ideal para zanjeos profundos, excavaciones de piscinas y cargado masivo.'
  },
  {
    id: 'pala_frontal',
    category: 'maquinaria',
    name: 'Pala Cargadora Frontal grande (por hora)',
    unit: 'hs',
    defaultPrice: 75000,
    description: 'Movimientos de gran envergadura y carga rápida de bateas.'
  },
  {
    id: 'rodillo_compactador',
    category: 'maquinaria',
    name: 'Rodillo Compactador vibratorio (por jornada)',
    unit: 'días',
    defaultPrice: 180000,
    description: 'Compactación estructural de suelo y tosca bajo control de densidad.'
  },
  {
    id: 'motoniveladora',
    category: 'maquinaria',
    name: 'Motoniveladora (por hora)',
    unit: 'hs',
    defaultPrice: 85000,
    description: 'Perfilado de calles, caminos y grandes plateas.'
  },

  // TRANSPORTE & LOGÍSTICA
  {
    id: 'flete_carreton',
    category: 'transporte',
    name: 'Flete Carretón (Traslado de maquinaria ida y vuelta)',
    unit: 'flete',
    defaultPrice: 120000,
    description: 'Logística de traslado de equipos hasta la obra.'
  },
  {
    id: 'camion_retiro_6m3',
    category: 'transporte',
    name: 'Retiro de suelo en Camión Volcador (6 m³)',
    unit: 'viajes',
    defaultPrice: 65000,
    description: 'Carga, transporte y descarga en predio de vuelco autorizado.'
  },
  {
    id: 'camion_retiro_batea_18m3',
    category: 'transporte',
    name: 'Retiro en Semirremolque Batea (18 m³)',
    unit: 'viajes',
    defaultPrice: 155000,
    description: 'Retiro de gran volumen para obras medianas y grandes.'
  },

  // MATERIALES & ÁRIDOS
  {
    id: 'tosca_camion',
    category: 'material',
    name: 'Tosca de primera para relleno (por m³ puesto en obra)',
    unit: 'm³',
    defaultPrice: 16500,
    description: 'Tosca limpia de cantera ideal para compactación de plateas.'
  },
  {
    id: 'tierra_negra_m3',
    category: 'material',
    name: 'Tierra Negra zarandeada / jardín (por m³)',
    unit: 'm³',
    defaultPrice: 22000,
    description: 'Tierra fértil para terminaciones y parquización.'
  },
  {
    id: 'estabilizado_granular',
    category: 'material',
    name: 'Estabilizado Granular / Dolomita (por m³)',
    unit: 'm³',
    defaultPrice: 28000,
    description: 'Capa final para caminos y accesos vehiculares firmes.'
  },

  // MANO DE OBRA Y SERVICIOS
  {
    id: 'jornada_operador',
    category: 'mano_de_obra',
    name: 'Jornada Operador Especializado',
    unit: 'días',
    defaultPrice: 45000,
    description: 'Mano de obra calificada en movimiento de suelo.'
  },
  {
    id: 'replanteo_altimetrico',
    category: 'mano_de_obra',
    name: 'Nivelación con Nivel Láser y Replanteo',
    unit: 'global',
    defaultPrice: 80000,
    description: 'Medición de cotas, desniveles y estacado de pendientes.'
  }
];

export const DEFAULT_COMPANY_SETTINGS: CompanySettings = {
  companyName: 'World of Work',
  ownerName: 'Ezequiel',
  phone: '11 5555-5555',
  email: 'contacto@worldofwork.com',
  address: 'Ruta / Base Operativa',
  city: 'Buenos Aires',
  cuit: '20-XXXXXXXX-X',
  bankInfo: 'Alias: worldofwork.suelo / CBU: 00000031000...',
  currency: '$',
  defaultMargin: 20, // 20% margen ganancia
  defaultValidityDays: 15
};
