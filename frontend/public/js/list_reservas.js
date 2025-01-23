document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/reservas'; // URL base para los endpoints
    const reservasList = document.getElementById('reservas-list');
    const searchField = document.getElementById('searchField');
    let reservas = []; // Array global para los datos de reservas
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                if (data.success === false) {
                    showErrorAlert(data.error || 'Error desconocido.');
                } else {
                    reservas = data.reservas || [];
                    renderReservas(reservas);
                }
            })
            .catch(error => {
                showErrorAlert(error || 'Error al cargar las reservas.');
            });
    }

    // Función para renderizar la tabla
    function renderReservas(reservas) {
        console.log(reservas);
        reservasList.innerHTML = reservas.map(reserva =>`
            <tr id="reserva-row-${reserva.ID_RESERVA}">
                <th>${reserva.ID_RESERVA}</th>
                <td>${reserva.NOMBRE_CLIENTE} ${reserva.APELLIDO_CLIENTE}</td>
                <td>${reserva.NUMERO_CANCHA}</td>
                <td>${reserva.FECHA_INICIO}</td>
                <td>${reserva.FECHA_FIN}</td>
                <td>${reserva.HORA_INICIO}</td>
                <td>${reserva.HORA_FIN}</td>
                <td>${reserva.ESTADO_RESERVA === 'A' ? 'Activo' : reserva.ESTADO_RESERVA === 'P' ? 'Pendiente' : 'Finalizado'}</td>
                <td>${reserva.FECHA_LIMITE_CANCELACION}</td>
                <td>${reserva.ESTADO_CANCELACION === 'S' ? 'Cancelado' : 'Pago pendiente'}</td>
                <td>${reserva.PORCENTAJE_PROMOCION}%</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning bi bi-pencil" onclick="editReserva(${reserva.ID_RESERVA})"></button>
                        <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${reserva.ID_RESERVA})"></button>
                    </div>
                </td>
            </tr>
        `).join('');
    }

    // Función para filtrar las reservas
    window.filterReservas = function () {
        const searchTerm = searchField.value.toLowerCase();
        const filteredReservas = reservas.filter(reserva => {
            return Object.values(reserva).some(value =>
                value.toString().toLowerCase().includes(searchTerm)
            );
        });
        renderReservas(filteredReservas);
    };

    // Función para ordenar la tabla
    window.sortTable = function (columnIndex) {
        if (!sortDirection[columnIndex]) {
            sortDirection[columnIndex] = "ASC";
        }
        const direction = sortDirection[columnIndex];
        const sortedReservas = [...reservas].sort((a, b) => {
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
        renderReservas(sortedReservas);
    };

    // Función para editar una reserva
    window.editReserva = function (id) {
        window.location.href = `/upd_reserva?id=${id}`;
    };

    // Función para confirmar y eliminar una reserva
    window.confirmDelete = function (id, details) {
        Swal.fire({
            title: `¿Estás seguro de eliminar la reserva de ${details}?`,
            text: "¡Esta acción no se puede deshacer!",
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                deleteReserva(id, fetchData);
            }
        });
    };

    // Función para enviar la solicitud DELETE al servidor
    function deleteReserva(id, callback) {
        fetch(`${apiUrl}/delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    callback();
                    Swal.fire('Eliminado!', 'La reserva ha sido eliminada.', 'success');
                } else {
                    showErrorAlert(data.error || 'Error al eliminar la reserva.');
                }
            })
            .catch(error => {
                showErrorAlert('Error en la conexión con el servidor.');
            });
    }

    // Función para mostrar alertas de error
    function showErrorAlert(message) {
        Swal.fire({
            icon: 'error',
            title: 'Error',
            text: message,
            confirmButtonText: 'Aceptar'
        });
    }

    // Cargar datos al inicio
    fetchData();
});