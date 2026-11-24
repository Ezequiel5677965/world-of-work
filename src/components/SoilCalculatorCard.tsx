import React, { useState } from 'react';
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
    setTimeout(() => setIsApplied(false), 2000);
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
    <div className="bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-xs transition-all">
      {/* Encabezado Bobcat */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b-2 border-slate-900 gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 bg-slate-950 text-white shrink-0 border-b-2 border-[#e1261c]">
            <Calculator className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="font-black text-slate-950 text-sm sm:text-base uppercase tracking-tight flex items-center gap-2">
              Calculadora de Suelo & Camiones
              <span className="text-[10px] font-black bg-[#e1261c] text-white px-1.5 py-0.2 uppercase">
                Bobcat
              </span>
            </h3>
            <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
              Calculá metros cúbicos, esponjamiento y viajes de camión para la obra.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1 self-start sm:self-auto py-1 px-2 border border-slate-200 bg-slate-50 hover:bg-slate-100 transition cursor-pointer font-medium"
        >
          <RotateCcw className="w-3.5 h-3.5" />
          <span>Restablecer</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-5 mt-4">
        {/* Columna Izquierda: Parámetros */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Tipo de Trabajo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
              Tipo de Trabajo
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-1.5">
              {[
                { id: 'desmonte_nivelacion', label: 'Desmonte y Nivelación', icon: '🚜' },
                { id: 'relleno_compactacion', label: 'Relleno y Tosca', icon: '⛰️' },
                { id: 'excavacion_pileta', label: 'Excavación de Pileta', icon: '🏊' },
                { id: 'zanja_cimientos', label: 'Zanja de Cimientos', icon: '🏗️' },
                { id: 'limpieza_desmalezado', label: 'Limpieza y Destronque', icon: '🌿' },
              ].map(item => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setWorkType(item.id as WorkType)}
                  className={`px-2.5 py-2 text-xs font-bold border text-left transition flex items-center gap-1.5 cursor-pointer ${
                    workType === item.id
                      ? 'border-slate-950 bg-slate-950 text-white shadow-xs'
                      : 'border-slate-300 bg-white hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <span>{item.icon}</span>
                  <span className="truncate">{item.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Modo de Medición y Dimensiones */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="text-xs font-bold uppercase tracking-wider text-slate-700">Forma y Medidas</label>
              <div className="inline-flex border border-slate-300 bg-slate-100 text-[11px]">
                <button
                  type="button"
                  onClick={() => setShape('rectangular')}
                  className={`px-2 py-0.5 font-bold cursor-pointer ${shape === 'rectangular' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}
                >
                  Largo × Ancho
                </button>
                <button
                  type="button"
                  onClick={() => setShape('direct_m2')}
                  className={`px-2 py-0.5 font-bold cursor-pointer ${shape === 'direct_m2' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}
                >
                  m² Directos
                </button>
                <button
                  type="button"
                  onClick={() => setShape('circular')}
                  className={`px-2 py-0.5 font-bold cursor-pointer ${shape === 'circular' ? 'bg-slate-950 text-white' : 'text-slate-700'}`}
                >
                  Circular
                </button>
              </div>
            </div>

            {/* Campos de Dimensiones táctiles para móvil */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 bg-slate-50 p-2.5 sm:p-3 border border-slate-300">
              {shape === 'rectangular' && (
                <>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Largo (m)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        value={length || ''}
                        onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                        className="w-full pl-2.5 pr-7 py-2 text-sm font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c] focus:ring-1 focus:ring-[#e1261c]"
                        placeholder="20"
                      />
                      <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">m</span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                      Ancho (m)
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.1"
                        min="0"
                        value={width || ''}
                        onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                        className="w-full pl-2.5 pr-7 py-2 text-sm font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c] focus:ring-1 focus:ring-[#e1261c]"
                        placeholder="10"
                      />
                      <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">m</span>
                    </div>
                  </div>
                </>
              )}

              {shape === 'direct_m2' && (
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Superficie total
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="1"
                      min="0"
                      value={directArea || ''}
                      onChange={(e) => setDirectArea(parseFloat(e.target.value) || 0)}
                      className="w-full pl-2.5 pr-8 py-2 text-sm font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c] focus:ring-1 focus:ring-[#e1261c]"
                      placeholder="200"
                    />
                    <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">m²</span>
                  </div>
                </div>
              )}

              {shape === 'circular' && (
                <div className="col-span-2">
                  <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                    Diámetro (m)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.1"
                      min="0"
                      value={diameter || ''}
                      onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
                      className="w-full pl-2.5 pr-7 py-2 text-sm font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c] focus:ring-1 focus:ring-[#e1261c]"
                      placeholder="4"
                    />
                    <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">m</span>
                  </div>
                </div>
              )}

              {/* Profundidad / Espesor */}
              <div className={shape !== 'rectangular' ? 'col-span-2 sm:col-span-1' : ''}>
                <label className="block text-[11px] font-bold text-slate-600 mb-0.5">
                  Profundidad (m)
                </label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.05"
                    min="0"
                    value={depth || ''}
                    onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                    className="w-full pl-2.5 pr-7 py-2 text-sm font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c] focus:ring-1 focus:ring-[#e1261c]"
                    placeholder="0.30"
                  />
                  <span className="absolute right-2 top-2 text-xs font-bold text-slate-400 pointer-events-none">m</span>
                </div>
              </div>
            </div>
          </div>

          {/* Tipo de Suelo y Camión */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Tipo de Suelo
              </label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full px-2.5 py-2 text-xs font-bold border border-slate-300 bg-white focus:outline-none focus:border-[#e1261c]"
              >
                {SOIL_TYPES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (+{Math.round((s.swellFactor - 1) * 100)}% suelto)
                  </option>
                ))}
              </select>
              <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-[#e1261c] shrink-0" />
                {selectedSoilInfo?.description}
              </p>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1">
                Camión Volcador
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
                    className={`py-2 px-1 text-center text-xs font-black transition cursor-pointer border ${
                      truckCap === item.m3
                        ? 'border-slate-950 bg-slate-950 text-white'
                        : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    {item.m3} m³
                  </button>
                ))}
              </div>
              <p className="text-[11px] text-slate-500 mt-1 font-medium">
                {truckCap === 18 ? 'Semirremolque Batea' : truckCap === 8 ? 'Camión convencional doble eje' : 'Camión liviano simple'}
              </p>
            </div>
          </div>
        </div>

        {/* Columna Derecha: Tarjeta de Resultados Bobcat */}
        <div className="lg:col-span-5 flex flex-col justify-between bg-slate-50 border-2 border-slate-900 p-3.5 sm:p-4">
          <div>
            <div className="flex items-center justify-between pb-2.5 border-b border-slate-300">
              <span className="text-xs font-black uppercase tracking-wider text-slate-950 flex items-center gap-1.5">
                <Layers className="w-4 h-4 text-[#e1261c]" />
                Cómputo Volumétrico
              </span>
              <span className="text-xs font-mono font-bold text-slate-700 bg-white px-2 py-0.5 border border-slate-200">
                {currentCalc.areaM2} m²
              </span>
            </div>

            {/* Metros Cúbicos Banco vs Esponjado */}
            <div className="grid grid-cols-2 gap-2 my-3">
              <div className="p-2.5 bg-white border border-slate-300">
                <span className="text-[10px] font-bold uppercase text-slate-500 block">
                  Volumen Firme
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-slate-950 font-mono">
                    {currentCalc.bankVolumeM3}
                  </span>
                  <span className="text-xs font-bold text-slate-500">m³</span>
                </div>
                <span className="text-[10px] text-slate-400">En banco</span>
              </div>

              <div className="p-2.5 bg-white border-2 border-[#e1261c]">
                <span className="text-[10px] font-bold uppercase text-[#e1261c] block">
                  Suelto (+{currentCalc.customSwellPercent}%)
                </span>
                <div className="flex items-baseline gap-1 mt-0.5">
                  <span className="text-xl sm:text-2xl font-black text-[#e1261c] font-mono">
                    {currentCalc.looseVolumeM3}
                  </span>
                  <span className="text-xs font-bold text-[#e1261c]">m³</span>
                </div>
                <span className="text-[10px] text-slate-500">A cargar / flete</span>
              </div>
            </div>

            {/* Camiones y Horas Máquina (Bobcat destacada) */}
            <div className="space-y-2 text-xs">
              <div className="flex items-center justify-between p-2 bg-white border border-slate-300">
                <div className="flex items-center gap-1.5 text-slate-800 font-bold">
                  <Truck className="w-4 h-4 text-[#e1261c]" />
                  <span>Viajes ({truckCap} m³):</span>
                </div>
                <span className="font-mono font-black text-slate-950 text-sm bg-slate-100 px-2 py-0.5 border border-slate-300">
                  {currentCalc.truckTrips} viajes
                </span>
              </div>

              {/* Renglón especial Bobcat */}
              <div className="flex items-center justify-between p-2 bg-white border-2 border-slate-900">
                <div className="flex items-center gap-1.5 text-slate-900 font-black">
                  <Clock className="w-4 h-4 text-[#e1261c]" />
                  <span>Uso Bobcat:</span>
                </div>
                <span className="font-mono font-black text-[#e1261c] text-sm">
                  ~{currentCalc.estimatedHoursBobcat} horas
                </span>
              </div>
            </div>
          </div>

          {/* Botón de acción: Trasladar al presupuesto */}
          <div className="mt-4 pt-3 border-t border-slate-300">
            <button
              type="button"
              onClick={handleApply}
              className={`w-full py-2.5 px-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition cursor-pointer shadow-xs ${
                isApplied
                  ? 'bg-emerald-600 text-white'
                  : 'bg-[#e1261c] hover:bg-[#c81e15] active:scale-98 text-white'
              }`}
            >
              {isApplied ? (
                <>
                  <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                  <span>¡Cargado en la tabla!</span>
                </>
              ) : (
                <>
                  <ArrowRight className="w-4 h-4 stroke-[3]" />
                  <span>Cargar datos en el presupuesto</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
