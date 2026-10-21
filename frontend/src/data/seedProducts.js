// Catálogo inicial: lee los productos desde las plantillas HTML heredadas.
import accesorios from '../pages/templates/Accesorios.html?raw';
import consolas from '../pages/templates/Consolas.html?raw';
import juegos from '../pages/templates/Juegos.html?raw';
import mouseMousepad from '../pages/templates/Mouse-Mousepad.html?raw';
import pcGamers from '../pages/templates/PcGamers.html?raw';
import poleras from '../pages/templates/Poleras.html?raw';
import poleron from '../pages/templates/Poleron.html?raw';
import sillasGamers from '../pages/templates/SillasGamers.html?raw';

const catalogs = [
  { category: 'Accesorios', route: 'Accesorios.html', markup: accesorios },
  { category: 'Consolas', route: 'Consolas.html', markup: consolas },
  { category: 'Juegos', route: 'Juegos.html', markup: juegos },
  { category: 'Mouse / Mousepad', route: 'Mouse-Mousepad.html', markup: mouseMousepad },
  { category: 'PC Gamers', route: 'PcGamers.html', markup: pcGamers },
  { category: 'Poleras Personalizadas', route: 'Poleras.html', markup: poleras },
  { category: 'Polerones Gamers Personalizados', route: 'Poleron.html', markup: poleron },
  { category: 'Sillas Gamers', route: 'SillasGamers.html', markup: sillasGamers },
];

// Normaliza rutas antiguas para que las imágenes sigan funcionando con Vite.
function imagePath(value) {
  if (!value) return '';
  return value.startsWith('images/') ? `/${value}` : value;
}

function productFromElement(element, category, route) {
  // Extrae nombre, precio, imagen y atributos desde una tarjeta HTML.
  const image = element.querySelector('img');
  const title = element.querySelector('h2, h3');
  const priceText = element.querySelector('strong, .precio')?.textContent.trim() ?? '';
  const description = Array.from(element.querySelectorAll('p'))
    .map((paragraph) => paragraph.textContent.trim())
    .find(Boolean) ?? '';
  const originalId = element.id || image?.getAttribute('src')?.split('/').pop();

  if (!image || !title || !originalId) return null;

  const price = Number(priceText.replace(/[^\d]/g, ''));
  const imageUrl = imagePath(image.getAttribute('src'));

  if (!Number.isFinite(price) || price < 0 || !imageUrl) return null;

  return {
    id: `${route.toLowerCase().replace('.html', '')}-${originalId.toLowerCase()}`,
    sourceId: originalId,
    title: title.textContent.trim(),
    description,
    price,
    image: imageUrl,
    category,
    sourceRoute: route,
    platform: element.dataset.consola || element.querySelector('.juego-consola')?.textContent.trim() || '',
    genre: element.dataset.genero || '',
    subcategory: element.dataset.categoria || '',
  };
}

export function getSeedProducts() {
  // Lee las plantillas como HTML y arma los productos iniciales del catálogo.
  if (typeof DOMParser === 'undefined') {
    throw new Error('No se pudo leer el catálogo inicial: DOMParser no está disponible.');
  }

  const products = [];
  for (const catalog of catalogs) {
    const document = new DOMParser().parseFromString(catalog.markup, 'text/html');
    const entries = document.querySelectorAll('.producto-detalle, .juego-card');
    for (const entry of entries) {
      const product = productFromElement(entry, catalog.category, catalog.route);
      if (product) products.push(product);
    }
  }

  if (products.length === 0) {
    throw new Error('No se encontraron productos iniciales en los catálogos.');
  }
  return products;
}
