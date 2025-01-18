function showErrorToast(message) {
    const toastContainer = document.getElementById('toast-container');

    // Verificar si el contenedor existe
    if (!toastContainer) {
        console.error('¡Elemento del contenedor del Toast no encontrado!');
        return;
    }

    // Crear un nuevo elemento Toast
    const newToast = document.createElement('div');
    newToast.className = 'toast align-items-center text-bg-danger border-0';
    newToast.setAttribute('role', 'alert');
    newToast.setAttribute('aria-live', 'assertive');
    newToast.setAttribute('aria-atomic', 'true');

    // Crear la estructura interna del Toast
    newToast.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button
                type="button"
                class="btn-close btn-close-white me-2 m-auto"
                data-bs-dismiss="toast"
                aria-label="Close"></button>
        </div>
    `;

    // Agregar el nuevo Toast al contenedor
    toastContainer.appendChild(newToast);

    // Crear una instancia del Toast de Bootstrap
    const bootstrapToast = new bootstrap.Toast(newToast, {
        delay: 5000 // Ocultar automáticamente después de 5 segundos
    });

    // Mostrar el Toast
    bootstrapToast.show();

    // Eliminar el Toast del DOM después de que se cierre
    newToast.addEventListener('hidden.bs.toast', () => {
        newToast.remove();
    });
}
// // Ejemplo de uso
// showErrorToast('Error al actualizar el mantenimiento 1.');





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
        .then(response => response.json())
        .then(data => {
            document.getElementById('cancha').innerHTML = data.canchas.map(cancha => `
        <option value="${cancha.ID_CANCHA}">${'Cancha ' + cancha.NUMERO}</option>
    `).join('');
            document.getElementById('cancha').insertAdjacentHTML('afterbegin', '<option value="" disabled selected hidden>Elige la Cancha</option>');

            // Solo continúa si existe un mantenimientoId
            if (mantenimientoId) {
                return fetch(`/mantenimientos/mantenimiento/${mantenimientoId}`, { method: 'GET' });
            }
        })
        .then(response => {
            if (response) {
                return response.json();
            }
        })
        .then(data => {
            if (data && data.success && data.mantenimiento) {
                // Actualiza los campos del formulario con los datos del mantenimiento
                mantenimientoIdInput.value = data.mantenimiento.ID_MANTENIMIENTO;
                canchaInput.value = data.mantenimiento.ID_CANCHA;
                fechaInicioInput.value = data.mantenimiento.FECHA_INICIO;
                horaInicioInput.value = data.mantenimiento.HORA_INICIO;
                fechaFinInput.value = data.mantenimiento.FECHA_FIN;
                horaFinInput.value = data.mantenimiento.HORA_FIN;
                descripcionInput.value = data.mantenimiento.DESCRIPCION;
                estadoInput.value = data.mantenimiento.ESTADO;
            } else if (mantenimientoId) {
                // Muestra un mensaje si no se encontró el mantenimiento
                showErrorToast('No se encontró el mantenimiento.');
            }
        })
        .catch(error => {
            // Manejo de errores en cualquiera de las solicitudes
            showErrorToast(error || 'Ocurrió un error al cargar los datos.');
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
                    window.location.href = '/list_mantenimientos';
                } else {
                    showErrorToast(data.error || 'Error al actualizar el mantenimiento.');
                }
            })
            .catch(error => {
                showErrorToast(data.error || 'Error en la conexión con el servidor.');
            });
    });
});
