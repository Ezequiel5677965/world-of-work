import React, { useState, useEffect } from 'react';
import { 
  Calculator, 
  Truck, 
  Clock, 
  Layers, 
  ArrowRight, 
  RotateCcw,
  CheckCircle2,
  Info
} from 'lucide-react';
import { SoilCalculation, SoilType, WorkType } from '../types/budget';
import { SOIL_TYPES } from '../data/defaultCatalog';
import { calculateSoilVolume } from '../utils/soilCalculations';

interface SoilCalculatorCardProps {
  initialData?: SoilCalculation;
  onApplyToBudget: (calculation: SoilCalculation) => void;
}

export const SoilCalculatorCard: React.FC<SoilCalculatorCardProps> = ({
  initialData,
  onApplyToBudget
}) => {
  const [workType, setWorkType] = useState<WorkType>(initialData?.workType || 'desmonte_nivelacion');
  const [shape, setShape] = useState<'rectangular' | 'direct_m2' | 'circular'>(initialData?.shape || 'rectangular');
  const [length, setLength] = useState<number>(initialData?.length || 20);
  const [width, setWidth] = useState<number>(initialData?.width || 10);
  const [depth, setDepth] = useState<number>(initialData?.depth || 0.30);
  const [diameter, setDiameter] = useState<number>(initialData?.diameter || 4);
  const [directArea, setDirectArea] = useState<number>(initialData?.directArea || 200);
  const [soilType, setSoilType] = useState<SoilType>(initialData?.soilType || 'tierra_negra');
  const [customSwell, setCustomSwell] = useState<number | undefined>(initialData?.customSwellPercent);
  const [truckCap, setTruckCap] = useState<number>(initialData?.truckCapacityM3 || 8);
  const [isApplied, setIsApplied] = useState(false);

  // Cálculo en tiempo real
  const currentCalc = calculateSoilVolume({
    workType,
    shape,
    length,
    width,
    depth,
    diameter,
    directArea,
    soilType,
    customSwellPercent: customSwell,
    truckCapacityM3: truckCap
  });

  const selectedSoilInfo = SOIL_TYPES.find(s => s.id === soilType);

  const handleApply = () => {
    onApplyToBudget(currentCalc);
    setIsApplied(true);
    setTimeout(() => setIsApplied(false), 2500);
  };

  const handleReset = () => {
    setLength(15);
    setWidth(8);
    setDepth(0.30);
    setDiameter(4);
    setDirectArea(120);
    setSoilType('tierra_negra');
    setCustomSwell(undefined);
  };

  return (
    <div className="bg-gradient-to-br from-white to-amber-50/40 rounded-2xl border border-amber-200/80 p-5 shadow-xs transition-all">
      {/* Encabezado */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-amber-100 gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500 text-white shadow-xs">
            <Calculator className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-slate-900 text-base flex items-center gap-2">
              Calculadora de Volumen y Suelo
              <span className="text-[11px] font-semibold text-amber-700 bg-amber-100 px-2 py-0.5 rounded-full">
                Auto-Cálculo de Camiones
              </span>
            </h3>
            <p className="text-xs text-slate-500">
              Ingresá las medidas para calcular m³ en banco, esponjamiento y viajes necesarios.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1 self-start sm:self-auto py-1 px-2 rounded-md hover:bg-amber-100/60 transition"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer medidas</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 mt-4">
        {/* Columna Izquierda: Parámetros */}
        <div className="lg:col-span-7 space-y-4">
          {/* Tipo de Trabajo */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
              Tipo de Trabajo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'desmonte_nivelacion', label: 'Desmonte y Nivelación', icon: '🚜' },
                { id: 'excavacion_pileta', label: 'Excavación de Pileta/Fosa', icon: '🏊' },
                { id: 'relleno_compactacion', label: 'Relleno y Tosca', icon: '⛰️' },
                { id: 'zanja_cimientos', label: 'Zanja de Cimientos', icon: '🏗️' },
                { id: 'limpieza_desmalezado', label: 'Limpieza y Desmalezado', icon: '🌿' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkType(item.id as WorkType)}
                  className={`px-2.5 py-2 text-xs font-medium rounded-lg border text-left transition flex items-center gap-1.5 ${
                    workType === item.id
                      ? 'border-amber-500 bg-amber-500/10 text-amber-950 font-semibold shadow-xs ring-1 ring-amber-400'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modo de Medición */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-semibold text-slate-700">Forma y Medidas</label>
              <div className="inline-flex rounded-md p-0.5 bg-slate-100 border border-slate-200 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShape('rectangular')}
                  className={`px-2 py-0.5 rounded font-medium ${shape === 'rectangular' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'}`}
                >
                  Largo × Ancho
                </button>
                <button
                  type="button"
                  onClick={() => setShape('direct_m2')}
                  className={`px-2 py-0.5 rounded font-medium ${shape === 'direct_m2' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'}`}
                >
                  Superficie (m²)
                </button>
                <button
                  type="button"
                  onClick={() => setShape('circular')}
                  className={`px-2 py-0.5 rounded font-medium ${shape === 'circular' ? 'bg-white shadow-xs text-slate-900 font-semibold' : 'text-slate-600'}`}
                >
                  Circular (Ø)
                </button>
              </div>
            </div>

            {/* Campos de Dimensiones */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 bg-white p-3 rounded-xl border border-slate-200">
              {shape === 'rectangular' && (
                <>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Largo (metros)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={length || ''}
                        onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                        className="w-full pl-2.5 pr-8 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="ej. 20"
                      />
                      <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                      Ancho (metros)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        value={width || ''}
                        onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                        className="w-full pl-2.5 pr-8 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        placeholder="ej. 10"
                      />
                      <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">m</span>
                    </div>
                  </div>
                </>
              )}

              {shape === 'direct_m2' && (
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Superficie total
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="1"
                      min="0"
                      value={directArea || ''}
                      onChange={(e) => setDirectArea(parseFloat(e.target.value) || 0)}
                      className="w-full pl-2.5 pr-9 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="ej. 250"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">m²</span>
                  </div>
                </div>
              )}

              {shape === 'circular' && (
                <div className="col-span-2">
                  <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                    Diámetro (metros)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      value={diameter || ''}
                      onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
                      className="w-full pl-2.5 pr-8 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                      placeholder="ej. 5"
                    />
                    <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">m</span>
                  </div>
                </div>
              )}

              {/* Profundidad / Espesor */}
              <div>
                <label className="block text-[11px] font-semibold text-slate-600 mb-1">
                  Profundidad promedio
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.05"
                    min="0"
                    value={depth || ''}
                    onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                    className="w-full pl-2.5 pr-8 py-1.5 text-sm font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
                    placeholder="ej. 0.30"
                  />
                  <span className="absolute right-2.5 top-2 text-xs font-bold text-slate-400">m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de Suelo y Camión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Tipo de Suelo (Esponjamiento)
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-amber-500"
              >
                {SOIL_TYPES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (+{Math.round((s.swellFactor - 1) * 100)}%)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-amber-600 shrink-0" />
                {selectedSoilInfo?.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Capacidad de Camión Volcador
              </label>
              <div className="grid grid-cols-3 gap-1">
                {[
                  { m3: 6, label: '6 m³ (Simple)' },
                  { m3: 8, label: '8 m³ (Doble)' },
                  { m3: 18, label: '18 m³ (Batea)' },
                ].map(item => (
                  <button
                    key={item.m3}
                    type="button"
                    onClick={() => setTruckCap(item.m3)}
                    className={`py-1.5 px-1 text-center text-xs font-semibold rounded-lg border transition ${
                      truckCap === item.m3
                        ? 'border-amber-500 bg-amber-500 text-white shadow-xs'
                        : 'border-slate-200 bg-white hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {item.m3} m³
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                {truckCap === 18 ? 'Semirremolque Batea gran porte' : truckCap === 8 ? 'Camión volcador convencional doble eje' : 'Camión liviano chasis simple'}
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Resultados en Vivo */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-white rounded-xl border border-amber-200 p-4 shadow-sm">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-700 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-amber-500" />
                Resumen Volumétrico
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                Área: {currentCalc.areaM2} m²
              </span>
            </div>

            {/* Metros Cúbicos Banco vs Esponjado */}
            <div className="grid grid-cols-2 gap-2.5 my-3">
              <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                <span className="text-[11px] font-semibold text-slate-500 block">
                  Volumen en Banco
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-slate-900 tracking-tight">
                    {currentCalc.bankVolumeM3}
                  </span>
                  <span className="text-xs font-bold text-slate-400">m³</span>
                </div>
                <span className="text-[10px] text-slate-400">Volumen firme en tierra</span>
              </div>

              <div className="p-3 rounded-xl bg-amber-50/80 border border-amber-200">
                <span className="text-[11px] font-semibold text-amber-800 block">
                  Volumen Esponjado (+{currentCalc.customSwellPercent}%)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-2xl font-black text-amber-700 tracking-tight">
                    {currentCalc.looseVolumeM3}
                  </span>
                  <span className="text-xs font-bold text-amber-700">m³</span>
                </div>
                <span className="text-[10px] text-amber-800">Volumen suelto a cargar</span>
              </div>
            </div>

            {/* Camiones y Horas Máquina */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Truck className="w-4 h-4 text-amber-600" />
                  <span>Viajes de Camión ({truckCap} m³/viaje):</span>
                </div>
                <span className="font-extrabold text-slate-900 text-sm bg-white px-2 py-0.5 rounded border border-slate-200 shadow-2xs">
                  {currentCalc.truckTrips} viajes
                </span>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-2 text-slate-700 font-medium">
                  <Clock className="w-4 h-4 text-slate-500" />
                  <span>Horas estimadas sugeridas:</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Bobcat: <strong>~{currentCalc.estimatedHoursBobcat} hs</strong>
                  </span>
                  <span className="text-[11px] text-slate-600 bg-white px-2 py-0.5 rounded border border-slate-200">
                    Retro: <strong>~{currentCalc.estimatedHoursRetro} hs</strong>
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Botón de acción mágica */}
          <div className="mt-4 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={handleApply}
              className={`w-full py-2.5 px-3 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition shadow-sm ${
                isApplied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-amber-500 hover:bg-amber-600 active:scale-[0.98] text-white shadow-amber-500/25'
              }`}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  <span>¡Datos cargados en el presupuesto!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4" />
                  <span>Trasladar cálculo a la tabla de ítems</span>
                </>
              )}
            </button>
            <p className="text-[10px] text-center text-slate-400 mt-1">
              Agrega los viajes de camión y la maquinaria al presupuesto con 1 clic.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
