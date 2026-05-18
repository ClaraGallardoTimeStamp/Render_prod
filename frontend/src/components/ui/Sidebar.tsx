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

const selectClass = `
    w-full py-2.5 px-3
    bg-surface-overlay border border-white/[0.06]
    rounded-xl text-[11px] font-medium
    text-ink-secondary
    focus:outline-none focus:border-accent-violet/40 focus:ring-1 focus:ring-accent-violet/20
    transition-all cursor-pointer
    appearance-none
`.trim();

const labelClass = "text-[9px] font-bold uppercase text-ink-tertiary tracking-[0.12em] flex items-center justify-between ml-0.5";

export function Sidebar({
    isDark, setIsDark, currentView, setCurrentView,
    locationFilter, setLocationFilter,
    tableFilter, setTableFilter,
    availableLocalities, availableCategories,
    isLoadingData,
}: SidebarProps) {
    return (
        <aside className="w-60 bg-surface-base border-r border-white/[0.05] flex flex-col z-20 shrink-0">
            <div className="p-4 space-y-5 flex-1">

                {/* Locality filter */}
                <div className="space-y-2">
                    <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                            <i className="ph-fill ph-map-pin text-accent-violet text-xs"></i>
                            Localidad
                        </span>
                        {isLoadingData && (
                            <i className="ph ph-spinner animate-spin text-accent-violet/60 text-xs" title="Cargando..."></i>
                        )}
                    </label>
                    <div className="relative">
                        <select
                            value={locationFilter}
                            onChange={e => { setLocationFilter(e.target.value); setTableFilter(''); }}
                            className={selectClass}
                        >
                            <option value="">Todas las localidades</option>
                            {availableLocalities.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                        <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary text-xs pointer-events-none"></i>
                    </div>
                </div>

                {/* Category filter */}
                <div className="space-y-2">
                    <label className={labelClass}>
                        <span className="flex items-center gap-1.5">
                            <i className="ph-fill ph-funnel text-accent-purple text-xs"></i>
                            Categoría
                        </span>
                    </label>
                    <div className="relative">
                        <select
                            value={tableFilter}
                            onChange={e => { setTableFilter(e.target.value); if (e.target.value) setCurrentView('data'); }}
                            className={selectClass}
                        >
                            <option value="">Todas las categorías</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{CATEGORY_TRANSLATIONS[cat] || cat}</option>
                            ))}
                        </select>
                        <i className="ph ph-caret-down absolute right-3 top-1/2 -translate-y-1/2 text-ink-tertiary text-xs pointer-events-none"></i>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-white/[0.05]" />

                {/* Navigation */}
                <nav className="space-y-1">
                    {[
                        {
                            view: 'dashboard' as View,
                            icon: 'ph-squares-four',
                            label: 'Dashboard',
                            onClick: () => { setCurrentView('dashboard'); setTableFilter(''); setLocationFilter(''); }
                        },
                        {
                            view: 'data' as View,
                            icon: 'ph-rows',
                            label: 'Gestión de Datos',
                            onClick: () => setCurrentView('data')
                        },
                    ].map(({ view, icon, label, onClick }) => {
                        const isActive = currentView === view;
                        return (
                            <button
                                key={view}
                                onClick={onClick}
                                className={`
                                    w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12px] font-semibold
                                    transition-all duration-150 text-left
                                    ${isActive
                                        ? 'bg-accent-violet/10 text-accent-violet border border-accent-violet/15'
                                        : 'text-ink-tertiary hover:text-ink-secondary hover:bg-white/[0.03] border border-transparent'
                                    }
                                `}
                            >
                                <i className={`ph-bold ${icon} text-base leading-none`}></i>
                                {label}
                            </button>
                        );
                    })}
                </nav>
            </div>

            {/* Bottom: theme toggle */}
            <div className="p-4 border-t border-white/[0.05]">
                <div className="flex items-center justify-between px-1">
                    <span className="text-[9px] text-ink-tertiary font-bold uppercase tracking-[0.12em]">Apariencia</span>
                    <button
                        onClick={() => setIsDark(!isDark)}
                        className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-tertiary hover:text-ink-secondary hover:bg-white/[0.05] transition-all"
                        title={isDark ? 'Modo claro' : 'Modo oscuro'}
                    >
                        <i className={`${isDark ? 'ph-fill ph-moon' : 'ph ph-sun'} text-base leading-none`}></i>
                    </button>
                </div>
            </div>
        </aside>
    );
}
