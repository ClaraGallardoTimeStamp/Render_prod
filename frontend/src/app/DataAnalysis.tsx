// src/app/DataAnalysis.tsx

import { useState, useMemo, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import * as XLSX from 'xlsx';

// 1. IMPORTAMOS NUESTRAS PIEZAS DE LEGO
import { Header } from '../components/ui/Header';
import { Sidebar } from '../components/ui/Sidebar';
import { StatsGrid } from '../components/ui/StatsGrid';

// --- CONFIGURACIÓN Y CONSTANTES (Extraídas de tu index.html) ---
const API_BASE = 'http://localhost:3000'; 
const EXCLUDED_FIELDS = [
    'id', 'palabras_clave', 'uri_clase', 'estado_publicacion', 'url_web', 'app', 'accessibility_level',
    'accessibility_description', 'uri_segittur', 'fecha_creacion', 'fecha_actualizacion', 'drupal_nid',
    'nivel_1', 'nivel_2', 'nivel_3', 'nivel_4', 'nivel_5', 'auditoria_estado', 'usuario_auditor'
].map(f => f.toLowerCase());

const CATEGORY_TRANSLATIONS: Record<string, string> = {
    "accessible_poi": "Punto de Interés Accesible", "alojamientos": "Alojamientos", 
    "restaurantes": "Restaurantes", "museum": "Museo", "church": "Iglesia"
    // ... añade el resto que tienes en tu index.html
};

const getSolidColor = (percent: number, isDark: boolean) => {
    if (percent <= 30) return isDark ? '#f87171' : '#dc2626';
    if (percent >= 100) return isDark ? '#34d399' : '#059669';
    const hue = ((percent - 30) / 70) * 120;
    return `hsl(${hue}, ${isDark ? '40%' : '50%'}, ${isDark ? '55%' : '45%'})`;
};

// --- COMPONENTE PRINCIPAL ---
export function DataAnalysis() {
    const navigate = useNavigate();
    
    // ESTADOS DE SESIÓN
    const token = localStorage.getItem('token');
    const userEmail = localStorage.getItem('userEmail') || 'Consultor';

    // ESTADOS DE LA INTERFAZ
    const [isDark, setIsDark] = useState(true);
    const [currentView, setCurrentView] = useState('dashboard');
    const [tableFilter, setTableFilter] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [tableSearch, setTableSearch] = useState('');
    const [showOnlyIncomplete, setShowOnlyIncomplete] = useState(false);
    const [sortConfig, setSortConfig] = useState<{key: string | null, direction: 'asc' | 'desc'}>({ key: null, direction: 'asc' });

    // ESTADOS DE DATOS
    const [allData, setAllData] = useState<any[]>([]);
    const [summaryData, setSummaryData] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);

    // 2. SEGURIDAD: Si no hay token, fuera
    useEffect(() => {
        if (!token) navigate('/login');
    }, [token, navigate]);

    // 3. CARGA DE DATOS (Lógica de tu index.html)
    useEffect(() => {
        if (!token) return;
        
        // Cargar estadísticas iniciales
        fetch(`${API_BASE}/api/estadisticas`, { headers: { 'Authorization': `Bearer ${token}` } })
            .then(res => res.json())
            .then(data => { 
                if (Array.isArray(data)) setSummaryData(data); 
            })
            .catch(err => console.error("Error estadísticas:", err));
    }, [token]);

    useEffect(() => {
        if (summaryData.length === 0 || !token) return;
        setIsLoading(true);
        
        // Cargar todos los datos para cruces inmediatos
        Promise.all(summaryData.map(cat =>
            fetch(`${API_BASE}/api/datos/${cat.name}`, { headers: { 'Authorization': `Bearer ${token}` } })
                .then(res => res.ok ? res.json() : [])
                .then(data => Array.isArray(data) ? data.map(item => ({...item, _categoria: cat.name})) : [])
                .catch(() => [])
        )).then(results => {
            setAllData(results.flat());
            setIsLoading(false);
        });
    }, [summaryData, token]);

    // 4. LÓGICA DE FILTRADO Y PROCESAMIENTO (useMemo para rendimiento)
    const dashboardStats = useMemo(() => {
        if (allData.length === 0) return null;
        
        const filtered = allData.filter(row => {
            const rowLoc = row.municipio || row.municipality || row.city;
            const matchesLoc = locationFilter ? rowLoc === locationFilter : true;
            const matchesCat = tableFilter ? row._categoria === tableFilter : true;
            return matchesLoc && matchesCat;
        });

        let complete = 0, enRevision = 0, incomplete = 0;
        filtered.forEach(row => {
            const keys = Object.keys(row).filter(k => !EXCLUDED_FIELDS.includes(k.toLowerCase()) && k !== '_categoria');
            const isIncomplete = keys.some(k => !row[k] || row[k].toString().trim() === '');
            
            if (!isIncomplete) complete++;
            else if (row.auditoria_estado === 'En revisión') enRevision++;
            else incomplete++;
        });

        return { total: filtered.length, complete, enRevision, incomplete };
    }, [allData, locationFilter, tableFilter]);

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    return (
        <div className={`flex flex-col h-screen ${isDark ? 'dark bg-gray-900' : 'bg-warm-50'}`}>
            
            {/* USAMOS EL HEADER PROFESIONAL */}
            <Header userEmail={userEmail} onLogout={handleLogout} />

            <div className="flex-1 flex overflow-hidden">
                
                {/* USAMOS EL SIDEBAR PROFESIONAL */}
                <Sidebar 
                    isDark={isDark} 
                    setIsDark={setIsDark} 
                    currentView={currentView} 
                    setCurrentView={setCurrentView} 
                />

                <main className="flex-1 overflow-y-auto p-6 custom-scrollbar">
                    {currentView === 'dashboard' ? (
                        <div className="max-w-5xl mx-auto space-y-6 fade-in">
                            <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl shadow-sm border border-warm-100 dark:border-gray-700">
                                <h2 className="text-2xl font-black mb-3 dark:text-white">Ecosistema de Calidad</h2>
                                <p className="text-gray-500 dark:text-gray-400 text-sm">
                                    Centralizamos la supervisión de los activos de <strong>Badajoz</strong>. 
                                    Utilice las métricas para identificar carencias y priorizar la actualización.
                                </p>
                            </div>

                            {/* USAMOS EL STATSGRID PROFESIONAL */}
                            <StatsGrid stats={dashboardStats} />
                            
                            {/* Aquí puedes añadir el gráfico de donut más adelante */}
                        </div>
                    ) : (
                        <div className="fade-in">
                            <h2 className="text-xl font-bold dark:text-white mb-4">Gestión de Datos</h2>
                            <p className="dark:text-gray-400">Aquí irá tu tabla de datos modularizada.</p>
                            {/* Próximo paso: Insertar el componente <DataTable /> aquí */}
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}