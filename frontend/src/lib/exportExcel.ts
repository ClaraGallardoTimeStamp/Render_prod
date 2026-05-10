import { CATEGORY_TRANSLATIONS } from './constants';

// ── Tipos inline para no importar ExcelJS en nivel de módulo (lazy load) ──
type FillPat = { type: 'pattern'; pattern: 'solid'; fgColor: { argb: string } };
type TBorder = { style: 'thin' | 'medium'; color: { argb: string } };
type ABorder = { left: TBorder; right: TBorder; top: TBorder; bottom: TBorder };

const sf   = (hex: string): FillPat => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: hex } });
const tb   = (color = 'E2E8F0'): TBorder => ({ style: 'thin',   color: { argb: color } });
const mb   = (color: string):    TBorder => ({ style: 'medium', color: { argb: color } });
const ab   = (color = 'E2E8F0'): ABorder => ({ left: tb(color), right: tb(color), top: tb(color), bottom: tb(color) });

const C = {
    RED:   'ED2125',  // brand
    NAVY:  '0F172A',
    DARK:  '1E293B',
    SLATE: '334155',
    WHITE: 'FFFFFF',
    G50:   'F8FAFC',
    G100:  'F1F5F9',
    G200:  'E2E8F0',
    TEXT:  '1E293B',
    MUTED: '64748B',
    G_BG:  'DCFCE7', G_FG: '065F46',   // verde
    R_BG:  'FEE2E2', R_FG: '991B1B',   // rojo
    A_BG:  'FEF3C7', A_FG: '92400E',   // ámbar
};

