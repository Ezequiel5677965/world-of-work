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
  SoilCalculation,
  ItemCategory 
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
      name: 'Nuevo servicio / trabajo de suelo',
      description: '',
      quantity: 1,
      unit: 'global',
      unitPrice: 0,
      total: 0
    };
    updateItems([...budget.items, newItem]);
  };

  // Trasladar automáticamente los datos de la calculadora de suelo a la tabla de ítems
  const handleApplySoilCalc = (calc: SoilCalculation) => {
    setBudget(prev => ({ ...prev, soilCalculation: calc }));

    // Crear o actualizar items sugeridos
    const newItems: BudgetItem[] = [...budget.items];

    // 1. Agregar viajes de camión si calculó viajes
    if (calc.truckTrips > 0) {
      const existingTruckIndex = newItems.findIndex(i => i.name.toLowerCase().includes('camión') || i.name.toLowerCase().includes('camion'));
      const truckCatalogItem = catalog.find(c => c.category === 'transporte' && c.name.includes(`${calc.truckCapacityM3}`)) ||
                               catalog.find(c => c.category === 'transporte');
      const unitPrice = truckCatalogItem?.defaultPrice || 70000;

      if (existingTruckIndex >= 0) {
        newItems[existingTruckIndex].quantity = calc.truckTrips;
        newItems[existingTruckIndex].total = calc.truckTrips * newItems[existingTruckIndex].unitPrice;
      } else {
        newItems.push({
          id: `item_truck_${Date.now()}`,
          category: 'transporte',
          name: `Retiro de suelo con Camión Volcador (${calc.truckCapacityM3} m³)`,
          description: `Retiro y vuelco de suelo esponjado estimado (${calc.looseVolumeM3} m³ totales)`,
          quantity: calc.truckTrips,
          unit: 'viajes',
          unitPrice,
          total: calc.truckTrips * unitPrice
        });
      }
    }

    // 2. Agregar maquinaria sugerida (Bobcat o Retro según tipo de trabajo)
    const isExcavation = calc.workType === 'excavacion_pileta' || calc.workType === 'zanja_cimientos';
    const machineCatalogItem = isExcavation
      ? catalog.find(c => c.id === 'retro_pala')
      : catalog.find(c => c.id === 'bobcat_mini');

    const machineHours = isExcavation ? calc.estimatedHoursRetro : calc.estimatedHoursBobcat;

    if (machineCatalogItem && machineHours > 0) {
      const existingMachineIndex = newItems.findIndex(i => i.id === machineCatalogItem.id);
      if (existingMachineIndex >= 0) {
        newItems[existingMachineIndex].quantity = machineHours;
        newItems[existingMachineIndex].total = machineHours * newItems[existingMachineIndex].unitPrice;
      } else {
        newItems.push({
          id: machineCatalogItem.id,
          category: 'maquinaria',
          name: machineCatalogItem.name,
          description: `Operación y maquinado estimado para ${calc.bankVolumeM3} m³ de suelo`,
          quantity: machineHours,
          unit: machineCatalogItem.unit,
          unitPrice: machineCatalogItem.defaultPrice,
          total: machineHours * machineCatalogItem.defaultPrice
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
        description: 'Logística de ida y vuelta para maquinaria vial',
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
      confetti({ particleCount: 60, spread: 50, origin: { y: 0.8 } });
    } catch {
      // Ignorar si confetti falla
    }
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleOpenPreview = () => {
    onPreview(budget);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* SECCIÓN 1: Datos del Cliente y Obra */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
              <User className="w-4 h-4" />
            </div>
            <h3 className="font-bold text-slate-900 text-sm">
              1. Datos del Cliente y Ubicación de Obra
            </h3>
          </div>
          <span className="font-mono text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
            Nº {budget.code}
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre del Cliente *
            </label>
            <input
              type="text"
              required
              placeholder="Ej. Juan Pérez / Constructora XYZ"
              value={budget.client.name}
              onChange={(e) => setBudget({ ...budget, client: { ...budget.client, name: e.target.value } })}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              WhatsApp / Teléfono *
            </label>
            <input
              type="text"
              placeholder="Ej. +54 9 11 2345-6789"
              value={budget.client.phone}
              onChange={(e) => setBudget({ ...budget, client: { ...budget.client, phone: e.target.value } })}
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Ubicación / Dirección de la Obra
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Barrio Los Álamos, Lote 45"
                value={budget.project.location}
                onChange={(e) => setBudget({ ...budget, project: { ...budget.project, location: e.target.value } })}
                className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
              <MapPin className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Título / Descripción del Trabajo
            </label>
            <div className="relative">
              <input
                type="text"
                placeholder="Ej. Desmonte, nivelación y relleno con tosca"
                value={budget.project.title}
                onChange={(e) => setBudget({ ...budget, project: { ...budget.project, title: e.target.value } })}
                className="w-full pl-8 pr-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
              />
              <FileText className="w-4 h-4 text-slate-400 absolute left-2.5 top-2.5" />
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 2: Calculadora de Suelo */}
      <SoilCalculatorCard
        initialData={budget.soilCalculation}
        onApplyToBudget={handleApplySoilCalc}
      />

      {/* SECCIÓN 3: Desglose de Maquinarias, Materiales y Servicios */}
      <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 mb-4 border-b border-slate-100 gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-700">
              <Shovel className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm">
                2. Ítems, Maquinarias y Recursos del Presupuesto
              </h3>
              <p className="text-xs text-slate-500">
                Podés usar los botones rápidos o agregar ítems personalizados libremente.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleAddCustomItem}
            className="self-start sm:self-auto px-3 py-1.5 text-xs font-bold rounded-lg border border-slate-300 hover:bg-slate-50 text-slate-700 flex items-center gap-1.5 transition"
          >
            <Plus className="w-3.5 h-3.5 text-amber-600" />
            <span>+ Agregar Ítem Libre</span>
          </button>
        </div>

        {/* Botones de Agregado Rápido desde Catálogo */}
        <div className="mb-4 p-3 bg-slate-50/80 rounded-xl border border-slate-200/80">
          <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500 block mb-2 flex items-center gap-1">
            <Sparkles className="w-3 h-3 text-amber-500" />
            Agregar rápido desde tu catálogo:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {catalog.map(catItem => (
              <button
                key={catItem.id}
                type="button"
                onClick={() => handleAddCatalogItem(catItem)}
                className="px-2.5 py-1 text-xs font-medium rounded-lg bg-white border border-slate-200 hover:border-amber-400 hover:bg-amber-50/40 text-slate-800 transition flex items-center gap-1 shadow-2xs"
              >
                <Plus className="w-3 h-3 text-amber-600" />
                <span>{catItem.name}</span>
                <span className="text-[10px] text-slate-400 font-mono font-bold">
                  ({formatCurrency(catItem.defaultPrice, companySettings.currency)}/{catItem.unit})
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Tabla de Ítems */}
        {budget.items.length === 0 ? (
          <div className="text-center py-10 border border-dashed border-slate-300 rounded-xl bg-slate-50/50">
            <Truck className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-xs font-semibold text-slate-600">No hay ítems en el presupuesto todavía</p>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Hacé clic en los botones rápidos de arriba o traslada el cálculo de la calculadora de suelo.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 font-bold uppercase tracking-wider text-[11px] border-y border-slate-200">
                  <th className="py-2.5 px-3">Ítem / Tarea</th>
                  <th className="py-2.5 px-2 w-24 text-center">Cantidad</th>
                  <th className="py-2.5 px-2 w-24 text-center">Unidad</th>
                  <th className="py-2.5 px-3 w-36 text-right">Precio Unit. ({companySettings.currency})</th>
                  <th className="py-2.5 px-3 w-36 text-right">Subtotal</th>
                  <th className="py-2.5 px-2 w-10 text-center"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {budget.items.map((item, index) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition group">
                    <td className="py-2 px-3">
                      <input
                        type="text"
                        value={item.name}
                        onChange={(e) => handleItemChange(index, 'name', e.target.value)}
                        className="w-full font-bold text-slate-900 px-2 py-1 rounded border border-transparent focus:border-amber-400 focus:bg-white focus:outline-none"
                      />
                      <input
                        type="text"
                        placeholder="Descripción o detalle adicional (opcional)"
                        value={item.description || ''}
                        onChange={(e) => handleItemChange(index, 'description', e.target.value)}
                        className="w-full text-[11px] text-slate-500 px-2 py-0.5 rounded border border-transparent focus:border-amber-300 focus:bg-white focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        value={item.quantity || ''}
                        onChange={(e) => handleItemChange(index, 'quantity', parseFloat(e.target.value) || 0)}
                        className="w-20 px-2 py-1 text-center font-bold text-slate-900 rounded border border-slate-200 focus:border-amber-500 focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-2 text-center">
                      <select
                        value={item.unit}
                        onChange={(e) => handleItemChange(index, 'unit', e.target.value)}
                        className="px-2 py-1 text-xs font-medium text-slate-600 rounded border border-slate-200 bg-white focus:outline-none"
                      >
                        <option value="hs">hs</option>
                        <option value="días">días</option>
                        <option value="viajes">viajes</option>
                        <option value="m³">m³</option>
                        <option value="m²">m²</option>
                        <option value="flete">flete</option>
                        <option value="global">global</option>
                        <option value="un">un</option>
                      </select>
                    </td>

                    <td className="py-2 px-3 text-right">
                      <input
                        type="number"
                        min="0"
                        value={item.unitPrice || ''}
                        onChange={(e) => handleItemChange(index, 'unitPrice', parseFloat(e.target.value) || 0)}
                        className="w-28 px-2 py-1 text-right font-bold text-slate-800 rounded border border-slate-200 focus:border-amber-500 focus:outline-none"
                      />
                    </td>

                    <td className="py-2 px-3 text-right font-black text-slate-900 text-sm">
                      {formatCurrency(item.total, companySettings.currency)}
                    </td>

                    <td className="py-2 px-2 text-center">
                      <button
                        type="button"
                        onClick={() => handleRemoveItem(index)}
                        className="p-1 text-slate-300 hover:text-rose-600 rounded transition opacity-60 group-hover:opacity-100"
                        title="Eliminar ítem"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* SECCIÓN 4: Totales, Margen Comercial y Condiciones */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Condiciones de Pago y Validez */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-slate-200 p-5 shadow-xs space-y-4">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100">
            3. Condiciones Comerciales
          </h3>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Forma de Pago y Condiciones
            </label>
            <textarea
              rows={3}
              value={budget.paymentTerms}
              onChange={(e) => setBudget({ ...budget, paymentTerms: e.target.value })}
              placeholder="Ej. 50% de anticipo al ingresar los equipos a la obra, saldo contra finalización de los trabajos."
              className="w-full px-3 py-2 text-xs font-medium rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500 shadow-2xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Validez de la Oferta (días)
              </label>
              <input
                type="number"
                min="1"
                value={budget.validityDays}
                onChange={(e) => setBudget({ ...budget, validityDays: parseInt(e.target.value, 10) || 15 })}
                className="w-full px-3 py-1.5 text-xs font-semibold rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Observaciones Generales
              </label>
              <input
                type="text"
                placeholder="Ej. No incluye retiro de tocones mayores a 50cm"
                value={budget.generalNotes || ''}
                onChange={(e) => setBudget({ ...budget, generalNotes: e.target.value })}
                className="w-full px-3 py-1.5 text-xs font-medium rounded-lg border border-slate-200 focus:outline-none focus:ring-2 focus:ring-amber-500"
              />
            </div>
          </div>
        </div>

        {/* Panel Financiero y Totales */}
        <div className="lg:col-span-6 bg-white rounded-2xl border border-amber-300 p-5 shadow-sm space-y-3.5">
          <h3 className="font-bold text-slate-900 text-sm pb-2 border-b border-slate-100 flex items-center justify-between">
            <span>4. Resumen Económico</span>
            <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
              Cálculo Automático
            </span>
          </h3>

          {/* Subtotal Directo */}
          <div className="flex justify-between items-center text-xs">
            <span className="font-semibold text-slate-600">Subtotal de Costos Directos:</span>
            <span className="font-extrabold text-slate-900 text-sm">
              {formatCurrency(budget.subtotalItems, companySettings.currency)}
            </span>
          </div>

          {/* Margen de Ganancia */}
          <div className="p-3 bg-amber-50/60 rounded-xl border border-amber-200/80">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-xs font-bold text-amber-900 flex items-center gap-1">
                <Percent className="w-3.5 h-3.5 text-amber-600" />
                Margen de Ganancia / Imprevistos (%):
              </span>
              <span className="text-xs font-mono font-bold text-amber-950">
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
                className="w-full accent-amber-500 cursor-pointer"
              />
              <span className="text-xs font-extrabold bg-white px-2 py-0.5 rounded border border-amber-300 min-w-12 text-center text-amber-900">
                {budget.marginPercent}%
              </span>
            </div>

            <div className="flex gap-1.5 mt-2">
              {[15, 20, 25, 30].map(val => (
                <button
                  key={val}
                  type="button"
                  onClick={() => handleMarginChange(val)}
                  className={`text-[10px] font-bold px-2 py-0.5 rounded border transition ${
                    budget.marginPercent === val
                      ? 'bg-amber-500 text-white border-amber-500'
                      : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
                  }`}
                >
                  {val}%
                </button>
              ))}
            </div>
          </div>

          {/* Opciones de IVA y Descuento */}
          <div className="grid grid-cols-2 gap-3 text-xs pt-1">
            <label className="flex items-center gap-2 p-2 rounded-lg border border-slate-200 cursor-pointer hover:bg-slate-50">
              <input
                type="checkbox"
                checked={budget.includeTax}
                onChange={(e) => {
                  const recalculated = recalculateBudget(
                    budget.items,
                    budget.marginPercent,
                    e.target.checked,
                    budget.taxPercent,
                    budget.discountPercent
                  );
                  setBudget(prev => ({ ...prev, ...recalculated }));
                }}
                className="rounded text-amber-500 focus:ring-amber-400"
              />
              <span className="font-semibold text-slate-700">Incluir IVA (+{budget.taxPercent}%)</span>
            </label>

            <div className="flex items-center gap-1.5 p-2 rounded-lg border border-slate-200">
              <span className="text-slate-600 font-semibold text-[11px]">Descuento %:</span>
              <input
                type="number"
                min="0"
                max="50"
                value={budget.discountPercent || ''}
                onChange={(e) => {
                  const val = parseFloat(e.target.value) || 0;
                  const recalculated = recalculateBudget(
                    budget.items,
                    budget.marginPercent,
                    budget.includeTax,
                    budget.taxPercent,
                    val
                  );
                  setBudget(prev => ({ ...prev, ...recalculated }));
                }}
                className="w-14 px-1.5 py-0.5 text-right font-bold rounded border border-slate-200"
                placeholder="0"
              />
            </div>
          </div>

          {/* Total Final Destacado */}
          <div className="p-4 rounded-xl bg-slate-900 text-white flex items-center justify-between shadow-md">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-amber-400 block">
                Total Presupuestado
              </span>
              <span className="text-[11px] text-slate-400">
                {budget.items.length} ítems cargados
              </span>
            </div>
            <div className="text-right">
              <span className="text-2xl font-black text-amber-400 font-mono tracking-tight">
                {formatCurrency(budget.total, companySettings.currency)}
              </span>
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleSaveBudget}
              className={`flex-1 py-2.5 px-4 rounded-xl text-xs font-bold transition flex items-center justify-center gap-2 shadow-xs ${
                isSaved
                  ? 'bg-emerald-600 text-white'
                  : 'bg-slate-100 hover:bg-slate-200 text-slate-800'
              }`}
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4 text-slate-600" />}
              <span>{isSaved ? '¡Guardado con éxito!' : 'Guardar Presupuesto'}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPreview}
              className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-amber-500 hover:bg-amber-600 text-white transition flex items-center justify-center gap-2 shadow-sm shadow-amber-500/25 active:scale-98"
            >
              <Eye className="w-4 h-4" />
              <span>Ver Formal (PDF / WhatsApp)</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
