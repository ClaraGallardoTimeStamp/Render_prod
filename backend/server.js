require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const path = require('path');
const ExcelJS = require('exceljs');

// ==========================================
// 🚀 IMPORTS PARA PRODUCCIÓN
// const bcrypt = require('bcryptjs');
// const jwt = require('jsonwebtoken');
// ==========================================

const app = express();
app.use(cors());
app.use(express.json());

// Sirve el frontend estático (producción)
app.use(express.static(path.join(__dirname, '../frontend')));

// --- CHIVATO PARA DETECTAR ERRORES CON .env ---
if (!process.env.DB_HOST) {
    console.error("❌ ERROR CRÍTICO: No se han detectado las variables de AWS.");
    console.error("👉 En Render: añádelas en Environment Variables. En local: crea el archivo '.env' dentro de 'backend'.");
    process.exit(1);
}

// ==========================================
// 1. CONEXIÓN AWS RDS MySQL
// ==========================================
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// ==========================================
// 2. MIDDLEWARE DE AUTENTICACIÓN
// ==========================================

// ---> ✅ PRODUCCIÓN: token JWT real <---
const authenticateToken = (req, res, next) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Acceso denegado." });

    // Token simple firmado con JWT_SECRET (definir en Render > Environment Variables)
    // Para activar JWT completo descomenta las líneas de jwt.verify y el import de arriba
    // jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    //     if (err) return res.status(403).json({ message: "Sesión expirada." });
    //     req.user = user;
    //     next();
    // });

// ==========================================
// 🟢 MODO PROD — descomenta este bloque y
//    comenta el de arriba para desarrollo
// ==========================================
    // Mientras no uses JWT real, aceptamos el token-falso del login mock

    req.user = { email: token === 'token-falso' ? 'admin@timestamp.es' : 'consultor@timestamp.es' };
    next();
//};

// ==========================================
// 🛑 MODO LOCAL — descomenta este bloque y
//    comenta el de arriba para desarrollo
// ==========================================
 //       req.user = { email: 'admin@local.com' };
//        next();
    };


// ==========================================
// TRADUCCIÓN DE CATEGORÍAS
// ==========================================
const CATEGORY_TRANSLATIONS = {
    "accessible_poi": "Punto de Interés Accesible", "alojamientos": "Alojamientos",
    "archeological_site": "Sitio Arqueológico", "atm": "Cajero Automático",
    "audio_guide": "Audioguía", "beach": "Playa", "bike_lane": "Carril Bici",
    "bridge": "Puente", "castle": "Castillo", "church": "Iglesia",
    "complementary_activities_company": "Actividades Complementarias",
    "destination_experience": "Experiencia en Destino", "educational_centre": "Centro Educativo",
    "equestrian_club": "Club Hípico", "event": "Evento", "fire_station": "Estación de Bomberos",
    "garden": "Jardín", "gas_station": "Gasolinera",
    "historical_or_cultural_resource": "Recurso Histórico o Cultural", "image_360": "Imagen 360",
    "leisure_and_culture_facility": "Instalación de Ocio y Cultura", "medical_service": "Servicio Médico",
    "miscellaneous_service": "Servicios Misceláneos", "monument": "Monumento",
    "municipio_ref": "Referencia de Municipio", "museum": "Museo", "natural_park": "Parque Natural",
    "natural_view_point": "Mirador Natural", "offer": "Oferta", "pamphlet": "Folleto",
    "pharmacy": "Farmacia", "photography": "Fotografía", "police_station": "Comisaría de Policía",
    "primary_care": "Atención Primaria", "restaurantes": "Restaurantes", "route": "Ruta",
    "shopping_mall": "Centro Comercial", "sport_facility": "Instalación Deportiva",
    "supermarket": "Supermercado", "tour_guide": "Guía Turístico",
    "tourism_destination": "Destino Turístico", "tourist_attraction_site": "Atracción Turística",
    "tourist_information_office": "Oficina de Turismo", "town_hall": "Ayuntamiento",
    "traditional_market": "Mercado Tradicional", "trail": "Sendero",
    "travel_agency": "Agencia de Viajes", "trivia_question": "Pregunta de Trivial",
    "vehicle_experience": "Experiencia en Vehículo", "vehicle_workshop": "Taller de Vehículos",
    "vernacular_architecture": "Arquitectura Vernácula", "video_360": "Video 360",
    "video_media": "Medio de Video", "virtual_visit": "Visita Virtual",
    "wifi_point": "Punto WiFi", "winery": "Bodega"
};

