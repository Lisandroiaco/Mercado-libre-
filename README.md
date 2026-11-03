# 🛍️ Mercadito

Un marketplace estilo e-commerce latinoamericano, hecho como proyecto de portfolio con **React 19, TypeScript, Vite y Tailwind CSS**.

> Proyecto educativo inspirado en los grandes marketplaces de la región. No es un sitio comercial real ni está afiliado a ninguna empresa.

## ✨ Funcionalidades

### Navegación y búsqueda
- **Buscador con autocompletado** (marcas y productos), **búsquedas recientes**, navegación con flechas y atajo <kbd>/</kbd>.
- **"¿Quisiste decir…?"** con distancia de Levenshtein cuando la búsqueda no da resultados.
- Búsqueda que ignora tildes y mayúsculas, y exige que coincidan todas las palabras.
- **Filtros** por categoría, marca, condición, calificación, envío gratis, FULL y precio, con contadores por opción. Todo vive en la URL.
- **6 formas de ordenar**: relevancia, menor y mayor precio, mejor calificados, mayor descuento y más nuevos.
- **Vista en lista o grilla** (se recuerda) y **paginación**.

### Productos
- 59 productos en 10 categorías, con **variantes** (color/talle), etiquetas de "Más vendido", "Recomendado" y "Últimas unidades".
- **Galería con zoom** que sigue el mouse.
- **Calculadora de envío por código postal**: estándar, express y retiro, con fecha estimada.
- **Historial de precios** de 6 meses en un gráfico SVG.
- **Comprados juntos frecuentemente**, con botón para sumar todo al carrito.
- **Preguntas** con atajos y buscador, y **opiniones** con filtro por estrellas y formulario para escribir la tuya.
- **Comparador** de hasta 3 productos lado a lado, que marca el más barato y el mejor calificado.
- Página de **vendedor** con reputación y productos, y sección de **tiendas oficiales**.

### Compra
- **Mini-carrito lateral** al agregar productos.
- **Cupones** (`MERCADITO10`, `BIENVENIDA`, `ENVIOGRATIS`), **guardar para después** y **barra de progreso hacia el envío gratis**.
- **Checkout en 3 pasos** con elección de entrega, **tarjeta validada con Luhn**, detección de Visa, Mastercard y Amex, y vista previa de la tarjeta.
- **Mis compras** con **seguimiento del envío**, que avanza solo para la demo, y botón de **volver a comprar**.

### Cuenta y extras
- **Login y registro** de prueba, con cuenta demo en un clic.
- **Vender**: publicá un producto con vista previa en vivo, y aparece al instante en la búsqueda y en la home.
- **Modo oscuro** (claro, oscuro o según el sistema), hecho redefiniendo los tokens de color.
- **Ofertas relámpago** con cuenta regresiva hasta la medianoche.
- Notificaciones (toasts), **barra inferior tipo app en el celular**, botón para volver arriba, link para saltar al contenido, newsletter y **centro de ayuda** con buscador.
- Todo se guarda en `localStorage`: carrito, favoritos, historial, compras, publicaciones, opiniones y tema.
- Diseño responsive y accesible: roles ARIA, combobox accesible, foco visible y soporte para `prefers-reduced-motion`.

## 🧱 Stack

| | |
|---|---|
| UI | React 19 + React Router 7 |
| Lenguaje | TypeScript |
| Estilos | Tailwind CSS 4 |
| Íconos | lucide-react |
| Build | Vite |
| Tests | Vitest + Testing Library |
| Lint | oxlint |
| CI | GitHub Actions |

## 🚀 Cómo correrlo

```bash
npm install
npm run dev        # http://localhost:5173
```

Otros scripts:

```bash
npm test           # 44 tests unitarios y de integración
npm run build:single  # build en un solo HTML (demo/mercadito.html)
npm run lint       # linter
npm run build      # build de producción en dist/
npm run preview    # sirve el build
```

## 📁 Estructura

```
src/
├── components/   # Header, Footer, ProductCard, ProductRow, Price, Stars…
├── context/      # Estado global: carrito, favoritos, historial
├── data/         # Catálogo de productos y categorías (mock)
├── lib/          # Lógica pura y testeada: búsqueda, carrito, cupones, tarjetas, envíos, compras
├── pages/        # Home, Search, ProductDetail, Cart, Checkout, Orders, Compare, Sell, Seller, Login, Help…
└── App.tsx       # Rutas
```

La lógica de negocio (búsqueda, filtros, carrito y validaciones) está en funciones puras dentro de `src/lib`, separada de los componentes, para poder testearla de forma aislada.

## 🖼️ Imágenes de productos

El catálogo funciona 100% offline: cada producto tiene una ilustración generada a partir de su categoría (`ProductImage`). Para usar fotos reales, agregá un campo `images` al tipo `Product` y renderizalo en `ProductImage`.

## 🌐 Deploy

Incluye `vercel.json` con el rewrite que necesita una SPA. En Vercel o Netlify alcanza con importar el repo: el build command es `npm run build` y el output `dist`.

## 🗺️ Próximos pasos

- [ ] Backend real (Node/Express o Supabase) con usuarios y órdenes.
- [ ] Integrar la API pública de productos de algún marketplace.
- [ ] Paginación y búsqueda con sugerencias.
