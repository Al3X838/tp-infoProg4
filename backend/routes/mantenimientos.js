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
    const formattedMessage = errorMessage.split(':').pop().trim();
    res.status(500).json({ success: false, error: `${formattedMessage}` });
};

// Ruta para obtener todas las mantenimientos
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query('SELECT m.*, c.NUMERO as NUMERO_CANCHA FROM mantenimiento m LEFT JOIN CANCHAS c ON m.ID_CANCHA = c.ID_CANCHA ORDER BY m.ID_MANTENIMIENTO DESC;');
        res.json({ success: true, mantenimientos: result });
    } catch (err) {
        handleDbError(err, res, 'fetching mantenimientos');
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

// Ruta GET para obtener un mantenimiento específico por su ID
router.get('/mantenimiento/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query(`SELECT m.*, c.NUMERO as NUMERO_CANCHA FROM mantenimiento m LEFT JOIN CANCHAS c ON m.ID_CANCHA = c.ID_CANCHA WHERE id_mantenimiento = ?`, [id]);

        if (result.length > 0) {
            res.json({ success: true, mantenimiento: result[0] });
        } else {
            res.json({ success: false, error: 'mantenimiento not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching mantenimiento by ID');
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

// Ruta para agregar un nuevo mantenimiento
router.post('/add', async (req, res) => {
    const { id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, descripcion } = req.body;
    let connection = null;
    const estado = 'P';
    try {
        connection = await getConnection();
        await connection.query(
            `INSERT INTO mantenimiento (ID_CANCHA, FECHA_INICIO, FECHA_FIN, HORA_INICIO, HORA_FIN, DESCRIPCION, ESTADO) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, descripcion, estado]
        );
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding mantenimiento');
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

// Ruta para actualizar un mantenimiento existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, descripcion, estado } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(
            `UPDATE mantenimiento SET ID_CANCHA = ?, FECHA_INICIO = ?, FECHA_FIN = ?, HORA_INICIO = ?, HORA_FIN = ?, DESCRIPCION = ?, ESTADO = ? WHERE id_mantenimiento = ?`,
            [id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, descripcion, estado, id]
        );
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'updating mantenimiento');
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

// Ruta para eliminar un mantenimiento
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`DELETE FROM mantenimiento WHERE id_mantenimiento = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'deleting mantenimiento');
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

module.exports = router;
