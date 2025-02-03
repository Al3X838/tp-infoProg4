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

// Variables globales
let mapa = null;
let marcador = null;
let geocodificador = null;
let mapaCargado = false; // Variable para indicar si el mapa está listo
let datosClienteCargados = false; // Indica si los datos del cliente ya se cargaron

// Función para actualizar el marcador en la posición dada
function actualizarMarcador(posicion) {
    // Si ya hay un marcador, eliminarlo
    if (marcador) {
        marcador.setMap(null);
    }

    // Crear un nuevo marcador
    marcador = new google.maps.Marker({
        position: posicion,
        map: mapa,
        draggable: true, // Permitir que el usuario lo mueva
    });

    // Evento: cuando el usuario mueve el marcador, actualizar dirección
    marcador.addListener("dragend", function () {
        obtenerDireccion(geocodificador, marcador.getPosition());
    });
}

// Función para extraer la ciudad de los datos de la dirección
function obtenerCiudad(componentes) {
    for (const componente of componentes) {
        if (componente.types.includes("locality")) {
            return componente.long_name;
        }
    }
    return "Ciudad desconocida";
}

// Función para convertir coordenadas en una dirección
function obtenerDireccion(geocodificador, coordenadas) {
    geocodificador.geocode({ location: coordenadas }, function (resultados, estado) {
        if (estado === "OK" && resultados[0]) {
            document.getElementById("direccion").value = resultados[0].formatted_address;
            document.getElementById("ciudad").value = obtenerCiudad(resultados[0].address_components);
        } else {
            console.log("No se encontró una dirección: " + estado);
        }
    });
}

// Función para buscar la dirección que ahora puede ser llamada desde fuera
function buscarDireccion(direccionInput, ciudadInput) {
    const direccion = direccionInput || document.getElementById("direccion").value;
    const ciudad = ciudadInput || document.getElementById("ciudad").value;
    const consulta = `${direccion}, ${ciudad}, Paraguay`;

    geocodificador.geocode({ address: consulta }, function (resultados, estado) {
        if (estado === "OK" && resultados[0]) {
            const ubicacion = resultados[0].geometry.location;
            mapa.setCenter(ubicacion);
            actualizarMarcador(ubicacion);
        } else {
            console.log("No se encontró la dirección ingresada.");
        }
    });
}

function initMap() {
    // Posición inicial: Asunción, Paraguay
    const paraguay = { lat: -25.2637, lng: -57.5759 };

    // Crear el mapa
    mapa = new google.maps.Map(document.getElementById("mapa"), {
        center: paraguay,
        zoom: 13,
    });

    // Crear un geocoder para convertir direcciones en coordenadas
    geocodificador = new google.maps.Geocoder();

    // Marcar el mapa como cargado después de 1 segundo (por seguridad)
    mapaCargado = true;
    if (datosClienteCargados) {
        buscarDireccion();
    }

    // Evento: cuando el usuario hace clic en el mapa
    mapa.addListener("click", function (evento) {
        actualizarMarcador(evento.latLng);
        obtenerDireccion(geocodificador, evento.latLng);
    });

    // Evento: cuando el usuario escribe en "Ciudad" o "Dirección"
    document.getElementById("ciudad").addEventListener("change", () => buscarDireccion());
    document.getElementById("direccion").addEventListener("change", () => buscarDireccion());
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
                    datosClienteCargados = true;

                    // Si el mapa ya está listo, busca la dirección
                    if (mapaCargado) {
                        buscarDireccion();
                        console.log('Buscando dirección...');
                    }
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
