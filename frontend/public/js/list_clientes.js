// Función para mostrar alertas de error con SweetAlert
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
        text: 'Estamos obteniendo los clientes.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/clientes'; // URL base para los endpoints
    const clientsList = document.getElementById('clientes-list');
    let clientes = []; // Array global para los datos de clientes
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        // Mostrar el popup de carga
        showLoadingAlert();

        return fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                // Cierra el popup de carga
                Swal.close();

                if (data.success === false) {
                    // Utilizar la función showErrorAlert para mostrar errores
                    showErrorAlert(data.error || 'Error desconocido.');
                } else {
                    // Actualiza la lista de clientes
                    clientes = data.clientes || [];
                }
            })
            .catch(error => {
                // Cierra el popup de carga y utiliza showErrorAlert para errores de conexión
                Swal.close();
                showErrorAlert(error.message || 'Error al cargar los clientes.');
            });
    }

    // Función para renderizar la tabla
    function renderClientes(clientes) {
        clientsList.innerHTML = clientes.map(cliente => `
            <tr id="cliente-row-${cliente.ID_CLIENTE}">
                <th>${cliente.ID_CLIENTE}</th>
                <td>${cliente.NOMBRE || 'N/A'}</td>
                <td>${cliente.APELLIDO || 'N/A'}</td>
                <td>${cliente.DOCUMENTO_ID || 'N/A'}</td>
                <td>${cliente.CIUDAD || 'N/A'}</td>
                <td>${cliente.TELEFONO || 'N/A'}</td>
                <td>${cliente.EMAIL || 'N/A'}</td>
                <td class="text-center">${cliente.ESTADO == "A" ? "Activo" : (cliente.ESTADO == "B" ? "Bloqueado" : (cliente.ESTADO == "P" ? "Promocional" : "N/A"))}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info bi bi-info-circle" onclick='toggleDetails(${cliente.ID_CLIENTE})' data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Detalles"></button>
                    <button class="btn btn-warning bi bi-pencil" onclick="editCliente(${cliente.ID_CLIENTE})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${cliente.ID_CLIENTE}, '${(cliente.NOMBRE + ', ' + cliente.APELLIDO)}')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eleminar"></button>
                  </div>
                </td>
            </tr>
            <tr id="details-row-${cliente.ID_CLIENTE}" class="d-none">
                <td colspan="5">
                    <div class="p-3 border rounded">
                        <ul class="list-unstyled mb-0">
                            <li><strong>Fecha de Nacimiento:</strong> ${cliente.FECHA_NACIMIENTO || 'N/A'}</li>
                            <li><strong>Direccion:</strong> ${cliente.DIRECCION || 'N/A'}</li>
                            <li><strong>Nacionalidad:</strong> ${cliente.NACIONALIDAD || 'N/A'}</li>
                            <li><strong>Motivo Bloqueo:</strong> ${cliente.MOTIVO_BLOQUEO || 'N/A'}</li>
                        </ul>
                        
                    </div>
                </td>
                <td colspan="4">
                    <div class="p-3 border rounded">
                        <div id="map-${cliente.ID_CLIENTE}" style="height: 150px;"></div>
                    </div>
                </td>
            </tr>
        `).join('');
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    }

    window.toggleDetails = function (id) {
        const detailsRow = document.getElementById(`details-row-${id}`);

        // Alternar visibilidad
        if (detailsRow.classList.contains('d-none')) {
            detailsRow.classList.remove('d-none');

            // Encontrar al cliente
            const cliente = clientes.find(c => c.ID_CLIENTE === id);
            if (!cliente) {
                console.error(`Cliente con ID ${id} no encontrado.`);
                return;
            }

            const address = `${cliente.DIRECCION}, ${cliente.CIUDAD}`;
            const mapContainer = document.getElementById(`map-${id}`);

            // Inicializar el mapa de Google Maps
            const geocoder = new google.maps.Geocoder();
            const map = new google.maps.Map(mapContainer, {
                zoom: 15,
                center: { lat: -25.2637, lng: -57.5759 }, // Coordenadas predeterminadas (por ejemplo, Asunción, Paraguay)
            });

            // Convertir la dirección en coordenadas y colocar un marcador
            geocoder.geocode({ address: address }, (results, status) => {
                if (status === "OK") {
                    map.setCenter(results[0].geometry.location);
                    new google.maps.Marker({
                        map: map,
                        position: results[0].geometry.location,
                    });
                } else {
                    console.error(`Geocodificación fallida: ${status}`);
                    mapContainer.innerHTML = `<p>No se pudo cargar la dirección.</p>`;
                }
            });
        } else {
            detailsRow.classList.add('d-none');
        }
    };


    // Función para ordenar la tabla
    window.sortTable = function (columnIndex) {
        // Inicializar la dirección si aún no está definida
        if (!sortDirection[columnIndex]) {
            sortDirection[columnIndex] = "ASC";
        }

        // Dirección actual
        const direction = sortDirection[columnIndex];

        // Ordenar los clientes
        const sortedClientes = [...clientes].sort((a, b) => {
            const key = Object.keys(a)[columnIndex];
            const valueA = a[key];
            const valueB = b[key];

            if (typeof valueA === "number" && typeof valueB === "number") {
                // Comparar como números
                return direction === "ASC" ? valueA - valueB : valueB - valueA;
            } else {
                // Comparar como strings
                return direction === "ASC"
                    ? valueA.toString().localeCompare(valueB.toString())
                    : valueB.toString().localeCompare(valueA.toString());
            }
        });

        // Cambiar la dirección de orden para la próxima vez
        sortDirection[columnIndex] = direction === "ASC" ? "DESC" : "ASC";

        // Volver a renderizar la tabla
        renderClientes(sortedClientes);
    };

    // Función para filtrar los clientes según el término de búsqueda
    window.filterClientes = function () {
        const searchValue = document.getElementById("searchField").value.toLowerCase();
        const filteredClientes = clientes.filter((cliente) =>
            Object.values(cliente).join(" ").toLowerCase().includes(searchValue)
        );
        renderClientes(filteredClientes);
    }

    // Función para cargar y renderizar los datos
    function loadClientes() {
        fetchData().then(() => {
            renderClientes(clientes);
        });
    }

    // Cargar tabla
    loadClientes();

    window.editCliente = function (id) {
        window.location.href = `../upd_cliente?id=${id}`;
    };

    // Función para confirmar y eliminar un cliente
    window.confirmDelete = function (id, Name) {
        // Usar SweetAlert para confirmación de eliminación
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el cliente "${Name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCliente(id, loadClientes);
            }
        });
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteCliente(id, callback) {
        fetch(`${apiUrl}/delete/${id}`,
            { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                    Swal.fire('Eliminado!', 'El cliente ha sido eliminado.', 'success');
                } else {
                    showErrorAlert(data.error || 'Error al eliminar el cliente.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar cliente:', error);
                showErrorAlert('Error en la conexión con el servidor.');
            });
    }


});
