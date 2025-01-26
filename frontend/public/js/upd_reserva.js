document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addReservaForm');
    const urlParams = new URLSearchParams(window.location.search);
    const reservaId = urlParams.get('id');
    const clienteSelect = document.getElementById('cliente');
    const canchaSelect = document.getElementById('cancha');

    // Método para cargar la lista de clientes
    const loadClientes = () => {
        if (!clienteSelect) return;

        fetch('/clientes')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);

                if (data.success && Array.isArray(data.clientes)) {

                    const defaultOption = document.createElement('option');
                        defaultOption.value = '';
                        defaultOption.textContent = 'Selecciona un cliente';
                        defaultOption.selected = true;
                        defaultOption.disabled = true;
                        clienteSelect.appendChild(defaultOption);

                    data.clientes.forEach(cliente => {
                        const option = document.createElement('option');
                        option.value = cliente.ID_CLIENTE;
                        option.textContent = `${cliente.NOMBRE} ${cliente.APELLIDO}`;
                        clienteSelect.appendChild(option);
                    });
                } else {
                    throw new Error('No hay clientes disponibles');
                }
            })
            .catch(error => console.error('Error loading clients:', error));
    };

    // Método para cargar la lista de canchas
    const loadCanchas = () => {
        if (!canchaSelect) return;

        fetch('/api/canchas')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);

                if (data.success && Array.isArray(data.canchas)) {

                    const defaultOption = document.createElement('option');
                    defaultOption.value = '';
                    defaultOption.textContent = 'Selecciona una cancha';
                    defaultOption.selected = true;
                    defaultOption.disabled = true;
                    canchaSelect.appendChild(defaultOption);

                    data.canchas.forEach(cancha => {
                        if (cancha.ESTADO === 'D') {
                            const option = document.createElement('option');
                            option.value = cancha.ID_CANCHA;
                            option.textContent = `Cancha ${cancha.NUMERO} - ${cancha.UBICACION} *Disponible*`;
                            canchaSelect.appendChild(option);
                        }else{
                            const option = document.createElement('option');
                            option.value = cancha.ID_CANCHA;
                            option.textContent = `Cancha ${cancha.NUMERO} - ${cancha.UBICACION} *No Disponible en este momento*`;
                            canchaSelect.appendChild(option);
                        }
                    });

                    if (canchaSelect) {
                        canchaSelect.value = canchaSelect;
                    }
                } else {
                    throw new Error('No hay canchas disponibles');
                }
            })
            .catch(error => console.error('Error loading canchas:', error));
    };

    // Agregar la función loadDeportes después de loadCanchas
    const loadDeportes = async (canchaId) => {
        const deporteSelect = document.getElementById('deporte');
        if (!deporteSelect) return;

        deporteSelect.innerHTML = '<option value="" disabled selected>Seleccione un deporte</option>';

        if (!canchaId) return;

        try {
            const response = await fetch(`/canchadeporte/cancha/${canchaId}`);
            const data = await response.json();

            if (data.success && Array.isArray(data.canchaDeportes)) {
                data.canchaDeportes.forEach(cd => {
                    const option = document.createElement('option');
                    option.value = cd.ID_DEPORTE;
                    option.textContent = `${cd.DEPORTE} - $${cd.PRECIO_HORA}/hora`;
                    deporteSelect.appendChild(option);
                });
            }
        } catch (error) {
            console.error('Error cargando deportes:', error);
        }
    };

    // Llama a las funciones para cargar la lista de clientes y canchas al inicio
    loadClientes();
    loadCanchas();

    // Modificar el evento change del select de canchas
    if (canchaSelect) {
        canchaSelect.addEventListener('change', function() {
            const selectedCanchaId = this.value;
            loadDeportes(selectedCanchaId);
        });
    }

    // Cargar datos de la reserva actual
    if (reservaId) {
        fetch(`/reservas/reserva/${reservaId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.reserva) {
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
                    // Cargar deportes después de establecer la cancha
                    loadDeportes(data.reserva.ID_CANCHA).then(() => {
                        document.getElementById('deporte').value = data.reserva.ID_DEPORTE;
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'Reserva no encontrada.'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener datos de la reserva.'
                });
                console.error('Error:', error);
            });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const updatedReservaData = {
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
            body: JSON.stringify(updatedReservaData)
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: '¡Actualizado!',
                    text: 'La reserva ha sido actualizada correctamente.'
                }).then(() => {
                    window.location.href = '/list_reservas'; // Redirige tras el éxito
                });
            } else {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Error al actualizar la reserva.'
                });
            }
        })
        .catch(error => {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la conexión con el servidor.'
            });
            console.error('Error al actualizar reserva:', error);
        });
    });
});