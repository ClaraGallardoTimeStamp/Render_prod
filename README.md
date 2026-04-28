# 📊 Dashboard Turismo Badajoz - Timestamp Consulting

Bienvenido al repositorio del **Dashboard de Calidad de Datos Turísticos de Badajoz**. Esta herramienta ha sido desarrollada para auditar, visualizar y corregir la información de la base de datos de recursos turísticos (alojamientos, monumentos, restaurantes, etc.) alojada en AWS RDS.

---

## 🚀 ¿Qué hace este proyecto y cómo funciona?

Este proyecto consta de dos partes principales que se comunican entre sí:

### 1. Backend (Node.js + Express + MySQL)
El backend actúa como un puente entre la base de datos en Amazon Web Services (AWS) y nuestro panel visual. 
* **Lectura Dinámica:** Lee las tablas disponibles permitidas y consulta el `information_schema` para obtener estadísticas rápidas de cuántos registros hay y calcular el porcentaje de completitud.
* **Seguridad:** Tiene un sistema de autenticación preparado (actualmente en modo local/mockeado con `admin` / `admin`, pero listo para usar JWT en producción).
* **Endpoints principales:** * `/api/estadisticas`: Devuelve los KPIs generales.
  * `/api/datos/:tabla`: Devuelve los datos físicos de una tabla específica.

### 2. Frontend (HTML + React + TailwindCSS)
El frontend es una Single Page Application (SPA) incrustada en un archivo `.html`.
* **React & Babel (Standalone):** Todo el dashboard (estado, componentes, navegación) está en `frontend/index.html` utilizando React renderizado directamente en el navegador. (También hay una versión `new.html` basada en Vanilla JS).
* **Estilos:** Usa **Tailwind CSS** mediante CDN para los estilos, el modo oscuro y la interfaz responsiva.
* **Gráficos:** Utiliza **Chart.js** para renderizar los gráficos de completitud (Donuts y Barras).

---

## 💻 Desarrollo Local (Para los compis)

Para correr el proyecto en tu máquina y hacer pruebas:

1. **Clonar el repositorio** y acceder a la carpeta del proyecto.
2. **Configurar el Backend:**
   * Entra en la carpeta `backend/`: `cd backend`
   * Instala las dependencias: `npm install`
   * Copia el archivo de ejemplo a las variables de entorno: `cp .env.example .env` *(Nota: pide a un administrador las credenciales reales de AWS para rellenar este archivo)*.
3. **Arrancar el servidor local:**
   * Ejecuta: `npm start` (o `node server.js`).
   * Verás un mensaje indicando que está conectado a AWS en el puerto 3000.
4. **Abrir el Frontend:**
   * Simplemente abre el archivo `frontend/index.html` en tu navegador web preferido (o usa herramientas como Live Server de VSCode).
   * Inicia sesión con **Usuario:** `admin` / **Contraseña:** `admin`.

---

## 🌍 Despliegue en Producción

Para subir el proyecto a un entorno de producción seguro, sigue estos pasos:

### 1. Preparación del Servidor (Backend)
1. Sube el código del `backend` a tu servidor (ej. instancia EC2 de AWS, VPS en DigitalOcean, etc.).
2. Entra a la carpeta del backend y ejecuta `npm install`.
3. Crea un archivo `.env` real basado en `.env.example` y rellena las credenciales exactas de AWS RDS. Añade también un `JWT_SECRET` seguro.

### 2. Activación de Seguridad en el Código (¡Importante!)
En el archivo `backend/server.js` debes hacer los siguientes cambios para activar la seguridad real:
1. **Descomenta los imports de seguridad** (líneas 6 y 7):
   ```javascript
   const bcrypt = require('bcryptjs'); 
   const jwt = require('jsonwebtoken');