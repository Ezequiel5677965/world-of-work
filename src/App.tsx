import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { BudgetForm } from './components/BudgetForm';
import { BudgetHistory } from './components/BudgetHistory';
import { BudgetPreviewModal } from './components/BudgetPreviewModal';
import { PriceCatalogModal } from './components/PriceCatalogModal';
import { LoginView } from './components/LoginView';
import { Budget, BudgetStatus, CompanySettings, PriceCatalogItem } from './types/budget';
import { AuthUser } from './types/auth';
import { getCurrentSession, logoutUser } from './utils/auth';
import { 
  getCompanySettings, 
  saveCompanySettings, 
  getPriceCatalog, 
  savePriceCatalog, 
  getSavedBudgets, 
  saveBudget, 
  deleteBudget, 
  generateNextBudgetCode 
} from './utils/storage';
import { calculateSoilVolume } from './utils/soilCalculations';
import { syncAllBudgets } from './utils/supabaseSync';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentSession());
  const [currentView, setCurrentView] = useState<'editor' | 'history'>('editor');
  const [companySettings, setCompanySettings] = useState<CompanySettings>(getCompanySettings());
  const [catalog, setCatalog] = useState<PriceCatalogItem[]>(getPriceCatalog());
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>(getSavedBudgets());
  const [activeBudget, setActiveBudget] = useState<Budget>(() => createInitialBudget(savedBudgets, companySettings));
  const [previewBudget, setPreviewBudget] = useState<Budget | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Sincronización automática con Supabase al iniciar sesión
  useEffect(() => {
    if (currentUser) {
      syncAllBudgets().then(res => {
        if (res.success) {
          setSavedBudgets(getSavedBudgets());
        }
      });
    }
  }, [currentUser]);

  const handleManualSync = async () => {
    setIsSyncing(true);
    try {
      const res = await syncAllBudgets();
      if (res.success) {
        setSavedBudgets(getSavedBudgets());
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Inicializar presupuesto de ejemplo si no hay ninguno
  useEffect(() => {
    if (savedBudgets.length === 0) {
      const sampleSoilCalc = calculateSoilVolume({
        workType: 'desmonte_nivelacion',
        shape: 'rectangular',
        length: 25,
        width: 12,
        depth: 0.35,
        soilType: 'tierra_negra',
        truckCapacityM3: 8
      });

      const sampleBudget: Budget = {
        id: `sample_${Date.now()}`,
        code: generateNextBudgetCode([]),
        createdAt: new Date().toISOString(),
        client: {
          name: 'Constructora del Valle / Arq. Martín Gómez',
          phone: '+54 9 11 4455-8899',
          email: 'mgomez@obras.com',
          location: 'Barrio Náutico El Faro, Lote 114'
        },
        project: {
          title: 'Desmonte, Nivelación y Aporte de Tosca Compactada',
          location: 'El Faro Lote 114, Tigre',
          type: 'desmonte_nivelacion',
          startDate: new Date(Date.now() + 86400000 * 3).toISOString()
        },
        soilCalculation: sampleSoilCalc,
        items: [
          {
            id: 'retro_pala',
            category: 'maquinaria',
            name: 'Retroexcavadora / Pala Mixta (por hora)',
            description: 'Apertura, desmonte de capa vegetal y carga a camión',
            quantity: 6,
            unit: 'hs',
            unitPrice: 55000,
            total: 330000
          },
          {
            id: 'mini_cargadora',
            category: 'maquinaria',
            name: 'Minicargadora frontal (por hora)',
            description: 'Desparrame y perfilado fino de suelo',
            quantity: 8,
            unit: 'hs',
            unitPrice: 38000,
            total: 304000
          },
          {
            id: 'flete_carreton',
            category: 'transporte',
            name: 'Flete Carretón (Traslado de maquinaria ida y vuelta)',
            description: 'Traslado seguro de retro y minicargadora a obra',
            quantity: 1,
            unit: 'flete',
            unitPrice: 120000,
            total: 120000
          },
          {
            id: 'camion_retiro_8m3',
            category: 'transporte',
            name: 'Retiro de suelo con Camión Volcador (8 m³)',
            description: '17 viajes estimados de tierra negra esponjada',
            quantity: 17,
            unit: 'viajes',
            unitPrice: 65000,
            total: 1105000
          },
          {
            id: 'tosca_relleno',
            category: 'material',
            name: 'Tosca de primera para relleno (por m³ puesto en obra)',
            description: 'Aporte de tosca limpia para base de platea',
            quantity: 40,
            unit: 'm³',
            unitPrice: 16500,
            total: 660000
          }
        ],
        subtotalItems: 2519000,
        marginPercent: 20,
        marginAmount: 503800,
        subtotalWithMargin: 3022800,
        includeTax: false,
        taxPercent: 21,
        taxAmount: 0,
        discountPercent: 0,
        discountAmount: 0,
        total: 3022800,
        paymentTerms: '50% de anticipo para reserva de equipos y flete, 50% al finalizar las tareas.',
        validityDays: 15,
        status: 'aprobado',
        generalNotes: 'Sujeto a condiciones climáticas favorables para el ingreso de bateas.'
      };

      saveBudget(sampleBudget);
      setSavedBudgets([sampleBudget]);
      setActiveBudget(sampleBudget);
    }
  }, []);

  function createInitialBudget(existingList: Budget[], settings: CompanySettings): Budget {
    return {
      id: `budget_${Date.now()}`,
      code: generateNextBudgetCode(existingList),
      createdAt: new Date().toISOString(),
      client: {
        name: '',
        phone: '',
        location: ''
      },
      project: {
        title: 'Movimiento de Suelo y Nivelación',
        location: '',
        type: 'desmonte_nivelacion'
      },
      items: [],
      subtotalItems: 0,
      marginPercent: settings.defaultMargin || 20,
      marginAmount: 0,
      subtotalWithMargin: 0,
      includeTax: false,
      taxPercent: 21,
      taxAmount: 0,
      discountPercent: 0,
      discountAmount: 0,
      total: 0,
      paymentTerms: '50% de anticipo al inicio de los trabajos, saldo al finalizar.',
      validityDays: settings.defaultValidityDays || 15,
      status: 'borrador'
    };
  }

  const handleNewBudget = () => {
    const fresh = createInitialBudget(savedBudgets, companySettings);
    setActiveBudget(fresh);
    setCurrentView('editor');
  };

  const handleSaveBudget = (budgetToSave: Budget) => {
    saveBudget(budgetToSave);
    const updatedList = getSavedBudgets();
    setSavedBudgets(updatedList);
    setActiveBudget(budgetToSave);
  };

  const handleSelectBudget = (budget: Budget) => {
    setPreviewBudget(budget);
  };

  const handleEditBudget = (budget: Budget) => {
    setActiveBudget(budget);
    setCurrentView('editor');
    setPreviewBudget(null);
  };

  const handleDuplicateBudget = (budget: Budget) => {
    const duplicated: Budget = {
      ...budget,
      id: `budget_${Date.now()}`,
      code: generateNextBudgetCode(savedBudgets),
      createdAt: new Date().toISOString(),
      status: 'borrador'
    };
    saveBudget(duplicated);
    setSavedBudgets(getSavedBudgets());
    setActiveBudget(duplicated);
    setCurrentView('editor');
  };

  const handleDeleteBudget = (id: string) => {
    deleteBudget(id);
    const updated = getSavedBudgets();
    setSavedBudgets(updated);
    if (activeBudget.id === id) {
      setActiveBudget(createInitialBudget(updated, companySettings));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: BudgetStatus) => {
    const target = savedBudgets.find(b => b.id === id);
    if (target) {
      const updated = { ...target, status: newStatus };
      saveBudget(updated);
      setSavedBudgets(getSavedBudgets());
      if (activeBudget.id === id) {
        setActiveBudget(updated);
      }
    }
  };

  const handleSaveSettings = (newSettings: CompanySettings, newCatalog: PriceCatalogItem[]) => {
    saveCompanySettings(newSettings);
    savePriceCatalog(newCatalog);
    setCompanySettings(newSettings);
    setCatalog(newCatalog);
  };

  if (!currentUser) {
    return <LoginView onLoginSuccess={(user) => setCurrentUser(user)} />;
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      <Header
        currentView={currentView}
        onNavigate={setCurrentView}
        onNewBudget={handleNewBudget}
        onOpenSettings={() => setIsSettingsOpen(true)}
        savedCount={savedBudgets.length}
        companySettings={companySettings}
        currentUser={currentUser}
        onLogout={() => {
          logoutUser();
          setCurrentUser(null);
        }}
        onSync={handleManualSync}
        isSyncing={isSyncing}
      />

      <main className="flex-1 pb-16 no-print">
        {currentView === 'editor' ? (
          <BudgetForm
            key={activeBudget.id}
            initialBudget={activeBudget}
            companySettings={companySettings}
            catalog={catalog}
            onSave={handleSaveBudget}
            onPreview={(b) => setPreviewBudget(b)}
          />
        ) : (
          <BudgetHistory
            budgets={savedBudgets}
            companySettings={companySettings}
            onSelectBudget={handleSelectBudget}
            onEditBudget={handleEditBudget}
            onDuplicateBudget={handleDuplicateBudget}
            onDeleteBudget={handleDeleteBudget}
            onUpdateStatus={handleUpdateStatus}
            onNewBudget={handleNewBudget}
          />
        )}
      </main>

      {/* Modal de Vista Previa & Impresión */}
      {previewBudget && (
        <BudgetPreviewModal
          isOpen={Boolean(previewBudget)}
          budget={previewBudget}
          companySettings={companySettings}
          onClose={() => setPreviewBudget(null)}
          onEdit={() => handleEditBudget(previewBudget)}
        />
      )}

      {/* Modal de Ajustes & Catálogo */}
      <PriceCatalogModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={companySettings}
        catalog={catalog}
        onSave={handleSaveSettings}
      />
    </div>
  );
};
