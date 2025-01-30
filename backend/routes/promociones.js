const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Función para obtener la conexión a la base de datos
const getConnection = async () => {
    try {
        const connection = await odbc.connect(`DSN=infoprog4;UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD};CHARSET=utf8;`);
        return connection;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw new Error('Database connection error');
    }
};

// Función para manejar errores de la base de datos
const handleDbError = (err, res, action) => {
    let errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    if (errorMessage.includes("is referenced by foreign key")) {
        errorMessage = "No se puede realizar la operación porque el registro está relacionado con otros datos.";
    }
    console.error(`Error al ${action}:`, errorMessage);
    res.status(500).json({ success: false, error: `Error al ${action}: ${errorMessage}` });
};

// Ruta para activar la promoción
router.get('/activar', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection();

        // Solo ejecutamos la prozedure p_activar_promocion
        const result = await connection.query('EXEC p_activar_promocion');

        res.json({ success: true, result: result });
    } catch (err) {
        handleDbError(err, res, 'activar promoción');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Ruta para desactivar la promoción
router.get('/desactivar', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection();

        // Solo ejecutamos la prozedure p_desactivar_promocion
        const result = await connection.query('EXEC p_desactivar_promocion');

        res.json({ success: true, result: result });
    } catch (err) {
        handleDbError(err, res, 'desactivar promoción');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

module.exports = router;