export async function exportAuditTable(
    rows: any[],
    locFilter: string,
    catFilter: string
): Promise<void> {
    const { default: ExcelJS } = await import('exceljs');

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Badajoz Data Consulting';
    wb.created = new Date();

    const ws = wb.addWorksheet('Auditoría');
    ws.views = [{ showGridLines: false, state: 'frozen', ySplit: 5 }];

    // ── Columnas ──
    const dataCols: string[] = rows[0]?._meta?.editableKeys ?? [];
    const FIXED = 6;
    const totalCols = FIXED + dataCols.length;

    const colWidths = [
        13, 26, 34, 11, 11, 13,
        ...dataCols.map(k => Math.min(30, Math.max(13, k.length * 1.6 + 4)))
    ];
    colWidths.forEach((w, i) => { ws.getColumn(i + 1).width = w; });

    const fillRow = (rn: number, hex: string) => {
        for (let c = 1; c <= totalCols; c++) ws.getCell(rn, c).fill = sf(hex);
    };

    // ── CABECERA ──
    ws.getRow(1).height = 5;  fillRow(1, C.RED);
    ws.getRow(2).height = 38; fillRow(2, C.NAVY);
    ws.getRow(3).height = 22; fillRow(3, C.DARK);
    ws.getRow(4).height = 5;  fillRow(4, C.NAVY);

    // Título (fila 2)
    const mergeEnd = Math.max(FIXED, Math.floor(totalCols * 0.65));
    ws.mergeCells(2, 1, 2, mergeEnd);
    let titleTxt = 'Reporte de Calidad de Datos';
    if (locFilter)  titleTxt += `  ·  ${locFilter}`;
    if (catFilter)  titleTxt += `  ·  ${CATEGORY_TRANSLATIONS[catFilter] || catFilter}`;
    const titleCell = ws.getCell(2, 1);
    titleCell.value = titleTxt;
    titleCell.font = { name: 'Segoe UI', size: 14, bold: true, color: { argb: C.WHITE } };
    titleCell.alignment = { vertical: 'middle', indent: 1 };

    // Estadísticas (fila 3)
    ws.mergeCells(3, 1, 3, totalCols);
    const complete = rows.filter(r => r._meta.isComplete).length;
    const pct = rows.length > 0 ? Math.round(complete / rows.length * 100) : 0;
    const statsCell = ws.getCell(3, 1);
    statsCell.value = `${rows.length} registros  ·  ${complete} completos  ·  ${rows.length - complete} pendientes  (${pct}%)  ·  Generado: ${new Date().toLocaleDateString('es-ES')}  ·  Badajoz Data Consulting`;
    statsCell.font = { name: 'Segoe UI', size: 9, color: { argb: '94A3B8' } };
    statsCell.alignment = { vertical: 'middle', indent: 1 };

    // Cabeceras de tabla (fila 5)
    ws.getRow(5).height = 26;
    const hdrs = [
        'ESTADO', 'CATEGORÍA', 'NOMBRE', 'PROGRESO', 'FALTANTES', 'ÚLT. MOD.',
        ...dataCols.map(k => k.replace(/_/g, ' ').toUpperCase())
    ];
    hdrs.forEach((h, idx) => {
        const cell = ws.getCell(5, idx + 1);
        cell.value = h;
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: C.WHITE } };
        cell.fill = sf(idx < FIXED ? C.DARK : C.SLATE);
        cell.alignment = { vertical: 'middle', horizontal: idx >= 2 ? 'left' : 'center', indent: idx >= 2 ? 1 : 0 };
        cell.border = { bottom: mb(C.RED), left: tb(C.SLATE), right: tb(C.SLATE) };
    });

    // ── FILAS DE DATOS ──
    rows.forEach((row, i) => {
        const rn = i + 6;
        ws.getRow(rn).height = 20;
        const bg = i % 2 === 0 ? C.WHITE : C.G50;
        const ok = row._meta.isComplete;
        const pctRow: number = row._meta.percent;

        const set = (col: number, value: any, opts: {
            bg?: string; fg?: string; bold?: boolean; italic?: boolean;
            center?: boolean; indent?: number;
        } = {}) => {
            const cell = ws.getCell(rn, col);
            cell.value = value;
            cell.font = { name: 'Segoe UI', size: 9, bold: opts.bold, italic: opts.italic, color: { argb: opts.fg ?? C.TEXT } };
            cell.fill = sf(opts.bg ?? bg);
            cell.alignment = { vertical: 'middle', horizontal: opts.center ? 'center' : 'left', indent: opts.indent ?? 0, wrapText: false };
            cell.border = ab(C.G200);
        };

        // Estado
        set(1, ok ? '✓  OK' : '⚠  REVISAR', { bg: ok ? C.G_BG : C.R_BG, fg: ok ? C.G_FG : C.R_FG, bold: true, center: true });

        // Categoría
        set(2, CATEGORY_TRANSLATIONS[row._categoria] || row._categoria, { fg: C.MUTED, indent: 1 });

        // Nombre
        set(3, row._meta.nombreValor, { bold: true, indent: 1 });

        // Progreso
        const [pFg, pBg] = pctRow >= 100 ? [C.G_FG, C.G_BG] : pctRow <= 30 ? [C.R_FG, C.R_BG] : [C.A_FG, C.A_BG];
        set(4, `${pctRow}%`, { fg: pFg, bg: pBg, bold: true, center: true });

        // Faltantes
        set(5, row._meta.missingFieldsCount, { fg: row._meta.missingFieldsCount > 0 ? C.R_FG : C.G_FG, bold: true, center: true });

        // Última mod
        set(6, row._meta.fechaMod, { fg: C.MUTED, center: true });

        // Campos de datos
        dataCols.forEach((key: string, di: number) => {
            const val = row[key];
            const empty = val === null || val === undefined || String(val).trim() === '';
            set(7 + di, empty ? '' : String(val), {
                bg: empty ? 'FFF5F5' : bg,
                fg: empty ? 'CCCCCC' : C.TEXT,
                italic: empty,
                indent: 1,
            });
        });
    });

    // ── FOOTER ──
    const fr = rows.length + 6;
    ws.getRow(fr).height = 18;
    ws.mergeCells(fr, 1, fr, totalCols);
    const ftCell = ws.getCell(fr, 1);
    ftCell.value = `Badajoz Data Consulting  ·  Auditoría de Calidad de Datos  ·  ${new Date().toLocaleDateString('es-ES')}`;
    ftCell.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: C.MUTED } };
    ftCell.fill = sf(C.G100);
    ftCell.alignment = { vertical: 'middle', indent: 1 };
    ftCell.border = { top: tb(C.G200) };

    ws.getRow(fr + 1).height = 4;
    fillRow(fr + 1, C.RED);

    // ── DESCARGA ──
    const buf = await wb.xlsx.writeBuffer();
    const blob = new Blob([buf as ArrayBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    let name = 'Reporte_Calidad';
    if (locFilter) name += `_${locFilter.replace(/\s+/g, '_')}`;
    if (catFilter) name += `_${(CATEGORY_TRANSLATIONS[catFilter] || catFilter).replace(/\s+/g, '_')}`;
    a.download = `${name}.xlsx`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
