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
    res.status(500).json({ success: false, error: `Database error while ${action}: ${errorMessage}` });
};

// Ruta para obtener todas las clientes
router.get('/', async (req, res) => {
    try {
        const connection = await getConnection();
        const result = await connection.query('SELECT * FROM clientes;');
        await connection.close();
        res.json({ success: true, clientes: result });
    } catch (err) {
        handleDbError(err, res, 'fetching clientes');
    }
});

// Ruta GET para obtener un cliente específica por su ID
router.get('/cliente/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query(`SELECT * FROM clientes WHERE id_cliente = ?`, [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, cliente: result[0] });
        } else {
            res.json({ success: false, error: 'cliente not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching cliente by ID');
    }
});

//Falta hacer
// Ruta para agregar un nueva cliente
router.post('/add', async (req, res) => {
    const { documento, nombre, apellido, fechaNacimiento, direccion, telefono, email, nacionalidad, ciudad, estado, motivoBloqueo } = req.body;
    try {
        const connection = await getConnection();
        await connection.query(`INSERT INTO clientes (DOCUMENTO_ID, NOMBRE, APELLIDO, FECHA_NACIMIENTO, DIRECCION, TELEFONO, EMAIL, NACIONALIDAD, CIUDAD, ESTADO, MOTIVO_BLOQUEO) VALUES (?)`, [documento, nombre, apellido, fechaNacimiento, direccion, telefono, email, nacionalidad, ciudad, estado, motivoBloqueo]);
        await connection.close();
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding cliente');
    }
});


// Ruta para actualizar un cliente existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { documento, nombre, apellido, fechaNacimiento, direccion, telefono, email, nacionalidad, ciudad, estado, motivoBloqueo } = req.body;
    try {
        const connection = await getConnection();
        await connection.query(`UPDATE clientes SET DOCUMENTO_ID = ?, NOMBRE = ?, APELLIDO = ?, FECHA_NACIMIENTO = ?, DIRECCION = ?, TELEFONO = ?, EMAIL = ?, NACIONALIDAD = ?, CIUDAD = ?, ESTADO = ?, MOTIVO_BLOQUEO = ? WHERE id_cliente = ?`, [documento, nombre, apellido, fechaNacimiento, direccion, telefono, email, nacionalidad, ciudad, estado, motivoBloqueo, id]);
        await connection.close();
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'updating cliente');
    }
});

// Ruta para eliminar un cliente
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`DELETE FROM clientes WHERE id_cliente = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'deleting cliente');
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