// Función para mostrar alertas de error usando SweetAlert
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
    const form = document.getElementById('update-deporte-form');
    const deporteIdInput = document.getElementById('id-deporte');

    // Obtiene el ID del item de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const deporteId = urlParams.get('id');

    // Obtiene los campos del formulario donde se mostrará la información del item
    const deporteNombreInput = document.getElementById('nombre');

    // Verifica si existe un ID del item
    if (deporteId) {
        showLoadingAlert();
        fetch(`/deportes/deporte/${deporteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cierra el popup de carga
                if (data.success === false) {
                    showErrorAlert(data.error || 'No se encontró el deporte.');
                } else {
                    // Actualiza los campos del formulario con los datos del item
                    deporteIdInput.value = data.deporte.ID_DEPORTE;
                    deporteNombreInput.value = data.deporte.NOMBRE;
                }
            })
            .catch(error => {
                Swal.close(); // Cierra el popup de carga
                // Manejo de errores en cualquiera de las solicitudes
                showErrorAlert(error || 'Ocurrió un error al cargar los datos.');
                console.error('Error:', error);
            });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const newNombre = document.getElementById('nombre').value.trim();

        fetch(`/deportes/update/${deporteId}`, { // Método POST explícito
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newNombre })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El deporte se ha actualizado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_deportes';
                    });
                } else {
                    showErrorAlert(data.error || 'Error al actualizar el deporte.');
                }
            })
            .catch(error => {
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });
});
