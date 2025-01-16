const express = require('express');
const router = express.Router();
const odbc = require('odbc');


// Ruta POST para conectar a la base de datos
const getConnection = async () => {
    try {
        const connection = await odbc.connect(`DSN=infoProg4;UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD}`);
        return connection;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw new Error('Database connection error');
    }
};


const handleDbError = (err, res, action) => {
    let errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    if (errorMessage.includes("is referenced by foreign key")) {
        errorMessage = "No se puede realizar la operación porque el registro está relacionado con otros datos.";
    }
    console.error(`Error al ${action}:`, errorMessage);
    res.status(500).json({ success: false, error: `Error al ${action}: ${errorMessage}` });
};


// obtener todas las canchas
router.get('/', async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query(`
            SELECT c.*,
            ts.NOMBRE AS NOMBRE_TIPO_SUELO 
            FROM CANCHAS c
            JOIN TIPO_SUELOS ts ON c.TIPO_SUELO = ts.ID_TIPO_SUELO 
            ORDER BY NUMERO`);
        await connection.close();
        res.json({ success: true, canchas: result });
    } catch (err) {
        handleDbError(err, res, 'fetching canchas');
    }
});

// obtener una cancha por id
router.get('/cancha/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query(`
            SELECT c.*, ts.NOMBRE as NOMBRE_TIPO_SUELO 
            FROM CANCHAS c
            LEFT JOIN TIPO_SUELOS ts ON c.TIPO_SUELO = ts.ID_TIPO_SUELO
            WHERE c.ID_CANCHA = ?`, 
            [id]
        );
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, cancha: result[0] });
        } else {
            res.json({ success: false, error: 'Cancha not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching cancha by ID');
    }
});
// agregar cancha
router.post('/agregar', async (req, res) => {
    const { numero, ubicacion, tipo_suelo } = req.body;
    try {
        const connection = await getConnection();
        await connection.query('INSERT INTO CANCHAS (NUMERO, UBICACION, TIPO_SUELO, LUMINICA, BEBEDERO, BANOS CAMBIADOR, ESTADO) VALUES (?, ?, ?, ?, ?, ?, ?, ?)', [numero, ubicacion, tipo_suelo, luminica, bebedero, banos, cambiador, estado]);
        await connection.close();
        res.json({ success: true, message: 'Cancha agregada correctamente.' });
    } catch (err) {
        handleDbError(err, res, 'agregando cancha');
    }
});

module.exports = router;