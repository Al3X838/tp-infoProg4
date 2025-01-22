document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-cliente-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Obtiene los campos del formulario donde se mostrará la información del cliente
        const newDocumentoId = document.getElementById('documento_id').value.trim();
        const newNombre = document.getElementById('nombre').value.trim();
        const newApellido = document.getElementById('apellido').value.trim();
        const newFechaNacimiento = document.getElementById('fecha_nacimiento').value;
        const newCiudad = document.getElementById('ciudad').value.trim();
        const newDireccion = document.getElementById('direccion').value.trim();
        const newTelefono = document.getElementById('telefono').value.trim();
        const newEmail = document.getElementById('email').value.trim();
        const newNacionalidad = document.getElementById('nacionalidad').value.trim() || null;

        // Realiza la solicitud para agregar un cliente
        fetch('/clientes/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                documento_id: newDocumentoId,
                nombre: newNombre,
                apellido: newApellido,
                fecha_nacimiento: newFechaNacimiento,
                ciudad: newCiudad,
                direccion: newDireccion,
                telefono: newTelefono,
                email: newEmail,
                nacionalidad: newNacionalidad
            })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    // Redirige a la lista de clientes si la operación fue exitosa
                    window.location.href = '/list_clientes';
                } else {
                    // Muestra un mensaje de error usando SweetAlert
                    showErrorAlert(data.error || 'Error al agregar el cliente.');
                }
            })
            .catch(error => {
                // Muestra un mensaje de error en caso de fallo en la conexión
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });

    // Función para mostrar alertas de error usando SweetAlert
    function showErrorAlert(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'Aceptar'
        });
    }
});
