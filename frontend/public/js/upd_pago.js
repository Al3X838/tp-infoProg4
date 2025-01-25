// Función para mostrar alertas de error con SweetAlert
function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
    });
}

// Función para mostrar una alerta de carga con SweetAlert
function showLoadingAlert() {
    Swal.fire({
        title: 'Cargando...',
        text: 'Estamos obteniendo los datos de clientes, reservas y pagos.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const apiUrlClientes = '/clientes'; // Endpoint para clientes
    const apiUrlReservas = '/reservas'; // Endpoint para reservas
    const apiUrlPago = '/pagos/pago/'; // Endpoint para un pago específico
    const form = document.getElementById('update-pago-form');

    const clienteSearchInput = document.getElementById('cliente-search');
    const clienteResults = document.getElementById('cliente-results');
    const reservaSelect = document.getElementById('reserva-select');
    const fechaPagoInput = document.getElementById('fecha-pago');
    const idPagoInput = document.getElementById('id-pago');
    const montoTotalInput = document.getElementById('monto-total');
    const metodoPagoSelect = document.getElementById('metodo-pago');

    let clientes = []; // Lista global de clientes
    let reservas = []; // Lista global de reservas

    // Obtener el ID del Pago desde la URL
    const urlParams = new URLSearchParams(window.location.search);
    const idPago = urlParams.get('id');

    if (idPago) {
        fetchData(idPago); // Cargar datos iniciales
    } else {
        showErrorAlert('No se proporcionó un ID de Pago válido.');
    }

    // Función para buscar clientes mientras se escribe
    clienteSearchInput.addEventListener('input', function () {
        const query = clienteSearchInput.value.toLowerCase().trim();
        clienteResults.innerHTML = '';

        if (query) {
            const filteredClientes = clientes.filter(cliente =>
                `${cliente.NOMBRE} ${cliente.APELLIDO}`.toLowerCase().includes(query)
            );

            filteredClientes.forEach(cliente => {
                const clienteItem = document.createElement('button');
                clienteItem.textContent = `${cliente.NOMBRE} ${cliente.APELLIDO}`;
                clienteItem.classList.add('list-group-item', 'list-group-item-action');
                clienteItem.addEventListener('click', () => {
                    selectCliente(cliente);
                });
                clienteResults.appendChild(clienteItem);
            });
        }
    });

    // Función para seleccionar un cliente
    function selectCliente(cliente) {
        clienteSearchInput.value = `${cliente.NOMBRE} ${cliente.APELLIDO}`;
        clienteResults.innerHTML = '';
        loadReservas(cliente.ID_CLIENTE);
    }

    // Función para cargar reservas de un cliente específico
    function loadReservas(clienteId = null) {
        reservaSelect.innerHTML = '<option value="">Seleccione una reserva...</option>';

        const filteredReservas = clienteId
            ? reservas.filter(reserva => reserva.ID_CLIENTE === clienteId)
            : reservas;

        filteredReservas.forEach(reserva => {
            const reservaOption = document.createElement('option');
            reservaOption.value = reserva.ID_RESERVA;
            reservaOption.textContent = `Reserva #${reserva.ID_RESERVA} - ${reserva.ESTADO_RESERVA}`;
            reservaSelect.appendChild(reservaOption);
        });
    }

    // Al seleccionar una reserva, seleccionar automáticamente el cliente asociado
    reservaSelect.addEventListener('change', function () {
        const selectedReserva = reservas.find(reserva => reserva.ID_RESERVA === parseInt(reservaSelect.value));
        if (selectedReserva) {
            const cliente = clientes.find(cliente => cliente.ID_CLIENTE === selectedReserva.ID_CLIENTE);
            if (cliente) {
                clienteSearchInput.value = `${cliente.NOMBRE} ${cliente.APELLIDO}`;
            }
        }
    });

    // Función para cargar los datos iniciales de clientes, reservas y un pago
    function fetchData(idPago) {
        showLoadingAlert();

        Promise.all([
            fetch(apiUrlClientes).then(response => response.json()),
            fetch(apiUrlReservas).then(response => response.json()),
            fetch(`${apiUrlPago}${idPago}`).then(response => response.json())
        ])
            .then(([clientesData, reservasData, pagoData]) => {
                Swal.close();

                if (!clientesData.success || !reservasData.success || !pagoData.success) {
                    showErrorAlert('Error al cargar los datos.');
                    return;
                }

                clientes = clientesData.clientes || [];
                reservas = reservasData.reservas || [];

                const pago = pagoData.pago;
                if (!pago) {
                    showErrorAlert('No se encontró el pago.');
                    return;
                }

                // Rellenar el formulario con los datos del pago
                idPagoInput.value = pago.ID_PAGO;
                montoTotalInput.value = pago.MONTO_TOTAL;
                metodoPagoSelect.value = pago.METODO_PAGO;

                // Corregir formato de FECHA_PAGO para datetime-local
                fechaPagoInput.value = pago.FECHA_PAGO.split('.')[0].slice(0, 16).replace(' ', 'T');

                // Cargar reservas del cliente asociado al pago
                loadReservas();
                reservaSelect.value = pago.ID_RESERVA;
            })
            .catch(error => {
                Swal.close();
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    }

    // Función para enviar los datos actualizados del pago
    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const newIdReserva = reservaSelect.value;
        const newMontoTotal = montoTotalInput.value;
        const newMetodoPago = metodoPagoSelect.value;
        const newFechaPago = fechaPagoInput.value.replace('T', ' '); // Convertir a formato compatible con el backend

        showLoadingAlert();

        fetch(`/pagos/update/${idPago}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_reserva: newIdReserva, monto_total: newMontoTotal, metodo_pago: newMetodoPago, fecha_pago: newFechaPago })
        })
            .then(response => response.json())
            .then(data => {
                Swal.close();

                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El pago se ha actualizado correctamente.',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_pagos';
                    });
                } else {
                    showErrorAlert(data.error || 'Error al actualizar el pago.');
                }
            })
            .catch(error => {
                Swal.close();
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });


});
