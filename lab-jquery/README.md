# AUREA | Fine Dining & Gastronomy
## Sistema Web Gastronómico Premium con Panel Administrativo
**Materia:** Diseño Web II — Universidad Privada Domingo Savio (UPDS)  
**Estudiante:** Alejandra Peralta  
**Semestre:** 6to Semestre — Ingeniería de Sistemas  

---

## 1. Visión del Proyecto

**AUREA | Fine Dining & Gastronomy** es una experiencia digital de alta cocina contemporánea inspirada en los restaurantes galardonados con estrellas internacionales. No es una simple maqueta estática: es una aplicación web interactiva completa, dividida en dos universos sincronizados:

1. **Página Pública del Cliente (`index.html`):** Una experiencia inmersiva editorial para explorar platos, filtrar la carta por jerarquías, consultar maridajes, calcular consumos estimados y realizar reservas de mesas con un **temporizador real de 60 segundos**.
2. **Panel Privado del Administrador (`admin.html`):** Software de gestión profesional (SaaS para restaurantes) con dashboard de KPIs en tiempo real, gestión de reservas, control de mesas y disponibilidad, CRUD completo de platos del catálogo, administración de categorías, control de promociones, directorio de comensales, **módulo de auditoría (bitácoras)** con exportación a CSV/JSON y gráficas estadísticas.

Ambas interfaces comparten y sincronizan datos en tiempo real mediante `LocalStorage` y el evento `window.addEventListener('storage', ...)`.

---

## 2. Tecnologías Empleadas

- **HTML5 Semántico:** Marcado riguroso con `<header>`, `<nav>`, `<main>`, `<section>`, `<article>`, `<aside>`, `<footer>`, `<dialog>/modales`.
- **CSS3 Personalizado & Variables (`css/temas.css`, `css/cliente.css`, `css/admin.css`):**
  - Paleta cromática de lujo:
    - *Modo Oscuro (Carbón & Oro):* Negro carbón (`#0d0c0b`), Espresso (`#1e1814`), Oro champán (`#d4af37`), Verde oliva profundo (`#243528`) y Blanco cálido (`#f5f2ec`).
    - *Modo Claro (Marfil & Salvia):* Blanco marfil (`#faf8f5`), Beige arena (`#f3eee6`), Verde salvia (`#4a5d4e`) y Oro sutil (`#b88a38`).
  - Tipografías Google Fonts:
    - `Playfair Display` (títulos y moneda gastronómica).
    - `Cormorant Garamond` (subtítulos y citas del chef).
    - `DM Sans` (cuerpo de texto, formularios y botones).
  - Microanimaciones, bordes suaves, sombras difusas y desenfoque por fondo (*backdrop-filter: blur*).
- **JavaScript ES6 Modular:** Separación estricta de responsabilidades en 8 módulos independientes sin código mezclado.
- **jQuery 3.7.1:** Implementación de efectos y métodos obligatorios:
  - `$(document).ready()`
  - `.click()`, `.on()`, `.change()`, `.input()`, `.blur()`, `.submit()`
  - `.slideToggle()`, `.slideUp()`, `.slideDown()`
  - `.fadeIn()`, `.fadeOut()`
  - `.addClass()`, `.removeClass()`, `.toggleClass()`
  - `.html()`, `.text()`, `.val()`
- **Bootstrap 5 (CDN) & Bootstrap Icons:** Rejilla responsive fluida, utilidades y sistema iconográfico moderno.
- **Persistencia en LocalStorage:** Almacenamiento local seguro con prefijo `aurea_`, protección contra datos sensibles y sincronización reactiva entre pestañas.

---

## 3. Estructura de Archivos del Proyecto

