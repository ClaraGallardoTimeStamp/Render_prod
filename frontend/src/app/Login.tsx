// src/app/Login.tsx
// 1. Importamos React y el hook useState para guardar el email y contraseña
import { useState } from 'react';
// 2. Importamos useNavigate (una herramienta del router) para cambiar de página tras el login
import { useNavigate } from 'react-router-dom';
import logoBadajoz from '../../assets/badajoz.svg';
import logoRed from '../../assets/logo-red.svg';

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    // Herramienta para navegar a otras rutas
    const navigate = useNavigate();


    // FUNCION DE LOGIN SIMULADA 🔴
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
    /*

    // Añadimos 'async' porque vamos a hacer una llamada a internet y tenemos que 'esperar' la respuesta
    const handleSubmit = async (e: React.FormEvent) => {
        // Evitamos que el navegador recargue la página entera (comportamiento por defecto del HTML)
        e.preventDefault();
        // Limpiamos los errores previos
        setError('');

        try {
            // 1. Leemos la URL del backend desde nuestro nuevo archivo .env
            // Si por algún motivo no existe, usamos localhost por defecto por seguridad
            const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:3000';

            // 2. Hacemos la llamada HTTP (fetch) a tu backend
            const response = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST', // Usamos POST porque estamos enviando datos sensibles
                headers: {
                    'Content-Type': 'application/json' // Le decimos al backend que le enviamos un JSON
                },
                // Convertimos nuestras variables de estado (email y password) a un texto JSON
                body: JSON.stringify({ email, password })
            });

            // 3. Traducimos la respuesta del backend de texto JSON a un objeto JavaScript
            const data = await response.json();

            // 4. Comprobamos si el servidor nos dijo que el login fue correcto (código 200)
            if (response.ok) {
                // ¡Éxito! Guardamos el token de seguridad que nos da el backend en la memoria del navegador
                localStorage.setItem('token', data.token);
                // Guardamos también el email para mostrarlo arriba a la derecha en la cabecera
                localStorage.setItem('userEmail', email);

                // Viajamos a la pantalla del panel de control
                navigate('/analisis');
            } else {
                // Si el backend nos devolvió un error (ej. contraseña mal), mostramos el mensaje que venga del backend
                setError(data.message || 'Error al iniciar sesión');
            }
        } catch (err) {
            // Si el servidor está apagado o no hay internet, entramos aquí
            setError('No se pudo conectar con el servidor. ¿Está el backend encendido?');
        }
    };

*/
    return (

        <div className="relative flex min-h-screen items-center justify-center lg:justify-end overflow-hidden bg-[#0d1117] p-4 lg:pr-20 xl:pr-32">
            <div className="flex items-center space-x-3">
                {/* Usamos las variables importadas en el atributo src */}
                <img src={logoBadajoz} alt="Badajoz" className="h-7 object-contain dark:invert" />
                <img src={logoRed} alt="Timestamp" className="h-7 object-contain" />
            </div>
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