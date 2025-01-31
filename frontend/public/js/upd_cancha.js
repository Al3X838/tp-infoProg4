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
        text: 'Estamos obteniendo los datos de la cancha.',
        allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
        didOpen: () => {
            Swal.showLoading(); // Muestra el spinner de carga
        }
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-cancha-form');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('id');
    const tablaDeportes = document.getElementById('tablaDeportes').getElementsByTagName('tbody')[0];

    // Método para cargar la lista de tipos de suelo
    const loadTiposSuelo = () => {
        showLoadingAlert();
        return fetch('/tiposuelos')
            .then(response => {
                Swal.close(); // Cierra el popup de carga
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                if (data.success) {
                    const tipoSueloSelect = document.getElementById('tipo_suelo');
                    data.tiposuelos.forEach(tipoSuelo => {
                        const option = document.createElement('option');
                        option.value = tipoSuelo.ID_TIPO_SUELO;
                        option.textContent = tipoSuelo.NOMBRE;
                        tipoSueloSelect.appendChild(option);
                    });
                } else {
                    showErrorAlert(data.error || 'Error al cargar la lista de tipos de suelo.');
                }
            })
            .catch(error => {
                Swal.close(); // Cierra el popup de carga
                console.error('Error al cargar tipos de suelo:', error);
                showErrorAlert('Error al cargar la lista de tipos de suelo.');
            });
    };



    // Cargar datos de la cancha actual
    async function loadData() {
        try {
            // Espera a que los tipos de suelo se carguen
            await loadTiposSuelo();

            if (canchaId) {
                const response = await fetch(`/api/canchas/cancha/${canchaId}`, { method: 'GET' });
                const data = await response.json();

                if (data.success && data.cancha) {
                    document.getElementById('id-cancha').value = data.cancha.ID_CANCHA;
                    document.getElementById('numero').value = data.cancha.NUMERO;
                    document.getElementById('ubicacion').value = data.cancha.UBICACION;
                    document.getElementById('tipo_suelo').value = data.cancha.TIPO_SUELO;
                    document.getElementById('luminica').checked = data.cancha.LUMINICA === 'S';
                    document.getElementById('bebedero').checked = data.cancha.BEBEDERO === 'S';
                    document.getElementById('banos').checked = data.cancha.BANOS === 'S';
                    document.getElementById('cambiador').checked = data.cancha.CAMBIADOR === 'S';
                    document.getElementById('estado').value = data.cancha.ESTADO;
                } else {
                    showErrorAlert(data.error || 'Cancha no encontrada.');
                }
            }
        } catch (error) {
            console.error('Error:', error);
            showErrorAlert('Error al obtener datos de la cancha.');
        }
    }

    // Cargar datos de la cancha
    loadData();


    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // 1. Recopilar datos de la cancha
        const canchaData = {
            NUMERO: document.getElementById('numero').value.trim(),
            UBICACION: document.getElementById('ubicacion').value.trim(),
            TIPO_SUELO: document.getElementById('tipo_suelo').value,
            LUMINICA: document.getElementById('luminica').checked ? 'S' : 'N',
            BEBEDERO: document.getElementById('bebedero').checked ? 'S' : 'N',
            BANOS: document.getElementById('banos').checked ? 'S' : 'N',
            CAMBIADOR: document.getElementById('cambiador').checked ? 'S' : 'N',
            ESTADO: document.getElementById('estado').value
        };

        // 2. Recopilar deportes y precios desde la tabla
        const deportesData = [];
        Array.from(tablaDeportes.rows).forEach(row => {
            const idDeporte = row.cells[0].getElementsByTagName('select')[0].value;
            const precioHora = row.cells[1].getElementsByTagName('input')[0].value.trim();
            const idCanchaDeporte = row.dataset.idCanchaDeporte;

            if (idDeporte && precioHora) {
                deportesData.push({
                    id_cancha_deporte: idCanchaDeporte || null,
                    id_deporte: idDeporte,
                    precio_hora: parseFloat(precioHora)
                });
            }
        });

        // 3. Actualizar los datos de la cancha
        fetch(`/api/canchas/update/${canchaId}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(canchaData)
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Error al actualizar la cancha');
                }
                return data;
            })
            .then(async () => {
                if (deportesData.length > 0) {
                    const promises = deportesData.map(deporte => {
                        if (deporte.id_cancha_deporte) {
                            return fetch(`/canchadeporte/update/${deporte.id_cancha_deporte}`, {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id_cancha: canchaId,
                                    id_deporte: deporte.id_deporte,
                                    precio_hora: deporte.precio_hora
                                })
                            });
                        } else {
                            return fetch('/canchadeporte/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id_cancha: canchaId,
                                    id_deporte: deporte.id_deporte,
                                    precio_hora: deporte.precio_hora
                                })
                            });
                        }
                    });
                    await Promise.all(promises);
                }

                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'La cancha se ha actualizado correctamente.',
                    confirmButtonText: 'Aceptar'
                }).then(() => {
                    window.location.href = '/list_canchas';
                });
            })
            .catch(error => {
                console.error('Error:', error);
                showErrorAlert(error.message || 'No se pudo actualizar la cancha');
            });
    });
});
