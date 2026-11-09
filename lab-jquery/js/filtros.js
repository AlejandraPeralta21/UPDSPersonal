/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/filtros.js — Categorías Jerárquicas, Filtros Combinados y Búsqueda
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;
  const Bitacoras = AUREA.Bitacoras;
  const $ = window.jQuery;

  // Estado reactivo de los filtros
  const estadoFiltros = {
    categoria: 'todas',
    subcategoria: 'todas',
    busqueda: '',
    precioMax: 400,
    soloVegetariano: false,
    picante: 'todos',
    orden: 'popular'
  };

  let debounceTimer = null;

  const Filtros = {
    init() {
      this.renderizarTabsCategorias();
      this.actualizarPillsSubcategorias();
      this.vincularEventos();
      this.aplicarFiltros();
    },

    // Renderizar botones o pills de categorías principales
    renderizarTabsCategorias() {
      const categorias = Storage.get('categorias', []);
      const contenedor = document.getElementById('filter-categorias-container');
      if (!contenedor) return;

      let html = `
        <button
          type="button"
          class="btn-categoria-tab ${estadoFiltros.categoria === 'todas' ? 'activo' : ''}"
          data-categoria="todas"
        >
          <i class="bi bi-grid me-1"></i>Todas las categorías
        </button>
      `;

      categorias.forEach(cat => {
        html += `
          <button
            type="button"
            class="btn-categoria-tab ${estadoFiltros.categoria === cat.id ? 'activo' : ''}"
            data-categoria="${cat.id}"
          >
            <i class="bi ${cat.icono || 'bi-bookmark'} me-1"></i>${cat.nombre}
          </button>
        `;
      });

      contenedor.innerHTML = html;
    },

    // Actualizar dinámicamente las subcategorías según la categoría activa
    actualizarPillsSubcategorias() {
      const contenedor = document.getElementById('filter-subcategorias-container');
      if (!contenedor) return;

      if (estadoFiltros.categoria === 'todas') {
        contenedor.style.display = 'none';
        estadoFiltros.subcategoria = 'todas';
        return;
      }

      const categorias = Storage.get('categorias', []);
      const catActual = categorias.find(c => c.id === estadoFiltros.categoria);

      if (!catActual || !catActual.subcategorias || catActual.subcategorias.length === 0) {
        contenedor.style.display = 'none';
        estadoFiltros.subcategoria = 'todas';
        return;
      }

      contenedor.style.display = 'flex';

      let html = `
        <button
          type="button"
          class="btn-subcategoria-pill ${estadoFiltros.subcategoria === 'todas' ? 'activo' : ''}"
          data-subcategoria="todas"
        >
          Todas las subcategorías
        </button>
      `;

      catActual.subcategorias.forEach(sub => {
        html += `
          <button
            type="button"
            class="btn-subcategoria-pill ${estadoFiltros.subcategoria === sub ? 'activo' : ''}"
            data-subcategoria="${sub}"
          >
            ${sub}
          </button>
        `;
      });

      contenedor.innerHTML = html;
    },

    // Renderizar chips de filtros activos
    renderizarChipsActivos() {
      const contenedor = document.getElementById('filtros-chips-activos');
      if (!contenedor) return;

      const chips = [];

      if (estadoFiltros.categoria !== 'todas') {
        const categorias = Storage.get('categorias', []);
        const cat = categorias.find(c => c.id === estadoFiltros.categoria);
        const nombreCat = cat ? cat.nombre : estadoFiltros.categoria;
        chips.push({ tipo: 'categoria', label: `Categoría: ${nombreCat}` });
      }

      if (estadoFiltros.subcategoria !== 'todas') {
        chips.push({ tipo: 'subcategoria', label: `Subcategoría: ${estadoFiltros.subcategoria}` });
      }

      if (estadoFiltros.busqueda.trim() !== '') {
        chips.push({ tipo: 'busqueda', label: `Búsqueda: "${estadoFiltros.busqueda}"` });
      }

      if (Number(estadoFiltros.precioMax) < 400) {
        chips.push({ tipo: 'precio', label: `Hasta Bs. ${estadoFiltros.precioMax}` });
      }

      if (estadoFiltros.soloVegetariano) {
        chips.push({ tipo: 'vegetariano', label: 'Solo Vegetarianos' });
      }

      if (estadoFiltros.picante !== 'todos') {
        chips.push({ tipo: 'picante', label: `Picante: Nivel ${estadoFiltros.picante}` });
      }

      if (chips.length === 0) {
        contenedor.innerHTML = '';
        contenedor.style.display = 'none';
        return;
      }

      contenedor.style.display = 'flex';
      let html = '<div class="d-flex flex-wrap align-items-center gap-2">';
      html += '<span class="text-muted small me-1"><i class="bi bi-funnel-fill text-gold me-1"></i>Filtros aplicados:</span>';

      chips.forEach(chip => {
        html += `
          <span class="filter-active-chip">
            ${chip.label}
            <button type="button" class="btn-remove-chip" data-chip-tipo="${chip.tipo}" aria-label="Quitar filtro">
              <i class="bi bi-x"></i>
            </button>
          </span>
        `;
      });

      html += `
        <button type="button" class="btn btn-link text-gold btn-sm p-0 ms-2 text-decoration-none" id="btn-limpiar-todos-filtros">
          <i class="bi bi-arrow-counterclockwise me-1"></i>Restablecer todo
        </button>
      `;
      html += '</div>';

      contenedor.innerHTML = html;
    },

    // Aplicar lógica combinada sobre los platos del catálogo
    aplicarFiltros() {
      const platos = Storage.get('platos', []).filter(p => p.activo !== false);

      let filtrados = platos.filter(p => {
        // Categoría
        if (estadoFiltros.categoria !== 'todas') {
          if (p.categoria.toLowerCase() !== estadoFiltros.categoria.toLowerCase()) {
            return false;
          }
        }

        // Subcategoría
        if (estadoFiltros.subcategoria !== 'todas') {
          if (!p.subcategoria || p.subcategoria.toLowerCase() !== estadoFiltros.subcategoria.toLowerCase()) {
            return false;
          }
        }

        // Búsqueda por texto (nombre, ingredientes o descripción)
        if (estadoFiltros.busqueda.trim() !== '') {
          const q = estadoFiltros.busqueda.trim().toLowerCase();
          const enNombre = (p.nombre || '').toLowerCase().includes(q);
          const enDesc = (p.descripcion || '').toLowerCase().includes(q);
          const enIngredientes = (p.ingredientes || []).some(i => i.toLowerCase().includes(q));
          if (!enNombre && !enDesc && !enIngredientes) {
            return false;
          }
        }

        // Precio máximo
        if (Number(p.precio) > Number(estadoFiltros.precioMax)) {
          return false;
        }

        // Solo vegetariano
        if (estadoFiltros.soloVegetariano && !p.vegetariano) {
          return false;
        }

        // Picante
        if (estadoFiltros.picante !== 'todos') {
          const nivel = Number(estadoFiltros.picante);
          if (Number(p.picante || 0) !== nivel) {
            return false;
          }
        }

        return true;
      });

      // Ordenamiento
      switch (estadoFiltros.orden) {
        case 'precio-asc':
          filtrados.sort((a, b) => a.precio - b.precio);
          break;
        case 'precio-desc':
          filtrados.sort((a, b) => b.precio - a.precio);
          break;
        case 'nombre-asc':
          filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));
          break;
        case 'nombre-desc':
          filtrados.sort((a, b) => b.nombre.localeCompare(a.nombre));
          break;
        case 'tiempo':
          filtrados.sort((a, b) => parseInt(a.tiempo || '20') - parseInt(b.tiempo || '20'));
          break;
        case 'popular':
        default:
          filtrados.sort((a, b) => (b.destacado ? 1 : 0) - (a.destacado ? 1 : 0));
          break;
      }

      this.renderizarChipsActivos();

      // Entregar resultados a AUREA.Catalogo
      if (AUREA.Catalogo && AUREA.Catalogo.renderizar) {
        AUREA.Catalogo.renderizar(filtrados);
      }
    },

    // Restablecer todos los filtros
    limpiarFiltros() {
      estadoFiltros.categoria = 'todas';
      estadoFiltros.subcategoria = 'todas';
      estadoFiltros.busqueda = '';
      estadoFiltros.precioMax = 400;
      estadoFiltros.soloVegetariano = false;
      estadoFiltros.picante = 'todos';
      estadoFiltros.orden = 'popular';

      // Sincronizar inputs del DOM
      const inputBusqueda = document.getElementById('catalogo-busqueda');
      if (inputBusqueda) inputBusqueda.value = '';

      const sliderPrecio = document.getElementById('filtro-precio-slider');
      const valPrecio = document.getElementById('filtro-precio-val');
      if (sliderPrecio) sliderPrecio.value = 400;
      if (valPrecio) valPrecio.textContent = '400';

      const checkVeg = document.getElementById('filtro-vegetariano-check');
      if (checkVeg) checkVeg.checked = false;

      const selectPicante = document.getElementById('filtro-picante-select');
      if (selectPicante) selectPicante.value = 'todos';

      const selectOrden = document.getElementById('filtro-orden-select');
      if (selectOrden) selectOrden.value = 'popular';

      this.renderizarTabsCategorias();
      this.actualizarPillsSubcategorias();
      this.aplicarFiltros();

      Bitacoras.registrar({
        modulo: 'Filtros',
        tipo: 'FILTRO',
        accion: 'LIMPIAR_FILTROS',
        descripcion: 'Restablecimiento de todos los filtros del catálogo',
        resultado: 'EXITOSO',
        origen: 'Cliente'
      });
    },

    // Vincular eventos de escucha
    vincularEventos() {
      const self = this;

      // Click en tab de categoría
      $(document).on('click', '.btn-categoria-tab', function (e) {
        e.preventDefault();
        $('.btn-categoria-tab').removeClass('activo');
        $(this).addClass('activo');
        const cat = $(this).data('categoria');
        estadoFiltros.categoria = cat;
        estadoFiltros.subcategoria = 'todas';
        self.actualizarPillsSubcategorias();
        self.aplicarFiltros();

        Bitacoras.registrar({
          modulo: 'Catálogo',
          tipo: 'FILTRO',
          accion: 'SELECCIONAR_CATEGORIA',
          descripcion: `Filtro por categoría: ${cat}`,
          resultado: 'EXITOSO',
          origen: 'Cliente',
          metadata: { categoria: cat }
        });
      });

      // Click en pill de subcategoría
      $(document).on('click', '.btn-subcategoria-pill', function (e) {
        e.preventDefault();
        $('.btn-subcategoria-pill').removeClass('activo');
        $(this).addClass('activo');
        const sub = $(this).data('subcategoria');
        estadoFiltros.subcategoria = sub;
        self.aplicarFiltros();

        Bitacoras.registrar({
          modulo: 'Catálogo',
          tipo: 'FILTRO',
          accion: 'SELECCIONAR_SUBCATEGORIA',
          descripcion: `Filtro por subcategoría: ${sub} en categoría ${estadoFiltros.categoria}`,
          resultado: 'EXITOSO',
          origen: 'Cliente',
          metadata: { categoria: estadoFiltros.categoria, subcategoria: sub }
        });
      });

      // Búsqueda por texto con debounce
      $(document).on('input', '#catalogo-busqueda', function () {
        const val = $(this).val();
        estadoFiltros.busqueda = val;
        clearTimeout(debounceTimer);
        debounceTimer = setTimeout(() => {
          self.aplicarFiltros();
          if (val.trim().length >= 2) {
            Bitacoras.registrar({
              modulo: 'Catálogo',
              tipo: 'BUSQUEDA',
              accion: 'BUSQUEDA_PLATO',
              descripcion: `Búsqueda en catálogo de "${val.trim()}"`,
              resultado: 'EXITOSO',
              origen: 'Cliente',
              metadata: { termino: val.trim() }
            });
          }
        }, 300);
      });

      // Atajo de teclado '/' para enfocar el buscador
      $(document).on('keydown', function (e) {
        if (e.key === '/' && !$(e.target).is('input, textarea, select')) {
          e.preventDefault();
          const input = $('#catalogo-busqueda');
          if (input.length) {
            input.focus();
            $('html, body').animate({
              scrollTop: $('#seccion-carta').offset().top - 80
            }, 300);
          }
        }
      });

      // Slider de precio
      $(document).on('input change', '#filtro-precio-slider', function () {
        const precio = $(this).val();
        $('#filtro-precio-val').text(precio);
        estadoFiltros.precioMax = Number(precio);
        self.aplicarFiltros();
      });

      // Checkbox vegetariano
      $(document).on('change', '#filtro-vegetariano-check', function () {
        estadoFiltros.soloVegetariano = $(this).is(':checked');
        self.aplicarFiltros();
      });

      // Selector de picante
      $(document).on('change', '#filtro-picante-select', function () {
        estadoFiltros.picante = $(this).val();
        self.aplicarFiltros();
      });

      // Selector de orden
      $(document).on('change', '#filtro-orden-select', function () {
        estadoFiltros.orden = $(this).val();
        self.aplicarFiltros();
      });

      // Quitar un chip individual
      $(document).on('click', '.btn-remove-chip', function (e) {
        e.preventDefault();
        const tipo = $(this).data('chip-tipo');
        if (tipo === 'categoria') {
          estadoFiltros.categoria = 'todas';
          estadoFiltros.subcategoria = 'todas';
          self.renderizarTabsCategorias();
          self.actualizarPillsSubcategorias();
        } else if (tipo === 'subcategoria') {
          estadoFiltros.subcategoria = 'todas';
          self.actualizarPillsSubcategorias();
        } else if (tipo === 'busqueda') {
          estadoFiltros.busqueda = '';
          $('#catalogo-busqueda').val('');
        } else if (tipo === 'precio') {
          estadoFiltros.precioMax = 400;
          $('#filtro-precio-slider').val(400);
          $('#filtro-precio-val').text('400');
        } else if (tipo === 'vegetariano') {
          estadoFiltros.soloVegetariano = false;
          $('#filtro-vegetariano-check').prop('checked', false);
        } else if (tipo === 'picante') {
          estadoFiltros.picante = 'todos';
          $('#filtro-picante-select').val('todos');
        }
        self.aplicarFiltros();
      });

      // Limpiar todos los filtros
      $(document).on('click', '#btn-limpiar-todos-filtros, #btn-vaciar-filtros-vacio', function (e) {
        e.preventDefault();
        self.limpiarFiltros();
      });
    }
  };

  AUREA.Filtros = Filtros;

})(window, document);
