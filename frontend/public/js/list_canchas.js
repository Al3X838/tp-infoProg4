document.addEventListener('DOMContentLoaded', function () {
    const canchasList = document.getElementById('canchas-list');
    
    const imagenesCanchas = {
        'Cemento': '/images/canchaBasquetbol.jpg',
        'Cesped Natural': '/images/canchaFutbol.jpg',
        'Cesped Sintetico': '/images/canchaFutbol.jpg',
        'default': '/images/canchaDefault.jpg'
    };

    function getImagenCancha(TIPO_SUELO) {
        return imagenesCanchas[TIPO_SUELO] || imagenesCanchas.default;
    }

    function loadCanchas() {
        fetch('/api/canchas')
            .then(response => response.json())
            .then(data => {
                if (data.success !== false) {
                    canchasList.innerHTML = data.canchas.map(cancha => {
                        const imagen = getImagenCancha(cancha.NOMBRE_TIPO_SUELO);
                        console.log(imagen);
                        return`
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
                                        <strong>Tipo:</strong> ${cancha.NOMBRE_TIPO_SUELO}
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
                                    <small>
                                        <strong>Tipo de Suelo:</strong> ${cancha.NOMBRE_TIPO_SUELO}<br>
                                        ${cancha.LUMINICA === 'S' ? '<strong>Luminica:</strong> Sí<br>' : '<strong>Luminica:</strong> No<br>'}
                                        ${cancha.BEBEDERO === 'S' ? '<strong>Bebedero:</strong> Sí<br>' : '<strong>Bebedero:</strong> No<br>'}
                                        ${cancha.BANOS === 'S' ? '<strong>Baños:</strong> Sí<br>' : '<strong>Baños:</strong> No<br>'}
                                        ${cancha.CAMBIADOR === 'S' ? '<strong>Cambiador:</strong> Sí<br>' : '<strong>Cambiador:</strong> No<br>'}
                                    </small>
                                </div>
                            </div>
                        </div>
                    `}).join('');
                } else {
                    document.getElementById('error-message').textContent = data.error || 'Error al cargar canchas';
                    document.getElementById('error-message').classList.remove('d-none');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                document.getElementById('error-message').textContent = 'Error en la conexión con el servidor';
                document.getElementById('error-message').classList.remove('d-none');
            });
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
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: data.error || 'Error al eliminar la cancha.',
                    confirmButtonText: 'Aceptar'
                });
            }
        })
        .catch(error => {
            console.error('Error:', error);
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Error en la conexión con el servidor.',
                confirmButtonText: 'Aceptar'
            });
        });
    };

    loadCanchas();
});