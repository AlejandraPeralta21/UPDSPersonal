/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/reservas.js — Reservaciones, Disponibilidad y Calculadora de Consumo
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;
  const Bitacoras = AUREA.Bitacoras;
  const Validaciones = AUREA.Validaciones;
  const Temporizador = AUREA.Temporizador;
  const $ = window.jQuery;

  // Carrito / Calculadora de consumo estimado
  const calculadoraItems = [];

  const Reservas = {
    init() {
      this.establecerFechaMinima();
      this.cargarOpcionesMesasYZonas();
      this.vincularEventosFormulario();
      this.vincularCalculadora();
      this.renderizarCalculadora();
    },

    // Establecer la fecha mínima como la fecha local de hoy en formato YYYY-MM-DD
    establecerFechaMinima() {
      const inputFecha = document.getElementById('res-fecha');
      if (inputFecha) {
        const hoy = new Date();
        const yyyy = hoy.getFullYear();
        const mm = String(hoy.getMonth() + 1).padStart(2, '0');
        const dd = String(hoy.getDate()).padStart(2, '0');
        inputFecha.min = `${yyyy}-${mm}-${dd}`;
        inputFecha.value = `${yyyy}-${mm}-${dd}`;
      }
    },

    // Cargar mesas y zonas dinámicamente desde el Storage
    cargarOpcionesMesasYZonas() {
      const mesas = Storage.get('mesas', []);
      const selectTipo = document.getElementById('res-tipo-mesa');
      const selectZona = document.getElementById('res-zona');

      // Las opciones ya están en el HTML con diseño visual, pero validamos disponibilidad
      if (selectZona && selectZona.value) {
        this.actualizarCapacidadSugerida();
      }
    },

    // Actualizar límites o advertencias según la zona y tipo seleccionados
    actualizarCapacidadSugerida() {
      const selectTipo = document.getElementById('res-tipo-mesa');
      const inputPersonas = document.getElementById('res-personas');
      if (!selectTipo || !inputPersonas) return;

      const tipo = selectTipo.value;
      let sugerido = 2;
      let maximo = 12;

      switch (tipo) {
        case 'Mesa para dos':
          sugerido = 2;
          maximo = 2;
          break;
        case 'Mesa familiar':
          sugerido = 4;
          maximo = 5;
          break;
        case 'Mesa grupal':
          sugerido = 6;
          maximo = 8;
          break;
        case 'Mesa VIP':
          sugerido = 4;
          maximo = 6;
          break;
      }

      inputPersonas.max = maximo;
      if (Number(inputPersonas.value) > maximo) {
        inputPersonas.value = maximo;
      }
    },

    // Validar conflicto de reserva con reservas existentes
    verificarDisponibilidad(fecha, hora, zona, personas) {
      const reservas = Storage.get('reservas', []);
      const mesas = Storage.get('mesas', []);

      // Filtrar mesas de esa zona y capacidad suficiente
      const mesasCandidatas = mesas.filter(m => m.zona === zona && m.activa && m.capacidad >= personas);
      if (mesasCandidatas.length === 0) {
        return { disponible: false, motivo: `No contamos con mesas activas para ${personas} personas en la zona ${zona}.` };
      }

      // Convertir hora solicitada a minutos
      const [sh, sm] = hora.split(':').map(Number);
      const minSolicitado = sh * 60 + sm;
      const duracionMin = 90; // Bloque de 90 minutos por reserva

      // Revisar si todas las mesas candidatas están ocupadas en ese rango
      let mesasOcupadasIds = new Set();

      reservas.forEach(r => {
        if (r.fecha === fecha && r.estado === 'CONFIRMADA' && r.zona === zona) {
          const [rh, rm] = (r.hora || '12:00').split(':').map(Number);
          const minReserva = rh * 60 + rm;
          // Si hay solapamiento menor a 90 minutos
          if (Math.abs(minSolicitado - minReserva) < duracionMin) {
            mesasOcupadasIds.add(r.mesaId);
          }
        }
      });

      const mesasLibres = mesasCandidatas.filter(m => !mesasOcupadasIds.has(m.id));

      if (mesasLibres.length === 0) {
        return {
          disponible: false,
          motivo: `Todas las mesas para ${personas} personas en ${zona} están ocupadas alrededor de las ${hora}. Por favor elige otro horario o zona.`
        };
      }

      return { disponible: true, mesaSugerida: mesasLibres[0] };
    },

    // Validar todo el formulario de reserva
    validarFormulario() {
      let esValido = true;
      let primerCampoError = null;

      const fNombre = document.getElementById('res-nombre');
      const fTelefono = document.getElementById('res-telefono');
      const fCorreo = document.getElementById('res-correo');
      const fFecha = document.getElementById('res-fecha');
      const fHora = document.getElementById('res-hora');
      const fPersonas = document.getElementById('res-personas');
      const fTipoMesa = document.getElementById('res-tipo-mesa');
      const fZona = document.getElementById('res-zona');
      const fTerminos = document.getElementById('res-terminos');

      // Nombre
      const errNom = Validaciones.nombre(fNombre ? fNombre.value : '');
      if (errNom) {
        Validaciones.marcarError(fNombre, errNom);
        esValido = false;
        if (!primerCampoError) primerCampoError = fNombre;
      } else {
        Validaciones.marcarValido(fNombre);
      }

      // Teléfono
      const errTel = Validaciones.telefono(fTelefono ? fTelefono.value : '');
      if (errTel) {
        Validaciones.marcarError(fTelefono, errTel);
        esValido = false;
        if (!primerCampoError) primerCampoError = fTelefono;
      } else {
        Validaciones.marcarValido(fTelefono);
      }

      // Correo
      const errCor = Validaciones.correo(fCorreo ? fCorreo.value : '');
      if (errCor) {
        Validaciones.marcarError(fCorreo, errCor);
        esValido = false;
        if (!primerCampoError) primerCampoError = fCorreo;
      } else {
        Validaciones.marcarValido(fCorreo);
      }

      // Fecha
      const errFec = Validaciones.fecha(fFecha ? fFecha.value : '');
      if (errFec) {
        Validaciones.marcarError(fFecha, errFec);
        esValido = false;
        if (!primerCampoError) primerCampoError = fFecha;
      } else {
        Validaciones.marcarValido(fFecha);
      }

      // Hora
      const errHor = Validaciones.hora(fHora ? fHora.value : '');
      if (errHor) {
        Validaciones.marcarError(fHora, errHor);
        esValido = false;
        if (!primerCampoError) primerCampoError = fHora;
      } else {
        Validaciones.marcarValido(fHora);
      }

      // Personas
      const errPer = Validaciones.personas(fPersonas ? fPersonas.value : '', 12);
      if (errPer) {
        Validaciones.marcarError(fPersonas, errPer);
        esValido = false;
        if (!primerCampoError) primerCampoError = fPersonas;
      } else {
        Validaciones.marcarValido(fPersonas);
      }

      // Tipo de mesa
      const errTip = Validaciones.seleccion(fTipoMesa ? fTipoMesa.value : '', 'un tipo de mesa');
      if (errTip) {
        Validaciones.marcarError(fTipoMesa, errTip);
        esValido = false;
        if (!primerCampoError) primerCampoError = fTipoMesa;
      } else {
        Validaciones.marcarValido(fTipoMesa);
      }

      // Zona
      const errZon = Validaciones.seleccion(fZona ? fZona.value : '', 'una zona del restaurante');
      if (errZon) {
        Validaciones.marcarError(fZona, errZon);
        esValido = false;
        if (!primerCampoError) primerCampoError = fZona;
      } else {
        Validaciones.marcarValido(fZona);
      }

      // Términos
      const errTer = Validaciones.terminos(fTerminos ? fTerminos.checked : false);
      if (errTer) {
        Validaciones.marcarError(fTerminos, errTer);
        esValido = false;
        if (!primerCampoError) primerCampoError = fTerminos;
      } else {
        Validaciones.marcarValido(fTerminos);
      }

      // Si los campos básicos son correctos, verificar disponibilidad en base de datos local
      if (esValido) {
        const disponibilidad = this.verificarDisponibilidad(
          fFecha.value,
          fHora.value,
          fZona.value,
          Number(fPersonas.value)
        );

        if (!disponibilidad.disponible) {
          Validaciones.marcarError(fZona, disponibilidad.motivo);
          esValido = false;
          primerCampoError = fZona;

          Bitacoras.registrar({
            modulo: 'Reservas',
            tipo: 'VALIDACION',
            accion: 'CONFLICTO_DISPONIBILIDAD',
            descripcion: `Intento de reserva sin disponibilidad para ${fFecha.value} a las ${fHora.value} (${fZona.value})`,
            resultado: 'FALLIDO',
            origen: 'Cliente',
            metadata: { fecha: fFecha.value, hora: fHora.value, zona: fZona.value }
          });
        }
      }

      if (!esValido && primerCampoError) {
        primerCampoError.focus();
        $('html, body').animate({
          scrollTop: $(primerCampoError).offset().top - 120
        }, 300);

        Bitacoras.registrar({
          modulo: 'Reservas',
          tipo: 'VALIDACION',
          accion: 'ERROR_VALIDACION_FORMULARIO',
          descripcion: 'El usuario intentó enviar el formulario de reserva con campos incompletos o erróneos',
          resultado: 'FALLIDO',
          origen: 'Cliente'
        });
      }

      return esValido;
    },

    // Enlazar eventos de validación en tiempo real (blur, input, change)
    vincularEventosFormulario() {
      const self = this;

      // Validación reactiva al perder foco (blur)
      $('#res-nombre').on('blur', function () {
        const err = Validaciones.nombre($(this).val());
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-telefono').on('blur', function () {
        const err = Validaciones.telefono($(this).val());
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-correo').on('blur', function () {
        const err = Validaciones.correo($(this).val());
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-fecha').on('change', function () {
        const err = Validaciones.fecha($(this).val());
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-hora').on('change', function () {
        const err = Validaciones.hora($(this).val());
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-personas').on('input change', function () {
        const err = Validaciones.personas($(this).val(), 12);
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-tipo-mesa').on('change', function () {
        self.actualizarCapacidadSugerida();
        const err = Validaciones.seleccion($(this).val(), 'un tipo de mesa');
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-zona').on('change', function () {
        const err = Validaciones.seleccion($(this).val(), 'una zona');
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      $('#res-terminos').on('change', function () {
        const err = Validaciones.terminos($(this).is(':checked'));
        if (err) Validaciones.marcarError(this, err);
        else Validaciones.marcarValido(this);
      });

      // Envío del formulario
      $('#form-reserva').on('submit', function (e) {
        e.preventDefault();

        if (self.validarFormulario()) {
          const totalConsumo = self.calcularTotalConsumo();

          const datosReserva = {
            nombre: $('#res-nombre').val().trim(),
            telefono: $('#res-telefono').val().trim(),
            correo: $('#res-correo').val().trim(),
            fecha: $('#res-fecha').val(),
            hora: $('#res-hora').val(),
            personas: Number($('#res-personas').val()),
            tipoMesa: $('#res-tipo-mesa').val(),
            zona: $('#res-zona').val(),
            ocasion: $('#res-ocasion').val() || 'Cena estándar',
            observaciones: $('#res-observaciones').val().trim(),
            consumoEstimadoBs: totalConsumo
          };

          // Iniciar el temporizador real de 60 segundos
          Temporizador.iniciar(datosReserva);
        }
      });

      // Botón confirmar del modal de temporizador
      $(document).on('click', '#btn-timer-confirmar', function (e) {
        e.preventDefault();
        Temporizador.confirmar();
      });

      // Botón cancelar del modal de temporizador
      $(document).on('click', '#btn-timer-cancelar, #modal-temporizador-reserva .btn-close-modal', function (e) {
        e.preventDefault();
        Temporizador.cancelar();
      });

      // Cerrar comprobante de éxito
      $(document).on('click', '#modal-reserva-exitosa .btn-close-modal, #btn-exito-aceptar', function (e) {
        e.preventDefault();
        $('#modal-reserva-exitosa').fadeOut(250).removeClass('show');
      });
    },

    // ==========================================
    // CALCULADORA DE CONSUMO ESTIMADO (ADAPTADA)
    // ==========================================

    vincularCalculadora() {
      const self = this;

      // Añadir plato a la calculadora desde tarjeta del catálogo o modal de detalles
      $(document).on('click', '.btn-agregar-calculadora', function (e) {
        e.preventDefault();
        const platoId = $(this).data('plato-id');
        const precio = Number($(this).data('precio'));
        const nombre = $(this).data('nombre');
        self.agregarItemCalculadora(platoId, nombre, precio);
      });

      // Aumentar cantidad
      $(document).on('click', '.calc-btn-plus', function () {
        const id = $(this).data('item-id');
        self.modificarCantidadItem(id, 1);
      });

      // Disminuir cantidad
      $(document).on('click', '.calc-btn-minus', function () {
        const id = $(this).data('item-id');
        self.modificarCantidadItem(id, -1);
      });

      // Eliminar item
      $(document).on('click', '.calc-btn-delete', function () {
        const id = $(this).data('item-id');
        self.eliminarItemCalculadora(id);
      });

      // Vaciar calculadora
      $(document).on('click', '#btn-vaciar-calculadora', function () {
        calculadoraItems.length = 0;
        self.renderizarCalculadora();
      });

      // Checkbox propina/servicio sugerido 10%
      $(document).on('change', '#calc-check-servicio', function () {
        self.renderizarCalculadora();
      });
    },

    agregarItemCalculadora(platoId, nombre, precio) {
      const existente = calculadoraItems.find(i => i.platoId === platoId);
      if (existente) {
        existente.cantidad++;
      } else {
        calculadoraItems.push({
          platoId,
          nombre,
          precio,
          cantidad: 1
        });
      }

      this.renderizarCalculadora();

      if (AUREA.mostrarToast) {
        AUREA.mostrarToast(`"${nombre}" añadido al consumo estimado.`, 'success');
      }

      Bitacoras.registrar({
        modulo: 'Reservas',
        tipo: 'CALCULADORA',
        accion: 'AGREGAR_PLATO_CONSUMO',
        descripcion: `Plato "${nombre}" agregado al cálculo orientativo de consumo`,
        resultado: 'EXITOSO',
        origen: 'Cliente',
        metadata: { platoId, precio }
      });
    },

    modificarCantidadItem(platoId, delta) {
      const item = calculadoraItems.find(i => i.platoId === platoId);
      if (!item) return;

      item.cantidad += delta;
      if (item.cantidad <= 0) {
        this.eliminarItemCalculadora(platoId);
      } else {
        this.renderizarCalculadora();
      }
    },

    eliminarItemCalculadora(platoId) {
      const idx = calculadoraItems.findIndex(i => i.platoId === platoId);
      if (idx !== -1) {
        calculadoraItems.splice(idx, 1);
        this.renderizarCalculadora();
      }
    },

    calcularTotalConsumo() {
      const subtotal = calculadoraItems.reduce((acc, it) => acc + (it.precio * it.cantidad), 0);
      const incluyeServicio = $('#calc-check-servicio').is(':checked');
      const servicio = incluyeServicio ? subtotal * 0.10 : 0;
      return Math.round((subtotal + servicio) * 100) / 100;
    },

    renderizarCalculadora() {
      const contenedor = document.getElementById('calculadora-items-lista');
      const elSubtotal = document.getElementById('calc-subtotal');
      const elServicio = document.getElementById('calc-servicio');
      const elTotal = document.getElementById('calc-total');
      const badgeCount = document.getElementById('calc-badge-count');

      if (!contenedor) return;

      const subtotal = calculadoraItems.reduce((acc, it) => acc + (it.precio * it.cantidad), 0);
      const incluyeServicio = $('#calc-check-servicio').is(':checked');
      const servicio = incluyeServicio ? subtotal * 0.10 : 0;
      const total = subtotal + servicio;

      if (badgeCount) {
        const totalItems = calculadoraItems.reduce((acc, it) => acc + it.cantidad, 0);
        badgeCount.textContent = totalItems;
      }

      if (elSubtotal) elSubtotal.textContent = `Bs. ${subtotal.toFixed(2)}`;
      if (elServicio) elServicio.textContent = `Bs. ${servicio.toFixed(2)}`;
      if (elTotal) elTotal.textContent = `Bs. ${total.toFixed(2)}`;

      if (calculadoraItems.length === 0) {
        contenedor.innerHTML = `
          <div class="text-center py-4 text-muted">
            <i class="bi bi-cart-x fs-2 d-block mb-2 text-gold"></i>
            <p class="mb-0 small">No has añadido platos a tu consumo estimado.</p>
            <p class="small text-muted mb-0">Explora la carta y presiona <strong>+ Consumo</strong>.</p>
          </div>
        `;
        return;
      }

      let html = '<ul class="list-group list-group-flush bg-transparent">';
      calculadoraItems.forEach(it => {
        const subtotalItem = it.precio * it.cantidad;
        html += `
          <li class="list-group-item bg-transparent d-flex justify-content-between align-items-center py-2 px-0 border-bottom-subtle">
            <div class="flex-grow-1 pe-2">
              <div class="fw-bold small text-truncate">${it.nombre}</div>
              <div class="text-muted small">Bs. ${it.precio} c/u</div>
            </div>
            <div class="d-flex align-items-center gap-2">
              <div class="btn-group btn-group-sm">
                <button type="button" class="btn btn-outline-secondary calc-btn-minus" data-item-id="${it.platoId}">-</button>
                <span class="btn btn-outline-secondary disabled text-white px-2">${it.cantidad}</span>
                <button type="button" class="btn btn-outline-secondary calc-btn-plus" data-item-id="${it.platoId}">+</button>
              </div>
              <span class="fw-bold text-gold small ms-1" style="min-width: 65px; text-align: right;">Bs. ${subtotalItem}</span>
              <button type="button" class="btn btn-link text-danger p-0 ms-1 calc-btn-delete" data-item-id="${it.platoId}" title="Quitar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </li>
        `;
      });
      html += '</ul>';

      contenedor.innerHTML = html;
    }
  };

  AUREA.Reservas = Reservas;

})(window, document);
