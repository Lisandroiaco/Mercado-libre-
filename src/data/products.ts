import type { CategoryId, Product, Question, Review } from '../types'

type Seed = Pick<Product, 'id' | 'title' | 'category' | 'brand' | 'price' | 'description' | 'attributes'> &
  Partial<Omit<Product, 'id' | 'title' | 'category' | 'brand' | 'price' | 'description' | 'attributes'>>

const authors = ['Martina G.', 'Lucas P.', 'Sofía R.', 'Juan M.', 'Valentina L.', 'Tomás A.', 'Camila S.', 'Nicolás F.']
const reviewPool: Omit<Review, 'author' | 'date'>[] = [
  { rating: 5, title: 'Excelente', body: 'Llegó antes de lo esperado y funciona perfecto. Lo recomiendo.' },
  { rating: 5, title: 'Muy buena calidad', body: 'Superó mis expectativas, la calidad es muy buena para el precio.' },
  { rating: 4, title: 'Bueno', body: 'Cumple con lo que promete. Le pondría 5 si el embalaje fuera mejor.' },
  { rating: 4, title: 'Recomendable', body: 'Buena relación precio-calidad. El vendedor respondió rápido.' },
  { rating: 3, title: 'Correcto', body: 'Está bien, aunque esperaba un poco más. Hace lo justo.' },
  { rating: 5, title: 'Impecable', body: 'Tal cual la descripción. Volvería a comprar sin dudas.' },
]
const questionPool: Question[] = [
  { question: '¿Tienen stock disponible?', answer: '¡Hola! Sí, tenemos stock. Podés ofertar sin problemas. ¡Saludos!', date: '2026-10-21' },
  { question: '¿Hacen factura A?', answer: 'Hola, sí, hacemos factura A y B. Cargá tus datos al comprar.', date: '2026-10-12' },
  { question: '¿Tiene garantía?', answer: 'Sí, cuenta con 12 meses de garantía oficial.', date: '2026-09-30' },
  { question: '¿Se puede retirar en persona?', date: '2026-11-01' },
]

/** Small deterministic PRNG so generated data is stable between renders and tests. */
function seeded(str: string) {
  let h = 2166136261
  for (const ch of str) h = Math.imul(h ^ ch.charCodeAt(0), 16777619)
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507)
    h = Math.imul(h ^ (h >>> 13), 3266489909)
    return ((h ^= h >>> 16) >>> 0) / 4294967296
  }
}

function make(seed: Seed): Product {
  const rand = seeded(seed.id)
  const reviews = Array.from({ length: 3 }, (_, i) => ({
    ...reviewPool[Math.floor(rand() * reviewPool.length)],
    author: authors[Math.floor(rand() * authors.length)],
    date: `2026-${String(10 - i).padStart(2, '0')}-${String(1 + Math.floor(rand() * 27)).padStart(2, '0')}`,
  }))
  return {
    condition: 'nuevo',
    freeShipping: seed.price >= 30000,
    fullShipping: rand() > 0.5,
    stock: 1 + Math.floor(rand() * 40),
    sold: Math.floor(rand() * 5000),
    rating: Math.round((3.8 + rand() * 1.2) * 10) / 10,
    reviewsCount: 5 + Math.floor(rand() * 900),
    installments: seed.price >= 100000 ? 12 : seed.price >= 30000 ? 6 : 3,
    seller: `${seed.brand.toUpperCase()} TIENDA OFICIAL`,
    location: ['Capital Federal', 'Córdoba', 'Rosario', 'Mendoza', 'La Plata'][Math.floor(rand() * 5)],
    reviews,
    questions: questionPool.slice(0, 2 + Math.floor(rand() * 3)),
    ...seed,
  }
}

const p = (
  id: string,
  category: CategoryId,
  title: string,
  brand: string,
  price: number,
  description: string,
  attributes: Record<string, string>,
  extra: Partial<Seed> = {},
) => make({ id, category, title, brand, price, description, attributes, ...extra })

