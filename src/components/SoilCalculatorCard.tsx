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
    <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-xs w-full max-w-full overflow-hidden">
      
      {/* Encabezado compacto */}
      <div className="flex items-center justify-between pb-2.5 border-b-2 border-slate-900 gap-2">
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-slate-950 text-white shrink-0">
            <Calculator className="w-4 h-4 text-[#e1261c]" />
          </div>
          <div>
            <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight flex items-center gap-1.5">
              <span>Calculadora de Suelo</span>
              <span className="text-[9px] font-black bg-[#e1261c] text-white px-1.5 py-0.2">
                VIAL
              </span>
            </h3>
            <p className="text-[10px] text-slate-500 font-semibold leading-tight">
              Cálculo automático de m³ y camiones
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleReset}
          className="text-[11px] text-slate-600 hover:text-slate-950 flex items-center gap-1 py-1 px-1.5 border border-slate-300 bg-slate-50 transition cursor-pointer font-bold shrink-0"
        >
          <RotateCcw className="w-3 h-3" />
          <span className="hidden xs:inline">Reiniciar</span>
        </button>
      </div>

      {/* Contenido en flujo vertical limpio */}
      <div className="space-y-3 mt-3">
        
        {/* Tipo de Trabajo (Selector limpio) */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
            Tipo de Trabajo
          </label>
          <select
            value={workType}
            onChange={(e) => setWorkType(e.target.value as WorkType)}
            className="w-full px-2.5 py-1.5 text-xs font-bold border border-slate-300 bg-white focus:outline-none focus:border-[#e1261c]"
          >
            <option value="desmonte_nivelacion">🚜 Desmonte y Nivelación</option>
            <option value="relleno_compactacion">⛰️ Relleno y Tosca</option>
            <option value="excavacion_pileta">🏊 Excavación de Pileta / Pozo</option>
            <option value="zanja_cimientos">🏗️ Zanja de Cimientos / Cañerías</option>
            <option value="limpieza_desmalezado">🌿 Limpieza y Destronque</option>
          </select>
        </div>

        {/* Forma de Medición: 3 botones de ancho 100% */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
            Modo de Medición
          </label>
          <div className="grid grid-cols-3 border border-slate-300 bg-slate-100 text-[11px] text-center w-full">
            <button
              type="button"
              onClick={() => setShape('rectangular')}
              className={`py-1 font-bold transition cursor-pointer ${shape === 'rectangular' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:text-slate-950'}`}
            >
              Largo × Ancho
            </button>
            <button
              type="button"
              onClick={() => setShape('direct_m2')}
              className={`py-1 font-bold transition cursor-pointer ${shape === 'direct_m2' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:text-slate-950'}`}
            >
              m² Directos
            </button>
            <button
              type="button"
              onClick={() => setShape('circular')}
              className={`py-1 font-bold transition cursor-pointer ${shape === 'circular' ? 'bg-slate-950 text-white' : 'text-slate-700 hover:text-slate-950'}`}
            >
              Circular (Ø)
            </button>
          </div>
        </div>

        {/* Medidas (Cuadrícula limpia que nunca desborda) */}
        <div className="bg-slate-50 p-2.5 border border-slate-300 space-y-2">
          {shape === 'rectangular' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Largo (m)</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    value={length || ''}
                    onChange={(e) => setLength(parseFloat(e.target.value) || 0)}
                    className="w-full pl-2 pr-6 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                    placeholder="20"
                  />
                  <span className="absolute right-2 top-1.5 text-[11px] font-bold text-slate-400 pointer-events-none">m</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Ancho (m)</label>
                <div className="relative">
                  <input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    min="0"
                    value={width || ''}
                    onChange={(e) => setWidth(parseFloat(e.target.value) || 0)}
                    className="w-full pl-2 pr-6 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                    placeholder="10"
                  />
                  <span className="absolute right-2 top-1.5 text-[11px] font-bold text-slate-400 pointer-events-none">m</span>
                </div>
              </div>
            </div>
          )}

          {shape === 'direct_m2' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Superficie Total (m²)</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="1"
                  min="0"
                  value={directArea || ''}
                  onChange={(e) => setDirectArea(parseFloat(e.target.value) || 0)}
                  className="w-full pl-2 pr-7 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                  placeholder="200"
                />
                <span className="absolute right-2 top-1.5 text-[11px] font-bold text-slate-400 pointer-events-none">m²</span>
              </div>
            </div>
          )}

          {shape === 'circular' && (
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Diámetro (m)</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.1"
                  min="0"
                  value={diameter || ''}
                  onChange={(e) => setDiameter(parseFloat(e.target.value) || 0)}
                  className="w-full pl-2 pr-6 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                  placeholder="4"
                />
                <span className="absolute right-2 top-1.5 text-[11px] font-bold text-slate-400 pointer-events-none">m</span>
              </div>
            </div>
          )}

          {/* Profundidad y Tipo de Suelo en fila */}
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Profundidad (m)</label>
              <div className="relative">
                <input
                  type="number"
                  inputMode="decimal"
                  step="0.05"
                  min="0"
                  value={depth || ''}
                  onChange={(e) => setDepth(parseFloat(e.target.value) || 0)}
                  className="w-full pl-2 pr-6 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                  placeholder="0.30"
                />
                <span className="absolute right-2 top-1.5 text-[11px] font-bold text-slate-400 pointer-events-none">m</span>
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold text-slate-600 mb-0.5">Tipo de Suelo</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value as SoilType)}
                className="w-full px-2 py-1.5 text-xs font-bold border border-slate-300 bg-white focus:outline-none focus:border-[#e1261c]"
              >
                {SOIL_TYPES.map(s => (
                  <option key={s.id} value={s.id}>
                    {s.name} (+{Math.round((s.swellFactor - 1) * 100)}%)
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Camión Volcador Selector */}
        <div>
          <label className="block text-[10px] font-black uppercase tracking-wider text-slate-700 mb-1">
            Capacidad de Camión Volcador
          </label>
          <div className="grid grid-cols-3 gap-1.5 text-center">
            {[
              { m3: 6, label: '6 m³ (Simple)' },
              { m3: 8, label: '8 m³ (Doble)' },
              { m3: 18, label: '18 m³ (Batea)' },
            ].map(item => (
              <button
                key={item.m3}
                type="button"
                onClick={() => setTruckCap(item.m3)}
                className={`py-1.5 px-1 text-xs font-black transition cursor-pointer border ${
                  truckCap === item.m3
                    ? 'border-slate-950 bg-slate-950 text-white'
                    : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {item.m3} m³
              </button>
            ))}
          </div>
        </div>

        {/* Tarjeta de Resultados Compacta */}
        <div className="bg-slate-50 border-2 border-slate-900 p-2.5 space-y-2">
          <div className="flex justify-between items-center text-xs font-black border-b border-slate-300 pb-1.5">
            <span className="flex items-center gap-1 uppercase tracking-tight text-slate-900">
              <Layers className="w-3.5 h-3.5 text-[#e1261c]" />
              Resumen Calculado
            </span>
            <span className="font-mono text-slate-600 text-[11px]">
              Área: {currentCalc.areaM2} m²
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2 text-center text-xs">
            <div className="p-1.5 bg-white border border-slate-300">
              <span className="text-[9px] font-bold uppercase text-slate-500 block">Volumen Firme</span>
              <span className="font-mono font-black text-slate-950 text-base">{currentCalc.bankVolumeM3} m³</span>
            </div>
            <div className="p-1.5 bg-white border-2 border-[#e1261c]">
              <span className="text-[9px] font-bold uppercase text-[#e1261c] block">Suelto (+{currentCalc.customSwellPercent}%)</span>
              <span className="font-mono font-black text-[#e1261c] text-base">{currentCalc.looseVolumeM3} m³</span>
            </div>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-white border border-slate-300 text-xs">
            <div className="flex items-center gap-1 font-bold text-slate-800">
              <Truck className="w-3.5 h-3.5 text-[#e1261c]" />
              <span>Camiones ({truckCap} m³):</span>
            </div>
            <span className="font-mono font-black text-slate-950 bg-slate-100 px-2 py-0.5 border border-slate-300">
              {currentCalc.truckTrips} viajes
            </span>
          </div>

          <div className="flex items-center justify-between p-1.5 bg-white border border-slate-300 text-xs">
            <div className="flex items-center gap-1 font-black text-slate-900">
              <Clock className="w-3.5 h-3.5 text-[#e1261c]" />
              <span>Horas Minicargadora:</span>
            </div>
            <span className="font-mono font-black text-[#e1261c]">
              ~{currentCalc.estimatedHoursMini ?? currentCalc.estimatedHoursBobcat ?? 0} hs
            </span>
          </div>

          {/* Botón de Carga al Presupuesto */}
          <button
            type="button"
            onClick={handleApply}
            className={`w-full py-2.5 px-3 font-black text-xs uppercase tracking-wider flex items-center justify-center gap-1.5 transition cursor-pointer shadow-xs ${
              isApplied
                ? 'bg-emerald-600 text-white'
                : 'bg-[#e1261c] hover:bg-[#c81e15] active:scale-98 text-white'
            }`}
          >
            {isApplied ? (
              <>
                <CheckCircle2 className="w-4 h-4 stroke-[3]" />
                <span>¡Cargado en el Presupuesto!</span>
              </>
            ) : (
              <>
                <ArrowRight className="w-4 h-4 stroke-[3]" />
                <span>Cargar al Presupuesto</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};
