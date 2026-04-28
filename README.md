# Dashboard Turismo Badajoz - Timestamp

## 🚀 Despliegue en Producción
1. Entra a la carpeta backend y ejecuta npm install
2. Copia el archivo .env.example, renómbralo a .env y rellena las credenciales de AWS.
3. En backend/server.js, descomenta las líneas marcadas como PRODUCCIÓN (seguridad, jwt, validación real).
4. Arranca el backend con: pm2 start server.js --name "api-turismo"
5. Sirve el frontend/index.html con cualquier servidor web.
