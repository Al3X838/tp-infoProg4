// Función para mostrar alertas de error usando SweetAlert
function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-deporte-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        // Obtiene los campos del formulario
        const newNombre = document.getElementById('nombre').value.trim();
        console.log({ nombre: newNombre });

        // Realiza la solicitud POST para agregar un item
        fetch('/deportes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ nombre: newNombre })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Muestra alerta de éxito y redirige
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El deporte se ha agregado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_deportes';
                    });
                } else {
                    // Muestra alerta de error
                    showErrorAlert(data.error || 'Error al agregar el deporte.');
                }
            })
            .catch(error => {
                Swal.close(); // Cierra el spinner de carga
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });
});
