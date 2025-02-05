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
        text: 'Estamos obteniendo los deportes.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/deportes'; // URL base para los endpoints
    const clientsList = document.getElementById('deportes-list');
    let deportes = []; // Array global para los datos de los tipos de suelo
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        showLoadingAlert(); // Mostrar el loading alert
        return fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cerrar el loading alert
                deportes = data.deportes || []; // Guardar datos en el array global
            })
            .catch(error => {
                Swal.close(); // Cerrar el loading alert en caso de error
                showErrorAlert(error || 'Error al cargar los tipos de suelos.');
            });
    }

    // Función para renderizar la tabla
    function renderDeportes(deportes) {
        clientsList.innerHTML = deportes.map(deporte => `
            <tr>
                <th>${deporte.ID_DEPORTE}</th>
                <td>${deporte.NOMBRE || 'N/A'}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-warning bi bi-pencil" onclick="editDeporte(${deporte.ID_DEPORTE})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${deporte.ID_DEPORTE}, '${(deporte.NOMBRE)}')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eleminar"></button>
                  </div>
                </td>
            </tr>
        `).join('');
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    }

    // Función para ordenar la tabla
    window.sortTable = function (columnIndex) {
        if (!sortDirection[columnIndex]) {
            sortDirection[columnIndex] = "ASC";
        }

        const direction = sortDirection[columnIndex];
        const sortedDeportess = [...deportes].sort((a, b) => {
            const key = Object.keys(a)[columnIndex];
            const valueA = a[key];
            const valueB = b[key];

            if (typeof valueA === "number" && typeof valueB === "number") {
                return direction === "ASC" ? valueA - valueB : valueB - valueA;
            } else {
                return direction === "ASC"
                    ? valueA.toString().localeCompare(valueB.toString())
                    : valueB.toString().localeCompare(valueA.toString());
            }
        });

        sortDirection[columnIndex] = direction === "ASC" ? "DESC" : "ASC";
        renderDeportes(sortedDeportess);
    };

    // Función para filtrar los tipos de suelo según el término de búsqueda
    window.filterDeportes = function () {
        const searchValue = document.getElementById("searchField").value.toLowerCase();
        const filteredDeportes = deportes.filter((deportes) =>
            Object.values(deportes).join(" ").toLowerCase().includes(searchValue)
        );
        renderDeportes(filteredDeportes);
    };

    // Función para cargar y renderizar los datos
    function loadDeportes() {
        fetchData().then(() => {
            renderDeportes(deportes);
        });
    }

    // Cargar tabla
    loadDeportes();

    window.editDeporte = function (id) {
        window.location.href = `../upd_deporte?id=${id}`;
    };

    // Función para confirmar y eliminar un item
    window.confirmDelete = function (id, Name) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el deporte "${Name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteDeporte(id, loadDeportes);
            }
        });
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteDeporte(id, callback) {
        showLoadingAlert(); // Mostrar el loading alert
        fetch(`${apiUrl}/delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cerrar el loading alert
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                    Swal.fire({
                        icon: 'success',
                        title: 'Eliminado',
                        text: 'El deporte ha sido eliminado correctamente.',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    showErrorAlert(data.error || 'Error al eliminar el Deporte.');
                }
            })
            .catch(error => {
                Swal.close(); // Cerrar el loading alert
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    }
});