// ==========================================
// CAMPOS EXCLUIDOS DEL ANÁLISIS
// ==========================================
const EXCLUDED_FIELDS = [
    'id', 'palabras_clave', 'uri_clase', 'estado_publicacion', 'url_web', 'app',
    'accessibility_level', 'accessibility_description', 'uri_segittur', 'fecha_creacion',
    'fecha_actualizacion', 'drupal_nid', 'nivel_1', 'nivel_2', 'nivel_3', 'nivel_4', 'nivel_5',
    'auditoria_estado', 'usuario_auditor'
];

// ==========================================
// WHITELIST DE TABLAS
// ==========================================
const TABLAS_PERMITIDAS = [
    "accessible_poi", "alojamientos", "archeological_site", "atm", "audio_guide", "beach",
    "bike_lane", "bridge", "castle", "church", "complementary_activities_company",
    "destination_experience", "educational_centre", "equestrian_club", "event",
    "fire_station", "garden", "gas_station", "historical_or_cultural_resource",
    "image_360", "leisure_and_culture_facility", "medical_service", "miscellaneous_service",
    "monument", "municipio_ref", "museum", "natural_park", "natural_view_point", "offer",
    "pamphlet", "pharmacy", "photography", "police_station", "primary_care", "restaurantes",
    "route", "shopping_mall", "sport_facility", "supermarket", "tour_guide",
    "tourism_destination", "tourist_attraction_site", "tourist_information_office",
    "town_hall", "traditional_market", "trail", "travel_agency", "trivia_question",
    "vehicle_experience", "vehicle_workshop", "vernacular_architecture", "video_360",
    "video_media", "virtual_visit", "wifi_point", "winery", "registro_auditoria"
];

// ==========================================
// HELPER: CATEGORIZAR CAMPOS CON CLAUDE API
// ==========================================
async function categorizarCampos(campos, contextoTabla) {
    try {
        const response = await fetch('https://api.anthropic.com/v1/messages', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': process.env.ANTHROPIC_API_KEY,
                'anthropic-version': '2023-06-01'
            },
            body: JSON.stringify({
                model: 'claude-sonnet-4-20250514',
                max_tokens: 800,
                messages: [{
                    role: 'user',
                    content: `Clasifica estos campos de una tabla de base de datos de turismo llamada "${contextoTabla}" en categorías lógicas para un formulario de auditoría.
Devuelve SOLO un objeto JSON válido, sin texto adicional, sin backticks, sin explicaciones.
Formato exacto: {"NOMBRE CATEGORÍA": ["campo1", "campo2"], ...}
Usa categorías en español en MAYÚSCULAS: IDENTIFICACIÓN, DESCRIPCIÓN, UBICACIÓN, CONTACTO, MULTIMEDIA, TÉCNICO, ACCESIBILIDAD, HORARIOS Y PRECIOS.
Máximo 6 categorías. Incluye TODOS los campos. Agrupa con sentido común según el nombre del campo.
Campos a clasificar: ${campos.join(', ')}`
                }]
            })
        });

        if (!response.ok) throw new Error(`API error: ${response.status}`);
        const data = await response.json();
        const text = data.content[0].text.trim();
        const grouped = JSON.parse(text);

        // Verificar que todos los campos están incluidos (fallback por si Claude omite alguno)
        const camposEnGrupos = Object.values(grouped).flat();
        const camposFaltantes = campos.filter(c => !camposEnGrupos.includes(c));
        if (camposFaltantes.length > 0) {
            grouped['OTROS'] = camposFaltantes;
        }
        return grouped;

    } catch (err) {
        console.error('⚠️  Error al categorizar con Claude, usando fallback:', err.message);
        // Fallback: todos los campos en un grupo genérico
        return { 'CAMPOS DEL REGISTRO': campos };
    }
}

