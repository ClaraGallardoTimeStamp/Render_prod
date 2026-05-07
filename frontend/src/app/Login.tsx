// src/app/Login.tsx
// 1. Importamos React y el hook useState para guardar el email y contraseña
import { useState } from 'react';
// 2. Importamos useNavigate (una herramienta del router) para cambiar de página tras el login
import { useNavigate } from 'react-router-dom';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Herramienta para navegar a otras rutas
    const navigate = useNavigate();

    // Función que se ejecuta al darle a "Iniciar Sesión"
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');

        // Aquí simulamos el login (luego pondrás tu fetch real a tu backend)
        if (email === 'admin' && password === 'admin') {
            // Si el login es correcto, guardamos un token falso y navegamos al panel
            localStorage.setItem('token', 'token-simulado');
            navigate('/analisis'); // <-- ¡Así es como cambiamos de pantalla en React!
        } else {
            setError('Credenciales incorrectas');
        }
    };

    return (
        // Fíjate que class se ha convertido en className. 
        // Es el mismo diseño exacto que tenías en tu index.html
        <div className="relative flex min-h-screen items-center justify-center lg:justify-end overflow-hidden bg-[#0d1117] p-4 lg:pr-20 xl:pr-32">
            {/* Fondo e imagen... */}
            <div className="relative z-10 w-full sm:max-w-[420px] p-8 sm:p-10 bg-[#1C232D] rounded-[32px] shadow-2xl border border-white/5">

                {/* Mostramos el error si existe */}
                {error && (
                    <div className="bg-[#2a1318] text-[#F3484A] px-5 py-4 rounded-xl text-sm mb-8 slide-up">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#8B949E]">Identificador</label>
                        <input type="text"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            className="w-full px-5 py-4 bg-[#161B22] border border-[#30363D] rounded-xl text-white"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase text-[#8B949E]">Credencial</label>
                        <input
                            type="password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            className="w-full px-5 py-4 bg-[#161B22] border border-[#30363D] rounded-xl text-white"
                        />
                    </div>
                    <button type="submit" className="w-full bg-[#ED2125] text-white py-4 rounded-xl font-bold">
                        Iniciar Sesión
                    </button>
                </form>
            </div>
        </div>
    );
}