```text
AUREA_Restaurante/
├── index.html                   # Experiencia pública del cliente
├── admin.html                   # Panel administrativo de gestión
├── README.md                    # Documentación, pruebas y guía académica
├── css/
│   ├── temas.css                # Variables CSS, modo oscuro/claro y tipografías
│   ├── cliente.css              # Estilos editoriales de la página pública
│   └── admin.css                # Estilos del panel SaaS administrativo
├── js/
│   ├── storage.js               # Almacén LocalStorage y 20+ datos semilla de autor
│   ├── bitacoras.js             # Motor de auditoría, filtros y exportación CSV/JSON
│   ├── validaciones.js          # Validaciones cliente y feedback visual
│   ├── temporizador.js          # Cuenta regresiva real de 60s con timestamp
│   ├── catalogo.js              # Tarjetas gastronómicas, favoritos y modal detalle
│   ├── filtros.js               # Filtros jerárquicos de categorías/subcategorías
│   ├── reservas.js              # Formulario de reserva y calculadora de consumo
│   └── app.js                   # Orquestador del cliente y efectos jQuery
└── assets/
    └── imagenes/
        ├── logo.svg             # Logotipo vectorial de la marca AUREA
        └── fallback-plato.svg   # Imagen de respaldo de alta fidelidad
```

---

## 4. Instrucciones de Ejecución

### Opción A — Ejecución Directa (Sin Servidor)
1. Navega hasta la carpeta `AUREA_Restaurante`.
2. Haz doble clic sobre `index.html` para abrir la web pública en tu navegador habitual (Google Chrome, Microsoft Edge, Firefox, Safari).
3. Haz doble clic sobre `admin.html` (o usa el botón en el footer de la web pública) para acceder al panel administrativo.

### Opción B — Servidor Local con Python (Recomendado)
Abre una terminal PowerShell o CMD en la carpeta del proyecto y ejecuta:
```powershell
python -m http.server 8080
```
Luego abre en tu navegador:
```text
http://localhost:8080/index.html
http://localhost:8080/admin.html
```

### Opción C — Visual Studio Code (Live Server)
1. Abre la carpeta `AUREA_Restaurante` en VS Code.
2. Clic derecho en `index.html` → **Open with Live Server**.

---

## 5. Instrucciones para Publicar en GitHub Pages

1. Inicializa el repositorio en Git dentro de `AUREA_Restaurante`:
   ```bash
   git init
   git add .
   git commit -m "feat: AUREA Fine Dining & Gastronomy — Sistema completo UPDS"
   ```
2. Crea un repositorio en tu cuenta de GitHub (ej. `aurea-restaurante`).
3. Vincula y sube los cambios:
   ```bash
   git remote add origin https://github.com/TU-USUARIO/aurea-restaurante.git
   git branch -M main
   git push -u origin main
   ```
4. En GitHub, ve a **Settings → Pages**.
5. En **Source**, selecciona `Deploy from a branch`. Elige la rama `main` y la carpeta `/ (root)`.
6. Haz clic en **Save**. En un par de minutos tu sitio estará en vivo en:
   ```text
   https://TU-USUARIO.github.io/aurea-restaurante/
   ```

*Nota:* Dado que todas las rutas a scripts, hojas de estilo e imágenes son relativas (`css/`, `js/`, `assets/`), el proyecto funciona sin errores ni configuraciones adicionales en GitHub Pages.

---

## 6. Funcionalidades Principales

### Parte I: Experiencia del Cliente
- **Navbar y Menú Hamburguesa:** Encabezado con efecto cristal (*frosted glass*), botón de tema sol/luna, acceso a favoritos y botón hamburguesa universal (móvil y escritorio) que despliega un panel lateral suave con cierre por clic exterior o tecla `Escape`.
- **Tema Claro / Oscuro:** Transición fluida entre Modo Noche (Carbón y Dorado) y Modo Marfil (Beige y Salvia), persistente en `LocalStorage` y registrado en bitácoras.
- **Catálogo Gastronómico de 12 Categorías:**
  1. Entradas (Frías, Calientes, Para compartir, Gourmet)
  2. Platos fuertes (Pollo, Res, Cerdo, Pescados, Mariscos)
  3. Carnes y parrillas (Cortes premium, Parrilladas, Costillas, A la brasa)
  4. Pastas (Cremosas, Salsa de tomate, Rellenas, Vegetarianas)
  5. Pizzas (Clásicas, Especiales, Gourmet, Vegetarianas)
  6. Hamburguesas (Clásicas, Dobles, Premium, Vegetarianas)
  7. Ensaladas (Frescas, Tibias, Gourmet, Veganas)
  8. Comida vegetariana (Bowls, Risottos, Salteados, Especiales)
  9. Postres (Chocolates, Tartas, Helados, Frutas, Especiales)
  10. Bebidas (Jugos, Refrescos, Cafés de altura, Tés, Mocktails)
  11. Desayunos & Brunch (Brunch, Gourmet, Saludables)
  12. Especialidades del chef (De Autor, Degustación, Maridajes)
