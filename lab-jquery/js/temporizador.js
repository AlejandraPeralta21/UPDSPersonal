/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/temporizador.js — Temporizador Real de 60 Segundos y Confirmación
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;
  const Bitacoras = AUREA.Bitacoras;
  const $ = window.jQuery;

  const DURATION_SECONDS = 60;
  let intervalId = null;
  let pendingReservationData = null;

  // Formato MM:SS
  function formatTime(totalSeconds) {
    const s = Math.max(0, Math.floor(totalSeconds));
    const mins = Math.floor(s / 60);
    const secs = s % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  }

  // Generador de código único de reserva (ej. AUR-2026-7842)
  function generateReservationCode() {
    const year = new Date().getFullYear();
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    return `AUR-${year}-${randomNum}`;
  }

  const Temporizador = {
    // Iniciar el flujo de confirmación con cuenta regresiva de 60s
    iniciar(datosReserva) {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      pendingReservationData = datosReserva;

      // Calcular timestamp límite (60 segundos exactos a partir de ahora)
      const ahora = Date.now();
      const limite = ahora + (DURATION_SECONDS * 1000);

      // Guardar en Storage para resiliencia ante recargas
      Storage.set('reserva_temporal', {
        datos: datosReserva,
        limiteTimestamp: limite,
        iniciadoEn: ahora
      });

      // Registrar inicio en bitácoras
      Bitacoras.registrar({
        modulo: 'Reservas',
        tipo: 'TEMPORIZADOR',
        accion: 'INICIAR_TEMPORIZADOR',
        descripcion: `Inicio de cuenta regresiva de 60s para reserva provisional de ${datosReserva.nombre} (${datosReserva.personas} pers, ${datosReserva.zona})`,
        resultado: 'EXITOSO',
        origen: 'Cliente',
        metadata: {
          cliente: datosReserva.nombre,
          fecha: datosReserva.fecha,
          hora: datosReserva.hora,
          zona: datosReserva.zona
        }
      });

      // Renderizar resumen en el modal
      this.mostrarModal(datosReserva, DURATION_SECONDS);

      // Iniciar el intervalo con corrección de desfase por timestamp real
      intervalId = setInterval(() => {
        const tiempoRestante = Math.ceil((limite - Date.now()) / 1000);

        if (tiempoRestante <= 0) {
          this.expirar();
        } else {
          this.actualizarUI(tiempoRestante);
        }
      }, 250);
    },

    // Actualizar visualización del contador y barra de progreso
    actualizarUI(segundosRestantes) {
      const display = document.getElementById('timer-countdown-display');
      const progressBar = document.getElementById('timer-progress-bar');

      if (display) {
        display.textContent = formatTime(segundosRestantes);
        // Si quedan menos de 15 segundos, resaltar en color alerta
        if (segundosRestantes <= 15) {
          display.classList.add('text-danger', 'timer-urgent-pulse');
        } else {
          display.classList.remove('text-danger', 'timer-urgent-pulse');
        }
      }

      if (progressBar) {
        const porcentaje = Math.max(0, Math.min(100, (segundosRestantes / DURATION_SECONDS) * 100));
        progressBar.style.width = `${porcentaje}%`;
        if (segundosRestantes <= 15) {
          progressBar.classList.add('bg-danger');
          progressBar.classList.remove('bg-gold');
        } else {
          progressBar.classList.remove('bg-danger');
          progressBar.classList.add('bg-gold');
        }
      }
    },

    // Mostrar el modal flotante con los datos
    mostrarModal(datos, segundosIniciales) {
      const modalEl = document.getElementById('modal-temporizador-reserva');
      if (!modalEl) return;

      // Inyectar datos en el modal
      const setElText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '—';
      };

      setElText('timer-res-nombre', datos.nombre);
      setElText('timer-res-fecha', datos.fecha);
      setElText('timer-res-hora', datos.hora);
      setElText('timer-res-personas', `${datos.personas} comensal${datos.personas > 1 ? 'es' : ''}`);
      setElText('timer-res-tipo', datos.tipoMesa);
      setElText('timer-res-zona', datos.zona);
      setElText('timer-res-ocasion', datos.ocasion || 'Cena estándar');

      this.actualizarUI(segundosIniciales);

      // Mostrar modal mediante jQuery fadeIn para cumplir requisito de efectos
      if ($) {
        $(modalEl).fadeIn(350).addClass('show');
      } else {
        modalEl.style.display = 'flex';
      }
    },

    // Confirmación exitosa por parte del cliente antes de los 60s
    confirmar() {
      if (!pendingReservationData) {
        this.cerrarModal();
        return;
      }

      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const datos = pendingReservationData;
      pendingReservationData = null;
      Storage.remove('reserva_temporal');

      // Generar código único y guardar reserva
      const codigo = generateReservationCode();
      const reservas = Storage.get('reservas', []);
      const ahora = new Date();
      const fechaRegistro = `${ahora.getFullYear()}-${String(ahora.getMonth() + 1).padStart(2, '0')}-${String(ahora.getDate()).padStart(2, '0')} ${String(ahora.getHours()).padStart(2, '0')}:${String(ahora.getMinutes()).padStart(2, '0')}:${String(ahora.getSeconds()).padStart(2, '0')}`;

      // Asignar una mesa real disponible según zona y tipo si no viene asignada
      const mesas = Storage.get('mesas', []);
      let mesaAsignada = mesas.find(m => m.zona === datos.zona && m.activa && m.capacidad >= datos.personas);
      if (!mesaAsignada) {
        mesaAsignada = mesas.find(m => m.activa && m.capacidad >= datos.personas) || mesas[0];
      }

      const nuevaReserva = {
        codigo,
        cliente: datos.nombre,
        telefono: datos.telefono,
        correo: datos.correo,
        fecha: datos.fecha,
        hora: datos.hora,
        personas: Number(datos.personas),
        mesaId: mesaAsignada.id,
        mesaNombre: mesaAsignada.nombre,
        tipoMesa: datos.tipoMesa,
        zona: datos.zona,
        ocasion: datos.ocasion || 'General',
        observaciones: datos.observaciones || '',
        consumoEstimadoBs: datos.consumoEstimadoBs || 0,
        estado: 'CONFIRMADA',
        fechaRegistro,
        confirmadoEn: fechaRegistro
      };

      reservas.unshift(nuevaReserva);
      Storage.set('reservas', reservas);

      // Registrar en bitácora
      Bitacoras.registrar({
        modulo: 'Reservas',
        tipo: 'RESERVA',
        accion: 'CONFIRMAR_RESERVA',
        descripcion: `Reserva confirmada exitosamente con código ${codigo} para ${datos.nombre} (${datos.personas} pers, ${mesaAsignada.nombre})`,
        resultado: 'EXITOSO',
        origen: 'Cliente',
        metadata: {
          codigo,
          cliente: datos.nombre,
          mesa: mesaAsignada.id,
          zona: datos.zona
        }
      });

      // Disparar sincronización para el panel admin u otras pestañas
      window.dispatchEvent(new CustomEvent('aurea:reserva_confirmada', { detail: nuevaReserva }));

      // Cerrar modal de temporizador y mostrar modal de comprobante de éxito
      this.cerrarModal();
      this.mostrarComprobanteExito(nuevaReserva);

      // Limpiar formulario original si existe
      const form = document.getElementById('form-reserva');
      if (form) form.reset();
    },

    // Expiración por tiempo agotado (00:00)
    expirar() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const datos = pendingReservationData;
      pendingReservationData = null;
      Storage.remove('reserva_temporal');

      // Cerrar modal con fadeOut de jQuery
      const modalEl = document.getElementById('modal-temporizador-reserva');
      if ($ && modalEl) {
        $(modalEl).fadeOut(400, () => {
          modalEl.classList.remove('show');
        });
      } else if (modalEl) {
        modalEl.style.display = 'none';
      }

      // Registrar en bitácora
      Bitacoras.registrar({
        modulo: 'Reservas',
        tipo: 'TEMPORIZADOR',
        accion: 'EXPIRAR_RESERVA',
        descripcion: `El tiempo de 60 segundos expiró sin confirmación del cliente ${datos ? datos.nombre : ''}. Mesa liberada.`,
        resultado: 'EXPIRADO',
        origen: 'Cliente',
        metadata: datos ? { cliente: datos.nombre, fecha: datos.fecha, hora: datos.hora } : {}
      });

      // Alerta al cliente
      if (AUREA.mostrarToast) {
        AUREA.mostrarToast('El tiempo de 60 segundos para confirmar tu reserva ha expirado. Por favor, realiza una nueva solicitud.', 'warning');
      } else {
        alert('El tiempo de 60 segundos para confirmar tu reserva ha expirado.');
      }
    },

    // Cancelación manual por el usuario
    cancelar() {
      if (intervalId) {
        clearInterval(intervalId);
        intervalId = null;
      }

      const datos = pendingReservationData;
      pendingReservationData = null;
      Storage.remove('reserva_temporal');

      this.cerrarModal();

      Bitacoras.registrar({
        modulo: 'Reservas',
        tipo: 'RESERVA',
        accion: 'CANCELAR_OPERACION_RESERVA',
        descripcion: `El usuario canceló la confirmación de su reserva pendiente (${datos ? datos.nombre : ''})`,
        resultado: 'CANCELADO',
        origen: 'Cliente',
        metadata: datos ? { cliente: datos.nombre } : {}
      });

      if (AUREA.mostrarToast) {
        AUREA.mostrarToast('Operación cancelada. Tu mesa no ha sido reservada.', 'info');
      }
    },

    // Cerrar el modal flotante
    cerrarModal() {
      const modalEl = document.getElementById('modal-temporizador-reserva');
      if ($ && modalEl) {
        $(modalEl).fadeOut(300, () => {
          modalEl.classList.remove('show');
        });
      } else if (modalEl) {
        modalEl.style.display = 'none';
      }
    },

    // Mostrar comprobante visual de éxito con código QR de demostración
    mostrarComprobanteExito(reserva) {
      const modalExito = document.getElementById('modal-reserva-exitosa');
      if (!modalExito) return;

      const setElText = (id, val) => {
        const el = document.getElementById(id);
        if (el) el.textContent = val || '—';
      };

      setElText('exito-res-codigo', reserva.codigo);
      setElText('exito-res-cliente', reserva.cliente);
      setElText('exito-res-fecha', reserva.fecha);
      setElText('exito-res-hora', reserva.hora);
      setElText('exito-res-personas', `${reserva.personas} personas`);
      setElText('exito-res-mesa', reserva.mesaNombre);
      setElText('exito-res-zona', reserva.zona);

      if ($) {
        $(modalExito).fadeIn(350).addClass('show');
      } else {
        modalExito.style.display = 'flex';
      }
    },

    // Reanudar si había una reserva en progreso al recargar
    verificarReservaPendienteAlRecargar() {
      const temp = Storage.get('reserva_temporal');
      if (!temp || !temp.limiteTimestamp) return;

      const ahora = Date.now();
      const segundosRestantes = Math.ceil((temp.limiteTimestamp - ahora) / 1000);

      if (segundosRestantes > 0) {
        console.log(`Reanudando temporizador con ${segundosRestantes} segundos restantes.`);
        this.iniciar(temp.datos);
      } else {
        Storage.remove('reserva_temporal');
      }
    }
  };

  AUREA.Temporizador = Temporizador;

})(window, document);
