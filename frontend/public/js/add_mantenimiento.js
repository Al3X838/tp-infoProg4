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


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-mantenimiento-form');


    fetch('/api/canchas', { method: 'GET' })  // Método GET explícito
        .then(response => response.json())
        .then(data => {
            document.getElementById('cancha').innerHTML = data.canchas.map(cancha => `
                <option value="${cancha.ID_CANCHA}">${'Cancha ' + cancha.NUMERO}</option>
            `).join('');
            document.getElementById('cancha').insertAdjacentHTML('afterbegin', '<option value="" disabled selected hidden>Elige la Cancha</option>');
        })
        .catch(error => {
            showErrorToast(error || 'Error al cargar las canchas.');
        });


    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Obtiene los campos del formulario donde se mostrará la información del mantenimiento
        const newCancha = document.getElementById('cancha').value.trim();
        const newFechaInicio = document.getElementById('fecha_inicio').value;
        const newHoraInicio = document.getElementById('hora_inicio').value;
        const newFechaFin = document.getElementById('fecha_fin').value;
        const newHoraFin = document.getElementById('hora_fin').value;
        const newDescripcion = document.getElementById('descripcion').value.trim();
        console.log({ id_cancha: newCancha, fecha_inicio: newFechaInicio, hora_inicio: newHoraInicio, fecha_fin: newFechaFin, hora_fin: newHoraFin, descripcion: newDescripcion });
        fetch('/mantenimientos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cancha: newCancha, fecha_inicio: newFechaInicio, hora_inicio: newHoraInicio, fecha_fin: newFechaFin, hora_fin: newHoraFin, descripcion: newDescripcion })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/list_mantenimientos';
                } else {
                    ;
                    showErrorToast(data.error || 'Error al agregar el mantenimiento.');
                }
            })
            .catch(error => {
                showErrorToast(error || 'Error en la conexión con el servidor.');
            });
    });

});