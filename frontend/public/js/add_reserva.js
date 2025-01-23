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
    const cancelButton = document.getElementById('cancel-button');
    const clienteSelect = document.getElementById('cliente');
    const canchaSelect = document.getElementById('cancha');

    const loadClientes = () => {
        if (!clienteSelect) return;

        fetch('/clientes')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);
                clienteSelect.innerHTML = '<option value="">Seleccione el cliente</option>';

                if (data.success && Array.isArray(data.clientes)) {
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
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los clientes',
                    confirmButtonText: 'Aceptar'
                });
            });
    };

    const loadCanchas = () => {
        if (!canchaSelect) return;

        fetch('/api/canchas')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);
                canchaSelect.innerHTML = '<option value="">Seleccione la cancha</option>';

                if (data.success && Array.isArray(data.canchas)) {
                    data.canchas.forEach(cancha => {
                        const option = document.createElement('option');
                        option.value = cancha.ID_CANCHA;
                        option.textContent = `Cancha ${cancha.NUMERO} - ${cancha.UBICACION}`;
                        canchaSelect.appendChild(option);
                    });
                } else {
                    throw new Error('No hay canchas disponibles');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar las canchas',
                    confirmButtonText: 'Aceptar'
                });
            });
    };

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const reservaData = {
            cliente: document.getElementById('cliente').value.trim(),
            cancha: document.getElementById('cancha').value.trim(),
            fechaInicio: document.getElementById('fechaInicio').value,
            fechaFin: document.getElementById('fechaFin').value,
            horaInicio: document.getElementById('horaInicio').value,
            horaFin: document.getElementById('horaFin').value,
            estadoReserva: document.getElementById('estadoReserva').value,
            fechaLimiteCancelacion: document.getElementById('fechaLimiteCancelacion').value,
            estadoCancelacion: document.getElementById('estadoCancelacion').value,
            porcentajePromocion: document.getElementById('porcentajePromocion').value
        };

        fetch('/reservas/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reservaData)
        })
        .then(async response => {
            const data = await response.json();
            if (!response.ok) {
                throw new Error(data.error || 'Error al agregar la reserva');
            }
            return data;
        })
        .then(data => {
            if (data.success) {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'La reserva se ha agregado correctamente',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.href = '/list_reservas.html';
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: error.message || 'No se pudo agregar la reserva',
                confirmButtonText: 'Aceptar'
            });
        });
    });

    loadClientes();
    loadCanchas();

    // Manejar el botón de cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', function () {
            window.location.href = '/list_reservas'; // Regresa a la lista de reservas
        });
    }
});