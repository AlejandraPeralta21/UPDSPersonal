/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/validaciones.js — Validaciones de Formularios y Feedback Visual
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});

  const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
  const PHONE_REGEX = /^[67]\d{6,7}$/; // Celulares Bolivia: 8 dígitos iniciando en 6 o 7

  const Validaciones = {
    // Nombre completo: mínimo 3 caracteres, letras y espacios
    nombre(valor) {
      const v = String(valor || '').trim();
      if (!v) return 'El nombre completo es obligatorio.';
      if (v.length < 3) return 'El nombre debe tener al menos 3 caracteres.';
      if (v.length > 70) return 'El nombre no puede exceder los 70 caracteres.';
      if (!/^[A-Za-zÁÉÍÓÚÜÑáéíóúüñ' .-]+$/.test(v)) {
        return 'El nombre solo puede contener letras y espacios.';
      }
      return '';
    },

    // Correo electrónico
    correo(valor) {
      const v = String(valor || '').trim();
      if (!v) return 'El correo electrónico es obligatorio.';
      if (!EMAIL_REGEX.test(v)) return 'Ingresa un correo electrónico válido (ej. usuario@dominio.com).';
      if (v.length > 100) return 'El correo es demasiado largo.';
      return '';
    },

    // Teléfono (celular boliviano)
    telefono(valor) {
      const v = String(valor || '').trim();
      if (!v) return 'El número de teléfono es obligatorio.';
      let digitos = v.replace(/[\s()+.-]/g, '');
      if (digitos.startsWith('591')) digitos = digitos.slice(3);
      if (!/^\d+$/.test(digitos)) return 'El teléfono solo debe contener números.';
      if (!PHONE_REGEX.test(digitos)) {
        return 'Ingresa un celular boliviano válido (ej. 71234567 o 68901234).';
      }
      return '';
    },

    // Fecha de reserva: hoy en adelante, máximo 90 días
    fecha(valor) {
      if (!valor) return 'Selecciona la fecha de tu reserva.';
      const hoy = new Date();
      hoy.setHours(0, 0, 0, 0);

      const partes = valor.split('-');
      if (partes.length !== 3) return 'Formato de fecha inválido.';
      const seleccionada = new Date(parseInt(partes[0], 10), parseInt(partes[1], 10) - 1, parseInt(partes[2], 10));

      if (isNaN(seleccionada.getTime())) return 'La fecha indicada no es válida.';
      if (seleccionada < hoy) return 'La fecha no puede ser anterior al día de hoy.';

      const limite = new Date();
      limite.setDate(hoy.getDate() + 90);
      if (seleccionada > limite) return 'Las reservas solo se admiten hasta 90 días en el futuro.';

      return '';
    },

    // Hora de reserva: dentro del horario permitido (12:00 a 22:30)
    hora(valor) {
      if (!valor) return 'Selecciona la hora de la reserva.';
      const partes = valor.split(':').map(Number);
      if (partes.length !== 2 || isNaN(partes[0]) || isNaN(partes[1])) {
        return 'Hora no válida.';
      }
      const minutosTotales = partes[0] * 60 + partes[1];
      const minApertura = 12 * 60; // 12:00
      const maxCierre = 22 * 60 + 30; // 22:30 (para terminar a las 23:30)

      if (minutosTotales < minApertura || minutosTotales > maxCierre) {
        return 'El horario de reservas es de 12:00 a 22:30.';
      }
      return '';
    },

    // Cantidad de personas
    personas(valor, capacidadMaxima = 12) {
      const num = Number(valor);
      if (!valor || isNaN(num)) return 'Indica el número de personas.';
      if (!Number.isInteger(num)) return 'La cantidad debe ser un número entero.';
      if (num < 1) return 'Debe haber al menos 1 persona.';
      if (num > capacidadMaxima) {
        return `La capacidad máxima para esta opción es de ${capacidadMaxima} personas.`;
      }
      return '';
    },

    // Selección requerida (select o radio)
    seleccion(valor, campoNombre = 'este campo') {
      if (!valor || String(valor).trim() === '') {
        return `Por favor selecciona ${campoNombre}.`;
      }
      return '';
    },

    // Términos y condiciones
    terminos(isChecked) {
      if (!isChecked) {
        return 'Debes aceptar los términos y condiciones de reserva.';
      }
      return '';
    },

    // Asunto de contacto
    asunto(valor) {
      const v = String(valor || '').trim();
      if (!v) return 'El asunto es obligatorio.';
      if (v.length < 4) return 'El asunto debe tener al menos 4 caracteres.';
      return '';
    },

    // Mensaje de contacto
    mensaje(valor) {
      const v = String(valor || '').trim();
      if (!v) return 'El mensaje no puede estar vacío.';
      if (v.length < 10) return 'El mensaje debe tener al menos 10 caracteres.';
      if (v.length > 500) return 'El mensaje no puede exceder los 500 caracteres.';
      return '';
    },

    // ==========================================
    // HELPERS VISUALES DE DOM
    // ==========================================

    marcarError(inputEl, mensaje) {
      if (!inputEl) return;
      inputEl.classList.add('is-invalid');
      inputEl.classList.remove('is-valid');

      let feedback = inputEl.parentElement.querySelector('.invalid-feedback-custom');
      if (!feedback) {
        feedback = document.createElement('div');
        feedback.className = 'invalid-feedback-custom';
        inputEl.parentElement.appendChild(feedback);
      }
      feedback.innerHTML = `<i class="bi bi-exclamation-circle me-1"></i>${mensaje}`;
      feedback.style.display = 'block';
    },

    limpiarError(inputEl) {
      if (!inputEl) return;
      inputEl.classList.remove('is-invalid');
      const feedback = inputEl.parentElement.querySelector('.invalid-feedback-custom');
      if (feedback) {
        feedback.style.display = 'none';
        feedback.innerHTML = '';
      }
    },

    marcarValido(inputEl) {
      if (!inputEl) return;
      inputEl.classList.remove('is-invalid');
      inputEl.classList.add('is-valid');
      const feedback = inputEl.parentElement.querySelector('.invalid-feedback-custom');
      if (feedback) {
        feedback.style.display = 'none';
        feedback.innerHTML = '';
      }
    }
  };

  AUREA.Validaciones = Validaciones;

})(window, document);
