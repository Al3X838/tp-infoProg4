document.addEventListener('DOMContentLoaded', function () {
    const tabla = document.getElementById('tablaDeportes').getElementsByTagName('tbody')[0];
    const btnAgregarFila = document.getElementById('btnAgregarFila');

    let listaDeportes = []; // Aquí se almacenarán las opciones de deportes

    // Función para cargar los deportes desde el servidor
    function cargarDeportes() {
        fetch('/deportes')
            .then(response => response.json())
            .then(data => {
                if (data.success && Array.isArray(data.deportes)) {
                    listaDeportes = data.deportes; // Guardar la lista de deportes
                } else {
                    console.error('Error al cargar los deportes.');
                }
            })
            .catch(error => {
                console.error('Error en la conexión con el servidor:', error);
            });
    }

    // Llamar a cargarDeportes al cargar la página
    cargarDeportes();

    // Función para agregar una nueva fila
    btnAgregarFila.addEventListener('click', function () {
        const nuevaFila = tabla.insertRow(); // Agregar nueva fila

        // Celda para el deporte (select dinámico)
        const celdaDeporte = nuevaFila.insertCell(0);
        const selectDeporte = document.createElement('select');
        selectDeporte.className = 'form-select'; // Estilo de Bootstrap para select
        selectDeporte.innerHTML = `<option value="">Seleccionar deporte</option>`;
        // Agregar las opciones de deportes al select
        listaDeportes.forEach(deporte => {
            const option = document.createElement('option');
            option.value = deporte.ID_DEPORTE; // ID del deporte de la respuesta
            option.textContent = deporte.NOMBRE; // Nombre del deporte de la respuesta
            selectDeporte.appendChild(option);
        });
        celdaDeporte.appendChild(selectDeporte);

        // Celda para el precio (campo de entrada)
        const celdaPrecio = nuevaFila.insertCell(1);
        const inputPrecio = document.createElement('input');
        inputPrecio.type = 'number';
        inputPrecio.className = 'form-control';
        inputPrecio.placeholder = 'Precio por hora';
        inputPrecio.min = 0;
        celdaPrecio.appendChild(inputPrecio);

        // Celda para acciones (botón de eliminar)
        const celdaAccion = nuevaFila.insertCell(2);
        const btnEliminar = document.createElement('button');
        btnEliminar.className = 'btn btn-danger';
        btnEliminar.textContent = 'Eliminar';
        btnEliminar.addEventListener('click', function () {
            tabla.deleteRow(nuevaFila.rowIndex - 1); // Eliminar fila
        });
        celdaAccion.appendChild(btnEliminar);
    });
});
