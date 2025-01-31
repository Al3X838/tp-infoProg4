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

// Función para manejo de errores de base de datos

const handleDbError = (err, res, action) => {
    const errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    console.error(`Error al ${action}:`, errorMessage);
    const formattedMessage = errorMessage.split(':').pop().trim()
    res.status(500).json({ success: false, error: `${formattedMessage}` });
};

// Ruta para obtener todas los items
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query('SELECT * FROM CANCHA_DEPORTE;');
        res.json({ success: true, canchaDeportes: result });
    } catch (err) {
        handleDbError(err, res, 'fetching cancha_deporte');
    } finally {
        if (connection) {
            try {
                await connection.close();

            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});

// Ruta GET para obtener un item específica por su ID
router.get('/canchadeporte/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query(`SELECT * FROM CANCHA_DEPORTE WHERE id_cancha_deporte = ?`, [id]);

        if (result.length > 0) {
            res.json({ success: true, canchaDeporte: result[0] });
        } else {
            res.json({ success: false, error: 'canchaDeporte not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching canchaDeporte by ID');
    } finally {
        if (connection) {
            try {
                await connection.close();

            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});

// Ruta GET para obtener un items específicas por su Id de cancha
router.get('/cancha/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query(`SELECT cd.*, d.NOMBRE AS DEPORTE FROM CANCHA_DEPORTE cd LEFT JOIN DEPORTES d ON cd.ID_DEPORTE = d.ID_DEPORTE WHERE cd.ID_CANCHA = ?`, [id]);
        res.json({ success: true, canchaDeportes: result });
    } catch (err) {
        handleDbError(err, res, 'fetching canchaDeporte by ID de cancha');
    } finally {
        if (connection) {
            try {
                await connection.close();

            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});

// Ruta para agregar un nuevo item
router.post('/add', async (req, res) => {
    const { id_cancha, id_deporte, precio_hora } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`INSERT INTO CANCHA_DEPORTE (ID_CANCHA, ID_DEPORTE, PRECIO_HORA) VALUES (?, ?, ?)`, [id_cancha, id_deporte, precio_hora]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding canchaDeporte');
    } finally {
        if (connection) {
            try {
                await connection.close();

            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});


// Ruta para actualizar un item existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { id_cancha, id_deporte, precio_hora } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`UPDATE CANCHA_DEPORTE SET ID_CANCHA = ?, ID_DEPORTE = ?, PRECIO_HORA = ? WHERE id_cancha_deporte = ?`, [id_cancha, id_deporte, precio_hora, id]);
        res.json({ success: true })
    } catch (err) {
        handleDbError(err, res, 'updating canchaDeporte');
    } finally {
        if (connection) {
            try {
                await connection.close();

            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});

// Ruta para eliminar un item
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`DELETE FROM CANCHA_DEPORTE WHERE id_cancha_deporte = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'deleting canchaDeporte');
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