// src/app/components/ui/Header.tsx

// Importamos React
import React from 'react';

// Definimos los "Props" (las propiedades o datos que este componente necesita recibir desde fuera)
interface HeaderProps {
  userEmail: string;       // Necesitamos el email del usuario para mostrarlo
  onLogout: () => void;    // Necesitamos una función que se ejecute al darle a "Salir"
}

// Creamos el componente Header recibiendo esas propiedades
export function Header({ userEmail, onLogout }: HeaderProps) {
  return (
    <header className="h-14 bg-[#2a3241] border-b-[3px] border-[#EB1C23] flex items-center justify-between px-5 z-30 shrink-0 shadow-md">
        
        {/* Lado izquierdo: Logos y Título */}
        <div className="flex items-center space-x-5">
            {/* Como ya no estamos en un HTML normal, las imágenes conviene ponerlas en la carpeta public/ 
                o importarlas directamente arriba. Supondremos que están en public/assets/ */}
            <div className="flex items-center space-x-3">
                <img src="/assets/badajoz.svg" alt="Badajoz" className="h-7 object-contain dark:invert" />
                <img src="/assets/logo-red.svg" alt="Timestamp" className="h-7 object-contain" />
            </div>
            <div className="h-6 w-px bg-gray-600 hidden sm:block"></div>
            <span className="text-base font-bold text-white font-serif tracking-tight hidden sm:block">
                Auditoría Turística Badajoz
            </span>
        </div>

        {/* Lado derecho: Usuario y botón de salir */}
        <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-2 bg-slate-700/50 px-3 py-1 rounded-full border border-slate-600 text-xs text-gray-300">
                <i className="ph ph-user-circle text-lg"></i>
                
                {/* Usamos JavaScript (con llaves) para mostrar la primera parte del email dinámicamente */}
                <span className="font-semibold">{userEmail ? userEmail.split('@')[0] : 'Consultor'}</span>
                
                {/* Enlazamos el botón a la función onLogout que nos han pasado como propiedad */}
                <button onClick={onLogout} className="ml-1 hover:text-white transition-colors" title="Salir">
                    <i className="ph ph-power text-lg"></i>
                </button>
            </div>
        </div>

    </header>
  );
}