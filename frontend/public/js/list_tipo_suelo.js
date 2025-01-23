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
        text: 'Estamos obteniendo los datos de tipo suelo.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/tiposuelos'; // URL base para los endpoints
    const clientsList = document.getElementById('tiposuelos-list');
    let tiposuelos = []; // Array global para los datos de los tipos de suelo
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        showLoadingAlert(); // Mostrar el loading alert
        return fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cerrar el loading alert
                tiposuelos = data.tiposuelos || []; // Guardar datos en el array global
            })
            .catch(error => {
                Swal.close(); // Cerrar el loading alert en caso de error
                showErrorAlert(error || 'Error al cargar los tipos de suelos.');
            });
    }

    // Función para renderizar la tabla
    function renderTipoSuelos(tiposuelos) {
        clientsList.innerHTML = tiposuelos.map(tiposuelos => `
            <tr>
                <th>${tiposuelos.ID_TIPO_SUELO}</th>
                <td>${tiposuelos.NOMBRE || 'N/A'}</td>
                <td>
                  <div class="d-flex gap-2">
                    <button class="btn btn-warning bi bi-pencil" onclick="editTipoSuelo(${tiposuelos.ID_TIPO_SUELO})"></button>
                    <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${tiposuelos.ID_TIPO_SUELO}, '${(tiposuelos.NOMBRE)}')"></button>
                  </div>
                </td>
            </tr>
        `).join('');
    }

    // Función para ordenar la tabla
    window.sortTable = function (columnIndex) {
        if (!sortDirection[columnIndex]) {
            sortDirection[columnIndex] = "ASC";
        }

        const direction = sortDirection[columnIndex];
        const sortedTipoSuelos = [...tiposuelos].sort((a, b) => {
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
        renderTipoSuelos(sortedTipoSuelos);
    };

    // Función para filtrar los tipos de suelo según el término de búsqueda
    window.filterTipoSuelos = function () {
        const searchValue = document.getElementById("searchField").value.toLowerCase();
        const filteredTipoSuelos = tiposuelos.filter((tiposuelos) =>
            Object.values(tiposuelos).join(" ").toLowerCase().includes(searchValue)
        );
        renderTipoSuelos(filteredTipoSuelos);
    };

    // Función para cargar y renderizar los datos
    function loadTipoSuelos() {
        fetchData().then(() => {
            renderTipoSuelos(tiposuelos);
        });
    }

    // Cargar tabla
    loadTipoSuelos();

    window.editTipoSuelo = function (id) {
        window.location.href = `../upd_tipo_suelo?id=${id}`;
    };

    // Función para confirmar y eliminar un Tipo de Suelo
    window.confirmDelete = function (id, Name) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas eliminar el tipo de suelo "${Name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteTipoSuelo(id, loadTipoSuelos);
            }
        });
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteTipoSuelo(id, callback) {
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
                        text: 'El tipo de suelo ha sido eliminado correctamente.',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    showErrorAlert(data.error || 'Error al eliminar el Tipo De Suelo.');
                }
            })
            .catch(error => {
                Swal.close(); // Cerrar el loading alert
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    }
});

