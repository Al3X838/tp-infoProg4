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
    const form = document.getElementById('update-tipoSuelo-form');
    const tipoSueloIdInput = document.getElementById('id-tipoSuelo');

    // Obtiene el ID del Tipo de Suelo de los parámetros de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const tipoSueloId = urlParams.get('id');

    // Obtiene los campos del formulario donde se mostrará la información del Tipo De Suelo
    const tipoSueloNombreInput = document.getElementById('nombre');

    // Verifica si existe un ID del tipo de Suelo
    if (tipoSueloId) {
        showLoadingAlert();
        fetch(`/tiposuelos/tiposuelo/${tipoSueloId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cierra el popup de carga
                if (data.success === false) {
                    showErrorAlert(data.error || 'No se encontró el tipo de Suelo.');
                } else {
                    // Actualiza los campos del formulario con los datos del tipo de Suelo
                    tipoSueloIdInput.value = data.tiposuelo.ID_TIPO_SUELO;
                    tipoSueloNombreInput.value = data.tiposuelo.NOMBRE;
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

        console.log({ nombre: newNombre });
        fetch(`/tiposuelos/update/${tipoSueloId}`, { // Método POST explícito
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
                        text: 'El tipo de suelo se ha actualizado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_tipo_suelo';
                    });
                } else {
                    showErrorAlert(data.error || 'Error al actualizar el tipo de Suelo.');
                }
            })
            .catch(error => {
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });
});
