// src/app/components/ui/Sidebar.tsx

// 1. Importamos React
import React from 'react';

// 2. Definimos qué variables y funciones externas necesita este componente para funcionar.
// Esto nos garantiza que TypeScript nos avise si olvidamos pasarle algún dato.
interface SidebarProps {
  isDark: boolean;
  setIsDark: (val: boolean) => void;
  currentView: string;
  setCurrentView: (view: string) => void;
  locationFilter: string;
  setLocationFilter: (val: string) => void;
  tableFilter: string;
  setTableFilter: (val: string) => void;
  availableLocalities: string[];
  availableCategories: string[];
  isExporting: boolean;
  onExport: () => void;
}

// 3. Creamos el componente recibiendo esas propiedades
export function Sidebar({ isDark, setIsDark, currentView, setCurrentView }: SidebarProps) {
  return (
    <aside className="w-64 bg-white dark:bg-gray-800 border-r border-warm-100 dark:border-gray-700 flex flex-col z-20 shrink-0 shadow-sm">
        <div className="p-4 space-y-4">
            {/* Navegación principal */}
            <nav className="space-y-1">
                <button 
                    // Al hacer clic, usamos la función que nos pasaron desde el componente padre
                    onClick={() => setCurrentView('dashboard')} 
                    className={`w-full flex items-center px-3 py-2 text-xs font-bold rounded-lg transition-all ${currentView === 'dashboard' ? 'text-[#EB1C23] bg-red-50 dark:bg-red-900/20' : 'text-gray-500'}`}
                >
                    <i className="ph ph-house-line text-lg mr-3"></i> Home
                </button>
                <button 
                    onClick={() => setCurrentView('data')} 
                    className={`w-full flex items-center px-3 py-2 text-xs font-bold rounded-lg transition-all ${currentView === 'data' ? 'text-[#EB1C23] bg-red-50 dark:bg-red-900/20' : 'text-gray-500'}`}
                >
                    <i className="ph ph-database text-lg mr-3"></i> Gestión de Datos
                </button>
            </nav>
        </div>

        {/* Botón inferior de cambio de tema oscuro/claro */}
        <div className="mt-auto p-4 border-t border-warm-100 dark:border-gray-700">
            <div className="flex items-center justify-between px-2">
                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tema</span>
                <button 
                    onClick={() => setIsDark(!isDark)} 
                    className="p-1.5 rounded-lg text-gray-400 hover:text-[#EB1C23] transition-all"
                >
                    {isDark ? <i className="ph-fill ph-moon text-lg"></i> : <i className="ph ph-sun text-lg"></i>}
                </button>
            </div>
        </div>
    </aside>
  );
}