export const products: Product[] = [
  // Celulares
  p('MLA-1001', 'celulares', 'Samsung Galaxy S25 256 GB Negro 12 GB RAM', 'Samsung', 1_249_999,
    'Pantalla Dynamic AMOLED 2X de 6,2", cámara principal de 50 MP y batería de 4000 mAh con carga rápida.',
    { Marca: 'Samsung', Modelo: 'Galaxy S25', 'Memoria interna': '256 GB', 'Memoria RAM': '12 GB', Color: 'Negro' },
    { originalPrice: 1_499_999, sold: 3200, variants: { name: 'Color', options: ['Negro', 'Azul hielo', 'Plateado'] } }),
  p('MLA-1002', 'celulares', 'Apple iPhone 16 (128 GB) - Azul ultramar', 'Apple', 1_899_999,
    'Chip A18, cámara Fusion de 48 MP, botón de Acción y Control de Cámara. Diseño en aluminio.',
    { Marca: 'Apple', Modelo: 'iPhone 16', 'Memoria interna': '128 GB', Color: 'Azul ultramar' },
    { variants: { name: 'Color', options: ['Azul ultramar', 'Negro', 'Rosa', 'Verde azulado'] } }),
  p('MLA-1003', 'celulares', 'Motorola Moto G85 5G 256 GB 8 GB RAM Gris', 'Motorola', 449_999,
    'Pantalla pOLED curva de 6,7", 120 Hz, cámara Sony LYTIA de 50 MP y sonido Dolby Atmos.',
    { Marca: 'Motorola', Modelo: 'Moto G85', 'Memoria interna': '256 GB', 'Memoria RAM': '8 GB' },
    { originalPrice: 529_999, sold: 4800 }),
  p('MLA-1004', 'celulares', 'Xiaomi Redmi Note 14 128 GB 6 GB RAM Verde', 'Xiaomi', 329_999,
    'Pantalla AMOLED de 120 Hz, cámara de 108 MP y batería de 5500 mAh.',
    { Marca: 'Xiaomi', Modelo: 'Redmi Note 14', 'Memoria interna': '128 GB', 'Memoria RAM': '6 GB' }),
  p('MLA-1005', 'celulares', 'Cargador Rápido 25W USB-C + Cable 1m', 'Samsung', 24_999,
    'Cargador de pared con tecnología Super Fast Charging. Incluye cable USB-C a USB-C.',
    { Marca: 'Samsung', Potencia: '25 W', Conector: 'USB-C' }, { originalPrice: 32_999 }),

  // Computación
  p('MLA-2001', 'computacion', 'Notebook Lenovo IdeaPad Slim 3 Ryzen 7 16GB 512GB SSD 15,6"', 'Lenovo', 1_099_999,
    'Procesador AMD Ryzen 7 7730U, 16 GB de RAM, SSD de 512 GB y pantalla Full HD antirreflejo.',
    { Marca: 'Lenovo', Procesador: 'Ryzen 7 7730U', 'Memoria RAM': '16 GB', Almacenamiento: '512 GB SSD' },
    { originalPrice: 1_349_999 }),
  p('MLA-2002', 'computacion', 'MacBook Air 13" Chip M3 8GB 256GB SSD - Medianoche', 'Apple', 2_399_999,
    'Ultraliviana, con chip M3, hasta 18 horas de batería y pantalla Liquid Retina.',
    { Marca: 'Apple', Procesador: 'M3', 'Memoria RAM': '8 GB', Almacenamiento: '256 GB SSD' }),
  p('MLA-2003', 'computacion', 'Monitor Gamer Samsung Odyssey 27" 165Hz 1ms FHD', 'Samsung', 349_999,
    'Panel VA curvo 1000R, 165 Hz, 1 ms, compatible con AMD FreeSync Premium.',
    { Marca: 'Samsung', Tamaño: '27"', Frecuencia: '165 Hz', Resolución: '1920x1080' }, { originalPrice: 419_999 }),
  p('MLA-2004', 'computacion', 'Teclado Mecánico Logitech G413 SE Switches Táctiles', 'Logitech', 89_999,
    'Teclado mecánico de perfil completo con retroiluminación blanca y estructura de aluminio.',
    { Marca: 'Logitech', Switches: 'Táctiles', Idioma: 'Español' }),
  p('MLA-2005', 'computacion', 'Mouse Inalámbrico Logitech M170 Gris', 'Logitech', 12_999,
    'Mouse inalámbrico con receptor nano USB y hasta 12 meses de batería.',
    { Marca: 'Logitech', Conexión: 'Inalámbrica 2,4 GHz' }, { sold: 4900 }),
  p('MLA-2006', 'computacion', 'Disco Sólido SSD Kingston NV2 1TB NVMe M.2', 'Kingston', 79_999,
    'Velocidades de lectura de hasta 3500 MB/s. Ideal para laptops y PCs de escritorio.',
    { Marca: 'Kingston', Capacidad: '1 TB', Interfaz: 'PCIe 4.0 NVMe' }, { originalPrice: 94_999 }),

  // Electrónica
  p('MLA-3001', 'electronica', 'Smart TV 55" 4K UHD Google TV Dolby Vision', 'TCL', 699_999,
    'Televisor 4K con Google TV, HDR10+, Dolby Vision y Dolby Atmos. Control por voz.',
    { Marca: 'TCL', Tamaño: '55"', Resolución: '4K', 'Sistema operativo': 'Google TV' },
    { originalPrice: 899_999, sold: 2100 }),
  p('MLA-3002', 'electronica', 'Auriculares Inalámbricos JBL Tune 520BT Negro', 'JBL', 64_999,
    'Sonido JBL Pure Bass, hasta 57 horas de batería y carga rápida.',
    { Marca: 'JBL', Tipo: 'On-ear', Conexión: 'Bluetooth 5.3' }),
  p('MLA-3003', 'electronica', 'Parlante Portátil JBL Flip 6 Bluetooth Resistente al Agua', 'JBL', 189_999,
    'Sonido potente con certificación IP67 y 12 horas de reproducción.',
    { Marca: 'JBL', Potencia: '30 W', Resistencia: 'IP67' }, { originalPrice: 229_999 }),
  p('MLA-3004', 'electronica', 'Consola PlayStation 5 Slim 1TB Digital', 'Sony', 1_199_999,
    'Consola de nueva generación con SSD ultrarrápido y control DualSense.',
    { Marca: 'Sony', Almacenamiento: '1 TB', Edición: 'Digital' }),
  p('MLA-3005', 'electronica', 'Smartwatch Xiaomi Redmi Watch 5 Active', 'Xiaomi', 54_999,
    'Pantalla de 2", más de 140 modos deportivos, llamadas Bluetooth y 18 días de batería.',
    { Marca: 'Xiaomi', Pantalla: '2"', Batería: '18 días' }, { originalPrice: 69_999 }),

  // Hogar
  p('MLA-4001', 'hogar', 'Freidora de Aire Philips Essential 4,1 L 1400W', 'Philips', 159_999,
    'Tecnología Rapid Air para cocinar con hasta 90% menos de grasa. Fácil de limpiar.',
    { Marca: 'Philips', Capacidad: '4,1 L', Potencia: '1400 W' }, { originalPrice: 199_999, sold: 4500 }),
  p('MLA-4002', 'hogar', 'Cafetera Express Oster Prima Latte 15 Bares', 'Oster', 219_999,
    'Prepará espresso, cappuccino y latte con un solo toque. Depósito de leche removible.',
    { Marca: 'Oster', Presión: '15 bar', Capacidad: '1,5 L' }),
  p('MLA-4003', 'hogar', 'Silla de Oficina Ergonómica con Apoyo Lumbar Negra', 'Baires4', 139_999,
    'Respaldo de malla, altura regulable, apoyabrazos fijos y ruedas de nylon.',
    { Marca: 'Baires4', Material: 'Malla', 'Peso máximo': '120 kg' }),
  p('MLA-4004', 'hogar', 'Juego de Sábanas 2 1/2 Plazas Algodón 180 Hilos', 'Arcoiris', 29_999,
    'Incluye sábana ajustable, sábana plana y 2 fundas. 100% algodón.',
    { Marca: 'Arcoiris', Medida: '2 1/2 plazas', Material: 'Algodón' }, { originalPrice: 38_999 }),
  p('MLA-4005', 'hogar', 'Aspiradora Robot Xiaomi Robot Vacuum E10', 'Xiaomi', 289_999,
    'Barre y trapea, 4000 Pa de succión y control desde la app.',
    { Marca: 'Xiaomi', Succión: '4000 Pa', Autonomía: '110 min' }),

  // Deportes
  p('MLA-5001', 'deportes', 'Bicicleta Mountain Bike Rodado 29 21 Velocidades Frenos a Disco', 'Venzo', 589_999,
    'Cuadro de aluminio, suspensión delantera y cambios Shimano de 21 velocidades.',
    { Marca: 'Venzo', Rodado: '29', Velocidades: '21' }),
  p('MLA-5002', 'deportes', 'Mancuernas Ajustables 2 x 10 kg con Barra', 'Randers', 74_999,
    'Set de discos y barras para armar mancuernas o barra corta. Ideal para entrenar en casa.',
    { Marca: 'Randers', Peso: '20 kg total' }, { originalPrice: 89_999 }),
  p('MLA-5003', 'deportes', 'Zapatillas Running Adidas Runfalcon 5 Hombre', 'Adidas', 99_999,
    'Zapatillas livianas con mediasuela de EVA para mayor amortiguación.',
    { Marca: 'Adidas', Género: 'Hombre', Uso: 'Running' },
    { variants: { name: 'Talle', options: ['39', '40', '41', '42', '43', '44'] } }),
  p('MLA-5004', 'deportes', 'Mat de Yoga 6mm Antideslizante con Bolso', 'Gadnic', 19_999,
    'Colchoneta de TPE ecológica, liviana y fácil de transportar.',
    { Marca: 'Gadnic', Espesor: '6 mm', Material: 'TPE' }, { sold: 3900 }),

  // Moda
  p('MLA-6001', 'moda', 'Campera Puffer Hombre Impermeable con Capucha', 'Montagne', 129_999,
    'Abrigo liviano con relleno térmico y tela repelente al agua.',
    { Marca: 'Montagne', Género: 'Hombre', Talles: 'S a XXL' },
    { originalPrice: 169_999, variants: { name: 'Talle', options: ['S', 'M', 'L', 'XL', 'XXL'] } }),
  p('MLA-6002', 'moda', 'Mochila Urbana Porta Notebook 15,6" Impermeable', 'Head', 49_999,
    'Compartimento acolchado para notebook, puerto USB externo y bolsillo antirrobo.',
    { Marca: 'Head', Capacidad: '25 L' }),
  p('MLA-6003', 'moda', 'Lentes de Sol Polarizados UV400 Unisex', 'Infinit', 34_999,
    'Marco liviano y lentes polarizados con protección UV400.',
    { Marca: 'Infinit', Protección: 'UV400' }, { condition: 'nuevo' }),
  p('MLA-6004', 'moda', 'Reloj Casio Vintage A158W Plateado', 'Casio', 59_999,
    'El clásico reloj digital con alarma, cronómetro y luz.',
    { Marca: 'Casio', Modelo: 'A158W', Malla: 'Acero' }, { condition: 'usado', price: 39_999 }),

  // Juguetes
  p('MLA-7001', 'juguetes', 'Set de Bloques de Construcción Ciudad 500 Piezas', 'Blocky', 39_999,
    'Bloques compatibles con las principales marcas. Estimula la creatividad.',
    { Marca: 'Blocky', Piezas: '500', 'Edad mínima': '6 años' }),
  p('MLA-7002', 'juguetes', 'Juego de Mesa Estanciero Clásico', 'Toto Juegos', 27_999,
    'El clásico juego de compra-venta de campos argentinos para toda la familia.',
    { Marca: 'Toto Juegos', Jugadores: '2 a 6' }, { originalPrice: 34_999 }),
  p('MLA-7003', 'juguetes', 'Auto a Control Remoto 4x4 Todo Terreno Recargable', 'Turbo', 64_999,
    'Tracción 4x4, velocidad de hasta 25 km/h y batería recargable.',
    { Marca: 'Turbo', Escala: '1:16', Batería: 'Recargable' }),

  // Herramientas
  p('MLA-8001', 'herramientas', 'Taladro Percutor Inalámbrico 20V Black+Decker con 2 Baterías', 'Black+Decker', 169_999,
    'Incluye 2 baterías de litio, cargador y maletín. Ideal para hogar.',
    { Marca: 'Black+Decker', Voltaje: '20 V', Baterías: '2' }, { originalPrice: 199_999 }),
  p('MLA-8002', 'herramientas', 'Set de Herramientas 108 Piezas con Maletín', 'Stanley', 89_999,
    'Llaves, tubos, destornilladores y puntas en un maletín organizador.',
    { Marca: 'Stanley', Piezas: '108' }),
  p('MLA-8003', 'herramientas', 'Hidrolavadora Karcher K2 1400W 110 Bar', 'Karcher', 199_999,
    'Ideal para limpieza de autos, bicicletas y patios. Incluye lanza y pistola.',
    { Marca: 'Karcher', Presión: '110 bar', Potencia: '1400 W' }, { condition: 'usado', price: 129_999 }),

  // Más celulares y computación
  p('MLA-1006', 'celulares', 'Funda Silicona MagSafe para iPhone 16 Negra', 'Apple', 39_999,
    'Funda de silicona suave al tacto con imanes integrados compatibles con MagSafe.',
    { Marca: 'Apple', Compatibilidad: 'iPhone 16', Material: 'Silicona' }),
  p('MLA-1007', 'celulares', 'Auriculares In-Ear Samsung Galaxy Buds FE Grafito', 'Samsung', 119_999,
    'Cancelación activa de ruido, sonido AKG y hasta 30 horas con el estuche.',
    { Marca: 'Samsung', Tipo: 'In-ear', 'Cancelación de ruido': 'Sí' }, { originalPrice: 149_999 }),
  p('MLA-1008', 'celulares', 'Power Bank 20000 mAh Carga Rápida 22.5W USB-C', 'Xiaomi', 44_999,
    'Batería externa de alta capacidad con dos salidas USB y una USB-C.',
    { Marca: 'Xiaomi', Capacidad: '20000 mAh', Potencia: '22,5 W' }, { sold: 4600 }),
  p('MLA-2007', 'computacion', 'Notebook Gamer ASUS TUF A15 Ryzen 7 RTX 4060 16GB 512GB', 'ASUS', 1_899_999,
    'Pantalla de 15,6" a 144 Hz, placa RTX 4060 y refrigeración reforzada para gaming.',
    { Marca: 'ASUS', Procesador: 'Ryzen 7 7735HS', 'Placa de video': 'RTX 4060', 'Memoria RAM': '16 GB' },
    { originalPrice: 2_199_999 }),
  p('MLA-2008', 'computacion', 'Auriculares Gamer HyperX Cloud Stinger 2 con Micrófono', 'HyperX', 69_999,
    'Livianos, con sonido envolvente DTS y micrófono con cancelación de ruido.',
    { Marca: 'HyperX', Conexión: 'Jack 3,5 mm', Micrófono: 'Sí' }),
  p('MLA-2009', 'computacion', 'Webcam Logitech C920 Full HD 1080p', 'Logitech', 99_999,
    'Videollamadas en Full HD con corrección automática de luz y micrófono estéreo.',
    { Marca: 'Logitech', Resolución: '1080p', Conexión: 'USB' }, { originalPrice: 119_999 }),

  // Más electrónica
  p('MLA-3006', 'electronica', 'Nintendo Switch OLED 64GB Blanca', 'Nintendo', 899_999,
    'Pantalla OLED de 7", soporte ajustable y 64 GB de almacenamiento.',
    { Marca: 'Nintendo', Almacenamiento: '64 GB', Pantalla: '7" OLED' }),
  p('MLA-3007', 'electronica', 'Barra de Sonido Samsung HW-C400 Subwoofer Integrado', 'Samsung', 249_999,
    'Graves potentes con subwoofer integrado y conexión Bluetooth.',
    { Marca: 'Samsung', Potencia: '40 W', Conexión: 'Bluetooth / HDMI' }, { originalPrice: 299_999 }),
  p('MLA-3008', 'electronica', 'Google Chromecast con Google TV 4K', 'Google', 89_999,
    'Convertí tu TV en Smart con más de 10.000 apps y control por voz.',
    { Marca: 'Google', Resolución: '4K HDR' }),

  // Más hogar
  p('MLA-4006', 'hogar', 'Pava Eléctrica Acero Inoxidable 1,7 L Corte Automático', 'Atma', 34_999,
    'Hierve agua en minutos, con corte automático y base giratoria 360°.',
    { Marca: 'Atma', Capacidad: '1,7 L', Potencia: '2200 W' }, { sold: 4700 }),
  p('MLA-4007', 'hogar', 'Lámpara de Pie LED Regulable Estilo Nórdico', 'Interlight', 64_999,
    'Luz cálida regulable en 3 intensidades, ideal para living o dormitorio.',
    { Marca: 'Interlight', Altura: '1,6 m', Luz: 'LED cálida' }),
  p('MLA-4008', 'hogar', 'Set de Ollas Antiadherentes 7 Piezas Tapas de Vidrio', 'Hudson', 119_999,
    'Ollas y sartenes con recubrimiento antiadherente, aptas para todo tipo de cocinas.',
    { Marca: 'Hudson', Piezas: '7', Inducción: 'Sí' }, { originalPrice: 154_999 }),

  // Más deportes
  p('MLA-5005', 'deportes', 'Pelota de Fútbol Adidas Número 5 Profesional', 'Adidas', 49_999,
    'Pelota termosellada con diseño oficial, ideal para césped natural y sintético.',
    { Marca: 'Adidas', Tamaño: '5' }),
  p('MLA-5006', 'deportes', 'Botella Térmica Acero Inoxidable 1 L 24 hs Frío', 'Stanley', 69_999,
    'Mantiene bebidas frías por 24 horas y calientes por 12. Libre de BPA.',
    { Marca: 'Stanley', Capacidad: '1 L' },
    { originalPrice: 84_999, variants: { name: 'Color', options: ['Verde', 'Negro', 'Crema'] } }),

  // Más moda
  p('MLA-6005', 'moda', 'Zapatillas Urbanas Topper Lona Clásicas Blancas', 'Topper', 54_999,
    'Clásicas zapatillas de lona con suela de goma vulcanizada.',
    { Marca: 'Topper', Material: 'Lona' }, { variants: { name: 'Talle', options: ['36', '37', '38', '39', '40', '41', '42'] } }),
  p('MLA-6006', 'moda', 'Buzo Hoodie Algodón Frizado Unisex', 'Basics', 39_999,
    'Buzo con capucha y bolsillo canguro, algodón frizado de abrigo.',
    { Marca: 'Basics', Material: 'Algodón' },
    { originalPrice: 49_999, variants: { name: 'Talle', options: ['S', 'M', 'L', 'XL'] } }),

  // Belleza
  p('MLA-9001', 'belleza', 'Secador de Pelo Philips 2100W con Difusor', 'Philips', 79_999,
    'Secado rápido con tecnología iónica para un pelo sin frizz. Incluye difusor y concentrador.',
    { Marca: 'Philips', Potencia: '2100 W', Velocidades: '3' }, { originalPrice: 99_999 }),
  p('MLA-9002', 'belleza', 'Perfume Hombre Eau de Toilette 100 ml', 'Antonio Banderas', 54_999,
    'Fragancia amaderada y fresca, ideal para el día a día.',
    { Marca: 'Antonio Banderas', Volumen: '100 ml' }),
  p('MLA-9003', 'belleza', 'Plancha de Pelo Remington Cerámica 230°C', 'Remington', 59_999,
    'Placas de cerámica con turmalina, calentamiento en 30 segundos.',
    { Marca: 'Remington', 'Temperatura máxima': '230 °C' }),
  p('MLA-9004', 'belleza', 'Kit Skincare Limpieza + Sérum + Crema Hidratante', 'Cerave', 69_999,
    'Rutina completa para piel normal a seca, con ceramidas y ácido hialurónico.',
    { Marca: 'Cerave', Piezas: '3' }, { originalPrice: 82_999, sold: 2800 }),

  // Mascotas
  p('MLA-9101', 'mascotas', 'Alimento Perro Adulto Raza Mediana 15 kg', 'Royal Canin', 129_999,
    'Alimento balanceado completo para perros adultos de raza mediana.',
    { Marca: 'Royal Canin', Peso: '15 kg', Edad: 'Adulto' }, { sold: 4100 }),
  p('MLA-9102', 'mascotas', 'Rascador para Gatos 3 Niveles con Cucha', 'Pet Shop', 74_999,
    'Torre con postes de sisal, plataformas acolchadas y cucha.',
    { Marca: 'Pet Shop', Altura: '90 cm' }, { originalPrice: 92_999 }),
  p('MLA-9103', 'mascotas', 'Cama Moises para Perro Mediano Antidesgarro', 'Mimascota', 34_999,
    'Cama acolchada con base antideslizante y tela resistente.',
    { Marca: 'Mimascota', Tamaño: 'Mediano' }, { variants: { name: 'Color', options: ['Gris', 'Azul', 'Marrón'] } }),
  p('MLA-9104', 'mascotas', 'Comedero Automático Inteligente WiFi 4 L', 'Xiaomi', 109_999,
    'Programá las comidas de tu mascota desde el celular. Con cámara y grabación de voz.',
    { Marca: 'Xiaomi', Capacidad: '4 L', Conexión: 'WiFi' }),
]

