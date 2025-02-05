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
    const cancelButton = document.getElementById('cancel-button');
    const canchaSelect = document.getElementById('cancha');
    const horaInicio = document.getElementById('horaInicio');
    const horaFin = document.getElementById('horaFin');
    const btnSumarHora = document.getElementById('btnSumarHora');
    const fechaInicio = document.getElementById('fechaInicio');
    const fechaFin = document.getElementById('fechaFin');

    // Elementos para la búsqueda de clientes
    const clienteSearchInput = document.getElementById('cliente-search');
    const clienteResults = document.getElementById('cliente-results');
    const clienteIdInput = document.getElementById('cliente-id');

    // Parámetro de la URL para preseleccionar una cancha (si se requiere)
    const urlParams = new URLSearchParams(window.location.search);
    const selectedCanchaId = urlParams.get('cancha');

    // Listas globales
    let clientes = []; // Lista global de clientes

    // Función para obtener la fecha actual en formato YYYY-MM-DD
    function obtenerFechaActual() {
        const fecha = new Date(); // Obtener la fecha actual
        const año = fecha.getFullYear(); // Año actual
        const mes = String(fecha.getMonth() + 1).padStart(2, '0'); // Mes con ceros a la izquierda
        const dia = String(fecha.getDate()).padStart(2, '0'); // Día con ceros a la izquierda
        return `${año}-${mes}-${dia}`; // Devolver la fecha formateada
    }

    // Asignar la fecha actual a los campos de fecha
    const fechaActual = obtenerFechaActual();
    fechaInicio.value = fechaActual;
    fechaFin.value = fechaActual;

    // Copiar la fecha de inicio a la fecha de fin cuando se pierde el foco
    fechaInicio.addEventListener('blur', function () {
        if (fechaInicio.value) {
            fechaFin.value = fechaInicio.value;
        }
    });


    function sumarUnaHora(hora) {
        if (!hora) return null; // Si no hay hora, retornar null
        const fecha = new Date(`1970-01-01T${hora}:00`); // Convertir la hora a objeto Date
        fecha.setTime(fecha.getTime() + 3600 * 1000); // Sumar 3600 segundos (1 hora)
        return fecha.toTimeString().slice(0, 5); // Devolver la hora en formato HH:MM
    }

    // Evento para el botón de sumar una hora
    btnSumarHora.addEventListener('click', function () {
        if (!horaFin.value) {
            if (horaInicio.value) {
                horaFin.value = sumarUnaHora(horaInicio.value);
            }
        } else {
            horaFin.value = sumarUnaHora(horaFin.value);
        }
    });

    // Cargar clientes desde el servidor
    function loadClientes() {
        fetch('/clientes')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta de la red');
                return response.json();
            })
            .then(data => {
                if (data.success && Array.isArray(data.clientes)) {
                    // Filtrar solo clientes activos o en proceso
                    clientes = data.clientes.filter(cliente => cliente.ESTADO === 'A' || cliente.ESTADO === 'P');
                } else {
                    throw new Error('No hay clientes disponibles');
                }
            })
            .catch(error => console.error('Error cargando clientes:', error));
    }

    // Cargar canchas desde el servidor
    function loadCanchas() {
        if (!canchaSelect) return;
        fetch('/api/canchas')
            .then(response => {
                if (!response.ok) throw new Error('Error en la respuesta de la red');
                return response.json();
            })
            .then(data => {
                if (data.success && Array.isArray(data.canchas)) {
                    canchaSelect.innerHTML = '<option value="" disabled selected>Selecciona una cancha</option>';
                    data.canchas.forEach(cancha => {
                        // Mostrar la disponibilidad de la cancha según su estado
                        if (cancha.ESTADO === 'D') {
                            canchaSelect.innerHTML += `<option value="${cancha.ID_CANCHA}">Cancha ${cancha.NUMERO} - ${cancha.UBICACION} *Disponible*</option>`;
                        } else {
                            canchaSelect.innerHTML += `<option value="${cancha.ID_CANCHA}">Cancha ${cancha.NUMERO} - ${cancha.UBICACION} *No Disponible en este momento*</option>`;
                        }
                    });
                    // Preseleccionar la cancha si se pasó por URL
                    if (selectedCanchaId) {
                        canchaSelect.value = selectedCanchaId;
                    }
                } else {
                    throw new Error('No hay canchas disponibles');
                }
            })
            .catch(error => console.error('Error cargando canchas:', error));
    }

    // Cargar deportes según la cancha seleccionada
    async function loadDeportes(canchaId) {
        const deporteSelect = document.getElementById('deporte');
        if (!deporteSelect) return;
        deporteSelect.innerHTML = '<option value="" disabled selected>Seleccione un deporte</option>';
        if (!canchaId) return;
        try {
            const response = await fetch(`/canchadeporte/cancha/${canchaId}`);
            const data = await response.json();
            if (data.success && Array.isArray(data.canchaDeportes)) {
                data.canchaDeportes.forEach(cd => {
                    deporteSelect.innerHTML += `<option value="${cd.ID_DEPORTE}">${cd.DEPORTE} - $${cd.PRECIO_HORA}/hora</option>`;
                });
            }
        } catch (error) {
            console.error('Error cargando deportes:', error);
        }
    }

    // Buscar clientes mientras se escribe
    clienteSearchInput.addEventListener('input', function () {
        const query = clienteSearchInput.value.toLowerCase().trim(); // Convertir la búsqueda a minúsculas
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
        // Llamada opcional para cargar reservas del cliente
        loadReservas(cliente.ID_CLIENTE);
    }

    // Función de ejemplo para cargar reservas del cliente seleccionado
    function loadReservas(clienteId) {
        // Implementa aquí la lógica para cargar reservas según el ID del cliente
        console.log('Cargando reservas para el cliente con ID:', clienteId);
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Crear objeto con los datos de la reserva
        const reservaData = {
            // Se utiliza el campo oculto que contiene el ID del cliente seleccionado
            cliente: clienteIdInput.value.trim(),
            cancha: canchaSelect.value.trim(),
            deporte: document.getElementById('deporte').value,
            fechaInicio: fechaInicio.value,
            fechaFin: fechaFin.value,
            horaInicio: horaInicio.value,
            horaFin: horaFin.value,
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
                if (!response.ok) throw new Error(data.error || 'Error al agregar la reserva');
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

    // Actualizar deportes al cambiar la cancha
    if (canchaSelect) {
        canchaSelect.addEventListener('change', function () {
            loadDeportes(this.value);
        });
    }
    if (selectedCanchaId) {
        loadDeportes(selectedCanchaId);
    }
    if (cancelButton) {
        cancelButton.addEventListener('click', function () {
            window.location.href = '/list_reservas'; // Regresar a la lista de reservas
        });
    }
});
