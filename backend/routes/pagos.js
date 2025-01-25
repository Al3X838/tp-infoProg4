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
        const result = await connection.query('SELECT p.*, c.NOMBRE AS CLIENTE_NOMBRE, c.APELLIDO AS CLIENTE_APELLIDO FROM pagos p LEFT JOIN reservas r ON p.ID_RESERVA = r.ID_RESERVA LEFT JOIN clientes c ON r.ID_CLIENTE = c.ID_CLIENTE;');
        await connection.close();
        res.json({ success: true, pagos: result });
    } catch (err) {
        handleDbError(err, res, 'fetching pagos');
    }
});

// Ruta GET para obtener un item específica por su ID
router.get('/pago/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const connection = await getConnection();
        const result = await connection.query(`SELECT * FROM PAGOS WHERE id_pago = ?`, [id]);
        await connection.close();

        if (result.length > 0) {
            res.json({ success: true, pago: result[0] });
        } else {
            res.json({ success: false, error: 'pago not found.' });
        }
    } catch (err) {
        handleDbError(err, res, 'fetching pago by ID');
    }
});

//Falta hacer
// Ruta para agregar un nuevo item
router.post('/add', async (req, res) => {
    const { id_reserva, monto_total, metodo_pago } = req.body;
    const fecha_pago = new Date().toISOString().slice(0, 19).replace('T', ' ');
    try {
        const connection = await getConnection();
        await connection.query(`INSERT INTO PAGOS (ID_RESERVA, MONTO_TOTAL, METODO_PAGO, FECHA_PAGO) VALUES (?,?,?,?)`, [id_reserva, monto_total, metodo_pago, fecha_pago]);
        await connection.close();
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'adding pago');
    }
});


// Ruta para actualizar un item existente
router.post('/update/:id', async (req, res) => {
    const { id } = req.params;
    const { nombre } = req.body;
    try {
        const connection = await getConnection();
        await connection.query(`UPDATE PAGOS SET NOMBRE = ? WHERE id_pago = ?`, [nombre, id]);
        await connection.close();
        res.json({ success: true })
    } catch (err) {
        handleDbError(err, res, 'updating pago');
    }
});

// Ruta para eliminar un item
router.delete('/delete/:id', async (req, res) => {
    const { id } = req.params;
    let connection = null;
    try {
        connection = await getConnection();
        await connection.query(`DELETE FROM PAGOS WHERE id_pago = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        handleDbError(err, res, 'deleting pago');
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