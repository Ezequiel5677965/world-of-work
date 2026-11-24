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
      name: 'Nuevo servicio / trabajo Bobcat',
      description: '',
      quantity: 1,
      unit: 'hs',
      unitPrice: 0,
      total: 0
    };
    updateItems([...budget.items, newItem]);
  };

  // Trasladar automáticamente los datos de la calculadora (priorizando Bobcat)
  const handleApplySoilCalc = (calc: SoilCalculation) => {
    setBudget(prev => ({ ...prev, soilCalculation: calc }));
    const newItems: BudgetItem[] = [...budget.items];

    // 1. Agregar siempre Bobcat como máquina prioritaria
    const bobcatItem = catalog.find(c => c.id === 'bobcat_mini') || {
      id: 'bobcat_mini',
      category: 'maquinaria' as const,
      name: 'Minicargadora / Bobcat (por hora)',
      description: 'Nivelación ágil, espacios reducidos, desparrame de tierra y tosca.',
      unit: 'hs' as const,
      defaultPrice: 38000
    };

    const bobcatHours = calc.estimatedHoursBobcat > 0 ? calc.estimatedHoursBobcat : 4;
    const existingBobcatIndex = newItems.findIndex(i => i.id === 'bobcat_mini' || i.name.toLowerCase().includes('bobcat'));
    
    if (existingBobcatIndex >= 0) {
      newItems[existingBobcatIndex].quantity = bobcatHours;
      newItems[existingBobcatIndex].total = bobcatHours * newItems[existingBobcatIndex].unitPrice;
    } else {
      newItems.push({
        id: 'bobcat_mini',
        category: 'maquinaria',
        name: bobcatItem.name,
        description: `Operación con Bobcat estimada para ${calc.bankVolumeM3} m³`,
        quantity: bobcatHours,
        unit: 'hs',
        unitPrice: bobcatItem.defaultPrice,
        total: bobcatHours * bobcatItem.defaultPrice
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
          description: `Retiro de suelo esponjado estimado (${calc.looseVolumeM3} m³)`,
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
        description: 'Traslado seguro de Bobcat a la obra',
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
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-4 sm:space-y-6">
      
      {/* SECCIÓN 1: Datos del Cliente y Obra */}
      <div className="bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-3 border-b-2 border-slate-900">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-950 text-white shrink-0">
              <User className="w-4 h-4 text-[#e1261c]" />
            </div>
            <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight">
              1. Datos del Cliente y Obra
            </h3>
          </div>
          <span className="font-mono text-xs font-black text-slate-900 bg-slate-100 px-2 py-0.5 border border-slate-300">
            Nº {budget.code}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez"
              value={budget.client.name}
              onChange={(e) => setBudget({ ...budget, client: { ...budget.client, name: e.target.value } })}
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              WhatsApp / Teléfono *
            </label>
            <input
              type="text"
              inputMode="tel"
              placeholder="Ej. +54 9 11 1234-5678"
              value={budget.client.phone}
              onChange={(e) => setBudget({ ...budget, client: { ...budget.client, phone: e.target.value } })}
              className="w-full px-3 py-2 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
            />
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Dirección de la Obra
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Barrio Los Álamos, Lote 45"
                value={budget.project.location}
                onChange={(e) => setBudget({ ...budget, project: { ...budget.project, location: e.target.value } })}
                className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Descripción del Trabajo
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Nivelación y desmonte con Bobcat"
                value={budget.project.title}
                onChange={(e) => setBudget({ ...budget, project: { ...budget.project, title: e.target.value } })}
                className="w-full pl-8 pr-3 py-2 text-xs font-bold bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5 pointer-events-none" />
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
      <div className="bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-3 border-b-2 border-slate-900 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-slate-950 text-white shrink-0">
              <Shovel className="w-4 h-4 text-[#e1261c]" />
            </div>
            <div>
              <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight">
                2. Ítems, Máquinas y Materiales
              </h3>
              <p className="text-[11px] sm:text-xs text-slate-500 font-medium">
                Agregá con 1 toque o escribí tus propios servicios.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCustomItem}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold bg-slate-950 hover:bg-slate-800 text-white flex items-center gap-1.5 transition cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-[#e1261c]" />
            <span>+ Agregar Ítem Libre</span>
          </button>
        </div>

        {/* Botones de Agregado Rápido (Bobcat Destacada) */}
        <div className="mb-4 p-2.5 sm:p-3 bg-slate-50 border border-slate-300">
          <span className="text-[10px] font-black uppercase tracking-wider text-slate-600 block mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-[#e1261c]" />
            Agregar rápido con 1 toque:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {catalog.map(catItem => {
              const isBobcat = catItem.id.includes('bobcat') || catItem.name.toLowerCase().includes('bobcat');
              return (
                <button
                  key={catItem.id}
                  type="button"
                  onClick={() => handleAddCatalogItem(catItem)}
                  className={`px-2.5 py-1.5 text-xs font-bold transition flex items-center gap-1 cursor-pointer border ${
                    isBobcat
                      ? 'bg-[#e1261c] hover:bg-[#c81e15] text-white border-[#e1261c] shadow-xs'
                      : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-300'
                  }`}
                >
                  <Plus className={`w-3.5 h-3.5 ${isBobcat ? 'text-white' : 'text-[#e1261c]'}`} />
                  <span>{catItem.name}</span>
                  <span className={`text-[10px] font-mono font-bold ${isBobcat ? 'text-red-100' : 'text-slate-500'}`}>
                    ({formatCurrency(catItem.defaultPrice, companySettings.currency)}/{catItem.unit})
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* LISTADO DE ÍTEMS: ADAPTADO A CELULAR Y ESCRITORIO */}
        {budget.items.length === 0 ? (
          <div className="text-center py-8 border border-dashed border-slate-300 bg-slate-50">
            <Truck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-bold text-slate-700">No hay ítems cargados todavía</p>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Tocá los botones rojos de arriba para agregar la Bobcat, fletes o camiones.
            </p>
          </div>
        ) : (
          <div>
            {/* VISTA PARA CELULAR: Tarjetas individuales táctiles (Se ve en pantallas chicas) */}
            <div className="block md:hidden space-y-3">
              {budget.items.map((item, index) => (
                <div key={item.id} className="p-3 bg-slate-50 border border-slate-300 space-y-2">
                  <div className="flex items-start justify-between gap-2">
                    <input
                      type="text"
                      value={item.name}
                      onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                      className="w-full font-bold text-xs text-slate-950 bg-white px-2 py-1.5 border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                      placeholder="Nombre del trabajo"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveItem(index)}
                      className="p-1.5 text-slate-400 hover:text-rose-600 bg-white border border-slate-200 shrink-0"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <div className="grid grid-cols-12 gap-2 text-xs">
                    <div className="col-span-4">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Cantidad</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        step="0.5"
                        min="0"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-center font-bold bg-white border border-slate-300"
                      />
                    </div>

                    <div className="col-span-3">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Unidad</label>
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="w-full px-1 py-1.5 font-bold bg-white border border-slate-300 text-xs"
                      >
                        <option value="hs">hs</option>
                        <option value="días">días</option>
                        <option value="viajes">viajes</option>
                        <option value="m³">m³</option>
                        <option value="flete">flete</option>
                        <option value="global">global</option>
                      </select>
                    </div>

                    <div className="col-span-5">
                      <label className="block text-[10px] font-bold text-slate-500 uppercase">Precio Unit.</label>
                      <input
                        type="number"
                        inputMode="decimal"
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-full px-2 py-1.5 text-right font-mono font-bold bg-white border border-slate-300"
                      />
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-1 border-t border-slate-200 text-xs">
                    <span className="text-[11px] font-bold text-slate-500">Subtotal ítem:</span>
                    <span className="font-mono font-black text-slate-950 text-sm">
                      {formatCurrency(item.total, companySettings.currency)}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            {/* VISTA PARA ESCRITORIO / PANTALLA GRANDE: Tabla convencional */}
            <div className="hidden md:block overflow-x-auto border border-slate-300">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-900 text-white font-bold uppercase tracking-wider text-[11px]">
                    <th className="py-2.5 px-3">Ítem / Tarea</th>
                    <th className="py-2.5 px-2 w-24 text-center">Cantidad</th>
                    <th className="py-2.5 px-2 w-24 text-center">Unidad</th>
                    <th className="py-2.5 px-3 w-36 text-right">Precio Unit.</th>
                    <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                    <th className="py-2.5 px-2 w-10 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {budget.items.map((item, index) => (
                    <tr key={item.id} className="hover:bg-slate-50 transition">
                      <td className="py-2 px-3">
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                          className="w-full font-bold text-slate-950 px-2 py-1 border border-transparent focus:border-slate-400 focus:bg-white"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          value={item.quantity || ''}
                          onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                          className="w-20 px-2 py-1 text-center font-bold text-slate-900 border border-slate-300"
                        />
                      </td>

                      <td className="py-2 px-2 text-center">
                        <select
                          value={item.unit}
                          onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                          className="px-2 py-1 text-xs font-bold text-slate-700 border border-slate-300 bg-white"
                        >
                          <option value="hs">hs</option>
                          <option value="días">días</option>
                          <option value="viajes">viajes</option>
                          <option value="m³">m³</option>
                          <option value="m²">m²</option>
                          <option value="flete">flete</option>
                          <option value="global">global</option>
                        </select>
                      </td>

                      <td className="py-2 px-3 text-right">
                        <input
                          type="number"
                          min="0"
                          value={item.unitPrice || ''}
                          onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                          className="w-28 px-2 py-1 text-right font-mono font-bold text-slate-800 border border-slate-300"
                        />
                      </td>

                      <td className="py-2 px-3 text-right font-mono font-black text-slate-950 text-sm">
                        {formatCurrency(item.total, companySettings.currency)}
                      </td>

                      <td className="py-2 px-2 text-center">
                        <button
                          type="button"
                          onClick={() => handleRemoveItem(index)}
                          className="p-1 text-slate-400 hover:text-rose-600 cursor-pointer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* SECCIÓN 4: Totales, Margen Comercial y Cierre */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 sm:gap-6">
        
        {/* Condiciones de Pago */}
        <div className="lg:col-span-6 bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-xs space-y-3">
          <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight pb-2 border-b-2 border-slate-900">
            3. Condiciones Comerciales
          </h3>

          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
              Forma de Pago
            </label>
            <textarea
              rows={2}
              value={budget.paymentTerms}
              onChange={(e) => setBudget({ ...budget, paymentTerms: e.target.value })}
              placeholder="Ej. 50% de anticipo al inicio, saldo al finalizar."
              className="w-full px-3 py-2 text-xs font-medium bg-white border border-slate-300 focus:outline-none focus:border-[#e1261c]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Validez (días)
              </label>
              <input
                type="number"
                min="1"
                value={budget.validityDays}
                onChange={(e) => setBudget({ ...budget, validityDays: parseInt(e.target.value, 10) || 15 })}
                className="w-full px-3 py-1.5 text-xs font-bold border border-slate-300"
              />
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-700 mb-1">
                Observaciones
              </label>
              <input
                type="text"
                placeholder="Ej. Sujeto a buen clima"
                value={budget.generalNotes || ''}
                onChange={(e) => setBudget({ ...budget, generalNotes: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-medium border border-slate-300"
              />
            </div>
          </div>
        </div>

        {/* Panel Financiero y Totales con Paleta Bobcat */}
        <div className="lg:col-span-6 bg-white border-2 border-slate-900 p-3.5 sm:p-5 shadow-sm space-y-3">
          <h3 className="font-black text-slate-950 text-xs sm:text-sm uppercase tracking-tight pb-2 border-b-2 border-slate-900 flex justify-between items-center">
            <span>4. Resumen Económico</span>
            <span className="text-[10px] font-black uppercase tracking-wider bg-slate-950 text-white px-2 py-0.5">
              Total
            </span>
          </h3>

          <div className="flex justify-between items-center text-xs">
            <span className="font-bold text-slate-600">Subtotal de Costos:</span>
            <span className="font-mono font-bold text-slate-900 text-sm">
              {formatCurrency(budget.subtotalItems, companySettings.currency)}
            </span>
          </div>

          {/* Margen de Ganancia */}
          <div className="p-2.5 bg-slate-50 border border-slate-300">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-[#e1261c]" />
                Margen Ganancia (%):
              </span>
              <span className="text-xs font-mono font-bold text-[#e1261c]">
                +{formatCurrency(budget.marginAmount, companySettings.currency)}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="range"
                min="0"
                max="60"
                step="5"
                value={budget.marginPercent}
                onChange={(e) => handleMarginChange(parseFloat(e.target.value) || 0)}
                className="w-full accent-[#e1261c] cursor-pointer"
              />
              <span className="text-xs font-black bg-white px-2 py-0.5 border border-slate-300 min-w-12 text-center text-slate-900">
                {budget.marginPercent}%
              </span>
            </div>

            <div className="flex gap-1.5 mt-2">
              {[15, 20, 25, 30].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleMarginChange(val)}
                  className={`text-[10px] font-bold px-2 py-0.5 border transition cursor-pointer ${
                    budget.marginPercent === val
                      ? 'bg-slate-950 text-white border-slate-950'
                      : 'bg-white text-slate-700 border-slate-300'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* TOTAL FINAL DESTACADO (ESTILO BOBCAT) */}
          <div className="p-3.5 bg-slate-950 text-white flex items-center justify-between border-b-4 border-[#e1261c]">
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-[#e1261c] block">
                Total a Presupuestar
              </span>
              <span className="text-[11px] text-slate-400">
                {budget.items.length} ítems
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl sm:text-3xl font-black text-white font-mono tracking-tight">
                {formatCurrency(budget.total, companySettings.currency)}
              </span>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN: GRANDES Y FÁCILES DE TOCAR CON EL PULGAR EN CELULAR */}
          <div className="flex flex-col sm:flex-row gap-2.5 pt-1">
            <button
              type="button"
              onClick={handleSaveBudget}
              className={`py-3 px-4 font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 cursor-pointer border ${
                isSaved
                  ? 'bg-emerald-600 text-white border-emerald-600'
                  : 'bg-white hover:bg-slate-100 text-slate-900 border-slate-400'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4 stroke-[3]" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? '¡Guardado!' : 'Guardar'}</span>
            </button>

            <button
              type="button"
              onClick={() => onPreview(budget)}
              className="py-3 px-4 font-black text-xs uppercase tracking-wider bg-[#e1261c] hover:bg-[#c81e15] active:scale-98 text-white transition flex items-center justify-center gap-2 cursor-pointer border border-[#e1261c] shadow-xs"
            >
              <Eye className="w-4 h-4 stroke-[3]" />
              <span>Ver Presupuesto (PDF / WhatsApp)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
