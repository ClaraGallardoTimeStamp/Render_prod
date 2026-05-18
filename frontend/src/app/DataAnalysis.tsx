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

interface Toast { type: 'success' | 'error'; message: string; }
interface SortConfig { key: string | null; direction: 'asc' | 'desc'; }

// ── Stat card ─────────────────────────────────────────────────────────────────

interface StatCardProps {
    label: string;
    value: number;
    icon: string;
    color: string;
    borderColor: string;
}

function StatCard({ label, value, icon, color, borderColor }: StatCardProps) {
    return (
        <div className="bg-surface-overlay border border-white/[0.05] rounded-2xl p-5 flex flex-col gap-3 relative overflow-hidden"
            style={{ borderTopColor: borderColor, borderTopWidth: 1 }}
        >
            <div className="flex items-center justify-between">
                <span className="text-[9px] font-bold uppercase tracking-[0.15em] text-ink-tertiary">{label}</span>
                <i className={`${icon} text-lg opacity-50`} style={{ color }}></i>
            </div>
            <span className="text-3xl font-bold text-ink-primary tabular-nums" style={{ color }}>
                {value.toLocaleString()}
            </span>
        </div>
    );
}

// ── Main component ────────────────────────────────────────────────────────────

export function DataAnalysis() {
    const navigate = useNavigate();
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail') || 'Consultor';

    const [allData, setAllData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [isLoadingData, setIsLoadingData] = useState(false);

    const [isDark, setIsDark] = useState(true);
    const [currentView, setCurrentView] = useState<View>('dashboard');
    const [locationFilter, setLocationFilter] = useState('');
    const [tableFilter, setTableFilter] = useState('');
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [tableSearch, setTableSearch] = useState('');
    const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
    const [sortConfig, setSortConfig] = useState<SortConfig>({ key: null, direction: 'asc' });
    const [toast, setToast] = useState<Toast | null>(null);

    const donutChartRef = useRef<HTMLCanvasElement>(null);
    const donutChartInstance = useRef<Chart | null>(null);
    const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => { if (!token) navigate('/login'); }, [token, navigate]);
    useEffect(() => () => { if (toastTimerRef.current) clearTimeout(toastTimerRef.current); }, []);
    useEffect(() => { document.documentElement.classList.toggle('dark', isDark); }, [isDark]);

    useEffect(() => {
        if (!token) return;
        fetch(`${API_BASE}/api/estadisticas`, { headers: { Authorization: `Bearer ${token}` } })
            .then(r => r.json())
            .then(data => { if (Array.isArray(data)) setSummaryData(data); })
            .catch(err => console.error('Error estadísticas:', err));
    }, [token]);

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
        ).then(results => { setAllData(results.flat()); setIsLoadingData(false); });
    }, [summaryData, token]);

    const availableLocalities = useMemo(() =>
        [...new Set(allData.map(getLocality).filter((l): l is string => !!l?.trim()))].sort()
    , [allData]);

    const availableCategories = useMemo(() => {
        if (!locationFilter) return summaryData.map(c => c.name).sort();
        const cats = new Set<string>();
        allData.forEach(row => {
            const loc = getLocality(row);
            if (loc === locationFilter && row._categoria) cats.add(row._categoria);
        });
        return Array.from(cats).sort();
    }, [allData, summaryData, locationFilter]);

    const filteredAllData = useMemo(() => allData.filter(row => {
        const loc = getLocality(row);
        const matchLoc = locationFilter ? loc === locationFilter : true;
        const matchCat = tableFilter ? row._categoria === tableFilter : true;
        return matchLoc && matchCat;
    }), [allData, locationFilter, tableFilter]);

    const dashboardStats = useMemo(() => {
        if (filteredAllData.length === 0) return null;
        let complete = 0, enRevision = 0, incomplete = 0;
        filteredAllData.forEach(row => {
            const keys = Object.keys(row).filter(isEditableKey);
            const hasEmpty = keys.some(k => { const v = row[k]; return v === null || v === undefined || String(v).trim() === ''; });
            if (!hasEmpty) complete++;
            else if (row.auditoria_estado === 'En revisión') enRevision++;
            else incomplete++;
        });
        const total = filteredAllData.length;
        return { total, complete, enRevision, incomplete, percentComplete: total === 0 ? 0 : Math.round((complete / total) * 100) };
    }, [filteredAllData]);

    const processedRows = useMemo(() => filteredAllData.map(row => {
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
        let fechaMod = '—';
        if (row.fecha_actualizacion) fechaMod = new Date(row.fecha_actualizacion).toLocaleDateString('es-ES');
        else if (row.fecha_creacion) fechaMod = new Date(row.fecha_creacion).toLocaleDateString('es-ES');
        return { ...row, _meta: { nombreValor, numCampos: total, missingFieldsCount: missing, percent, editableKeys, fechaMod, isComplete: missing === 0 } };
    }), [filteredAllData]);

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

    const sortedSummary = useMemo(() => {
        if (!locationFilter) {
            return [...summaryData]
                .map(cat => ({ ...cat, percent: cat.total === 0 ? 0 : parseFloat(((cat.complete / cat.total) * 100).toFixed(2)) }))
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

    // Donut chart — sage / gold / violet
    useEffect(() => {
        if (currentView !== 'dashboard' || !dashboardStats || !donutChartRef.current) return;
        if (donutChartInstance.current) donutChartInstance.current.destroy();
        donutChartInstance.current = new Chart(donutChartRef.current, {
            type: 'doughnut',
            data: {
                labels: ['Completos', 'En Revisión', 'Incompletos'],
                datasets: [{
                    data: [dashboardStats.complete, dashboardStats.enRevision, dashboardStats.incomplete],
                    backgroundColor: ['#A3B18A', '#D4AF37', '#A78BFA'],
                    borderWidth: 0,
                    cutout: '82%',
                } as any]
            },
            options: { responsive: true, maintainAspectRatio: false, plugins: { legend: { display: false } } }
        });
        return () => { donutChartInstance.current?.destroy(); };
    }, [dashboardStats, currentView]);

    const showToast = (type: Toast['type'], message: string) => {
        if (toastTimerRef.current) clearTimeout(toastTimerRef.current);
        setToast({ type, message });
        toastTimerRef.current = setTimeout(() => setToast(null), 5000);
    };

    const handleSort = (key: string) => {
        setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc' }));
    };

    const handleLogout = () => { localStorage.clear(); navigate('/login'); };
    const exportTableToExcel = () => exportAuditTable(filteredAndSortedRows, locationFilter, tableFilter);

    const handleDownloadRevisionExcel = async (tabla: string, id: string, nombre: string): Promise<void> => {
        const response = await fetch(`${API_BASE}/api/auditoria/excel/${tabla}/${id}`, {
            headers: { Authorization: `Bearer ${token}` }
        });
        if (!response.ok) {
            showToast('error', 'Error al generar el Excel. ¿Está el servidor activo?');
            throw new Error('Server error');
        }
        setAllData(prev => prev.map(r =>
            (String(r.id) === String(id) && r._categoria === tabla) ? { ...r, auditoria_estado: 'En revisión' } : r
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
        <div className={`flex flex-col h-screen ${isDark ? 'dark bg-surface-base' : 'bg-slate-50'}`}>

            {/* Toast */}
            {toast && (
                <div className="fixed top-5 left-5 z-[100] bg-surface-elevated border border-white/[0.08] shadow-elevated rounded-xl overflow-hidden flex flex-col min-w-[300px] slide-up">
                    <div className="px-4 py-3.5 flex items-center gap-3">
                        {toast.type === 'success' ? (
                            <div className="w-7 h-7 rounded-full bg-accent-sage-light/10 flex items-center justify-center text-accent-sage-light shrink-0">
                                <i className="ph-fill ph-check-circle text-lg"></i>
                            </div>
                        ) : (
                            <div className="w-7 h-7 rounded-full bg-accent-violet/10 flex items-center justify-center text-accent-violet shrink-0">
                                <i className="ph-fill ph-warning-circle text-lg"></i>
                            </div>
                        )}
                        <span className="text-[12px] font-medium text-ink-secondary">{toast.message}</span>
                    </div>
                    <div className="h-0.5 w-full bg-surface-highlight">
                        <div className={`h-full animate-toast-progress ${toast.type === 'success' ? 'bg-accent-sage-light' : 'bg-accent-violet'}`}></div>
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

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-surface-base/60">

                    {/* ── DASHBOARD ── */}
                    {currentView === 'dashboard' && (
                        <div className="max-w-5xl mx-auto space-y-5 fade-in">

                            {/* Editorial hero card */}
                            <div className="bg-surface-elevated border border-white/[0.05] rounded-2xl p-8 relative overflow-hidden">
                                {/* ambient glow */}
                                <div className="absolute top-0 right-0 w-64 h-64 bg-accent-violet/5 rounded-full -mr-32 -mt-32 pointer-events-none blur-3xl" />
                                <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-ink-tertiary mb-4">
                                    Sistema de Calidad de Datos
                                </p>
                                <h2 className="font-serif text-3xl font-semibold text-ink-primary mb-4 leading-snug">
                                    Ecosistema de Auditoría
                                </h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-[13px] text-ink-tertiary leading-relaxed font-normal">
                                    <p>
                                        Centralizamos la supervisión de los activos turísticos de <span className="text-ink-secondary font-medium">Badajoz</span>. Nuestro motor analítico examina cada registro en AWS para asegurar que la información cumpla los estándares de excelencia requeridos.
                                    </p>
                                    <p>
                                        Utilice las métricas para identificar carencias, priorizar actualizaciones y exportar informes de auditoría. El objetivo es una ficha de datos <span className="text-accent-sage-light font-medium">100% enriquecida</span> para el mercado global.
                                    </p>
                                </div>
                            </div>

                            {/* Donut + Stat cards */}
                            {dashboardStats ? (
                                <div className="bg-surface-elevated border border-white/[0.05] rounded-2xl p-8 flex flex-col lg:flex-row items-center gap-10">

                                    {/* Donut */}
                                    <div className="flex flex-col items-center gap-3 shrink-0">
                                        <div className="relative h-36 w-36">
                                            <canvas ref={donutChartRef}></canvas>
                                            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                                <span className="text-[28px] font-bold text-ink-primary tabular-nums">{dashboardStats.percentComplete}%</span>
                                                <span className="text-[8px] font-bold uppercase tracking-widest text-ink-tertiary mt-0.5">Salud</span>
                                            </div>
                                        </div>

                                        {/* Donut legend */}
                                        <div className="flex flex-col gap-1.5">
                                            {[
                                                { label: 'Completos',   color: '#A3B18A' },
                                                { label: 'En Revisión', color: '#D4AF37' },
                                                { label: 'Incompletos', color: '#A78BFA' },
                                            ].map(({ label, color }) => (
                                                <div key={label} className="flex items-center gap-2 text-[10px] text-ink-tertiary">
                                                    <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: color }} />
                                                    {label}
                                                </div>
                                            ))}
                                        </div>

                                        <span className="text-[9px] uppercase tracking-[0.2em] text-ink-tertiary font-bold">
                                            {locationFilter ? locationFilter : tableFilter ? 'Categoría' : 'Global'}
                                        </span>
                                    </div>

                                    {/* Stat cards grid */}
                                    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                                        <StatCard label="Completos"   value={dashboardStats.complete}   icon="ph-fill ph-shield-check"    color="#A3B18A" borderColor="#A3B18A" />
                                        <StatCard label="En Revisión" value={dashboardStats.enRevision} icon="ph-fill ph-clock"            color="#D4AF37" borderColor="#D4AF37" />
                                        <StatCard label="Incompletos" value={dashboardStats.incomplete} icon="ph-fill ph-warning-circle"   color="#A78BFA" borderColor="#A78BFA" />
                                        <StatCard label="Total"       value={dashboardStats.total}      icon="ph-fill ph-database"         color="#C084FC" borderColor="#C084FC" />
                                    </div>
                                </div>
                            ) : (
                                <div className="bg-surface-elevated border border-white/[0.05] rounded-2xl p-16 flex items-center justify-center text-ink-tertiary gap-3">
                                    <i className="ph ph-spinner animate-spin text-2xl text-accent-violet/60"></i>
                                    <span className="text-[13px] font-medium">Cargando datos…</span>
                                </div>
                            )}

                            {/* Category pills */}
                            {!tableFilter && sortedSummary.length > 0 && (
                                <div className="bg-surface-elevated border border-white/[0.05] rounded-2xl p-8">
                                    <div className="flex items-center gap-2 mb-6">
                                        <i className="ph-fill ph-circles-four text-accent-violet/60 text-base"></i>
                                        <h4 className="text-[9px] font-bold text-ink-tertiary uppercase tracking-[0.2em]">
                                            Calidad por Categoría
                                        </h4>
                                    </div>
                                    <div className="flex flex-wrap gap-2">
                                        {sortedSummary.map(cat => {
                                            const solidColor = getSolidColor(cat.percent, isDark);
                                            const pastelBg = getPastelColor(cat.percent, isDark);
                                            return (
                                                <button
                                                    key={cat.name}
                                                    onClick={() => { setTableFilter(cat.name); setCurrentView('data'); }}
                                                    className="pill-transition flex items-center gap-2.5 px-3.5 py-2 rounded-xl border border-white/[0.05] hover:border-white/[0.12] hover:scale-[1.02] transition-all text-left"
                                                    style={{ backgroundColor: pastelBg }}
                                                >
                                                    <span className="text-[11px] font-medium text-ink-secondary">
                                                        {CATEGORY_TRANSLATIONS[cat.name] || cat.name}
                                                    </span>
                                                    <span
                                                        className="text-[9px] font-bold px-2 py-0.5 rounded-lg text-surface-base tabular-nums"
                                                        style={{ backgroundColor: solidColor }}
                                                    >
                                                        {cat.percent}%
                                                    </span>
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {/* ── DATA VIEW ── */}
                    {currentView === 'data' && (
                        <div className="max-w-full mx-auto h-full flex flex-col fade-in gap-4">

                            {/* Toolbar */}
                            <div className="flex flex-col md:flex-row items-center justify-between bg-surface-elevated border border-white/[0.05] px-4 py-3 rounded-2xl gap-4">
                                <div className="flex items-center gap-4 w-full md:w-auto">
                                    {/* Search */}
                                    <div className="relative w-full md:w-72">
                                        <i className="ph ph-magnifying-glass absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-tertiary text-sm"></i>
                                        <input
                                            type="text"
                                            placeholder="Localizar registro…"
                                            value={tableSearch}
                                            onChange={e => setTableSearch(e.target.value)}
                                            className="w-full pl-9 pr-4 py-2.5 bg-surface-overlay border border-white/[0.06] rounded-xl text-[12px] font-medium text-ink-secondary placeholder-ink-tertiary outline-none focus:border-accent-violet/40 focus:ring-1 focus:ring-accent-violet/20 transition-all"
                                        />
                                    </div>
                                    {/* Checkbox */}
                                    <label className="flex items-center gap-2.5 cursor-pointer whitespace-nowrap">
                                        <input
                                            type="checkbox"
                                            checked={showOnlyIncomplete}
                                            onChange={e => setShowOnlyIncomplete(e.target.checked)}
                                            className="w-4 h-4 rounded border-white/20 bg-surface-overlay accent-accent-violet cursor-pointer"
                                        />
                                        <span className="text-[11px] font-medium text-ink-tertiary">Solo Faltantes</span>
                                    </label>
                                </div>

                                <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                                    <span className="text-[11px] text-ink-tertiary tabular-nums">
                                        {filteredAndSortedRows.length} registros
                                    </span>
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
