
// 1. Importamos React y useState (para el ancho de la columna de nombre)
import React, { useState, useRef } from 'react';

// 2. Definimos las Props (la puerta de entrada de nuestro componente)
// Le decimos que necesita recibir las filas ya filtradas, la función para ordenar, 
// y el filtro actual (para saber si debe mostrar la columna de "Categoría" o no).
interface DataTableProps {
  rows: any[];
  onSort: (key: string) => void;
  tableFilter: string;
  isDark: boolean;
}

// 3. Función auxiliar para los colores de la barra de progreso (copiada de tu código)
const getSolidColor = (percent: number, isDark: boolean) => {
    if (percent <= 30) return isDark ? '#f87171' : '#dc2626';
    if (percent >= 100) return isDark ? '#34d399' : '#059669';
    const hue = ((percent - 30) / 70) * 120;
    return `hsl(${hue}, ${isDark ? '40%' : '50%'}, ${isDark ? '55%' : '45%'})`;
};

// 4. Creamos el componente de la Tabla
export function DataTable({ rows, onSort, tableFilter, isDark }: DataTableProps) {
  
  // Estado para controlar el ancho de la columna "Nombre" que el usuario puede arrastrar
  const [nameWidth, setNameWidth] = useState(240);
  const isResizing = useRef(false);

  // Funciones para redimensionar la columna (igual que tu HTML original)
  const startResizing = (e: React.MouseEvent) => {
    isResizing.current = true;
    const startX = e.pageX;
    const startWidth = nameWidth;
    
    const onMouseMove = (moveEvent: MouseEvent) => {
        if (!isResizing.current) return;
        const newWidth = startWidth + (moveEvent.pageX - startX);
        if (newWidth > 100) setNameWidth(newWidth);
    };
    
    const onMouseUp = () => {
        isResizing.current = false;
        document.removeEventListener('mousemove', onMouseMove);
        document.removeEventListener('mouseup', onMouseUp);
    };
    
    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  };

  return (
    <div className="bg-white dark:bg-gray-800 border border-warm-200 dark:border-gray-700 rounded-xl overflow-hidden shadow-sm flex-1 flex flex-col mt-4">
        <div className="overflow-x-auto h-full custom-scrollbar">
            <table className="w-full text-left text-xs border-collapse whitespace-nowrap">
                
                {/* CABECERA DE LA TABLA */}
                <thead className="bg-warm-50/80 dark:bg-gray-900/70 text-gray-500 dark:text-gray-400 font-black uppercase text-[10px] tracking-widest sticky top-0 z-10 backdrop-blur-md border-b border-warm-200 dark:border-gray-700">
                    <tr>
                        {/* Al hacer clic, ejecutamos la función onSort pasándole la clave por la que queremos ordenar */}
                        <th className="py-3 px-4 cursor-pointer hover:text-primary" onClick={() => onSort('isComplete')}>Estado</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-primary" onClick={() => onSort('auditoria_estado')}>Auditoría</th>
                        
                        {/* RENDERIZADO CONDICIONAL: Si NO hay filtro de categoría, mostramos la columna Categoría */}
                        {!tableFilter && (
                            <th className="py-3 px-4 cursor-pointer hover:text-primary" onClick={() => onSort('_categoria')}>Categoría</th>
                        )}
                        
                        <th className="py-3 px-4 relative group" style={{ width: nameWidth }}>
                            <div className="cursor-pointer hover:text-primary" onClick={() => onSort('nombreValor')}>Nombre</div>
                            <div className={`resizer ${isResizing.current ? 'is-resizing' : ''}`} onMouseDown={startResizing} title="Arrastra para redimensionar"></div>
                        </th>
                        <th className="py-3 px-4 text-center cursor-pointer hover:text-primary" onClick={() => onSort('missingFieldsCount')}>Faltantes</th>
                        <th className="py-3 px-4 cursor-pointer hover:text-primary" onClick={() => onSort('percent')}>Progreso</th>
                        <th className="py-3 px-4 text-center cursor-pointer hover:text-primary" onClick={() => onSort('fechaMod')}>Última Mod.</th>
                        <th className="py-3 px-4 text-center">Detalle</th>
                    </tr>
                </thead>

                {/* CUERPO DE LA TABLA */}
                <tbody className="divide-y divide-warm-100 dark:divide-gray-700/50">
                    
                    {/* BUCLE MAP: Recorremos el array de filas y por cada una creamos un <tr> (fila HTML) */}
                    {rows.map((row) => (
                        // REACT EXIGE UNA 'KEY' ÚNICA: Esto ayuda a React a saber qué fila borrar o mover sin repintar toda la tabla
                        <tr key={row.id} className="hover:bg-warm-100/50 dark:hover:bg-gray-700/20 transition-all group">
                            
                            {/* Celda Estado */}
                            <td className="py-2.5 px-4">
                                {/* Clases dinámicas: Si está completo, se pinta verde, si no, rojo */}
                                <span className={`inline-flex items-center px-2.5 py-1 rounded-lg text-[9px] font-black ${row._meta.isComplete ? 'bg-green-100 text-green-700 dark:bg-green-900/30' : 'bg-red-50 text-red-600 dark:bg-red-900/30'}`}>
                                    {row._meta.isComplete ? 'OK' : 'EN PROGRESO'}
                                </span>
                            </td>
                            
                            {/* Celda Auditoría */}
                            <td className="py-2.5 px-4">
                                {!row._meta.isComplete && (
                                    <span className={`inline-flex items-center px-2 py-1 rounded-md text-[9px] font-black uppercase tracking-wider ${row.auditoria_estado === 'En revisión' ? 'bg-amber-100 text-amber-700 dark:bg-amber-900/30' : 'bg-slate-100 text-slate-500 dark:bg-slate-800'}`}>
                                        {row.auditoria_estado === 'En revisión' ? 'En revisión' : 'Sin revisar'}
                                    </span>
                                )}
                            </td>

                            {/* Celda Categoría (Condicional) */}
                            {!tableFilter && (
                                <td className="py-2.5 px-4 text-xs font-semibold text-gray-500 dark:text-gray-400">
                                    {row._categoria}
                                </td>
                            )}

                            {/* Celda Nombre (con ancho dinámico) */}
                            <td className="py-2.5 px-4 font-bold text-gray-900 dark:text-gray-100 truncate" style={{ maxWidth: nameWidth }}>
                                {row._meta.nombreValor}
                            </td>
                            
                            {/* Celda Faltantes */}
                            <td className="py-2.5 px-4 text-center">
                                <span className="font-bold text-gray-400">{row._meta.missingFieldsCount}</span>
                            </td>
                            
                            {/* Celda Barra de Progreso */}
                            <td className="py-2.5 px-4 w-48">
                                <div className="flex items-center gap-3">
                                    <div className="flex-1 h-1.5 bg-warm-100 dark:bg-gray-700 rounded-full overflow-hidden shadow-inner">
                                        {/* El ancho y color del div interno dependen del porcentaje de progreso */}
                                        <div className="h-full transition-all duration-700" style={{ width: `${row._meta.percent}%`, backgroundColor: getSolidColor(row._meta.percent, isDark) }}></div>
                                    </div>
                                    <span className="text-[10px] font-black w-6 text-right" style={{ color: getSolidColor(row._meta.percent, isDark) }}>
                                        {row._meta.percent}%
                                    </span>
                                </div>
                            </td>
                            
                            {/* Celda Fecha Modificación */}
                            <td className="py-2.5 px-4 text-center text-gray-400 font-medium">
                                {row._meta.fechaMod}
                            </td>
                            
                            {/* Celda Botón Detalle */}
                            <td className="py-2.5 px-4 text-center">
                                <button className="p-2 bg-warm-100 dark:bg-gray-700 rounded-lg hover:text-red-500 transition-all shadow-sm">
                                    <i className="ph-bold ph-eye text-lg"></i>
                                </button>
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>

            {/* Mensaje si no hay datos */}
            {rows.length === 0 && (
                <div className="text-center py-12 text-gray-400 font-bold text-sm">
                    No se han encontrado registros.
                </div>
            )}
        </div>
    </div>
  );
}