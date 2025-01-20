document.addEventListener('DOMContentLoaded', function () {
    const canchasList = document.getElementById('canchas-list');
    
    const imagenesCanchas ={
        'FUOL': '/images/canchaFuol.jpg',
        'FUTSAL' : '/images/canchaFutsal.jpg',
        'default': '/images/canchaDefault.jpg'
    }

    // sin terminar. agregar tipoCancha maybe
    function getImagenCancha(TIPO_SUELO) {
        return imagenesCanchas[TIPO_SUELO] || imagenesCanchas.default;
    }

    function loadCanchas() {
        fetch('/api/canchas')
            .then(response => response.json())
            .then(data => {
                if (data.success !== false) {
                    canchasList.innerHTML = data.canchas.map(cancha => `
                        <div class="col-md-4 mb-4">
                            <div class="card">
                                <span class="status-badge ${cancha.ESTADO === 'D' ? 'bg-success' : 'bg-danger'}">
                                    ${cancha.ESTADO === 'D' ? 'Disponible' : 'No Disponible'}
                                </span>   
                                <img src="/images/canchaFuol.jpg" 
                                     class="card-img-top" 
                                     alt="Cancha ${cancha.NUMERO}">
                                <div class="card-body">
                                    <h5 class="card-title">Cancha ${cancha.NUMERO}</h5>
                                    <p class="card-text">
                                        <strong>Ubicación:</strong> ${cancha.UBICACION}<br>
                                        <strong>Tipo:</strong> ${cancha.NOMBRE_TIPO_SUELO}
                                    </p>
                                    <div class="d-grid gap-2">
                                        <!-- Solo este botón cambia según el estado -->
                                        <button class="btn ${cancha.ESTADO === 'D' ? 'btn-primary' : 'btn-secondary'}" 
                                                onclick="reservarCancha(${cancha.ID_CANCHA})"
                                                ${cancha.ESTADO !== 'D' ? 'disabled' : ''}>
                                            <i class="fas fa-calendar-check"></i> Reservar
                                        </button>
                                        <!-- Estos botones mantienen su estilo original -->
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
                            </div>
                        </div>
                    `).join('');
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
    window.editCancha = function (id) {
        window.location.href = `/upd_cancha?id=${id}`;
    };

    window.mostrarDetalles = function(id) {
        const detalles = document.getElementById(`detalles${id}`);
        detalles.classList.toggle('d-none');
    };

    window.confirmDelete = function (id) {
        Swal.fire({
            title: '¿Estás seguro?',
            text: 'Esta acción eliminará la Cancha de forma permanente.',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#3085d6',
            cancelButtonColor: '#d33',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar'
        }).then((result) => {
            if (result.isConfirmed) {
                deleteCancha(id, loadCanchas);
            }
        });
    };

    function deleteCancha(id, callback) {
        fetch(`/api/canchas/delete/${id}`, { method: 'DELETE' })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El Cancha fue eliminado exitosamente.',
                        confirmButtonText: 'Aceptar'
                    });
                    callback(); // Recarga la lista de Canchas
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'Error al eliminar el Cancha.',
                        confirmButtonText: 'Aceptar'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error en la conexión con el servidor.',
                    confirmButtonText: 'Aceptar'
                });
                console.error('Error al eliminar el Cancha:', error);
            });
    }



    loadCanchas();
});