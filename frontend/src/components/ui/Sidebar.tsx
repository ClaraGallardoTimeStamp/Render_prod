import { CATEGORY_TRANSLATIONS, type View } from '../../lib/constants';

interface SidebarProps {
    isDark: boolean;
    setIsDark: (val: boolean) => void;
    currentView: View;
    setCurrentView: (view: View) => void;
    locationFilter: string;
    setLocationFilter: (val: string) => void;
    tableFilter: string;
    setTableFilter: (val: string) => void;
    availableLocalities: string[];
    availableCategories: string[];
    isLoadingData: boolean;
}

export function Sidebar({
    isDark, setIsDark, currentView, setCurrentView,
    locationFilter, setLocationFilter,
    tableFilter, setTableFilter,
    availableLocalities, availableCategories,
    isLoadingData,
}: SidebarProps) {
    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r border-warm-100 dark:border-gray-700 flex flex-col z-20 shrink-0 shadow-sm">
            <div className="p-4 space-y-4">

                {/* Filtro por Localidad */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center justify-between ml-1">
                        <span className="flex items-center">
                            <i className="ph-fill ph-map-pin mr-2 text-primary"></i>
                            Filtro por localidad
                        </span>
                        {isLoadingData && <i className="ph ph-spinner animate-spin text-primary" title="Cargando datos..."></i>}
                    </label>
                    <select
                        value={locationFilter}
                        onChange={e => { setLocationFilter(e.target.value); setTableFilter(''); }}
                        className="w-full py-2 px-2 bg-warm-50 dark:bg-gray-900 border border-warm-200 dark:border-gray-700 rounded-lg text-[11px] font-bold focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                        <option value="">Todas las localidades</option>
                        {availableLocalities.map(loc => (
                            <option key={loc} value={loc}>{loc}</option>
                        ))}
                    </select>
                </div>

                {/* Filtro por Categoría */}
                <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase text-gray-400 tracking-widest flex items-center ml-1">
                        <i className="ph-fill ph-funnel mr-2 text-primary"></i>
                        Filtro por categoría
                    </label>
                    <select
                        value={tableFilter}
                        onChange={e => { setTableFilter(e.target.value); if (e.target.value) setCurrentView('data'); }}
                        className="w-full py-2 px-2 bg-warm-50 dark:bg-gray-900 border border-warm-200 dark:border-gray-700 rounded-lg text-[11px] font-bold focus:ring-2 focus:ring-primary outline-none transition-all cursor-pointer text-gray-700 dark:text-gray-300"
                    >
                        <option value="">Todas las categorías</option>
                        {availableCategories.map(cat => (
                            <option key={cat} value={cat}>{CATEGORY_TRANSLATIONS[cat] || cat}</option>
                        ))}
                    </select>
                </div>

                <div className="h-px bg-warm-100 dark:bg-gray-700"></div>

                {/* Navegación */}
                <nav className="space-y-1">
                    <button
                        onClick={() => { setCurrentView('dashboard'); setTableFilter(''); setLocationFilter(''); }}
                        className={`w-full flex items-center px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                            currentView === 'dashboard'
                                ? 'text-primary bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-warm-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        <i className="ph ph-house-line text-lg mr-3"></i> Home
                    </button>
                    <button
                        onClick={() => setCurrentView('data')}
                        className={`w-full flex items-center px-3 py-2 text-xs font-bold rounded-lg transition-all ${
                            currentView === 'data'
                                ? 'text-primary bg-primary-50 dark:bg-primary-900/20 shadow-sm'
                                : 'text-gray-500 dark:text-gray-400 hover:bg-warm-100 dark:hover:bg-gray-700/50'
                        }`}
                    >
                        <i className="ph ph-database text-lg mr-3"></i> Gestión de Datos
                    </button>
                </nav>
            </div>

            {/* Zona inferior: Toggle Tema */}
            <div className="mt-auto p-4 border-t border-warm-100 dark:border-gray-700">
                <div className="flex items-center justify-between px-2">
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Tema</span>
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="p-1.5 rounded-lg text-gray-400 hover:text-primary transition-all"
                    >
                        {isDark
                            ? <i className="ph-fill ph-moon text-lg"></i>
                            : <i className="ph ph-sun text-lg"></i>
                        }
                    </button>
                </div>
            </div>
        </aside>
    );
}
