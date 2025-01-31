// Función para mostrar alertas de error usando SweetAlert
function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
    });
}

function initMap() {
    // Posición inicial: Asunción, Paraguay
    const paraguay = { lat: -25.2637, lng: -57.5759 };

    // Crear el mapa
    const mapa = new google.maps.Map(document.getElementById("mapa"), {
        center: paraguay,
        zoom: 13,
    });

    // Crear un geocoder para convertir direcciones en coordenadas
    const geocodificador = new google.maps.Geocoder();

    let marcador = null; // Guardará el marcador actual

    // Evento: cuando el usuario hace clic en el mapa
    mapa.addListener("click", function (evento) {
        actualizarMarcador(evento.latLng);
        obtenerDireccion(geocodificador, evento.latLng);
    });

    // Evento: cuando el usuario escribe en "Ciudad" o "Dirección"
    document.getElementById("ciudad").addEventListener("change", buscarDireccion);
    document.getElementById("direccion").addEventListener("change", buscarDireccion);

    // Función para buscar la dirección ingresada
    function buscarDireccion() {
        const direccion = document.getElementById("direccion").value;
        const ciudad = document.getElementById("ciudad").value;
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

    // Función para extraer la ciudad de los datos de la dirección
    function obtenerCiudad(componentes) {
        for (const componente of componentes) {
            if (componente.types.includes("locality")) {
                return componente.long_name;
            }
        }
        return "Ciudad desconocida";
    }
}


document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-cliente-form');

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Obtiene los campos del formulario donde se mostrará la información del cliente
        const newDocumentoId = document.getElementById('documento_id').value.trim();
        const newNombre = document.getElementById('nombre').value.trim();
        const newApellido = document.getElementById('apellido').value.trim();
        const newFechaNacimiento = document.getElementById('fecha_nacimiento').value.trim() || null;
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
                console.log(data);
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El cliente se ha agregado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_clientes';
                    });
                } else {
                    showErrorAlert(data.error || 'Error desconocido.');
                }
            })
            .catch(error => {
                // Muestra un mensaje de error en caso de fallo en la conexión
                showErrorAlert(error.message || 'Error en la conexión con el servidor.');
            });
    });
});
