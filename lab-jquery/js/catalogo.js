/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/catalogo.js — Catálogo Gastronómico, Modal de Detalle y Favoritos
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;
  const Bitacoras = AUREA.Bitacoras;
  const $ = window.jQuery;

  // Iconos de picante
  function renderPicante(nivel) {
    if (!nivel || nivel <= 0) return '';
    let chilis = '';
    for (let i = 0; i < nivel; i++) {
      chilis += '<i class="bi bi-fire text-danger" title="Picante nivel ' + nivel + '"></i>';
    }
    return `<span class="badge-spicy ms-1">${chilis}</span>`;
  }

  // Fallback visual de imagen si la URL remota falla o está offline
  const SVG_FOOD_FALLBACK = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="400" viewBox="0 0 600 400"><rect width="100%" height="100%" fill="%231a1614"/><text x="50%" y="46%" font-family="Georgia,serif" font-size="28" fill="%23d4af37" text-anchor="middle" dominant-baseline="middle">AUREA FINE DINING</text><text x="50%" y="58%" font-family="sans-serif" font-size="14" fill="%23a89e90" text-anchor="middle" dominant-baseline="middle">Fotografía Gastronómica de Alta Cocina</text></svg>';

  const Catalogo = {
    platosActuales: [],

    // Inicializar catálogo gastronómico
    init() {
      this.cargarPlatos();
      this.actualizarContadorFavoritos();
      this.vincularEventos();
    },

    // Obtener lista activa de platos desde Storage
    cargarPlatos() {
      const platos = Storage.get('platos', []);
      // Mostrar solo platos activos para los clientes
      this.platosActuales = platos.filter(p => p.activo !== false);
      this.renderizar(this.platosActuales);
    },

    // Renderizar tarjetas gastronómicas en el DOM
    renderizar(listaPlatos) {
      const contenedor = document.getElementById('catalogo-grid');
      const contador = document.getElementById('catalogo-contador');
      const vacio = document.getElementById('catalogo-vacio');

      if (!contenedor) return;

      if (contador) {
        contador.textContent = `Mostrando ${listaPlatos.length} de ${this.platosActuales.length} creaciones`;
      }

      if (!listaPlatos || listaPlatos.length === 0) {
        contenedor.innerHTML = '';
        if (vacio) vacio.style.display = 'block';
        return;
      }

      if (vacio) vacio.style.display = 'none';

      const favoritos = Storage.get('favoritos', []);

      const html = listaPlatos.map(plato => {
        const esFav = favoritos.includes(plato.id);
        const corazonClase = esFav ? 'bi-heart-fill text-danger' : 'bi-heart';

        let badgeEtiqueta = '';
        if (plato.etiqueta === 'Especialidad') {
          badgeEtiqueta = '<span class="badge-tag badge-especialidad"><i class="bi bi-award me-1"></i>Especialidad</span>';
        } else if (plato.etiqueta === 'Nuevo') {
          badgeEtiqueta = '<span class="badge-tag badge-nuevo"><i class="bi bi-stars me-1"></i>Nuevo</span>';
        } else if (plato.etiqueta === 'Popular') {
          badgeEtiqueta = '<span class="badge-tag badge-popular"><i class="bi bi-fire me-1"></i>Popular</span>';
        }

        const badgeVeg = plato.vegetariano ? '<span class="badge-tag badge-veggie"><i class="bi bi-flower1 me-1"></i>Vegetariano</span>' : '';
        const picanteHtml = renderPicante(plato.picante);

        const ingredientesChips = (plato.ingredientes || []).slice(0, 3).map(ing =>
          `<span class="ingredient-chip">${ing}</span>`
        ).join('');

        return `
          <div class="col-12 col-md-6 col-lg-4 d-flex" data-plato-id="${plato.id}">
            <article class="card-gastronomica w-100 d-flex flex-column">
              <div class="card-gastronomica-img-wrap position-relative">
                <img
                  src="${plato.imagen || SVG_FOOD_FALLBACK}"
                  alt="${plato.nombre}"
                  class="card-gastronomica-img"
                  loading="lazy"
                  onerror="this.onerror=null; this.src='${SVG_FOOD_FALLBACK}';"
                />
                <div class="card-gastronomica-overlay"></div>
                <div class="card-badges-top-left d-flex flex-wrap gap-1">
                  ${badgeEtiqueta}
                  ${badgeVeg}
                </div>
                <button
                  type="button"
                  class="btn-favorito-card ${esFav ? 'activo' : ''}"
                  data-plato-id="${plato.id}"
                  aria-label="Agregar a favoritos"
                  title="Agregar a favoritos"
                >
                  <i class="bi ${corazonClase}"></i>
                </button>
                <div class="card-time-badge">
                  <i class="bi bi-clock me-1"></i>${plato.tiempo || '20 min'}
                </div>
              </div>

              <div class="card-gastronomica-body d-flex flex-column flex-grow-1 p-4">
                <div class="d-flex justify-content-between align-items-start mb-2">
                  <div class="card-category-sub text-muted small text-uppercase">
                    ${plato.categoria} <span class="mx-1">•</span> <strong class="text-gold">${plato.subcategoria || ''}</strong>
                  </div>
                  ${picanteHtml}
                </div>

                <h3 class="card-dish-title mb-2">${plato.nombre}</h3>
                <p class="card-dish-desc text-muted mb-3 flex-grow-1">${plato.descripcion}</p>

                <div class="ingredients-preview d-flex flex-wrap gap-1 mb-3">
                  ${ingredientesChips}
                </div>

                <div class="card-footer-action d-flex justify-content-between align-items-center pt-3 border-top-subtle">
                  <div class="card-price">
                    <span class="currency">Bs.</span>
                    <span class="amount">${plato.precio}</span>
                  </div>

                  <div class="d-flex gap-2">
                    <button
                      type="button"
                      class="btn btn-outline-gold btn-sm btn-ver-detalle"
                      data-plato-id="${plato.id}"
                      title="Ver todos los detalles gastronómicos"
                    >
                      <i class="bi bi-eye me-1"></i>Detalles
                    </button>
                    <button
                      type="button"
                      class="btn btn-gold btn-sm btn-agregar-calculadora"
                      data-plato-id="${plato.id}"
                      data-precio="${plato.precio}"
                      data-nombre="${plato.nombre}"
                      title="Añadir al consumo estimado"
                    >
                      <i class="bi bi-plus-circle me-1"></i>Consumo
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </div>
        `;
      }).join('');

      contenedor.innerHTML = html;

      // Animación suave de aparición con jQuery
      if ($) {
        $('.card-gastronomica').hide().fadeIn(300);
      }
    },

    // Abrir modal con ficha gastronómica de lujo
    abrirModalDetalle(platoId) {
      const platos = Storage.get('platos', []);
      const plato = platos.find(p => p.id === platoId);
      if (!plato) return;

      const modalEl = document.getElementById('modal-detalle-plato');
      if (!modalEl) return;

      // Inyectar datos en el modal
      const img = document.getElementById('modal-plato-img');
      if (img) {
        img.src = plato.imagen || SVG_FOOD_FALLBACK;
        img.onerror = () => { img.src = SVG_FOOD_FALLBACK; };
      }

      const setEl = (id, html) => {
        const el = document.getElementById(id);
        if (el) el.innerHTML = html;
      };

      setEl('modal-plato-titulo', plato.nombre);
      setEl('modal-plato-categoria', `${plato.categoria} <span class="mx-1">/</span> <strong class="text-gold">${plato.subcategoria || ''}</strong>`);
      setEl('modal-plato-precio', `Bs. ${plato.precio}`);
      setEl('modal-plato-porcion', `<i class="bi bi-box-seam me-1 text-gold"></i>${plato.porcion || 'Porción individual'}`);
      setEl('modal-plato-tiempo', `<i class="bi bi-clock me-1 text-gold"></i>Tiempo: ${plato.tiempo || '20 min'}`);
      setEl('modal-plato-desc', plato.descripcionLarga || plato.descripcion);
      setEl('modal-plato-chef', plato.recomendacionChef ? `<div class="chef-note p-3 mt-3 rounded-2"><i class="bi bi-quote text-gold fs-4 d-block mb-1"></i><strong>Recomendación del Chef:</strong> ${plato.recomendacionChef}</div>` : '');

      // Ingredientes
      const ingList = (plato.ingredientes || []).map(i => `<li><i class="bi bi-check2 text-gold me-2"></i>${i}</li>`).join('');
      setEl('modal-plato-ingredientes', `<ul class="list-unstyled mb-0">${ingList}</ul>`);

      // Alérgenos
      const alergenos = (plato.alergenos || []);
      if (alergenos.length > 0) {
        const alText = alergenos.map(a => `<span class="badge bg-warning text-dark me-1 mb-1">${a}</span>`).join('');
        setEl('modal-plato-alergenos', `<div class="mt-2 text-muted small"><strong class="text-white"><i class="bi bi-exclamation-triangle me-1 text-warning"></i>Alérgenos:</strong> ${alText}</div>`);
      } else {
        setEl('modal-plato-alergenos', `<div class="mt-2 text-muted small"><i class="bi bi-shield-check text-success me-1"></i>No contiene alérgenos comunes registrados.</div>`);
      }

      // Platos relacionados (misma categoría)
      const relacionados = platos
        .filter(p => p.categoria === plato.categoria && p.id !== plato.id && p.activo !== false)
        .slice(0, 3);

      const relHtml = relacionados.map(rel => `
        <div class="col-4">
          <div class="related-dish-card cursor-pointer btn-ver-detalle p-2 text-center" data-plato-id="${rel.id}">
            <img src="${rel.imagen || SVG_FOOD_FALLBACK}" alt="${rel.nombre}" class="rounded w-100 mb-1" style="height: 65px; object-fit: cover;" onerror="this.src='${SVG_FOOD_FALLBACK}'" />
            <div class="small fw-bold text-truncate">${rel.nombre}</div>
            <div class="text-gold small">Bs. ${rel.precio}</div>
          </div>
        </div>
      `).join('');
      setEl('modal-plato-relacionados', relHtml || '<p class="text-muted small">No hay platos adicionales en esta categoría.</p>');

      // Botón añadir a consumo dentro del modal
      const btnAdd = document.getElementById('modal-btn-add-consumo');
      if (btnAdd) {
        btnAdd.setAttribute('data-plato-id', plato.id);
        btnAdd.setAttribute('data-precio', plato.precio);
        btnAdd.setAttribute('data-nombre', plato.nombre);
      }

      // Registrar bitácora de visualización de plato
      Bitacoras.registrar({
        modulo: 'Catálogo',
        tipo: 'INTERACCION',
        accion: 'VER_DETALLE_PLATO',
        descripcion: `El cliente consultó la ficha detallada de: ${plato.nombre} (Bs. ${plato.precio})`,
        resultado: 'EXITOSO',
        origen: 'Cliente',
        metadata: { platoId: plato.id, nombre: plato.nombre, precio: plato.precio }
      });

      // Mostrar modal con jQuery fadeIn
      if ($) {
        $(modalEl).fadeIn(300).addClass('show');
      } else {
        modalEl.style.display = 'flex';
      }
    },

    // Cerrar modal de detalles
    cerrarModalDetalle() {
      const modalEl = document.getElementById('modal-detalle-plato');
      if ($ && modalEl) {
        $(modalEl).fadeOut(250, () => {
          modalEl.classList.remove('show');
        });
      } else if (modalEl) {
        modalEl.style.display = 'none';
      }
    },

    // Alternar plato como favorito
    toggleFavorito(platoId) {
      let favoritos = Storage.get('favoritos', []);
      const platos = Storage.get('platos', []);
      const plato = platos.find(p => p.id === platoId);
      const nombre = plato ? plato.nombre : platoId;

      let agregado = false;
      if (favoritos.includes(platoId)) {
        favoritos = favoritos.filter(id => id !== platoId);
      } else {
        favoritos.push(platoId);
        agregado = true;
      }

      Storage.set('favoritos', favoritos);
      this.actualizarContadorFavoritos();

      // Actualizar icono en el DOM
      const btn = document.querySelector(`.btn-favorito-card[data-plato-id="${platoId}"]`);
      if (btn) {
        const icon = btn.querySelector('i');
        if (agregado) {
          btn.classList.add('activo');
          if (icon) {
            icon.className = 'bi bi-heart-fill text-danger';
            if ($) $(icon).addClass('pulse-heart');
          }
        } else {
          btn.classList.remove('activo');
          if (icon) icon.className = 'bi bi-heart';
        }
      }

      // Bitácora
      Bitacoras.registrar({
        modulo: 'Catálogo',
        tipo: 'FAVORITOS',
        accion: agregado ? 'AGREGAR_FAVORITO' : 'QUITAR_FAVORITO',
        descripcion: agregado ? `Plato "${nombre}" añadido a lista de favoritos` : `Plato "${nombre}" retirado de favoritos`,
        resultado: 'EXITOSO',
        origen: 'Cliente',
        metadata: { platoId, agregado }
      });

      if (AUREA.mostrarToast) {
        AUREA.mostrarToast(
          agregado ? `"${nombre}" guardado en tus favoritos.` : `"${nombre}" retirado de favoritos.`,
          'info'
        );
      }
    },

    // Actualizar badge en navbar con conteo de favoritos
    actualizarContadorFavoritos() {
      const favs = Storage.get('favoritos', []);
      const badge = document.getElementById('nav-favoritos-count');
      if (badge) {
        badge.textContent = favs.length;
        badge.style.display = favs.length > 0 ? 'inline-block' : 'none';
      }
    },

    // Vincular delegación de eventos en el catálogo
    vincularEventos() {
      const self = this;

      // Click en Ver Detalles o tarjeta relacionada
      $(document).on('click', '.btn-ver-detalle', function (e) {
        e.preventDefault();
        const id = $(this).data('plato-id');
        self.abrirModalDetalle(id);
      });

      // Click en Favoritos
      $(document).on('click', '.btn-favorito-card', function (e) {
        e.preventDefault();
        e.stopPropagation();
        const id = $(this).data('plato-id');
        self.toggleFavorito(id);
      });

      // Click en Cerrar Modal de detalles
      $(document).on('click', '#modal-detalle-plato .btn-close-modal, #modal-detalle-plato .modal-backdrop-custom', function (e) {
        e.preventDefault();
        self.cerrarModalDetalle();
      });

      // Cerrar modal con tecla Escape
      $(document).on('keydown', function (e) {
        if (e.key === 'Escape') {
          self.cerrarModalDetalle();
        }
      });
    }
  };

  AUREA.Catalogo = Catalogo;

})(window, document);
