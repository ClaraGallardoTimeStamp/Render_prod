import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import Chart from 'chart.js/auto';
import { API_BASE, CATEGORY_TRANSLATIONS, getSolidColor, getPastelColor, getLocality, isEditableKey, type View } from '../lib/constants';
import { exportAuditTable } from '../lib/exportExcel';
import { ExcelDownloadButton } from '../components/ui/ExcelDownloadButton';

import { Header } from '../components/ui/Header';
import { Sidebar } from '../components/ui/Sidebar';
import { DataTable } from '../components/ui/DataTable';
import { DetailModal } from '../components/ui/DetailModal';

// ─── Tipos ────────────────────────────────────────────────────────────────────

interface Toast { type: 'success' | 'error'; message: string; }
interface SortConfig { key: string | null; direction: 'asc' | 'desc'; }

// ─── Componente principal ────────────────────────────────────────────────────

export function DataAnalysis() {
    const navigate = useNavigate();

    // Estado de autenticación
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail') || 'Consultor';

    // Estado de datos
    const [allData, setAllData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    // Estado de UI
    const [isDark, setIsDark] = useState(true);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [locationFilter, setLocationFilter] = useState('');
    const [tableFilter, setTableFilter] = useState('');
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [tableSearch, setTableSearch] = useState('');
    const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [toast, setToast] = useState<Toast | null>(null);

    // Refs para el donut chart
    const donutChartRef = useRef<HTMLCanvasElement>(null);
    const donutChartInstance = useRef<Chart | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ── Auth guard ───────────────────────────────────────────────────────────
    useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);

    // ── Toast timer cleanup on unmount ───────────────────────────────────────
    useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);

    // ── Dark mode ────────────────────────────────────────────────────────────
    useEffect(() => {
        document.documentElement.classList.toggle('dark', isDark);
    }, [isDark]);

    // ── Carga de estadísticas ─────────────────────────────────────────────────
    useEffect(() => {
        if (!token) return;
        fetch(`${API_BASE}/api/estadisticas`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setSummaryData(data); })
            .catch(err => console.error('Error estadísticas:', err));
    }, [token]);

    // ── Carga de todos los datos ──────────────────────────────────────────────
    useEffect(() => {
        if (summaryData.length === 0 || !token) return;
        setIsLoadingData(true);
        Promise.all(
            summaryData.map(cat =>
                fetch(`${API_BASE}/api/datos/${cat.name}`, { headers: { Authorization: `Bearer ${token}` } })
                    .then(r => r.ok ? r.json() : [])
                    .then((data: any[]) => data.map(item => ({ ...item, _categoria: cat.name })))
                    .catch(() => [])
            )
        ).then(results => {
            setAllData(results.flat());
            setIsLoadingData(false);
        });
    }, [summaryData, token]);

    // ── Localidades disponibles ───────────────────────────────────────────────
    const availableLocalities = useMemo(() =>
        [...new Set(allData.map(getLocality).filter((l): l is string => !!l?.trim()))].sort()
    , [allData]);

    // ── Categorías disponibles (condicionadas a localidad) ────────────────────
    const availableCategories = useMemo(() => {
        if (!locationFilter) return summaryData.map(c => c.name).sort();
        const cats = new Set<string>();
        allData.forEach(row => {
            const loc = getLocality(row);
            if (loc === locationFilter && row._categoria) cats.add(row._categoria);
        });
        return Array.from(cats).sort();
    }, [allData, summaryData, locationFilter]);

    // ── Datos filtrados por localidad + categoría ─────────────────────────────
    const filteredAllData = useMemo(() => {
        return allData.filter(row => {
            const loc = getLocality(row);
            const matchLoc = locationFilter ? loc === locationFilter : true;
            const matchCat = tableFilter ? row._categoria === tableFilter : true;
            return matchLoc && matchCat;
        });
    }, [allData, locationFilter, tableFilter]);

    // ── Estadísticas del dashboard ────────────────────────────────────────────
    const dashboardStats = useMemo(() => {
        if (filteredAllData.length === 0) return null;
        let complete = 0, enRevision = 0, incomplete = 0;
        filteredAllData.forEach(row => {
            const keys = Object.keys(row).filter(isEditableKey);
            const hasEmpty = keys.some(k => {
                const v = row[k];
                return v === null || v === undefined || String(v).trim() === '';
            });
            if (!hasEmpty) complete++;
            else if (row.auditoria_estado === 'En revisión') enRevision++;
            else incomplete++;
        });
        const total = filteredAllData.length;
        return { total, complete, enRevision, incomplete, percentComplete: total === 0 ? 0 : Math.round((complete / total) * 100) };
    }, [filteredAllData]);

    // ── Filas procesadas con _meta ────────────────────────────────────────────
    const processedRows = useMemo(() => {
        return filteredAllData.map(row => {
            const editableKeys = Object.keys(row).filter(isEditableKey);
            let filled = 0, missing = 0;
            editableKeys.forEach(k => {
                const v = row[k];
                if (v !== null && v !== undefined && String(v).trim() !== '') filled++;
                else missing++;
            });
            const total = editableKeys.length;
            const percent = total === 0 ? 100 : parseFloat(((filled / total) * 100).toFixed(2));
            const nombreValor = row.nombre || row.name || row.titulo || row.title || `Reg #${row.id ?? '-'}`;
            let fechaMod = '---';
            if (row.fecha_actualizacion) fechaMod = new Date(row.fecha_actualizacion).toLocaleDateString('es-ES');
            else if (row.fecha_creacion) fechaMod = new Date(row.fecha_creacion).toLocaleDateString('es-ES');
            return {
                ...row,
                _meta: { nombreValor, numCampos: total, missingFieldsCount: missing, percent, editableKeys, fechaMod, isComplete: missing === 0 }
            };
        });
    }, [filteredAllData]);

    // ── Filas filtradas + ordenadas (vista de datos) ──────────────────────────
    const filteredAndSortedRows = useMemo(() => {
        let result = processedRows.filter(row => {
            const matchSearch = row._meta.nombreValor.toLowerCase().includes(tableSearch.toLowerCase());
            const matchIncomplete = showOnlyIncomplete ? !row._meta.isComplete : true;
            return matchSearch && matchIncomplete;
        });
        if (sortConfig.key) {
            const key = sortConfig.key;
            result = [...result].sort((a, b) => {
                let aVal = a._meta[key] !== undefined ? a._meta[key] : a[key];
                let bVal = b._meta[key] !== undefined ? b._meta[key] : b[key];
                if (typeof aVal === 'string') aVal = aVal.toLowerCase();
                if (typeof bVal === 'string') bVal = bVal.toLowerCase();
                if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
                if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
                return 0;
            });
        }
        return result;
    }, [processedRows, tableSearch, showOnlyIncomplete, sortConfig]);

    // ── Resumen de categorías para pills del dashboard ────────────────────────
    const sortedSummary = useMemo(() => {
        if (!locationFilter) {
            return [...summaryData]
                .map(cat => ({
                    ...cat,
                    percent: cat.total === 0 ? 0 : parseFloat(((cat.complete / cat.total) * 100).toFixed(2))
                }))
                .sort((a, b) => b.percent - a.percent);
        }
        const catStats: Record<string, { name: string; total: number; complete: number }> = {};
        filteredAllData.forEach(row => {
            const cat = row._categoria;
            if (!catStats[cat]) catStats[cat] = { name: cat, total: 0, complete: 0 };
            catStats[cat].total++;
            const keys = Object.keys(row).filter(isEditableKey);
            const hasEmpty = keys.some(k => { const v = row[k]; return v === null || v === undefined || String(v).trim() === ''; });
            if (!hasEmpty) catStats[cat].complete++;
        });
        return Object.values(catStats)
            .map(c => ({ ...c, percent: c.total === 0 ? 0 : parseFloat(((c.complete / c.total) * 100).toFixed(2)) }))
            .sort((a, b) => b.percent - a.percent);
    }, [summaryData, filteredAllData, locationFilter]);

    // ── Donut chart (después de dashboardStats) ──────────────────────────────
    useEffect(() => {
        if (currentView !== 'dashboard' || !dashboardStats || !donutChartRef.current) return;
        if (donutChartInstance.current) donutChartInstance.current.destroy();
        donutChartInstance.current = new Chart(donutChartRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Completos', 'En Revisión', 'Incompletos'],
                datasets: [{
                    data: [dashboardStats.complete, dashboardStats.enRevision, dashboardStats.incomplete],
                    backgroundColor: [
                        isDark ? '#34d399' : '#059669',
                        isDark ? '#fbbf24' : '#d97706',
                        isDark ? '#f87171' : '#dc2626',
                    ],
                    borderWidth: 0,
                    cutout: '80%',
                } as any]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
        return () => { donutChartInstance.current?.destroy(); };
    }, [dashboardStats, isDark, currentView]); // eslint-disable-line react-hooks/exhaustive-deps

    // ── Handlers ──────────────────────────────────────────────────────────────

    const showToast = (type: Toast['type'], message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ type, message });
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
        }));
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };

    const exportTableToExcel = () =>
        exportAuditTable(filteredAndSortedRows, locationFilter, tableFilter);

    const handleDownloadRevisionExcel = async (tabla: string, id: string, nombre: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/api/auditoria/excel/${tabla}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
            showToast('error', 'Error al generar el Excel. ¿Está el servidor activo?');
            throw new Error('Server error');
        }

        setAllData(prev => prev.map(r =>
            (String(r.id) === String(id) && r._categoria === tabla)
                ? { ...r, auditoria_estado: 'En revisión' }
                : r
        ));
        setSelectedRow((prev: any) => prev ? { ...prev, auditoria_estado: 'En revisión' } : null);

        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Revision_${nombre.replace(/\s+/g, '_')}.xlsx`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        window.URL.revokeObjectURL(url);

        showToast('success', 'Registro marcado "En revisión" y Excel descargado.');
    };

    // ── Render ────────────────────────────────────────────────────────────────

    return (
        <div className={`flex flex-col h-screen ${isDark ? 'dark bg-gray-900' : 'bg-warm-50'}`}>

            {/* Toast */}
            {toast && (
                <div className="fixed top-6 left-6 z-[100] bg-white dark:bg-gray-800 shadow-2xl rounded-xl overflow-hidden flex flex-col min-w-[300px] border border-warm-100 dark:border-gray-700 slide-up">
                    <div className="p-4 flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <div className="w-8 h-8 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center text-green-600 shrink-0">
                                <i className="ph-fill ph-check-circle text-xl"></i>
                            </div>
                        ) : (
                            <div className="w-8 h-8 rounded-full bg-red-100 dark:bg-red-900/30 flex items-center justify-center text-primary shrink-0">
                                <i className="ph-fill ph-warning-circle text-xl"></i>
                            </div>
                        )}
                        <span className="text-sm font-bold text-gray-800 dark:text-gray-200">{toast.message}</span>
                    </div>
                    <div className="h-1.5 w-full bg-warm-100 dark:bg-gray-700">
                        <div className={`h-full ${toast.type === 'success' ? 'bg-green-500' : 'bg-primary'} animate-toast-progress`}></div>
                    </div>
                </div>
            )}

            <Header userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 flex overflow-hidden">
                <Sidebar
                    isDark={isDark}
                    setIsDark={setIsDark}
                    currentView={currentView}
                    setCurrentView={setCurrentView}
                    locationFilter={locationFilter}
                    setLocationFilter={setLocationFilter}
                    tableFilter={tableFilter}
                    setTableFilter={setTableFilter}
                    availableLocalities={availableLocalities}
                    availableCategories={availableCategories}
                    isLoadingData={isLoadingData}
                />

                <main className="flex-1 overflow-y-auto p-6 bg-transparent dark:bg-gray-900/40 transition-all custom-scrollbar">

                    {/* ── DASHBOARD ── */}
                    {currentView === 'dashboard' && (
                        <div className="max-w-5xl mx-auto space-y-6 fade-in">

                            {/* Ecosistema de Calidad */}
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-warm-100 dark:border-gray-700 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-48 h-48 bg-primary/5 rounded-full -mr-24 -mt-24 pointer-events-none"></div>
                                <h2 className="text-2xl font-black mb-3 tracking-tight dark:text-white">Ecosistema de Calidad</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-gray-500 dark:text-gray-400 leading-relaxed text-sm font-medium">
                                    <p>Centralizamos la supervisión de los activos de <strong>Badajoz</strong>. Nuestro motor analiza cada registro en AWS para asegurar que la información cumpla con los estándares de excelencia requeridos.</p>
                                    <p>Utilice las métricas para identificar carencias, priorizar la actualización y exportar informes. El objetivo es una ficha de datos 100% enriquecida para el mercado global.</p>
                                </div>
                            </div>

                            {/* Donut + Tarjetas de stats */}
                            {dashboardStats ? (
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-warm-100 dark:border-gray-700 flex flex-col lg:flex-row items-center gap-10">
                                    <div className="w-full lg:w-1/4 flex flex-col items-center">
                                        <div className="relative h-40 w-40">
                                            <canvas ref={donutChartRef}></canvas>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-3xl font-black dark:text-white">{dashboardStats.percentComplete}%</span>
                                            </div>
                                        </div>
                                        <span className="text-[10px] uppercase tracking-widest text-gray-400 font-black mt-2">
                                            {locationFilter ? `Salud en ${locationFilter}` : tableFilter ? 'Salud de Categoría' : 'Salud Global'}
                                        </span>
                                    </div>
                                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                                        {[
                                            { label: 'Completos',   value: dashboardStats.complete,   color: 'text-green-500', icon: 'ph-shield-check' },
                                            { label: 'En Revisión', value: dashboardStats.enRevision, color: 'text-amber-500', icon: 'ph-clock' },
                                            { label: 'Incompletos', value: dashboardStats.incomplete, color: 'text-primary',   icon: 'ph-warning-circle' },
                                            { label: 'Total',       value: dashboardStats.total,      color: 'text-blue-500',  icon: 'ph-database' },
                                        ].map(({ label, value, color, icon }) => (
                                            <div key={label} className="p-5 rounded-xl bg-warm-50 dark:bg-gray-900/30 border border-warm-100 dark:border-gray-700/50 flex justify-between items-center">
                                                <div>
                                                    <div className={`text-[10px] font-black uppercase tracking-widest mb-1 ${color}`}>{label}</div>
                                                    <div className={`text-2xl font-black ${color}`}>{value.toLocaleString()}</div>
                                                </div>
                                                <i className={`ph-fill ${icon} ${color} text-2xl opacity-80`}></i>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-white dark:bg-gray-800 p-12 rounded-2xl shadow-sm border border-warm-100 dark:border-gray-700 flex items-center justify-center text-gray-400 gap-3">
                                    <i className="ph ph-spinner animate-spin text-2xl text-primary"></i>
                                    <span className="font-bold">Cargando datos...</span>
                                </div>
                            )}

                            {/* Pills de categorías */}
                            {!tableFilter && sortedSummary.length > 0 && (
                                <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border border-warm-100 dark:border-gray-700">
                                    <h4 className="text-xs font-black text-gray-400 uppercase tracking-[0.2em] mb-6 flex items-center">
                                        <i className="ph-fill ph-circles-four mr-2 text-primary text-lg"></i>
                                        Calidad de Categorías
                                    </h4>
                                    <div className="flex flex-wrap gap-3">
                                        {sortedSummary.map(cat => (
                                            <button
                                                key={cat.name}
                                                onClick={() => { setTableFilter(cat.name); setCurrentView('data'); }}
                                                className="pill-transition flex items-center px-4 py-2 rounded-xl border border-opacity-10 hover:shadow-lg transition-all group"
                                                style={{
                                                    backgroundColor: getPastelColor(cat.percent, isDark),
                                                    borderColor: isDark ? getSolidColor(cat.percent, isDark) : 'transparent'
                                                }}
                                            >
                                                <span className="text-[11px] font-bold text-gray-700 dark:text-gray-300 mr-3 group-hover:text-primary">
                                                    {CATEGORY_TRANSLATIONS[cat.name] || cat.name}
                                                </span>
                                                <span
                                                    className="text-[10px] font-black px-2 py-0.5 rounded-lg text-white"
                                                    style={{ backgroundColor: getSolidColor(cat.percent, isDark) }}
                                                >
                                                    {cat.percent}%
                                                </span>
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── VISTA DE DATOS ── */}
                    {currentView === 'data' && (
                        <div className="max-w-full mx-auto h-full flex flex-col fade-in space-y-4">

                            {/* Barra de herramientas */}
                            <div className="flex flex-col md:flex-row items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-xl border border-warm-100 dark:border-gray-700 shadow-sm gap-4">
                                <div className="flex items-center gap-6 w-full md:w-auto">
                                    <div className="relative w-full md:w-80">
                                        <i className="ph ph-magnifying-glass absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"></i>
                                        <input
                                            type="text"
                                            placeholder="Localizar..."
                                            value={tableSearch}
                                            onChange={e => setTableSearch(e.target.value)}
                                            className="w-full pl-10 pr-4 py-2 border border-warm-200 dark:border-gray-600 rounded-xl text-xs bg-warm-50 dark:bg-gray-900 outline-none focus:ring-2 focus:ring-primary/20 font-semibold text-gray-700 dark:text-gray-300"
                                        />
                                    </div>
                                    <label className="flex items-center gap-3 text-[10px] font-black uppercase text-gray-400 cursor-pointer whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={showOnlyIncomplete}
                                            onChange={e => setShowOnlyIncomplete(e.target.checked)}
                                            className="rounded text-primary focus:ring-primary w-4 h-4 border-warm-200 cursor-pointer"
                                        />
                                        <span>Solo Faltantes</span>
                                    </label>
                                </div>
                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                    <span className="text-xs text-gray-400 font-medium">{filteredAndSortedRows.length} registros</span>
                                    <ExcelDownloadButton
                                        onClick={exportTableToExcel}
                                        label="Exportar Excel"
                                        size="sm"
                                        disabled={filteredAndSortedRows.length === 0}
                                    />
                                </div>
                            </div>

                            <DataTable
                                rows={filteredAndSortedRows}
                                onSort={handleSort}
                                sortConfig={sortConfig}
                                tableFilter={tableFilter}
                                isDark={isDark}
                                onRowClick={setSelectedRow}
                            />
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de detalle */}
            <DetailModal
                isOpen={!!selectedRow}
                data={selectedRow}
                isDark={isDark}
                onClose={() => setSelectedRow(null)}
                onDownloadExcel={handleDownloadRevisionExcel}
            />
        </div>
    );
}
