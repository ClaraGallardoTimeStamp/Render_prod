# Design System — Badajoz Data Consulting Dashboard

Documento de referencia visual para el rediseño premium completado en mayo 2026.
Estética objetivo: **dark luxury · editorial · SaaS de alta gama**.

---

## 1. Filosofía visual

La UI abandona el look corporativo clásico (rojo institucional, fondos blancos, cards planas) en favor de una experiencia minimalista y sofisticada inspirada en productos como Linear, Framer y Stripe.

Principios que guían cada decisión:

- **Profundidad en capas**: sidebar más oscuro que main, modals más oscuros que el fondo — crea jerarquía espacial sin bordes agresivos.
- **Color con significado**: la paleta de estado (sage / gold / violet) no es decorativa, comunica completitud de datos con precisión semántica.
- **Tipografía editorial**: Playfair Display para títulos de alto impacto, Inter para todo lo funcional — contraste entre serif emocional y sans técnica.
- **Ruido reducido**: bordes en `rgba(255,255,255,0.05)` en lugar de grises sólidos. El espacio vacío es parte del diseño.
- **Microinteracciones comedidas**: transiciones de 150-200 ms, escalados `active:scale-[0.98]`, hover con opacidad — no hay animaciones de ego.

---

## 2. Paleta de colores

### 2.1 Superficies (surface system)

Definen la arquitectura de profundidad de la UI. Siempre van de más oscuro (base) a más claro (overlay).

| Token Tailwind        | Hex        | Uso principal                                      |
|-----------------------|------------|----------------------------------------------------|
| `surface-base`        | `#080B0D`  | Fondo raíz de la app, sidebar, fondo del login     |
| `surface-elevated`    | `#141416`  | Cards del dashboard, tabla de datos, header        |
| `surface-overlay`     | `#1F1F22`  | Inputs, campos de formulario, fields del modal     |
| `surface-highlight`   | `#2A2A2E`  | Hover en nav, track de progress bars               |

### 2.2 Acentos (accent palette)

Sustituyen el rojo corporativo `#EB1C23` como color interactivo primario.

| Token Tailwind        | Hex        | Uso principal                                      |
|-----------------------|------------|----------------------------------------------------|
| `accent-violet`       | `#A78BFA`  | Primario interactivo, nav activo, focus rings      |
| `accent-purple`       | `#C084FC`  | Gradientes CTA, stat "Total", gradiente del botón |
| `accent-sage`         | `#7C8C6A`  | Borde en Excel button, sage oscuro                 |
| `accent-sage-light`   | `#A3B18A`  | Estado **Completo**, toast de éxito, donut         |
| `accent-gold`         | `#D4AF37`  | Estado **En Revisión**, donut, badge auditoría     |
| `accent-wine`         | `#2A1F1F`  | Fondo del mensaje de error en login                |

### 2.3 Contenido / tipografía (ink system)

Jerarquía de texto sobre fondos oscuros.

| Token Tailwind    | Hex        | Uso principal                                      |
|-------------------|------------|----------------------------------------------------|
| `ink-primary`     | `#EDEDED`  | Títulos, valores numéricos, texto principal        |
| `ink-secondary`   | `#9A9A9A`  | Etiquetas, nombres en tabla, descripción           |
| `ink-tertiary`    | `#5A5A5A`  | Labels de inputs, cabeceras de tabla, meta-info    |

### 2.4 Sistema de estado de datos

Reemplaza el semáforo rojo/ámbar/verde genérico por una paleta editorial propia.

| Estado          | Color             | Hex        | Razón de la elección                              |
|-----------------|-------------------|------------|---------------------------------------------------|
| Completo (100%) | Sage light        | `#A3B18A`  | Verde desaturado, calmado — no grita              |
| En revisión     | Gold              | `#D4AF37`  | Precioso, editorial — indica atención sin alarma  |
| Incompleto      | Violet            | `#A78BFA`  | Frío, no alarmista — evita la ansiedad del rojo   |
| Total           | Purple            | `#C084FC`  | Neutro informativo, complementa al violet         |

