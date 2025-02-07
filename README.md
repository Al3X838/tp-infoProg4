# Energia Activa

## Descripción

Energia Activa es un sistema de reservas para canchas deportivas. Permite la gestión de:

- **Canchas**
- **Mantenimientos**
- **Clientes**
- **Reservas**
- **Pagos**

El sistema requiere una conexión ODBC con un perfil llamado **infoprog4**. El usuario administrador es:

- **Usuario:** `dba`
- **Contraseña:** `sql`

## Instalación

Para instalar este proyecto, sigue los siguientes pasos:

1. **Instalar las dependencias:** Asegúrate de estar en el directorio del proyecto:
   1. Abre una terminal en el directorio del proyecto.
   2. Cambia al directorio del backend:
   ```bash
   cd /backend
   ```
   3. Instala las dependencias necesarias:
   ```bash
   npm install
   ```
   **Asegúrate de tener Node.js instalado:** Si no lo tienes, puedes descargarlo desde [nodejs.org](https://nodejs.org).

## Configuraciones

El programa busca un **ODBC Usuario-DSN** llamado `infoprog4`. Este DSN debe estar configurado para conectarse a la base de datos.

### Opciones de conexión:

1. **Conexión directa:** Configura el DSN para que apunte directamente al archivo de la base de datos.
2. **Servicio para gestionar la base de datos:**
   - Inicia un servicio que gestione la base de datos.
   - Configura el DSN `infoprog4` para conectarse a este servicio.

> **Nota**: Asegúrate de que el DSN esté correctamente configurado antes de iniciar la aplicación, ya que de lo contrario no podrá acceder a los datos.

## Variables de entorno

Puedes configurar roles y usuarios web en el archivo `.env`.

## Uso

Para utilizar este proyecto, sigue los siguientes pasos:

1. Inicia la aplicación:

   ```bash
   node app.js
   ```

   Asegúrate de estar en el directorio `/backend` del proyecto antes de ejecutar este comando.

2. Abre tu navegador y visita: [http://localhost:3000/](http://localhost:3000/)

3. Credenciales de acceso:

   - **Usuario:** `dba`
   - **Contraseña:** `sql`
