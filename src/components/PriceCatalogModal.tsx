import React, { useState } from 'react';
import { X, Save, RotateCcw, Building2, DollarSign, Plus, Trash2, Check, ShieldCheck, Lock, KeyRound, AlertCircle } from 'lucide-react';
import { CompanySettings, PriceCatalogItem, ItemCategory } from '../types/budget';
import { DEFAULT_CATALOG, DEFAULT_COMPANY_SETTINGS } from '../data/defaultCatalog';
import { changeUserPassword } from '../utils/auth';

interface PriceCatalogModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CompanySettings;
  catalog: PriceCatalogItem[];
  onSave: (newSettings: CompanySettings, newCatalog: PriceCatalogItem[]) => void;
}

export const PriceCatalogModal: React.FC<PriceCatalogModalProps> = ({
  isOpen,
  onClose,
  settings,
  catalog,
  onSave,
}) => {
  const [activeTab, setActiveTab] = useState<'tarifas' | 'empresa' | 'seguridad'>('tarifas');
  const [formSettings, setFormSettings] = useState<CompanySettings>(settings);
  const [formCatalog, setFormCatalog] = useState<PriceCatalogItem[]>(catalog);
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Estados para cambio de contraseña
  const [targetUser, setTargetUser] = useState<'admin' | 'ezequiel'>('admin');
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passError, setPassError] = useState<string | null>(null);
  const [passSuccess, setPassSuccess] = useState<string | null>(null);

  // Nuevo item temporal
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ItemCategory>('maquinaria');
  const [newItemUnit, setNewItemUnit] = useState<PriceCatalogItem['unit']>('hs');
  const [newItemPrice, setNewItemPrice] = useState<number>(0);

  if (!isOpen) return null;

  const handlePriceChange = (id: string, newPrice: number) => {
    setFormCatalog(prev =>
      prev.map(item => (item.id === id ? { ...item, defaultPrice: Math.max(0, newPrice) } : item))
    );
  };

  const handleRemoveCatalogItem = (id: string) => {
    setFormCatalog(prev => prev.filter(item => item.id !== id));
  };

  const handleAddCatalogItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName.trim()) return;

    const newItem: PriceCatalogItem = {
      id: `custom_${Date.now()}`,
      category: newItemCategory,
      name: newItemName.trim(),
      unit: newItemUnit,
      defaultPrice: Math.max(0, newItemPrice),
      description: 'Ítem personalizado.'
    };

    setFormCatalog(prev => [...prev, newItem]);
    setNewItemName('');
    setNewItemPrice(0);
  };

  const handleResetDefaults = () => {
    if (confirm('¿Deseas restaurar los precios y valores sugeridos por defecto?')) {
      setFormCatalog(DEFAULT_CATALOG);
      setFormSettings(DEFAULT_COMPANY_SETTINGS);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);
    setPassSuccess(null);

    if (newPassword !== confirmPassword) {
      setPassError('Las nuevas contraseñas no coinciden.');
      return;
    }

    const res = await changeUserPassword(targetUser, currentPassword, newPassword);
    if (res.success) {
      setPassSuccess(`¡Contraseña para "${targetUser}" actualizada con éxito!`);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPassSuccess(null), 3500);
    } else {
      setPassError(res.error || 'No se pudo actualizar la contraseña.');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formSettings, formCatalog);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-xs flex items-start justify-center p-2 sm:p-6 no-print">
      <div className="bg-white max-w-3xl w-full border-2 border-slate-900 flex flex-col my-2 sm:my-6 max-h-[92vh] shadow-2xl">
        
        {/* Cabecera */}
        <div className="flex items-center justify-between px-4 sm:px-6 py-3 border-b-2 border-slate-900 bg-slate-950 text-white">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 bg-[#e1261c] text-white">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-sm font-black uppercase tracking-tight">
                Tarifas & Datos de Empresa
              </h2>
              <p className="text-[10px] text-slate-400 font-mono">
                Valores base por defecto para maquinaria y obras
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-white transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-300 px-4 sm:px-6 bg-slate-100 gap-4">
          <button
            onClick={() => setActiveTab('tarifas')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'tarifas'
                ? 'border-[#e1261c] text-[#e1261c]'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            <span>Precios de Máquinas ({formCatalog.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('empresa')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'empresa'
                ? 'border-[#e1261c] text-[#e1261c]'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Datos de Membrete</span>
          </button>

          <button
            onClick={() => setActiveTab('seguridad')}
            className={`py-2.5 text-xs font-black uppercase tracking-wider border-b-2 flex items-center gap-1.5 transition cursor-pointer ${
              activeTab === 'seguridad'
                ? 'border-[#e1261c] text-[#e1261c]'
                : 'border-transparent text-slate-600 hover:text-slate-950'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Seguridad & Clave</span>
          </button>
        </div>

        {/* Contenido scrolleable */}
        <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4">
          {activeTab === 'tarifas' && (
            <div className="space-y-5">
              {(['maquinaria', 'transporte', 'material', 'mano_de_obra'] as ItemCategory[]).map(cat => {
                const itemsInCat = formCatalog.filter(i => i.category === cat);
                if (itemsInCat.length === 0) return null;

                const catTitles: Record<ItemCategory, string> = {
                  maquinaria: '🚜 Maquinaria & Compactación (Minicargadora / Equipos)',
                  transporte: '🚚 Camiones, Volquetes y Fletes en Carretón',
                  material: '⛰️ Áridos, Tosca y Relleno de Suelo',
                  mano_de_obra: '👷 Mano de Obra y Servicios Especializados',
                  personalizado: 'Otros'
                };

                return (
                  <div key={cat} className="space-y-1.5">
                    <h3 className="text-[11px] font-black uppercase tracking-wider text-slate-900 border-b border-slate-300 pb-1">
                      {catTitles[cat]}
                    </h3>
                    <div className="divide-y divide-slate-200 border border-slate-300 bg-white">
                      {itemsInCat.map(item => (
                        <div key={item.id} className="p-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-50 transition">
                          <div className="min-w-0 flex-1">
                            <p className="text-xs font-bold text-slate-950 truncate">
                              {item.name}
                            </p>
                            <p className="text-[10px] text-slate-500 truncate">
                              {item.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <span className="text-[10px] font-bold text-slate-600 bg-slate-100 px-1.5 py-0.5 border border-slate-200">
                              / {item.unit}
                            </span>
                            <div className="relative w-28">
                              <span className="absolute left-2 top-1 text-xs font-mono font-bold text-slate-400">
                                $
                              </span>
                              <input
                                type="number"
                                inputMode="decimal"
                                value={item.defaultPrice || ''}
                                onChange={(e) => handlePriceChange(item.id, parseFloat(e.target.value) || 0)}
                                className="w-full pl-5 pr-2 py-1 text-xs font-mono font-bold text-right border border-slate-300 focus:outline-none focus:border-[#e1261c]"
                              />
                            </div>
                            <button
                              type="button"
                              onClick={() => handleRemoveCatalogItem(item.id)}
                              className="text-slate-300 hover:text-rose-600 p-1 cursor-pointer"
                              title="Quitar"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                );
              })}

              {/* Formulario nuevo ítem */}
              <div className="p-3 border border-slate-300 bg-slate-50">
                <h4 className="text-[11px] font-black uppercase text-slate-900 mb-2 flex items-center gap-1">
                  <Plus className="w-3.5 h-3.5 text-[#e1261c]" />
                  <span>Agregar nuevo servicio o material al tarifario</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-12 gap-2">
                  <div className="sm:col-span-5">
                    <input
                      type="text"
                      placeholder="Nombre del servicio"
                      value={newItemName}
                      onChange={(e) => setNewItemName(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-bold bg-white border border-slate-300"
                    />
                  </div>
                  <div className="sm:col-span-3">
                    <select
                      value={newItemCategory}
                      onChange={(e) => setNewItemCategory(e.target.value as ItemCategory)}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-slate-300"
                    >
                      <option value="maquinaria">Maquinaria</option>
                      <option value="transporte">Transporte/Flete</option>
                      <option value="material">Material/Árido</option>
                      <option value="mano_de_obra">Mano de Obra</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2">
                    <select
                      value={newItemUnit}
                      onChange={(e) => setNewItemUnit(e.target.value as PriceCatalogItem['unit'])}
                      className="w-full px-2 py-1.5 text-xs font-bold bg-white border border-slate-300"
                    >
                      <option value="hs">hs</option>
                      <option value="días">días</option>
                      <option value="viajes">viajes</option>
                      <option value="m³">m³</option>
                      <option value="flete">flete</option>
                      <option value="global">global</option>
                    </select>
                  </div>
                  <div className="sm:col-span-2 flex gap-1">
                    <input
                      type="number"
                      inputMode="decimal"
                      placeholder="Precio $"
                      value={newItemPrice || ''}
                      onChange={(e) => setNewItemPrice(parseFloat(e.target.value) || 0)}
                      className="w-full px-2 py-1.5 text-xs font-mono font-bold bg-white border border-slate-300"
                    />
                    <button
                      type="button"
                      onClick={handleAddCatalogItem}
                      className="px-3 py-1.5 bg-slate-950 text-white hover:bg-slate-800 text-xs font-black cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'empresa' && (
            <div className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                    Nombre de la Empresa
                  </label>
                  <input
                    type="text"
                    value={formSettings.companyName}
                    onChange={(e) => setFormSettings({ ...formSettings, companyName: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                    placeholder="Nombre de la Empresa"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                    Titular / Responsable
                  </label>
                  <input
                    type="text"
                    value={formSettings.ownerName}
                    onChange={(e) => setFormSettings({ ...formSettings, ownerName: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                    placeholder="Nombre del Titular"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                    Teléfono / WhatsApp
                  </label>
                  <input
                    type="text"
                    inputMode="tel"
                    value={formSettings.phone}
                    onChange={(e) => setFormSettings({ ...formSettings, phone: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                    placeholder="Teléfono / WhatsApp"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                    Localidad / Base
                  </label>
                  <input
                    type="text"
                    value={formSettings.city}
                    onChange={(e) => setFormSettings({ ...formSettings, city: e.target.value })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                    placeholder="Ciudad / Localidad"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                  Datos Bancarios para Cobranzas (Alias / CBU)
                </label>
                <input
                  type="text"
                  value={formSettings.bankInfo}
                  onChange={(e) => setFormSettings({ ...formSettings, bankInfo: e.target.value })}
                  className="w-full px-3 py-2 text-xs font-mono font-bold border border-slate-300"
                  placeholder="Alias / CBU"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                    Margen Ganancia por defecto (%)
                  </label>
                  <input
                    type="number"
                    value={formSettings.defaultMargin}
                    onChange={(e) => setFormSettings({ ...formSettings, defaultMargin: parseFloat(e.target.value) || 0 })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-0.5">
                    Validez por defecto (Días)
                  </label>
                  <input
                    type="number"
                    value={formSettings.defaultValidityDays}
                    onChange={(e) => setFormSettings({ ...formSettings, defaultValidityDays: parseInt(e.target.value, 10) || 15 })}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                  />
                </div>
              </div>
            </div>
          )}

          {activeTab === 'seguridad' && (
            <div className="space-y-4 max-w-md mx-auto py-2">
              <div className="p-3 bg-slate-50 border border-slate-300 text-center">
                <ShieldCheck className="w-6 h-6 text-[#e1261c] mx-auto mb-1" />
                <h4 className="font-black text-xs uppercase tracking-wider text-slate-900">
                  Control de Acceso y Contraseña
                </h4>
                <p className="text-[11px] text-slate-500 mt-0.5">
                  Modificá las claves de acceso al sistema
                </p>
              </div>

              {passError && (
                <div className="p-2.5 bg-rose-50 border border-rose-300 text-rose-800 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passError}</span>
                </div>
              )}

              {passSuccess && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-300 text-emerald-800 text-xs font-bold flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{passSuccess}</span>
                </div>
              )}

              <form onSubmit={handleChangePassword} className="space-y-3 bg-white p-3 border border-slate-300">
                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Usuario a modificar
                  </label>
                  <select
                    value={targetUser}
                    onChange={(e) => setTargetUser(e.target.value as 'admin' | 'ezequiel')}
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300 bg-white"
                  >
                    <option value="admin">admin (Administrador general)</option>
                    <option value="ezequiel">ezequiel (Ezequiel)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Contraseña Actual
                  </label>
                  <input
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Mínimo 4 caracteres"
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase text-slate-700 mb-1">
                    Repetir Nueva Contraseña
                  </label>
                  <input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repetí la nueva contraseña"
                    className="w-full px-3 py-2 text-xs font-bold border border-slate-300"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-white font-black text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 cursor-pointer mt-2"
                >
                  <KeyRound className="w-3.5 h-3.5 text-[#e1261c]" />
                  <span>Actualizar Contraseña</span>
                </button>
              </form>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 sm:px-6 py-3 border-t-2 border-slate-900 bg-slate-100 flex items-center justify-between">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="text-xs text-slate-600 hover:text-slate-950 flex items-center gap-1 font-bold cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Restaurar sugeridos</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 border border-slate-300 bg-white cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              className={`px-4 py-1.5 text-xs font-black uppercase tracking-wider text-white transition flex items-center gap-1.5 cursor-pointer ${
                savedSuccess ? 'bg-emerald-600' : 'bg-[#e1261c] hover:bg-[#c81e15]'
              }`}
            >
              {savedSuccess ? (
                <>
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>¡Guardado!</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Guardar</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
