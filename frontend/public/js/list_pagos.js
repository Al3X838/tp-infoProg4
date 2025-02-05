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
        text: 'Estamos obteniendo los pagos.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/pagos'; // URL base para los endpoints
    const pagosList = document.getElementById('pagos-list');
    let pagos = []; // Array global para los datos de pagos
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        showLoadingAlert();

        return fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close();
                if (data.success === false) {
                    showErrorAlert(data.error || 'Error desconocido.');
                } else {
                    pagos = data.pagos || [];
                }
            })
            .catch(error => {
                Swal.close();
                showErrorAlert(error.message || 'Error al cargar los pagos.');
            });
    }

    // Función para renderizar la tabla con secciones por fecha
    function renderPagos(pagos) {
        pagosList.innerHTML = ''; // Limpiar la tabla
        let currentDate = null; // Fecha actual del grupo

        // Ordenar los pagos por fecha de forma descendente
        const sortedPagos = [...pagos].sort((a, b) => new Date(b.FECHA_PAGO) - new Date(a.FECHA_PAGO));

        sortedPagos.forEach(pago => {
            const pagoDate = new Date(pago.FECHA_PAGO).toLocaleDateString();

            // Crear un encabezado para cada nueva fecha
            if (currentDate !== pagoDate) {
                currentDate = pagoDate;
                pagosList.innerHTML += `
                <tr class="table-secondary">
                    <td colspan="7" class="text-center fw-bolder">${currentDate}</td>
                </tr>
            `;
            }

            // Agregar los datos del pago a la tabla
            pagosList.innerHTML += `
            <tr id="pago-row-${pago.ID_PAGO}">
                <th>${pago.ID_PAGO}</th>
                <td>${pago.ID_RESERVA}</td>
                <td>${pago.CLIENTE_NOMBRE} ${pago.CLIENTE_APELLIDO}</td>
                <td>${pago.MONTO_TOTAL || 'N/A'}</td>
                <td>${pago.METODO_PAGO || 'N/A'}</td>
                <td>${new Date(pago.FECHA_PAGO).toLocaleString() || 'N/A'}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning bi bi-pencil" onclick="editPago(${pago.ID_PAGO})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar"></button>
                        <button class="btn btn-success bi bi-arrow-counterclockwise" onclick="confirmDelete(${pago.ID_PAGO}, '${(pago.CLIENTE_NOMBRE + ' ' + pago.CLIENTE_APELLIDO)} ')" ${pago.RESERVA_REEMBOLSABLE === 'S' ? '' : 'disabled'} data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Reembolsar"></button>
                        
                    </div>
                </td>
            </tr>
        `;
        });
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
    }

    // Función para ordenar la tabla
    window.sortTable = function (columnIndex) {
        if (!sortDirection[columnIndex]) {
            sortDirection[columnIndex] = "ASC";
        }
        const direction = sortDirection[columnIndex];
        const sortedPagos = [...pagos].sort((a, b) => {
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
        renderPagos(sortedPagos);
    };

    // Función para cargar y renderizar los datos
    function loadPagos() {
        fetchData().then(() => {
            renderPagos(pagos);
        });
    }

    // Cargar tabla
    loadPagos();

    window.editPago = function (id) {
        window.location.href = `../upd_pago?id=${id}`;
    };

    // Función para confirmar y eliminar un item
    window.confirmDelete = function (id, Name) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: `¿Deseas reembolsar el pago de "${Name}"?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Sí, reembolsar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deletePago(id, loadPagos);
            }
        });
    };

    // Función para enviar la solicitud DELETE al servidor
    function deletePago(id, callback) {
        showLoadingAlert(); // Mostrar el loading alert
        fetch(`${apiUrl}/delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cerrar el loading alert
                if (data.success) {
                    callback(); // Recargar la lista si la eliminación fue exitosa
                    Swal.fire({
                        icon: 'success',
                        title: 'Reembolso exitoso',
                        text: 'El reembolso se ha ejecutado correctamente.',
                        confirmButtonText: 'Aceptar'
                    });
                } else {
                    showErrorAlert(data.error || 'Error al reembolsar el Pago.');
                }
            })
            .catch(error => {
                Swal.close(); // Cerrar el loading alert
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    }
});
