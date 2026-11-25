import React, { useState } from 'react';
import { 
  Plus, 
  Trash2, 
  Eye, 
  Save, 
  User, 
  MapPin, 
  FileText, 
  Check, 
  Percent,
  Sparkles,
  Truck,
  Shovel
} from 'lucide-react';
import { 
  Budget, 
  BudgetItem, 
  CompanySettings, 
  PriceCatalogItem, 
  SoilCalculation 
} from '../types/budget';
import { SoilCalculatorCard } from './SoilCalculatorCard';
import { formatCurrency } from '../utils/formatters';
import confetti from 'canvas-confetti';

interface BudgetFormProps {
  initialBudget: Budget;
  companySettings: CompanySettings;
  catalog: PriceCatalogItem[];
  onSave: (budget: Budget) => void;
  onPreview: (budget: Budget) => void;
}

export const BudgetForm: React.FC<BudgetFormProps> = ({
  initialBudget,
  companySettings,
  catalog,
  onSave,
  onPreview
}) => {
  const [budget, setBudget] = useState<Budget>(initialBudget);
  const [isSaved, setIsSaved] = useState(false);

  // Recalcular totales del presupuesto
  const recalculateBudget = (
    items: BudgetItem[],
    marginPercent: number,
    includeTax: boolean,
    taxPercent: number,
    discountPercent: number
  ): Partial<Budget> => {
    const subtotalItems = items.reduce((acc, item) => acc + (item.quantity * item.unitPrice), 0);
    const marginAmount = (subtotalItems * (marginPercent / 100));
    const subtotalWithMargin = subtotalItems + marginAmount;
    const discountAmount = (subtotalWithMargin * (discountPercent / 100));
    const baseAfterDiscount = subtotalWithMargin - discountAmount;
    const taxAmount = includeTax ? (baseAfterDiscount * (taxPercent / 100)) : 0;
    const total = baseAfterDiscount + taxAmount;

    return {
      items,
      subtotalItems: Number(subtotalItems.toFixed(2)),
      marginPercent,
      marginAmount: Number(marginAmount.toFixed(2)),
      subtotalWithMargin: Number(subtotalWithMargin.toFixed(2)),
      includeTax,
      taxPercent,
      taxAmount: Number(taxAmount.toFixed(2)),
      discountPercent,
      discountAmount: Number(discountAmount.toFixed(2)),
      total: Number(total.toFixed(2))
    };
  };

  const updateItems = (newItems: BudgetItem[]) => {
    const recalculated = recalculateBudget(
      newItems,
      budget.marginPercent,
      budget.includeTax,
      budget.taxPercent,
      budget.discountPercent
    );
    setBudget(prev => ({ ...prev, ...recalculated, items: newItems }));
  };

  const handleItemChange = (index: number, field: keyof BudgetItem, value: any) => {
    const updated = [...budget.items];
    const item = { ...updated[index], [field]: value };
    item.total = Number((item.quantity * item.unitPrice).toFixed(2));
    updated[index] = item;
    updateItems(updated);
  };

  const handleRemoveItem = (index: number) => {
    const updated = budget.items.filter((_, i) => i !== index);
    updateItems(updated);
  };

  const handleAddCatalogItem = (catalogItem: PriceCatalogItem) => {
    const newItem: BudgetItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: catalogItem.category,
      name: catalogItem.name,
      description: catalogItem.description,
      quantity: 1,
      unit: catalogItem.unit,
      unitPrice: catalogItem.defaultPrice,
      total: catalogItem.defaultPrice
    };
    updateItems([...budget.items, newItem]);
  };

  const handleAddCustomItem = () => {
    const newItem: BudgetItem = {
      id: `item_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      category: 'personalizado',
      name: '',
      description: '',
      quantity: 1,
      unit: 'hs',
      unitPrice: 0,
      total: 0
    };
    updateItems([...budget.items, newItem]);
  };

  // Trasladar automáticamente los datos de la calculadora (Minicargadora prioritaria)
  const handleApplySoilCalc = (calc: SoilCalculation) => {
    setBudget(prev => ({ ...prev, soilCalculation: calc }));
    const newItems: BudgetItem[] = [...budget.items];

    // 1. Agregar Minicargadora
    const miniItem = catalog.find(c => c.id === 'mini_cargadora' || c.id === 'bobcat_mini') || {
      id: 'mini_cargadora',
      category: 'maquinaria' as const,
      name: 'Minicargadora frontal (por hora)',
      description: 'Nivelación ágil y desparrame',
      unit: 'hs' as const,
      defaultPrice: 38000
    };

    const calculatedHours = calc.estimatedHoursMini ?? calc.estimatedHoursBobcat ?? 0;
    const miniHours = calculatedHours > 0 ? calculatedHours : 4;
    const existingMiniIndex = newItems.findIndex(i => 
      i.id === 'mini_cargadora' || 
      i.id === 'bobcat_mini' || 
      i.name.toLowerCase().includes('minicargadora') || 
      i.name.toLowerCase().includes('bobcat')
    );
    
    if (existingMiniIndex >= 0) {
      newItems[existingMiniIndex].quantity = miniHours;
      newItems[existingMiniIndex].total = miniHours * newItems[existingMiniIndex].unitPrice;
    } else {
      newItems.push({
        id: 'mini_cargadora',
        category: 'maquinaria',
        name: miniItem.name,
        description: `Trabajo de suelo estimado para ${calc.bankVolumeM3} m³`,
        quantity: miniHours,
        unit: 'hs',
        unitPrice: miniItem.defaultPrice,
        total: miniHours * miniItem.defaultPrice
      });
    }

    // 2. Agregar viajes de camión si calculó viajes
    if (calc.truckTrips > 0) {
      const existingTruckIndex = newItems.findIndex(i => i.name.toLowerCase().includes('camión') || i.name.toLowerCase().includes('camion'));
      const truckPrice = 65000;

      if (existingTruckIndex >= 0) {
        newItems[existingTruckIndex].quantity = calc.truckTrips;
        newItems[existingTruckIndex].total = calc.truckTrips * newItems[existingTruckIndex].unitPrice;
      } else {
        newItems.push({
          id: `item_truck_${Date.now()}`,
          category: 'transporte',
          name: `Retiro de suelo en Camión Volcador (${calc.truckCapacityM3} m³)`,
          description: `Retiro de suelo esponjado (${calc.looseVolumeM3} m³)`,
          quantity: calc.truckTrips,
          unit: 'viajes',
          unitPrice: truckPrice,
          total: calc.truckTrips * truckPrice
        });
      }
    }

    // 3. Agregar flete carretón si no está presente
    const carretonItem = catalog.find(c => c.id === 'flete_carreton');
    if (carretonItem && !newItems.some(i => i.id === 'flete_carreton')) {
      newItems.push({
        id: 'flete_carreton',
        category: 'transporte',
        name: carretonItem.name,
        description: 'Traslado seguro de maquinaria a la obra',
        quantity: 1,
        unit: 'flete',
        unitPrice: carretonItem.defaultPrice,
        total: carretonItem.defaultPrice
      });
    }

    updateItems(newItems);
  };

  const handleMarginChange = (margin: number) => {
    const recalculated = recalculateBudget(
      budget.items,
      Math.max(0, margin),
      budget.includeTax,
      budget.taxPercent,
      budget.discountPercent
    );
    setBudget(prev => ({ ...prev, ...recalculated }));
  };

  const handleSaveBudget = () => {
    onSave(budget);
    setIsSaved(true);
    try {
      confetti({ particleCount: 50, spread: 50, origin: { y: 0.8 } });
    } catch {
      // Ignorar
    }
    setTimeout(() => setIsSaved(false), 2000);
  };

  return (
    <div className="max-w-xl mx-auto w-full px-3 sm:px-4 py-3 sm:py-5 space-y-3.5">
      
      {/* SECCIÓN 1: Datos del Cliente y Obra (Flujo vertical limpio) */}
      <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-xs w-full max-w-full">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b-2 border-slate-900">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-slate-950 text-white shrink-0">
              <User className="w-3.5 h-3.5 text-[#e1261c]" />
            </div>
            <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight">
              1. Cliente y Obra
            </h3>
          </div>
          <span className="font-mono text-[11px] font-black text-slate-900 bg-slate-100 px-1.5 py-0.5 border border-slate-300">
            {budget.code}
          </span>
        </div>

        <div className="space-y-2.5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Nombre del Cliente *
              </label>
              <input
                type="text"
                required
                placeholder="Nombre del Cliente"
                value={budget.client.name}
                onChange={(e) => setBudget({ ...budget, client: { ...budget.client, name: e.target.value } })}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                WhatsApp / Teléfono *
              </label>
              <input
                type="text"
                inputMode="tel"
                placeholder="Teléfono / WhatsApp"
                value={budget.client.phone}
                onChange={(e) => setBudget({ ...budget, client: { ...budget.client, phone: e.target.value } })}
                className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Dirección / Lote de Obra
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Dirección o Lote de Obra"
                  value={budget.project.location}
                  onChange={(e) => setBudget({ ...budget, project: { ...budget.project, location: e.target.value } })}
                  className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                />
                <MapPin className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Descripción del Trabajo
              </label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="Descripción del Trabajo"
                  value={budget.project.title}
                  onChange={(e) => setBudget({ ...budget, project: { ...budget.project, title: e.target.value } })}
                  className="w-full pl-7 pr-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                />
                <FileText className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2 pointer-events-none" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Calculadora de Suelo */}
      <SoilCalculatorCard
        initialData={budget.soilCalculation}
        onApplyToBudget={handleApplySoilCalc}
      />

      {/* SECCIÓN 3: Desglose de Maquinarias y Recursos */}
      <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-xs w-full max-w-full">
        <div className="flex items-center justify-between pb-2 mb-2.5 border-b-2 border-slate-900">
          <div className="flex items-center gap-1.5">
            <div className="p-1 bg-slate-950 text-white shrink-0">
              <Shovel className="w-3.5 h-3.5 text-[#e1261c]" />
            </div>
            <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight">
              2. Máquinas y Servicios
            </h3>
          </div>

          <button
            type="button"
            onClick={handleAddCustomItem}
            className="px-2 py-1 text-[11px] font-bold bg-slate-950 hover:bg-slate-800 text-white flex items-center gap-1 transition cursor-pointer"
          >
            <Plus className="w-3 h-3 text-[#e1261c]" />
            <span>+ Libre</span>
          </button>
        </div>

        {/* Botones de Agregado Rápido (Compactos y adaptables) */}
        <div className="mb-3 p-2 bg-slate-50 border border-slate-300">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-1.5 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#e1261c]" />
            Agregar con 1 toque:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {catalog.map(catItem => {
              const isMini = catItem.id.includes('mini') || catItem.id.includes('bobcat') || catItem.name.toLowerCase().includes('minicargadora');
              // Nombres cortos para móvil
              const shortName = isMini 
                ? 'Minicargadora (hs)' 
                : catItem.id.includes('carreton')
                ? 'Flete Carretón'
                : catItem.id.includes('retro')
                ? 'Retroexcavadora'
                : catItem.id.includes('camion')
                ? 'Camión Volcador'
                : catItem.id.includes('tosca')
                ? 'Tosca (m³)'
                : catItem.id.includes('tierra')
                ? 'Tierra Negra (m³)'
                : catItem.name.split('(')[0].trim();

              return (
                <button
                  key={catItem.id}
                  type="button"
                  onClick={() => handleAddCatalogItem(catItem)}
                  className={`px-2 py-1 text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                    isMini
                      ? 'bg-[#e1261c] hover:bg-[#c81e15] text-white border-[#e1261c]'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                >
                  <Plus className={`w-3 h-3 ${isMini ? 'text-white' : 'text-[#e1261c]'}`} />
                  <span>{shortName}</span>
                  <span className={`text-[10px] font-mono ${isMini ? 'text-red-100' : 'text-slate-500'}`}>
                    ${(catItem.defaultPrice).toLocaleString('es-AR')}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTADO DE ÍTEMS: Tarjetas limpias de ancho completo */}
        {budget.items.length === 0 ? (
          <div className="text-center py-6 border border-dashed border-slate-300 bg-slate-50">
            <Truck className="w-7 h-7 text-slate-400 mx-auto mb-1.5" />
            <p className="text-xs font-bold text-slate-700">No hay máquinas cargadas todavía</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tocá el botón rojo "+ Minicargadora" de arriba para agregarla.
            </p>
          </div>
        ) : (
          <div className="space-y-2.5">
            {budget.items.map((item, index) => (
              <div key={item.id} className="p-2.5 bg-slate-50 border border-slate-300 space-y-2">
                {/* Fila 1: Título y Eliminar */}
                <div className="flex items-center justify-between gap-1.5">
                  <input
                    type="text"
                    value={item.name}
                    onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                    className="w-full font-bold text-xs text-slate-950 bg-white px-2 py-1 border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                    placeholder="Nombre del trabajo"
                  />
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(index)}
                    className="p-1 text-slate-400 hover:text-rose-600 bg-white border border-slate-300 shrink-0 cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Fila 2: Cantidad, Unidad, Precio */}
                <div className="grid grid-cols-3 gap-1.5 text-xs">
                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Cantidad</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      step="0.5"
                      min="0"
                      value={item.quantity || ''}
                      onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                      className="w-full px-1.5 py-1 text-center font-bold bg-white border border-slate-300 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Unidad</label>
                    <select
                      value={item.unit}
                      onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                      className="w-full px-1 py-1 font-bold bg-white border border-slate-300 text-xs"
                    >
                      <option value="hs">hs</option>
                      <option value="viajes">viajes</option>
                      <option value="días">días</option>
                      <option value="m³">m³</option>
                      <option value="flete">flete</option>
                      <option value="global">global</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[9px] font-bold text-slate-500 uppercase">Precio Unit.</label>
                    <input
                      type="number"
                      inputMode="decimal"
                      min="0"
                      value={item.unitPrice || ''}
                      onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                      className="w-full px-1.5 py-1 text-right font-mono font-bold bg-white border border-slate-300 text-xs"
                    />
                  </div>
                </div>

                {/* Fila 3: Subtotal */}
                <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
                  <span className="text-[10px] font-bold text-slate-500 uppercase">Subtotal ítem:</span>
                  <span className="font-mono font-black text-slate-950 text-sm">
                    {formatCurrency(item.total, companySettings.currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* SECCIÓN 4: Totales, Condiciones y Botón de Acción Principal */}
      <div className="bg-white border-2 border-slate-900 p-3 sm:p-4 shadow-sm space-y-3 w-full max-w-full">
        <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight pb-2 border-b-2 border-slate-900 flex justify-between items-center">
          <span>3. Cierre del Presupuesto</span>
          <span className="text-[9px] font-black uppercase bg-[#e1261c] text-white px-1.5 py-0.2">
            World of Work
          </span>
        </h3>

        {/* Forma de Pago y Validez */}
        <div className="space-y-2">
          <div>
            <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
              Forma de Pago
            </label>
            <input
              type="text"
              value={budget.paymentTerms}
              onChange={(e) => setBudget({ ...budget, paymentTerms: e.target.value })}
              placeholder="Condiciones y forma de pago"
              className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Validez (días)
              </label>
              <input
                type="number"
                min="1"
                value={budget.validityDays}
                onChange={(e) => setBudget({ ...budget, validityDays: parseInt(e.target.value, 10) || 15 })}
                className="w-full px-2 py-1 text-xs font-bold border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[10px] font-bold uppercase tracking-wider text-slate-700 mb-0.5">
                Margen Ganancia %
              </label>
              <div className="flex items-center gap-1">
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={budget.marginPercent}
                  onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                  className="w-full px-2 py-1 text-xs font-bold border border-slate-300 text-center"
                />
                <span className="text-xs font-bold text-slate-500">%</span>
              </div>
            </div>
          </div>
        </div>

        {/* TOTAL FINAL DESTACADO (GRAN TAMAÑO Y LEGIBLE A SIMPLE VISTA) */}
        <div className="p-3 bg-slate-950 text-white flex items-center justify-between border-b-4 border-[#e1261c]">
          <div>
            <span className="text-[10px] font-black uppercase tracking-widest text-[#e1261c] block">
              Total Presupuesto
            </span>
            <span className="text-[10px] text-slate-400">
              {budget.items.length} ítems cargados
            </span>
          </div>
          <div className="text-right">
            <span className="text-2xl font-black text-white font-mono tracking-tight">
              {formatCurrency(budget.total, companySettings.currency)}
            </span>
          </div>
        </div>

        {/* BOTONES PRINCIPALES DE ACCIÓN */}
        <div className="space-y-2 pt-1">
          <button
            type="button"
            onClick={() => onPreview(budget)}
            className="w-full py-3 px-4 font-black text-xs uppercase tracking-wider bg-[#e1261c] hover:bg-[#c81e15] active:scale-98 text-white transition flex items-center justify-center gap-2 cursor-pointer border border-[#e1261c] shadow-md"
          >
            <Eye className="w-4 h-4 stroke-[3]" />
            <span>Ver Presupuesto (PDF / WhatsApp)</span>
          </button>

          <button
            type="button"
            onClick={handleSaveBudget}
            className={`w-full py-2.5 px-3 font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer border ${
              isSaved
                ? 'bg-emerald-600 text-white border-emerald-600'
                : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
            }`}
          >
            {isSaved ? <Check className="w-3.5 h-3.5 stroke-[3]" /> : <Save className="w-3.5 h-3.5" />}
            <span>{isSaved ? '¡Guardado con éxito!' : 'Guardar Borrador'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};
