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
    const form = document.getElementById('addReservaForm');
    const urlParams = new URLSearchParams(window.location.search);
    const reservaId = urlParams.get('id');
    const clienteSelect = document.getElementById('cliente');
    const canchaSelect = document.getElementById('cancha');

    // Modified load functions to return Promises
    const loadClientes = () => {
        return new Promise((resolve, reject) => {
            if (!clienteSelect) return resolve();

            showLoadingAlert();
            fetch('/clientes')
                .then(response => {
                    if (!response.ok) throw new Error('Network response was not ok');
                    return response.json();
                })
                .then(data => {
                    Swal.close();
                    clienteSelect.innerHTML = '';

                    const defaultOption = document.createElement('option');
                    defaultOption.textContent = 'Selecciona un cliente';
                    defaultOption.selected = true;
                    defaultOption.disabled = true;
                    clienteSelect.appendChild(defaultOption);

                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.ID_CLIENTE;
                        option.textContent = `${cliente.NOMBRE} ${cliente.APELLIDO} (${cliente.DOCUMENTO_ID})`;
                        clienteSelect.appendChild(option);
                    });
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

    // Initial loading sequence
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
                            // Set basic fields
                            document.getElementById('cliente').value = data.reserva.ID_CLIENTE;
                            document.getElementById('cancha').value = data.reserva.ID_CANCHA;
                            document.getElementById('fechaInicio').value = data.reserva.FECHA_INICIO;
                            document.getElementById('fechaFin').value = data.reserva.FECHA_FIN;
                            document.getElementById('horaInicio').value = data.reserva.HORA_INICIO;
                            document.getElementById('horaFin').value = data.reserva.HORA_FIN;
                            document.getElementById('estadoReserva').value = data.reserva.ESTADO_RESERVA;
                            document.getElementById('fechaLimiteCancelacion').value = data.reserva.FECHA_LIMITE_CANCELACION;
                            document.getElementById('estadoCancelacion').value = data.reserva.ESTADO_CANCELACION;
                            document.getElementById('porcentajePromocion').value = data.reserva.PORCENTAJE_PROMOCION;
                            document.getElementById('reembolsable').value = data.reserva.REEMBOLSABLE;

                            // Load deportes after cancha is set
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

    // Event listeners
    canchaSelect?.addEventListener('change', function () {
        loadDeportes(this.value);
    });

    form?.addEventListener('submit', function (event) {
        event.preventDefault();
        showLoadingAlert();

        const formData = {
            id_cliente: document.getElementById('cliente').value,
            id_cancha: document.getElementById('cancha').value,
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