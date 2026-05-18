import logoBadajoz from '../../assets/badajoz.svg';
import logoRed from '../../assets/logo-red.svg';

interface HeaderProps {
    userEmail: string;
    onLogout: () => void;
}

export function Header({ userEmail, onLogout }: HeaderProps) {
    const username = userEmail ? userEmail.split('@')[0] : 'Consultor';
    const initial = username.charAt(0).toUpperCase();

    return (
        <header className="h-14 bg-[#141416]/90 backdrop-blur-xl border-b border-white/[0.05] flex items-center justify-between px-6 z-30 shrink-0">

            {/* Left: logos + title */}
            <div className="flex items-center gap-5">
                <div className="flex items-center gap-3">
                    <img src={logoBadajoz} alt="Badajoz" className="h-6 object-contain opacity-80 dark:invert" />
                    <div className="w-px h-4 bg-white/10" />
                    <img src={logoRed} alt="Timestamp" className="h-4 object-contain opacity-50" />
                </div>
                <div className="hidden sm:flex items-center gap-2">
                    <div className="w-px h-5 bg-white/8" />
                    <span className="text-[13px] font-semibold text-ink-secondary tracking-tight">
                        Auditoría Turística Badajoz
                    </span>
                </div>
            </div>

            {/* Right: user pill + logout */}
            <div className="flex items-center gap-2">
                <div className="flex items-center gap-2.5 bg-white/[0.04] border border-white/[0.07] px-3 py-1.5 rounded-full">
                    <span className="w-5 h-5 rounded-full bg-accent-violet/20 border border-accent-violet/30 flex items-center justify-center text-[10px] font-bold text-accent-violet">
                        {initial}
                    </span>
                    <span className="text-[11px] font-semibold text-ink-secondary">{username}</span>
                    <button
                        onClick={onLogout}
                        title="Cerrar sesión"
                        className="ml-0.5 text-ink-tertiary hover:text-ink-secondary transition-colors"
                    >
                        <i className="ph ph-power text-base leading-none"></i>
                    </button>
                </div>
            </div>

        </header>
    );
}
