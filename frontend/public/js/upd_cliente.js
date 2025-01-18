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
// showErrorToast('Error al actualizar el cliente 1.');

// Función para bloquear o desbloquear el campo de motivo de bloqueo
function toggleMotivoBloqueo() {
    const estado = document.getElementById("estado").value;
    const motivoBloqueo = document.getElementById("motivo_bloqueo");

    if (estado === "B") {
        motivoBloqueo.disabled = false;
    } else {
        motivoBloqueo.disabled = true;
        motivoBloqueo.value = ""; // Opcional: Limpiar el campo cuando está deshabilitado
    }
}


document.addEventListener('DOMContentLoaded', function () {

    const form = document.getElementById('update-cliente-form');
    const clienteIdInput = document.getElementById('id-cliente');

    // Obtiene el ID del cliente de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

    // Obtiene los campos del formulario donde se mostrará la información del cliente
    const clienteDocumentoIdInput = document.getElementById('documento_id');
    const clienteNombreInput = document.getElementById('nombre');
    const clienteApellidoInput = document.getElementById('apellido');
    const clienteFechaNacimientoInput = document.getElementById('fecha_nacimiento');
    const clienteCiudadInput = document.getElementById('ciudad');
    const clienteDireccionInput = document.getElementById('direccion');
    const clienteTelefonoInput = document.getElementById('telefono');
    const clienteEmailInput = document.getElementById('email');
    const clienteNacionalidadInput = document.getElementById('nacionalidad');
    const clientEstadoInput = document.getElementById('estado');
    const clienteMotivoBloqueoInput = document.getElementById('motivo_bloqueo');


    // Verifica si existe un ID de cliente
    if (clienteId) {
        fetch(`/clientes/cliente/${clienteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success && data.cliente) {
                    // Actualiza los campos del formulario con los datos del cliente
                    clienteIdInput.value = data.cliente.ID_CLIENTE
                    clienteDocumentoIdInput.value = data.cliente.DOCUMENTO_ID
                    clienteNombreInput.value = data.cliente.NOMBRE
                    clienteApellidoInput.value = data.cliente.APELLIDO
                    clienteFechaNacimientoInput.value = data.cliente.FECHA_NACIMIENTO
                    clienteCiudadInput.value = data.cliente.CIUDAD
                    clienteDireccionInput.value = data.cliente.DIRECCION
                    clienteTelefonoInput.value = data.cliente.TELEFONO
                    clienteEmailInput.value = data.cliente.EMAIL
                    clienteNacionalidadInput.value = data.cliente.NACIONALIDAD
                    clientEstadoInput.value = data.cliente.ESTADO
                    clienteMotivoBloqueoInput.value = data.cliente.MOTIVO_BLOQUEO

                    toggleMotivoBloqueo();
                } else {
                    // Muestra un mensaje si no se encontró el cliente
                    showErrorToast('No se encontró el cliente.');
                }
            })
            .catch(error => {
                // Manejo de errores en cualquiera de las solicitudes
                showErrorToast('Ocurrió un error al cargar los datos.');
                console.error('Error:', error);
            });
    }

    window.toggleMotivoBloqueo = function () {
        const estado = document.getElementById("estado").value;
        const motivoBloqueo = document.getElementById("motivo_bloqueo");

        if (estado === "B") {
            motivoBloqueo.disabled = false;
        } else {
            motivoBloqueo.disabled = true;
            motivoBloqueo.value = ""; // Optional: Clear the field when disabled
        }
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const newDocumentoId = document.getElementById('documento_id').value.trim()
        const newNombre = document.getElementById('nombre').value.trim();
        const newApellido = document.getElementById('apellido').value.trim();
        const newFechaNacimiento = document.getElementById('fecha_nacimiento').value;
        const newCiudad = document.getElementById('ciudad').value.trim();
        const newDireccion = document.getElementById('direccion').value.trim();
        const newTelefono = document.getElementById('telefono').value.trim();
        const newEmail = document.getElementById('email').value.trim();
        const newNacionalidad = document.getElementById('nacionalidad').value.trim();
        const newEstado = document.getElementById('estado').value.trim();
        const newMotivoBloqueo = document.getElementById('motivo_bloqueo').value.trim() || null;

        fetch(`/clientes/update/${clienteId}`, {  // Método POST explícito
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento_id: newDocumentoId, nombre: newNombre, apellido: newApellido, fecha_nacimiento: newFechaNacimiento, ciudad: newCiudad, direccion: newDireccion, telefono: newTelefono, email: newEmail, nacionalidad: newNacionalidad, estado: newEstado, motivo_bloqueo: newMotivoBloqueo })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    window.location.href = '/list_clientes';
                } else {
                    showErrorToast(data.error || 'Error al actualizar el cliente.');
                }
            })
            .catch(error => {
                showErrorToast(data.error || 'Error en la conexión con el servidor.');
            });
    });
});
