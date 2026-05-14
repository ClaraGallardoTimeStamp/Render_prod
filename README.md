# Dashboard de Auditoría Turística — Badajoz Data Consulting

<div align="center">

![React](https://img.shields.io/badge/React_18-Frontend-61DAFB?style=for-the-badge&logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript)
![Vite](https://img.shields.io/badge/Vite-5-646CFF?style=for-the-badge&logo=vite)
![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge&logo=node.js)
![Express](https://img.shields.io/badge/Express.js-API-black?style=for-the-badge&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-AWS_RDS-blue?style=for-the-badge&logo=mysql)
![Render](https://img.shields.io/badge/Render-Deployed-46E3B7?style=for-the-badge&logo=render)

Plataforma de gestión y auditoría de calidad de datos turísticos de Badajoz, conectada a AWS RDS.

</div>

---

## Descripción

Sistema de análisis y validación de datos turísticos almacenados en MySQL (AWS RDS). Permite detectar registros incompletos, visualizar métricas de calidad por categoría y localidad, y exportar informes Excel profesionales para revisión.

**Credenciales de acceso:**
```
Usuario:   admin
Contraseña: admin
```

---

## Stack tecnológico

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| React | 18 | SPA |
| TypeScript | 5 | Tipado estático |
| Vite | 5 | Build y dev server |
| Tailwind CSS | 3 | Estilos |
| Chart.js | 4 | Gráfico donut |
| ExcelJS | 4 | Exportación Excel (lazy load) |
| React Router | 6 | Navegación |

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| Node.js | 18+ | Runtime |
| Express | 4 | API REST |
| mysql2 | 3 | Conexión AWS RDS |
| ExcelJS | 4 | Generación Excel por registro |
| jsonwebtoken | 9 | Autenticación JWT |
| dotenv | 16 | Variables de entorno |

---

## Estructura del proyecto

```
Render_prod/
├── package.json              ← scripts build/start para Render
├── backend/
│   ├── server.js             ← API REST + sirve frontend/dist
│   ├── package.json
│   └── .env                  ← variables locales (no subir al repo)
└── frontend/
    ├── src/
    │   ├── app/
    │   │   ├── Login.tsx     ← carrusel + formulario de acceso
    │   │   └── DataAnalysis.tsx ← componente principal
    │   ├── components/ui/
    │   │   ├── Header.tsx
    │   │   ├── Sidebar.tsx   ← filtros + navegación
    │   │   ├── DataTable.tsx ← tabla ordenable y filtrable
    │   │   ├── DetailModal.tsx ← detalle de registro
    │   │   └── ExcelDownloadButton.tsx ← botón animado
    │   ├── lib/
    │   │   ├── constants.ts  ← constantes compartidas
    │   │   └── exportExcel.ts ← exportación tabla completa
    │   └── styles/
    │       └── globals.css
    ├── vite.config.ts
    └── dist/                 ← build de producción (generado)
```

---

## Funcionalidades

### Login
- Carrusel automático con fundido entre imágenes de la carpeta `assets/`
- Autenticación mock (`admin / admin`) con emisión de JWT cuando `JWT_SECRET` está configurado

### Dashboard (Home)
- 4 KPIs: total registros, % completitud global, pendientes de revisión, categorías
- Gráfico donut: completos vs incompletos
- Listado de categorías con barra de progreso y porcentaje — clic filtra la tabla

### Gestión de Datos
- Tabla con todos los registros filtrados por localidad, categoría y búsqueda de texto
- Toggle "Solo Faltantes" para ver únicamente registros incompletos
- Ordenación por cualquier columna
- Botón **Exportar Excel** (tabla completa con cabecera branded, filas coloreadas por estado)

### Modal de detalle
- Vista de todos los campos del registro con fondo semitransparente
- Barra de progreso de completitud
- Botón **Descargar Excel para Revisión** (genera plantilla individual desde el backend y marca el registro como "En revisión")

### Botón Excel animado
Estado máquina de tres fases: `idle → blob (morph) → grid (líneas) → done (check)`

---

## Instalación local

### 1. Clonar el repo
```bash
git clone https://github.com/ClaraGallardoTimeStamp/Render_prod.git
cd Render_prod
```

### 2. Configurar variables de entorno del backend
Crear `backend/.env`:
```env
DB_HOST=tu-host.rds.amazonaws.com
DB_PORT=3306
DB_USER=tu_usuario
DB_PASSWORD=tu_contraseña
DB_NAME=nombre_base_datos
JWT_SECRET=cadena-secreta-larga
```

### 3. Instalar dependencias y arrancar

**Backend:**
```bash
cd backend
npm install
npm start
```

**Frontend (desarrollo):**
```bash
cd frontend
npm install
npm run dev
```

El frontend en desarrollo proxea `/api` a `http://localhost:3000` automáticamente (configurado en `vite.config.ts`).

---

## Despliegue en Render

El proyecto usa un `package.json` raíz que orquesta el build completo.

| Campo | Valor |
|---|---|
| **Root Directory** | *(vacío)* |
| **Build Command** | `npm run build` |
| **Start Command** | `npm start` |

### Variables de entorno en Render
```
DB_HOST
DB_USER
DB_PASSWORD
DB_NAME
JWT_SECRET    ← obligatorio para que el login funcione en producción
```

> Sin `JWT_SECRET` el servidor arranca en modo desarrollo y acepta cualquier token.
> Con `JWT_SECRET` el login genera un JWT firmado válido durante 8 horas.

---

## API — Endpoints principales

| Método | Ruta | Auth | Descripción |
|---|---|---|---|
| POST | `/api/auth/login` | No | Login (admin / admin) |
| GET | `/api/estadisticas` | JWT | Resumen de calidad por tabla |
| GET | `/api/datos/:tabla` | JWT | Registros de una tabla |
| GET | `/api/localidades` | No | Lista de localidades únicas |
| GET | `/api/auditoria/excel/:tabla/:id` | JWT | Excel de revisión por registro |

---

## Seguridad

- SQL: sólo tablas de la whitelist `TABLAS_PERMITIDAS` son consultables
- Campos sensibles definidos en `EXCLUDED_FIELDS` se excluyen del análisis
- JWT firmado con `JWT_SECRET` (configurable por entorno)
- Variables de BD nunca hardcodeadas — siempre desde `process.env`

---

## Autoría

Desarrollado por **Badajoz Data Consulting / Timestamp Group**  
para auditoría de calidad de datos turísticos del municipio de Badajoz.
