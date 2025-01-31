function showErrorAlert(message) {
    return Swal.fire({
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
    const tabla = document.getElementById('tablaDeportes').getElementsByTagName('tbody')[0];
    const btnAgregarFila = document.getElementById('btnAgregarFila');
    const urlParams = new URLSearchParams(window.location.search);
    const canchaId = urlParams.get('id');
    let listaDeportes = []; // Lista de deportes disponibles

    // Función para cargar la lista de deportes disponibles desde el servidor
    async function cargarDeportes() {
        try {
            const response = await fetch('/deportes');
            const data = await response.json();
            if (data.success && Array.isArray(data.deportes)) {
                listaDeportes = data.deportes; // Guardar la lista de deportes
            } else {
                showErrorAlert('Error al cargar los deportes disponibles.');
            }
        } catch (error) {
            showErrorAlert('Error al conectarse con el servidor para cargar los deportes.');
            console.error('Error al conectarse con el servidor:', error);
        }
    }

    // Función para cargar los deportes asignados a la cancha actual
    async function cargarDeportesDeCancha() {
        showLoadingAlert();
        try {
            const response = await fetch(`/canchadeporte/cancha/${canchaId}`);
            const data = await response.json();
            if (data.success && Array.isArray(data.canchaDeportes)) {
                // Añadir cada deporte existente como fila en la tabla
                data.canchaDeportes.forEach(deporte => agregarFila(deporte));
                Swal.close(); // Cierra el popup de carga
            } else {
                Swal.close();
                showErrorAlert(data.error || 'No se encontraron deportes para esta cancha.');
            }
        } catch (error) {
            Swal.close();
            showErrorAlert('Error al cargar los deportes de la cancha.');
            console.error('Error al cargar los deportes de la cancha:', error);
        }
    }

    // Función para agregar una nueva fila a la tabla
    function agregarFila(deporte = {}) {
        const nuevaFila = tabla.insertRow();

        // Guardar el ID del CanchaDeporte si ya existe
        if (deporte.ID_CANCHA_DEPORTE) {
            nuevaFila.dataset.idCanchaDeporte = deporte.ID_CANCHA_DEPORTE;
        }

        // Celda para seleccionar el deporte
        const celdaDeporte = nuevaFila.insertCell(0);
        const selectDeporte = document.createElement('select');
        selectDeporte.className = 'form-select';
        selectDeporte.innerHTML = `<option value="">Seleccionar deporte</option>`;
        listaDeportes.forEach(d => {
            const option = document.createElement('option');
            option.value = d.ID_DEPORTE;
            option.textContent = d.NOMBRE;
            if (String(deporte.ID_DEPORTE) === String(d.ID_DEPORTE)) {
                option.selected = true;
            }
            selectDeporte.appendChild(option);
        });
        celdaDeporte.appendChild(selectDeporte);

        // Celda para ingresar el precio
        const celdaPrecio = nuevaFila.insertCell(1);
        const inputPrecio = document.createElement('input');
        inputPrecio.type = 'number';
        inputPrecio.className = 'form-control';
        inputPrecio.placeholder = 'Precio por hora (Gs)';
        inputPrecio.min = 0;
        inputPrecio.value = deporte.PRECIO_HORA || '';
        celdaPrecio.appendChild(inputPrecio);

        // Celda para acciones
        const celdaAccion = nuevaFila.insertCell(2);
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-danger';
        btnEliminar.type = 'button';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', async function () {
            if (deporte.ID_CANCHA_DEPORTE) {
                try {
                    await eliminarDeporte(deporte.ID_CANCHA_DEPORTE);
                } catch (error) {
                    showErrorAlert('Error al eliminar el deporte de la cancha.');
                }
            }
            tabla.deleteRow(nuevaFila.rowIndex - 1);
        });
        celdaAccion.appendChild(btnEliminar);
    }

    // Función para eliminar un deporte asignado a la cancha (servidor)
    async function eliminarDeporte(idCanchaDeporte) {
        try {
            const response = await fetch(`/canchadeporte/delete/${idCanchaDeporte}`, { method: 'DELETE' });
            const data = await response.json();
            if (!data.success) {
                showErrorAlert(data.error || 'Error al eliminar el deporte de la cancha.')
                    .then(() => cargarDeportesDeCancha());
            } else {
                Swal.fire({
                    icon: 'success',
                    title: 'Éxito',
                    text: 'Deporte eliminado de la cancha.',
                    confirmButtonText: 'Aceptar'
                }).then(() => cargarDeportesDeCancha());
            }
        } catch (error) {
            showErrorAlert(error || 'Error al conectarse con el servidor para eliminar el deporte.');
            console.error('Error al conectarse con el servidor:', error);
        }
    }

    // Evento para añadir una nueva fila al hacer clic en el botón
    btnAgregarFila.addEventListener('click', function () {
        agregarFila(); // Añadir una fila vacía
    });

    // Inicialización: cargar deportes y deportes de la cancha
    (async function () {
        await cargarDeportes(); // Cargar lista de deportes disponibles
        await cargarDeportesDeCancha(); // Cargar los deportes asignados a la cancha
    })();
});