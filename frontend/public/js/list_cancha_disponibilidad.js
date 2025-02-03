document.addEventListener("DOMContentLoaded", function () {
  const fechaInput = document.getElementById("fechaFilter");
  const fechaDisplay = document.getElementById("fechaDisplay");
  const prevDayBtn = document.getElementById("prevDay");
  const nextDayBtn = document.getElementById("nextDay");

  // Función para formatear la fecha con el día de la semana y el mes en mayúscula inicial
  function formatearFecha(fecha) {
    const opciones = { weekday: "long", day: "numeric", month: "long" };
    let fechaStr = fecha.toLocaleDateString("es-ES", opciones);

    // Corregir problemas de mayúsculas raras en ciertos días (MiéRcoles → Miércoles)
    return fechaStr.replace(/(^|\s)\S/g, (l) => l.toUpperCase());
  }

  // Función para actualizar la visualización de la fecha
  function actualizarFechaDisplay() {
    cargarCanchas(); // Recargar las canchas según la nueva fecha
    const fecha = new Date(Date.parse(fechaInput.value + "T00:00:00")); // Ajuste para evitar desfases
    fechaDisplay.textContent = formatearFecha(fecha);
  }

  // Función para cambiar la fecha en días (+1 o -1)
  function cambiarFecha(dias) {
    const fecha = new Date(Date.parse(fechaInput.value + "T00:00:00"));
    fecha.setDate(fecha.getDate() + dias);
    fechaInput.value = fecha.toISOString().split("T")[0]; // Actualiza el input con la nueva fecha
    actualizarFechaDisplay();
    cargarCanchas(); // Recargar las canchas según la nueva fecha
  }

  // Eventos para los botones de navegación de fechas
  prevDayBtn.addEventListener("click", () => cambiarFecha(-1)); // Día anterior
  nextDayBtn.addEventListener("click", () => cambiarFecha(1)); // Día siguiente
  fechaInput.addEventListener("change", actualizarFechaDisplay); // Cambia la fecha manualmente

  // Inicialización: establece la fecha actual al cargar la página
  fechaInput.value = new Date().toISOString().split("T")[0];
  actualizarFechaDisplay();
  cargarCanchas();
});


// Función para mostrar alertas de error
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
    text: 'Estamos obteniendo los datos de las reservas.',
    allowOutsideClick: false, // No permite cerrar el popup haciendo clic fuera
    didOpen: () => {
      Swal.showLoading(); // Muestra el spinner de carga
    }
  });
}

async function cargarCanchas() {
  showLoadingAlert();
  try {
    const fechaInput = document.getElementById('fechaFilter');
    let fechaSeleccionada = fechaInput.value || new Date().toISOString().split('T')[0];

    const [canchas, mantenimientos, reservas] = await Promise.all([
      fetch('/api/canchas').then(r => r.json()),
      fetch(`/mantenimientos/fecha/${fechaSeleccionada}`).then(r => r.json()),
      fetch(`/reservas/fecha/${fechaSeleccionada}`).then(r => r.json())
    ]);

    if (!canchas.success || !mantenimientos.success || !reservas.success) {
      throw new Error('Error en la carga de datos');
    }
    // Ordenar las canchas por número
    canchas.canchas.sort((a, b) => a.NUMERO - b.NUMERO);

    Swal.close(); // Cierra el mensaje de carga
    mostrarDisponibilidad(canchas.canchas, mantenimientos.mantenimientos, reservas.reservas, fechaSeleccionada);

  } catch (error) {
    console.error('Error:', error);
    Swal.close();
    showErrorAlert('Error al cargar los datos de las canchas. Por favor, inténtelo de nuevo.');
  }
}

