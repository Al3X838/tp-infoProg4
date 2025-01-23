document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('update-cancha-form');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('id');

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

        const updatedCanchaData = {
            NUMERO: document.getElementById('numero').value.trim(),
            UBICACION: document.getElementById('ubicacion').value.trim(),
            TIPO_SUELO: document.getElementById('tipo_suelo').value,
            LUMINICA: document.getElementById('luminica').checked ? 'S' : 'N',
            BEBEDERO: document.getElementById('bebedero').checked ? 'S' : 'N',
            BANOS: document.getElementById('banos').checked ? 'S' : 'N',
            CAMBIADOR: document.getElementById('cambiador').checked ? 'S' : 'N',
            ESTADO: document.getElementById('estado').value
        };

        fetch(`/api/canchas/update/${canchaId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedCanchaData)
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: '¡Actualizado!',
                        text: 'La cancha ha sido actualizada correctamente.'
                    }).then(() => {
                        window.location.href = '/list_canchas'; // Redirige tras el éxito
                    });
                } else {
                    Swal.fire({
                        icon: 'error',
                        title: 'Error',
                        text: data.error || 'Error al actualizar la cancha.'
                    });
                }
            })
            .catch(error => {
                Swal.fire({
                    icon: 'error',
                    title: 'Error',
                    text: 'Error en la conexión con el servidor.'
                });
                console.error('Error al actualizar cancha:', error);
            });
    });
});