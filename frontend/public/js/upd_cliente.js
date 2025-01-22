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
        // Muestra la animación de carga al inicio
        Swal.fire({
            title: 'Cargando...',
            text: 'Estamos obteniendo los datos del cliente.',
            allowOutsideClick: false,  // No permite cerrar el popup haciendo clic fuera
            didOpen: () => {
                Swal.showLoading();  // Muestra el spinner de carga
            }
        });

        fetch(`/clientes/cliente/${clienteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                // Cierra el popup de carga
                Swal.close();

                if (data.success === false) {
                    // Muestra un mensaje de error si no se encontró el cliente
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'No se encontró el cliente.',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    // Actualiza los campos del formulario con los datos del cliente
                    clienteIdInput.value = data.cliente.ID_CLIENTE;
                    clienteDocumentoIdInput.value = data.cliente.DOCUMENTO_ID;
                    clienteNombreInput.value = data.cliente.NOMBRE;
                    clienteApellidoInput.value = data.cliente.APELLIDO;
                    clienteFechaNacimientoInput.value = data.cliente.FECHA_NACIMIENTO;
                    clienteCiudadInput.value = data.cliente.CIUDAD;
                    clienteDireccionInput.value = data.cliente.DIRECCION;
                    clienteTelefonoInput.value = data.cliente.TELEFONO;
                    clienteEmailInput.value = data.cliente.EMAIL;
                    clienteNacionalidadInput.value = data.cliente.NACIONALIDAD;
                    clientEstadoInput.value = data.cliente.ESTADO;
                    clienteMotivoBloqueoInput.value = data.cliente.MOTIVO_BLOQUEO;

                    toggleMotivoBloqueo();  // Llama a la función para gestionar el motivo de bloqueo
                }
            })
            .catch(error => {
                // Cierra el popup de carga y muestra un mensaje de error si ocurre algún problema
                Swal.close();
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Ocurrió un error al cargar los datos.',
                    confirmButtonText: 'Aceptar'
                });
                console.error('Error:', error);
            });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();
        const newDocumentoId = clienteDocumentoIdInput.value.trim();
        const newNombre = clienteNombreInput.value.trim();
        const newApellido = clienteApellidoInput.value.trim();
        const newFechaNacimiento = clienteFechaNacimientoInput.value;
        const newCiudad = clienteCiudadInput.value.trim();
        const newDireccion = clienteDireccionInput.value.trim();
        const newTelefono = clienteTelefonoInput.value.trim();
        const newEmail = clienteEmailInput.value.trim();
        const newNacionalidad = clienteNacionalidadInput.value.trim();
        const newEstado = clientEstadoInput.value.trim();
        const newMotivoBloqueo = clienteMotivoBloqueoInput.value.trim() || null;

        fetch(`/clientes/update/${clienteId}`, {  // Método POST explícito
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ documento_id: newDocumentoId, nombre: newNombre, apellido: newApellido, fecha_nacimiento: newFechaNacimiento, ciudad: newCiudad, direccion: newDireccion, telefono: newTelefono, email: newEmail, nacionalidad: newNacionalidad, estado: newEstado, motivo_bloqueo: newMotivoBloqueo })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El cliente se ha actualizado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_clientes';
                    });
                } else {
                    // Si la respuesta tiene un error, muestra el error proporcionado
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'Error desconocido.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error || 'Error en la conexión con el servidor.',
                    confirmButtonText: 'Aceptar'
                });
            });
    });
});