function mostrarDisponibilidad(canchas, mantenimientos, reservas, fechaSeleccionada) {
  const container = document.getElementById('canchas-container');
  container.innerHTML = "";

  canchas.forEach(cancha => {
    const canchaDiv = document.createElement('div');
    canchaDiv.className = 'cancha-container mb-4';

    // Título de la cancha
    const title = document.createElement('h4');
    title.textContent = `Cancha ${cancha.NUMERO}`;
    canchaDiv.appendChild(title);

    // Timeline y eventos
    const { hourLabels, timeline, progressStacked } = crearBarrasDeTiempo();

    // Procesar mantenimientos
    mantenimientos
      .filter(m => m.ID_CANCHA === cancha.ID_CANCHA)
      .forEach(m => {
        const { horaInicio, horaFin } = calcularHorasEvento(m, fechaSeleccionada, 'mantenimiento');
        agregarEvento(progressStacked, horaInicio, horaFin, 'bg-danger', 'Mantenimiento');
      });

    // Procesar reservas
    reservas
      .filter(r => r.ID_CANCHA === cancha.ID_CANCHA)
      .forEach(r => {
        const { horaInicio, horaFin } = calcularHorasEvento(r, fechaSeleccionada, 'reserva');
        agregarEvento(progressStacked, horaInicio, horaFin, 'bg-warning', 'Reserva');
      });

    // Ensamblar componentes
    canchaDiv.appendChild(hourLabels);
    canchaDiv.appendChild(timeline);
    canchaDiv.appendChild(progressStacked);
    container.appendChild(canchaDiv);
  });
}

// Helper: Crea los elementos visuales de la timeline
function crearBarrasDeTiempo() {
  // Etiquetas de horas
  const hourLabels = document.createElement('div');
  hourLabels.className = 'hour-labels d-flex';
  Array.from({ length: 24 }).forEach((_, i) => {
    const label = document.createElement('div');
    label.style.width = '5%';
    label.textContent = `${i}:00`;
    hourLabels.appendChild(label);
  });

  // Línea de tiempo
  const timeline = document.createElement('div');
  timeline.className = 'timeline';
  Array.from({ length: 24 }).forEach(() => {
    timeline.appendChild(document.createElement('div'));
  });

  // Contenedor de eventos
  const progressStacked = document.createElement('div');
  progressStacked.className = 'progress progress-stacked';

  return { hourLabels, timeline, progressStacked };
}

// Helper: Calcula horas efectivas para eventos (mantenimientos o reservas)
function calcularHorasEvento(evento, fechaSeleccionada, tipo) {
  const esFechaInicio = fechaSeleccionada === evento.FECHA_INICIO;
  const esFechaFin = fechaSeleccionada === evento.FECHA_FIN;

  let horaInicio = '00:00:00';
  let horaFin = '23:59:59';

  if (esFechaInicio) horaInicio = evento.HORA_INICIO;
  if (esFechaFin) horaFin = evento.HORA_FIN;

  // Si el evento cruza medianoche, ajustar las horas
  if (tipo === 'reserva' && convertirHoraADecimal(horaInicio) > convertirHoraADecimal(horaFin)) {
    if (esFechaInicio) {
      horaFin = '23:59:59';
    } else if (esFechaFin) {
      horaInicio = '00:00:00';
    }
  }

  return {
    horaInicio: convertirHoraADecimal(horaInicio),
    horaFin: convertirHoraADecimal(horaFin)
  };
}

// Helper: Convierte formato HH:MM:SS a horas decimales
function convertirHoraADecimal(hora) {
  const [hh, mm] = hora.split(':');
  return parseInt(hh) + (parseInt(mm || 0) / 60);
}

// Helper: Agrega un evento a la timeline
function agregarEvento(container, inicio, fin, clase, texto) {
  const duration = fin - inicio;
  if (duration <= 0) return;

  const horaInicio = formatearHora(inicio);
  const horaFin = formatearHora(fin);

  const eventDiv = document.createElement('div');
  eventDiv.className = `progress-bar ${clase}`;
  eventDiv.style.cssText = `
    width: ${(duration / 24 * 100)}%;
    left: ${(inicio / 24 * 100)}%;
    position: absolute;
    height: 100%;
  `;

  // Configurar tooltip de Bootstrap
  eventDiv.setAttribute('data-bs-toggle', 'tooltip');
  eventDiv.setAttribute('data-bs-placement', 'top');
  eventDiv.setAttribute('data-bs-title', `${horaInicio} - ${horaFin} ${texto}`);
  eventDiv.setAttribute('data-bs-trigger', 'hover focus');

  const textoEvento = document.createElement('span');
  textoEvento.className = 'progress-bar-text';
  textoEvento.textContent = `${horaInicio} - ${horaFin} ${texto}`;

  eventDiv.appendChild(textoEvento);
  container.appendChild(eventDiv);

  // Inicializar tooltip de Bootstrap
  new bootstrap.Tooltip(eventDiv);
}

// Helper: Formatea horas decimales a HH:MM
function formatearHora(decimal) {
  const horas = Math.floor(decimal);
  const minutos = Math.round((decimal % 1) * 60);
  return `${horas}:${minutos.toString().padStart(2, '0')}`;
}