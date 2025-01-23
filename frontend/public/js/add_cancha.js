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
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'La cancha se ha agregado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_canchas';
                    });
                }
            })
            .catch(error => {
                console.error('Error:', error);
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
