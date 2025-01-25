document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('addCanchaForm');
    const cancelButton = document.getElementById('cancel-button');
    const tipoSueloSelect = document.getElementById('tipo_suelo');

    const loadTiposDeSuelo = () => {
        if (!tipoSueloSelect) return;

        fetch('/tiposuelos')
            .then(response => {
                if (!response.ok) throw new Error('Network response was not ok');
                return response.json();
            })
            .then(data => {
                console.log('Data received:', data);
                tipoSueloSelect.innerHTML = '<option value="">Seleccione el tipo de suelo</option>';

                if (data.success && Array.isArray(data.tiposuelos)) {
                    data.tiposuelos.forEach(tipo => {
                        const option = document.createElement('option');
                        option.value = tipo.ID_TIPO_SUELO;
                        option.textContent = tipo.NOMBRE;
                        tipoSueloSelect.appendChild(option);
                    });
                } else {
                    throw new Error('No hay tipos de suelo disponibles');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'No se pudieron cargar los tipos de suelo',
                    confirmButtonText: 'Aceptar'
                });
            });
    };


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
        const tablaDeportes = document.getElementById('tablaDeportes').getElementsByTagName('tbody')[0];
        Array.from(tablaDeportes.rows).forEach(row => {
            const idDeporte = row.cells[0].getElementsByTagName('select')[0].value;
            const precioHora = row.cells[1].getElementsByTagName('input')[0].value.trim();

            // Verificar si hay datos válidos de deporte y precio
            if (idDeporte && precioHora) {
                deportesData.push({
                    id_deporte: idDeporte,
                    precio_hora: parseFloat(precioHora)
                });
            }
        });

        // 3. Agregar la cancha
        fetch('/api/canchas/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(canchaData)
        })
            .then(async response => {
                const data = await response.json();
                if (!response.ok) {
                    throw new Error(data.error || 'Error al agregar la cancha');
                }
                return data;
            })
            .then(async canchaResponse => {
                // Verificar que se haya agregado correctamente y que se tenga la ID de la nueva cancha
                if (canchaResponse.success && canchaResponse.id_cancha) {
                    const idCancha = canchaResponse.id_cancha; // ID de la nueva cancha

                    // Si hay deportes asociados, agregarlos
                    if (deportesData.length > 0) {
                        const promises = deportesData.map(deporte =>
                            fetch('/canchadeporte/add', {
                                method: 'POST',
                                headers: { 'Content-Type': 'application/json' },
                                body: JSON.stringify({
                                    id_cancha: idCancha,
                                    id_deporte: deporte.id_deporte,
                                    precio_hora: deporte.precio_hora
                                })
                            })
                        );

                        // Esperar a que todos los deportes se hayan agregado
                        await Promise.all(promises);
                    }

                    // Mostrar mensaje de éxito
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'La cancha se ha agregado correctamente.',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_canchas';
                    });
                } else {
                    throw new Error('No se pudo obtener la ID de la nueva cancha.');
                }
            })
            .catch(error => {
                console.error('Error:', error);
                // Mostrar mensaje de error
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: error.message || 'No se pudo agregar la cancha',
                    confirmButtonText: 'Aceptar'
                });
            });
    });



    loadTiposDeSuelo();

    // Manejar el botón de cancelar
    if (cancelButton) {
        cancelButton.addEventListener('click', function () {
            window.location.href = '/list_canchas'; // Regresa a la lista de canchas
        });
    }
});
