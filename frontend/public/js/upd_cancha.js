document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-cancha-form');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('id');
    const tablaDeportes = document.getElementById('tablaDeportes').getElementsByTagName('tbody')[0];

    // Método para cargar la lista de tipos de suelo
    const loadTiposSuelo = () => {
        fetch('/tiposuelos')
            .then(response => {
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
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'Error al cargar la lista de tipos de suelo.'
                    });
                }
            })
            .catch(error => console.error('Error al cargar tipos de suelo:', error));
    };

    // Llama a la función para cargar la lista de tipos de suelo al inicio
    loadTiposSuelo();

    // Cargar datos de la cancha actual
    if (canchaId) {
        fetch(`/api/canchas/cancha/${canchaId}`, { method: 'GET' })
            .then(response => response.json())
            .then(data => {
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
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'Cancha no encontrada.'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error al obtener datos de la cancha.'
                });
                console.error('Error:', error);
            });
    }

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
            const idCanchaDeporte = row.dataset.idCanchaDeporte; // ID de la relación cancha-deporte (si existe)

            // Verificar si hay datos válidos de deporte y precio
            if (idDeporte && precioHora) {
                console.log({ idCanchaDeporte, idDeporte, precioHora });
                deportesData.push({
                    id_cancha_deporte: idCanchaDeporte || null, // Si existe, usar la ID actual; si no, es nuevo
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
                // 4. Actualizar o agregar deportes asociados
                if (deportesData.length > 0) {
                    const promises = deportesData.map(deporte => {
                        if (deporte.id_cancha_deporte) {
                            // Actualizar deporte existente
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
                            // Agregar nuevo deporte
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

                    // Esperar a que todos los cambios se procesen
                    await Promise.all(promises);
                }

                // Mostrar mensaje de éxito
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
                // Mostrar mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo actualizar la cancha',
                    confirmButtonText: 'Aceptar'
                });
            });
    });
});