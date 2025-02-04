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

// Función para manejo de errores de base de datos

const handleDbError = (err, res, action) => {
    const errorMessage = err?.odbcErrors?.[0]?.message || err.message || 'Unknown database error';
    console.error(`Error al ${action}:`, errorMessage);
    const formattedMessage = errorMessage.split(':').pop().trim()
    res.status(500).json({ success: false, error: `${formattedMessage}` });
};

// Ruta para obtener todas las clientes
router.get('/', async (req, res) => {
    let connection = null;
    try {
        connection = await getConnection(req);
        const result = await connection.query('SELECT * FROM clientes;');
        res.json({ success: true, clientes: result });
    } catch (err) {
        handleDbError(err, res, 'fetching clientes');
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

// Ruta GET para obtener un cliente específica por su ID
router.get('/cliente/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection(req);
        const result = await connection.query(`SELECT * FROM clientes WHERE id_cliente = ?`, [id]);
        if (result.length > 0) {
            res.json({ success: true, cliente: result[0] });
        } else {
            res.json({ success: false, error: 'cliente not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching cliente by ID');
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

// Ruta para agregar un nueva cliente
router.post('/add', async (req, res) => {
    const { documento_id, nombre, apellido, fecha_nacimiento, direccion, telefono, email, nacionalidad, ciudad } = req.body;
    const estado = 'A';
    let connection = null;
    try {
        connection = await getConnection(req);
        await connection.query(`INSERT INTO clientes (DOCUMENTO_ID, NOMBRE, APELLIDO, FECHA_NACIMIENTO, CIUDAD, DIRECCION, TELEFONO, EMAIL, NACIONALIDAD, ESTADO) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [documento_id, nombre, apellido, fecha_nacimiento, ciudad, direccion, telefono, email, nacionalidad, estado]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding cliente');
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


// Ruta para actualizar un cliente existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { documento_id, nombre, apellido, fecha_nacimiento, direccion, telefono, email, nacionalidad, ciudad, estado, motivo_bloqueo } = req.body;
    let connection = null;
    try {
        connection = await getConnection(req);
        await connection.query(`UPDATE clientes SET DOCUMENTO_ID = ?, NOMBRE = ?, APELLIDO = ?, FECHA_NACIMIENTO = ?, DIRECCION = ?, TELEFONO = ?, EMAIL = ?, NACIONALIDAD = ?, CIUDAD = ?, ESTADO = ?, MOTIVO_BLOQUEO = ? WHERE id_cliente = ?`, [documento_id, nombre, apellido, fecha_nacimiento, direccion, telefono, email, nacionalidad, ciudad, estado, motivo_bloqueo, id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'updating cliente');
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

// Ruta para eliminar un cliente
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection(req);
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