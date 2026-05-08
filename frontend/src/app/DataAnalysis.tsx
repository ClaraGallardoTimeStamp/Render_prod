// src/app/DataAnalysis.tsx

import { useState, useMemo, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

// Componentes de UI
import { Header } from '../components/ui/Header';
import { Sidebar } from '../components/ui/Sidebar';
import { StatsGrid } from '../components/ui/StatsGrid';
import { DataTable } from '../components/ui/DataTable';
import { DetailModal } from '../components/ui/DetailModal';

// Función robusta para buscar y normalizar la localidad
const extractAndNormalizeLocation = (row: any): string => {
    if (!row) return '';

    // 1. Búsqueda profunda: Escaneamos la raíz y los objetos anidados comunes
    const rawLoc = row.localidad || 
                   row.locality || 
                   row._meta?.localidad || 
                   row._meta?.locality || 
                   row.properties?.localidad || 
                   row.properties?.locality || 
                   '';

    if (!rawLoc || typeof rawLoc !== 'string') return '';

    // 2. Sanitización (Trim + Lowercase + Capitalize first letter)
    // Esto agrupa "BADAJOZ", "badajoz" y " Badajoz" en "Badajoz" respetando tildes ("Mérida")
    const cleanStr = rawLoc.trim().toLowerCase();
    
    // Capitalizamos cada palabra para casos como "Don Benito"
    return cleanStr.replace(/(^\w|\s\w|á|é|í|ó|ú|ñ)/g, (match) => match.toUpperCase());
};

const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

export function DataAnalysis() {
    const navigate = useNavigate();
    
    // ESTADOS DE DATOS
    const [allData, setAllData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // ESTADOS DE FILTRADO Y UI
    const [isDark, setIsDark] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [locationFilter, setLocationFilter] = useState('');
    const [tableFilter, setTableFilter] = useState('');
    const [selectedRow, setSelectedRow] = useState<any | null>(null);
    const [isExporting, setIsExporting] = useState(false);

    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail') || 'Consultor';

    // 1. SEGURIDAD: Auth Guard
    useEffect(() => {
        if (!token) navigate('/login');
    }, [token, navigate]);

    // 2. FETCHING: Carga inicial de datos
    useEffect(() => {
        if (!token) return;
        
        const loadInitialData = async () => {
            setIsLoading(true);
            try {
                const statsRes = await fetch(`${API_BASE}/api/estadisticas`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });
                const stats = await statsRes.json();
                
                if (Array.isArray(stats)) {
                    setSummaryData(stats);
                    
                    const dataPromises = stats.map(cat =>
                        fetch(`${API_BASE}/api/datos/${cat.name}`, {
                            headers: { 'Authorization': `Bearer ${token}` }
                        }).then(res => res.ok ? res.json() : [])
                    );

                    const results = await Promise.all(dataPromises);
                    const flattenedData = results.map((data, idx) => 
                        data.map((item: any) => ({ ...item, _categoria: stats[idx].name }))
                    ).flat();
                    
                    setAllData(flattenedData);
                }
            } catch (err) {
                console.error("Error en la carga de datos:", err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInitialData();
    }, [token]);

    // 3. LÓGICA DE FILTRADO DINÁMICO (Cross-filtering)
    
    // 1. Extraer localidades únicas normalizadas
    const availableLocalities = useMemo(() => {
        const unique = new Set<string>();
        allData.forEach(row => {
            const loc = extractAndNormalizeLocation(row);
            if (loc) unique.add(loc);
        });
        return Array.from(unique).sort((a, b) => a.localeCompare(b, 'es')); // Orden alfabético español (respeta tildes)
    }, [allData]);

    // 2. Extraer categorías condicionadas
    const availableCategories = useMemo(() => {
        const unique = new Set<string>();
        allData.forEach(row => {
            const loc = extractAndNormalizeLocation(row);
            
            // Si no hay filtro de localidad activo, o si la localidad coincide
            if (!locationFilter || loc === locationFilter) {
                // Buscamos la categoría en la raíz o en el _meta
                const cat = row._categoria || row._meta?.categoria;
                if (cat) unique.add(cat);
            }
        });
        return Array.from(unique).sort();
    }, [allData, locationFilter]);

    // 3. Filtrado maestro para la Tabla y las Estadísticas
    const filteredRows = useMemo(() => {
        return allData.filter(row => {
            const loc = extractAndNormalizeLocation(row);
            const cat = row._categoria || row._meta?.categoria;
            
            const matchesLoc = !locationFilter || loc === locationFilter;
            const matchesCat = !tableFilter || cat === tableFilter;
            
            return matchesLoc && matchesCat;
        });
    }, [allData, locationFilter, tableFilter]);
    // Datos finales filtrados para la Tabla y Estadísticas
   
    // Cálculo de métricas para el Dashboard
    const dashboardStats = useMemo(() => {
        if (filteredRows.length === 0) return null;
        
        let complete = 0, enRevision = 0, incomplete = 0;
        filteredRows.forEach(row => {
            if (row.auditoria_estado === 'Completado') complete++;
            else if (row.auditoria_estado === 'En revisión') enRevision++;
            else incomplete++;
        });

        return { total: filteredRows.length, complete, enRevision, incomplete };
    }, [filteredRows]);

    // 4. HANDLERS: Exportación y Logout
    const handleExportExcel = async () => {
        setIsExporting(true);
        // Simulación de delay para feedback visual del botón
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        try {
            const worksheet = XLSX.utils.json_to_sheet(filteredRows);
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, "Auditoría");
            XLSX.writeFile(workbook, `Badajoz_Data_${locationFilter || 'Total'}.xlsx`);
        } finally {
            setIsExporting(false);
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/login');
    };

    return (
        <div className={`flex flex-col h-screen ${isDark ? 'dark bg-gray-900' : 'bg-warm-50'}`}>
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
                    isExporting={isExporting}
                    onExport={handleExportExcel}
                />

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {currentView === 'dashboard' ? (
                        <div className="max-w-6xl mx-auto space-y-6">
                            <header className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                                <h1 className="text-2xl font-black dark:text-white">Panel de Control</h1>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">Auditoría Turística de Badajoz</p>
                            </header>

                            <StatsGrid stats={dashboardStats} />
                        </div>
                    ) : (
                        <div className="h-full flex flex-col space-y-4">
                            <div className="flex justify-between items-end">
                                <div>
                                    <h2 className="text-xl font-bold dark:text-white">Gestión de Datos</h2>
                                    <p className="text-sm text-gray-500">{filteredRows.length} registros encontrados</p>
                                </div>
                            </div>

                            <DataTable 
                                rows={filteredRows} 
                                onSort={() => {}} 
                                tableFilter={tableFilter}
                                isDark={isDark}
                                onRowClick={(row) => setSelectedRow(row)}
                            />
                        </div>
                    )}
                </main>
            </div>

            {/* Modal de Detalle con fondo transparente y desenfoque */}
            <DetailModal 
                isOpen={!!selectedRow} 
                data={selectedRow} 
                onClose={() => setSelectedRow(null)} 
            />
        </div>
    );
}