Esta función vive en [`frontend/src/lib/constants.ts`](../frontend/src/lib/constants.ts):

```typescript
export const getSolidColor = (percent: number): string => {
    if (percent >= 95) return '#A3B18A';  // sage-light
    if (percent >= 60) return '#D4AF37';  // gold
    if (percent >= 30) return '#C084FC';  // purple
    return '#A78BFA';                     // violet
};
```

---

## 3. Tipografía

| Familia            | Uso                                                        | Estilo              |
|--------------------|------------------------------------------------------------|---------------------|
| **Playfair Display** | Títulos editoriales (hero cards, nombre en modal)          | `font-serif`        |
| **Inter**          | Todo el resto: labels, tablas, botones, nav, inputs        | `font-sans`         |

### Escala en uso

| Clase Tailwind         | Tamaño   | Uso                                        |
|------------------------|----------|--------------------------------------------|
| `text-3xl font-serif`  | 30px     | Hero del dashboard ("Ecosistema de Auditoría") |
| `text-[28px] font-serif` | 28px  | Título del modal de detalle                |
| `text-3xl font-bold`   | 30px     | Valores numéricos en stat cards            |
| `text-[13px]`          | 13px     | Texto de párrafo, inputs                   |
| `text-[12px]`          | 12px     | Contenido de tabla, campos del modal       |
| `text-[11px]`          | 11px     | Labels secundarias, counts                 |
| `text-[9px] uppercase` | 9px      | Micro-labels (tracking 0.12–0.25em)        |

---

## 4. Componentes y cambios aplicados

### 4.1 `Header.tsx`

**Antes**: barra `bg-[#2a3241]` con `border-b-[3px] border-[#EB1C23]`.
**Ahora**: glassmorphism — `bg-[#141416]/90 backdrop-blur-xl border-b border-white/[0.05]`.

Cambios visuales:
- Eliminado el borde rojo. La separación del header se logra mediante la diferencia de profundidad de color.
- Logos al 60-70% de opacidad — presentes pero no dominantes.
- User pill: avatar con inicial en fondo violet semitransparente + borde violet tenue.
- Botón de logout: ícono `ph-power` en lugar de texto, transición `text-ink-tertiary → text-ink-secondary`.

### 4.2 `Sidebar.tsx`

**Antes**: `bg-white dark:bg-gray-800` — completamente genérico.
**Ahora**: `bg-surface-base border-r border-white/[0.05]` — el más oscuro de la jerarquía.

Cambios visuales:
- El sidebar siendo más oscuro que el main content crea profundidad espacial sin sombras.
- Select dropdowns: `bg-surface-overlay border border-white/[0.06]` con caret custom (Phosphor icon, no flecha de sistema).
- Nav activa: `bg-accent-violet/10 text-accent-violet border border-accent-violet/15` — pill tenue.
- Nav inactiva: `text-ink-tertiary` con hover `hover:text-ink-secondary hover:bg-white/[0.03]`.
- Theme toggle: botón cuadrado 8×8 con hover subtil.

### 4.3 `Login.tsx`

**Antes**: split layout con fondo `#0d1117`, botón `bg-[#ED2125]`.
**Ahora**: misma estructura split, esteticamente cinematográfica.

Cambios visuales:
- Panel derecho: fondo `bg-surface-base`, sin card — el form flota directamente.
- Overlay cinematográfico del carrusel: doble gradiente (lateral + vertical) usando `surface-base` con opacidades.
- Título en serif italic: `font-serif text-5xl` con `text-white/50 italic font-light` en la segunda línea.
- Inputs: `bg-surface-overlay border border-white/[0.07]` con focus `border-accent-violet/50`.
- CTA button: `bg-gradient-to-r from-accent-violet to-accent-purple` con `shadow-glow-violet`.
- Error: fondo `bg-accent-wine/60`, texto `#F3AAAC` — sin rojo puro.
- Dots del carrusel: líneas finas (h-0.5) en lugar de capsulas gruesas.

