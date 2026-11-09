/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/admin.js — Panel Administrativo, Dashboard, CRUDs y Auditoría
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;
  const Bitacoras = AUREA.Bitacoras;
  const $ = window.jQuery;

  let currentTab = 'dashboard';
  let bitacorasPaginaActual = 1;
  const bitacorasPorPagina = 15;

  const Admin = {
    init() {
      this.iniciarReloj();
      this.iniciarTemaAdmin();
      this.vincularNavegacionSidebar();
      this.vincularEventosCRUD();
      this.cargarSeccion('dashboard');
      this.iniciarSincronizacionStorage();

      Bitacoras.registrar({
        modulo: 'Administración',
        tipo: 'NAVEGACION',
        accion: 'ACCESO_PANEL_ADMINISTRATIVO',
        descripcion: 'Inicio de sesión en entorno administrativo de demostración local',
        resultado: 'EXITOSO',
        origen: 'Administrador'
      });
    },

    // Reloj digital en tiempo real en la cabecera
    iniciarReloj() {
      const elReloj = document.getElementById('admin-live-clock');
      const elFecha = document.getElementById('admin-live-date');

      const actualizar = () => {
        const now = new Date();
        if (elReloj) {
          elReloj.textContent = now.toLocaleTimeString('es-BO', { hour12: false });
        }
        if (elFecha) {
          elFecha.textContent = now.toLocaleDateString('es-BO', {
            weekday: 'short',
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          });
        }
      };
      actualizar();
      setInterval(actualizar, 1000);
    },

    // Sincronización y persistencia del tema en el panel
    iniciarTemaAdmin() {
      const temaGuardado = Storage.getRaw('theme', 'dark');
      document.documentElement.setAttribute('data-theme', temaGuardado);
      this.actualizarIconoTema(temaGuardado);

      $('#btn-admin-theme-toggle').on('click', () => {
        const actual = document.documentElement.getAttribute('data-theme') || 'dark';
        const nuevo = actual === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', nuevo);
        Storage.setRaw('theme', nuevo);
        this.actualizarIconoTema(nuevo);

        Bitacoras.registrar({
          modulo: 'Tema',
          tipo: 'TEMA',
          accion: 'CAMBIO_TEMA_ADMIN',
          descripcion: `Cambio de tema en panel administrativo a: ${nuevo}`,
          resultado: 'EXITOSO',
          origen: 'Administrador',
          metadata: { nuevoTema: nuevo }
        });
      });
    },

    actualizarIconoTema(tema) {
      const btn = $('#btn-admin-theme-toggle i');
      if (tema === 'dark') {
        btn.removeClass('bi-moon-stars-fill').addClass('bi-sun-fill');
      } else {
        btn.removeClass('bi-sun-fill').addClass('bi-moon-stars-fill');
      }
    },

    // Navegación entre pestañas del sidebar
    vincularNavegacionSidebar() {
      const self = this;

      $('.admin-nav-link').on('click', function (e) {
        e.preventDefault();
        const tab = $(this).data('tab');
        if (!tab) return;

        $('.admin-nav-link').removeClass('active');
        $(this).addClass('active');

        // En pantallas móviles, colapsar sidebar al hacer clic
        if ($(window).width() < 992) {
          $('#admin-sidebar').removeClass('show');
        }

        self.cargarSeccion(tab);
      });

      // Toggle hamburguesa de sidebar
      $('#btn-toggle-sidebar').on('click', function () {
        $('#admin-sidebar').toggleClass('show');
      });
    },

    cargarSeccion(tab) {
      currentTab = tab;
      $('.admin-view-section').hide();
      $(`#view-${tab}`).fadeIn(250);

      // Actualizar título en cabecera
      const titles = {
        dashboard: 'Panel General de Control',
        reservas: 'Gestión Integral de Reservas',
        mesas: 'Plano de Mesas y Disponibilidad',
        catalogo: 'Catálogo Gastronómico & Carta',
        categorias: 'Estructura de Categorías y Subcategorías',
        promociones: 'Administración de Promociones',
        clientes: 'Directorio de Comensales & Clientes',
        bitacoras: 'Bitácoras de Auditoría y Eventos del Sistema',
        estadisticas: 'Métricas & Estadísticas Culinarias',
        configuracion: 'Parámetros del Establecimiento'
      };
      $('#admin-header-title').text(titles[tab] || 'Panel AUREA');

      switch (tab) {
        case 'dashboard':
          this.renderizarDashboard();
          break;
        case 'reservas':
          this.renderizarReservas();
          break;
        case 'mesas':
          this.renderizarMesas();
          break;
        case 'catalogo':
          this.renderizarCatalogo();
          break;
        case 'categorias':
          this.renderizarCategorias();
          break;
        case 'promociones':
          this.renderizarPromociones();
          break;
        case 'clientes':
          this.renderizarClientes();
          break;
        case 'bitacoras':
          this.renderizarBitacoras();
          break;
        case 'estadisticas':
          this.renderizarEstadisticas();
          break;
        case 'configuracion':
          this.renderizarConfiguracion();
          break;
      }
    },

    // ==========================================
    // 1. DASHBOARD GENERAL
    // ==========================================

    renderizarDashboard() {
      const reservas = Storage.get('reservas', []);
      const mesas = Storage.get('mesas', []);
      const platos = Storage.get('platos', []);
      const logs = Storage.get('logs', []);

      const confirmadas = reservas.filter(r => r.estado === 'CONFIRMADA').length;
      const pendientes = reservas.filter(r => r.estado === 'PENDIENTE').length;
      const canceladas = reservas.filter(r => r.estado === 'CANCELADA').length;
      const expiradas = reservas.filter(r => r.estado === 'EXPIRADA').length;
      const mesasActivas = mesas.filter(m => m.activa).length;
      const platosActivos = platos.filter(p => p.activo !== false).length;

      $('#stat-total-reservas').text(reservas.length);
      $('#stat-confirmadas').text(confirmadas);
      $('#stat-pendientes').text(pendientes);
      $('#stat-canceladas').text(canceladas);
      $('#stat-expiradas').text(expiradas);
      $('#stat-mesas-disponibles').text(`${mesasActivas}/${mesas.length}`);
      $('#stat-platos-activos').text(platosActivos);
      $('#stat-total-logs').text(logs.length);

      // Tabla de últimas reservas
      const ultimas = reservas.slice(0, 5);
      const tbody = $('#dashboard-ultimas-reservas');
      if (tbody.length) {
        if (ultimas.length === 0) {
          tbody.html('<tr><td colspan="6" class="text-center text-muted py-3">No hay reservas registradas.</td></tr>');
        } else {
          tbody.html(ultimas.map(r => `
            <tr>
              <td><span class="badge bg-secondary font-monospace">${r.codigo}</span></td>
              <td><strong>${r.cliente}</strong></td>
              <td>${r.fecha} ${r.hora}</td>
              <td>${r.personas} pers. (${r.zona})</td>
              <td>${this.badgeEstado(r.estado)}</td>
              <td>
                <button class="btn btn-sm btn-outline-gold btn-ver-reserva" data-codigo="${r.codigo}" title="Ver detalle">
                  <i class="bi bi-eye"></i>
                </button>
              </td>
            </tr>
          `).join(''));
        }
      }

      // Actividad reciente de bitácoras
      const ultimosLogs = logs.slice(0, 6);
      const listLogs = $('#dashboard-actividad-reciente');
      if (listLogs.length) {
        listLogs.html(ultimosLogs.map(l => `
          <div class="log-activity-item d-flex align-items-start gap-2 mb-3 pb-2 border-bottom-subtle">
            <span class="badge-dot mt-1 ${l.resultado === 'EXITOSO' ? 'bg-success' : 'bg-warning'}"></span>
            <div class="flex-grow-1 small">
              <div class="d-flex justify-content-between">
                <strong class="text-gold">${l.modulo} • ${l.accion}</strong>
                <span class="text-muted font-monospace">${l.hora}</span>
              </div>
              <div class="text-muted">${l.descripcion}</div>
            </div>
          </div>
        `).join(''));
      }
    },

    badgeEstado(estado) {
      switch (estado) {
        case 'CONFIRMADA':
          return '<span class="badge bg-success"><i class="bi bi-check-circle me-1"></i>Confirmada</span>';
        case 'PENDIENTE':
          return '<span class="badge bg-warning text-dark"><i class="bi bi-clock me-1"></i>Pendiente</span>';
        case 'CANCELADA':
          return '<span class="badge bg-danger"><i class="bi bi-x-circle me-1"></i>Cancelada</span>';
        case 'EXPIRADA':
          return '<span class="badge bg-secondary"><i class="bi bi-hourglass-bottom me-1"></i>Expirada</span>';
        default:
          return `<span class="badge bg-info text-dark">${estado}</span>`;
      }
    },

    // ==========================================
    // 2. GESTIÓN DE RESERVAS
    // ==========================================

    renderizarReservas() {
      const reservas = Storage.get('reservas', []);
      const estadoFiltro = $('#filtro-res-estado').val() || 'todos';
      const zonaFiltro = $('#filtro-res-zona').val() || 'todos';
      const fechaFiltro = $('#filtro-res-fecha').val() || '';
      const textoFiltro = ($('#filtro-res-buscar').val() || '').trim().toLowerCase();

      let filtradas = reservas.filter(r => {
        if (estadoFiltro !== 'todos' && r.estado !== estadoFiltro) return false;
        if (zonaFiltro !== 'todos' && r.zona !== zonaFiltro) return false;
        if (fechaFiltro && r.fecha !== fechaFiltro) return false;
        if (textoFiltro) {
          const matchCod = (r.codigo || '').toLowerCase().includes(textoFiltro);
          const matchCli = (r.cliente || '').toLowerCase().includes(textoFiltro);
          const matchTel = (r.telefono || '').toLowerCase().includes(textoFiltro);
          if (!matchCod && !matchCli && !matchTel) return false;
        }
        return true;
      });

      const tbody = $('#tabla-reservas-body');
      if (!tbody.length) return;

      if (filtradas.length === 0) {
        tbody.html('<tr><td colspan="10" class="text-center text-muted py-4">No se encontraron reservas con los filtros aplicados.</td></tr>');
        return;
      }

      tbody.html(filtradas.map(r => `
        <tr>
          <td><span class="badge bg-dark border border-secondary font-monospace text-gold">${r.codigo}</span></td>
          <td><strong>${r.cliente}</strong><br><small class="text-muted">${r.correo}</small></td>
          <td><a href="tel:${r.telefono}" class="text-decoration-none text-light">${r.telefono}</a></td>
          <td>${r.fecha}</td>
          <td>${r.hora}</td>
          <td>${r.personas}</td>
          <td><span class="small">${r.mesaNombre || r.mesaId}</span></td>
          <td><span class="badge bg-secondary">${r.zona}</span></td>
          <td>${this.badgeEstado(r.estado)}</td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-light btn-ver-reserva" data-codigo="${r.codigo}" title="Ver detalle">
                <i class="bi bi-eye"></i>
              </button>
              ${r.estado !== 'CONFIRMADA' ? `
                <button class="btn btn-outline-success btn-confirmar-reserva" data-codigo="${r.codigo}" title="Confirmar">
                  <i class="bi bi-check-lg"></i>
                </button>
              ` : ''}
              ${r.estado !== 'CANCELADA' ? `
                <button class="btn btn-outline-warning btn-cancelar-reserva" data-codigo="${r.codigo}" title="Cancelar">
                  <i class="bi bi-slash-circle"></i>
                </button>
              ` : ''}
              <button class="btn btn-outline-danger btn-eliminar-reserva" data-codigo="${r.codigo}" title="Eliminar">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join(''));
    },

    // ==========================================
    // 3. GESTIÓN DE MESAS
    // ==========================================

    renderizarMesas() {
      const mesas = Storage.get('mesas', []);
      const reservas = Storage.get('reservas', []);
      const grid = $('#grid-mesas-admin');
      if (!grid.length) return;

      const hoyStr = new Date().toISOString().split('T')[0];

      grid.html(mesas.map(m => {
        const reservasHoyMesa = reservas.filter(r => r.mesaId === m.id && r.fecha === hoyStr && r.estado === 'CONFIRMADA');

        return `
          <div class="col-12 col-md-6 col-lg-3">
            <div class="card card-mesa-admin p-3 h-100 ${m.activa ? '' : 'mesa-inactiva'}">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <span class="badge bg-dark font-monospace text-gold border border-gold">${m.id}</span>
                <span class="badge ${m.activa ? 'bg-success' : 'bg-danger'}">${m.activa ? 'Activa' : 'Inactiva'}</span>
              </div>
              <h5 class="card-title text-truncate mb-1">${m.nombre}</h5>
              <div class="text-muted small mb-2"><i class="bi bi-geo-alt text-gold me-1"></i>${m.zona} • <i class="bi bi-people text-gold me-1"></i>Capacidad: ${m.capacidad}</div>
              <p class="small text-muted mb-3 flex-grow-1">${m.descripcion || 'Sin descripción'}</p>

              <div class="d-flex justify-content-between align-items-center pt-2 border-top-subtle">
                <span class="small text-muted">Hoy: <strong>${reservasHoyMesa.length} reservas</strong></span>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-gold btn-editar-mesa" data-id="${m.id}" title="Editar mesa">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-secondary btn-toggle-mesa" data-id="${m.id}" title="${m.activa ? 'Desactivar' : 'Activar'}">
                    <i class="bi bi-power"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join(''));
    },

    // ==========================================
    // 4. CRUD CATÁLOGO GASTRONÓMICO
    // ==========================================

    renderizarCatalogo() {
      const platos = Storage.get('platos', []);
      const catFiltro = $('#admin-catalogo-filtro-cat').val() || 'todas';
      const textoFiltro = ($('#admin-catalogo-buscar').val() || '').trim().toLowerCase();

      let filtrados = platos.filter(p => {
        if (catFiltro !== 'todas' && p.categoria !== catFiltro) return false;
        if (textoFiltro) {
          const mNom = (p.nombre || '').toLowerCase().includes(textoFiltro);
          const mSub = (p.subcategoria || '').toLowerCase().includes(textoFiltro);
          if (!mNom && !mSub) return false;
        }
        return true;
      });

      const tbody = $('#tabla-catalogo-admin-body');
      if (!tbody.length) return;

      tbody.html(filtrados.map(p => `
        <tr>
          <td>
            <img src="${p.imagen}" alt="${p.nombre}" class="rounded" style="width: 48px; height: 48px; object-fit: cover;" onerror="this.src='data:image/svg+xml;utf8,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'48\\' height=\\'48\\'><rect width=\\'100%\\' height=\\'100%\\' fill=\\'%23333\\'/></svg>'" />
          </td>
          <td>
            <strong>${p.nombre}</strong>
            <div class="text-muted small text-truncate" style="max-width: 250px;">${p.descripcion}</div>
          </td>
          <td><span class="badge bg-secondary">${p.categoria}</span><br><small class="text-gold">${p.subcategoria || ''}</small></td>
          <td><strong class="text-gold">Bs. ${p.precio}</strong></td>
          <td>${p.tiempo || '20 min'}</td>
          <td>${p.etiqueta ? `<span class="badge bg-info text-dark">${p.etiqueta}</span>` : '—'}</td>
          <td>
            <span class="badge ${p.activo !== false ? 'bg-success' : 'bg-danger'} cursor-pointer btn-toggle-plato" data-id="${p.id}" title="Click para alternar disponibilidad">
              ${p.activo !== false ? 'Disponible' : 'No disponible'}
            </span>
          </td>
          <td>
            <div class="btn-group btn-group-sm">
              <button class="btn btn-outline-gold btn-editar-plato" data-id="${p.id}" title="Editar plato">
                <i class="bi bi-pencil"></i>
              </button>
              <button class="btn btn-outline-danger btn-eliminar-plato" data-id="${p.id}" title="Eliminar plato">
                <i class="bi bi-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join(''));
    },

    // ==========================================
    // 5. CATEGORÍAS Y SUBCATEGORÍAS
    // ==========================================

    renderizarCategorias() {
      const categorias = Storage.get('categorias', []);
      const platos = Storage.get('platos', []);
      const container = $('#container-categorias-admin');
      if (!container.length) return;

      container.html(categorias.map(cat => {
        const totalPlatos = platos.filter(p => p.categoria.toLowerCase() === cat.id.toLowerCase()).length;
        const subPills = (cat.subcategorias || []).map(s => `
          <span class="badge bg-dark border border-secondary text-light me-1 mb-1 p-2">
            ${s}
            <i class="bi bi-x cursor-pointer ms-1 text-danger btn-eliminar-subcat" data-cat-id="${cat.id}" data-subcat="${s}" title="Eliminar subcategoría"></i>
          </span>
        `).join('');

        return `
          <div class="col-12 col-md-6 col-lg-4">
            <div class="card p-3 h-100 border-subtle">
              <div class="d-flex justify-content-between align-items-center mb-2">
                <div class="d-flex align-items-center gap-2">
                  <i class="bi ${cat.icono || 'bi-bookmark'} fs-4 text-gold"></i>
                  <h5 class="mb-0">${cat.nombre}</h5>
                </div>
                <span class="badge bg-gold text-dark">${totalPlatos} platos</span>
              </div>
              <p class="text-muted small mb-3">${cat.descripcion || 'Sin descripción'}</p>

              <div class="mb-3">
                <div class="small text-muted mb-1 fw-bold">Subcategorías:</div>
                <div class="d-flex flex-wrap">${subPills}</div>
              </div>

              <div class="d-flex justify-content-between align-items-center pt-2 border-top-subtle mt-auto">
                <button class="btn btn-sm btn-outline-gold btn-agregar-subcat" data-cat-id="${cat.id}">
                  <i class="bi bi-plus me-1"></i>Añadir Subcat.
                </button>
                <div class="btn-group btn-group-sm">
                  <button class="btn btn-outline-secondary btn-editar-cat" data-cat-id="${cat.id}" title="Editar">
                    <i class="bi bi-pencil"></i>
                  </button>
                  <button class="btn btn-outline-danger btn-eliminar-cat" data-cat-id="${cat.id}" title="Eliminar categoría">
                    <i class="bi bi-trash"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        `;
      }).join(''));
    },

    // ==========================================
    // 6. PROMOCIONES
    // ==========================================

    renderizarPromociones() {
      const promociones = Storage.get('promociones', []);
      const grid = $('#grid-promociones-admin');
      if (!grid.length) return;

      grid.html(promociones.map(p => `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="card p-3 h-100 border-subtle position-relative">
            <div class="d-flex justify-content-between align-items-start mb-2">
              <span class="badge bg-gold text-dark fs-6">${p.descuento}% OFF</span>
              <span class="badge ${p.activa ? 'bg-success' : 'bg-secondary'} cursor-pointer btn-toggle-promo" data-id="${p.id}">
                ${p.activa ? 'Activa' : 'Pausada'}
              </span>
            </div>
            <h5 class="card-title mb-1">${p.titulo}</h5>
            <div class="text-gold small mb-2"><i class="bi bi-clock-history me-1"></i>${p.vigencia}</div>
            <p class="text-muted small mb-3 flex-grow-1">${p.descripcion}</p>
            <div class="p-2 bg-dark rounded small text-muted mb-3">
              <strong>Condiciones:</strong> ${p.condiciones}
            </div>
            <div class="d-flex justify-content-end gap-2 border-top-subtle pt-2">
              <button class="btn btn-sm btn-outline-gold btn-editar-promo" data-id="${p.id}">
                <i class="bi bi-pencil me-1"></i>Editar
              </button>
              <button class="btn btn-sm btn-outline-danger btn-eliminar-promo" data-id="${p.id}">
                <i class="bi bi-trash me-1"></i>Eliminar
              </button>
            </div>
          </div>
        </div>
      `).join(''));
    },

    // ==========================================
    // 7. CLIENTES
    // ==========================================

    renderizarClientes() {
      const reservas = Storage.get('reservas', []);
      const clientesMap = {};

      reservas.forEach(r => {
        const key = (r.correo || r.telefono || r.cliente).toLowerCase().trim();
        if (!clientesMap[key]) {
          clientesMap[key] = {
            nombre: r.cliente,
            telefono: r.telefono,
            correo: r.correo,
            reservasCount: 0,
            consumoEstimadoTotal: 0,
            ultimaFecha: r.fecha
          };
        }
        clientesMap[key].reservasCount++;
        clientesMap[key].consumoEstimadoTotal += (r.consumoEstimadoBs || 0);
        if (r.fecha > clientesMap[key].ultimaFecha) {
          clientesMap[key].ultimaFecha = r.fecha;
        }
      });

      const lista = Object.values(clientesMap);
      const tbody = $('#tabla-clientes-admin-body');
      if (!tbody.length) return;

      if (lista.length === 0) {
        tbody.html('<tr><td colspan="6" class="text-center text-muted py-4">No hay clientes registrados en el historial de reservas.</td></tr>');
        return;
      }

      tbody.html(lista.map(c => `
        <tr>
          <td><strong>${c.nombre}</strong></td>
          <td><a href="mailto:${c.correo}" class="text-light text-decoration-none">${c.correo}</a></td>
          <td><a href="tel:${c.telefono}" class="text-light text-decoration-none">${c.telefono}</a></td>
          <td><span class="badge bg-gold text-dark">${c.reservasCount} reservas</span></td>
          <td>Bs. ${c.consumoEstimadoTotal.toFixed(2)}</td>
          <td>${c.ultimaFecha}</td>
        </tr>
      `).join(''));
    },

    // ==========================================
    // 8. BITÁCORAS DE AUDITORÍA
    // ==========================================

    renderizarBitacoras() {
      const modulo = $('#filtro-bit-modulo').val() || 'todos';
      const resultado = $('#filtro-bit-resultado').val() || 'todos';
      const origen = $('#filtro-bit-origen').val() || 'todos';
      const fechaDesde = $('#filtro-bit-fecha-desde').val() || '';
      const fechaHasta = $('#filtro-bit-fecha-hasta').val() || '';
      const busqueda = ($('#filtro-bit-buscar').val() || '').trim();
      const orden = $('#filtro-bit-orden').val() || 'reciente';

      const resultadoQuery = Bitacoras.filtrar({
        modulo,
        resultado,
        origen,
        fechaDesde,
        fechaHasta,
        busqueda,
        orden,
        pagina: bitacorasPaginaActual,
        porPagina: bitacorasPorPagina
      });

      const stats = Bitacoras.obtenerEstadisticas();
      $('#bit-stats-total').text(stats.total);
      $('#bit-stats-exitosos').text(stats.porResultado.EXITOSO || 0);
      $('#bit-stats-fallidos').text((stats.porResultado.FALLIDO || 0) + (stats.porResultado.ERROR || 0));
      $('#bit-stats-cancelados').text((stats.porResultado.CANCELADO || 0) + (stats.porResultado.EXPIRADO || 0));

      const tbody = $('#tabla-bitacoras-body');
      if (!tbody.length) return;

      if (resultadoQuery.registros.length === 0) {
        tbody.html('<tr><td colspan="8" class="text-center text-muted py-4">No se encontraron eventos en la bitácora con estos criterios.</td></tr>');
      } else {
        tbody.html(resultadoQuery.registros.map(l => {
          let badgeRes = 'bg-success';
          if (l.resultado === 'FALLIDO' || l.resultado === 'ERROR') badgeRes = 'bg-danger';
          else if (l.resultado === 'CANCELADO' || l.resultado === 'EXPIRADO') badgeRes = 'bg-warning text-dark';
          else if (l.resultado === 'INFO') badgeRes = 'bg-info text-dark';

          return `
            <tr>
              <td><span class="badge bg-dark font-monospace text-gold border border-secondary">${l.id}</span></td>
              <td><span class="small">${l.fecha}</span><br><span class="text-muted font-monospace small">${l.hora}</span></td>
              <td><span class="badge bg-secondary">${l.origen}</span></td>
              <td><strong class="text-light">${l.modulo}</strong></td>
              <td><span class="font-monospace text-gold small">${l.accion}</span></td>
              <td><div class="text-muted small" style="max-width: 380px;">${l.descripcion}</div></td>
              <td><span class="badge ${badgeRes}">${l.resultado}</span></td>
            </tr>
          `;
        }).join(''));
      }

      // Paginación
      $('#bit-paginacion-info').text(`Página ${resultadoQuery.paginaActual} de ${resultadoQuery.totalPaginas} (${resultadoQuery.total} eventos)`);
      $('#btn-bit-prev').prop('disabled', resultadoQuery.paginaActual <= 1);
      $('#btn-bit-next').prop('disabled', resultadoQuery.paginaActual >= resultadoQuery.totalPaginas);
    },

    // ==========================================
    // 9. ESTADÍSTICAS CULINARIAS (CANVAS NATIVO)
    // ==========================================

    renderizarEstadisticas() {
      const reservas = Storage.get('reservas', []);
      const platos = Storage.get('platos', []);

      // Gráfica de reservas por zona
      const zonas = {};
      reservas.forEach(r => {
        zonas[r.zona] = (zonas[r.zona] || 0) + 1;
      });

      const containerZonas = $('#stats-zonas-bars');
      if (containerZonas.length) {
        const total = reservas.length || 1;
        let html = '';
        for (const [z, count] of Object.entries(zonas)) {
          const pct = Math.round((count / total) * 100);
          html += `
            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span>${z}</span>
                <span class="text-gold fw-bold">${count} reservas (${pct}%)</span>
              </div>
              <div class="progress" style="height: 10px; background-color: rgba(255,255,255,0.1);">
                <div class="progress-bar bg-gold" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }
        containerZonas.html(html || '<p class="text-muted small">Sin datos suficientes.</p>');
      }

      // Gráfica de reservas por estado
      const estados = { CONFIRMADA: 0, PENDIENTE: 0, CANCELADA: 0, EXPIRADA: 0 };
      reservas.forEach(r => {
        if (estados[r.estado] !== undefined) estados[r.estado]++;
      });

      const containerEstados = $('#stats-estados-bars');
      if (containerEstados.length) {
        const total = reservas.length || 1;
        let html = '';
        for (const [est, count] of Object.entries(estados)) {
          const pct = Math.round((count / total) * 100);
          html += `
            <div class="mb-3">
              <div class="d-flex justify-content-between small mb-1">
                <span>${est}</span>
                <span class="fw-bold">${count} (${pct}%)</span>
              </div>
              <div class="progress" style="height: 10px; background-color: rgba(255,255,255,0.1);">
                <div class="progress-bar ${est === 'CONFIRMADA' ? 'bg-success' : (est === 'PENDIENTE' ? 'bg-warning' : 'bg-danger')}" style="width: ${pct}%"></div>
              </div>
            </div>
          `;
        }
        containerEstados.html(html);
      }
    },

    // ==========================================
    // 10. CONFIGURACIÓN
    // ==========================================

    renderizarConfiguracion() {
      const cfg = Storage.get('config', {});
      $('#cfg-nombre').val(cfg.nombreRestaurante || '');
      $('#cfg-telefono').val(cfg.telefono || '');
      $('#cfg-whatsapp').val(cfg.whatsapp || '');
      $('#cfg-correo').val(cfg.correo || '');
      $('#cfg-direccion').val(cfg.direccion || '');
      $('#cfg-apertura').val(cfg.horarioApertura || '12:00');
      $('#cfg-cierre').val(cfg.horarioCierre || '23:30');
      $('#cfg-capacidad').val(cfg.capacidadMaxima || 48);
    },

    // ==========================================
    // VINCULACIÓN DE EVENTOS CRUD
    // ==========================================

    vincularEventosCRUD() {
      const self = this;

      // Filtros de Reservas
      $('#filtro-res-estado, #filtro-res-zona, #filtro-res-fecha').on('change', () => self.renderizarReservas());
      $('#filtro-res-buscar').on('input', () => self.renderizarReservas());

      // Acciones de Reservas
      $(document).on('click', '.btn-confirmar-reserva', function () {
        const cod = $(this).data('codigo');
        const reservas = Storage.get('reservas', []);
        const r = reservas.find(res => res.codigo === cod);
        if (r) {
          r.estado = 'CONFIRMADA';
          r.confirmadoEn = new Date().toISOString();
          Storage.set('reservas', reservas);
          self.renderizarReservas();
          self.renderizarDashboard();

          Bitacoras.registrar({
            modulo: 'Reservas',
            tipo: 'RESERVA',
            accion: 'CONFIRMAR_RESERVA_ADMIN',
            descripcion: `Confirmación manual de reserva ${cod} por el administrador`,
            resultado: 'EXITOSO',
            origen: 'Administrador',
            metadata: { codigo: cod }
          });
        }
      });

      $(document).on('click', '.btn-cancelar-reserva', function () {
        const cod = $(this).data('codigo');
        if (confirm(`¿Deseas cancelar la reserva ${cod}?`)) {
          const reservas = Storage.get('reservas', []);
          const r = reservas.find(res => res.codigo === cod);
          if (r) {
            r.estado = 'CANCELADA';
            Storage.set('reservas', reservas);
            self.renderizarReservas();
            self.renderizarDashboard();

            Bitacoras.registrar({
              modulo: 'Reservas',
              tipo: 'RESERVA',
              accion: 'CANCELAR_RESERVA_ADMIN',
              descripcion: `Cancelación manual de reserva ${cod} por el administrador`,
              resultado: 'CANCELADO',
              origen: 'Administrador',
              metadata: { codigo: cod }
            });
          }
        }
      });

      $(document).on('click', '.btn-eliminar-reserva', function () {
        const cod = $(this).data('codigo');
        if (confirm(`¿Eliminar definitivamente la reserva ${cod}? Esta acción no se puede deshacer.`)) {
          let reservas = Storage.get('reservas', []);
          reservas = reservas.filter(r => r.codigo !== cod);
          Storage.set('reservas', reservas);
          self.renderizarReservas();
          self.renderizarDashboard();

          Bitacoras.registrar({
            modulo: 'Reservas',
            tipo: 'RESERVA',
            accion: 'ELIMINAR_RESERVA_ADMIN',
            descripcion: `Eliminación física del registro de reserva ${cod}`,
            resultado: 'EXITOSO',
            origen: 'Administrador',
            metadata: { codigo: cod }
          });
        }
      });

      // Ver detalle de reserva modal
      $(document).on('click', '.btn-ver-reserva', function () {
        const cod = $(this).data('codigo');
        const reservas = Storage.get('reservas', []);
        const r = reservas.find(res => res.codigo === cod);
        if (r) {
          alert(`DETALLE DE RESERVA:
Código: ${r.codigo}
Cliente: ${r.cliente}
Teléfono: ${r.telefono}
Correo: ${r.correo}
Fecha: ${r.fecha} a las ${r.hora}
Mesa: ${r.mesaNombre || r.mesaId} (${r.zona})
Personas: ${r.personas}
Ocasión: ${r.ocasion || 'General'}
Consumo estimado: Bs. ${r.consumoEstimadoBs || 0}
Observaciones: ${r.observaciones || 'Ninguna'}
Estado: ${r.estado}`);
        }
      });

      // Alternar disponibilidad de plato
      $(document).on('click', '.btn-toggle-plato', function () {
        const id = $(this).data('id');
        const platos = Storage.get('platos', []);
        const p = platos.find(item => item.id === id);
        if (p) {
          p.activo = (p.activo === false) ? true : false;
          Storage.set('platos', platos);
          self.renderizarCatalogo();

          Bitacoras.registrar({
            modulo: 'Catálogo',
            tipo: 'CRUD_PLATO',
            accion: 'TOGGLE_DISPONIBILIDAD_PLATO',
            descripcion: `Cambio de disponibilidad para "${p.nombre}" a: ${p.activo ? 'Disponible' : 'No disponible'}`,
            resultado: 'EXITOSO',
            origen: 'Administrador',
            metadata: { platoId: id, activo: p.activo }
          });
        }
      });

      // Eliminar plato
      $(document).on('click', '.btn-eliminar-plato', function () {
        const id = $(this).data('id');
        const platos = Storage.get('platos', []);
        const p = platos.find(item => item.id === id);
        if (p && confirm(`¿Estás seguro de eliminar "${p.nombre}" del catálogo?`)) {
          const nuevos = platos.filter(item => item.id !== id);
          Storage.set('platos', nuevos);
          self.renderizarCatalogo();

          Bitacoras.registrar({
            modulo: 'Catálogo',
            tipo: 'CRUD_PLATO',
            accion: 'ELIMINAR_PLATO',
            descripcion: `Eliminación de plato "${p.nombre}" (ID: ${id})`,
            resultado: 'EXITOSO',
            origen: 'Administrador',
            metadata: { platoId: id, nombre: p.nombre }
          });
        }
      });

      // Agregar nuevo plato (modal)
      $('#btn-abrir-modal-nuevo-plato').on('click', function () {
        $('#form-nuevo-plato')[0].reset();
        $('#modal-nuevo-plato').fadeIn(250).addClass('show');
      });

      $('#form-nuevo-plato').on('submit', function (e) {
        e.preventDefault();
        const platos = Storage.get('platos', []);
        const nuevoId = 'plt-' + String(platos.length + 1).padStart(2, '0');

        const nuevoPlato = {
          id: nuevoId,
          nombre: $('#nplato-nombre').val().trim(),
          categoria: $('#nplato-categoria').val(),
          subcategoria: $('#nplato-subcategoria').val().trim(),
          precio: Number($('#nplato-precio').val()),
          tiempo: $('#nplato-tiempo').val().trim() || '20 min',
          descripcion: $('#nplato-desc').val().trim(),
          descripcionLarga: $('#nplato-desc-larga').val().trim() || $('#nplato-desc').val().trim(),
          ingredientes: $('#nplato-ingredientes').val().split(',').map(s => s.trim()).filter(Boolean),
          alergenos: $('#nplato-alergenos').val().split(',').map(s => s.trim()).filter(Boolean),
          porcion: $('#nplato-porcion').val().trim() || 'Porción individual',
          picante: Number($('#nplato-picante').val() || 0),
          vegetariano: $('#nplato-veggie').is(':checked'),
          etiqueta: $('#nplato-etiqueta').val(),
          destacado: $('#nplato-destacado').is(':checked'),
          recomendacionChef: $('#nplato-chef').val().trim(),
          imagen: $('#nplato-img').val().trim() || 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
          activo: true
        };

        platos.push(nuevoPlato);
        Storage.set('platos', platos);
        $('#modal-nuevo-plato').fadeOut(250).removeClass('show');
        self.renderizarCatalogo();

        Bitacoras.registrar({
          modulo: 'Catálogo',
          tipo: 'CRUD_PLATO',
          accion: 'CREAR_PLATO',
          descripcion: `Creación de nuevo plato "${nuevoPlato.nombre}" en categoría ${nuevoPlato.categoria} a Bs. ${nuevoPlato.precio}`,
          resultado: 'EXITOSO',
          origen: 'Administrador',
          metadata: { id: nuevoId, nombre: nuevoPlato.nombre }
        });
      });

      $('.btn-close-modal-plato').on('click', () => {
        $('#modal-nuevo-plato').fadeOut(250).removeClass('show');
      });

      // Filtros de Bitácoras
      $('#filtro-bit-modulo, #filtro-bit-resultado, #filtro-bit-origen, #filtro-bit-fecha-desde, #filtro-bit-fecha-hasta, #filtro-bit-orden').on('change', () => {
        bitacorasPaginaActual = 1;
        self.renderizarBitacoras();
      });

      $('#filtro-bit-buscar').on('input', () => {
        bitacorasPaginaActual = 1;
        self.renderizarBitacoras();
      });

      $('#btn-bit-prev').on('click', () => {
        if (bitacorasPaginaActual > 1) {
          bitacorasPaginaActual--;
          self.renderizarBitacoras();
        }
      });

      $('#btn-bit-next').on('click', () => {
        bitacorasPaginaActual++;
        self.renderizarBitacoras();
      });

      $('#btn-exportar-csv').on('click', () => Bitacoras.exportarCSV());
      $('#btn-exportar-json').on('click', () => Bitacoras.exportarJSON());

      $('#btn-limpiar-bitacoras').on('click', () => {
        if (confirm('¿Estás seguro de vaciar el registro histórico de bitácoras? Esta acción reiniciará el historial.')) {
          Bitacoras.limpiarHistorial();
          bitacorasPaginaActual = 1;
          self.renderizarBitacoras();
          self.renderizarDashboard();
        }
      });

      // Guardar configuración
      $('#form-configuracion').on('submit', function (e) {
        e.preventDefault();
        const cfg = {
          nombreRestaurante: $('#cfg-nombre').val().trim(),
          telefono: $('#cfg-telefono').val().trim(),
          whatsapp: $('#cfg-whatsapp').val().trim(),
          correo: $('#cfg-correo').val().trim(),
          direccion: $('#cfg-direccion').val().trim(),
          horarioApertura: $('#cfg-apertura').val(),
          horarioCierre: $('#cfg-cierre').val(),
          capacidadMaxima: Number($('#cfg-capacidad').val() || 48),
          moneda: 'Bs.'
        };
        Storage.set('config', cfg);
        alert('Configuración guardada exitosamente.');

        Bitacoras.registrar({
          modulo: 'Administración',
          tipo: 'CONFIGURACION',
          accion: 'ACTUALIZAR_PARAMETROS',
          descripcion: 'Actualización de configuración general del restaurante',
          resultado: 'EXITOSO',
          origen: 'Administrador'
        });
      });

      // Restaurar datos semilla de fábrica
      $('#btn-reset-demo-data').on('click', function () {
        if (confirm('ATENCIÓN: Esto restablecerá todos los platos, mesas, promociones, reservas y bitácoras a los valores iniciales de demostración de AUREA. ¿Deseas continuar?')) {
          AUREA.resetStorage();
          alert('Datos restaurados correctamente a las semillas iniciales.');
          location.reload();
        }
      });
    },

    // Escuchar eventos de Storage entre pestañas
    iniciarSincronizacionStorage() {
      const self = this;
      window.addEventListener('storage', function (e) {
        if (e.key && e.key.startsWith('aurea_')) {
          console.log(`[Storage Sync] Clave modificada en otra pestaña: ${e.key}`);
          if (currentTab === 'dashboard') self.renderizarDashboard();
          else if (currentTab === 'reservas') self.renderizarReservas();
          else if (currentTab === 'bitacoras') self.renderizarBitacoras();
        }
      });

      window.addEventListener('aurea:log_created', () => {
        if (currentTab === 'dashboard') self.renderizarDashboard();
        else if (currentTab === 'bitacoras') self.renderizarBitacoras();
      });
    }
  };

  AUREA.Admin = Admin;

})(window, document);
