const express = require('express');
const path = require('path');

// Imports para Autentificacion
const session = require('express-session');
require('dotenv').config();

const connectRouter = require('./routes/connect'); // Ruta del microservicio
const clientesRouter = require('./routes/clientes'); // Ruta para clientes
const canchasRouter = require('./routes/canchas'); // Ruta de las canchas
const mantenimientosRouter = require('./routes/mantenimientos'); // Ruta para mantenimientos
const tiposuelosRouter = require('./routes/tiposuelos'); // Ruta para tipos de suelos
const reservaRouter = require('./routes/reservas'); // Ruta para reservas
const deportesRouter = require('./routes/deportes'); // Ruta para deportes
const canchaDeporteRouter = require('./routes/canchadeporte'); // Ruta para canchaDeportes
const pagosRouter = require('./routes/pagos'); // Ruta para pagos
const promocionesRouter = require('./routes/promociones'); // Ruta para promociones

const app = express();
const PORT = 3000;

// Middleware para analizar datos en formato JSON
app.use(express.json());

// Sirve archivos estáticos desde la carpeta public
app.use(express.static(path.join(__dirname, '../frontend/public')));

// Configuración de sesiones
app.use(session({
    secret: process.env.SEGURO_SESSION,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));

// Middleware para verificar si el usuario está autenticado
function isAuthenticated(req, res, next) {
    if (req.session.isAuthenticated) {
        return next();
    }
    res.redirect('/login');
}

app.post('/authenticate', (req, res) => {
    const { username, password } = req.body;
    const webUsers = JSON.parse(process.env.WEB_USERS);

    // Suche nach einer passenden Rolle
    const role = Object.keys(webUsers).find(role => username === role && password === webUsers[role]);

    if (!role) {
        return res.status(401).send({ message: 'Usuario o contraseña incorrectos' });
    }

    req.session.isAuthenticated = true;
    req.session.userRole = role;
    res.status(200).send({ message: 'Inicio de sesión exitoso', role });
});


app.get('/salir', (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.status(500).send("Error al cerrar sesión");
        };
        res.redirect('/login');
    });
});

app.get('/', (req, res) => {
    res.redirect("/home");
});

// Ruta principal para mostrar la página de conexión (login)
app.get('/login', (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/login.html'));
});

app.get('/home', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/home.html'));
});

app.get('/list_clientes', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_clientes.html'));
});

app.get('/add_cliente', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_cliente.html'));
});

app.get('/upd_cliente', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_cliente.html'));
});

app.get('/list_canchas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_canchas.html'));
});

app.get('/add_cancha', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_cancha.html'));
});

app.get('/upd_cancha', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_cancha.html'));
});

app.get('/list_mantenimientos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_mantenimientos.html'));
});

app.get('/add_mantenimiento', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_mantenimiento.html'));
});

app.get('/upd_mantenimiento', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_mantenimiento.html'));
});

app.get('/list_tipo_suelo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_tipo_suelo.html'));
});

app.get('/add_tipo_suelo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_tipo_suelo.html'));
});

app.get('/upd_tipo_suelo', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_tipo_suelo.html'));
});

app.get('/list_reservas', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_reservas.html'));
});

app.get('/add_reserva', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_reserva.html'));
});

app.get('/upd_reserva', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_reserva.html'));
});

app.get('/list_deportes', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_deportes.html'));
});

app.get('/add_deporte', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_deporte.html'));
});

app.get('/upd_deporte', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_deporte.html'));
});

app.get('/list_pagos', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_pagos.html'));
});

app.get('/add_pago', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/add_pago.html'));
});

app.get('/upd_pago', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/upd_pago.html'));
});

app.get('/list_cancha_disponibilidad', isAuthenticated, (req, res) => {
    res.sendFile(path.join(__dirname, '../frontend/views/list_cancha_disponibilidad.html'));
});

// Usar el microservicio de conexión
app.use('/connect', connectRouter);

app.use('/clientes', isAuthenticated, clientesRouter);  //Ruta para clientes
app.use('/api/canchas', isAuthenticated, canchasRouter);
app.use('/mantenimientos', isAuthenticated, mantenimientosRouter); //Ruta para mantenimientos
app.use('/tiposuelos', isAuthenticated, tiposuelosRouter); //Ruta para tipos de suelos
app.use('/reservas', isAuthenticated, reservaRouter); //Ruta para reservas
app.use('/deportes', isAuthenticated, deportesRouter); //Ruta para deportes
app.use('/canchadeporte', isAuthenticated, canchaDeporteRouter); //Ruta para canchaDeportes
app.use('/pagos', isAuthenticated, pagosRouter); //Ruta para pagos
app.use('/promociones', isAuthenticated, promocionesRouter); //Ruta para promociones


// Ruta para 404
app.use(isAuthenticated, (req, res) => {
    res.status(404).sendFile(path.join(__dirname, '../frontend/views/404.html'));
});
// Inicia el servidor
app.listen(PORT, () => {
    console.log(`Servidor iniciado en http://localhost:${PORT}`);
});
