import React from 'react';

interface DetailModalProps {
    isOpen: boolean;
    data: any;
    onClose: () => void;
    onDownloadExcel: (tabla: string, id: string, nombre: string) => void;
}

export function DetailModal({ isOpen, data, onClose, onDownloadExcel }: DetailModalProps) {
    if (!isOpen || !data) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            {/* Capa de fondo con transparencia negra al 60% y desenfoque */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>

            {/* Contenedor principal del Pop-up */}
            <div className="relative bg-white dark:bg-gray-800 rounded-2xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto z-10 p-6 flex flex-col">
                <div className="flex justify-end mb-2">
                    <button onClick={onClose} className="p-2 text-gray-500 hover:text-red-500 transition-colors">
                        <i className="ph-bold ph-x text-xl"></i>
                    </button>
                </div>

                {/* Aquí inyectarás el contenido de tu galería y los detalles de data */}
                <div className="text-gray-800 dark:text-gray-200">
                    <h2 className="text-2xl font-bold mb-4">Detalles del registro</h2>
                    <pre className="bg-gray-100 dark:bg-gray-900 p-4 rounded-lg overflow-x-auto text-xs">
                        {JSON.stringify(data, null, 2)}
                    </pre>
                </div>
                <button onClick={() => onDownloadExcel(data._categoria, data.id, data.nombre || data.name)}>
                    Descargar Excel para revisión
                </button>
            </div>
        </div>
    );
}