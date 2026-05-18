import { useState, useRef, useEffect } from 'react';

type Phase = 'idle' | 'blob' | 'grid' | 'done';

interface ExcelDownloadButtonProps {
    onClick: () => Promise<void> | void;
    label?: string;
    labelLoading?: string;
    labelDone?: string;
    size?: 'sm' | 'md';
    disabled?: boolean;
    className?: string;
}

// ── Sub-components ───────────────────────────────────────────────────────────

// Sage gradient — matches the "complete" status color in our design system
const SHAPE_STYLE = {
    background: 'linear-gradient(155deg, #C8D8B4 0%, #A3B18A 45%, #7C8C6A 100%)',
    boxShadow: 'inset 0 -2px 5px rgba(20,35,15,0.35), inset 0 1px 0 rgba(255,255,255,0.3), 0 3px 8px -3px rgba(124,140,106,0.4)',
};

function GridLines() {
    return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24">
            <rect x="4.5" y="5" width="15" height="3.4" rx="0.6" fill="rgba(2,44,34,0.28)" />
            {[12, 15.4, 18.8].map((y, i) => (
                <line key={i} x1="4.5" y1={y} x2="19.5" y2={y}
                    stroke="white" strokeWidth="0.9" strokeLinecap="round"
                    strokeDasharray="16" strokeDashoffset="16"
                    className="xb-line-draw"
                    style={{ animationDelay: `${0.1 + i * 0.09}s` }}
                />
            ))}
            {[9.5, 14.5].map((x, i) => (
                <line key={i} x1={x} y1="5" x2={x} y2="19.5"
                    stroke="white" strokeWidth="0.9" strokeLinecap="round"
                    strokeDasharray="16" strokeDashoffset="16"
                    className="xb-line-draw"
                    style={{ animationDelay: `${0.38 + i * 0.07}s` }}
                />
            ))}
            <rect x="4.5" y="8.6" width="15" height="3.2" rx="0.4"
                fill="rgba(255,255,255,0.2)" className="xb-row-scan" />
        </svg>
    );
}

function BlobGridIcon({ phase }: { phase: 'blob' | 'grid' }) {
    return (
        <span
            className={`absolute inset-0 ${phase === 'blob' ? 'xb-blob-anim' : 'xb-grid-settled'}`}
            style={SHAPE_STYLE}
        >
            {phase === 'grid' && <GridLines />}
        </span>
    );
}

function DoneIcon() {
    return (
        <span className="absolute inset-0 grid place-items-center xb-done-enter" style={SHAPE_STYLE}>
            <svg width="60%" height="60%" viewBox="0 0 24 24" fill="none">
                <path
                    d="M5.5 12.8 L10.2 17.2 L18.6 7.6"
                    stroke="white" strokeWidth="2.6" strokeLinecap="round" strokeLinejoin="round"
                    strokeDasharray="20" strokeDashoffset="20"
                    className="xb-check-draw"
                />
            </svg>
            <span className="absolute inset-0 rounded-full xb-burst"
                style={{ border: '2px solid rgba(163,177,138,0.6)' }} />
        </span>
    );
}

function DownloadIcon() {
    return (
        <svg className="absolute inset-0 w-full h-full" viewBox="0 0 24 24" fill="none">
            <path d="M12 4V15"     stroke="white" strokeWidth="2"   strokeLinecap="round" />
            <path d="M7.5 11L12 15.5L16.5 11" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M5 19H19"    stroke="white" strokeWidth="2"   strokeLinecap="round" />
        </svg>
    );
}

function DotPulse() {
    return (
        <span className="inline-flex items-end gap-[3px] ml-[5px] mb-[1px]">
            {[0, 1, 2].map(i => (
                <span key={i} className="block w-[3px] h-[3px] rounded-full bg-white/80 xb-dot"
                    style={{ animationDelay: `${i * 0.12}s` }} />
            ))}
        </span>
    );
}

// ── Main component ───────────────────────────────────────────────────────────

export function ExcelDownloadButton({
    onClick,
    label = 'Exportar Excel',
    labelLoading = 'Generando',
    labelDone = 'Listo',
    size = 'md',
    disabled = false,
    className = '',
}: ExcelDownloadButtonProps) {
    const [phase, setPhase] = useState<Phase>('idle');
    const blobTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const doneTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => () => {
        if (blobTimerRef.current) clearTimeout(blobTimerRef.current);
        if (doneTimerRef.current) clearTimeout(doneTimerRef.current);
    }, []);

    const run = async () => {
        if (phase !== 'idle' || disabled) return;
        setPhase('blob');
        const startMs = Date.now();

        // Blob → grid transition at 700ms (independent of operation)
        blobTimerRef.current = setTimeout(() => setPhase('grid'), 700);

        // Run actual operation (errors swallowed — parent shows toast)
        try { await Promise.resolve(onClick?.()); } catch {}

        // Ensure minimum animation time: 700 blob + 1200 grid = 1900ms
        const elapsed = Date.now() - startMs;
        if (elapsed < 1900) await new Promise<void>(r => setTimeout(r, 1900 - elapsed));

        setPhase('done');
        doneTimerRef.current = setTimeout(() => setPhase('idle'), 2000);
    };

    const isWorking = phase !== 'idle';
    const currentLabel = phase === 'done' ? labelDone : isWorking ? labelLoading : label;

    const sizeClass = size === 'sm'
        ? 'px-4 py-2 text-[11px] rounded-xl'
        : 'px-5 py-2.5 text-[11px] rounded-xl';

    return (
        <button
            onClick={run}
            disabled={isWorking || disabled}
            className={`relative flex items-center justify-center gap-2 font-semibold text-white transition-all shadow-md
                ${sizeClass}
                ${disabled
                    ? 'bg-surface-highlight text-ink-tertiary cursor-not-allowed border border-white/[0.05]'
                    : isWorking
                        ? 'bg-[#3A4D35] cursor-progress border border-accent-sage/20'
                        : 'bg-[#3A4D35] hover:bg-[#445840] active:scale-[0.98] border border-accent-sage/20'
                }
                ${className}`}
        >
            {/* Morphing icon */}
            <span className="relative inline-block w-5 h-5 shrink-0 overflow-visible">
                {phase === 'idle'                      && <DownloadIcon />}
                {(phase === 'blob' || phase === 'grid') && <BlobGridIcon phase={phase} />}
                {phase === 'done'                      && <DoneIcon />}
            </span>

            {/* Label with per-phase fade-in */}
            <span key={phase} className="xb-label-in whitespace-nowrap inline-flex items-center">
                {currentLabel}
                {isWorking && phase !== 'done' && <DotPulse />}
            </span>
        </button>
    );
}
