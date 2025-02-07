const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Función para obtener la conexión a la base de datos
const getConnection = async (req) => {
    try {
        if (!req.session.isAuthenticated) {
            throw new Error('Usuario no autenticado');
        }

        const dbUsers = JSON.parse(process.env.DB_USERS);

        if (!dbUsers[req.session.userRole]) {
            throw new Error('Rol no válido');
        }

        const { user, password } = dbUsers[req.session.userRole];

        const connection = await odbc.connect(`DSN=infoprog4;UID=${user};PWD=${password};CHARSET=utf8;`);
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
    const formattedMessage = errorMessage.split(':').pop().trim()
    res.status(500).json({ success: false, error: `${formattedMessage}` });
};

// Ruta para obtener todas las reservas
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection(req);
        const result = await connection.query(`
            SELECT  
            R.*, 
            C.NOMBRE AS NOMBRE_CLIENTE, 
            C.APELLIDO AS APELLIDO_CLIENTE, 
            C.DOCUMENTO_ID AS DOCUMENTO_CLIENTE, 
            CA.NUMERO AS NUMERO_CANCHA 
            FROM RESERVAS R  
            JOIN CLIENTES C ON R.ID_CLIENTE = C.ID_CLIENTE  
            JOIN CANCHAS CA ON R.ID_CANCHA = CA.ID_CANCHA  
            ORDER BY R.ID_RESERVA DESC;

        `);

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
        connection = await getConnection(req);
        const result = await connection.query(`SELECT
            R.*,
            C.NOMBRE AS NOMBRE_CLIENTE,
            C.APELLIDO AS APELLIDO_CLIENTE,
            C.DOCUMENTO_ID AS DOCUMENTO_CLIENTE,

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

// Ruta GET para obtener reservas por fecha
router.get('/fecha/:fecha', async (req, res) => {
    const { fecha } = req.params; // Fecha en formato YYYY-MM-DD
    let connection = null;
    try {
        connection = await getConnection(req);
        const result = await connection.query(
            `SELECT *
             FROM reservas
             WHERE ? BETWEEN FECHA_INICIO AND FECHA_FIN`,
            [fecha]
        );

        res.json({ success: true, reservas: result });
    } catch (err) {
        handleDbError(err, res, 'fetching reservas by date');
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

// Ruta para agregar una nueva reserva
router.post('/add', async (req, res) => {
    const {
        cliente, cancha, fechaInicio, fechaFin, horaInicio, horaFin,
        estadoReserva, fechaLimiteCancelacion, estadoCancelacion, porcentajePromocion, deporte, reembolsable
    } = req.body;
    let connection = null;

    try {
        connection = await getConnection(req);
        const result = await connection.query(`
            INSERT INTO RESERVAS (ID_CLIENTE, ID_CANCHA, FECHA_INICIO, FECHA_FIN, HORA_INICIO, HORA_FIN, ESTADO_RESERVA, FECHA_LIMITE_CANCELACION, ESTADO_CANCELACION, PORCENTAJE_PROMOCION, ID_DEPORTE, REEMBOLSABLE)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
            [parseInt(cliente), parseInt(cancha), fechaInicio, fechaFin, horaInicio, horaFin, estadoReserva, fechaLimiteCancelacion, estadoCancelacion, parseFloat(porcentajePromocion), parseFloat(deporte), reembolsable]
        );
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'añadir la reserva');
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

// Ruta para actualizar una reserva existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { id_cliente, id_cancha, fecha_inicio, fecha_fin, hora_inicio,
        hora_fin, estado_reserva, fecha_limite_cancelacion, estado_cancelacion, porcentaje_promocion, reembolsable } = req.body;
    let connection = null;
    try {
        connection = await getConnection(req);
        await connection.query(
            `UPDATE RESERVAS 
            SET ID_CLIENTE = ?, ID_CANCHA = ?, FECHA_INICIO = ?, FECHA_FIN = ?, HORA_INICIO = ?, HORA_FIN = ?, ESTADO_RESERVA = ?, FECHA_LIMITE_CANCELACION = ?, ESTADO_CANCELACION = ?, PORCENTAJE_PROMOCION = ?, REEMBOLSABLE = ?
            WHERE ID_RESERVA = ?;`,
            [id_cliente, id_cancha, fecha_inicio, fecha_fin, hora_inicio, hora_fin, estado_reserva, fecha_limite_cancelacion, estado_cancelacion, porcentaje_promocion, reembolsable, id]
        );
        res.json({ success: true, message: 'Reserva actualizada exitosamente' });
    } catch (err) {
        handleDbError(err, res, 'actualizar una reserva');
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

// Ruta para eliminar una reserva
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection(req);
        await connection.query('DELETE FROM RESERVAS WHERE ID_RESERVA = ?;', [id]);
        res.json({ success: true, message: 'Reserva eliminada exitosamente' });
    } catch (err) {
        handleDbError(err, res, 'eliminar una reserva');
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

router.put('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection(req);
        await connection.query(
            `UPDATE RESERVAS 
            SET ESTADO_RESERVA = 'A'
            WHERE ID_RESERVA = ?;`,
            [id]
        );
        const result = await connection.query(`
            SELECT 
                R.*,
                C.NOMBRE AS NOMBRE_CLIENTE,
                C.APELLIDO AS APELLIDO_CLIENTE,
                C.EMAIL AS EMAIL_CLIENTE,
                CA.NUMERO AS NUMERO_CANCHA 
            FROM RESERVAS R
            JOIN CLIENTES C ON R.ID_CLIENTE = C.ID_CLIENTE
            JOIN CANCHAS CA ON R.ID_CANCHA = CA.ID_CANCHA 
            WHERE R.ID_RESERVA = ?;`,
            [id]
        );
        res.json({ success: true, reserva: result[0] });
    } catch (err) {
        handleDbError(err, res, 'confirmar la reserva');
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
