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
    if (sortConfig.key !== col) return <i className="ph ph-arrows-down-up ml-1 opacity-30 text-xs"></i>;
    return sortConfig.direction === 'asc'
        ? <i className="ph ph-arrow-up ml-1 text-primary text-xs"></i>
        : <i className="ph ph-arrow-down ml-1 text-primary text-xs"></i>;
};

export function DataTable({ rows, onSort, sortConfig, tableFilter, isDark, onRowClick }: DataTableProps) {
    const [nameWidth, setNameWidth] = useState(240);
    const isResizing = useRef(false);
    const cleanupRef = useRef<(() => void) | null>(null);

    // Remove any dangling listeners if the component unmounts mid-drag
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

    const thClass = (col: string) =>
        `py-3 px-4 cursor-pointer hover:text-primary select-none ${sortConfig.key === col ? 'text-primary' : ''}`;

    return (
        <div className="bg-white dark:bg-gray-800 border border-warm-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col">
            <div className="overflow-x-auto h-full custom-scrollbar">
                <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                    <thead className="bg-warm-50/80 dark:bg-gray-900/70 text-gray-500 dark:text-gray-400 font-black uppercase text-[10px] tracking-widest sticky top-0 z-10 backdrop-blur-md border-b border-warm-200 dark:border-gray-700">
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
                            <th className="py-3 px-4 relative group" style={{ width: nameWidth }}>
                                <div className={`cursor-pointer hover:text-primary select-none inline-flex items-center ${sortConfig.key === 'nombreValor' ? 'text-primary' : ''}`} onClick={() => onSort('nombreValor')}>
                                    Nombre <SortIcon col="nombreValor" sortConfig={sortConfig} />
                                </div>
                                <div
                                    className={`resizer ${isResizing.current ? 'is-resizing' : ''}`}
                                    onMouseDown={startResizing}
                                    onDoubleClick={autoResize}
                                    title="Arrastra para redimensionar · Doble clic para autoajustar"
                                ></div>
                            </th>
                            <th className={thClass('missingFieldsCount')} onClick={() => onSort('missingFieldsCount')}>
                                Faltantes <SortIcon col="missingFieldsCount" sortConfig={sortConfig} />
                            </th>
                            <th className={thClass('percent')} onClick={() => onSort('percent')}>
                                Progreso <SortIcon col="percent" sortConfig={sortConfig} />
                            </th>
                            <th className={`${thClass('fechaMod')} text-center`} onClick={() => onSort('fechaMod')}>
                                Última Mod. <SortIcon col="fechaMod" sortConfig={sortConfig} />
                            </th>
                            <th className="py-3 px-4 text-center">Detalle</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-warm-100 dark:divide-gray-700/50">
                        {rows.map(row => (
                            <tr
                                key={`${row._categoria}-${row.id}`}
                                className="hover:bg-warm-100/50 dark:hover:bg-gray-700/20 transition-all group cursor-pointer"
                                onClick={() => onRowClick(row)}
                            >
                                <td className="py-2.5 px-4">
                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black ${
                                        row._meta.isComplete
                                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30'
                                            : 'bg-red-50 text-primary dark:bg-red-900/30'
                                    }`}>
                                        {row._meta.isComplete ? 'OK' : 'EN PROGRESO'}
                                    </span>
                                </td>
                                <td className="py-2.5 px-4">
                                    {!row._meta.isComplete && (
                                        <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${
                                            row.auditoria_estado === 'En revisión'
                                                ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800'
                                                : 'bg-slate-100 text-slate-500 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700'
                                        }`}>
                                            <i className={`ph-fill ${row.auditoria_estado === 'En revisión' ? 'ph-clock' : 'ph-info'} mr-1.5 text-sm`}></i>
                                            {row.auditoria_estado === 'En revisión' ? 'En revisión' : 'Sin revisar'}
                                        </span>
                                    )}
                                </td>
                                {!tableFilter && (
                                    <td className="py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                        {CATEGORY_TRANSLATIONS[row._categoria] || row._categoria}
                                    </td>
                                )}
                                <td className="py-2.5 px-4 font-bold text-gray-900 dark:text-gray-100 truncate" style={{ maxWidth: nameWidth }}>
                                    {row._meta.nombreValor}
                                </td>
                                <td className="py-2.5 px-4 text-center">
                                    <span className="font-bold text-gray-400">{row._meta.missingFieldsCount}</span>
                                </td>
                                <td className="py-2.5 px-4 w-48">
                                    <div className="flex items-center gap-3">
                                        <div className="flex-1 h-1.5 bg-warm-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                            <div
                                                className="h-full transition-all duration-700"
                                                style={{ width: `${row._meta.percent}%`, backgroundColor: getSolidColor(row._meta.percent, isDark) }}
                                            ></div>
                                        </div>
                                        <span className="text-[10px] font-black w-8 text-right" style={{ color: getSolidColor(row._meta.percent, isDark) }}>
                                            {row._meta.percent}%
                                        </span>
                                    </div>
                                </td>
                                <td className="py-2.5 px-4 text-center text-gray-400 font-medium">{row._meta.fechaMod}</td>
                                <td className="py-2.5 px-4 text-center">
                                    <button
                                        onClick={e => { e.stopPropagation(); onRowClick(row); }}
                                        className="p-2 bg-warm-100 dark:bg-gray-700 rounded-lg hover:text-primary transition-all active:scale-90 shadow-sm"
                                    >
                                        <i className="ph-bold ph-eye text-lg"></i>
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
                {rows.length === 0 && (
                    <div className="text-center py-16 text-gray-400 font-bold text-sm">
                        No se han encontrado registros para los filtros seleccionados.
                    </div>
                )}
            </div>
        </div>
    );
}
