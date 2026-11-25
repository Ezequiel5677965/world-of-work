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
  generateNextBudgetCode,
  getUserIdentifier 
} from './utils/storage';
import { syncAllBudgets } from './utils/supabaseSync';
import { supabase } from './utils/supabaseClient';

export const App: React.FC = () => {
  const [currentUser, setCurrentUser] = useState<AuthUser | null>(() => getCurrentSession());
  const [currentView, setCurrentView] = useState<'editor' | 'history'>('editor');
  
  const currentUserId = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
  
  const [companySettings, setCompanySettings] = useState<CompanySettings>(() => getCompanySettings(currentUserId));
  const [catalog, setCatalog] = useState<PriceCatalogItem[]>(() => getPriceCatalog(currentUserId));
  const [savedBudgets, setSavedBudgets] = useState<Budget[]>(() => getSavedBudgets(currentUserId));
  const [activeBudget, setActiveBudget] = useState<Budget>(() => createInitialBudget([], getCompanySettings(currentUserId), currentUserId));
  const [previewBudget, setPreviewBudget] = useState<Budget | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);

  // Escuchar inicio de sesión de Google (OAuth) a través de Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const u: AuthUser = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'usuario',
          name: session.user.user_metadata?.full_name || session.user.email || 'Usuario Google',
          email: session.user.email || '',
          role: 'admin'
        };
        setCurrentUser(u);
        localStorage.setItem('wow_auth_session_v1', JSON.stringify(u));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        const u: AuthUser = {
          id: session.user.id,
          username: session.user.email?.split('@')[0] || 'usuario',
          name: session.user.user_metadata?.full_name || session.user.email || 'Usuario Google',
          email: session.user.email || '',
          role: 'admin'
        };
        setCurrentUser(u);
        localStorage.setItem('wow_auth_session_v1', JSON.stringify(u));
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Recargar datos aislados y sincronizar cuando cambia el usuario activo
  useEffect(() => {
    if (currentUser) {
      const uid = currentUser.id || currentUser.email || currentUser.username;
      const userBudgets = getSavedBudgets(uid);
      const userSettings = getCompanySettings(uid);
      const userCatalog = getPriceCatalog(uid);

      setSavedBudgets(userBudgets);
      setCompanySettings(userSettings);
      setCatalog(userCatalog);
      setActiveBudget(createInitialBudget(userBudgets, userSettings, uid));

      // Sincronizar en la nube ÚNICAMENTE los datos de este usuario
      syncAllBudgets(uid).then(res => {
        if (res.success) {
          setSavedBudgets(getSavedBudgets(uid));
        }
      });
    }
  }, [currentUser]);

  const handleManualSync = async () => {
    if (!currentUser) return;
    const uid = currentUser.id || currentUser.email || currentUser.username;
    setIsSyncing(true);
    try {
      const res = await syncAllBudgets(uid);
      if (res.success) {
        setSavedBudgets(getSavedBudgets(uid));
      }
    } finally {
      setTimeout(() => setIsSyncing(false), 500);
    }
  };

  // Creación de presupuesto completamente limpio (sin datos de relleno por defecto)
  function createInitialBudget(existingList: Budget[], settings: CompanySettings, uid?: string): Budget {
    const ownerId = uid || (currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined);
    return {
      id: `budget_${Date.now()}`,
      userId: ownerId,
      code: generateNextBudgetCode(existingList),
      createdAt: new Date().toISOString(),
      client: {
        name: '',
        phone: '',
        email: '',
        location: '',
        notes: ''
      },
      project: {
        title: '',
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
      paymentTerms: '',
      validityDays: settings.defaultValidityDays || 15,
      status: 'borrador',
      generalNotes: ''
    };
  }

  const handleNewBudget = () => {
    const uid = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
    const fresh = createInitialBudget(savedBudgets, companySettings, uid);
    setActiveBudget(fresh);
    setCurrentView('editor');
  };

  const handleSaveBudget = (budgetToSave: Budget) => {
    const uid = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
    saveBudget(budgetToSave, uid);
    const updatedList = getSavedBudgets(uid);
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
    const uid = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
    const duplicated: Budget = {
      ...budget,
      id: `budget_${Date.now()}`,
      userId: uid,
      code: generateNextBudgetCode(savedBudgets),
      createdAt: new Date().toISOString(),
      status: 'borrador'
    };
    saveBudget(duplicated, uid);
    const updated = getSavedBudgets(uid);
    setSavedBudgets(updated);
    setActiveBudget(duplicated);
    setCurrentView('editor');
  };

  const handleDeleteBudget = (id: string) => {
    const uid = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
    deleteBudget(id, uid);
    const updated = getSavedBudgets(uid);
    setSavedBudgets(updated);
    if (activeBudget.id === id) {
      setActiveBudget(createInitialBudget(updated, companySettings, uid));
    }
  };

  const handleUpdateStatus = (id: string, newStatus: BudgetStatus) => {
    const uid = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
    const target = savedBudgets.find(b => b.id === id);
    if (target) {
      const updated = { ...target, status: newStatus };
      saveBudget(updated, uid);
      setSavedBudgets(getSavedBudgets(uid));
      if (activeBudget.id === id) {
        setActiveBudget(updated);
      }
    }
  };

  const handleSaveSettings = (newSettings: CompanySettings, newCatalog: PriceCatalogItem[]) => {
    const uid = currentUser ? (currentUser.id || currentUser.email || currentUser.username) : undefined;
    saveCompanySettings(newSettings, uid);
    savePriceCatalog(newCatalog, uid);
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
          supabase.auth.signOut().catch(() => {});
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
