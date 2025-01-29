function toggleMotivoBloqueo() {
    const estado = document.getElementById("estado").value;
    const motivoBloqueo = document.getElementById("motivo_bloqueo");

    if (estado === "B") {
        motivoBloqueo.disabled = false;
    } else {
        motivoBloqueo.disabled = true;
        motivoBloqueo.value = ""; // Optional: Limpiar el campo cuando está deshabilitado
    }
}

// Universelle SweetAlert-Funktionen
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
    const form = document.getElementById('update-cliente-form');
    const clienteIdInput = document.getElementById('id-cliente');

    const urlParams = new URLSearchParams(window.location.search);
    const clienteId = urlParams.get('id');

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

    if (clienteId) {
        showLoadingAlert();

        fetch(`/clientes/cliente/${clienteId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cierra el popup de carga

                if (data.success === false) {
                    showErrorAlert(data.error || 'No se encontró el cliente.');
                } else {
                    clienteIdInput.value = data.cliente.ID_CLIENTE;
                    clienteDocumentoIdInput.value = data.cliente.DOCUMENTO_ID;
                    clienteNombreInput.value = data.cliente.NOMBRE;
                    clienteApellidoInput.value = data.cliente.APELLIDO;
                    clienteFechaNacimientoInput.value = data.cliente.FECHA_NACIMIENTO || null;
                    clienteCiudadInput.value = data.cliente.CIUDAD;
                    clienteDireccionInput.value = data.cliente.DIRECCION;
                    clienteTelefonoInput.value = data.cliente.TELEFONO;
                    clienteEmailInput.value = data.cliente.EMAIL;
                    clienteNacionalidadInput.value = data.cliente.NACIONALIDAD;
                    clientEstadoInput.value = data.cliente.ESTADO;
                    clienteMotivoBloqueoInput.value = data.cliente.MOTIVO_BLOQUEO;

                    toggleMotivoBloqueo(); // Llama a la función para gestionar el motivo de bloqueo
                }
            })
            .catch(error => {
                Swal.close();
                showErrorAlert('Ocurrió un error al cargar los datos.');
                console.error('Error:', error);
            });
    }

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        const newClienteData = {
            documento_id: clienteDocumentoIdInput.value.trim(),
            nombre: clienteNombreInput.value.trim(),
            apellido: clienteApellidoInput.value.trim(),
            fecha_nacimiento: clienteFechaNacimientoInput.value.trim() || null,
            ciudad: clienteCiudadInput.value.trim(),
            direccion: clienteDireccionInput.value.trim(),
            telefono: clienteTelefonoInput.value.trim(),
            email: clienteEmailInput.value.trim(),
            nacionalidad: clienteNacionalidadInput.value.trim(),
            estado: clientEstadoInput.value.trim(),
            motivo_bloqueo: clienteMotivoBloqueoInput.value.trim() || null
        };
        console.log(newClienteData);
        fetch(`/clientes/update/${clienteId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newClienteData)
        })
            .then(response => response.json())
            .then(data => {
                console.log(data);
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
                    showErrorAlert(data.error || 'Error desconocido.');
                }
            })
            .catch(error => {
                showErrorAlert('Error en la conexión con el servidor.');
                console.error('Error:', error);
            });
    });
});
