function showLoadingAlert() {
    Swal.fire({
        title: 'Cargando...',
        text: 'Estamos obteniendo los datos de la reserva.',
        allowOutsideClick: false,
        didOpen: () => {
            Swal.showLoading();
        }
    });
}

function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    // Elementos del formulario y otros controles
    const form = document.getElementById('addReservaForm');
    const urlParams = new URLSearchParams(window.location.search);
    const reservaId = urlParams.get('id');
    const canchaSelect = document.getElementById('cancha');

    // Elementos para la búsqueda de clientes (nuevos)
    const clienteSearchInput = document.getElementById('cliente-search');
    const clienteResults = document.getElementById('cliente-results');
    const clienteIdInput = document.getElementById('cliente-id');

    // Listas globales
    let clientes = []; // Lista global de clientes

    const loadClientes = () => {
        return new Promise((resolve, reject) => {
            // Se muestra alerta de carga
            showLoadingAlert();
            fetch('/clientes')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    Swal.close();
                    if (data.success && Array.isArray(data.clientes)) {
                        // Filtrar solo clientes activos o en proceso
                        clientes = data.clientes.filter(cliente => cliente.ESTADO === 'A' || cliente.ESTADO === 'P');
                    } else {
                        throw new Error('No hay clientes disponibles');
                    }
                    resolve();
                })
                .catch(error => {
                    Swal.close();
                    showErrorAlert('Error cargando clientes');
                    reject(error);
                });
        });
    };

    const loadCanchas = () => {
        return new Promise((resolve, reject) => {
            if (!canchaSelect) return resolve();
            showLoadingAlert();
            fetch('/api/canchas')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    Swal.close();
                    canchaSelect.innerHTML = '';

                    const defaultOption = document.createElement('option');
                    defaultOption.textContent = 'Selecciona una cancha';
                    defaultOption.selected = true;
                    defaultOption.disabled = true;
                    canchaSelect.appendChild(defaultOption);

                    data.canchas.forEach(cancha => {
                        const option = document.createElement('option');
                        option.value = cancha.ID_CANCHA;
                        const statusText = cancha.ESTADO === 'D' ? '*Disponible*' : '*No Disponible*';
                        option.textContent = `Cancha ${cancha.NUMERO} - ${cancha.UBICACION} ${statusText}`;
                        canchaSelect.appendChild(option);
                    });
                    resolve();
                })
                .catch(error => {
                    Swal.close();
                    showErrorAlert('Error cargando canchas');
                    reject(error);
                });
        });
    };

    const loadDeportes = async (canchaId) => {
        const deporteSelect = document.getElementById('deporte');
        if (!deporteSelect) return;
        showLoadingAlert();
        try {
            const response = await fetch(`/canchadeporte/cancha/${canchaId}`);
            const data = await response.json();
            Swal.close();

            deporteSelect.innerHTML = '<option value="" disabled selected>Seleccione un deporte</option>';

            if (data.success && Array.isArray(data.canchaDeportes)) {
                data.canchaDeportes.forEach(cd => {
                    const option = document.createElement('option');
                    option.value = cd.ID_DEPORTE;
                    option.textContent = `${cd.DEPORTE} - $${cd.PRECIO_HORA}/hora`;
                    deporteSelect.appendChild(option);
                });
            }
        } catch (error) {
            Swal.close();
            showErrorAlert('Error cargando deportes');
            console.error(error);
        }
    };

    // Buscar clientes mientras se escribe en el campo de búsqueda
    clienteSearchInput.addEventListener('input', function () {
        const query = clienteSearchInput.value.toLowerCase().trim(); // Convertir a minúsculas
        clienteResults.innerHTML = ''; // Limpiar resultados previos
        if (query) {
            // Filtrar la lista de clientes según nombre y apellido
            const filteredClientes = clientes.filter(cliente =>
                `${cliente.NOMBRE} ${cliente.APELLIDO}`.toLowerCase().includes(query)
            );
            // Mostrar cada cliente filtrado como botón
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

    // Función para seleccionar un cliente de la lista de resultados
    function selectCliente(cliente) {
        clienteSearchInput.value = `${cliente.NOMBRE} ${cliente.APELLIDO}`; // Mostrar el nombre en el campo de búsqueda
        clienteResults.innerHTML = ''; // Limpiar la lista de resultados
        clienteIdInput.value = cliente.ID_CLIENTE; // Guardar el ID del cliente en el campo oculto
    }

    showLoadingAlert();
    Promise.all([loadClientes(), loadCanchas()])
        .then(() => {
            Swal.close();

            if (reservaId) {
                showLoadingAlert();
                fetch(`/reservas/reserva/${reservaId}`)
                    .then(response => response.json())
                    .then(data => {
                        Swal.close();
                        if (data.success && data.reserva) {
                            // Establecer el cliente seleccionado
                            const idCliente = data.reserva.ID_CLIENTE;
                            clienteIdInput.value = idCliente;
                            // Buscar el cliente en la lista para mostrar su nombre en el campo de búsqueda
                            const clienteEncontrado = clientes.find(c => c.ID_CLIENTE == idCliente);
                            if (clienteEncontrado) {
                                clienteSearchInput.value = `${clienteEncontrado.NOMBRE} ${clienteEncontrado.APELLIDO}`;
                            }
                            // Establecer otros campos de la reserva
                            canchaSelect.value = data.reserva.ID_CANCHA;
                            document.getElementById('fechaInicio').value = data.reserva.FECHA_INICIO;
                            document.getElementById('fechaFin').value = data.reserva.FECHA_FIN;
                            document.getElementById('horaInicio').value = data.reserva.HORA_INICIO;
                            document.getElementById('horaFin').value = data.reserva.HORA_FIN;
                            document.getElementById('estadoReserva').value = data.reserva.ESTADO_RESERVA;
                            document.getElementById('fechaLimiteCancelacion').value = data.reserva.FECHA_LIMITE_CANCELACION;
                            document.getElementById('estadoCancelacion').value = data.reserva.ESTADO_CANCELACION;
                            document.getElementById('porcentajePromocion').value = data.reserva.PORCENTAJE_PROMOCION;
                            document.getElementById('reembolsable').value = data.reserva.REEMBOLSABLE;

                            // Cargar deportes después de establecer la cancha
                            loadDeportes(data.reserva.ID_CANCHA).then(() => {
                                document.getElementById('deporte').value = data.reserva.ID_DEPORTE;
                            });
                        }
                    })
                    .catch(error => {
                        showErrorAlert('Error al cargar los datos de la reserva');
                        console.error(error);
                    });
            }
        })
        .catch(error => {
            Swal.close();
            showErrorAlert('Error inicializando el formulario');
            console.error(error);
        });

    // Actualizar deportes al cambiar la cancha
    canchaSelect?.addEventListener('change', function () {
        loadDeportes(this.value);
    });

    // Envío del formulario de actualización
    form?.addEventListener('submit', function (event) {
        event.preventDefault();
        showLoadingAlert();

        const formData = {
            id_cliente: clienteIdInput.value, // Se utiliza el campo oculto con el ID del cliente
            id_cancha: canchaSelect.value,
            fecha_inicio: document.getElementById('fechaInicio').value,
            fecha_fin: document.getElementById('fechaFin').value,
            hora_inicio: document.getElementById('horaInicio').value,
            hora_fin: document.getElementById('horaFin').value,
            estado_reserva: document.getElementById('estadoReserva').value,
            fecha_limite_cancelacion: document.getElementById('fechaLimiteCancelacion').value,
            estado_cancelacion: document.getElementById('estadoCancelacion').value,
            porcentaje_promocion: document.getElementById('porcentajePromocion').value,
            reembolsable: document.getElementById('reembolsable').value,
            deporte: document.getElementById('deporte').value
        };

        fetch(`/reservas/update/${reservaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(formData)
        })
            .then(response => response.json())
            .then(data => {
                Swal.close();
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        text: 'La reserva ha sido actualizada correctamente.'
                    }).then(() => window.location.href = '/list_reservas');
                } else {
                    showErrorAlert(data.error || 'Error al actualizar la reserva');
                }
            })
            .catch(error => {
                Swal.close();
                showErrorAlert('Error de conexión con el servidor');
                console.error(error);
            });
    });
});