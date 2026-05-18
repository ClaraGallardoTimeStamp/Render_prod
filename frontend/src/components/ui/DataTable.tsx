import { useState, useRef, useEffect } from 'react';
import { CATEGORY_TRANSLATIONS, getSolidColor } from '../../lib/constants';

interface DataTableProps {
    rows: any[];
    onSort: (key: string) => void;
    sortConfig: { key: string | null; direction: 'asc' | 'desc' };
    tableFilter: string;
    isDark: boolean;
    onRowClick: (row: any) => void;
}

const SortIcon = ({ col, sortConfig }: { col: string; sortConfig: DataTableProps['sortConfig'] }) => {
    if (sortConfig.key !== col)
        return <i className="ph ph-arrows-down-up ml-1 opacity-20 text-[10px]"></i>;
    return sortConfig.direction === 'asc'
        ? <i className="ph ph-arrow-up ml-1 text-accent-violet text-[10px]"></i>
        : <i className="ph ph-arrow-down ml-1 text-accent-violet text-[10px]"></i>;
};

export function DataTable({ rows, onSort, sortConfig, tableFilter, isDark, onRowClick }: DataTableProps) {
    const [nameWidth, setNameWidth] = useState(240);
    const isResizing = useRef(false);
    const cleanupRef = useRef<(() => void) | null>(null);

    useEffect(() => () => { cleanupRef.current?.(); }, []);

    const startResizing = (e: React.MouseEvent) => {
        isResizing.current = true;
        const startX = e.pageX;
        const startWidth = nameWidth;
        const onMouseMove = (ev: MouseEvent) => {
            if (!isResizing.current) return;
            const w = startWidth + (ev.pageX - startX);
            if (w > 100) setNameWidth(w);
        };
        const onMouseUp = () => {
            isResizing.current = false;
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
            cleanupRef.current = null;
        };
        cleanupRef.current = () => {
            document.removeEventListener('mousemove', onMouseMove);
            document.removeEventListener('mouseup', onMouseUp);
        };
        document.addEventListener('mousemove', onMouseMove);
        document.addEventListener('mouseup', onMouseUp);
    };

    const autoResize = () => {
        if (rows.length === 0) return;
        const longest = rows.reduce((a, b) =>
            (a._meta?.nombreValor?.length ?? 0) > (b._meta?.nombreValor?.length ?? 0) ? a : b
        );
        const w = Math.max(150, Math.min((longest._meta?.nombreValor?.length ?? 20) * 8.5 + 32, 600));
        setNameWidth(w);
    };

    const thClass = (col: string) => `
        py-3 px-4 cursor-pointer select-none transition-colors
        hover:text-ink-secondary
        ${sortConfig.key === col ? 'text-accent-violet' : 'text-ink-tertiary'}
    `.trim();

    return (
        <div className="bg-surface-elevated border border-white/[0.05] rounded-2xl overflow-hidden shadow-surface flex-1 flex flex-col">
            <div className="overflow-x-auto h-full custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">

                    {/* Table header */}
                    <thead className="bg-surface-base/80 text-[9px] font-bold uppercase tracking-[0.12em] sticky top-0 z-10 backdrop-blur-md border-b border-white/[0.05]">
                        <tr>
                            <th className={thClass('isComplete')} onClick={() => onSort('isComplete')}>
                                Estado <SortIcon col="isComplete" sortConfig={sortConfig} />
                            </th>
                            <th className={thClass('auditoria_estado')} onClick={() => onSort('auditoria_estado')}>
                                Auditoría <SortIcon col="auditoria_estado" sortConfig={sortConfig} />
                            </th>
                            {!tableFilter && (
                                <th className={thClass('_categoria')} onClick={() => onSort('_categoria')}>
                                    Categoría <SortIcon col="_categoria" sortConfig={sortConfig} />
                                </th>
                            )}
                            <th className="py-3 px-4 relative group text-ink-tertiary" style={{ width: nameWidth }}>
                                <div
                                    className={`cursor-pointer hover:text-ink-secondary select-none inline-flex items-center ${sortConfig.key === 'nombreValor' ? 'text-accent-violet' : ''}`}
                                    onClick={() => onSort('nombreValor')}
                                >
                                    Nombre <SortIcon col="nombreValor" sortConfig={sortConfig} />
                                </div>
                                <div
                                    className={`resizer ${isResizing.current ? 'is-resizing' : ''}`}
                                    onMouseDown={startResizing}
                                    onDoubleClick={autoResize}
                                    title="Arrastra para redimensionar · Doble clic para autoajustar"
                                />
                            </th>
                            <th className={thClass('missingFieldsCount')} onClick={() => onSort('missingFieldsCount')}>
                                Faltantes <SortIcon col="missingFieldsCount" sortConfig={sortConfig} />
                            </th>
                            <th className={thClass('percent')} onClick={() => onSort('percent')}>
                                Progreso <SortIcon col="percent" sortConfig={sortConfig} />
                            </th>
                            <th className={`${thClass('fechaMod')} text-center`} onClick={() => onSort('fechaMod')}>
                                Mod. <SortIcon col="fechaMod" sortConfig={sortConfig} />
                            </th>
                            <th className="py-3 px-4 text-center text-ink-tertiary text-[9px] font-bold uppercase tracking-[0.12em]">Ver</th>
                        </tr>
                    </thead>

                    {/* Table body */}
                    <tbody className="divide-y divide-white/[0.03]">
                        {rows.map(row => {
                            const statusColor = getSolidColor(row._meta.percent, isDark);
                            return (
                                <tr
                                    key={`${row._categoria}-${row.id}`}
                                    className="hover:bg-white/[0.02] transition-colors duration-100 cursor-pointer group"
                                    onClick={() => onRowClick(row)}
                                >
                                    {/* Estado */}
                                    <td className="py-2.5 px-4">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wide ${
                                            row._meta.isComplete
                                                ? 'bg-accent-sage-light/10 text-accent-sage-light'
                                                : 'bg-accent-violet/10 text-accent-violet'
                                        }`}>
                                            <span className={`w-1 h-1 rounded-full ${row._meta.isComplete ? 'bg-accent-sage-light' : 'bg-accent-violet'}`} />
                                            {row._meta.isComplete ? 'OK' : 'Progreso'}
                                        </span>
                                    </td>

                                    {/* Auditoría */}
                                    <td className="py-2.5 px-4">
                                        {!row._meta.isComplete && (
                                            <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-[9px] font-semibold uppercase tracking-wide ${
                                                row.auditoria_estado === 'En revisión'
                                                    ? 'bg-accent-gold/10 text-accent-gold'
                                                    : 'bg-white/[0.04] text-ink-tertiary'
                                            }`}>
                                                <i className={`ph-fill ${row.auditoria_estado === 'En revisión' ? 'ph-clock' : 'ph-minus-circle'} text-sm`}></i>
                                                {row.auditoria_estado === 'En revisión' ? 'Revisión' : 'Pendiente'}
                                            </span>
                                        )}
                                    </td>

                                    {/* Categoría */}
                                    {!tableFilter && (
                                        <td className="py-2.5 px-4 text-[11px] text-ink-tertiary font-medium">
                                            {CATEGORY_TRANSLATIONS[row._categoria] || row._categoria}
                                        </td>
                                    )}

                                    {/* Nombre */}
                                    <td className="py-2.5 px-4 font-semibold text-ink-secondary group-hover:text-ink-primary transition-colors truncate" style={{ maxWidth: nameWidth }}>
                                        {row._meta.nombreValor}
                                    </td>

                                    {/* Faltantes */}
                                    <td className="py-2.5 px-4 text-center">
                                        <span className={`text-[11px] font-bold ${row._meta.missingFieldsCount > 0 ? 'text-accent-violet/70' : 'text-ink-tertiary'}`}>
                                            {row._meta.missingFieldsCount}
                                        </span>
                                    </td>

                                    {/* Progreso */}
                                    <td className="py-2.5 px-4 w-44">
                                        <div className="flex items-center gap-3">
                                            <div className="flex-1 h-1 bg-surface-highlight rounded-full overflow-hidden">
                                                <div
                                                    className="h-full transition-all duration-700 rounded-full"
                                                    style={{ width: `${row._meta.percent}%`, backgroundColor: statusColor }}
                                                />
                                            </div>
                                            <span className="text-[10px] font-bold w-8 text-right tabular-nums" style={{ color: statusColor }}>
                                                {row._meta.percent}%
                                            </span>
                                        </div>
                                    </td>

                                    {/* Fecha */}
                                    <td className="py-2.5 px-4 text-center text-[11px] text-ink-tertiary font-medium tabular-nums">
                                        {row._meta.fechaMod}
                                    </td>

                                    {/* Detalle */}
                                    <td className="py-2.5 px-4 text-center">
                                        <button
                                            onClick={e => { e.stopPropagation(); onRowClick(row); }}
                                            className="p-1.5 rounded-lg bg-white/[0.04] hover:bg-accent-violet/10 hover:text-accent-violet text-ink-tertiary transition-all active:scale-90"
                                        >
                                            <i className="ph-bold ph-eye text-base leading-none"></i>
                                        </button>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>

                {/* Empty state */}
                {rows.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-20 text-ink-tertiary gap-3">
                        <i className="ph ph-magnifying-glass text-3xl opacity-30"></i>
                        <p className="text-[12px] font-medium">Sin registros para los filtros seleccionados</p>
                    </div>
                )}
            </div>
        </div>
    );
}
