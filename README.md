# 🧭 Dashboard de Calidad de Datos Turísticos — Render_prod

<div align="center">

![Node.js](https://img.shields.io/badge/Node.js-18+-green?style=for-the-badge\&logo=node.js)
![React](https://img.shields.io/badge/React-Frontend-61DAFB?style=for-the-badge\&logo=react)
![Express](https://img.shields.io/badge/Express.js-API-black?style=for-the-badge\&logo=express)
![MySQL](https://img.shields.io/badge/MySQL-RDS-blue?style=for-the-badge\&logo=mysql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-UI-38B2AC?style=for-the-badge\&logo=tailwind-css)
![Chart.js](https://img.shields.io/badge/Chart.js-Analytics-FF6384?style=for-the-badge\&logo=chart.js)

Sistema de auditoría, análisis y visualización de calidad de datos turísticos conectado a AWS RDS.

</div>

---

# 📌 Descripción General

`Render_prod` es una plataforma orientada al análisis y validación de datos turísticos almacenados en una base de datos relacional alojada en AWS RDS.

El proyecto permite:

* Analizar tablas dinámicamente.
* Detectar niveles de completitud de datos.
* Visualizar KPIs y métricas de calidad.
* Navegar registros turísticos de forma estructurada.
* Auditar información incompleta o inconsistente.
* Facilitar procesos de limpieza y gobernanza del dato.

La solución está diseñada con una arquitectura desacoplada basada en:

* **Backend API REST** con Node.js + Express.
* **Frontend SPA** con React renderizado en navegador.
* **Persistencia** en MySQL sobre AWS RDS.
* **Visualización analítica** mediante Chart.js.

---

# 🏗️ Arquitectura del Proyecto

```text
┌─────────────────────────────┐
│         Frontend SPA        │
│ React + Tailwind + Chart.js │
└──────────────┬──────────────┘
               │ HTTP / JSON
               ▼
┌─────────────────────────────┐
│         Backend API         │
│      Node.js + Express      │
└──────────────┬──────────────┘
               │
               ▼
┌─────────────────────────────┐
│      AWS RDS / MySQL        │
│  Datos turísticos auditados │
└─────────────────────────────┘
```

---

# ✨ Características Principales

## 📊 Dashboard Analítico

* KPIs globales de calidad.
* Indicadores de completitud.
* Métricas agregadas por tabla.
* Visualización gráfica interactiva.

## 🧠 Auditoría de Datos

* Lectura dinámica de tablas.
* Inspección automática de columnas.
* Detección de campos vacíos.
* Análisis porcentual de calidad.

## 🔐 Sistema de Autenticación

* Login preparado para JWT.
* Arquitectura compatible con autenticación real.
* Modo mock para entorno local.

## 📈 Visualización Avanzada

* Gráficos Doughnut.
* Gráficos de barras.
* Estadísticas en tiempo real.
* Interfaz responsive.

## ☁️ Integración Cloud

* AWS RDS.
* Compatible con despliegues en Render, EC2 o VPS.
* Variables de entorno seguras.

---

# 🧱 Stack Tecnológico

## Backend

| Tecnología | Uso                       |
| ---------- | ------------------------- |
| Node.js    | Runtime del servidor      |
| Express.js | API REST                  |
| MySQL      | Base de datos             |
| dotenv     | Variables de entorno      |
| JWT        | Autenticación             |
| bcryptjs   | Seguridad de credenciales |

## Frontend

| Tecnología       | Uso                        |
| ---------------- | -------------------------- |
| React            | Interfaz SPA               |
| Babel Standalone | Transpilación en navegador |
| TailwindCSS      | Diseño responsive          |
| Chart.js         | Gráficas analíticas        |
| HTML5            | Estructura base            |

## Infraestructura

| Servicio           | Uso                   |
| ------------------ | --------------------- |
| AWS RDS            | Persistencia de datos |
| GitHub             | Control de versiones  |
| Render / VPS / EC2 | Hosting               |

---

# 📂 Estructura del Proyecto

```bash
Render_prod/
│
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── .env.example
│   └── ...
│
├── frontend/
│   ├── index.html
│   ├── new.html
│   └── assets/
│
├── .vscode/
├── .claude/
├── package.json
├── README.md
└── agent.md
```

---

# ⚙️ Instalación Local

## 1. Clonar el repositorio

```bash
git clone https://github.com/ClaraGallardoTimeStamp/Render_prod.git
cd Render_prod
```

---

## 2. Configurar el Backend

```bash
cd backend
npm install
```

Crear archivo `.env`:

```env
PORT=3000
DB_HOST=your-host
DB_PORT=3306
DB_USER=your-user
DB_PASSWORD=your-password
DB_NAME=your-database
JWT_SECRET=your-secret
```

---

## 3. Ejecutar el servidor

```bash
npm start
```

Servidor disponible en:

```text
http://localhost:3000
```

---

## 4. Ejecutar el Frontend

Abrir:

```text
frontend/index.html
```

Opcionalmente usar:

* Live Server (VSCode)
* http-server
* nginx local

---

# 🔑 Acceso Local

Modo desarrollo:

```text
Usuario: admin
Password: admin
```

⚠️ Recomendado únicamente para entornos locales.

---

# 🔌 Endpoints Principales

## Obtener estadísticas generales

```http
GET /api/estadisticas
```

### Respuesta

```json
{
  "total_registros": 1200,
  "porcentaje_completitud": 87,
  "tablas_analizadas": 12
}
```

---

## Obtener datos de una tabla

```http
GET /api/datos/:tabla
```

### Ejemplo

```http
GET /api/datos/restaurantes
```

---

# 📊 Funcionalidades del Dashboard

## KPIs Disponibles

* Número total de registros.
* Porcentaje de calidad.
* Campos incompletos.
* Cobertura por categoría.
* Calidad por tabla.

## Visualizaciones

* Doughnut charts.
* Bar charts.
* Indicadores porcentuales.
* Tarjetas estadísticas.

## Navegación

* Selección dinámica de tablas.
* Consulta de registros.
* Exploración visual de datos.

---

# 🔐 Seguridad

El proyecto incluye una base preparada para producción:

## Recomendaciones

* Activar JWT real.
* Hash de contraseñas con bcrypt.
* Uso de HTTPS.
* Restringir CORS.
* Variables sensibles fuera del repositorio.
* Separar entornos (`dev`, `staging`, `prod`).

## Variables Sensibles

Nunca subir:

```text
.env
credentials.json
JWT_SECRET
AWS credentials
```

---

# 🚀 Despliegue

## Opción 1 — Render

Ideal para despliegues rápidos.

### Build Command

```bash
npm install
```

### Start Command

```bash
node backend/server.js
```

---

## Opción 2 — AWS EC2

### Requisitos

* Ubuntu 22+
* Node.js 18+
* PM2
* Nginx

### Instalación rápida

```bash
npm install -g pm2
pm2 start backend/server.js
pm2 save
```

---

## Opción 3 — Docker

### Dockerfile sugerido

```dockerfile
FROM node:18

WORKDIR /app

COPY . .

RUN npm install

EXPOSE 3000

CMD ["node", "backend/server.js"]
```

### Construcción

```bash
docker build -t render-prod .
```

### Ejecución

```bash
docker run -p 3000:3000 render-prod
```

---

# 📈 Escalabilidad

El proyecto está preparado para evolucionar hacia:

* Microservicios.
* APIs desacopladas.
* Frontend React modularizado.
* Dashboards multiusuario.
* Integración con Power BI.
* Exportación Excel/PDF.
* Sistema avanzado de permisos.
* Auditoría automática programada.

---

# 🧪 Testing Recomendado

## Backend

* Jest
* Supertest

## Frontend

* React Testing Library
* Cypress

---

# 📋 Roadmap

## Corto Plazo

* [ ] JWT real.
* [ ] Roles y permisos.
* [ ] Refactor SPA.
* [ ] API versionada.

## Medio Plazo

* [ ] Docker Compose.
* [ ] Integración CI/CD.
* [ ] Exportación Excel.
* [ ] Logging avanzado.

## Largo Plazo

* [ ] Arquitectura serverless.
* [ ] Multi-tenant.
* [ ] Machine Learning para calidad de datos.
* [ ] Integración GIS / mapas turísticos.

---

# 🤝 Buenas Prácticas de Desarrollo

## Commits

Convención sugerida:

```bash
feat:
fix:
refactor:
docs:
style:
```

## Branching

```text
main
staging
feature/*
hotfix/*
```

---

# 🛠️ Problemas Comunes

## Error de conexión MySQL

Verificar:

* Variables `.env`
* Seguridad de AWS RDS
* IP autorizada
* Puerto 3306 abierto

---

## Error CORS

Agregar en Express:

```javascript
app.use(cors())
```

---

## Frontend no carga datos

Comprobar:

* Backend activo.
* Endpoint correcto.
* Puerto configurado.
* Errores en consola.

---

# 👥 Público Objetivo

Este sistema está orientado a:

* Consultoras tecnológicas.
* Ayuntamientos.
* Oficinas de turismo.
* Equipos de BI.
* Equipos de Data Governance.
* Analistas de calidad de datos.

---

# 📄 Licencia

Proyecto de uso interno / privado.

Definir licencia según estrategia de distribución:

* MIT
* Apache 2.0
* Privada empresarial

---

# 👨‍💻 Autoría

Desarrollado para procesos de análisis y auditoría de datos turísticos.

Arquitectura orientada a escalabilidad, mantenibilidad y visualización analítica.

---

# ⭐ Recomendaciones Futuras

Para profesionalizar aún más el proyecto:

* Migrar frontend a Vite + React moderno.
* Añadir TypeScript fullstack.
* Implementar Prisma ORM.
* Añadir Swagger/OpenAPI.
* Incorporar autenticación OAuth.
* Añadir métricas observables.
* Integrar pipelines CI/CD.

---

# 📬 Soporte

Para incidencias o mejoras:

1. Crear issue.
2. Documentar pasos.
3. Adjuntar logs.
4. Añadir entorno afectado.

---

<div align="center">

### 🚀 Plataforma de Auditoría y Calidad de Datos Turísticos

Arquitectura moderna · Visualización analítica · Escalable · Cloud Ready

</div>
