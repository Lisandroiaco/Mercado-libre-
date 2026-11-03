# 🛍️ Mercadito

Un marketplace estilo e-commerce latinoamericano, hecho como proyecto de portfolio con **React 19, TypeScript, Vite y Tailwind CSS**.

> Proyecto educativo inspirado en los grandes marketplaces de la región. No es un sitio comercial real ni está afiliado a ninguna empresa.

## ✨ Funcionalidades

- **Home** con banner rotativo, medios de pago, ofertas, categorías, más vendidos y "basado en tu última visita".
- **Búsqueda** sin tildes ni mayúsculas, que exige que coincidan todas las palabras.
- **Filtros** por categoría, condición (nuevo/usado), envío gratis y rango de precio, con contadores por opción. Todos viven en la URL, así que se pueden compartir.
- **Orden** por relevancia o por precio, de menor a mayor y de mayor a menor.
- **Página de producto** con galería, precio con descuento y cuotas, selector de cantidad limitado por el stock, info del vendedor, preguntas y respuestas (podés hacer preguntas) y opiniones con distribución de estrellas.
- **Carrito** que se guarda en `localStorage`, con stepper de cantidad, costo de envío y resumen.
- **Checkout en 3 pasos** (envío → pago → revisión) con validación del formulario y pantalla de confirmación.
- **Favoritos** e **historial de navegación** que también se guardan.
- **Diseño responsive** (mobile first) y accesible: labels, `aria-*`, foco visible y navegación por teclado.

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
npm test           # tests unitarios y de integración
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
├── lib/          # Lógica pura y testeada: búsqueda, carrito, formato, validación
├── pages/        # Home, Search, ProductDetail, Cart, Checkout, Collection, NotFound
└── App.tsx       # Rutas
```

La lógica de negocio (búsqueda, filtros, carrito y validaciones) está en funciones puras dentro de `src/lib`, separada de los componentes, para poder testearla de forma aislada.

## 🖼️ Imágenes de productos

El catálogo funciona 100% offline: cada producto tiene una ilustración generada a partir de su categoría (`ProductImage`). Para usar fotos reales, agregá un campo `images` al tipo `Product` y renderizalo en `ProductImage`.

## 🌐 Deploy

Incluye `vercel.json` con el rewrite que necesita una SPA. En Vercel o Netlify alcanza con importar el repo: el build command es `npm run build` y el output `dist`.

## 🗺️ Próximos pasos

- [ ] Backend real (Node/Express o Supabase) con usuarios y órdenes.
- [ ] Login y perfil de usuario.
- [ ] Publicar productos (flujo de vendedor).
- [ ] Integrar la API pública de productos de algún marketplace.
- [ ] Paginación y búsqueda con sugerencias.
