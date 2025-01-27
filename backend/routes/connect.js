// connect.js - Microservicio para conexión a la base de datos

const express = require('express');
const odbc = require('odbc');
const router = express.Router();

// Ruta POST para conectar a la base de datos
router.post('/', async (req, res) => {
    const username = process.env.DB_USER;
    const password = process.env.DB_PASSWORD;
    try {
        // Intentar la conexión usando ODBC
        const connection = await odbc.connect(`DSN=infoprog4;UID=${username};PWD=${password};CHARSET=utf8;`);
        res.status(200).send({ message: "Conexión exitosa." });
    } catch (error) {
        res.status(500).send({ message: "Error de conexión a la Base de datos." });
    }
});

module.exports = router;