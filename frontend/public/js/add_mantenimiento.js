function showErrorAlert(message) {
    Swal.fire({
        icon: 'error',
        title: 'Error',
        text: message,
        confirmButtonText: 'Aceptar'
    });
}

document.addEventListener('DOMContentLoaded', function () {
    const form = document.getElementById('add-mantenimiento-form');

    fetch('/api/canchas', { method: 'GET' })  // Método GET explícito
        .then(response => response.json())
        .then(data => {
            if (data.success === false) {
                showErrorAlert(data.error || 'Error desconocido.');
            } else {
                document.getElementById('cancha').innerHTML = data.canchas.map(cancha => `
                    <option value="${cancha.ID_CANCHA}">${'Cancha ' + cancha.NUMERO}</option>
                `).join('');
            }
            document.getElementById('cancha').insertAdjacentHTML('afterbegin', '<option value="" disabled selected hidden>Elige la Cancha</option>');
        })
        .catch(error => {
            showErrorAlert(error || 'Error al cargar las canchas.');
        });

    form.addEventListener('submit', function (event) {
        event.preventDefault();

        // Obtiene los campos del formulario donde se mostrará la información del mantenimiento
        const newCancha = document.getElementById('cancha').value.trim();
        const newFechaInicio = document.getElementById('fecha_inicio').value;
        const newHoraInicio = document.getElementById('hora_inicio').value;
        const newFechaFin = document.getElementById('fecha_fin').value;
        const newHoraFin = document.getElementById('hora_fin').value;
        const newDescripcion = document.getElementById('descripcion').value.trim();
        console.log({ id_cancha: newCancha, fecha_inicio: newFechaInicio, hora_inicio: newHoraInicio, fecha_fin: newFechaFin, hora_fin: newHoraFin, descripcion: newDescripcion });

        fetch('/mantenimientos/add', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ id_cancha: newCancha, fecha_inicio: newFechaInicio, hora_inicio: newHoraInicio, fecha_fin: newFechaFin, hora_fin: newHoraFin, descripcion: newDescripcion })
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    Swal.fire({
                        icon: 'success',
                        title: 'Éxito',
                        text: 'El mantenimiento se ha agregado correctamente',
                        confirmButtonText: 'Aceptar'
                    }).then(() => {
                        window.location.href = '/list_mantenimientos';
                    });
                } else {
                    showErrorAlert(data.error || 'Error al agregar el mantenimiento.');
                }
            })
            .catch(error => {
                showErrorAlert(error || 'Error en la conexión con el servidor.');
            });
    });

});
