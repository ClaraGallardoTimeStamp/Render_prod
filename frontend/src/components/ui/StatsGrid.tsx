
// 1. Importamos React
import React from 'react';

// 2. Definimos la FORMA de los datos que vamos a recibir.
// En TypeScript, esto es vital. Le decimos: "Oye, para dibujar las tarjetas, 
// necesito que me pases un objeto que tenga exactamente estos 4 números".
interface StatsData {
  complete: number;
  enRevision: number;
  incomplete: number;
  total: number;
}

// 3. Definimos las propiedades (Props) del componente.
// Le decimos que puede recibir los datos (stats) o puede ser 'null' si aún están cargando.
interface StatsGridProps {
  stats: StatsData | null;
}

// 4. Creamos el componente funcional
export function StatsGrid({ stats }: StatsGridProps) {
  
  // Si los datos aún no han llegado del backend, no dibujamos nada (o podríamos poner un "Cargando...")
  if (!stats) return null;

  // 5. Devolvemos el JSX (Tu HTML original traducido)
  return (
    <div className="flex-1 w-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      
      {/* Tarjeta: Completos */}
      <div className="p-5 rounded-xl bg-warm-50 dark:bg-gray-900/30 border border-warm-100 dark:border-gray-700/50 flex justify-between items-center group">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-green-500">
            Completos
          </div>
          {/* Usamos las llaves para inyectar el dato numérico y darle formato con separador de miles */}
          <div className="text-2xl font-black text-green-500">
            {stats.complete.toLocaleString()}
          </div>
        </div>
        <i className="ph-fill ph-shield-check text-green-500 text-2xl opacity-80"></i>
      </div>

      {/* Tarjeta: En Revisión */}
      <div className="p-5 rounded-xl bg-warm-50 dark:bg-gray-900/30 border border-warm-100 dark:border-gray-700/50 flex justify-between items-center group">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-amber-500">
            En Revisión
          </div>
          <div className="text-2xl font-black text-amber-500">
            {stats.enRevision.toLocaleString()}
          </div>
        </div>
        <i className="ph-fill ph-clock text-amber-500 text-2xl opacity-80"></i>
      </div>

      {/* Tarjeta: Incompletos */}
      <div className="p-5 rounded-xl bg-warm-50 dark:bg-gray-900/30 border border-warm-100 dark:border-gray-700/50 flex justify-between items-center group">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-[#EB1C23]">
            Incompletos
          </div>
          <div className="text-2xl font-black text-[#EB1C23]">
            {stats.incomplete.toLocaleString()}
          </div>
        </div>
        <i className="ph-fill ph-warning-circle text-[#EB1C23] text-2xl opacity-80"></i>
      </div>

      {/* Tarjeta: Total */}
      <div className="p-5 rounded-xl bg-warm-50 dark:bg-gray-900/30 border border-warm-100 dark:border-gray-700/50 flex justify-between items-center group">
        <div>
          <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 text-blue-500">
            Total
          </div>
          <div className="text-2xl font-black text-blue-500">
            {stats.total.toLocaleString()}
          </div>
        </div>
        <i className="ph-fill ph-database text-blue-500 text-2xl opacity-80"></i>
      </div>

    </div>
  );
}