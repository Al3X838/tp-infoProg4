const express = require('express');
const router = express.Router();
const odbc = require('odbc');


// Ruta POST para conectar a la base de datos
const getConnection = async () => {
    try {
        const connection = await odbc.connect(`DSN=infoprog4;UID=${process.env.DB_USER};PWD=${process.env.DB_PASSWORD}`);
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
    let connection = null;
    try {
        connection = await getConnection();
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
                console.log('Conexión cerrada');
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
        connection = await getConnection();
        const result = await connection.query(`
            SELECT c.*, ts.NOMBRE as NOMBRE_TIPO_SUELO 
            FROM CANCHAS c
            LEFT JOIN TIPO_SUELOS ts ON c.TIPO_SUELO = ts.ID_TIPO_SUELO
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
                console.log('Conexión cerrada');
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
        connection = await getConnection();

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
                console.log('Conexión cerrada');
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
        connection = await getConnection();
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
                console.log('Conexión cerrada');
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
        connection = await getConnection();
        await connection.query(`DELETE FROM CANCHAS WHERE ID_CANCHA = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'eliminando cancha');
    } finally {
        if (connection) {
            try {
                await connection.close();
                console.log('Conexión cerrada');
            } catch (closeErr) {
                console.error('Error al cerrar la conexión:', closeErr.message);
            }
        }
    }
});


module.exports = router;