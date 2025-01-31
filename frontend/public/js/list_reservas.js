
// Función para mostrar alertas de error
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
        text: 'Estamos obteniendo los datos de las reservas.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}


// Función para mostrar un mensaje de confirmación antes de activar la promoción
function confirmarActivarPromocion() {
    Swal.fire({
        title: "¿Activar promoción?",
        text: "Esta acción activará la promoción para todos los clientes elegibles.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#28a745", // Verde
        cancelButtonColor: "#6c757d", // Gris
        confirmButtonText: "Sí, activar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            activarPromocion();
        }
    });
}

// Función para mostrar un mensaje de confirmación antes de desactivar la promoción
function confirmarDesactivarPromocion() {
    Swal.fire({
        title: "¿Desactivar promoción?",
        text: "Esta acción desactivará la promoción.",
        icon: "warning",
        showCancelButton: true,
        confirmButtonColor: "#dc3545", // Rojo
        cancelButtonColor: "#6c757d", // Gris
        confirmButtonText: "Sí, desactivar",
        cancelButtonText: "Cancelar"
    }).then((result) => {
        if (result.isConfirmed) {
            desactivarPromocion();
        }
    });
}

// Función para enviar una solicitud al backend y activar la promoción
function activarPromocion() {
    fetch("/promociones/activar", { method: "GET", headers: { "Content-Type": "application/json" } })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar alerta de éxito
                Swal.fire({
                    title: "¡Promoción activada!",
                    text: "La promoción ha sido activada con éxito.",
                    icon: "success"
                });
            } else {
                // Mostrar error si la activación falla
                showErrorAlert(data.error || "Hubo un problema al activar la promoción.");
            }
        })
        .catch(() => {
            // Mostrar error si hay un problema de conexión
            showErrorAlert("No se pudo conectar con el servidor.");
        });
}

// Función para enviar una solicitud al backend y desactivar la promoción
function desactivarPromocion() {
    fetch("/promociones/desactivar", { method: "GET", headers: { "Content-Type": "application/json" } })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                // Mostrar alerta de éxito
                Swal.fire({
                    title: "¡Promoción desactivada!",
                    text: "La promoción ha sido desactivada con éxito.",
                    icon: "success"
                });
            } else {
                // Mostrar error si la desactivación falla
                showErrorAlert(data.error || "Hubo un problema al desactivar la promoción.");
            }
        })
        .catch(() => {
            // Mostrar error si hay un problema de conexión
            showErrorAlert("No se pudo conectar con el servidor.");
        });
}


document.addEventListener('DOMContentLoaded', function () {
    const apiUrl = '/reservas'; // URL base para los endpoints
    const reservasList = document.getElementById('reservas-list');
    const searchField = document.getElementById('searchField');
    let reservas = []; // Array global para los datos de reservas
    let sortDirection = [];

    // Función para obtener datos de la API
    function fetchData() {
        showLoadingAlert(); // Mostrar el spinner de carga antes de la petición
        fetch(apiUrl, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
                Swal.close(); // Cerrar la alerta de carga cuando se obtiene la respuesta
                if (data.success === false) {
                    showErrorAlert(data.error || 'Error desconocido.');
                } else {
                    reservas = data.reservas || [];
                    renderReservas(reservas);
                }
            })
            .catch(error => {
                Swal.close(); // Cerrar la alerta de carga en caso de error
                showErrorAlert(error || 'Error al cargar las reservas.');
            });
    }

    // Función para renderizar la tabla
    function renderReservas(reservas) {
        console.log(reservas);
        reservasList.innerHTML = reservas.map(reserva => `
            <tr id="reserva-row-${reserva.ID_RESERVA}">
                <th>${reserva.ID_RESERVA}</th>
                <td>${reserva.NOMBRE_CLIENTE} ${reserva.APELLIDO_CLIENTE} ${reserva.DOCUMENTO_CLIENTE}</td>
                <td>${reserva.NUMERO_CANCHA}</td>
                <td>${reserva.FECHA_INICIO}</td>
                <td>${reserva.FECHA_FIN}</td>
                <td>${reserva.HORA_INICIO}</td>
                <td>${reserva.HORA_FIN}</td>
                <td>${reserva.ESTADO_RESERVA === 'A' ? 'Activo' : reserva.ESTADO_RESERVA === 'P' ? 'Pendiente' : 'Finalizado'}</td>
                <td>${reserva.FECHA_LIMITE_CANCELACION}</td>
                <td>${reserva.ESTADO_CANCELACION === 'S' ? 'Cancelado' : 'Pago pendiente'}</td>
                <td>${reserva.PORCENTAJE_PROMOCION}%</td>
                <td>${reserva.REEMBOLSABLE === 'S' ? 'Si' : (reserva.REEMBOLSABLE === 'N' ? 'No' : 'N/A')}</td>
                <td>
                    <div class="d-flex gap-2">
                        <button class="btn btn-warning bi bi-pencil" onclick="editReserva(${reserva.ID_RESERVA})" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Editar"></button>
                        <button class="btn btn-danger bi bi-trash" onclick="confirmDelete(${reserva.ID_RESERVA}, '${reserva.NOMBRE_CLIENTE + ' ' + reserva.APELLIDO_CLIENTE}')" data-bs-toggle="tooltip" data-bs-placement="top" data-bs-title="Eleminar"></button>
                        ${reserva.ESTADO_RESERVA === 'P' ? `<button class="btn btn-success" onclick="confirmReserva(${reserva.ID_RESERVA})">Confirmar</button>` : ''}

                    </div>
                </td>
            </tr>
        `).join('');
        const tooltipTriggerList = document.querySelectorAll('[data-bs-toggle="tooltip"]')
        const tooltipList = [...tooltipTriggerList].map(tooltipTriggerEl => new bootstrap.Tooltip(tooltipTriggerEl))
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
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    }

    window.confirmReserva = function (id) {
        fetch(`${apiUrl}/confirm/${id}`, { method: 'PUT' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    fetchData();
                    Swal.fire('Confirmado!', 'La reserva ha sido confirmada.', 'success');
                    console.log(data.reserva); // Verifica aquí el contenido de `reserva`
                    sendEmail(data.reserva);
                } else {
                    showErrorAlert(data.error || 'Error al confirmar la reserva.');
                }
            })
            .catch(error => {
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    };

    // Función para enviar un correo electrónico utilizando EmailJS
    function sendEmail(reserva) {
        console.log("reserva", reserva);
        emailjs.init('RloVlsEjuRN3Mdixa'); // user id de emailjs
        const templateParams = {
            to_name: reserva.NOMBRE_CLIENTE,
            to_email: reserva.EMAIL_CLIENTE,
            message: `Detalles de la reserva:\nFecha: ${reserva.FECHA_INICIO} - ${reserva.FECHA_FIN}\nHora: ${reserva.HORA_INICIO} - ${reserva.HORA_FIN}`
        };

        emailjs.send('service_tu7zeyh', 'template_3u6kqap', templateParams)
            .then(response => {
                console.log('Correo enviado exitosamente:', response.status, response.text);
            })
            .catch(error => {
                console.error('Error al enviar el correo:', error);
            });
    }

    // Cargar datos al inicio
    fetchData();
});