### 4.4 `DataTable.tsx`

**Antes**: `bg-white dark:bg-gray-800 border border-warm-200 dark:border-gray-700`.
**Ahora**: `bg-surface-elevated border border-white/[0.05] rounded-2xl`.

Cambios visuales:
- Cabecera: `bg-surface-base/80 text-[9px] font-bold uppercase tracking-[0.12em]` — microscópica, estructural.
- Divisores entre filas: `divide-white/[0.03]` — casi imperceptibles.
- Row hover: `hover:bg-white/[0.02]` — sutilísimo, no disruptivo.
- Badge **OK**: `bg-accent-sage-light/10 text-accent-sage-light` con dot indicador.
- Badge **Progreso**: `bg-accent-violet/10 text-accent-violet` con dot.
- Badge **En revisión**: `bg-accent-gold/10 text-accent-gold`.
- Badge **Pendiente**: `bg-white/[0.04] text-ink-tertiary`.
- Progress bar track: `bg-surface-highlight` (h-1, muy fina).
- Botón "Ver": hover con `bg-accent-violet/10 text-accent-violet`.
- Empty state: icon + mensaje, sin panel con fondo.

### 4.5 `DetailModal.tsx`

**Antes**: `bg-white dark:bg-gray-800 rounded-3xl`.
**Ahora**: `bg-surface-elevated border border-white/[0.07] rounded-2xl shadow-elevated`.

Cambios visuales:
- Backdrop: `bg-black/70 backdrop-blur-sm` — más profundo, cierre con click fuera.
- Header del modal: icono en `bg-accent-violet/10 border border-accent-violet/15`, título en Playfair Display.
- Categoría en header: `text-accent-violet/70` — sutil referencia al acento.
- Campos vacíos: marcados con dot violet `w-1 h-1 rounded-full bg-accent-violet/60` en el label.
- Fields: `bg-surface-overlay border border-white/[0.05]` — uniforme, sin warm-50.
- Footer: progress bar en `h-1` ultra-fina con color del sistema de estado.
- Botón cerrar: `w-8 h-8 rounded-xl bg-white/[0.04] hover:bg-white/[0.08]`.

### 4.6 `ExcelDownloadButton.tsx`

**Antes**: gradient verde `#6ee7b7 → #10b981 → #047857`, botón `bg-green-600`.
**Ahora**: gradient sage `#C8D8B4 → #A3B18A → #7C8C6A`, botón `bg-[#3A4D35]`.

Cambios:
- La morfología animada (blob → grid → checkmark) conserva intacta.
- Paleta del shape actualizada a sage — alineada con el color de "completo".
- Botón deshabilitado: `bg-surface-highlight text-ink-tertiary border border-white/[0.05]`.
- Burst ring: `rgba(163,177,138,0.6)` (sage).

### 4.7 `DataAnalysis.tsx` — Dashboard

**Antes**: cards `bg-white dark:bg-gray-800`, stat cards `bg-warm-50 dark:bg-gray-900/30`, donut verde/ámbar/rojo.
**Ahora**:

- Raíz: `bg-surface-base` (dark) / `bg-slate-50` (light toggle).
- **Hero card** "Ecosistema de Auditoría": título Playfair Display 3xl, ambient glow violet en esquina superior derecha, descripción en ink-tertiary.
- **Donut chart**: colores `['#A3B18A', '#D4AF37', '#A78BFA']` — sage/gold/violet. Cutout al 82% (más fino). Leyenda inline en tres dots.
- **Stat cards**: fondo `bg-surface-overlay`, `border-top` de color (1px del color del estado), valor en 3xl bold con color del estado.
- **Category pills**: `bg-getPastelColor` con hover `scale-[1.02]` y transición.
- **Toolbar de datos**: `bg-surface-elevated`, search input dark glass, checkbox con `accent-accent-violet`.
- **Toast**: `bg-surface-elevated border border-white/[0.08]`, progress bar `bg-accent-sage-light` o `bg-accent-violet`.

---

## 5. Tokens de sombra

