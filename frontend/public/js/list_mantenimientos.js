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
    const apiUrl = '/mantenimientos';
    const clientsList = document.getElementById('mantenimientos-list');
    const clearFiltersBtn = document.getElementById('clearFilters');
    let mantenimientos = [];
    let canchas = [];
    let sortColumn = null;
    let sortDirection = "ASC";

    const canchaFilter = document.getElementById('canchaFilter');
    const fechaFilter = document.getElementById('fechaFilter');

    function fetchData() {
        const fetchMantenimientos = fetch(apiUrl, { method: 'GET' })
            .then(response => {
                showLoadingAlert();
                return response.json();
            })
            .then(data => {
                Swal.close();
                if (data.success === false) {
                    showErrorAlert(data.error || 'Error desconocido.');
                } else {
                    mantenimientos = data.mantenimientos || [];
                }
            })
            .catch(error => {
                showErrorAlert(error || 'Error al cargar los mantenimientos.');
            });

        const fetchCanchas = fetch('/api/canchas', { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                canchas = data.canchas || [];
                populateCanchaFilter();
            })
            .catch(error => {
                showErrorAlert(error || 'Error al cargar las canchas.');
            });

        return Promise.all([fetchMantenimientos, fetchCanchas]);
    }

    function renderMantenimientos() {
        let filteredMantenimientos = mantenimientos.filter(mantenimiento => {
            const canchaMatch = !canchaFilter.value || mantenimiento.NUMERO_CANCHA == canchaFilter.value;
            const fechaMatch = !fechaFilter.value || mantenimiento.FECHA_INICIO === fechaFilter.value;
            return canchaMatch && fechaMatch;
        });

        if (sortColumn !== null) {
            filteredMantenimientos.sort((a, b) => {
                const valueA = a[sortColumn] ?? '';
                const valueB = b[sortColumn] ?? '';


                if (typeof valueA === "number" && typeof valueB === "number") {
                    return sortDirection === "ASC" ? valueA - valueB : valueB - valueA;
                } else {
                    return sortDirection === "ASC"
                        ? valueA.toString().localeCompare(valueB.toString())
                        : valueB.toString().localeCompare(valueA.toString());
                }
            });
        }


        clientsList.innerHTML = filteredMantenimientos.map(mantenimiento => `
            <tr id="mantenimiento-row-${mantenimiento.ID_mantenimiento}">
                <th>${mantenimiento.ID_MANTENIMIENTO}</th>
                <td>${mantenimiento.NUMERO_CANCHA || 'N/A'}</td>
                <td>${mantenimiento.FECHA_INICIO || 'N/A'}</td>
                <td>${mantenimiento.HORA_INICIO || 'N/A'}</td>
                <td>${mantenimiento.FECHA_FIN || 'N/A'}</td>
                <td>${mantenimiento.HORA_FIN || 'N/A'}</td>
                <td class="text-center">${mantenimiento.ESTADO === 'P' ? "En proceso" : "Finalizado"}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-info bi bi-info-circle" onclick='toggleDetails(${mantenimiento.ID_MANTENIMIENTO})' data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Detalles"></button>
                    <button class="btn btn-warning bi bi-pencil" onclick="editMantenimiento(${mantenimiento.ID_MANTENIMIENTO})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${mantenimiento.ID_MANTENIMIENTO}, 'Cancha: ${mantenimiento.ID_CANCHA}, Fecha inicio: ${mantenimiento.FECHA_INICIO}, ${mantenimiento.HORA_INICIO}')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eleminar"></button>
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
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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

    window.sortTable = function (columnIndex) {
        const columnKeys = ["ID_MANTENIMIENTO", "NUMERO_CANCHA", "FECHA_INICIO", "HORA_INICIO", "FECHA_FIN", "HORA_FIN", "ESTADO"];
        sortColumn = columnKeys[columnIndex];
        sortDirection = sortDirection === "ASC" ? "DESC" : "ASC";
        renderMantenimientos();
    };

    function populateCanchaFilter() {
        canchaFilter.innerHTML = `<option value="">Todas</option>` +
            canchas.map(cancha => `<option value="${cancha.NUMERO}">Cancha ${cancha.NUMERO}</option>`).join('');
    }

    function updateClearFiltersButton() {
        clearFiltersBtn.classList.toggle('btn-danger', canchaFilter.value || fechaFilter.value);
        clearFiltersBtn.classList.toggle('btn-secondary', !canchaFilter.value && !fechaFilter.value);
    }

    window.applyFilters = function () {
        renderMantenimientos();
        updateClearFiltersButton();
    }

    window.clearFilters = function () {
        canchaFilter.value = '';
        fechaFilter.value = '';
        applyFilters();
    };

    canchaFilter.addEventListener('change', applyFilters);
    fechaFilter.addEventListener('change', applyFilters);

    function loadMantenimientos() {
        fetchData().then(() => {
            renderMantenimientos();
        });
    }

    loadMantenimientos();

    window.editMantenimiento = function (id) {
        window.location.href = `../upd_mantenimiento?id=${id}`;
    };

    // Función para confirmar y eliminar un mantenimiento
    window.confirmDelete = function (id, Name) {
        // Usar SweetAlert para confirmación de eliminación
        Swal.fire({
            title: `¿Estás seguro de eliminar el mantenimiento de ${Name}?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteMantenimientos(id, loadMantenimientos);
            }
        });
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteMantenimientos(id, callback) {
        fetch(`${apiUrl}/delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                    Swal.fire('Eliminado!', 'El mantenimiento ha sido eliminado.', 'success');
                } else {
                    showErrorAlert(data.error || 'Error al eliminar el mantenimiento.');
                }
            })
            .catch(error => {
                console.error('Error al eliminar mantenimiento:', error);
                showErrorAlert('Error en la conexión con el servidor.');
            });
    }
});
