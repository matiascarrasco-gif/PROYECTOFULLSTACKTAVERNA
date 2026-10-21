// Base de datos simulada del catálogo: CRUD local y aviso a las vistas suscritas.
const STORAGE_KEY = 'taverna_react_products_v1';
const legacyAdminKey = 'taverna_admin_products';
const listeners = new Set();
let products = [];
let initialized = false;
let nextId = 0;

function createId() {
  nextId += 1;
  return `admin-${Date.now()}-${nextId}`;
}

// Convierte registros guardados por el panel heredado al formato actual.
function normalizeLegacyProduct(product) {
  const price = Number(String(product.price ?? '').replace(/[^\d]/g, ''));
  const rawImage = product.img ?? product.image ?? '';
  return {
    id: `admin-${product.id ?? createId()}`,
    title: String(product.name ?? product.title ?? '').trim(),
    description: String(product.description ?? '').trim(),
    price: Number.isFinite(price) ? price : 0,
    image: rawImage.startsWith('images/') ? `/${rawImage}` : rawImage,
    category: String(product.cat ?? product.category ?? 'Accesorios').trim(),
    sourceRoute: '',
    platform: '',
    genre: '',
    subcategory: '',
  };
}

function readSavedProducts() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved === null) return null;
  const parsed = JSON.parse(saved);
  if (!Array.isArray(parsed)) {
    throw new Error(`Los datos guardados en ${STORAGE_KEY} no tienen un formato válido.`);
  }
  return parsed;
}

function commit(nextProducts) {
  // Persiste los cambios y actualiza en vivo las pantallas suscritas.
  localStorage.setItem(STORAGE_KEY, JSON.stringify(nextProducts));
  products = nextProducts;
  listeners.forEach((listener) => listener());
}

function validateProduct(input) {
  // Reglas compartidas antes de crear o editar productos.
  const title = String(input.title ?? '').trim();
  const description = String(input.description ?? '').trim();
  const category = String(input.category ?? '').trim();
  const image = String(input.image ?? '').trim();
  const price = Number(input.price);

  if (title.length < 2 || title.length > 120) {
    throw new Error('El nombre debe tener entre 2 y 120 caracteres.');
  }
  if (!description || description.length > 2000) {
    throw new Error('La descripción es obligatoria y no puede superar 2000 caracteres.');
  }
  if (!category) throw new Error('Selecciona una categoría.');
  if (!image || image.length > 500) throw new Error('La ruta de imagen es obligatoria.');
  if (!Number.isFinite(price) || price <= 0) throw new Error('El precio debe ser un número mayor que cero.');

  return { title, description, category, image, price };
}

export function initializeProductDatabase(seedProducts) {
  // Carga catálogo inicial una sola vez y conserva los productos administrados.
  if (initialized) return;
  if (!Array.isArray(seedProducts) || seedProducts.length === 0) {
    throw new Error('No se puede inicializar el catálogo sin productos iniciales.');
  }

  const saved = readSavedProducts();
  if (saved !== null) {
    products = saved;
  } else {
    let legacyProducts = [];
    const oldSaved = localStorage.getItem(legacyAdminKey);
    if (oldSaved) {
      const parsedLegacy = JSON.parse(oldSaved);
      if (!Array.isArray(parsedLegacy)) {
        throw new Error(`Los datos heredados en ${legacyAdminKey} no tienen un formato válido.`);
      }
      legacyProducts = parsedLegacy.map(normalizeLegacyProduct);
    }
    const ids = new Set(seedProducts.map((product) => product.id));
    products = [...seedProducts, ...legacyProducts.filter((product) => !ids.has(product.id))];
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }
  initialized = true;
}

export function subscribeProducts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProducts() {
  return products;
}

export function getProductById(id, sourceRoute) {
  return products.find((product) =>
    product.id === id && (!sourceRoute || product.sourceRoute.toLowerCase() === sourceRoute.toLowerCase()),
  ) ?? products.find((product) => product.sourceId === id &&
    (!sourceRoute || product.sourceRoute.toLowerCase() === sourceRoute.toLowerCase()));
}

export function createProduct(input) {
  const normalized = validateProduct(input);
  const id = createId();
  const product = {
    id,
    ...normalized,
    sourceId: id,
    sourceRoute: '',
    platform: '',
    genre: '',
    subcategory: '',
  };
  commit([...products, product]);
  return product;
}

// Las operaciones CRUD se mantienen aquí para reutilizarlas desde administración.
export function updateProduct(id, input) {
  const current = getProductById(id);
  if (!current) throw new Error('No se encontró el producto que intentas editar.');
  const normalized = validateProduct(input);
  const updated = { ...current, ...normalized };
  commit(products.map((product) => product.id === id ? updated : product));
  return updated;
}

export function deleteProduct(id) {
  if (!products.some((product) => product.id === id)) {
    throw new Error('No se encontró el producto que intentas eliminar.');
  }
  commit(products.filter((product) => product.id !== id));
}

export function resetProductDatabase(seedProducts) {
  localStorage.removeItem(STORAGE_KEY);
  products = [...seedProducts];
  initialized = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  listeners.forEach((listener) => listener());
}
