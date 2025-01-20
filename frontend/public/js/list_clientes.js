// Función para mostrar un toast de error
function showErrorToast(message) {
    const toastContainer = document.getElementById('toast-container');

    if (!toastContainer) {
        console.error('¡Elemento del contenedor del Toast no encontrado!');
        return;
    }

    const newToast = document.createElement('div');
    newToast.className = 'toast align-items-center text-bg-danger border-0';
    newToast.setAttribute('role', 'alert');
    newToast.setAttribute('aria-live', 'assertive');
    newToast.setAttribute('aria-atomic', 'true');

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

    toastContainer.appendChild(newToast);

    const bootstrapToast = new bootstrap.Toast(newToast, { delay: 5000 });
    bootstrapToast.show();

    newToast.addEventListener('hidden.bs.toast', () => {
        newToast.remove();
    });
}



document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/clientes'; // URL base para los endpoints
    const clientsList = document.getElementById('clientes-list');
    let clientes = []; // Array global para los datos de clientes
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        return fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success === false) {
                    showErrorToast(data.error || 'Error desconocido.');
                } else {
                    clientes = data.clientes || [];
                }
            })
            .catch(error => {
                showErrorToast(error || 'Error al cargar los clientes.');
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
                <td class="text-center">${cliente.ESTADO}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info bi bi-info-circle" onclick='toggleDetails(${cliente.ID_CLIENTE})'></button>
                    <button class="btn btn-warning bi bi-pencil" onclick="editCliente(${cliente.ID_CLIENTE})"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${cliente.ID_CLIENTE}, '${(cliente.NOMBRE + ', ' + cliente.APELLIDO)}')"></button>
                  </div>
                </td>
              </tr>
            <tr id="details-row-${cliente.ID_CLIENTE}" class="d-none">
                <td colspan="9">
                    <div class="p-3 border rounded">
                        <ul class="list-unstyled mb-0">
                            <li><strong>Fecha de Nacimiento:</strong> ${cliente.FECHA_NACIMIENTO || 'N/A'}</li>
                            <li><strong>Direccion:</strong> ${cliente.DIRECCION || 'N/A'}</li>
                            <li><strong>Nacionalidad:</strong> ${cliente.NACIONALIDAD || 'N/A'}</li>
                            <li><strong>Motivo Bloqueo:</strong> ${cliente.MOTIVO_BLOQUEO || 'N/A'}</li>
                        </ul>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    window.toggleDetails = function (id) {
        const detailsRow = document.getElementById(`details-row-${id}`);

        // Alternar visibilidad
        if (detailsRow.classList.contains('d-none')) {
            detailsRow.classList.remove('d-none');
        } else {
            detailsRow.classList.add('d-none');
        }
    }

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
        // Establecer el nombre del cliente en el modal
        document.getElementById('NameDeleteModal').textContent = Name;

        // Mostrar el modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();

        // Cuando el usuario haga clic en "Eliminar", eliminar el elemento
        document.getElementById('confirmDeleteBtn').onclick = function () {
            deleteCliente(id, loadClientes);
            deleteModal.hide(); // Ocultar el modal
        };
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteCliente(id, callback) {
        fetch(`${apiUrl}/delete/${id}`,
            { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                } else {
                    showErrorToast(data.error || 'Error al eliminar el cliente.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar cliente:', error);
                showErrorToast(data.error || 'Error en la conexión con el servidor.');
            });
    }
});
