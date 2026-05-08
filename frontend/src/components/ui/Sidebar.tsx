// src/app/components/ui/Sidebar.tsx

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
export function Sidebar(props: SidebarProps) {

    const {
        isDark, setIsDark, currentView, setCurrentView,
        locationFilter, setLocationFilter,
        tableFilter, setTableFilter,
        availableLocalities, availableCategories,
        isExporting, onExport
    } = props;

    return (
        <aside className="w-64 bg-white dark:bg-gray-800 border-r flex flex-col z-20 shadow-sm">
            <div className="p-4 space-y-4">
                {/* Navegación principal ... (tus botones Home y Gestión de Datos) ... */}

                {/* NUEVO: Sección de Filtros Dinámicos */}
                <div className="mt-8 space-y-4 border-t border-warm-100 dark:border-gray-700 pt-4">

                    {/* Selector de Localidad */}
                    <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">
                            Filtro de Localidad
                        </label>
                        <select
                            value={locationFilter}
                            // Al cambiar, actualizamos el estado en DataAnalysis.tsx
                            onChange={(e) => {
                                setLocationFilter(e.target.value);
                                // Limpiamos la categoría si cambiamos de localidad, para evitar inconsistencias
                                setTableFilter('');
                            }}
                            className="w-full text-xs bg-gray-50 dark:bg-gray-900 border rounded-lg p-2 text-gray-700 dark:text-gray-300"
                        >
                            <option value="">Todas las localidades</option>
                            {/* Iteramos sobre el array generado dinámicamente */}
                            {availableLocalities.map(loc => (
                                <option key={loc} value={loc}>{loc}</option>
                            ))}
                        </select>
                    </div>

                    {/* Selector de Categoría (dependiente de la localidad) */}
                    <div>
                        <label className="text-[10px] uppercase text-gray-500 font-bold mb-1 block">
                            Categoría (Tabla)
                        </label>
                        <select
                            value={tableFilter}
                            onChange={(e) => setTableFilter(e.target.value)}
                            // Deshabilitamos si no hay categorías disponibles
                            disabled={availableCategories.length === 0}
                            className="w-full text-xs bg-gray-50 dark:bg-gray-900 border rounded-lg p-2 text-gray-700 dark:text-gray-300 disabled:opacity-50"
                        >
                            <option value="">Todas las categorías</option>
                            {availableCategories.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            {/* Zona inferior: Botón Excel y Tema */}
            <div className="mt-auto p-4 border-t border-warm-100 dark:border-gray-700 space-y-4">

                {/* RESTAURACIÓN UX: Botón de Exportación con estado Loading */}
                <button
                    onClick={onExport}
                    disabled={isExporting} // Bloquea múltiples clics
                    className="w-full flex items-center justify-center space-x-2 bg-green-600 hover:bg-green-700 disabled:bg-green-800 text-white p-2 rounded-lg text-sm font-bold transition-colors"
                >
                    {/* Cambiamos texto e icono según el estado */}
                    {isExporting ? (
                        <>
                            <i className="ph ph-spinner animate-spin text-lg"></i>
                            <span>Generando...</span>
                        </>
                    ) : (
                        <>
                            <i className="ph ph-file-xls text-lg"></i>
                            <span>Descargar Excel</span>
                        </>
                    )}
                </button>

                {/* Toggle Tema (tu código original) ... */}
            </div>
        </aside>
    );
}