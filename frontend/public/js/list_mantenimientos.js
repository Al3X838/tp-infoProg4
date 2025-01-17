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
    const apiUrl = '/mantenimientos'; // URL base para los endpoints
    const clientsList = document.getElementById('mantenimientos-list');
    const clearFiltersBtn = document.getElementById('clearFilters'); // Botón para limpiar los filtros
    let mantenimientos = []; // Array global para los datos de mantenimientos
    let canchas = []; // Array global para los datos de canchas
    let sortDirection = [];

    const canchaFilter = document.getElementById('canchaFilter'); // Filtro de cancha
    const fechaFilter = document.getElementById('fechaFilter'); // Filtro de fecha

    // Función para obtener datos de la API
    function fetchData() {
        // Fetch para obtener los mantenimientos
        const fetchMantenimientos = fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                mantenimientos = data.mantenimientos || []; // Guardar los mantenimientos en el array global
            })
            .catch(error => {
                showErrorToast(error || 'Error al cargar los mantenimientos.');
            });

        // Fetch para obtener las canchas
        const fetchCanchas = fetch('/api/canchas', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                canchas = data.canchas || []; // Guardar las canchas en el array global
                populateCanchaFilter(); // Llenar el filtro de cancha
            })
            .catch(error => {
                showErrorToast(error || 'Error al cargar las canchas.');
            });

        // Ejecutar ambos fetch en paralelo
        return Promise.all([fetchMantenimientos, fetchCanchas]);
    }


    // Función para renderizar la tabla
    function renderMantenimientos(mantenimientos) {
        clientsList.innerHTML = mantenimientos.map(mantenimiento => `
            <tr id="mantenimiento-row-${mantenimiento.ID_mantenimiento}">
                <th>${mantenimiento.ID_MANTENIMIENTO}</th>
                <td>${mantenimiento.NUMERO_CANCHA || 'N/A'}</td>
                <td>${mantenimiento.FECHA_INICIO || 'N/A'}</td>
                <td>${mantenimiento.HORA_INICIO || 'N/A'}</td>
                <td>${mantenimiento.FECHA_FIN || 'N/A'}</td>
                <td>${mantenimiento.HORA_FIN || 'N/A'}</td>
                <td class="text-center">${mantenimiento.ESTADO}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info bi bi-info-circle" onclick='toggleDetails(${mantenimiento.ID_MANTENIMIENTO})'></button>
                    <button class="btn btn-warning bi bi-pencil" onclick="editMantenimiento(${mantenimiento.ID_MANTENIMIENTO})"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${mantenimiento.ID_MANTENIMIENTO}, '${('Cancha: ' + mantenimiento.ID_CANCHA + ', Fecha inicio: ' + mantenimiento.FECHA_INICIO + ', ' + mantenimiento.HORA_INICIO)}')"></button>
                  </div>
                </td>
              </tr>
            <tr id="details-row-${mantenimiento.ID_MANTENIMIENTO}" class="d-none">
                <td colspan="9">
                    <div class="p-3 border rounded">
                        <ul class="list-unstyled mb-0">
                            <li><strong>Descripcion: </strong> ${mantenimiento.DESCRIPCION || 'N/A'}</li>
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

    // Limpiar filtros
    window.clearFilters = function () {
        canchaFilter.value = '';
        fechaFilter.value = '';
        renderMantenimientos(mantenimientos);
        updateClearFiltersButton();
    };

    // Actualizar el estado del botón "Limpiar Filtros"
    const updateClearFiltersButton = () => {
        clearFiltersBtn.classList.toggle('btn-danger', canchaFilter.value || fechaFilter.value);
        clearFiltersBtn.classList.toggle('btn-secondary', !canchaFilter.value && !fechaFilter.value);
    };

    // Función para ordenar la tabla
    window.sortTable = function (columnIndex) {
        // Inicializar la dirección si aún no está definida
        if (!sortDirection[columnIndex]) {
            sortDirection[columnIndex] = "ASC";
        }

        // Dirección actual
        const direction = sortDirection[columnIndex];

        // Ordenar los mantenimientos
        const sortedMantenimientos = [...mantenimientos].sort((a, b) => {
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
        renderMantenimientos(sortedMantenimientos);
    };

    // Función para llenar el filtro de cancha
    function populateCanchaFilter() {
        console.log(canchas);
        canchaFilter.innerHTML = `
                <option value="">Todas</option>
                ${canchas.map(cancha => `<option value="${cancha.NUMERO}">${cancha.NUMERO}</option>`).join('')}
            `;
    }



    // Función para aplicar los filtros
    function applyFilters() {
        const canchaValue = canchaFilter.value; // Valor seleccionado en el filtro de cancha
        const fechaValue = fechaFilter.value; // Valor seleccionado en el filtro de fecha

        // Filtrar los mantenimientos según los valores seleccionados
        const filteredMantenimientos = mantenimientos.filter(mantenimiento => {
            const canchaMatch = !canchaValue || mantenimiento.NUMERO_CANCHA == canchaValue;
            const fechaMatch = !fechaValue || mantenimiento.FECHA_INICIO === fechaValue;
            return canchaMatch && fechaMatch;
        });

        // Renderizar los mantenimientos filtrados
        renderMantenimientos(filteredMantenimientos);
        updateClearFiltersButton();
    }

    // Escuchar cambios en los filtros
    canchaFilter.addEventListener('change', applyFilters);
    fechaFilter.addEventListener('change', applyFilters);

    // Función para cargar y renderizar los datos
    function loadMantenimientos() {
        fetchData().then(() => {
            renderMantenimientos(mantenimientos);
        });
    }

    // Cargar tabla
    loadMantenimientos();

    window.editMantenimiento = function (id) {
        window.location.href = `../upd_mantenimiento?id=${id}`;
    };

    // Función para confirmar y eliminar un mantenimiento
    window.confirmDelete = function (id, Name) {
        // Establecer el nombre del mantenimiento en el modal
        document.getElementById('NameDeleteModal').textContent = Name;

        // Mostrar el modal
        const deleteModal = new bootstrap.Modal(document.getElementById('deleteModal'));
        deleteModal.show();

        // Cuando el usuario haga clic en "Eliminar", eliminar el elemento
        document.getElementById('confirmDeleteBtn').onclick = function () {
            deleteMantenimientos(id, loadMantenimientos);
            deleteModal.hide(); // Ocultar el modal
        };
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteMantenimientos(id, callback) {
        fetch(`${apiUrl}/delete/${id}`,
            { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                } else {
                    showErrorToast(data.error || 'Error al eliminar el mantenimiento.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar mantenimiento:', error);
                showErrorToast(data.error || 'Error en la conexión con el servidor.');
            });
    }
});
