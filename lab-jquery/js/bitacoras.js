/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/bitacoras.js — Motor de Registro, Filtros y Auditoría
   Diseño Web II — UPDS
   ========================================================= */

(function (window, document) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});
  const Storage = AUREA.Storage;

  const MAX_LOGS = 500;
  const SENSITIVE_REGEX = /(password|contrase|clave|token|tarjeta|card|cvv|secret)/i;

  // Sanitizador de metadatos para no guardar datos sensibles ni desbordar almacenamiento
  function sanitizeMetadata(metadata) {
    if (!metadata || typeof metadata !== 'object' || Array.isArray(metadata)) return {};
    const sanitized = {};
    for (const key of Object.keys(metadata)) {
      if (SENSITIVE_REGEX.test(key)) continue;
      const val = metadata[key];
      if (val === null || val === undefined) continue;
      if (typeof val === 'object') {
        sanitized[key] = JSON.stringify(val).slice(0, 160);
      } else {
        sanitized[key] = String(val).replace(/[<>]/g, '').slice(0, 160);
      }
    }
    return sanitized;
  }

  // Generador de ID con formato EVT-XXXXXX
  function generateLogId(existingLogs) {
    const nextNumber = existingLogs.length > 0
      ? Math.max(...existingLogs.map(l => {
          const m = String(l.id || '').match(/\d+/);
          return m ? parseInt(m[0], 10) : 0;
        })) + 1
      : 1;
    return 'EVT-' + String(nextNumber).padStart(6, '0');
  }

  // Formateo de fecha y hora local
  function getLocalDateTime() {
    const now = new Date();
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    return {
      fecha: `${day}/${month}/${year}`,
      hora: `${hours}:${minutes}:${seconds}`,
      isoDate: `${year}-${month}-${day}`
    };
  }

  const Bitacoras = {
    // Registrar un nuevo evento en el sistema
    registrar({
      modulo = 'Sistema',
      tipo = 'GENERAL',
      accion = 'ACCION',
      descripcion = '',
      resultado = 'EXITOSO',
      origen = 'Cliente',
      metadata = {}
    }) {
      try {
        const logs = Storage.get('logs', []);
        const { fecha, hora, isoDate } = getLocalDateTime();
        const id = generateLogId(logs);

        const nuevoRegistro = {
          id,
          fecha,
          hora,
          isoDate,
          origen: String(origen || 'Cliente'),
          modulo: String(modulo || 'Sistema'),
          tipo: String(tipo || 'GENERAL').toUpperCase(),
          accion: String(accion || 'ACCION').toUpperCase(),
          descripcion: String(descripcion || '').replace(/[<>]/g, '').slice(0, 250),
          resultado: String(resultado || 'EXITOSO').toUpperCase(),
          metadata: sanitizeMetadata(metadata)
        };

        // Agregar al inicio y recortar al tamaño máximo
        logs.unshift(nuevoRegistro);
        const trimmedLogs = logs.slice(0, MAX_LOGS);
        Storage.set('logs', trimmedLogs);

        // Disparar evento personalizado en window para actualización reactiva
        window.dispatchEvent(new CustomEvent('aurea:log_created', { detail: nuevoRegistro }));

        return nuevoRegistro;
      } catch (err) {
        console.error('Error al registrar bitácora:', err);
        return null;
      }
    },

    // Obtener todos los logs almacenados
    obtenerTodos() {
      return Storage.get('logs', []);
    },

    // Filtrar logs con criterios combinados
    filtrar({
      modulo = 'todos',
      resultado = 'todos',
      origen = 'todos',
      fechaDesde = '',
      fechaHasta = '',
      busqueda = '',
      orden = 'reciente',
      pagina = 1,
      porPagina = 25
    } = {}) {
      let logs = Storage.get('logs', []);

      // Filtro por módulo
      if (modulo && modulo !== 'todos') {
        logs = logs.filter(l => l.modulo.toLowerCase() === modulo.toLowerCase());
      }

      // Filtro por resultado
      if (resultado && resultado !== 'todos') {
        logs = logs.filter(l => l.resultado.toLowerCase() === resultado.toLowerCase());
      }

      // Filtro por origen
      if (origen && origen !== 'todos') {
        logs = logs.filter(l => l.origen.toLowerCase() === origen.toLowerCase());
      }

      // Filtro por fecha desde (YYYY-MM-DD)
      if (fechaDesde) {
        logs = logs.filter(l => {
          if (!l.isoDate) return true;
          return l.isoDate >= fechaDesde;
        });
      }

      // Filtro por fecha hasta (YYYY-MM-DD)
      if (fechaHasta) {
        logs = logs.filter(l => {
          if (!l.isoDate) return true;
          return l.isoDate <= fechaHasta;
        });
      }

      // Búsqueda libre
      if (busqueda && busqueda.trim().length > 0) {
        const q = busqueda.trim().toLowerCase();
        logs = logs.filter(l =>
          (l.id && l.id.toLowerCase().includes(q)) ||
          (l.accion && l.accion.toLowerCase().includes(q)) ||
          (l.descripcion && l.descripcion.toLowerCase().includes(q)) ||
          (l.modulo && l.modulo.toLowerCase().includes(q)) ||
          (l.tipo && l.tipo.toLowerCase().includes(q))
        );
      }

      // Orden
      if (orden === 'antiguo') {
        logs.reverse();
      }

      const totalResultados = logs.length;
      const totalPaginas = Math.ceil(totalResultados / porPagina) || 1;
      const paginaActual = Math.min(Math.max(1, pagina), totalPaginas);

      const inicio = (paginaActual - 1) * porPagina;
      const registrosPaginados = logs.slice(inicio, inicio + porPagina);

      return {
        registros: registrosPaginados,
        total: totalResultados,
        totalPaginas,
        paginaActual,
        porPagina
      };
    },

    // Estadísticas rápidas de bitácoras
    obtenerEstadisticas() {
      const logs = Storage.get('logs', []);
      const stats = {
        total: logs.length,
        porModulo: {},
        porResultado: {
          EXITOSO: 0,
          FALLIDO: 0,
          CANCELADO: 0,
          EXPIRADO: 0,
          INFO: 0,
          ERROR: 0
        },
        porOrigen: {
          Cliente: 0,
          Administrador: 0,
          Sistema: 0
        }
      };

      logs.forEach(l => {
        // Módulo
        stats.porModulo[l.modulo] = (stats.porModulo[l.modulo] || 0) + 1;

        // Resultado
        const res = l.resultado || 'INFO';
        if (stats.porResultado[res] !== undefined) {
          stats.porResultado[res]++;
        } else {
          stats.porResultado[res] = 1;
        }

        // Origen
        const ori = l.origen || 'Cliente';
        if (stats.porOrigen[ori] !== undefined) {
          stats.porOrigen[ori]++;
        } else {
          stats.porOrigen[ori] = 1;
        }
      });

      return stats;
    },

    // Exportar bitácoras a archivo CSV descargable
    exportarCSV() {
      const logs = Storage.get('logs', []);
      if (logs.length === 0) {
        alert('No existen registros de bitácoras para exportar.');
        return false;
      }

      const headers = ['ID', 'Fecha', 'Hora', 'Origen', 'Modulo', 'Tipo', 'Accion', 'Descripcion', 'Resultado', 'Detalles_Metadata'];
      const rows = logs.map(l => [
        `"${l.id}"`,
        `"${l.fecha}"`,
        `"${l.hora}"`,
        `"${l.origen}"`,
        `"${l.modulo}"`,
        `"${l.tipo}"`,
        `"${l.accion}"`,
        `"${(l.descripcion || '').replace(/"/g, '""')}"`,
        `"${l.resultado}"`,
        `"${JSON.stringify(l.metadata || {}).replace(/"/g, '""')}"`
      ]);

      const csvContent = '\uFEFF' + [headers.join(';'), ...rows.map(r => r.join(';'))].join('\r\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fechaHoy = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `aurea_bitacoras_${fechaHoy}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Bitacoras.registrar({
        modulo: 'Bitácoras',
        tipo: 'EXPORTAR',
        accion: 'EXPORTAR_CSV',
        descripcion: `Exportación de ${logs.length} eventos a archivo CSV`,
        resultado: 'EXITOSO',
        origen: 'Administrador'
      });

      return true;
    },

    // Exportar bitácoras a archivo JSON descargable
    exportarJSON() {
      const logs = Storage.get('logs', []);
      if (logs.length === 0) {
        alert('No existen registros de bitácoras para exportar.');
        return false;
      }

      const jsonStr = JSON.stringify(logs, null, 2);
      const blob = new Blob([jsonStr], { type: 'application/json;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fechaHoy = new Date().toISOString().split('T')[0];
      link.setAttribute('href', url);
      link.setAttribute('download', `aurea_bitacoras_${fechaHoy}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      Bitacoras.registrar({
        modulo: 'Bitácoras',
        tipo: 'EXPORTAR',
        accion: 'EXPORTAR_JSON',
        descripcion: `Exportación de ${logs.length} eventos a archivo JSON`,
        resultado: 'EXITOSO',
        origen: 'Administrador'
      });

      return true;
    },

    // Limpiar historial de bitácoras con preservación de evento de limpieza
    limpiarHistorial() {
      const totalAnterior = Storage.get('logs', []).length;
      Storage.set('logs', []);

      Bitacoras.registrar({
        modulo: 'Bitácoras',
        tipo: 'MANTENIMIENTO',
        accion: 'LIMPIAR_HISTORIAL',
        descripcion: `Vaciado del historial de bitácoras (${totalAnterior} registros archivados)`,
        resultado: 'EXITOSO',
        origen: 'Administrador'
      });

      return true;
    }
  };

  AUREA.Bitacoras = Bitacoras;

})(window, document);
