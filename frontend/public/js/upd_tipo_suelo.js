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
// showErrorToast('Error al actualizar el Tipo De Suelo 1.');

document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('update-tipoSuelo-form');
    const tipoSueloIdInput = document.getElementById('id-tipoSuelo');

    // Obtiene el ID del Tipo de Suelo de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipoSueloId = urlParams.get('id');

    // Obtiene los campos del formulario donde se mostrará la información del Tipo De suelo
    const tipoSueloNombreInput = document.getElementById('nombre');



    // Verifica si existe un ID del tipo de Suelo
    if (tipoSueloId) {
        fetch(`/tiposuelos/tiposuelo/${tipoSueloId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.tiposuelos) {
                    // Actualiza los campos del formulario con los datos del tipo de Suelo
                    tipoSueloIdInput.value = data.tiposuelos.ID_TIPO_SUELO
                    tipoSueloNombreInput.value = data.tiposuelos.NOMBRE

                    toggleMotivoBloqueo();
                } else {
                    // Muestra un mensaje si no se encontró el tipo de Suelo
                    showErrorToast('No se encontró el tipo de Suelo.');
                }
            })
            .catch(error => {
                // Manejo de errores en cualquiera de las solicitudes
                showErrorToast('Ocurrió un error al cargar los datos.');
                console.error('Error:', error);
            });
    }


    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const newNombre = document.getElementById('nombre').value.trim();
 

        console.log({ nombre: newNombre});
        fetch(`/tiposuelos/update/${tipoSueloId}`, {  // Método POST explícito
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newNombre})
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/list_tipo_suelo';
                } else {
                    showErrorToast(data.error || 'Error al actualizar el tipo de Suelo.');
                }
            })
            .catch(error => {
                showErrorToast(data.error || 'Error en la conexión con el servidor.');
            });
    });
});
