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
            setError('No se pudo conectar con el servidor.');
        } finally {
            setIsLoading(false);
        }
    };

    const inputClass = `
        w-full px-4 py-3.5
        bg-surface-overlay border border-white/[0.07]
        rounded-xl outline-none
        focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20
        text-[13px] font-medium text-ink-primary placeholder-ink-tertiary
        transition-all duration-200
    `.trim();

    return (
        <div className="flex min-h-screen bg-surface-base">

            {/* ── Left: cinematic carousel ──────────────────────────────────── */}
            <div className="hidden lg:block relative overflow-hidden w-[58%]">

                {CAROUSEL_IMAGES.map((src, i) => (
                    <img
                        key={src}
                        src={src}
                        alt=""
                        className="absolute inset-0 w-full h-full object-cover"
                        style={{
                            opacity: i === slideIndex ? 1 : 0,
                            transition: 'opacity 1.4s ease-in-out',
                        }}
                    />
                ))}

                {/* Cinematic overlays */}
                <div className="absolute inset-0 bg-gradient-to-r from-surface-base/20 via-surface-base/10 to-surface-base/80 pointer-events-none" />
                <div className="absolute inset-0 bg-gradient-to-t from-surface-base/80 via-transparent to-surface-base/20 pointer-events-none" />

                {/* Editorial branding */}
                <div className="absolute bottom-12 left-10 right-16 text-white">
                    <p className="text-[9px] font-bold uppercase tracking-[0.35em] text-white/40 mb-4">
                        Badajoz Data Consulting
                    </p>
                    <h1 className="font-serif text-5xl font-bold tracking-tight leading-[1.15] drop-shadow-2xl">
                        Tourism<br />
                        <span className="text-white/50 italic font-light">Dashboard</span>
                    </h1>
                    <p className="mt-5 text-[12px] text-white/40 font-normal max-w-xs leading-relaxed">
                        Gestión y auditoría de calidad de datos turísticos de la provincia de Badajoz.
                    </p>

                    {/* Carousel dots */}
                    {CAROUSEL_IMAGES.length > 1 && (
                        <div className="flex items-center gap-1.5 mt-8">
                            {CAROUSEL_IMAGES.map((_, i) => (
                                <button
                                    key={i}
                                    onClick={() => setSlideIndex(i)}
                                    className="h-0.5 rounded-full transition-all duration-500"
                                    style={{
                                        width: i === slideIndex ? '1.75rem' : '0.35rem',
                                        backgroundColor: i === slideIndex ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.25)',
                                    }}
                                />
                            ))}
                        </div>
                    )}
                </div>
            </div>

            {/* ── Right: login form ─────────────────────────────────────────── */}
            <div className="flex-1 flex items-center justify-center min-h-screen p-8 bg-surface-base">
                <div className="w-full max-w-[380px]">

                    {/* Logos */}
                    <div className="mb-10 flex flex-col items-center text-center">
                        <img src={logoBadajoz} alt="Badajoz" className="h-9 mb-4 opacity-70 dark:invert" />
                        <img src={logoRed} alt="Timestamp" className="h-4 mb-8 opacity-40" />
                        <h2 className="font-serif text-[28px] font-semibold tracking-tight text-ink-primary mb-1.5">
                            Acceso Privado
                        </h2>
                        <p className="text-[10px] font-bold uppercase tracking-[0.25em] text-ink-tertiary">
                            Data Quality Manager
                        </p>
                    </div>

                    {/* Error */}
                    {error && (
                        <div className="bg-accent-wine/60 text-[#F3AAAC] border border-[#4a1c22]/60 px-4 py-3.5 rounded-xl text-[12px] font-medium mb-6 flex items-center gap-3 slide-up">
                            <i className="ph-fill ph-warning-circle text-[#F3AAAC] text-lg shrink-0"></i>
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-ink-tertiary tracking-[0.15em] block ml-0.5">
                                Identificador
                            </label>
                            <input
                                type="text"
                                required
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                placeholder="admin"
                                className={inputClass}
                            />
                        </div>
                        <div className="space-y-1.5">
                            <label className="text-[9px] font-bold uppercase text-ink-tertiary tracking-[0.15em] block ml-0.5">
                                Credencial
                            </label>
                            <input
                                type="password"
                                required
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="••••••••"
                                className={inputClass}
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="
                                w-full py-3.5 mt-2 rounded-xl
                                font-semibold text-[13px] text-white
                                bg-gradient-to-r from-accent-violet to-accent-purple
                                hover:opacity-90 active:scale-[0.98]
                                disabled:opacity-40 disabled:cursor-not-allowed
                                transition-all duration-200
                                flex items-center justify-center gap-2
                                shadow-glow-violet
                            "
                        >
                            {isLoading && <i className="ph ph-spinner animate-spin text-base"></i>}
                            {isLoading ? 'Conectando...' : 'Iniciar Sesión'}
                        </button>
                    </form>

                    <p className="mt-8 text-center text-[10px] text-ink-tertiary">
                        © {new Date().getFullYear()} Badajoz Data Consulting
                    </p>
                </div>
            </div>
        </div>
    );
}
