const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Función para obtener la conexión a la base de datos
const getConnection = async () => {
    try {
        const connection = await odbc.connect(`DSN=infoprog4;UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD}`);
        return connection;
    } catch (err) {
        console.error('Error al conectar a la base de datos:', err);
        throw new Error('Database connection error');
    }
};

// Función para manejo de errores de base de datos

const handleDbError = (err, res, action) => {
    const errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    console.error(`Error al ${action}:`, errorMessage);
    const formattedMessage = errorMessage.split(':').pop().trim()
    res.status(500).json({ success: false, error: `${formattedMessage}` });
};

// Ruta para obtener todas los items
router.get('/', async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM DEPORTES;');
        await connection.close();
        res.json({ success: true, deportes: result });
    } catch (err) {
        handleDbError(err, res, 'fetching deportes');
    }
});

// Ruta GET para obtener un item específica por su ID
router.get('/deporte/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query(`SELECT * FROM DEPORTES WHERE id_deporte = ?`, [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, deporte: result[0] });
        } else {
            res.json({ success: false, error: 'deporte not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching deporte by ID');
    }
});

//Falta hacer
// Ruta para agregar un nuevo item
router.post('/add', async (req, res) => {
    const { nombre } = req.body;
    try {
        const connection = await getConnection();
        await connection.query(`INSERT INTO DEPORTES (NOMBRE) VALUES (?)`, [nombre]);
        await connection.close();
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding deporte');
    }
});


// Ruta para actualizar un item existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const connection = await getConnection();
        await connection.query(`UPDATE DEPORTES SET NOMBRE = ? WHERE id_deporte = ?`, [nombre, id]);
        await connection.close();
        res.json({ success: true })
    } catch (err) {
        handleDbError(err, res, 'updating deporte');
    }
});

// Ruta para eliminar un item
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`DELETE FROM DEPORTES WHERE id_deporte = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'deleting deporte');
    } finally {
        // Cerrar la conexión de forma segura
        if (connection) {
            try {
                await connection.close();
            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});

module.exports = router;