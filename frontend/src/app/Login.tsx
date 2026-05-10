import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import logoRed from '../assets/logo-red.svg';
import logoBadajoz from '../assets/badajoz.svg';
import { API_BASE } from '../lib/constants';

const imageModules = import.meta.glob('../assets/*.jpg', { eager: true });
const CAROUSEL_IMAGES = Object.values(imageModules).map((m: any) => m.default) as string[];

export function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [slideIndex, setSlideIndex] = useState(0);
    const navigate = useNavigate();

    useEffect(() => {
        if (CAROUSEL_IMAGES.length < 2) return;
        const id = setInterval(() => setSlideIndex(i => (i + 1) % CAROUSEL_IMAGES.length), 5000);
        return () => clearInterval(id);
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setIsLoading(true);
        try {
            const res = await fetch(`${API_BASE}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();
            if (res.ok) {
                localStorage.setItem('token', data.token);
                localStorage.setItem('userEmail', email);
                navigate('/analisis');
            } else {
                setError(data.message || 'Credenciales incorrectas');
            }
        } catch {
            setError('No se pudo conectar con el servidor. ¿Está el backend encendido?');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="flex min-h-screen bg-[#0d1117]">

            {/* ── Panel izquierdo: carrusel ─────────────────────────────────── */}
            <div className="hidden lg:block relative overflow-hidden w-[58%]">

                {/* Imágenes apiladas, fundido entre ellas */}
                {CAROUSEL_IMAGES.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            opacity: i === slideIndex ? 1 : 0,
                            transition: 'opacity 1.2s ease-in-out',
                        }}
                    />
                ))}

                {/* Gradiente: oscurece bordes, especialmente el derecho hacia el panel del form */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/10 via-black/10 to-black/70 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />

                {/* Branding inferior */}
                <div className="absolute bottom-10 left-10 right-10 text-white">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-white/50 mb-3">
                        Badajoz Data Consulting
                    </p>
                    <h1 className="text-5xl font-black tracking-tight leading-none drop-shadow-xl">
                        Tourism<br />
                        <span className="text-white/70">Dashboard</span>
                    </h1>
                    <p className="mt-4 text-sm text-white/50 font-medium max-w-xs leading-relaxed">
                        Gestión y auditoría de calidad de datos turísticos de Badajoz.
                    </p>

                    {/* Dots de navegación (solo si hay más de 1 imagen) */}
                    {CAROUSEL_IMAGES.length > 1 && (
                        <div className="flex items-center gap-2 mt-8">
                            {CAROUSEL_IMAGES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSlideIndex(i)}
                                    className="h-1 rounded-full transition-all duration-500"
                                    style={{
                                        width: i === slideIndex ? '2rem' : '0.4rem',
                                        backgroundColor: i === slideIndex ? 'white' : 'rgba(255,255,255,0.35)',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Panel derecho: formulario ─────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center min-h-screen p-8 bg-[#0d1117]">
                <div className="w-full max-w-[400px]">

                    <div className="mb-10 flex flex-col items-center text-center">
                        <img src={logoBadajoz} alt="Badajoz" className="h-10 mb-4 opacity-90" />
                        <img src={logoRed} alt="Timestamp" className="h-5 mb-6 opacity-70" />
                        <h2 className="text-[26px] font-bold tracking-tight text-white mb-1">
                            Acceso Auditoría
                        </h2>
                        <p className="text-[#64748B] font-bold text-[11px] uppercase tracking-[0.2em] mt-2">
                            Data Quality Manager
                        </p>
                    </div>

                    {error && (
                        <div className="bg-[#2a1318] text-[#F3484A] border border-[#4a1c22] px-5 py-4 rounded-xl text-sm font-bold mb-8 flex items-center gap-3 slide-up">
                            <div className="bg-[#ED2125] text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] shrink-0">!</div>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-[#8B949E] tracking-widest block">
                                Identificador
                            </label>
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin"
                                className="w-full px-5 py-4 bg-[#161B22] border border-[#30363D] rounded-xl outline-none focus:ring-1 focus:ring-[#ED2125] focus:border-[#ED2125] font-bold transition-all text-sm text-white placeholder-[#8B949E] shadow-inner"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase text-[#8B949E] tracking-widest block">
                                Credencial
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className="w-full px-5 py-4 bg-[#161B22] border border-[#30363D] rounded-xl outline-none focus:ring-1 focus:ring-[#ED2125] focus:border-[#ED2125] font-bold transition-all text-sm text-white placeholder-[#8B949E] shadow-inner"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full bg-[#ED2125] hover:bg-[#c91d20] disabled:bg-[#6b1013] text-white py-4 rounded-xl font-bold text-base transition-all active:scale-95 mt-2 flex items-center justify-center gap-2"
                        >
                            {isLoading && <i className="ph ph-spinner animate-spin text-lg"></i>}
                            {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
