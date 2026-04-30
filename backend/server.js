require('dotenv').config();
const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');

// ==========================================
// 🚀 IMPORTS PARA PRODUCCIÓN 
// const bcrypt = require('bcryptjs'); 
// const jwt = require('jsonwebtoken'); 
// ==========================================

const app = express();
app.use(cors());
app.use(express.json());

// --- CHIVATO PARA DETECTAR ERRORES CON .env ---
if (!process.env.DB_HOST) {
    console.error("❌ ERROR CRÍTICO: No se han detectado las variables de AWS.");
    console.error("👉 Asegúrate de que el archivo se llama exactamente '.env' y está dentro de la carpeta 'backend'.");
    process.exit(1);
}

// 1. Configuración de la Conexión (AWS RDS MySQL)
const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 3306,
    waitForConnections: true,
    connectionLimit: 10
});

// 2. Middleware para Proteger Rutas
const authenticateToken = (req, res, next) => {
    // ---> 🛑 MODO LOCAL <---
    req.user = { email: 'admin@local.com' };
    next();

    /*
    // ---> ✅ PARA PRODUCCIÓN <---
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.status(401).json({ message: "Acceso denegado." });
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
        if (err) return res.status(403).json({ message: "Sesión expirada." });
        req.user = user;
        next();
    });
    */
};

// ==========================================
// RUTAS DE AUTENTICACIÓN
// ==========================================

app.post('/api/auth/register', async (req, res) => {
    // ---> 🛑 MODO LOCAL <---
    res.status(201).json({ message: "Usuario creado (Simulado en local)." });
});

app.post('/api/auth/login', async (req, res) => {
    // ---> 🛑 MODO LOCAL <---
    const { email, password } = req.body;
    if (email === 'admin' && password === 'admin') {
        return res.json({ token: "token-falso", email: "admin", message: "Bienvenido (Local)" });
    } else {
        return res.status(400).json({ message: "Usa admin / admin" });
    }
});

// ==========================================
// RUTAS DE DATOS (AWS) - DINÁMICAS
// ==========================================

// 1. Obtener todas las tablas y sus estadísticas (NUEVO CÁLCULO REAL)
app.get('/api/estadisticas', authenticateToken, async (req, res) => {
    try {
        // Consultamos al esquema de AWS qué tablas existen
        const [estadisticas] = await pool.query(`
            SELECT table_name as name, table_rows as total 
            FROM information_schema.tables 
            WHERE table_schema = ? AND table_rows > 0
        `, [process.env.DB_NAME]);

        // ⚠️ DEFINE AQUÍ LOS CAMPOS QUE NO QUIERES CONTAR COMO VACÍOS
        const EXCLUDED_FIELDS = ['id', 'palabras_clave', 'uri_clase', 'estado_publicacion', 'url_web', 'app',
            'accessibility_level', 'accessibility_description', 'uri_segittur', 'fecha_creacion',
            'fecha_actualizacion',
            'drupal_nid', 'nivel_1', 'nivel_2', 'nivel_3', 'nivel_4', 'nivel_5'];

        // Usamos Promise.all porque hacemos una consulta asíncrona por cada tabla
        const resultado = await Promise.all(estadisticas.map(async (est) => {
            const tabla = est.name;
            let completeRecordsCount = 0;
            let actualTotal = 0;

            try {
                // Traemos los datos físicos de esta tabla en concreto
                const [filas] = await pool.query(`SELECT * FROM ??`, [tabla]);
                actualTotal = filas.length; // length es más exacto que el information_schema

                if (actualTotal > 0) {
                    filas.forEach(row => {
                        // Filtramos para validar solo las columnas que nos importan
                        // Ignoramos mayúsculas/minúsculas al excluir campos (igual que el frontend)
                        const fieldsToValidate = Object.keys(row).filter(key => !EXCLUDED_FIELDS.includes(key.toLowerCase()));

                        const isRecordComplete = fieldsToValidate.every(field => {
                            const value = row[field];
                            // 2. Si es null o undefined, falla directamente
                            if (value === null || value === undefined) return false;
                            // 3. Lo pasamos a texto y le quitamos los espacios fantasma (igual que el frontend)
                            return value.toString().trim() !== '';
                        });

                        if (isRecordComplete) {
                            completeRecordsCount++;
                        }
                    });
                }
            } catch (error) {
                console.error(`Error al analizar la tabla ${tabla}:`, error);
            }

            // Devolvemos el formato exacto que espera tu frontend para pintar la píldora
            return {
                name: tabla,
                total: actualTotal,
                complete: completeRecordsCount,
                incomplete: actualTotal - completeRecordsCount
            };
        }));

        res.json(resultado);
    } catch (error) {
        console.error("Error al leer estadísticas:", error);
        res.status(500).json({ message: "Error al leer las estadísticas." });
    }
});

// 2. Obtener los datos físicos de una tabla en concreto
app.get('/api/datos/:tabla', authenticateToken, async (req, res) => {
    const tabla = req.params.tabla;

    // Lista de tablas de tu base de datos (seguridad básica para evitar inyección SQL) obtenido de AWS
    const tablasPermitidas = [
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
        "video_media", "virtual_visit", "wifi_point", "winery"
    ];

    if (!tablasPermitidas.includes(tabla)) {
        return res.status(400).json({ message: "Tabla no válida" });
    }

    try {
        // SELECT * trae todas las columnas de la tabla dinámicamente
        const [filas] = await pool.query(`SELECT * FROM ?? LIMIT 1000`, [tabla]);
        res.json(filas);
    } catch (error) {
        console.error(`Error al consultar la tabla ${tabla}:`, error);
        res.status(500).json({ message: "Error al leer los registros." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor backend conectado a AWS (${process.env.DB_HOST}) en el puerto ${PORT}`);
});