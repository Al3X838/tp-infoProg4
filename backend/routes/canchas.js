const express = require('express');
const router = express.Router();
const odbc = require('odbc');

// Ruta POST para conectar a la base de datos
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


const handleDbError = (err, res, action) => {
    const errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    console.error(`Error al ${action}:`, errorMessage);
    const formattedMessage = errorMessage.split(':').pop().trim()
    res.status(500).json({ success: false, error: `${formattedMessage}` });
};


// obtener todas las canchas
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection(req);
        const result = await connection.query(`
            SELECT c.*,
            ts.NOMBRE AS NOMBRE_TIPO_SUELO 
            FROM CANCHAS c
            JOIN TIPO_SUELOS ts ON c.TIPO_SUELO = ts.ID_TIPO_SUELO 
            ORDER BY NUMERO`);
        res.json({ success: true, canchas: result });
    } catch (err) {
        handleDbError(err, res, 'fetching canchas');
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

// obtener una cancha por id
router.get('/cancha/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection(req);
        const result = await connection.query(`
            SELECT 
                c.*,
                ts.NOMBRE as NOMBRE_TIPO_SUELO,
                d.ID_DEPORTE,
                d.NOMBRE as NOMBRE_DEPORTE,
                cd.PRECIO_HORA
            FROM CANCHAS c
            LEFT JOIN TIPO_SUELOS ts ON c.TIPO_SUELO = ts.ID_TIPO_SUELO
            LEFT JOIN CANCHA_DEPORTE cd ON c.ID_CANCHA = cd.ID_CANCHA
            LEFT JOIN DEPORTES d ON cd.ID_DEPORTE = d.ID_DEPORTE
            WHERE c.ID_CANCHA = ?`,
            [id]
        );

        if (result.length > 0) {
            res.json({ success: true, cancha: result[0] });
        } else {
            res.json({ success: false, error: 'Cancha not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching cancha by ID');
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
// agregar cancha
router.post('/add', async (req, res) => {
    let connection = null;
    const {
        NUMERO,
        UBICACION,
        TIPO_SUELO,
        LUMINICA,
        BEBEDERO,
        BANOS,
        CAMBIADOR,
        ESTADO
    } = req.body;

    try {
        connection = await getConnection(req);

        // Agregar la nueva cancha
        await connection.query(
            `INSERT INTO CANCHAS 
            (NUMERO, UBICACION, TIPO_SUELO, LUMINICA, BEBEDERO, BANOS, CAMBIADOR, ESTADO) 
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [NUMERO, UBICACION, TIPO_SUELO, LUMINICA, BEBEDERO, BANOS, CAMBIADOR, ESTADO]
        );

        // Obtener la ID de la última cancha agregada
        const [result] = await connection.query(
            `SELECT ID_CANCHA FROM CANCHAS WHERE NUMERO = ? ORDER BY ID_CANCHA DESC`, [NUMERO]
        );

        if (!result || result.length === 0) {
            console.log('No se pudo obtener la ID de la nueva cancha.');
        }
        const id_cancha = result.ID_CANCHA;

        // Devolver la respuesta exitosa con la nueva ID
        res.json({
            success: true,
            message: 'Cancha agregada correctamente.',
            id_cancha
        });
    } catch (err) {
        handleDbError(err, res, 'agregando cancha');
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


// actualizar cancha
router.post('/update/:id', async (req, res) => {
    let connection = null;
    const {
        NUMERO,
        UBICACION,
        TIPO_SUELO,
        LUMINICA,
        BEBEDERO,
        BANOS,
        CAMBIADOR,
        ESTADO
    } = req.body;
    const { id } = req.params;

    try {
        connection = await getConnection(req);
        await connection.query(
            `UPDATE CANCHAS 
            SET NUMERO = ?, UBICACION = ?, TIPO_SUELO = ?, LUMINICA = ?, BEBEDERO = ?, BANOS = ?, CAMBIADOR = ?, ESTADO = ? 
            WHERE ID_CANCHA = ?`,
            [NUMERO, UBICACION, TIPO_SUELO, LUMINICA, BEBEDERO, BANOS, CAMBIADOR, ESTADO, id]
        );
        res.json({ success: true, message: 'Cancha actualizada correctamente.' });
    } catch (err) {
        handleDbError(err, res, 'actualizando cancha');
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
// eliminar cancha
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection(req);
        await connection.query(`DELETE FROM CANCHAS WHERE ID_CANCHA = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'eliminar cancha');
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