function formatPrice(price) {
    return price.toLocaleString('es-PY');  // 'es-PY' para formato de Paraguay
}

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
        text: 'Estamos obteniendo los datos de las canchas.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const canchasList = document.getElementById('canchas-list');

    const imagenesCanchas = {
        'Cemento': '/images/canchaBasquetbol.jpg',
        'Cesped Natural': '/images/canchaFutbol.jpg',
        'Cesped Sintetico': '/images/canchaFutbol.jpg',
        'Tierra Compactada': '/images/canchaTenis.jpg',
        'default': '/images/canchaFutbol.jpg'
    };

    function getImagenCancha(TIPO_SUELO) {
        return imagenesCanchas[TIPO_SUELO] || imagenesCanchas.default;
    }

    async function loadCanchas() {
        showLoadingAlert();
        try {
            const response = await fetch('/api/canchas');
            const data = await response.json();
            if (data.success !== false) {
                // Ordenar las canchas por número
                data.canchas.sort((a, b) => a.NUMERO - b.NUMERO);
                const canchasHtml = await Promise.all(data.canchas.map(async (cancha) => {
                    const imagen = getImagenCancha(cancha.NOMBRE_TIPO_SUELO);
                    const deportesHtml = await mostrarDeportes(cancha.ID_CANCHA);

                    return `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <span class="status-badge ${cancha.ESTADO === 'D' ? 'bg-success' : 'bg-danger'}">
                                    ${cancha.ESTADO === 'D' ? 'Disponible' : 'No Disponible'}
                                </span>   
                                <img src="${imagen}" 
                                    class="card-img-top" 
                                    alt="Cancha ${cancha.NUMERO}">
                                <div class="card-body">
                                    <h5 class="card-title">Cancha ${cancha.NUMERO}</h5>
                                    <p class="card-text">
                                        <strong>Ubicación:</strong> ${cancha.UBICACION}<br>
                                        <strong>Tipo de suelo:</strong> ${cancha.NOMBRE_TIPO_SUELO}
                                    </p>
                                    <div class="d-grid gap-2">
                                        <button class="btn ${cancha.ESTADO === 'D' ? 'btn-primary' : 'btn-secondary'}" 
                                                onclick="reservarCancha(${cancha.ID_CANCHA})"
                                                ${cancha.ESTADO !== 'D' ? 'disabled' : ''}>
                                            <i class="fas fa-calendar-check"></i> Reservar
                                        </button>
                                        <button class="btn btn-info text-white" onclick="mostrarDetalles(${cancha.ID_CANCHA})">
                                            <i class="fas fa-info-circle"></i> Ver detalles
                                        </button>
                                        <button class="btn btn-warning" onclick="editCancha(${cancha.ID_CANCHA})">
                                            <i class="fas fa-edit"></i> Actualizar
                                        </button>
                                        <button class="btn btn-danger" onclick="confirmDelete(${cancha.ID_CANCHA})">
                                            <i class="fas fa-trash-alt"></i> Eliminar
                                        </button>
                                    </div>
                                </div>
                                <div id="detalles${cancha.ID_CANCHA}" class="card-footer bg-light d-none">
                                    <h6 class="text-primary mb-3">Detalles Adicionales</h6>
                                    <ul class="list-group list-group-flush">
                                        <li class="list-group-item">
                                            <strong>Luminica:</strong> ${cancha.LUMINICA === 'S' ? 'Sí' : 'No'}
                                        </li>
                                        <li class="list-group-item">
                                            <strong>Bebedero:</strong> ${cancha.BEBEDERO === 'S' ? 'Sí' : 'No'}
                                        </li>
                                        <li class="list-group-item">
                                            <strong>Baños:</strong> ${cancha.BANOS === 'S' ? 'Sí' : 'No'}
                                        </li>
                                        <li class="list-group-item">
                                            <strong>Cambiador:</strong> ${cancha.CAMBIADOR === 'S' ? 'Sí' : 'No'}
                                        </li>
                                        <li class="list-group-item">
                                            <strong>Deportes y Precios:</strong><br>
                                            ${deportesHtml}
                                        </li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    `;
                }));

                canchasList.innerHTML = canchasHtml.join('');
                Swal.close();
            } else {
                Swal.close();
                showErrorAlert('No se pudieron cargar las canchas.');
            }
        } catch (error) {
            Swal.close();
            console.error('Error:', error);
            showErrorAlert('Error al obtener los datos de las canchas.');
        }
    }

    async function mostrarDeportes(idCancha) {
        try {
            const response = await fetch(`/canchadeporte/cancha/${idCancha}`);
            const data = await response.json();

            if (data.success) {
                return data.canchaDeportes.map(deporte => {
                    return `<strong>${deporte.DEPORTE}:</strong> Precio por hora: Gs. ${formatPrice(deporte.PRECIO_HORA)}<br>`;
                }).join('');
            } else {
                return 'No hay deportes disponibles para esta cancha.';
            }
        } catch (error) {
            console.error('Error:', error);
            return 'Error al obtener los deportes de la cancha.';
        }
    }

    window.reservarCancha = function (id) {
        window.location.href = `/add_reserva?cancha=${id}`;
    };

    window.editCancha = function (id) {
        window.location.href = `/upd_cancha?id=${id}`;
    };

    window.mostrarDetalles = function (id) {
        const detalles = document.getElementById(`detalles${id}`);
        if (detalles) {
            detalles.classList.toggle("d-none");
        } else {
            console.error(`No se encontró el elemento con id detalles${id}`);
        }
    };

    window.confirmDelete = function (id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la cancha de forma permanente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                eliminarCancha(id);
            }
        });
    };

    window.eliminarCancha = function (id) {
        fetch(`/api/canchas/delete/${id}`, {
            method: 'DELETE'
        })
            .then(response => {
                if (!response.ok) {
                    throw new Error('Error en la solicitud DELETE');
                }
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'Cancha eliminada exitosamente.',
                        confirmButtonText: 'Aceptar'
                    });
                    loadCanchas(); // Recargar la lista de canchas
                } else {
                    showErrorAlert(data.error || 'Error al eliminar la cancha.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorAlert('Error en la conexión con el servidor.');
            });
    };

    loadCanchas();
});