| Token Tailwind    | Valor CSS                                                                      | Uso              |
|-------------------|--------------------------------------------------------------------------------|------------------|
| `shadow-surface`  | `0 1px 3px rgba(0,0,0,0.5), 0 4px 16px rgba(0,0,0,0.4)`                       | Cards del dashboard |
| `shadow-elevated` | `0 8px 32px rgba(0,0,0,0.6), 0 2px 8px rgba(0,0,0,0.4)`                       | Modal de detalle |
| `shadow-glow-violet` | `0 0 24px rgba(167,139,250,0.15)`                                           | Botón CTA del login |
| `shadow-glow-sage`   | `0 0 24px rgba(163,177,138,0.12)`                                           | Disponible para export button |

---

## 6. Glassmorphism utilities (`globals.css`)

```css
.glass {
  background: rgba(20, 20, 22, 0.80);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.06);
}
.glass-overlay {
  background: rgba(31, 31, 34, 0.75);
  backdrop-filter: blur(16px);
  border: 1px solid rgba(255, 255, 255, 0.05);
}
```

Usadas para el modal backdrop y el header. Aplican blur + transparencia + micro-borde.

---

## 7. Animaciones definidas

| Clase CSS                 | Descripción                                         | Duración  |
|---------------------------|-----------------------------------------------------|-----------|
| `.fade-in`                | Opacity 0→1 + translateY(6px→0)                     | 350 ms    |
| `.slide-up`               | TranslateY(24px→0) + opacity                        | 280 ms    |
| `.animate-toast-progress` | Barra de progreso del toast (width 100%→0)          | 5 s       |
| `.pill-transition`        | Transición suave para pills de categoría            | 220 ms    |
| `xb-blob-anim`            | Morfología blob del Excel button                    | 700 ms    |
| `xb-done-enter`           | Entrada del checkmark del Excel button              | 400 ms    |
| `xb-check-draw`           | Dibujado del path SVG del checkmark                 | 420 ms    |

---

## 8. Archivos modificados

| Archivo                                                | Tipo de cambio         |
|--------------------------------------------------------|------------------------|
| `frontend/tailwind.config.js`                          | Design tokens completos |
| `frontend/src/styles/globals.css`                      | Glass utils, scrollbars, resizer |
| `frontend/src/lib/constants.ts`                        | getSolidColor / getPastelColor  |
| `frontend/src/components/ui/Header.tsx`                | Glassmorphism header   |
| `frontend/src/components/ui/Sidebar.tsx`               | Dark luxury sidebar    |
| `frontend/src/components/ui/DataTable.tsx`             | Premium dark table     |
| `frontend/src/components/ui/DetailModal.tsx`           | Glass modal            |
| `frontend/src/components/ui/ExcelDownloadButton.tsx`   | Sage palette           |
| `frontend/src/app/Login.tsx`                           | Cinematic login        |
| `frontend/src/app/DataAnalysis.tsx`                    | Dashboard editorial    |

---

## 9. Criterios para futuras extensiones

Cuando añadas nuevos componentes o vistas, sigue estas reglas:

1. **Fondos**: usa siempre tokens `surface-*`. Nunca `gray-700`, `gray-800`, etc.
2. **Texto**: usa tokens `ink-*`. Nunca `text-gray-400` ni `text-white` directos.
3. **Acentos interactivos**: violet como primario, gold/sage para estados de dato.
4. **Bordes**: `border border-white/[0.05]` o `border-white/[0.07]` — nunca colores sólidos.
5. **Hover**: `hover:bg-white/[0.02]` a `hover:bg-white/[0.05]` — incrementos de 0.02.
6. **Focus rings**: `focus:ring-1 focus:ring-accent-violet/20 focus:border-accent-violet/40`.
7. **Border-radius**: `rounded-xl` (inputs, badges) · `rounded-2xl` (cards, modals) · `rounded-full` (pills, avatares).
8. **Tipografía editorial**: usa `font-serif` solo para títulos de impacto (h1, h2 de secciones hero). Todo lo demás en `font-sans`.