// ==========================================
// HELPER: CONSTRUIR EXCEL CON DISEÑO PRO
// ==========================================
async function generarExcel(registro, tabla, id, camposEditables, usuarioEmail = '') {
    // Paleta de colores
    const C = {
        NAVY:     '0F172A',
        DARK:     '1E293B',
        BLUE:     '2563EB',
        BLUE_MD:  'DBEAFE',
        BLUE_LT:  'EFF6FF',
        CLOUD:    'F8FAFC',
        GRAY_BD:  'E2E8F0',
        GRAY_TXT: '64748B',
        GRAY_FLD: 'F1F5F9',
        WHITE:    'FFFFFF',
        SLATE:    '334155',
    };

    const solidFill = (hex) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb: hex } });
    const thin  = (color = C.GRAY_BD) => ({ style: 'thin',   color: { argb: color } });
    const med   = (color = C.BLUE)    => ({ style: 'medium', color: { argb: color } });
    const allBorder = (color = C.GRAY_BD) => ({ left: thin(color), right: thin(color), top: thin(color), bottom: thin(color) });

    const wb = new ExcelJS.Workbook();
    wb.creator = 'Timestamp Consulting';
    wb.created = new Date();

    const ws = wb.addWorksheet('Formulario');
    ws.views = [{ showGridLines: false }];

    // Anchos de columna: A=margen, B=campo, C=valor actual, D=nuevo valor, E=margen
    ws.getColumn(1).width = 2.5;
    ws.getColumn(2).width = 30;
    ws.getColumn(3).width = 40;
    ws.getColumn(4).width = 40;
    ws.getColumn(5).width = 2.5;

    // Fondo base gris nube en toda la hoja
    for (let r = 1; r <= 200; r++) {
        for (let c = 1; c <= 5; c++) {
            ws.getCell(r, c).fill = solidFill(C.CLOUD);
        }
    }

    // ── HEADER (filas 1-4) ──
    ws.getRow(1).height = 6;
    ws.getRow(2).height = 38;
    ws.getRow(3).height = 20;
    ws.getRow(4).height = 28;
    ws.getRow(5).height = 10;

    for (let r = 1; r <= 4; r++) {
        for (let c = 1; c <= 5; c++) ws.getCell(r, c).fill = solidFill(C.NAVY);
    }

    // Título: nombre del registro
    const nombreRegistro = registro.nombre || registro.name || registro.titulo || registro.title || `Registro #${id}`;
    const categoriaLabel = CATEGORY_TRANSLATIONS[tabla] || tabla;

    const title = ws.getCell('B2');
    title.value = nombreRegistro.toUpperCase();
    title.font = { name: 'Segoe UI', size: 15, bold: true, color: { argb: C.WHITE } };
    title.alignment = { vertical: 'middle' };

    const sub = ws.getCell('B3');
    sub.value = `Formulario de actualización · ${categoriaLabel}`;
    sub.font = { name: 'Segoe UI', size: 9, color: { argb: '94A3B8' } };
    sub.alignment = { vertical: 'middle' };

    const sub2 = ws.getCell('B4');
    sub2.value = `ID Registro: ${id}`;
    sub2.font = { name: 'Segoe UI', size: 8, color: { argb: '64748B' } };
    sub2.alignment = { vertical: 'middle' };
