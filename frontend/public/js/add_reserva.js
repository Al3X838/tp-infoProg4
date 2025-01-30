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
    const horaInicio = document.getElementById('horaInicio');
    const horaFin = document.getElementById('horaFin');
    const btnSumarHora = document.getElementById('btnSumarHora');

    const urlParams = new URLSearchParams(window.location.search);
    const selectedCanchaId = urlParams.get('cancha');

    // Seleccionar los campos de fecha de inicio y fecha de fin
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');

    // Agregar un evento "blur" al campo fechaInicio
    fechaInicio.addEventListener('blur', function () {
        // Verificar si se ha ingresado una fecha en fechaInicio
        if (fechaInicio.value) {
            // Copiar la misma fecha al campo fechaFin
            fechaFin.value = fechaInicio.value;
        }
    });

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function obtenerFechaActual() {
        const fecha = new Date(); // Obtener la fecha actual
        const año = fecha.getFullYear(); // Obtener el año actual
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Obtener el mes (con ceros a la izquierda)
        const dia = String(fecha.getDate()).padStart(2, '0'); // Obtener el día (con ceros a la izquierda)
        return `${año}-${mes}-${dia}`; // Formatear como YYYY-MM-DD
    }

    // Establecer la fecha actual en los campos fechaInicio y fechaFin al cargar la página
    const fechaActual = obtenerFechaActual();
    fechaInicio.value = fechaActual;
    fechaFin.value = fechaActual;

    // Evento para copiar fechaInicio a fechaFin cuando se pierde el foco
    fechaInicio.addEventListener('blur', function () {
        if (fechaInicio.value) {
            fechaFin.value = fechaInicio.value;
        }
    });

    // Función para sumar una hora a una hora dada
    function sumarUnaHora(hora) {
        if (!hora) return null; // Si no hay hora, retornar null

        // Convertir la hora en un objeto Date
        const fecha = new Date(`1970-01-01T${hora}:00`);
        // Sumar una hora (3600 segundos * 1000 milisegundos)
        fecha.setTime(fecha.getTime() + 3600 * 1000);

        // Formatear la nueva hora en formato HH:MM
        const nuevaHora = fecha.toTimeString().slice(0, 5);
        return nuevaHora;
    }

    // Evento para el botón de sumar una hora
    btnSumarHora.addEventListener('click', function () {
        if (!horaFin.value) {
            // Si horaFin está vacío, tomar la hora de horaInicio y sumar una hora
            if (horaInicio.value) {
                horaFin.value = sumarUnaHora(horaInicio.value);
            }
        } else {
            // Si horaFin ya tiene un valor, sumar una hora a ese valor
            horaFin.value = sumarUnaHora(horaFin.value);
        }
    });

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
                        if (cliente.ESTADO === 'A' || cliente.ESTADO === 'P') {
                            const option = document.createElement('option');
                            option.value = cliente.ID_CLIENTE;
                            option.textContent = `${cliente.NOMBRE} ${cliente.APELLIDO} (${cliente.DOCUMENTO_ID})`;
                            clienteSelect.appendChild(option);
                        }
                    });
                } else {
                    throw new Error('No hay clientes disponibles');
                }
            })
            .catch(error => console.error('Error loading clients:', error));
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
                        } else {
                            const option = document.createElement('option');
                            option.value = cancha.ID_CANCHA;
                            option.textContent = `Cancha ${cancha.NUMERO} - ${cancha.UBICACION} *No Disponible en este momento*`;
                            canchaSelect.appendChild(option);
                        }
                    });

                    if (selectedCanchaId) {
                        canchaSelect.value = selectedCanchaId;
                    }
                } else {
                    throw new Error('No hay canchas disponibles');
                }
            })
            .catch(error => console.error('Error loading canchas:', error));
    };

    const loadDeportes = async (canchaId) => {
        const deporteSelect = document.getElementById('deporte');
        if (!deporteSelect) return;

        // Limpiar opciones
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

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const reservaData = {
            cliente: document.getElementById('cliente').value.trim(),
            cancha: document.getElementById('cancha').value.trim(),
            deporte: document.getElementById('deporte').value,
            fechaInicio: document.getElementById('fechaInicio').value,
            fechaFin: document.getElementById('fechaFin').value,
            horaInicio: document.getElementById('horaInicio').value,
            horaFin: document.getElementById('horaFin').value,
            estadoReserva: 'P',
            fechaLimiteCancelacion: document.getElementById('fechaLimiteCancelacion').value,
            estadoCancelacion: document.getElementById('estadoCancelacion').value,
            porcentajePromocion: parseFloat(document.getElementById('porcentajePromocion').value) || 0,
            reembolsable: document.getElementById('reembolsable').checked ? 'S' : 'N'
        };
        console.log('Reserva data:', reservaData);
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
                        window.location.href = '/list_reservas';
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

    // Modificar el evento change del select de canchas
    if (canchaSelect) {
        canchaSelect.addEventListener('change', function () {
            const selectedCanchaId = this.value;
            loadDeportes(selectedCanchaId);
        });
    }

    // Si hay una cancha preseleccionada, cargar sus deportes
    if (selectedCanchaId) {
        loadDeportes(selectedCanchaId);
    }

    // Manejar el botón de cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', function () {
            window.location.href = '/list_reservas'; // Regresa a la lista de reservas
        });
    }
});