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

// Ruta para obtener todas los Tipos de Suelo
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection();
        const result = await connection.query('SELECT * FROM TIPO_SUELOS;');
        res.json({ success: true, tipo_suelos: result });
    } catch (err) {
        handleDbError(err, res, 'fetching tipos de suelo');
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

// Ruta GET para obtener un Tipo de Suelo específica por su ID
router.get('/tipo_suelo/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        const connection = await getConnection();
        const result = await connection.query(`SELECT * FROM TIPO_SUELOS WHERE id_tipo_suelo = ?`, [id]);

        if (result.length > 0) {
            res.json({ success: true, tipo_suelo: result[0] });
        } else {
            res.json({ success: false, error: 'tipo de suelo not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching tipo de suelo by ID');
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

//Falta hacer
// Ruta para agregar un nuevo tipo de suelo
router.post('/add', async (req, res) => {
    const { nombre } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`INSERT INTO TIPO_SUELOS (NOMBRE) VALUES (?)`, [nombre]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding tipo de suelo');
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


// Ruta para actualizar un tipo de suelo existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`UPDATE TIPO_SUELOS SET NOMBRE = ? WHERE id_tipo_suelo = ?`, [nombre, id]);
        res.json({ success: true })
    } catch (err) {
        handleDbError(err, res, 'updating tipo de suelo');
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

// Ruta para eliminar un tipo de suelo
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`DELETE FROM TIPO_SUELOS WHERE id_tipo_suelo = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'deleting Tipo de Suelo');
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