/*
    // Botones simulados en columna D
    const btn1 = ws.getCell('D2');
    btn1.value = '▶  GUARDAR CAMBIOS';
    btn1.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: C.WHITE } };
    btn1.fill = solidFill(C.BLUE);
    btn1.alignment = { horizontal: 'center', vertical: 'middle' };
    btn1.border = allBorder('1D4ED8');

    const btn2 = ws.getCell('D3');
    btn2.value = '✕  LIMPIAR';
    btn2.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: '94A3B8' } };
    btn2.fill = solidFill(C.NAVY);
    btn2.alignment = { horizontal: 'center', vertical: 'middle' };
*/
    const btn3 = ws.getCell('D4');
    btn3.value = `Generado: ${new Date().toLocaleDateString('es-ES')}  ·  ${usuarioEmail}`;
    btn3.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: '64748B' } };
    btn3.fill = solidFill(C.NAVY);
    btn3.alignment = { horizontal: 'right', vertical: 'middle' };

    // ── Cabeceras de columna (fila 6) ──
    ws.getRow(6).height = 26;
    [
        { col: 2, text: 'CAMPO FÍSICO',            bg: C.DARK },
        { col: 3, text: 'VALOR ACTUAL EN SISTEMA', bg: C.DARK },
        { col: 4, text: 'NUEVO VALOR  ✎',          bg: C.BLUE },
    ].forEach(({ col, text, bg }) => {
        const cell = ws.getCell(6, col);
        cell.value = text;
        cell.font = { name: 'Segoe UI', size: 9, bold: true, color: { argb: C.WHITE } };
        cell.fill = solidFill(bg);
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
        cell.border = allBorder(C.SLATE);
    });

    // ── Categorizar campos dinámicamente con Claude ──
    const grouped = await categorizarCampos(camposEditables, categoriaLabel);

    // ── Construir filas de datos ──
    let currentRow = 7;
    const dataRows = [];

    for (const [category, fields] of Object.entries(grouped)) {
        if (!fields || fields.length === 0) continue;

        // Separador de categoría
        ws.getRow(currentRow).height = 17;
        for (let c = 1; c <= 5; c++) ws.getCell(currentRow, c).fill = solidFill(C.BLUE_MD);
        const catCell = ws.getCell(currentRow, 2);
        catCell.value = `  ${category}`;
        catCell.font = { name: 'Segoe UI', size: 8, bold: true, color: { argb: C.BLUE } };
        catCell.alignment = { vertical: 'middle' };
        for (let c = 2; c <= 4; c++) {
            ws.getCell(currentRow, c).border = { top: thin('BFDBFE'), bottom: thin('BFDBFE') };
        }
        currentRow++;

        fields.forEach((campo, i) => {
            ws.getRow(currentRow).height = 22;
            const rowBg = i % 2 === 0 ? C.WHITE : 'F8FAFC';

            const valor = registro[campo];
            const isEmpty = (valor === null || valor === undefined || valor.toString().trim() === '');
            const valorTexto = isEmpty ? '---  VACÍO ---' : valor.toString();

            // A - margen
            ws.getCell(currentRow, 1).fill = solidFill(C.CLOUD);

            // B - Campo físico
            const b = ws.getCell(currentRow, 2);
            b.value = campo.toUpperCase();
            b.font = { name: 'Courier New', size: 9, bold: true, color: { argb: C.SLATE } };
            b.fill = solidFill(C.GRAY_FLD);
            b.alignment = { vertical: 'middle', indent: 1 };
            b.border = allBorder();

            // C - Valor actual (sólo lectura visual)
            const c = ws.getCell(currentRow, 3);
            c.value = valorTexto;
            c.font = { name: 'Segoe UI', size: 10, italic: true, color: { argb: isEmpty ? 'BBBBBB' : '1E293B' } };
            c.fill = solidFill(rowBg);
            c.alignment = { vertical: 'middle', indent: 1, wrapText: true };
            c.border = allBorder();

            // D - Nuevo valor (editable, borde azul izquierdo)
            const d = ws.getCell(currentRow, 4);
            d.value = '';
            d.font = { name: 'Segoe UI', size: 10, color: { argb: '1E293B' } };
            d.fill = solidFill(C.WHITE);
            d.alignment = { vertical: 'middle', indent: 1 };
            d.border = { left: med(), right: thin(), top: thin(), bottom: thin() };

            // E - margen
            ws.getCell(currentRow, 5).fill = solidFill(C.CLOUD);

            dataRows.push(currentRow);
            currentRow++;
        });
    }

    // ── Espacio y footer ──
    currentRow++;
    ws.getRow(currentRow).height = 8;
    currentRow++;
    ws.getRow(currentRow).height = 22;
    for (let c = 1; c <= 5; c++) ws.getCell(currentRow, c).fill = solidFill('F1F5F9');
    const ft = ws.getCell(currentRow, 2);
    ft.value = 'Timestamp Consulting · Auditoría Turística Badajoz';
    ft.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: C.GRAY_TXT } };
    ft.alignment = { vertical: 'middle' };
    const ft2 = ws.getCell(currentRow, 4);
    ft2.value = `Generado: ${new Date().toLocaleDateString('es-ES')}`;
    ft2.font = { name: 'Segoe UI', size: 8, italic: true, color: { argb: C.GRAY_TXT } };
    ft2.alignment = { horizontal: 'right', vertical: 'middle' };

    // ── Formato condicional: resalta en azul si D tiene valor ──
    if (dataRows.length > 0) {
        const dRange = `D${dataRows[0]}:D${dataRows[dataRows.length - 1]}`;
        ws.addConditionalFormatting({
            ref: dRange,
            rules: [{
                type: 'expression',
                formulae: [`D${dataRows[0]}<>""`],
                style: {
                    fill: { type: 'pattern', pattern: 'solid', fgColor: { argb: 'EFF6FF' } },
                    font: { bold: true, color: { argb: C.BLUE } },
                    border: { left: { style: 'medium', color: { argb: C.BLUE } } }
                }
            }]
        });
    }

    // ── Protección: sólo columna D editable ──
    ws.protect('timestamp2025', {
        selectLockedCells: true,
        selectUnlockedCells: true,
        formatCells: false,
        formatColumns: false,
        formatRows: false,
    });
    // Bloquear todo
    for (let r = 1; r <= currentRow; r++) {
        for (let c = 1; c <= 5; c++) {
            ws.getCell(r, c).protection = { locked: true };
        }
    }
    // Desbloquear solo columna D en filas de datos
    dataRows.forEach(r => {
        ws.getCell(r, 4).protection = { locked: false };
    });

    // ── Configuración de impresión ──
    ws.pageSetup.orientation = 'portrait';
    ws.pageSetup.fitToPage = true;
    ws.pageSetup.fitToWidth = 1;
    ws.printArea = `A1:E${currentRow}`;

    return wb;
}

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