- **Filtros Jerárquicos e Instantáneos:** Al seleccionar una categoría se filtran automáticamente las subcategorías correspondientes. Búsqueda instantánea con atajo `/`, slider de precio máximo, toggle vegetariano, selector de picante, chips activos con botón de remoción y contador dinámico.
- **Ficha Modal de Detalle:** Despliegue con fotografía ampliada, porción, tiempo, notas del chef, lista de ingredientes, advertencias de alérgenos y platos relacionados de la misma categoría.
- **Calculadora de Consumo Estimado (Adaptación de la Guía Karaoke):** Permite añadir platos desde la carta, sumar/restar porciones, calcular subtotal, alternar servicio sugerido (10%) y visualizar el total en Bolivianos.
- **Temporizador Real de Reserva (60 Segundos):**
  - Al validar el formulario de reserva, se abre el modal flotante con la cuenta regresiva: `01:00`, `00:59`...
  - Emplea `setInterval()` con marca de tiempo límite real en `LocalStorage` para resistir recargas de página sin reiniciar el tiempo.
  - Si el cliente confirma antes de 00:00: asigna código `AUR-2026-XXXX`, emite comprobante con QR simulado, registra bitácora `CONFIRMAR_RESERVA` y sincroniza con el panel de administración.
  - Si expira el tiempo: cierra el modal con `fadeOut()`, marca estado `EXPIRADO`, libera la mesa y alerta al usuario.
  - Si cancela: aborta la operación y registra la cancelación en bitácoras.
- **Acordeones con jQuery:** Acordeones funcionales para protocolos de alérgenos, horarios, dress code y valet parking usando `slideToggle()`.
- **Especialidades Dinámicas:** Selector de especialidades del chef que modifica en tiempo real los degradados de fondo, el icono y el maridaje.

### Parte II: Panel del Administrador
- **Dashboard de Control:** Tarjetas de KPIs calculadas en vivo desde `LocalStorage` (Reservas totales, confirmadas, pendientes, canceladas, expiradas, mesas activas, platos en carta y eventos registrados).
- **Gestión Integral de Reservas:** Tabla con filtros por estado, zona, fecha y búsqueda. Acciones para ver detalle, confirmar manualmente, cancelar o eliminar.
- **Plano de Mesas y Disponibilidad:** Control de las 8 mesas del restaurante (Salón principal, Terraza, Área privada y Zona VIP) con capacidad y estado de actividad.
- **CRUD del Catálogo:** Creación de nuevos platos mediante modal con validación, activación/desactivación de disponibilidad, edición y eliminación.
- **Categorías y Subcategorías:** Visualización de la jerarquía culinaria y conteo de platos vinculados.
- **Módulo Obligatorio de Bitácoras:**
  - Registro de todas las acciones del sistema con ID `EVT-XXXXXX`, fecha, hora, origen, módulo, acción, detalle y resultado.
  - Filtros combinados por módulo, resultado, origen y buscador de texto libre.
  - Paginación dinámica (15 eventos por página).
  - Botón **Exportar CSV** (descarga archivo `.csv` compatible con Excel).
  - Botón **Exportar JSON** (descarga archivo `.json` formateado).
  - Botón **Limpiar Historial** con modal de confirmación.
