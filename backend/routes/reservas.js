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

// Función para manejar errores de la base de datos
const handleDbError = (err, res, action) => {
    const errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    console.error(`Error al ${action}:`, errorMessage);
    res.status(500).json({ success: false, error: errorMessage });
};

// Ruta para obtener todas las reservas
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query(`SELECT * FROM RESERVAS;`);
        res.json({ success: true, reservas: result });
    } catch (err) {
        handleDbError(err, res, 'obtener reservas');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Ruta para obtener una reserva específica por su ID
router.get('/reserva/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query(`SELECT 
            R.*,
            C.NOMBRE AS NOMBRE_CLIENTE,
            C.APELLIDO AS APELLIDO_CLIENTE,
            CA.NUMERO AS NUMERO_CANCHA 
            FROM RESERVAS R
            JOIN CLIENTES C ON R.ID_CLIENTE = C.ID_CLIENTE
            JOIN CANCHAS CA ON R.ID_CANCHA = CA.ID_CANCHA 
            WHERE ID_RESERVA = ?;`, [id]);
        if (result.length > 0) {
            res.json({ success: true, reserva: result[0] });
        } else {
            res.status(404).json({ success: false, message: 'Reserva no encontrada' });
        }
    } catch (err) {
        handleDbError(err, res, 'obtener reserva por ID');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Ruta para agregar una nueva reserva
router.post('/add', async (req, res) => {
    const { id_cliente, id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, estado_reserva, fecha_limite_cancelacion, estado_cancelacion, porcentaje_promocion } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(
            `INSERT INTO RESERVAS (ID_CLIENTE, ID_CANCHA, FECHA_INICIO, FECHA_FIN, HORA_INICIO, HORA_FIN, ESTADO_RESERVA, FECHA_LIMITE_CANCELACION, ESTADO_CANCELACION, PORCENTAJE_PROMOCION) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);`,
            [id_cliente, id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, estado_reserva, fecha_limite_cancelacion, estado_cancelacion, porcentaje_promocion]
        );
        res.json({ success: true, message: 'Reserva agregada exitosamente' });
    } catch (err) {
        handleDbError(err, res, 'agregar una reserva');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Ruta para actualizar una reserva existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { id_cliente, id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, estado_reserva, fecha_limite_cancelacion, estado_cancelacion, porcentaje_promocion } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(
            `UPDATE RESERVAS 
            SET ID_CLIENTE = ?, ID_CANCHA = ?, FECHA_INICIO = ?, FECHA_FIN = ?, HORA_INICIO = ?, HORA_FIN = ?, ESTADO_RESERVA = ?, FECHA_LIMITE_CANCELACION = ?, ESTADO_CANCELACION = ?, PORCENTAJE_PROMOCION = ?
            WHERE ID_RESERVA = ?;`,
            [id_cliente, id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, estado_reserva, fecha_limite_cancelacion, estado_cancelacion, porcentaje_promocion, id]
        );
        res.json({ success: true, message: 'Reserva actualizada exitosamente' });
    } catch (err) {
        handleDbError(err, res, 'actualizar una reserva');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

// Ruta para eliminar una reserva
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query('DELETE FROM RESERVAS WHERE ID_RESERVA = ?;', [id]);
        res.json({ success: true, message: 'Reserva eliminada exitosamente' });
    } catch (err) {
        handleDbError(err, res, 'eliminar una reserva');
    } finally {
        if (connection) {
            await connection.close();
        }
    }
});

module.exports = router;