app.post('/api/auth/register', async (req, res) => {
    // TODO producción: hash password con bcrypt + guardar en DB
    res.status(201).json({ message: "Usuario creado (Simulado)." });
});

app.post('/api/auth/login', async (req, res) => {
    const { email, password } = req.body;
    // ---> Login mock (válido mientras no haya DB de usuarios) <---
    if (email === 'admin' && password === 'admin') {
        return res.json({ token: "token-falso", email: "admin@timestamp.es", message: "Bienvenido" });
    }
    return res.status(400).json({ message: "Credenciales incorrectas. Usa admin / admin" });

    /*
    // ---> ✅ Login real con bcrypt + JWT <---
    // const [rows] = await pool.query('SELECT * FROM usuarios WHERE email = ?', [email]);
    // if (!rows.length) return res.status(400).json({ message: "Usuario no encontrado." });
    // const valid = await bcrypt.compare(password, rows[0].password_hash);
    // if (!valid) return res.status(400).json({ message: "Contraseña incorrecta." });
    // const token = jwt.sign({ email: rows[0].email }, process.env.JWT_SECRET, { expiresIn: '8h' });
    // return res.json({ token, email: rows[0].email });
    */
});

// ==========================================
// RUTAS DE DATOS
// ==========================================

// 1. Estadísticas globales
app.get('/api/estadisticas', authenticateToken, async (req, res) => {
    try {
        const [estadisticas] = await pool.query(`
            SELECT table_name as name, table_rows as total 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_rows > 0
        `, [process.env.DB_NAME]);

        const resultado = await Promise.all(estadisticas.map(async (est) => {
            const tabla = est.name;
            let completeRecordsCount = 0;
            let revisionCount = 0;
            let actualTotal = 0;

            try {
                const [filas] = await pool.query(`
                    SELECT t.*, a.estado as auditoria_estado 
                    FROM ?? t
                    LEFT JOIN registro_auditoria a ON a.nombre_tabla = ? AND a.registro_id = CAST(t.id AS CHAR)
                `, [tabla, tabla]);
                actualTotal = filas.length;

                filas.forEach(row => {
                    if (row.auditoria_estado === 'En revisión') { revisionCount++; return; }
                    const fieldsToValidate = Object.keys(row).filter(key => !EXCLUDED_FIELDS.includes(key.toLowerCase()));
                    const isComplete = fieldsToValidate.every(field => {
                        const value = row[field];
                        return value !== null && value !== undefined && value.toString().trim() !== '';
                    });
                    if (isComplete) completeRecordsCount++;
                });
            } catch (error) {
                console.error(`Error al analizar la tabla ${tabla}:`, error);
            }

            return {
                name: tabla,
                total: actualTotal,
                complete: completeRecordsCount,
                enRevision: revisionCount,
                incomplete: actualTotal - completeRecordsCount - revisionCount
            };
        }));

        res.json(resultado);
    } catch (error) {
        console.error("Error al leer estadísticas:", error);
        res.status(500).json({ message: "Error al leer las estadísticas." });
    }
});

