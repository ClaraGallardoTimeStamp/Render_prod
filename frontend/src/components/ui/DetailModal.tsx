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
    FIELD_TRANSLATIONS[key.toLowerCase()] || key.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

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
        <div
            className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 sm:p-6 fade-in"
            onClick={e => { if (e.target === e.currentTarget) onClose(); }}
        >
            <div className="bg-surface-elevated border border-white/[0.07] rounded-2xl w-full max-w-4xl max-h-[85vh] overflow-hidden flex flex-col shadow-elevated slide-up">

                {/* Modal header */}
                <div className="px-6 py-5 border-b border-white/[0.05] flex justify-between items-start bg-surface-base/40 shrink-0">
                    <div className="flex items-start gap-4">
                        <div className="w-9 h-9 bg-accent-violet/10 border border-accent-violet/15 rounded-xl flex items-center justify-center text-accent-violet shrink-0 mt-0.5">
                            <i className="ph-bold ph-database-zap text-base leading-none"></i>
                        </div>
                        <div>
                            <div className="flex items-center gap-2.5 flex-wrap">
                                <h3 className="font-serif text-[18px] font-semibold text-ink-primary leading-tight">
                                    {meta.nombreValor}
                                </h3>
                                {!meta.isComplete && (
                                    <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider ${
                                        data.auditoria_estado === 'En revisión'
                                            ? 'bg-accent-gold/10 text-accent-gold'
                                            : 'bg-white/[0.05] text-ink-tertiary'
                                    }`}>
                                        <i className={`ph-fill ${data.auditoria_estado === 'En revisión' ? 'ph-clock' : 'ph-minus-circle'} mr-1`}></i>
                                        {data.auditoria_estado === 'En revisión' ? 'En revisión' : 'Sin revisar'}
                                    </span>
                                )}
                            </div>
                            <p className="text-[10px] font-medium text-ink-tertiary mt-1.5 flex gap-3 uppercase tracking-widest">
                                <span>ID: {data.id ?? 'Nuevo'}</span>
                                <span className="text-accent-violet/70">{categoryLabel}</span>
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="w-8 h-8 rounded-xl flex items-center justify-center bg-white/[0.04] hover:bg-white/[0.08] text-ink-tertiary hover:text-ink-secondary transition-all shrink-0"
                    >
                        <i className="ph-bold ph-x text-sm leading-none"></i>
                    </button>
                </div>

                {/* Fields grid */}
                <div className="p-6 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-3 bg-surface-elevated custom-scrollbar flex-1">
                    {meta.editableKeys.map((key: string) => {
                        const val = data[key];
                        const isDesc = key.toLowerCase().includes('desc') || key.toLowerCase().includes('text') || (val && String(val).length > 120);
                        const isEmpty = val === null || val === undefined || String(val).trim() === '';
                        return (
                            <div key={key} className={`${isDesc ? 'sm:col-span-2' : ''} space-y-1.5`}>
                                <label className="text-[9px] font-bold uppercase text-ink-tertiary tracking-[0.12em] ml-0.5 flex items-center gap-1.5">
                                    {isEmpty && <span className="w-1 h-1 rounded-full bg-accent-violet/60 inline-block" />}
                                    {translateField(key)}
                                </label>
                                {isDesc ? (
                                    <div className="p-4 bg-surface-overlay border border-white/[0.05] rounded-xl text-[12px] font-normal leading-relaxed max-h-[130px] overflow-y-auto custom-scrollbar italic text-ink-secondary shadow-inner">
                                        {val || <span className="text-ink-tertiary not-italic">Sin descripción disponible.</span>}
                                    </div>
                                ) : (
                                    <div className={`px-3.5 py-2.5 bg-surface-overlay border rounded-xl text-[12px] font-medium truncate ${
                                        isEmpty
                                            ? 'border-accent-violet/10 text-ink-tertiary'
                                            : 'border-white/[0.05] text-ink-secondary'
                                    }`}>
                                        {isEmpty
                                            ? <span className="italic opacity-40">No disponible</span>
                                            : val
                                        }
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 bg-surface-base/40 border-t border-white/[0.05] flex flex-col sm:flex-row justify-between items-center gap-4 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="h-1 w-32 bg-surface-highlight rounded-full overflow-hidden">
                            <div
                                className="h-full transition-all duration-1000 rounded-full"
                                style={{ width: `${meta.percent}%`, backgroundColor: progressColor }}
                            />
                        </div>
                        <span className="text-[11px] font-semibold tabular-nums" style={{ color: progressColor }}>
                            {meta.percent}% completado
                        </span>
                    </div>
                    <ExcelDownloadButton
                        onClick={() => onDownloadExcel(data._categoria, String(data.id), meta.nombreValor)}
                        label="Descargar para Revisión"
                        size="md"
                        className="w-full sm:w-auto"
                    />
                </div>
            </div>
        </div>
    );
}