export const productById = new Map(products.map((prod) => [prod.id, prod]))

/**
 * Simulated 6-month price history, ending at the current price.
 * Deterministic per product so the chart is stable.
 */
export function priceHistory(product: Product): { month: string; price: number }[] {
  const rand = seeded(`${product.id}-history`)
  const months = ['Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov']
  const start = product.originalPrice ?? product.price * (1 + rand() * 0.15)
  return months.map((month, i) => {
    if (i === months.length - 1) return { month, price: product.price }
    const t = i / (months.length - 1)
    const base = start + (product.price - start) * t * 0.6
    return { month, price: Math.round((base * (0.97 + rand() * 0.08)) / 100) * 100 }
  })
}

/** Builds a full Product from the fields a user fills in on the "Vender" page. */
export function createListing(
  input: Pick<Product, 'title' | 'category' | 'brand' | 'price' | 'condition' | 'stock' | 'description'>,
  sellerName: string,
): Product {
  return {
    ...make({
      id: `USR-${Date.now().toString(36).toUpperCase()}`,
      title: input.title,
      category: input.category,
      brand: input.brand,
      price: input.price,
      description: input.description,
      attributes: { Marca: input.brand, Condición: input.condition === 'nuevo' ? 'Nuevo' : 'Usado' },
    }),
    condition: input.condition,
    stock: input.stock,
    sold: 0,
    rating: 0,
    reviewsCount: 0,
    reviews: [],
    questions: [],
    seller: sellerName.toUpperCase(),
    userListing: true,
  }
}