- **Estadísticas Culinarias:** Gráficas visuales de demanda por zona y estados de reserva calculadas a partir de datos reales.
- **Configuración & Reseteo:** Parámetros del restaurante y botón para restaurar datos semilla en cualquier momento.

---

## 7. Lista de Verificación y Pruebas Funcionales (Requisito 29)

| # | Prueba Funcional | Comportamiento Esperado | Estado |
|---|---|---|:---:|
| 1 | Menú Hamburguesa | Despliega panel lateral animado, cierra al hacer clic fuera o con tecla `Escape`. | Cumplido |
| 2 | Tema Claro / Oscuro | Alterna estilos de fondo y texto, guarda en `LocalStorage` y persiste al recargar. | Cumplido |
| 3 | Filtros Combinados | Filtra simultáneamente por categoría, subcategoría, precio y picante. | Cumplido |
| 4 | Jerarquía de Subcategorías | Cambiar de categoría actualiza al instante las subcategorías correspondientes. | Cumplido |
| 5 | Detalles de Comida | Botón "Detalles" abre modal de lujo con ingredientes, alérgenos y notas del chef. | Cumplido |
| 6 | Acordeones jQuery | Uso de `slideToggle()`, `addClass()` y `removeClass()` en acordeones informativos. | Cumplido |
| 7 | Validaciones de Formulario | Muestra bordes de error y mensajes específicos por campo sin recurrir a alertas intrusivas. | Cumplido |
| 8 | Calculadora Gourmet | Suma y resta platos seleccionados, actualiza subtotal y total en tiempo real. | Cumplido |
| 9 | Temporizador de 60 Segundos | Inicia cuenta regresiva exacta `01:00` con cálculo de tiempo límite. | Cumplido |
| 10 | Confirmación de Reserva | Detiene temporizador, genera código `AUR-2026-XXXX` y guarda en `LocalStorage`. | Cumplido |
| 11 | Expiración por Tiempo Agotado | Al llegar a `00:00`, cierra modal con `fadeOut()`, libera mesa y marca `EXPIRADO`. | Cumplido |
| 12 | Visualización en Admin | El administrador visualiza en tiempo real las reservas confirmadas por el cliente. | Cumplido |
| 13 | CRUD de Platos | Permite crear, alternar disponibilidad y eliminar platos desde el panel admin. | Cumplido |
| 14 | Sincronización Inmediata | Los cambios del catálogo administrativo se reflejan en la carta del cliente. | Cumplido |
| 15 | Registro de Bitácoras | Cada clic, filtro, reserva y acción administrativa genera un evento con ID. | Cumplido |
| 16 | Filtros de Bitácoras | Permite buscar por término, filtrar por módulo y resultado (`EXITOSO`, `FALLIDO`). | Cumplido |
| 17 | Exportación de Auditoría | Descarga exitosa de bitácoras en formatos CSV y JSON legibles. | Cumplido |
| 18 | Persistencia de Datos | Todos los cambios se mantienen al cerrar y reabrir el navegador. | Cumplido |
| 19 | Responsive Design | Navegación fluida y adaptada en móviles, tablets y computadoras de escritorio. | Cumplido |
| 20 | Consola Limpia | Sin errores de JavaScript ni dependencias rotas en consola de desarrollador. | Cumplido |

---

## 8. Consideraciones Académicas y Límites de la Simulación Local

- **Almacenamiento del Lado del Cliente:** Todo el sistema opera con `LocalStorage` en el navegador. La sincronización entre cliente y administrador funciona entre pestañas del mismo navegador que compartan el mismo origen local.
- **Entorno de Producción Comercial:** En un restaurante real, las reservas, disponibilidad y catálogo residirían en una base de datos relacional (PostgreSQL / MySQL) con un backend seguro (Node.js, Python FastAPI o Spring Boot) y autenticación mediante JWT / OAuth2 para proteger el panel administrativo.
- **Privacidad y Seguridad:** El módulo de bitácoras incluye un filtro de saneamiento de metadatos para no almacenar números de tarjetas de crédito ni contraseñas.
