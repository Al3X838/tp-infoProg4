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
                            <div class="card ${cancha.ESTADO !== 'D' ? 'no-disponible' : ''}">
                                <span class="status-badge ${cancha.ESTADO === 'D' ? 'bg-success' : 'bg-danger'}">
                                    ${cancha.ESTADO === 'D' ? 'Disponible' : 'No Disponible'}
                                </span>   
                                <img src="/images/canchaFuol.jpg alt="cancha"" 
                                     class="card-img-top" 
                                     alt="Cancha ${cancha.NUMERO}"
                                     onerror="this.src='/images/canchaFuol.jpg'">
                                <div class="card-body">
                                    <h5 class="card-title">Cancha ${cancha.NUMERO}</h5>
                                    <p class="card-text">
                                        <strong>Ubicación:</strong> ${cancha.UBICACION}<br>
                                        <strong>Tipo:</strong> ${cancha.TIPO_SUELO}
                                    </p>
                                    <div class="d-grid gap-2">
                                        ${cancha.ESTADO === 'D' 
                                            ? `<button class="btn btn-primary" onclick="reservarCancha(${cancha.ID_CANCHA})">
                                                <i class="fas fa-calendar-check"></i> Reservar
                                               </button>`
                                            : `<button class="btn btn-secondary" disabled>
                                                <i class="fas fa-times-circle"></i> No Disponible
                                               </button>`
                                        }
                                        <button class="btn btn-info text-white" onclick="mostrarDetalles(${cancha.ID_CANCHA})">
                                            <i class="fas fa-info-circle"></i> Ver detalles
                                        </button>
                                    </div>
                                </div>
                                <div id="detalles${cancha.ID_CANCHA}" class="card-footer bg-light d-none">
                                    <small>
                                        <strong>ID:</strong> ${cancha.ID_CANCHA}<br>
                                        <strong>Número:</strong> ${cancha.NUMERO}<br>
                                        <strong>Tipo de Suelo:</strong> ${cancha.TIPO_SUELO}
                                    </small>
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

    window.mostrarDetalles = function(id) {
        const detalles = document.getElementById(`detalles${id}`);
        detalles.classList.toggle('d-none');
    };

    loadCanchas();
});