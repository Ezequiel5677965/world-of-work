import { SoilCalculation, SoilType, WorkType } from '../types/budget';
import { SOIL_TYPES } from '../data/defaultCatalog';

export function calculateSoilVolume(params: {
  workType: WorkType;
  shape: 'rectangular' | 'circular' | 'direct_m2';
  length: number;
  width: number;
  depth: number;
  diameter?: number;
  directArea?: number;
  soilType: SoilType;
  customSwellPercent?: number;
  truckCapacityM3: number;
}): SoilCalculation {
  const {
    workType,
    shape,
    length,
    width,
    depth,
    diameter = 0,
    directArea = 0,
    soilType,
    customSwellPercent,
    truckCapacityM3 = 8
  } = params;

  // 1. Calcular Superficie (m²)
  let areaM2 = 0;
  if (shape === 'direct_m2') {
    areaM2 = Math.max(0, directArea);
  } else if (shape === 'circular') {
    const radius = diameter / 2;
    areaM2 = Math.PI * radius * radius;
  } else {
    areaM2 = Math.max(0, length) * Math.max(0, width);
  }

  // 2. Volumen en banco (m³)
  const bankVolumeM3 = Number((areaM2 * Math.max(0, depth)).toFixed(2));

  // 3. Coeficiente de Esponjamiento
  const typeConfig = SOIL_TYPES.find(t => t.id === soilType);
  const baseSwell = typeConfig ? typeConfig.swellFactor : 1.25;
  const swellFactor = customSwellPercent !== undefined ? 1 + (customSwellPercent / 100) : baseSwell;
  const resolvedSwellPercent = Number(((swellFactor - 1) * 100).toFixed(0));

  // 4. Volumen Esponjado (para transporte y acopio)
  const looseVolumeM3 = Number((bankVolumeM3 * swellFactor).toFixed(2));

  // 5. Viajes de camión volcador
  const safeTruckCap = Math.max(1, truckCapacityM3);
  const truckTrips = Math.ceil(looseVolumeM3 / safeTruckCap);

  // 6. Estimación de horas de trabajo
  // Rendimientos promedio estándar en movimiento de suelo:
  // Minicargadora (Bobcat): ~8 a 12 m³/hora para desmonte y acopio liviano
  // Retroexcavadora: ~20 a 30 m³/hora para excavación y carga
  const estimatedHoursBobcat = bankVolumeM3 > 0 ? Number(Math.max(2, Math.ceil(bankVolumeM3 / 10)).toFixed(1)) : 0;
  const estimatedHoursRetro = bankVolumeM3 > 0 ? Number(Math.max(3, Math.ceil(bankVolumeM3 / 22)).toFixed(1)) : 0;

  return {
    workType,
    shape,
    length,
    width,
    depth,
    diameter,
    directArea,
    soilType,
    customSwellPercent: resolvedSwellPercent,
    truckCapacityM3: safeTruckCap,
    areaM2: Number(areaM2.toFixed(2)),
    bankVolumeM3,
    looseVolumeM3,
    truckTrips,
    estimatedHoursBobcat,
    estimatedHoursRetro
  };
}

export function getWorkTypeLabel(type: WorkType): string {
  switch (type) {
    case 'desmonte_nivelacion':
      return 'Desmonte y Nivelación de Terreno';
    case 'excavacion_pileta':
      return 'Excavación para Pileta / Fosa';
    case 'zanja_cimientos':
      return 'Apertura de Zanjas para Cimientos / Cañerías';
    case 'relleno_compactacion':
      return 'Relleno y Compactación de Suelo';
    case 'limpieza_desmalezado':
      return 'Limpieza, Destronque y Desmalezado';
    default:
      return 'Movimiento de Suelo';
  }
}
