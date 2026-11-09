/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/app.js — Orquestador Principal, Menú Lateral, Temas y Efectos jQuery
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;
  const Bitacoras = AUREA.Bitacoras;
  const $ = window.jQuery;

  // Sistema de notificaciones toast accesibles
  AUREA.mostrarToast = function (mensaje, tipo = 'info') {
    let container = document.getElementById('toast-container-global');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toast-container-global';
      container.className = 'toast-container-custom';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast-item-custom toast-${tipo}`;
    let icono = 'bi-info-circle';
    if (tipo === 'success') icono = 'bi-check2-circle';
    else if (tipo === 'warning') icono = 'bi-exclamation-triangle';
    else if (tipo === 'danger') icono = 'bi-x-octagon';

    toast.innerHTML = `
      <div class="d-flex align-items-center gap-2">
        <i class="bi ${icono} fs-5 text-gold"></i>
        <div class="flex-grow-1 small">${mensaje}</div>
        <button type="button" class="btn-close-toast" aria-label="Cerrar"><i class="bi bi-x"></i></button>
      </div>
    `;

    container.appendChild(toast);

    if ($) {
      $(toast).hide().fadeIn(300);
    }

    const removeToast = () => {
      if ($) {
        $(toast).fadeOut(300, () => toast.remove());
      } else {
        toast.remove();
      }
    };

    const timer = setTimeout(removeToast, 4000);
    toast.querySelector('.btn-close-toast').addEventListener('click', () => {
      clearTimeout(timer);
      removeToast();
    });
  };

  // ==========================================
  // INICIALIZACIÓN CON $(document).ready()
  // ==========================================

  $(document).ready(function () {
    console.log('AUREA Gastronomy initialized via jQuery $(document).ready()');

    // 1. Inicializar tema
    initTema();

    // 2. Inicializar menú hamburguesa y panel lateral
    initMenuLateral();

    // 3. Inicializar acordeones jQuery requeridos
    initAcordeonesJQuery();

    // 4. Inicializar selector interactivo de especialidades
    initEspecialidadesInteractivas();

    // 5. Inicializar catálogo y filtros
    if (AUREA.Catalogo && AUREA.Catalogo.init) {
      AUREA.Catalogo.init();
    }
    if (AUREA.Filtros && AUREA.Filtros.init) {
      AUREA.Filtros.init();
    }

    // 6. Inicializar reservas y calculadora
    if (AUREA.Reservas && AUREA.Reservas.init) {
      AUREA.Reservas.init();
    }

    // 7. Verificar si había temporizador activo al recargar
    if (AUREA.Temporizador && AUREA.Temporizador.verificarReservaPendienteAlRecargar) {
      AUREA.Temporizador.verificarReservaPendienteAlRecargar();
    }

    // 8. Formulario de contacto
    initFormularioContacto();

    // 9. Desplazamiento suave de enlaces y scrollspy
    initNavegacionSuave();

    // 10. Sincronización entre pestañas (Storage Event)
    initSincronizacionPestanas();

    // Registrar bitácora de visita
    Bitacoras.registrar({
      modulo: 'Navegación',
      tipo: 'PAGINA',
      accion: 'APERTURA_PAGINA_CLIENTE',
      descripcion: 'Acceso a la página pública de AUREA Restaurante',
      resultado: 'EXITOSO',
      origen: 'Cliente'
    });
  });

  // ==========================================
  // TEMA CLARO Y OSCURO
  // ==========================================

  function initTema() {
    const temaGuardado = Storage.getRaw('theme', 'dark');
    document.documentElement.setAttribute('data-theme', temaGuardado);
    actualizarIconoTema(temaGuardado);

    $('.btn-toggle-theme').on('click', function (e) {
      e.preventDefault();
      const actual = document.documentElement.getAttribute('data-theme') || 'dark';
      const nuevo = actual === 'dark' ? 'light' : 'dark';

      document.documentElement.setAttribute('data-theme', nuevo);
      Storage.setRaw('theme', nuevo);
      actualizarIconoTema(nuevo);

      Bitacoras.registrar({
        modulo: 'Tema',
        tipo: 'TEMA',
        accion: 'CAMBIO_TEMA',
        descripcion: `Cambio de modo visual a: ${nuevo === 'dark' ? 'Modo Noche (Oscuro)' : 'Modo Marfil (Claro)'}`,
        resultado: 'EXITOSO',
        origen: 'Cliente',
        metadata: { tema: nuevo }
      });

      AUREA.mostrarToast(
        nuevo === 'dark' ? 'Modo Oscuro Carbón activado' : 'Modo Claro Marfil activado',
        'info'
      );
    });
  }

  function actualizarIconoTema(tema) {
    const iconos = $('.btn-toggle-theme i');
    if (tema === 'dark') {
      iconos.removeClass('bi-moon-stars-fill').addClass('bi-sun-fill');
      $('.btn-toggle-theme').attr('title', 'Cambiar a modo claro');
    } else {
      iconos.removeClass('bi-sun-fill').addClass('bi-moon-stars-fill');
      $('.btn-toggle-theme').attr('title', 'Cambiar a modo oscuro');
    }
  }

  // ==========================================
  // MENÚ LATERAL Y HAMBURGUESA
  // ==========================================

  function initMenuLateral() {
    const $drawer = $('#side-drawer-nav');
    const $backdrop = $('#side-drawer-backdrop');
    const $btnOpen = $('#btn-hamburger-toggle');
    const $btnClose = $('#btn-close-drawer');

    function abrirDrawer() {
      $drawer.addClass('open');
      $backdrop.fadeIn(250);
      $('body').addClass('overflow-hidden');

      Bitacoras.registrar({
        modulo: 'Navegación',
        tipo: 'MENU',
        accion: 'ABRIR_MENU_LATERAL',
        descripcion: 'Apertura del panel lateral de navegación',
        resultado: 'EXITOSO',
        origen: 'Cliente'
      });
    }

    function cerrarDrawer() {
      $drawer.removeClass('open');
      $backdrop.fadeOut(250);
      $('body').removeClass('overflow-hidden');

      Bitacoras.registrar({
        modulo: 'Navegación',
        tipo: 'MENU',
        accion: 'CERRAR_MENU_LATERAL',
        descripcion: 'Cierre del panel lateral de navegación',
        resultado: 'EXITOSO',
        origen: 'Cliente'
      });
    }

    $btnOpen.on('click', function (e) {
      e.preventDefault();
      abrirDrawer();
    });

    $btnClose.on('click', function (e) {
      e.preventDefault();
      cerrarDrawer();
    });

    $backdrop.on('click', function () {
      cerrarDrawer();
    });

    // Cerrar con Escape
    $(document).on('keydown', function (e) {
      if (e.key === 'Escape' && $drawer.hasClass('open')) {
        cerrarDrawer();
      }
    });

    // Cerrar drawer al hacer clic en un link interno
    $('.drawer-nav-link').on('click', function () {
      cerrarDrawer();
    });
  }

  // ==========================================
  // ACORDEONES CON JQUERY (REQUISITO PRÁCTICA)
  // ==========================================

  function initAcordeonesJQuery() {
    // Uso explícito de $(document).ready(), click(), slideToggle(), addClass(), removeClass(), html()
    $('.aurea-accordion-header').on('click', function () {
      const $header = $(this);
      const $content = $header.next('.aurea-accordion-body');
      const $icon = $header.find('.accordion-icon');
      const estaAbierto = $content.is(':visible');

      // Si queremos comportamiento exclusivo (cerrar otros)
      const $parent = $header.closest('.aurea-accordion-group');
      if ($parent.hasClass('exclusive')) {
        $parent.find('.aurea-accordion-body').slideUp(280);
        $parent.find('.aurea-accordion-header').removeClass('active');
        $parent.find('.accordion-icon').removeClass('bi-chevron-up').addClass('bi-chevron-down');
      }

      if (estaAbierto) {
        $content.slideUp(280);
        $header.removeClass('active');
        $icon.removeClass('bi-chevron-up').addClass('bi-chevron-down');
      } else {
        $content.slideToggle(280);
        $header.addClass('active');
        $icon.removeClass('bi-chevron-down').addClass('bi-chevron-up');

        // Registro de bitácora
        const titulo = $header.find('.accordion-title').text().trim();
        Bitacoras.registrar({
          modulo: 'Catálogo',
          tipo: 'ACORDEON',
          accion: 'EXPANDIR_ACORDEON',
          descripcion: `Despliegue de acordeón informativo: "${titulo}"`,
          resultado: 'EXITOSO',
          origen: 'Cliente',
          metadata: { titulo }
        });
      }
    });
  }

  // ==========================================
  // ESPECIALIDADES INTERACTIVAS (CAMBIO DINÁMICO DE ESTILOS Y FONDO)
  // ==========================================

  function initEspecialidadesInteractivas() {
    const datosEspecialidades = {
      trufa: {
        titulo: 'Sinfonía de Trufa Blanca & Terroir',
        desc: 'Una exploración sensorial de trufas silvestres de Alba, mantequilla de pasturas altas y carnes maduradas en seco a fuego lento.',
        icono: 'bi-gem',
        bgGradient: 'radial-gradient(circle at 80% 20%, rgba(212, 175, 55, 0.18) 0%, rgba(23, 19, 17, 0.98) 70%)',
        platoImg: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
        maridaje: 'Infusión botánica de flor de sauco y perlas cítricas'
      },
      mar: {
        titulo: 'Tributo Oceánico de Profundidad',
        desc: 'Pesca artesanal seleccionada, emulsiones de algas de roca, pulpo a la brasa de quebracho y bisque de crustáceos nobles.',
        icono: 'bi-water',
        bgGradient: 'radial-gradient(circle at 80% 20%, rgba(56, 128, 135, 0.22) 0%, rgba(20, 26, 28, 0.98) 70%)',
        platoImg: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80',
        maridaje: 'Mocktail de té jazmín blanco con cordial de pomelo rosado'
      },
      huerto: {
        titulo: 'Botanical & Huerto Orgánico',
        desc: 'Vegetales ancestrales cosechados al alba, risottos mantecados con azafrán de La Mancha y flores comestibles de temporada.',
        icono: 'bi-flower1',
        bgGradient: 'radial-gradient(circle at 80% 20%, rgba(74, 93, 78, 0.25) 0%, rgba(23, 29, 24, 0.98) 70%)',
        platoImg: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=900&q=80',
        maridaje: 'Agua mineral de vertiente infusionada con romero y frutos del bosque'
      }
    };

    $('.pill-especialidad-selector').on('click', function () {
      $('.pill-especialidad-selector').removeClass('active');
      $(this).addClass('active');

      const espKey = $(this).data('esp');
      const data = datosEspecialidades[espKey];
      if (!data) return;

      const $box = $('#box-especialidad-destacada');
      if ($box.length) {
        $box.css('background', data.bgGradient);
        $('#esp-titulo').html(data.titulo);
        $('#esp-desc').text(data.desc);
        $('#esp-icono').attr('class', `bi ${data.icono} fs-1 text-gold me-3`);
        $('#esp-img').attr('src', data.platoImg);
        $('#esp-maridaje').text(data.maridaje);

        // Microanimación jQuery
        $box.hide().fadeIn(350);

        Bitacoras.registrar({
          modulo: 'Catálogo',
          tipo: 'INTERACCION',
          accion: 'CAMBIO_ESPECIALIDAD_DESTACADA',
          descripcion: `Selección de especialidad dinámica: ${data.titulo}`,
          resultado: 'EXITOSO',
          origen: 'Cliente',
          metadata: { especialidad: espKey }
        });
      }
    });
  }

  // ==========================================
  // FORMULARIO DE CONTACTO
  // ==========================================

  function initFormularioContacto() {
    $('#form-contacto').on('submit', function (e) {
      e.preventDefault();

      const $nombre = $('#contacto-nombre');
      const $correo = $('#contacto-correo');
      const $telefono = $('#contacto-telefono');
      const $asunto = $('#contacto-asunto');
      const $mensaje = $('#contacto-mensaje');

      let valido = true;

      const errNom = AUREA.Validaciones.nombre($nombre.val());
      if (errNom) {
        AUREA.Validaciones.marcarError($nombre[0], errNom);
        valido = false;
      } else {
        AUREA.Validaciones.marcarValido($nombre[0]);
      }

      const errCor = AUREA.Validaciones.correo($correo.val());
      if (errCor) {
        AUREA.Validaciones.marcarError($correo[0], errCor);
        valido = false;
      } else {
        AUREA.Validaciones.marcarValido($correo[0]);
      }

      const errTel = AUREA.Validaciones.telefono($telefono.val(), false);
      if (errTel) {
        AUREA.Validaciones.marcarError($telefono[0], errTel);
        valido = false;
      } else if ($telefono.val()) {
        AUREA.Validaciones.marcarValido($telefono[0]);
      }

      const errAsu = AUREA.Validaciones.asunto($asunto.val());
      if (errAsu) {
        AUREA.Validaciones.marcarError($asunto[0], errAsu);
        valido = false;
      } else {
        AUREA.Validaciones.marcarValido($asunto[0]);
      }

      const errMen = AUREA.Validaciones.mensaje($mensaje.val());
      if (errMen) {
        AUREA.Validaciones.marcarError($mensaje[0], errMen);
        valido = false;
      } else {
        AUREA.Validaciones.marcarValido($mensaje[0]);
      }

      if (valido) {
        const datos = {
          nombre: $nombre.val().trim(),
          correo: $correo.val().trim(),
          asunto: $asunto.val().trim()
        };

        $('#contacto-status-msg').html(`
          <div class="alert alert-success d-flex align-items-center gap-2 mt-3" role="alert">
            <i class="bi bi-check-circle-fill fs-5 text-success"></i>
            <div>
              <strong>¡Mensaje recibido con distinción!</strong> Estimado/a ${datos.nombre}, nuestro concierge gastronómico se pondrá en contacto al correo proporcionado en menos de 24 horas.
            </div>
          </div>
        `).hide().fadeIn(300);

        $('#form-contacto')[0].reset();
        $('.is-valid').removeClass('is-valid');

        Bitacoras.registrar({
          modulo: 'Contacto',
          tipo: 'FORMULARIO',
          accion: 'ENVIO_MENSAJE_CONTACTO',
          descripcion: `Envío de consulta de contacto por ${datos.nombre} con asunto: "${datos.asunto}"`,
          resultado: 'EXITOSO',
          origen: 'Cliente',
          metadata: { remitente: datos.nombre, asunto: datos.asunto }
        });
      } else {
        Bitacoras.registrar({
          modulo: 'Contacto',
          tipo: 'VALIDACION',
          accion: 'ERROR_FORMULARIO_CONTACTO',
          descripcion: 'Intento fallido de envío de formulario de contacto por campos no válidos',
          resultado: 'FALLIDO',
          origen: 'Cliente'
        });
      }
    });
  }

  // ==========================================
  // NAVEGACIÓN SUAVE & SCROLLSPY
  // ==========================================

  function initNavegacionSuave() {
    $('a[href^="#"]').on('click', function (e) {
      const target = $(this.getAttribute('href'));
      if (target.length) {
        e.preventDefault();
        $('html, body').stop().animate({
          scrollTop: target.offset().top - 75
        }, 500);

        // Actualizar activo
        $('.nav-link-custom').removeClass('active');
        $(`.nav-link-custom[href="${this.getAttribute('href')}"]`).addClass('active');
      }
    });

    // Scrollspy liviano
    $(window).on('scroll', function () {
      const scrollPos = $(document).scrollTop() + 100;
      $('section[id]').each(function () {
        const top = $(this).offset().top;
        const bottom = top + $(this).outerHeight();
        const id = $(this).attr('id');

        if (scrollPos >= top && scrollPos <= bottom) {
          $('.nav-link-custom').removeClass('active');
          $(`.nav-link-custom[href="#${id}"]`).addClass('active');
        }
      });
    });
  }

  // ==========================================
  // SINCRONIZACIÓN DE PESTAÑAS (STORAGE EVENT)
  // ==========================================

  function initSincronizacionPestanas() {
    window.addEventListener('storage', function (e) {
      if (e.key === 'aurea_theme') {
        const nuevo = e.newValue || 'dark';
        document.documentElement.setAttribute('data-theme', nuevo);
        actualizarIconoTema(nuevo);
      } else if (e.key === 'aurea_platos') {
        if (AUREA.Catalogo && AUREA.Catalogo.cargarPlatos) {
          AUREA.Catalogo.cargarPlatos();
        }
      } else if (e.key === 'aurea_favoritos') {
        if (AUREA.Catalogo && AUREA.Catalogo.actualizarContadorFavoritos) {
          AUREA.Catalogo.actualizarContadorFavoritos();
        }
      }
    });
  }

})(window, document);
