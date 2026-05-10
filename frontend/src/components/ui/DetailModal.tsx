import { CATEGORY_TRANSLATIONS, getSolidColor } from '../../lib/constants';
import { ExcelDownloadButton } from './ExcelDownloadButton';

const FIELD_TRANSLATIONS: Record<string, string> = {
    "nombre": "Nombre", "name": "Nombre", "title": "Título", "titulo": "Título",
    "direccion": "Dirección", "address": "Dirección", "municipio": "Municipio",
    "telefono": "Teléfono", "phone": "Teléfono", "email": "Correo Electrónico",
    "long_description": "Descripción Larga", "short_description": "Descripción Corta",
    "description": "Descripción", "descripción": "Descripción",
    "latitud": "Latitud", "latitude": "Latitud", "longitud": "Longitud", "longitude": "Longitud",
    "url_web": "Sitio Web", "web": "Sitio Web", "facebook": "Facebook", "twitter": "Twitter",
    "instagram": "Instagram", "fecha_actualizacion": "Última Actualización",
    "horario": "Horario de Apertura", "precio": "Precio/Tarifa"
};

const translateField = (key: string) =>
    FIELD_TRANSLATIONS[key.toLowerCase()] || key.replace(/_/g, ' ').toUpperCase();


interface DetailModalProps {
    isOpen: boolean;
    data: any;
    isDark: boolean;
    onClose: () => void;
    onDownloadExcel: (tabla: string, id: string, nombre: string) => Promise<void>;
}

export function DetailModal({ isOpen, data, isDark, onClose, onDownloadExcel }: DetailModalProps) {
    if (!isOpen || !data) return null;

    const meta = data._meta;
    const categoryLabel = CATEGORY_TRANSLATIONS[data._categoria] || data._categoria;
    const progressColor = getSolidColor(meta.percent, isDark);

    return (
        <div className="fixed inset-0 bg-[#0F172A]/50 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 fade-in">
            <div className="bg-white dark:bg-gray-800 rounded-3xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-2xl border border-white/5 slide-up">

                {/* Cabecera del modal */}
                <div className="p-6 border-b border-warm-100 dark:border-gray-700 flex justify-between items-center bg-warm-50/50 dark:bg-gray-900/20 shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-primary/10 rounded-xl flex items-center justify-center text-primary shadow-inner">
                            <i className="ph-fill ph-database text-xl"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-3 flex-wrap">
                                <h3 className="font-black text-lg tracking-tight text-gray-900 dark:text-white leading-none">
                                    {meta.nombreValor}
                                </h3>
                                {!meta.isComplete && (
                                    <span className={`px-2.5 py-1 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                        data.auditoria_estado === 'En revisión'
                                            ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30'
                                            : 'bg-slate-100 text-slate-500 dark:bg-slate-700/50'
                                    }`}>
                                        <i className={`ph-fill ${data.auditoria_estado === 'En revisión' ? 'ph-clock' : 'ph-info'} mr-1`}></i>
                                        {data.auditoria_estado === 'En revisión' ? 'En revisión' : 'Sin revisar'}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1.5 flex gap-3">
                                <span>ID: {data.id || 'Nuevo'}</span>
                                <span className="text-primary">{categoryLabel}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 bg-warm-100 dark:bg-gray-700 rounded-xl text-gray-500 hover:text-primary transition-all"
                    >
                        <i className="ph-bold ph-x text-lg"></i>
                    </button>
                </div>

                {/* Cuerpo: Grid de campos */}
                <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-4 bg-white dark:bg-gray-800 custom-scrollbar flex-1">
                    {meta.editableKeys.map((key: string) => {
                        const val = data[key];
                        const isDesc = key.toLowerCase().includes('desc') || key.toLowerCase().includes('text') || (val && String(val).length > 120);
                        return (
                            <div key={key} className={`${isDesc ? 'sm:col-span-2' : ''} space-y-1.5`}>
                                <label className="text-[9px] font-black uppercase text-gray-400 dark:text-gray-500 tracking-widest ml-1">
                                    {translateField(key)}
                                </label>
                                {isDesc ? (
                                    <div className="p-4 bg-warm-50/50 dark:bg-gray-900/50 rounded-2xl text-xs border border-warm-100 dark:border-gray-700/50 font-medium leading-relaxed max-h-[150px] overflow-y-auto custom-scrollbar italic text-gray-600 dark:text-gray-300 shadow-inner">
                                        {val || 'Sin descripción detallada.'}
                                    </div>
                                ) : (
                                    <div className="p-3 bg-warm-50/50 dark:bg-gray-900/50 rounded-xl text-[11px] border border-warm-100 dark:border-gray-700/50 font-bold truncate shadow-inner text-gray-800 dark:text-gray-200">
                                        {val ?? <span className="font-normal italic text-gray-400 opacity-50">No disponible</span>}
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer: progreso + botón Excel */}
                <div className="p-6 bg-warm-50/50 dark:bg-gray-900/50 border-t border-warm-100 dark:border-gray-700 flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-1.5 w-28 bg-warm-200 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                            <div
                                className="h-full transition-all duration-1000"
                                style={{ width: `${meta.percent}%`, backgroundColor: progressColor }}
                            ></div>
                        </div>
                        <span className="text-[10px] font-black" style={{ color: progressColor }}>
                            {meta.percent}% Completado
                        </span>
                    </div>
                    <ExcelDownloadButton
                        onClick={() => onDownloadExcel(data._categoria, String(data.id), meta.nombreValor)}
                        label="Descargar Excel para Revisión"
                        size="md"
                        className="w-full sm:w-auto"
                    />
                </div>
            </div>
        </div>
    );
}
