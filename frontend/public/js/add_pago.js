function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
    });
}

function showLoadingAlert() {
    Swal.fire({
        title: 'Cargando...',
        text: 'Estamos obteniendo los datos de clientes y reservas.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const apiUrlClientes = '/clientes'; // Endpoint para clientes
    const apiUrlReservas = '/reservas'; // Endpoint para reservas
    const form = document.getElementById('add-pago-form');

    const clienteSearchInput = document.getElementById('cliente-search');
    const clienteResults = document.getElementById('cliente-results');
    const reservaSelect = document.getElementById('reserva-select');
    const montoTotalInput = document.getElementById('monto-total');

    let clientes = []; // Lista global de clientes
    let reservas = []; // Lista global de reservas

    // Buscar clientes mientras se escribe
    clienteSearchInput.addEventListener('input', function () {
        const query = clienteSearchInput.value.toLowerCase().trim();
        clienteResults.innerHTML = '';

        if (query) {
            const filteredClientes = clientes.filter(cliente =>
                `${cliente.NOMBRE} ${cliente.APELLIDO} ${cliente.DOCUMENTO_ID}`.toLowerCase().includes(query)
            );

            filteredClientes.forEach(cliente => {
                const clienteItem = document.createElement('button');
                clienteItem.textContent = `${cliente.NOMBRE} ${cliente.APELLIDO} (${cliente.DOCUMENTO_ID})`;
                clienteItem.classList.add('list-group-item', 'list-group-item-action');
                clienteItem.addEventListener('click', () => {
                    selectCliente(cliente);
                });
                clienteResults.appendChild(clienteItem);
            });
        }
    });

    // Seleccionar un cliente
    function selectCliente(cliente) {
        clienteSearchInput.value = `${cliente.NOMBRE} ${cliente.APELLIDO}`;
        clienteResults.innerHTML = '';
        loadReservas(cliente.ID_CLIENTE);
    }

    // Cargar reservas de un cliente específico
    function loadReservas(clienteId = null) {
        reservaSelect.innerHTML = '<option value="">Seleccione una reserva...</option>';

        const filteredReservas = clienteId
            ? reservas.filter(reserva => reserva.ID_CLIENTE === clienteId)
            : reservas;

        filteredReservas.forEach(reserva => {
            const reservaOption = document.createElement('option');
            reservaOption.value = reserva.ID_RESERVA;
            reservaOption.textContent = `Reserva #${reserva.ID_RESERVA} - ${reserva.NOMBRE_CLIENTE} ${reserva.APELLIDO_CLIENTE}`;
            reservaSelect.appendChild(reservaOption);
        });

        // Limpiar el monto total cuando se cargan nuevas reservas
        montoTotalInput.value = '';
    }

    // Al seleccionar una reserva, seleccionar automáticamente el cliente asociado y cargar el monto
    reservaSelect.addEventListener('change', function () {
        const selectedReserva = reservas.find(reserva => reserva.ID_RESERVA === parseInt(reservaSelect.value));
        if (selectedReserva) {
            const cliente = clientes.find(cliente => cliente.ID_CLIENTE === selectedReserva.ID_CLIENTE);
            if (cliente) {
                clienteSearchInput.value = `${cliente.NOMBRE} ${cliente.APELLIDO}`;
            }
            // Cargar el monto total de la reserva
            montoTotalInput.value = selectedReserva.MONTO_TOTAL || '';
        } else {
            // Limpiar el monto total si no hay reserva seleccionada
            montoTotalInput.value = '';
        }
    });

    // Cargar datos iniciales
    function fetchData() {
        showLoadingAlert();

        Promise.all([
            fetch(apiUrlClientes).then(response => response.json()),
            fetch(apiUrlReservas).then(response => response.json())
        ])
            .then(([clientesData, reservasData]) => {
                Swal.close();

                if (!clientesData.success || !reservasData.success) {
                    showErrorAlert('Error al cargar datos.');
                    return;
                }

                clientes = clientesData.clientes || [];
                reservas = (reservasData.reservas || []).filter(reserva =>
                    ['P', 'A', 'C'].includes(reserva.ESTADO_RESERVA) &&
                    reserva.ESTADO_CANCELACION === 'N'
                );
                loadReservas();
            })
            .catch(error => {
                Swal.close();
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    }

    fetchData();

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Obtiene los campos del formulario
        const newIDReserva = document.getElementById('reserva-select').value;
        const newMontoTotal = document.getElementById('monto-total').value;
        const newMetodoPago = document.getElementById('metodo-pago').value;
        // Realiza la solicitud POST para agregar un item
        fetch('/pagos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_reserva: newIDReserva, monto_total: newMontoTotal, metodo_pago: newMetodoPago })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Muestra alerta de éxito y redirige
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El pago se ha agregado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_pagos';
                    });
                } else {
                    // Muestra alerta de error
                    showErrorAlert(data.error || 'Error al agregar el pago.');
                }
            })
            .catch(error => {
                Swal.close(); // Cierra el spinner de carga
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });
});