// connect.js - Microservicio para conexión a la base de datos

const express = require('express');
const odbc = require('odbc');
const router = express.Router();

// Ruta POST para conectar a la base de datos
router.post('/', async (req, res) => {
    try {
        // Verificar si el usuario está autenticado
        if (!req.session || !req.session.userRole) {
            return res.status(401).send({ message: "No autenticado. Inicie sesión primero." });
        }

        // Obtener credenciales desde el archivo .env
        const dbUsers = JSON.parse(process.env.DB_USERS);
        const userRole = req.session.userRole;

        if (!dbUsers[userRole]) {
            return res.status(403).send({ message: "Rol no válido." });
        }

        const { user, password } = dbUsers[userRole];

        // Intentar la conexión usando ODBC
        const connection = await odbc.connect(`DSN=infoprog4;UID=${user};PWD=${password};CHARSET=utf8;`);
        res.status(200).send({ message: "Conexión exitosa." });

        // Cerrar conexión después de la respuesta
        await connection.close();
    } catch (error) {
        console.error("Error de conexión:", error);
        res.status(500).send({ message: "Error de conexión a la Base de datos." });
    }
});

module.exports = router;