// 2. Datos de una tabla concreta
app.get('/api/datos/:tabla', authenticateToken, async (req, res) => {
    const tabla = req.params.tabla;
    if (!TABLAS_PERMITIDAS.includes(tabla)) return res.status(400).json({ message: "Tabla no válida" });

    try {
        const [filas] = await pool.query(`
            SELECT t.*, a.estado as auditoria_estado, a.usuario_auditor 
            FROM ?? t
            LEFT JOIN registro_auditoria a ON a.nombre_tabla = ? AND a.registro_id = CAST(t.id AS CHAR)
            LIMIT 1000
        `, [tabla, tabla]);
        res.json(filas);
    } catch (error) {
        console.error(`Error al consultar la tabla ${tabla}:`, error);
        res.status(500).json({ message: "Error al leer los registros." });
    }
});

// ==========================================
// RUTA DE AUDITORÍA — registrar en BD
// ==========================================
app.post('/api/auditoria/descarga', authenticateToken, async (req, res) => {
    const { tabla, registro_id } = req.body;
    const usuario = req.user.email;
    if (!tabla || !registro_id) return res.status(400).json({ message: "Faltan datos para la auditoría." });

    try {
        await pool.query(`
            INSERT INTO registro_auditoria (nombre_tabla, registro_id, estado, usuario_auditor, fecha_descarga)
            VALUES (?, ?, 'En revisión', ?, NOW())
            ON DUPLICATE KEY UPDATE estado = 'En revisión', usuario_auditor = ?, fecha_descarga = NOW()
        `, [tabla, registro_id, usuario, usuario]);
        res.status(200).json({ message: "Auditoría registrada correctamente." });
    } catch (error) {
        console.error(`Error al registrar auditoría:`, error);
        res.status(500).json({ message: "Error al actualizar estado en AWS." });
    }
});

// ==========================================
// RUTA DE DESCARGA EXCEL — backend genera
// ==========================================
app.get('/api/auditoria/excel/:tabla/:id', authenticateToken, async (req, res) => {
    const { tabla, id } = req.params;

    // Seguridad: validar tabla y formato de id
    if (!TABLAS_PERMITIDAS.includes(tabla)) return res.status(400).json({ message: "Tabla no válida." });
    if (!/^\d+$/.test(id)) return res.status(400).json({ message: "ID no válido." });

    try {
        // 1. Obtener el registro de AWS
        const [filas] = await pool.query('SELECT * FROM ?? WHERE id = ? LIMIT 1', [tabla, id]);
        if (filas.length === 0) return res.status(404).json({ message: "Registro no encontrado." });
        const registro = filas[0];

        // 2. Campos editables
        const camposEditables = Object.keys(registro).filter(
            k => !EXCLUDED_FIELDS.includes(k.toLowerCase())
        );

        // 3. Registrar auditoría en BD
        const usuario = req.user.email;
        await pool.query(`
            INSERT INTO registro_auditoria (nombre_tabla, registro_id, estado, usuario_auditor, fecha_descarga)
            VALUES (?, ?, 'En revisión', ?, NOW())
            ON DUPLICATE KEY UPDATE estado = 'En revisión', usuario_auditor = ?, fecha_descarga = NOW()
        `, [tabla, id.toString(), usuario, usuario]);

        // 4. Generar Excel con diseño profesional + categorías dinámicas
        const workbook = await generarExcel(registro, tabla, id, camposEditables, req.user.email);

        // 5. Nombre del archivo limpio
        const nombreBase = (registro.nombre || registro.name || registro.titulo || `Registro_${id}`)
            .replace(/[^a-zA-Z0-9_\-áéíóúÁÉÍÓÚñÑ ]/g, '')
            .trim()
            .replace(/ /g, '_');
        const nombreArchivo = `Plantilla_${nombreBase}.xlsx`;

        // 6. Enviar como descarga
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename="${nombreArchivo}"`);
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('Error generando Excel:', error);
        res.status(500).json({ message: 'Error al generar el archivo Excel.' });
    }
});

// ==========================================
// FALLBACK — sirve el HTML para rutas no-API
// ==========================================
app.use((req, res, next) => {
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend', 'idex.html'));
    } else {
        next();
    }
});

// ==========================================
// ARRANQUE DEL SERVIDOR
// ==========================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor conectado a AWS (${process.env.DB_HOST}) en el puerto ${PORT}`);
});