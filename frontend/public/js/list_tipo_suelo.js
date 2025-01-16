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
    const apiUrl = '/tiposuelos'; // URL base para los endpoints
    const clientsList = document.getElementById('tiposuelos-list');
    let tiposuelos = []; // Array global para los datos de los tipos de suelo
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        return fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                tiposuelos = data.tiposuelos || []; // Guardar datos en el array global
            })
            .catch(error => {
                showErrorToast(error || 'Error al cargar los tipos de suelos.');
            });
    }

    // Función para renderizar la tabla
    function renderTipoSuelos(tiposuelos) {
        clientsList.innerHTML = tiposuelos.map(tiposuelos => `
            <tr id="tiposuelo-row-${tiposuelos.ID_TIPO_SUELO}">
                <th>${tiposuelos.ID_TIPO_SUELO}</th>
                <td>${tiposuelos.NOMBRE || 'N/A'}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info bi bi-info-circle" onclick='toggleDetails(${tiposuelos.ID_TIPO_SUELO})'></button>
                    <button class="btn btn-warning bi bi-pencil" onclick="edittiposuelo(${tiposuelos.ID_TIPO_SUELO})"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${tiposuelos.ID_TIPO_SUELO}, '${(tiposuelos.NOMBRE)}')"></button>
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

        // Ordenar los tipos de Suelo
        const sortedTipoSuelos = [...tiposuelos].sort((a, b) => {
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
        renderTipoSuelos(sortedTipoSuelos);
    };


    // Función para filtrar los tipo de suelo según el término de búsqueda
    window.filterTipoSuelos = function () {
        const searchValue = document.getElementById("searchField").value.toLowerCase();
        const filterTipoSuelos = tiposuelos.filter((tiposuelos) =>
            Object.values(tiposuelos).join(" ").toLowerCase().includes(searchValue)
        );
        renderTipoSuelos(sortedTipoSuelos);
    }

    // Función para cargar y renderizar los datos
    function loadTipoSuelos() {
        fetchData().then(() => {
            renderTipoSuelos(sortedTipoSuelos);
        });
    }

    // Cargar tabla
    loadTipoSuelos();

    window.editTipoSuelo = function (id) {
        window.location.href = `../upd_tipo_suelo?id=${id}`;
    };

    // Función para confirmar y eliminar un Tipo de Suelo
    window.confirmDelete = function (id, Name) {
        // Establecer el nombre del Tipo de Suelo en el modal
        document.getElementById('NameDeleteModal').textContent = Name;

        // Mostrar el modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();

        // Cuando el usuario haga clic en "Eliminar", eliminar el elemento
        document.getElementById('confirmDeleteBtn').onclick = function () {
            deleteTipoSuelo(id, loadTipoSuelos);
            deleteModal.hide(); // Ocultar el modal
        };
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteTipoSuelo(id, callback) {
        fetch(`${apiUrl}/delete/${id}`,
            { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                } else {
                    showErrorToast(data.error || 'Error al eliminar el Tipo De Suelo.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar el Tipo De Suelo:', error);
                showErrorToast(data.error || 'Error en la conexión con el servidor.');
            });
    }
});
