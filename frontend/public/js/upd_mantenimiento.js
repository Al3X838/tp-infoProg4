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
        text: 'Estamos obteniendo los datos del cliente.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-mantenimiento-form');
    const mantenimientoIdInput = document.getElementById('id-mantenimiento');

    // Obtiene el ID del mantenimiento de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const mantenimientoId = urlParams.get('id');

    // Obtiene los campos del formulario donde se mostrará la información del mantenimiento
    const canchaInput = document.getElementById('cancha');
    const fechaInicioInput = document.getElementById('fecha_inicio');
    const horaInicioInput = document.getElementById('hora_inicio');
    const fechaFinInput = document.getElementById('fecha_fin');
    const horaFinInput = document.getElementById('hora_fin');
    const descripcionInput = document.getElementById('descripcion');
    const estadoInput = document.getElementById('estado');

    // Obtiene las canchas disponibles y luego verifica el mantenimiento
    fetch('/api/canchas', { method: 'GET' })
        .then(response => {
            showLoadingAlert(); // Muestra el loading screen al inicio
            return response.json();
        })
        .then(data => {
            Swal.close(); // Cierra el loading screen después de obtener la respuesta

            if (data.success === false) {
                showErrorAlert(data.error || 'Error desconocido.');
            } else {
                document.getElementById('cancha').innerHTML = data.canchas.map(cancha => `
                <option value="${cancha.ID_CANCHA}">${'Cancha ' + cancha.NUMERO}</option>
            `).join('');
            }
            document.getElementById('cancha').insertAdjacentHTML('afterbegin', '<option value="" disabled selected hidden>Elige la Cancha</option>');

            // Solo continúa si existe un mantenimientoId
            if (mantenimientoId) {
                showLoadingAlert(); // Muestra el loading screen para la siguiente solicitud
                return fetch(`/mantenimientos/mantenimiento/${mantenimientoId}`, { method: 'GET' });
            }
        })
        .then(response => {
            if (response) {
                Swal.close(); // Cierra el loading screen después de obtener la respuesta
                return response.json();
            }
        })
        .then(data => {
            if (data.success === false) {
                showErrorAlert(data.error || 'No se encontró el cliente.');
            } else {
                // Actualiza los campos del formulario con los datos del mantenimiento
                mantenimientoIdInput.value = data.mantenimiento.ID_MANTENIMIENTO;
                canchaInput.value = data.mantenimiento.ID_CANCHA;
                fechaInicioInput.value = data.mantenimiento.FECHA_INICIO;
                horaInicioInput.value = data.mantenimiento.HORA_INICIO;
                fechaFinInput.value = data.mantenimiento.FECHA_FIN;
                horaFinInput.value = data.mantenimiento.HORA_FIN;
                descripcionInput.value = data.mantenimiento.DESCRIPCION;
                estadoInput.value = data.mantenimiento.ESTADO;
            }
        })
        .catch(error => {
            Swal.close(); // Cierra el loading screen en caso de error
            showErrorAlert(error || 'Ocurrió un error al cargar los datos.');
            console.error('Error:', error);
        });

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const newCancha = canchaInput.value;
        const newFechaInicio = fechaInicioInput.value;
        const newFechaFin = fechaFinInput.value;
        const newHoraInicio = horaInicioInput.value;
        const newHoraFin = horaFinInput.value;
        const newDescripcion = descripcionInput.value.trim() || null;
        const newEstado = estadoInput.value;

        fetch(`/mantenimientos/update/${mantenimientoId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cancha: newCancha, fecha_inicio: newFechaInicio, fecha_fin: newFechaFin, hora_inicio: newHoraInicio, hora_fin: newHoraFin, descripcion: newDescripcion, estado: newEstado })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El mantenimiento se ha actualizado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_mantenimientos';
                    });
                } else {
                    showErrorAlert(data.error || 'Error desconocido.');
                }
            })
            .catch(error => {
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    });
});
