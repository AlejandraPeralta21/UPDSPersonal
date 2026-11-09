/* =========================================================
   AUREA | Fine Dining & Gastronomy
   js/storage.js — Persistencia LocalStorage, Datos Semilla y Sincronización
   Diseño Web II — UPDS
   ========================================================= */

(function (window) {
  'use strict';

  const AUREA = (window.AUREA = window.AUREA || {});

  const PREFIX = 'aurea_';

  // Almacenamiento seguro con serialización JSON
  const Storage = {
    get(key, defaultValue = null) {
      try {
        const item = localStorage.getItem(PREFIX + key);
        if (item === null) return defaultValue;
        return JSON.parse(item);
      } catch (err) {
        console.warn(`Error al leer clave ${key} de LocalStorage:`, err);
        return defaultValue;
      }
    },

    set(key, value) {
      try {
        localStorage.setItem(PREFIX + key, JSON.stringify(value));
        return true;
      } catch (err) {
        console.error(`Error al escribir clave ${key} en LocalStorage:`, err);
        return false;
      }
    },

    remove(key) {
      try {
        localStorage.removeItem(PREFIX + key);
        return true;
      } catch (err) {
        console.error(`Error al eliminar clave ${key} de LocalStorage:`, err);
        return false;
      }
    },

    getRaw(key, defaultValue = '') {
      try {
        const val = localStorage.getItem(PREFIX + key);
        return val !== null ? val : defaultValue;
      } catch (err) {
        return defaultValue;
      }
    },

    setRaw(key, value) {
      try {
        localStorage.setItem(PREFIX + key, String(value));
        return true;
      } catch (err) {
        return false;
      }
    }
  };

  AUREA.Storage = Storage;

  // Categorías y Subcategorías requeridas
  const DEFAULT_CATEGORIAS = [
    {
      id: 'entradas',
      nombre: 'Entradas',
      icono: 'bi-egg-fried',
      descripcion: 'Aperturas gastronómicas diseñadas para despertar los sentidos',
      subcategorias: ['Frías', 'Calientes', 'Para compartir', 'Gourmet']
    },
    {
      id: 'platos-fuertes',
      nombre: 'Platos fuertes',
      icono: 'bi-fire',
      descripcion: 'Creaciones principales con técnicas de alta cocina internacional',
      subcategorias: ['Pollo', 'Res', 'Cerdo', 'Pescados', 'Mariscos']
    },
    {
      id: 'carnes-parrillas',
      nombre: 'Carnes y parrillas',
      icono: 'bi-trophy',
      descripcion: 'Cortes premium madurados y asados a fuego lento con leña seleccionada',
      subcategorias: ['Cortes premium', 'Parrilladas', 'Costillas', 'Especialidades a la brasa']
    },
    {
      id: 'pastas',
      nombre: 'Pastas',
      icono: 'bi-flower1',
      descripcion: 'Pastas artesanales elaboradas a mano diariamente con sémola de trigo duro',
      subcategorias: ['Cremosas', 'Con salsa de tomate', 'Rellenas', 'Vegetarianas']
    },
    {
      id: 'pizzas',
      nombre: 'Pizzas',
      icono: 'bi-pie-chart',
      descripcion: 'Masa fermentada 72 horas y horneada a la leña a 450°C',
      subcategorias: ['Clásicas', 'Especiales', 'Gourmet', 'Vegetarianas']
    },
    {
      id: 'hamburguesas',
      nombre: 'Hamburguesas',
      icono: 'bi-grid-fill',
      descripcion: 'Blend de res Wagyu y Angus en pan brioche artesanal dorado con mantequilla clarificada',
      subcategorias: ['Clásicas', 'Dobles', 'Premium', 'Vegetarianas']
    },
    {
      id: 'ensaladas',
      nombre: 'Ensaladas',
      icono: 'bi-tree',
      descripcion: 'Hojas orgánicas crujientes, brotes tiernos y vinagretas de autor',
      subcategorias: ['Frescas', 'Tibias', 'Gourmet', 'Veganas']
    },
    {
      id: 'vegetariana',
      nombre: 'Comida vegetariana',
      icono: 'bi-brightness-high',
      descripcion: 'Propuestas vegetales innovadoras con equilibrio nutricional y sabor intenso',
      subcategorias: ['Bowls', 'Risottos', 'Salteados', 'Especiales']
    },
    {
      id: 'postres',
      nombre: 'Postres',
      icono: 'bi-stars',
      descripcion: 'Pastelería de autor, texturas complejas y maridajes dulces excepcionales',
      subcategorias: ['Chocolates', 'Tartas', 'Helados', 'Frutas', 'Especiales']
    },
    {
      id: 'bebidas',
      nombre: 'Bebidas',
      icono: 'bi-cup-straw',
      descripcion: 'Mixología sin alcohol, infusiones botánicas y granos de café de altura',
      subcategorias: ['Jugos naturales', 'Refrescos', 'Cafés', 'Tés', 'Bebidas especiales sin alcohol']
    },
    {
      id: 'desayunos',
      nombre: 'Desayunos',
      icono: 'bi-sun',
      descripcion: 'Brunch matutino refinado y opciones energéticas gourmet',
      subcategorias: ['Brunch', 'Gourmet', 'Continental', 'Saludables']
    },
    {
      id: 'especialidades',
      nombre: 'Especialidades del chef',
      icono: 'bi-award',
      descripcion: 'Menú degustación y obras maestras del Chef Ejecutivo Fernando Arrieta',
      subcategorias: ['De Autor', 'Degustación', 'Maridajes']
    }
  ];

  // Platos Semilla (Gastronómicos, creíbles y con imágenes gourmet de alta calidad)
  const DEFAULT_PLATOS = [
    {
      id: 'plt-01',
      nombre: 'Carpaccio di Manzo Trufado',
      categoria: 'entradas',
      subcategoria: 'Gourmet',
      precio: 85,
      tiempo: '15 min',
      descripcion: 'Láminas ultrafinas de lomo de res madurado 28 días, perlas de aceite de trufa blanca, alcaparras crocantes y lascas de queso Parmigiano Reggiano DOP 24 meses.',
      descripcionLarga: 'Nuestro Carpaccio di Manzo rinde tributo a la tradición veneciana con un toque contemporáneo. El lomo es curado suavemente con hierbas alpinas y cortado al instante. Servido sobre una emulsión sedosa de mostaza dijon y trufa negra, coronado con rúcula silvestre y microvegetales de nuestro huerto orgánico.',
      ingredientes: ['Lomo de res madurado', 'Aceite de trufa blanca', 'Parmesano 24 meses', 'Rúcula silvestre', 'Alcaparras', 'Flor de sal'],
      alergenos: ['Lácteos'],
      porcion: '180g — Ideal para iniciar',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Popular',
      destacado: true,
      recomendacionChef: 'Acompañar con pan ciabatta rústico horneado en casa.',
      imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-02',
      nombre: 'Ceviche de Corvina y Fruta de la Pasión',
      categoria: 'entradas',
      subcategoria: 'Frías',
      precio: 95,
      tiempo: '18 min',
      descripcion: 'Corvina fresca curada en leche de tigre de maracuyá, dados de camote glaseado con miel de caña y crujiente de maíz chulpi.',
      descripcionLarga: 'Pescado blanco seleccionado de pesca sustentable, cortado en cubos uniformes y curtido al momento con cítricos amazónicos y maracuyá natural. El equilibrio entre acidez, frescor y el dulzor aromático del camote crea un contraste vibrante.',
      ingredientes: ['Corvina fresca', 'Leche de tigre de maracuyá', 'Camote glaseado', 'Cebolla morada', 'Cilantro fresco', 'Maíz chulpi'],
      alergenos: ['Pescado'],
      porcion: '220g',
      picante: 1,
      vegetariano: false,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'Degustar con cuchara para saborear la leche de tigre en cada bocado.',
      imagen: 'https://images.unsplash.com/photo-1535400255456-984241443b29?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-03',
      nombre: 'Pulpo a la Brasa con Crema de Papas Ahumadas',
      categoria: 'entradas',
      subcategoria: 'Calientes',
      precio: 110,
      tiempo: '25 min',
      descripcion: 'Tentáculo de pulpo tiernizado al vacío y sellado al carbón de quebracho, sobre muselina de papa nativa ahumada y pimentón de la Vera.',
      descripcionLarga: 'El pulpo se cocina a 78°C durante 4 horas para lograr una ternura inigualable, luego se glasea con aceite de carbón y pimentón dulce. Acompañado de papas andinas machacadas con mantequilla de campo y brotes tiernos de albahaca morada.',
      ingredientes: ['Pulpo español', 'Papas nativas', 'Pimentón de la Vera', 'Aceite de oliva virgen extra', 'Ajo asado', 'Ciboulette'],
      alergenos: ['Moluscos', 'Lácteos'],
      porcion: '250g',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Gourmet',
      destacado: true,
      recomendacionChef: 'Maridaje perfecto con agua infusionada con cítricos y hierbabuena.',
      imagen: 'https://images.unsplash.com/photo-1559847844-5315695dadae?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-04',
      nombre: 'Tabla de Quesos Artesanales y Charcutería Fina',
      categoria: 'entradas',
      subcategoria: 'Para compartir',
      precio: 140,
      tiempo: '15 min',
      descripcion: 'Selección de quesos madurados de San Javier, jamón serrano gran reserva, frutos secos tostados, uvas frescas y mermelada de higos al balsámico.',
      descripcionLarga: 'Una tabla curada minuciosamente para abrir una cena memorable en pareja o grupo. Incluye queso Gouda añejo, queso azul cremoso, Provolone asado, higos macerados y tostadas integrales con romero.',
      ingredientes: ['Quesos artesanales', 'Jamón serrano reserva', 'Nueces pecán', 'Mermelada de higos', 'Uvas sin semilla', 'Grissinis'],
      alergenos: ['Lácteos', 'Frutos secos', 'Gluten'],
      porcion: 'Para 2 a 3 personas (400g)',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Perfecto para compartir durante los primeros minutos de la velada.',
      imagen: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-05',
      nombre: 'Salmón Glaseado con Miso y Espárragos Silvestres',
      categoria: 'platos-fuertes',
      subcategoria: 'Pescados',
      precio: 145,
      tiempo: '25 min',
      descripcion: 'Filete de salmón noruego con costra caramelizada de miso dulce, servido con espárragos trigueros a la plancha y puré sedoso de coliflor al sésamo.',
      descripcionLarga: 'Pescado cocinado a punto rosado con piel ultra crocante. El glaseado de miso rojo y mirin aporta un umami profundo que armoniza con la frescura vegetal de los espárragos grillados y semillas de sésamo negro tostadas.',
      ingredientes: ['Salmón noruego', 'Miso blanco y rojo', 'Espárragos verdes', 'Coliflor cremosa', 'Aceite de sésamo', 'Cebollín chino'],
      alergenos: ['Pescado', 'Soya', 'Sésamo'],
      porcion: '320g',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'El salmón se sirve jugoso a término medio para preservar sus aceites naturales.',
      imagen: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-06',
      nombre: 'Suprema de Ave en Salsa de Champiñones Silvestres',
      categoria: 'platos-fuertes',
      subcategoria: 'Pollo',
      precio: 105,
      tiempo: '22 min',
      descripcion: 'Pechuga de pollo de granja cocinada sous-vide con hierbas provenzales, bañada en reducción de hongos porcini, trufa y puré de papas trufado.',
      descripcionLarga: 'Pollo campero alimentado con granos naturales, dorado a la sartén en mantequilla avellanada. La salsa untuosa de porcini y crema fresca aporta notas terrosas sublimes.',
      ingredientes: ['Pechuga de pollo orgánica', 'Hongos porcini', 'Crema de leche de altura', 'Vino blanco chardonnay', 'Tomillo fresco'],
      alergenos: ['Lácteos'],
      porcion: '350g',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Plato reconfortante de alta elegancia clásica.',
      imagen: 'https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-07',
      nombre: 'Bife de Chorizo Madurado 45 Días',
      categoria: 'carnes-parrillas',
      subcategoria: 'Cortes premium',
      precio: 165,
      tiempo: '25 min',
      descripcion: 'Corte Angus de 400 gramos con marmoleo BMS 5+, asado a la parrilla de quebracho, con chimichurri rústico de la casa y papas rústicas al romero.',
      descripcionLarga: 'Maduración en seco (dry-aged) en cámara controlada de sal del Himalaya. Esta técnica concentra el sabor a frutos secos y asegura una suavidad suprema. Se acompaña de sal marina gruesa y mantequilla de hierbas aromáticas derretida en mesa.',
      ingredientes: ['Bife de chorizo Angus 400g', 'Sal marina gruesa', 'Romero fresco', 'Papas andinas rústicas', 'Chimichurri de autor'],
      alergenos: [],
      porcion: '400g de carne premium',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'Recomendamos término medio o tres cuartos para disfrutar el jugo natural de la carne.',
      imagen: 'https://images.unsplash.com/photo-1558030006-450675393462?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-08',
      nombre: 'Costillas de Cerdo Glaseadas en Miel de Chiquitanía',
      categoria: 'carnes-parrillas',
      subcategoria: 'Costillas',
      precio: 135,
      tiempo: '30 min',
      descripcion: 'Costillar tierno cocinado durante 8 horas a baja temperatura, bañado en salsa barbacoa artesanal con miel virgen silvestre y piña caramelizada.',
      descripcionLarga: 'La carne se desprende del hueso con la suavidad de un tenedor. La salsa combina notas de humo de roble, chile suave y la inconfundible dulzura de la miel de la selva chiquitana boliviana.',
      ingredientes: ['Costillar de cerdo premium', 'Miel pura chiquitana', 'Salsa barbacoa artesanal', 'Piña asada', 'Semillas de mostaza'],
      alergenos: ['Mostaza'],
      porcion: '450g',
      picante: 1,
      vegetariano: false,
      etiqueta: 'Nuevo',
      destacado: false,
      recomendacionChef: 'Acompañar con ensalada de col crujiente y manzanas verdes.',
      imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-09',
      nombre: 'Ravioli Nero de Bogavante y Langostinos',
      categoria: 'pastas',
      subcategoria: 'Rellenas',
      precio: 130,
      tiempo: '20 min',
      descripcion: 'Pasta negra teñida con tinta de sepia natural, rellena de farsa de bogavante y langostinos, napada en bisque sedoso al brandy y caviar de salmón.',
      descripcionLarga: 'Masa hecha a mano con huevos de campo y tinta de calamar. Cada raviolo se sella individualmente y se baña en una reducción aromática de caparazones de crustáceos flambeada con coñac y crema.',
      ingredientes: ['Sémola de trigo duro', 'Tinta de sepia', 'Bogavante y langostinos', 'Bisque marinero', 'Huevas de salmón', 'Estragón fresco'],
      alergenos: ['Crustáceos', 'Huevos', 'Gluten', 'Lácteos'],
      porcion: '280g',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'Una de las insignias del restaurante desde nuestra apertura.',
      imagen: 'https://images.unsplash.com/photo-1551183053-bf91a1d81141?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-10',
      nombre: 'Tagliolini al Tartufo Nero y Mantequilla de Salvia',
      categoria: 'pastas',
      subcategoria: 'Cremosas',
      precio: 115,
      tiempo: '18 min',
      descripcion: 'Pasta larga al dente emulsionada en manteca emulsionada de salvia fresca, abundante trufa negra de verano rallada al momento y queso Grana Padano.',
      descripcionLarga: 'Elegancia italiana en su máxima pureza. Pocos ingredientes de altísima nobleza crean una textura envolvente donde la fragancia terrosa de la trufa es el protagonista absoluto.',
      ingredientes: ['Tagliolini al huevo', 'Trufa negra melanosporum', 'Mantequilla de pradera', 'Salvia fresca', 'Grana Padano 18 meses'],
      alergenos: ['Gluten', 'Huevos', 'Lácteos'],
      porcion: '260g',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Servir muy caliente y disfrutar del aroma inmediatamente al ser presentado.',
      imagen: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281691?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-11',
      nombre: 'Pizza Tartufata & Prosciutto di Parma',
      categoria: 'pizzas',
      subcategoria: 'Gourmet',
      precio: 105,
      tiempo: '15 min',
      descripcion: 'Fior di latte artesanal, crema de trufas, láminas de Prosciutto di Parma curado 18 meses, hojas frescas de rúcula y reducción de aceto balsámico de Módena.',
      descripcionLarga: 'Nuestra masa napolitana de alta hidratación desarrolla alvéolos ligeros y crujientes con bordes aireados (cornicione). Los ingredientes crudos se incorporan inmediatamente al salir del horno de leña.',
      ingredientes: ['Harina italiana 00', 'Mozzarella fior di latte', 'Prosciutto di Parma', 'Crema de trufa', 'Rúcula fresca', 'Aceto balsámico'],
      alergenos: ['Gluten', 'Lácteos'],
      porcion: 'Para 1 a 2 personas (32 cm)',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Comer con las manos doblándola estilo napolitano.',
      imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-12',
      nombre: 'AUREA Royal Wagyu Burger',
      categoria: 'hamburguesas',
      subcategoria: 'Premium',
      precio: 95,
      tiempo: '20 min',
      descripcion: 'Medallón de 220g de carne Wagyu, queso cheddar añejo fundido, cebolla caramelizada al vino oporto, panceta crocante y mayonesa trufada en brioche dorado.',
      descripcionLarga: 'La reinterpretación de la hamburguesa clásica bajo los códigos del fine dining. Carne jugosa picada al cuchillo, sellada en plancha de hierro fundido para lograr costra Maillard perfecta y suavidad extrema.',
      ingredientes: ['Carne Wagyu 220g', 'Pan brioche con mantequilla', 'Cheddar inglés 12 meses', 'Cebolla caramelizada con oporto', 'Panceta ahumada', 'Papas bastón trufadas'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos'],
      porcion: 'Completa con papas trufadas (420g)',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Popular',
      destacado: true,
      recomendacionChef: 'Incluye una guarnición de papas fritas rústicas con aceite de trufa y flor de sal.',
      imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-13',
      nombre: 'Ensalada de Burrata Puglia con Tomates Confitados',
      categoria: 'ensaladas',
      subcategoria: 'Gourmet',
      precio: 85,
      tiempo: '12 min',
      descripcion: 'Burrata entera de 200g rellena de stracciatella fresca, tomates heirloom marinados en albahaca, piñones tostados, pesto genovés y cristales de sal marina.',
      descripcionLarga: 'Al cortar la esfera de burrata, su corazón cremoso se derrama sobre los tomates confitados a fuego suave con tomillo y aceite de oliva virgen extra. Fresca, untuosa y profundamente aromática.',
      ingredientes: ['Burrata fresca 200g', 'Tomates heirloom confitados', 'Piñones tostados', 'Pesto de albahaca fresca', 'Aceite de oliva virgen extra', 'Aceto balsámico'],
      alergenos: ['Lácteos', 'Frutos secos'],
      porcion: '300g',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Ideal para amantes de los quesos frescos y entradas ligeras.',
      imagen: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-14',
      nombre: 'Risotto de Setas Silvestres y Azafrán de La Mancha',
      categoria: 'vegetariana',
      subcategoria: 'Risottos',
      precio: 100,
      tiempo: '24 min',
      descripcion: 'Arroz Carnaroli mantecado con caldo vegetal enriquecido, azafrán en hebras selectas, variedad de hongos morillas y shiitake glaseados, y crujiente de queso.',
      descripcionLarga: 'Elaborado bajo la rigurosa técnica italiana de mantecatura con mantequilla helada y queso curado sin cuajo animal. Textura ondeante "all\'onda" con perfume floral del azafrán español.',
      ingredientes: ['Arroz Carnaroli', 'Azafrán de La Mancha', 'Setas morillas y shiitake', 'Caldo vegetal reducido', 'Queso duro italiano', 'Aceite de oliva virgen'],
      alergenos: ['Lácteos'],
      porcion: '300g',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'Plato estrella de nuestra carta vegetariana de autor.',
      imagen: 'https://images.unsplash.com/photo-1633964913295-ceb43826e7c9?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-15',
      nombre: 'Esfera de Chocolate Valrhona 70% & Frutos Rojos',
      categoria: 'postres',
      subcategoria: 'Chocolates',
      precio: 65,
      tiempo: '12 min',
      descripcion: 'Domo de chocolate negro que se funde en mesa con ganache tibia de vainilla Bourbon, interior de mousse de avellanas, tierra de cacao y frambuesas frescas.',
      descripcionLarga: 'Una experiencia sensorial visual y gustativa. El mesero vierte una reducción tibia aromática que abre la cúpula de chocolate, revelando capas de textura crocante, cremosa y ácida.',
      ingredientes: ['Chocolate Guanaja 70%', 'Vainilla natural de Madagascar', 'Praliné de avellanas', 'Frambuesas y moras', 'Oro comestible de 24k'],
      alergenos: ['Lácteos', 'Huevos', 'Frutos secos'],
      porcion: 'Individual gourmet (180g)',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'El postre insignia para aniversarios y veladas románticas.',
      imagen: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-16',
      nombre: 'Mille-Feuille de Vainilla y Caramelo Salado',
      categoria: 'postres',
      subcategoria: 'Tartas',
      precio: 55,
      tiempo: '10 min',
      descripcion: 'Hojaldre invertido extra fino caramelizado, crema diplomática de vainilla Tahití, toffee de caramelo con flor de sal y helado artesanal de pistacho.',
      descripcionLarga: 'Capas crujientes y quebradizas que contrastan con la suavidad aterciopelada de la crema infusionada durante 48 horas con vainas naturales.',
      ingredientes: ['Hojaldre artesanal', 'Vainilla de Tahití', 'Caramelo salado', 'Pistachos tostados', 'Azúcar lustre'],
      alergenos: ['Gluten', 'Lácteos', 'Huevos', 'Frutos secos'],
      porcion: '160g',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Excelente armonía con nuestro café de origen boliviano.',
      imagen: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-17',
      nombre: 'Mocktail Botanical AUREA Gold',
      categoria: 'bebidas',
      subcategoria: 'Bebidas especiales sin alcohol',
      precio: 45,
      tiempo: '8 min',
      descripcion: 'Destilado botánico sin alcohol de enebro y romero, infusión de té blanco jazmín, cordial de maracuyá y perlas doradas comestibles con burbujas de tónica artesanal.',
      descripcionLarga: 'Nuestra firma de mixología sobria y sofisticada. Aromático, refrescante y con un sutil destello dorado que brilla bajo la tenue iluminación del restaurante.',
      ingredientes: ['Destilado botánico sin alcohol', 'Té jazmín de flor', 'Maracuyá fresco', 'Tónica premium', 'Polvo de oro comestible'],
      alergenos: [],
      porcion: 'Copa de cristal 350ml',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'La bebida ideal para brindar sin alcohol con todo el ritual gourmet.',
      imagen: 'https://images.unsplash.com/photo-1514362545857-3bc16c4c7d1b?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-18',
      nombre: 'Café Geisha de Caranavi con Filtro V60',
      categoria: 'bebidas',
      subcategoria: 'Cafés',
      precio: 35,
      tiempo: '10 min',
      descripcion: 'Café de especialidad de altura cosechado en los Yungas de Bolivia, preparado en mesa con método de extracción manual por goteo V60.',
      descripcionLarga: 'Notas florales de jazmín, bergamota, miel y durazno blanco. Reconocido internacionalmente como uno de los cafés más finos y elegantes del planeta.',
      ingredientes: ['Café Geisha 100% arábica boliviano', 'Agua mineral filtrada a 92°C'],
      alergenos: [],
      porcion: 'Jarra de servicio personal (250ml)',
      picante: 0,
      vegetariano: true,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Tomar sin azúcar para apreciar la complejidad frutal.',
      imagen: 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-19',
      nombre: 'Huevos Benedictinos Royale sobre Brioche de Masa Madre',
      categoria: 'desayunos',
      subcategoria: 'Brunch',
      precio: 75,
      tiempo: '15 min',
      descripcion: 'Dos huevos pochados de campo, láminas de salmón ahumado en madera de manzano, salsa holandesa tibia con toque de lima y cebollín fresco.',
      descripcionLarga: 'Servidos sobre rebanadas de pan brioche artesanal tostado a la plancha. La yema líquida y dorada se mezcla con la sedosidad de la salsa emulsionada a mano.',
      ingredientes: ['Huevos de pastoreo', 'Salmón ahumado artesanal', 'Pan brioche', 'Salsa holandesa casera', 'Espárragos salteados'],
      alergenos: ['Huevos', 'Lácteos', 'Pescado', 'Gluten'],
      porcion: 'Plato individual brunch (320g)',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Popular',
      destacado: false,
      recomendacionChef: 'Disponible exclusivamente en nuestro servicio de mañanas y fines de semana.',
      imagen: 'https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=900&q=80',
      activo: true
    },
    {
      id: 'plt-20',
      nombre: 'Menú Degustación Sinfonía AUREA (7 Tiempos)',
      categoria: 'especialidades',
      subcategoria: 'Degustación',
      precio: 380,
      tiempo: '90 min',
      descripcion: 'Recorrido sensorial completo por la visión culinaria del Chef Arrieta: snacks de bienvenida, 2 entradas frías, plato de mar, corte de carne, pre-postre y postre.',
      descripcionLarga: 'Un viaje gastronómico inolvidable diseñado para celebraciones solemnes y apasionados de la alta cocina. Cada pase cuenta una historia de técnicas ancestrales e innovación culinaria.',
      ingredientes: ['Selección estacional de ingredientes nobles y productos con denominación de origen'],
      alergenos: ['Consultar con el sommelier o maître al momento de ordenar'],
      porcion: 'Menú completo por persona',
      picante: 0,
      vegetariano: false,
      etiqueta: 'Especialidad',
      destacado: true,
      recomendacionChef: 'Requiere reserva previa con anticipación recomendada de 24 horas.',
      imagen: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80',
      activo: true
    }
  ];

  // Mesas del Restaurante (con zonas, capacidades y estados)
  const DEFAULT_MESAS = [
    { id: 'M-01', nombre: 'Mesa 01 — Ventanal Jardín', tipo: 'Mesa para dos', capacidad: 2, zona: 'Salón principal', activa: true, descripcion: 'Vista al jardín interior iluminado' },
    { id: 'M-02', nombre: 'Mesa 02 — Rincón Íntimo', tipo: 'Mesa para dos', capacidad: 2, zona: 'Salón principal', activa: true, descripcion: 'Privacidad acústica con iluminación tenue' },
    { id: 'M-03', nombre: 'Mesa 03 — Cava Central', tipo: 'Mesa familiar', capacidad: 4, zona: 'Salón principal', activa: true, descripcion: 'Ubicación privilegiada junto a la cava de vinos' },
    { id: 'M-04', nombre: 'Mesa 04 — Brisa Nocturna', tipo: 'Mesa familiar', capacidad: 4, zona: 'Terraza', activa: true, descripcion: 'Terraza exterior con calefactores y vegetación' },
    { id: 'M-05', nombre: 'Mesa 05 — Mirador Verde', tipo: 'Mesa grupal', capacidad: 6, zona: 'Terraza', activa: true, descripcion: 'Espacio semicubierto rodeado de orquídeas' },
    { id: 'M-06', nombre: 'Mesa 06 — Salón de Embajadores', tipo: 'Mesa grupal', capacidad: 8, zona: 'Área privada', activa: true, descripcion: 'Salón exclusivo para reuniones de negocios o familia' },
    { id: 'M-07', nombre: 'Mesa 07 — Suite Presidencial VIP', tipo: 'Mesa VIP', capacidad: 6, zona: 'Zona VIP', activa: true, descripcion: 'Servicio de sommelier personal y acceso reservado' },
    { id: 'M-08', nombre: 'Mesa 08 — Balcón Dorado VIP', tipo: 'Mesa VIP', capacidad: 4, zona: 'Zona VIP', activa: true, descripcion: 'Terraza elevada con vista panorámica exclusiva' }
  ];

  // Promociones del Restaurante
  const DEFAULT_PROMOCIONES = [
    {
      id: 'prm-01',
      titulo: 'Cena Romántica AUREA',
      subtitulo: 'Una velada inolvidable a la luz de las velas',
      descuento: 20,
      vigencia: 'Válido de Martes a Jueves',
      descripcion: 'Incluye 2 copas de bienvenida, entrada para compartir, 2 platos fuertes seleccionados y la Esfera de Chocolate Valrhona.',
      condiciones: 'Requiere reserva previa de mesa para 2 personas. No acumulable con otras ofertas.',
      imagen: 'https://images.unsplash.com/photo-1529516548873-9ce57c8f155e?auto=format&fit=crop&w=900&q=80',
      activa: true,
      destacada: true
    },
    {
      id: 'prm-02',
      titulo: 'Menú Ejecutivo Haute Cuisine',
      subtitulo: 'Excelencia culinaria en tus almuerzos de negocios',
      descuento: 15,
      vigencia: 'Lunes a Viernes de 12:00 a 15:30',
      descripcion: 'Entrada del día, plato fuerte a elección de nuestra carta de pastas o aves, café Geisha de cortesía y petit fours.',
      condiciones: 'Aplica solo para servicio en Salón Principal y Terraza durante horario de almuerzo.',
      imagen: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=900&q=80',
      activa: true,
      destacada: false
    },
    {
      id: 'prm-03',
      titulo: 'Experiencia Gourmet Degustación',
      subtitulo: '7 tiempos de autor con precio conmemorativo',
      descuento: 25,
      vigencia: 'Todos los Miércoles por la noche',
      descripcion: 'Disfruta nuestro aclamado menú degustación completo con 25% de cortesía en mesas reservadas con 48h de anticipación.',
      condiciones: 'Mínimo 2 comensales. Sujeto a disponibilidad de la cocina de autor.',
      imagen: 'https://images.unsplash.com/photo-1550966871-3ed3cdb5ed0c?auto=format&fit=crop&w=900&q=80',
      activa: true,
      destacada: true
    },
    {
      id: 'prm-04',
      titulo: 'Celebración de Cumpleaños & Aniversarios',
      subtitulo: 'Tu festejo con detalles de alta alcurnia',
      descuento: 10,
      vigencia: 'Todo el año en el mes de tu fecha especial',
      descripcion: 'Torta de autor diseñada por nuestro chef pastelero, brindis de honor de cortesía y mesa decorada con flores frescas.',
      condiciones: 'Presentar documento de identidad al ingresar. Aplica para reservas de 4 o más comensales.',
      imagen: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?auto=format&fit=crop&w=900&q=80',
      activa: true,
      destacada: false
    },
    {
      id: 'prm-05',
      titulo: 'Especial Fin de Semana en Terraza',
      subtitulo: 'Música en vivo y parrilla premium',
      descuento: 15,
      vigencia: 'Viernes y Sábados a partir de las 19:30',
      descripcion: 'Descuento especial en cortes de carne madurados y mocktails botánicos en nuestra terraza iluminada.',
      condiciones: 'Exclusivo para la zona Terraza exterior con cupos limitados.',
      imagen: 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=900&q=80',
      activa: true,
      destacada: false
    },
    {
      id: 'prm-06',
      titulo: 'Banquete Familiar AUREA',
      subtitulo: 'Domingos de unión y sobremesa placentera',
      descuento: 18,
      vigencia: 'Domingos de 12:30 a 17:00',
      descripcion: 'Selección de entradas para compartir, parrillada imperial o fuentes de pasta artesanal para 4 a 6 personas.',
      condiciones: 'Válido para mesas familiares y grupales. No acumulable.',
      imagen: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=900&q=80',
      activa: true,
      destacada: false
    }
  ];

  // Configuración general del restaurante
  const DEFAULT_CONFIG = {
    nombreRestaurante: 'AUREA | Fine Dining & Gastronomy',
    telefono: '+591 3 344-9800',
    whatsapp: '+591 78451230',
    correo: 'reservas@aureagastronomy.com',
    direccion: 'Av. San Martín 1550, Barrio Equipetrol, Santa Cruz de la Sierra, Bolivia',
    horarioApertura: '12:00',
    horarioCierre: '23:30',
    capacidadMaxima: 48,
    duracionReservaMinutos: 90,
    tiempoTemporizadorSegundos: 60,
    moneda: 'Bs.'
  };

  // Reservas semilla realistas
  const DEFAULT_RESERVAS = [
    {
      codigo: 'AUR-2026-8941',
      cliente: 'Alejandro Morales Villarroel',
      telefono: '71234567',
      correo: 'alejandro.morales@gmail.com',
      fecha: '2026-11-10',
      hora: '20:30',
      personas: 2,
      mesaId: 'M-01',
      mesaNombre: 'Mesa 01 — Ventanal Jardín',
      tipoMesa: 'Mesa para dos',
      zona: 'Salón principal',
      ocasion: 'Aniversario',
      observaciones: 'Por favor una mesa con velas y flores.',
      estado: 'CONFIRMADA',
      fechaRegistro: '2026-11-07 18:22:10',
      confirmadoEn: '2026-11-07 18:22:55'
    },
    {
      codigo: 'AUR-2026-8942',
      cliente: 'Valeria Justiniano Suárez',
      telefono: '78901234',
      correo: 'v.justiniano@corporacion.bo',
      fecha: '2026-11-11',
      hora: '13:00',
      personas: 6,
      mesaId: 'M-06',
      mesaNombre: 'Mesa 06 — Salón de Embajadores',
      tipoMesa: 'Mesa grupal',
      zona: 'Área privada',
      ocasion: 'Negocios',
      observaciones: 'Almuerzo de cierre de directorio empresarial.',
      estado: 'CONFIRMADA',
      fechaRegistro: '2026-11-08 09:14:02',
      confirmadoEn: '2026-11-08 09:14:48'
    },
    {
      codigo: 'AUR-2026-8943',
      cliente: 'Carlos Eduardo Roca',
      telefono: '67894512',
      correo: 'croca@cotas.com.bo',
      fecha: '2026-11-12',
      hora: '21:00',
      personas: 4,
      mesaId: 'M-07',
      mesaNombre: 'Mesa 07 — Suite Presidencial VIP',
      tipoMesa: 'Mesa VIP',
      zona: 'Zona VIP',
      ocasion: 'Cumpleaños',
      observaciones: 'Solicitamos sommelier para maridaje especial.',
      estado: 'PENDIENTE',
      fechaRegistro: '2026-11-08 10:45:20',
      confirmadoEn: null
    }
  ];

  // Bitácoras semilla iniciales
  const DEFAULT_LOGS = [
    {
      id: 'EVT-000001',
      fecha: '08/11/2026',
      hora: '09:00:15',
      origen: 'Sistema',
      modulo: 'Sistema',
      accion: 'INICIALIZAR_SISTEMA',
      descripcion: 'Inicialización de almacén local y datos semilla de AUREA Restaurante',
      resultado: 'EXITOSO',
      metadata: { version: '2.0-UPDS', ambiente: 'Local' }
    },
    {
      id: 'EVT-000002',
      fecha: '08/11/2026',
      hora: '09:14:48',
      origen: 'Cliente',
      modulo: 'Reservas',
      accion: 'CONFIRMAR_RESERVA',
      descripcion: 'Reserva confirmada AUR-2026-8942 para Valeria Justiniano (6 personas, Área privada)',
      resultado: 'EXITOSO',
      metadata: { codigo: 'AUR-2026-8942', mesa: 'M-06' }
    },
    {
      id: 'EVT-000003',
      fecha: '08/11/2026',
      hora: '10:15:30',
      origen: 'Administrador',
      modulo: 'Catálogo',
      accion: 'ACTUALIZAR_PRECIO',
      descripcion: 'Ajuste de precio del plato Bife de Chorizo Madurado a Bs. 165',
      resultado: 'EXITOSO',
      metadata: { platoId: 'plt-07', nuevoPrecio: 165 }
    }
  ];

  // Inicializador de almacén: si no existen las claves, se inyectan las semillas
  function initStorage() {
    if (!Storage.get('categorias')) {
      Storage.set('categorias', DEFAULT_CATEGORIAS);
    }
    if (!Storage.get('platos')) {
      Storage.set('platos', DEFAULT_PLATOS);
    }
    if (!Storage.get('mesas')) {
      Storage.set('mesas', DEFAULT_MESAS);
    }
    if (!Storage.get('promociones')) {
      Storage.set('promociones', DEFAULT_PROMOCIONES);
    }
    if (!Storage.get('reservas')) {
      Storage.set('reservas', DEFAULT_RESERVAS);
    }
    if (!Storage.get('config')) {
      Storage.set('config', DEFAULT_CONFIG);
    }
    if (!Storage.get('logs')) {
      Storage.set('logs', DEFAULT_LOGS);
    }
    if (!Storage.get('favoritos')) {
      Storage.set('favoritos', ['plt-01', 'plt-07', 'plt-15']);
    }
    if (!Storage.getRaw('theme')) {
      Storage.setRaw('theme', 'dark');
    }
  }

  // Ejecución inmediata
  initStorage();

  // Exportar funciones y datos por defecto a AUREA
  AUREA.DEFAULT_CATEGORIAS = DEFAULT_CATEGORIAS;
  AUREA.DEFAULT_PLATOS = DEFAULT_PLATOS;
  AUREA.DEFAULT_MESAS = DEFAULT_MESAS;
  AUREA.DEFAULT_PROMOCIONES = DEFAULT_PROMOCIONES;
  AUREA.DEFAULT_CONFIG = DEFAULT_CONFIG;
  AUREA.resetStorage = function () {
    Storage.set('categorias', DEFAULT_CATEGORIAS);
    Storage.set('platos', DEFAULT_PLATOS);
    Storage.set('mesas', DEFAULT_MESAS);
    Storage.set('promociones', DEFAULT_PROMOCIONES);
    Storage.set('reservas', DEFAULT_RESERVAS);
    Storage.set('config', DEFAULT_CONFIG);
    Storage.set('logs', DEFAULT_LOGS);
    Storage.set('favoritos', ['plt-01', 'plt-07', 'plt-15']);
    return true;
  };

})(window);
