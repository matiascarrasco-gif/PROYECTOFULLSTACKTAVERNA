/* ============================================================
   ADMIN.JS — Sistema de Administración | La Taverna
   Credenciales: admin / taverna2025
   Almacenamiento: localStorage (sin backend requerido)
============================================================ */

// ─── CONSTANTES ────────────────────────────────────────────
const ADMIN_USER = 'admin';
const ADMIN_PASS = 'taverna2025';
const KEY_SESSION = 'taverna_admin_logged';
const KEY_PRODUCTS = 'taverna_admin_products';
const KEY_PRODUCT_EDITS = 'taverna_admin_product_edits';
const KEY_BLOG_POSTS = 'taverna_admin_blog_posts';
const KEY_DELETED_PRODUCTS = 'taverna_admin_deleted';
const KEY_DELETED_POSTS = 'taverna_admin_deleted_posts';

// ─── SESIÓN ─────────────────────────────────────────────────
function adminIsLogged() {
    return localStorage.getItem(KEY_SESSION) === 'true';
}

function adminLogin(user, pass) {
    if (user === ADMIN_USER && pass === ADMIN_PASS) {
        localStorage.setItem(KEY_SESSION, 'true');
        return true;
    }
    return false;
}

function adminLogout() {
    localStorage.removeItem(KEY_SESSION);
    location.reload();
}

// ─── HELPERS LOCALSTORAGE ────────────────────────────────────
function getAdminProducts() {
    try { return JSON.parse(localStorage.getItem(KEY_PRODUCTS)) || []; }
    catch { return []; }
}

function saveAdminProducts(arr) {
    localStorage.setItem(KEY_PRODUCTS, JSON.stringify(arr));
}

function getProductEdits() {
    try { return JSON.parse(localStorage.getItem(KEY_PRODUCT_EDITS)) || {}; }
    catch { return {}; }
}

function saveProductEdits(obj) {
    localStorage.setItem(KEY_PRODUCT_EDITS, JSON.stringify(obj));
}

function getDeletedProducts() {
    try { return JSON.parse(localStorage.getItem(KEY_DELETED_PRODUCTS)) || []; }
    catch { return []; }
}

function saveDeletedProducts(arr) {
    localStorage.setItem(KEY_DELETED_PRODUCTS, JSON.stringify(arr));
}

function getAdminBlogPosts() {
    try { return JSON.parse(localStorage.getItem(KEY_BLOG_POSTS)) || []; }
    catch { return []; }
}

function saveAdminBlogPosts(arr) {
    localStorage.setItem(KEY_BLOG_POSTS, JSON.stringify(arr));
}

function getDeletedPosts() {
    try { return JSON.parse(localStorage.getItem(KEY_DELETED_POSTS)) || []; }
    catch { return []; }
}

function saveDeletedPosts(arr) {
    localStorage.setItem(KEY_DELETED_POSTS, JSON.stringify(arr));
}

// ─── INYECCIÓN DEL BOTÓN DE LOGIN EN HEADER ─────────────────
function injectAdminButton() {
    const nav = document.querySelector('nav.menu-principal') || document.querySelector('header nav') || document.querySelector('header');
    if (!nav) return;

    // Evitar duplicados
    if (document.getElementById('admin-login-btn')) return;

    const btn = document.createElement('button');
    btn.id = 'admin-login-btn';
    btn.title = adminIsLogged() ? 'Panel de Administración' : 'Acceso Administrador';
    btn.innerHTML = adminIsLogged()
        ? '<span>⚙️</span> Admin'
        : '<span>🔐</span>';

    btn.addEventListener('click', () => {
        if (adminIsLogged()) {
            window.location.href = 'admin-panel.html';
        } else {
            openLoginModal();
        }
    });

    nav.appendChild(btn);
}

// ─── MODAL DE LOGIN ─────────────────────────────────────────
function openLoginModal() {
    let modal = document.getElementById('admin-login-modal');
    if (!modal) {
        modal = buildLoginModal();
        document.body.appendChild(modal);
    }
    modal.classList.add('activo');
    document.body.style.overflow = 'hidden';
    setTimeout(() => {
        const inp = modal.querySelector('#admin-login-user');
        if (inp) inp.focus();
    }, 100);
}

function closeLoginModal() {
    const modal = document.getElementById('admin-login-modal');
    if (modal) {
        modal.classList.remove('activo');
        document.body.style.overflow = '';
    }
}

function buildLoginModal() {
    const overlay = document.createElement('div');
    overlay.id = 'admin-login-modal';
    overlay.className = 'admin-modal-overlay';
    overlay.addEventListener('click', (e) => {
        if (e.target === overlay) closeLoginModal();
    });

    overlay.innerHTML = `
    <div class="admin-modal-box admin-login-box">
        <div class="admin-login-header">
            <div class="admin-login-icon">⚙️</div>
            <h2>Acceso Administrador</h2>
            <p>La Taverna — Panel de Control</p>
        </div>
        <form id="admin-login-form" autocomplete="off">
            <div class="admin-field">
                <label for="admin-login-user">Usuario</label>
                <input type="text" id="admin-login-user" placeholder="Ingresa tu usuario" autocomplete="off">
            </div>
            <div class="admin-field">
                <label for="admin-login-pass">Contraseña</label>
                <div class="admin-pass-wrap">
                    <input type="password" id="admin-login-pass" placeholder="••••••••••" autocomplete="off">
                    <button type="button" class="admin-pass-toggle" onclick="toggleAdminPass()">👁</button>
                </div>
            </div>
            <p id="admin-login-error" class="admin-login-error" style="display:none">❌ Usuario o contraseña incorrectos</p>
            <button type="submit" class="admin-btn-primary" id="admin-login-submit">
                <span>Ingresar al Panel</span>
            </button>
        </form>
        <button class="admin-modal-close" onclick="closeLoginModal()">✕</button>
    </div>`;

    overlay.querySelector('#admin-login-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const user = overlay.querySelector('#admin-login-user').value.trim();
        const pass = overlay.querySelector('#admin-login-pass').value;
        const errEl = overlay.querySelector('#admin-login-error');
        const btn = overlay.querySelector('#admin-login-submit');

        btn.disabled = true;
        btn.innerHTML = '<span>Verificando...</span>';

        setTimeout(() => {
            if (adminLogin(user, pass)) {
                btn.innerHTML = '<span>✅ ¡Bienvenido Admin!</span>';
                setTimeout(() => {
                    closeLoginModal();
                    location.reload();
                }, 700);
            } else {
                errEl.style.display = 'block';
                btn.disabled = false;
                btn.innerHTML = '<span>Ingresar al Panel</span>';
                overlay.querySelector('#admin-login-pass').value = '';
                overlay.querySelector('#admin-login-pass').focus();
            }
        }, 600);
    });

    return overlay;
}

function toggleAdminPass() {
    const inp = document.getElementById('admin-login-pass');
    if (!inp) return;
    inp.type = inp.type === 'password' ? 'text' : 'password';
}

// ─── TOOLBAR FLOTANTE (visible cuando el admin está logueado) ─
function injectAdminToolbar() {
    if (!adminIsLogged()) return;
    if (document.getElementById('admin-toolbar')) return;

    const toolbar = document.createElement('div');
    toolbar.id = 'admin-toolbar';
    toolbar.innerHTML = `
    <div class="admin-toolbar-inner">
        <span class="admin-toolbar-badge">⚙️ MODO ADMIN</span>
        <div class="admin-toolbar-actions">
            <a href="admin-panel.html" class="admin-toolbar-btn" title="Panel de control">
                📊 Dashboard
            </a>
            <button class="admin-toolbar-btn" id="admin-add-product-quick" title="Agregar producto">
                ➕ Producto
            </button>
            <button class="admin-toolbar-btn" id="admin-add-post-quick" title="Publicar en blog" style="display:none">
                📝 Post
            </button>
            <button class="admin-toolbar-btn admin-toolbar-logout" onclick="adminLogout()" title="Cerrar sesión">
                🚪 Salir
            </button>
        </div>
    </div>`;

    document.body.appendChild(toolbar);
    document.body.classList.add('admin-mode');

    // Si estamos en el blog, mostrar botón de post
    if (window.location.pathname.toLowerCase().includes('blog')) {
        const postBtn = toolbar.querySelector('#admin-add-post-quick');
        if (postBtn) postBtn.style.display = '';
        postBtn.addEventListener('click', openAddPostModal);
    }

    toolbar.querySelector('#admin-add-product-quick').addEventListener('click', openAddProductModal);
}

// ─── OVERLAY EDICIÓN en PRODUCTOS EXISTENTES ────────────────
function injectProductControls() {
    if (!adminIsLogged()) return;

    const productos = document.querySelectorAll('article.producto');
    const edits = getProductEdits();
    const deleted = getDeletedProducts();

    productos.forEach((art, idx) => {
        // ID único para el producto basado en posición + nombre
        const h3 = art.querySelector('h3');
        const pEl = art.querySelector('p');
        const img = art.querySelector('img');
        if (!h3) return;

        const productId = `existing_${idx}_${h3.textContent.replace(/\s+/g, '_').slice(0,20)}`;

        // Ocultar si fue eliminado
        if (deleted.includes(productId)) {
            art.style.display = 'none';
            return;
        }

        // Aplicar ediciones guardadas
        if (edits[productId]) {
            if (edits[productId].name && h3) h3.textContent = edits[productId].name;
            if (edits[productId].price && pEl) pEl.textContent = edits[productId].price;
        }

        // Agregar controles admin
        art.classList.add('admin-product-card');
        art.setAttribute('data-admin-id', productId);

        const controls = document.createElement('div');
        controls.className = 'admin-product-controls';
        controls.innerHTML = `
            <button class="admin-prod-btn edit" title="Editar producto" onclick="openEditProductModal('${productId}', this)">✏️</button>
            <button class="admin-prod-btn delete" title="Eliminar producto" onclick="deleteExistingProduct('${productId}', this)">🗑️</button>
        `;
        art.appendChild(controls);
    });
}

// ─── MODALES DE PRODUCTO ─────────────────────────────────────

// Agregar producto nuevo
function openAddProductModal() {
    closeAllAdminModals();
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay activo';
    modal.id = 'admin-add-product-modal';

    modal.innerHTML = `
    <div class="admin-modal-box">
        <button class="admin-modal-close" onclick="closeAllAdminModals()">✕</button>
        <h2 class="admin-modal-title">➕ Agregar Nuevo Producto</h2>
        <form id="add-product-form">
            <div class="admin-field">
                <label>Nombre del Producto *</label>
                <input type="text" id="np-name" placeholder="Ej: Silla Gamer Pro RGB" required>
            </div>
            <div class="admin-field">
                <label>Precio *</label>
                <input type="text" id="np-price" placeholder="Ej: $99.990" required>
            </div>
            <div class="admin-field">
                <label>Categoría</label>
                <select id="np-cat">
                    <option value="Productos destacados">Productos Destacados</option>
                    <option value="Accesorios">Accesorios</option>
                    <option value="Consolas">Consolas</option>
                    <option value="Mouse / Mousepad">Mouse / Mousepad</option>
                    <option value="Juegos">Juegos Digitales</option>
                    <option value="Sillas Gamers">Sillas Gamers</option>
                    <option value="PC Gamers">PC Gamers</option>
                </select>
            </div>
            <div class="admin-field">
                <label>URL de Imagen</label>
                <input type="text" id="np-img" placeholder="Ej: images/consolas/ps5slim.png">
            </div>
            <div class="admin-field">
                <label>Link de compra</label>
                <input type="text" id="np-link" placeholder="Ej: CompraProducto.html">
            </div>
            <div class="admin-form-actions">
                <button type="button" class="admin-btn-secondary" onclick="closeAllAdminModals()">Cancelar</button>
                <button type="submit" class="admin-btn-primary">✅ Guardar Producto</button>
            </div>
        </form>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAllAdminModals(); });

    modal.querySelector('#add-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getAdminProducts();
        const newProduct = {
            id: 'ap_' + Date.now(),
            name: document.getElementById('np-name').value.trim(),
            price: document.getElementById('np-price').value.trim(),
            category: document.getElementById('np-cat').value,
            img: document.getElementById('np-img').value.trim() || 'images/logosinfondo.png',
            link: document.getElementById('np-link').value.trim() || '#',
            createdAt: new Date().toLocaleDateString('es-CL')
        };
        products.push(newProduct);
        saveAdminProducts(products);
        closeAllAdminModals();
        showAdminToast('✅ Producto agregado exitosamente');
        renderAdminProducts();
    });
}

// Editar producto existente (del HTML)
function openEditProductModal(productId, btn) {
    closeAllAdminModals();
    const art = btn ? btn.closest('article.producto') : null;
    const currentName = art ? art.querySelector('h3')?.textContent : '';
    const currentPrice = art ? art.querySelector('p')?.textContent : '';

    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay activo';
    modal.id = 'admin-edit-product-modal';

    modal.innerHTML = `
    <div class="admin-modal-box">
        <button class="admin-modal-close" onclick="closeAllAdminModals()">✕</button>
        <h2 class="admin-modal-title">✏️ Editar Producto</h2>
        <form id="edit-product-form">
            <div class="admin-field">
                <label>Nombre</label>
                <input type="text" id="ep-name" value="${currentName.replace(/"/g,'&quot;')}" required>
            </div>
            <div class="admin-field">
                <label>Precio</label>
                <input type="text" id="ep-price" value="${currentPrice.replace(/"/g,'&quot;')}" required>
            </div>
            <div class="admin-form-actions">
                <button type="button" class="admin-btn-secondary" onclick="closeAllAdminModals()">Cancelar</button>
                <button type="submit" class="admin-btn-primary">💾 Guardar Cambios</button>
            </div>
        </form>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAllAdminModals(); });

    modal.querySelector('#edit-product-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const edits = getProductEdits();
        edits[productId] = {
            name: document.getElementById('ep-name').value.trim(),
            price: document.getElementById('ep-price').value.trim()
        };
        saveProductEdits(edits);

        // Actualizar en DOM
        if (art) {
            const h3 = art.querySelector('h3');
            const pEl = art.querySelector('p');
            if (h3) h3.textContent = edits[productId].name;
            if (pEl) pEl.textContent = edits[productId].price;
        }
        closeAllAdminModals();
        showAdminToast('✅ Producto actualizado');
    });
}

// Eliminar producto existente (del HTML)
function deleteExistingProduct(productId, btn) {
    if (!confirm('¿Eliminar este producto de la vista?')) return;
    const deleted = getDeletedProducts();
    deleted.push(productId);
    saveDeletedProducts(deleted);
    const art = btn ? btn.closest('article.producto') : null;
    if (art) {
        art.style.transition = 'opacity 0.4s, transform 0.4s';
        art.style.opacity = '0';
        art.style.transform = 'scale(0.8)';
        setTimeout(() => { art.style.display = 'none'; }, 400);
    }
    showAdminToast('🗑️ Producto eliminado');
}

// Editar producto del admin (del localStorage)
function openEditAdminProductModal(id) {
    closeAllAdminModals();
    const products = getAdminProducts();
    const p = products.find(x => x.id === id);
    if (!p) return;

    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay activo';
    modal.id = 'admin-edit-admin-product-modal';

    modal.innerHTML = `
    <div class="admin-modal-box">
        <button class="admin-modal-close" onclick="closeAllAdminModals()">✕</button>
        <h2 class="admin-modal-title">✏️ Editar Producto</h2>
        <form id="edit-ap-form">
            <div class="admin-field"><label>Nombre</label><input type="text" id="eap-name" value="${p.name.replace(/"/g,'&quot;')}" required></div>
            <div class="admin-field"><label>Precio</label><input type="text" id="eap-price" value="${p.price.replace(/"/g,'&quot;')}" required></div>
            <div class="admin-field"><label>Categoría</label>
                <select id="eap-cat">
                    ${['Productos destacados','Accesorios','Consolas','Mouse / Mousepad','Juegos','Sillas Gamers','PC Gamers'].map(c=>`<option value="${c}" ${c===p.category?'selected':''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="admin-field"><label>URL Imagen</label><input type="text" id="eap-img" value="${p.img.replace(/"/g,'&quot;')}"></div>
            <div class="admin-field"><label>Link Compra</label><input type="text" id="eap-link" value="${p.link.replace(/"/g,'&quot;')}"></div>
            <div class="admin-form-actions">
                <button type="button" class="admin-btn-secondary" onclick="closeAllAdminModals()">Cancelar</button>
                <button type="submit" class="admin-btn-primary">💾 Guardar</button>
            </div>
        </form>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAllAdminModals(); });

    modal.querySelector('#edit-ap-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const products = getAdminProducts();
        const idx = products.findIndex(x => x.id === id);
        if (idx >= 0) {
            products[idx].name = document.getElementById('eap-name').value.trim();
            products[idx].price = document.getElementById('eap-price').value.trim();
            products[idx].category = document.getElementById('eap-cat').value;
            products[idx].img = document.getElementById('eap-img').value.trim();
            products[idx].link = document.getElementById('eap-link').value.trim();
            saveAdminProducts(products);
        }
        closeAllAdminModals();
        showAdminToast('✅ Producto actualizado');
        if (typeof renderAdminDashboardProducts === 'function') renderAdminDashboardProducts();
        renderAdminProducts();
    });
}

// Eliminar producto del admin
function deleteAdminProduct(id) {
    if (!confirm('¿Eliminar este producto?')) return;
    const products = getAdminProducts().filter(p => p.id !== id);
    saveAdminProducts(products);
    showAdminToast('🗑️ Producto eliminado');
    renderAdminProducts();
    if (typeof renderAdminDashboardProducts === 'function') renderAdminDashboardProducts();
}

// ─── RENDER DE PRODUCTOS ADMIN ───────────────────────────────
function renderAdminProducts() {
    const products = getAdminProducts();
    const container = document.getElementById('admin-products-container');
    if (!container) return;

    if (products.length === 0) {
        container.innerHTML = `<div class="admin-empty-state">📦 No hay productos agregados aún. ¡Agrega el primero!</div>`;
        return;
    }

    container.innerHTML = products.map(p => `
    <div class="admin-product-row" id="admin-row-${p.id}">
        <img src="${p.img}" alt="${p.name}" class="admin-row-img" onerror="this.src='images/logosinfondo.png'">
        <div class="admin-row-info">
            <strong>${p.name}</strong>
            <span class="admin-row-cat">${p.category}</span>
            <span class="admin-row-price">${p.price}</span>
            <span class="admin-row-date">Agregado: ${p.createdAt}</span>
        </div>
        <div class="admin-row-actions">
            <button class="admin-prod-btn edit" onclick="openEditAdminProductModal('${p.id}')">✏️ Editar</button>
            <button class="admin-prod-btn delete" onclick="deleteAdminProduct('${p.id}')">🗑️ Eliminar</button>
        </div>
    </div>`).join('');
}

// Inyectar productos del admin en el DOM del Index
function injectAdminProductsIntoPage() {
    const products = getAdminProducts();
    if (products.length === 0) return;

    // Buscar la primera sección de productos para añadir los del admin
    const firstTrack = document.querySelector('.productos-track');
    if (!firstTrack) return;

    products.forEach(p => {
        const art = document.createElement('article');
        art.className = 'producto';
        if (adminIsLogged()) art.classList.add('admin-product-card');
        art.setAttribute('data-admin-id', p.id);
        art.innerHTML = `
            <a href="${p.link}" class="producto-enlace">
                <img src="${p.img}" alt="${p.name}" onerror="this.src='images/logosinfondo.png'">
                <h3>${p.name}</h3>
            </a>
            <p>${p.price}</p>
            <a href="${p.link}">Comprar</a>
            ${adminIsLogged() ? `
            <div class="admin-product-controls">
                <button class="admin-prod-btn edit" title="Editar" onclick="openEditAdminProductModal('${p.id}')">✏️</button>
                <button class="admin-prod-btn delete" title="Eliminar" onclick="deleteAdminProduct('${p.id}')">🗑️</button>
            </div>` : ''}
        `;
        firstTrack.appendChild(art);
    });
}

// ─── MODALES DE BLOG ─────────────────────────────────────────

function openAddPostModal() {
    closeAllAdminModals();
    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay activo';
    modal.id = 'admin-add-post-modal';

    modal.innerHTML = `
    <div class="admin-modal-box admin-modal-large">
        <button class="admin-modal-close" onclick="closeAllAdminModals()">✕</button>
        <h2 class="admin-modal-title">📝 Publicar en el Blog</h2>
        <form id="add-post-form">
            <div class="admin-field">
                <label>Título del Artículo *</label>
                <input type="text" id="bp-title" placeholder="Ej: Las mejores sillas gaming del 2026" required>
            </div>
            <div class="admin-field">
                <label>Categoría</label>
                <select id="bp-cat">
                    <option value="juegos">🎮 Juegos</option>
                    <option value="consolas">🕹️ Consolas</option>
                    <option value="accesorios">🖥️ Accesorios</option>
                    <option value="setup">💡 Setup</option>
                    <option value="opinion">💬 Opinión</option>
                </select>
            </div>
            <div class="admin-field">
                <label>Resumen (extracto) *</label>
                <textarea id="bp-excerpt" placeholder="Breve descripción del artículo..." rows="3" required></textarea>
            </div>
            <div class="admin-field">
                <label>Contenido Completo</label>
                <textarea id="bp-body" placeholder="Escribe el contenido completo del artículo aquí..." rows="7"></textarea>
            </div>
            <div class="admin-field">
                <label>URL de Imagen de portada</label>
                <input type="text" id="bp-img" placeholder="Ej: images/juegos/gtavi.jpg">
            </div>
            <div class="admin-field">
                <label>Autor</label>
                <input type="text" id="bp-author" placeholder="Ej: Redacción LT" value="👤 Admin">
            </div>
            <div class="admin-form-actions">
                <button type="button" class="admin-btn-secondary" onclick="closeAllAdminModals()">Cancelar</button>
                <button type="submit" class="admin-btn-primary">🚀 Publicar</button>
            </div>
        </form>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAllAdminModals(); });

    modal.querySelector('#add-post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const posts = getAdminBlogPosts();
        const catLabels = {
            juegos: '🎮 Juegos', consolas: '🕹️ Consolas',
            accesorios: '🖥️ Accesorios', setup: '💡 Setup', opinion: '💬 Opinión'
        };
        const catVal = document.getElementById('bp-cat').value;
        const newPost = {
            id: 'bp_' + Date.now(),
            title: document.getElementById('bp-title').value.trim(),
            category: catVal,
            categoryLabel: catLabels[catVal] || catVal,
            excerpt: document.getElementById('bp-excerpt').value.trim(),
            body: document.getElementById('bp-body').value.trim(),
            img: document.getElementById('bp-img').value.trim() || 'images/logosinfondo.png',
            author: document.getElementById('bp-author').value.trim() || '👤 Admin',
            date: new Date().toLocaleDateString('es-CL', { day: 'numeric', month: 'short', year: 'numeric' })
        };
        posts.push(newPost);
        saveAdminBlogPosts(posts);
        closeAllAdminModals();
        showAdminToast('🚀 Post publicado exitosamente');
        if (typeof renderAdminBlogPosts === 'function') renderAdminBlogPosts();
        injectAdminBlogPostsIntoPage();
    });
}

function openEditBlogPostModal(id) {
    closeAllAdminModals();
    const posts = getAdminBlogPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay activo';
    modal.id = 'admin-edit-post-modal';

    modal.innerHTML = `
    <div class="admin-modal-box admin-modal-large">
        <button class="admin-modal-close" onclick="closeAllAdminModals()">✕</button>
        <h2 class="admin-modal-title">✏️ Editar Post</h2>
        <form id="edit-post-form">
            <div class="admin-field"><label>Título</label><input type="text" id="ep-title" value="${post.title.replace(/"/g,'&quot;')}" required></div>
            <div class="admin-field"><label>Categoría</label>
                <select id="ep-cat">
                    ${['juegos','consolas','accesorios','setup','opinion'].map(c=>`<option value="${c}" ${c===post.category?'selected':''}>${c}</option>`).join('')}
                </select>
            </div>
            <div class="admin-field"><label>Resumen</label><textarea id="ep-excerpt" rows="3">${post.excerpt}</textarea></div>
            <div class="admin-field"><label>Contenido</label><textarea id="ep-body" rows="7">${post.body}</textarea></div>
            <div class="admin-field"><label>URL Imagen</label><input type="text" id="ep-img" value="${post.img.replace(/"/g,'&quot;')}"></div>
            <div class="admin-field"><label>Autor</label><input type="text" id="ep-author" value="${post.author.replace(/"/g,'&quot;')}"></div>
            <div class="admin-form-actions">
                <button type="button" class="admin-btn-secondary" onclick="closeAllAdminModals()">Cancelar</button>
                <button type="submit" class="admin-btn-primary">💾 Guardar Cambios</button>
            </div>
        </form>
    </div>`;

    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAllAdminModals(); });

    modal.querySelector('#edit-post-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const posts = getAdminBlogPosts();
        const idx = posts.findIndex(p => p.id === id);
        if (idx >= 0) {
            const catVal = document.getElementById('ep-cat').value;
            const catLabels = { juegos:'🎮 Juegos', consolas:'🕹️ Consolas', accesorios:'🖥️ Accesorios', setup:'💡 Setup', opinion:'💬 Opinión' };
            posts[idx].title = document.getElementById('ep-title').value.trim();
            posts[idx].category = catVal;
            posts[idx].categoryLabel = catLabels[catVal] || catVal;
            posts[idx].excerpt = document.getElementById('ep-excerpt').value.trim();
            posts[idx].body = document.getElementById('ep-body').value.trim();
            posts[idx].img = document.getElementById('ep-img').value.trim();
            posts[idx].author = document.getElementById('ep-author').value.trim();
            saveAdminBlogPosts(posts);
        }
        closeAllAdminModals();
        showAdminToast('✅ Post actualizado');
        if (typeof renderAdminBlogPosts === 'function') renderAdminBlogPosts();
    });
}

function deleteAdminBlogPost(id) {
    if (!confirm('¿Eliminar este post del blog?')) return;
    const posts = getAdminBlogPosts().filter(p => p.id !== id);
    saveAdminBlogPosts(posts);
    showAdminToast('🗑️ Post eliminado');
    if (typeof renderAdminBlogPosts === 'function') renderAdminBlogPosts();
    // Remover del DOM del blog
    const card = document.querySelector(`[data-admin-post-id="${id}"]`);
    if (card) {
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        card.style.opacity = '0';
        card.style.transform = 'scale(0.8)';
        setTimeout(() => card.remove(), 400);
    }
}

// ─── RENDER DE POSTS ADMIN EN EL BLOG ───────────────────────
function renderAdminBlogPosts() {
    const posts = getAdminBlogPosts();
    const container = document.getElementById('admin-blog-container');
    if (!container) return;

    if (posts.length === 0) {
        container.innerHTML = `<div class="admin-empty-state">📰 No hay posts publicados por el admin.</div>`;
        return;
    }

    container.innerHTML = posts.map(p => `
    <div class="admin-post-row" id="admin-post-row-${p.id}">
        <img src="${p.img}" alt="${p.title}" class="admin-row-img" onerror="this.src='images/logosinfondo.png'">
        <div class="admin-row-info">
            <strong>${p.title}</strong>
            <span class="admin-row-cat">${p.categoryLabel}</span>
            <span class="admin-row-date">${p.date}</span>
            <span>${p.author}</span>
        </div>
        <div class="admin-row-actions">
            <button class="admin-prod-btn edit" onclick="openEditBlogPostModal('${p.id}')">✏️ Editar</button>
            <button class="admin-prod-btn delete" onclick="deleteAdminBlogPost('${p.id}')">🗑️ Eliminar</button>
        </div>
    </div>`).join('');
}

// Inyectar posts del admin en el blog grid
function injectAdminBlogPostsIntoPage() {
    if (!window.location.pathname.toLowerCase().includes('blog') &&
        !window.location.href.toLowerCase().includes('blog')) return;

    const posts = getAdminBlogPosts();
    const deletedPosts = getDeletedPosts();
    const grid = document.getElementById('blogGrid');
    if (!grid) return;

    // Eliminar posts previos del admin del grid
    grid.querySelectorAll('[data-admin-post-id]').forEach(el => el.remove());

    posts.forEach(p => {
        if (deletedPosts.includes(p.id)) return;

        const catClassMap = {
            juegos: 'cat-juegos', consolas: 'cat-consolas',
            accesorios: 'cat-accesorios', setup: 'cat-setup', opinion: 'cat-opinion'
        };
        const catClass = catClassMap[p.category] || 'cat-juegos';

        const card = document.createElement('div');
        card.className = 'blog-card';
        card.setAttribute('data-cat', p.category);
        card.setAttribute('data-admin-post-id', p.id);

        card.innerHTML = `
        <div class="blog-card-img">
            <img src="${p.img}" alt="${p.title}" onerror="this.src='images/logosinfondo.png'">
            <span class="blog-card-cat ${catClass}">${p.categoryLabel}</span>
            ${adminIsLogged() ? `
            <div class="admin-post-controls">
                <button class="admin-prod-btn edit" onclick="openEditBlogPostModal('${p.id}')">✏️</button>
                <button class="admin-prod-btn delete" onclick="deleteAdminBlogPost('${p.id}')">🗑️</button>
            </div>` : ''}
        </div>
        <div class="blog-card-body">
            <div class="blog-card-meta">
                <span>🗓️ ${p.date}</span>
                <span>⏱️ 3 min</span>
            </div>
            <h3>${p.title}</h3>
            <p>${p.excerpt}</p>
            <div class="blog-card-footer">
                <span class="blog-card-author">${p.author}</span>
                <a href="javascript:void(0)" onclick="openAdminPost('${p.id}')" class="blog-card-link">Leer más →</a>
            </div>
        </div>`;

        grid.appendChild(card);
    });
}

// Abrir post del admin en el modal del blog
function openAdminPost(id) {
    const posts = getAdminBlogPosts();
    const post = posts.find(p => p.id === id);
    if (!post) return;

    // Usar el modal del blog si existe
    const catEl = document.getElementById('noticiaCat');
    if (catEl) {
        catEl.innerText = post.categoryLabel;
        document.getElementById('noticiaTitulo').innerText = post.title;
        document.getElementById('noticiaFecha').innerText = '🗓️ ' + post.date;
        document.getElementById('noticiaTiempo').innerText = '⏱️ 3 min de lectura';
        document.getElementById('noticiaAutor').innerText = post.author;
        document.getElementById('noticiaImg').src = post.img;
        document.getElementById('noticiaCuerpo').innerHTML = post.body
            ? `<p>${post.body.replace(/\n/g, '</p><p>')}</p>`
            : `<p>${post.excerpt}</p>`;
        document.getElementById('modalNoticia').classList.add('activo');
        document.body.style.overflow = 'hidden';
    }
}

// ─── CONTROLES DE POSTS EXISTENTES DEL BLOG ─────────────────
function injectBlogPostControls() {
    if (!adminIsLogged()) return;
    const deletedPosts = getDeletedPosts();

    // Controles en el artículo destacado
    const featured = document.querySelector('.blog-featured');
    if (featured && !featured.querySelector('.admin-post-controls')) {
        const featuredControls = document.createElement('div');
        featuredControls.className = 'admin-post-controls admin-featured-controls';
        featuredControls.innerHTML = `
            <button class="admin-prod-btn edit" onclick="openEditFeaturedModal()">✏️ Editar Destacado</button>
        `;
        featured.style.position = 'relative';
        featured.appendChild(featuredControls);
    }

    // Controles en cada blog-card existente
    const cards = document.querySelectorAll('.blog-card:not([data-admin-post-id])');
    cards.forEach((card, idx) => {
        const postId = `existing_post_${idx}`;
        if (deletedPosts.includes(postId)) {
            card.style.display = 'none';
            return;
        }
        card.setAttribute('data-existing-post-id', postId);
        card.style.position = 'relative';

        if (!card.querySelector('.admin-post-controls')) {
            const ctrl = document.createElement('div');
            ctrl.className = 'admin-post-controls';
            ctrl.innerHTML = `<button class="admin-prod-btn delete" onclick="deleteExistingBlogPost('${postId}', this)" title="Eliminar post">🗑️</button>`;
            card.querySelector('.blog-card-img')?.appendChild(ctrl);
        }
    });
}

function deleteExistingBlogPost(postId, btn) {
    if (!confirm('¿Ocultar este post del blog?')) return;
    const deleted = getDeletedPosts();
    deleted.push(postId);
    saveDeletedPosts(deleted);
    const card = btn ? btn.closest('.blog-card') : null;
    if (card) {
        card.style.transition = 'opacity 0.4s, transform 0.4s';
        card.style.opacity = '0';
        setTimeout(() => card.style.display = 'none', 400);
    }
    showAdminToast('🗑️ Post ocultado');
}

function openEditFeaturedModal() {
    closeAllAdminModals();
    const featuredTitle = document.querySelector('.blog-featured-content h3')?.textContent || '';
    const featuredExcerpt = document.querySelector('.blog-featured-content > p')?.textContent || '';

    const modal = document.createElement('div');
    modal.className = 'admin-modal-overlay activo';
    modal.id = 'admin-edit-featured-modal';
    modal.innerHTML = `
    <div class="admin-modal-box">
        <button class="admin-modal-close" onclick="closeAllAdminModals()">✕</button>
        <h2 class="admin-modal-title">⭐ Editar Artículo Destacado</h2>
        <form id="edit-featured-form">
            <div class="admin-field"><label>Título</label><input type="text" id="ef-title" value="${featuredTitle.replace(/"/g,'&quot;')}" required></div>
            <div class="admin-field"><label>Extracto</label><textarea id="ef-excerpt" rows="3">${featuredExcerpt}</textarea></div>
            <div class="admin-form-actions">
                <button type="button" class="admin-btn-secondary" onclick="closeAllAdminModals()">Cancelar</button>
                <button type="submit" class="admin-btn-primary">💾 Guardar</button>
            </div>
        </form>
    </div>`;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => { if (e.target === modal) closeAllAdminModals(); });

    modal.querySelector('#edit-featured-form').addEventListener('submit', (e) => {
        e.preventDefault();
        const titleEl = document.querySelector('.blog-featured-content h3');
        const excEl = document.querySelector('.blog-featured-content > p');
        if (titleEl) titleEl.textContent = document.getElementById('ef-title').value;
        if (excEl) excEl.textContent = document.getElementById('ef-excerpt').value;
        closeAllAdminModals();
        showAdminToast('✅ Artículo destacado actualizado');
    });
}

// ─── UTILIDADES ──────────────────────────────────────────────
function closeAllAdminModals() {
    document.querySelectorAll('.admin-modal-overlay').forEach(m => {
        if (m.id !== 'admin-login-modal') m.remove();
    });
    closeLoginModal();
}

function showAdminToast(msg) {
    const existing = document.getElementById('admin-toast');
    if (existing) existing.remove();

    const toast = document.createElement('div');
    toast.id = 'admin-toast';
    toast.className = 'admin-toast';
    toast.textContent = msg;
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('visible'), 10);
    setTimeout(() => {
        toast.classList.remove('visible');
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// ─── INICIALIZACIÓN ──────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
    injectAdminButton();

    if (adminIsLogged()) {
        injectAdminToolbar();
        injectProductControls();
        injectAdminProductsIntoPage();

        // Solo en blog
        if (window.location.pathname.toLowerCase().includes('blog') ||
            window.location.href.toLowerCase().includes('blog')) {
            injectBlogPostControls();
            injectAdminBlogPostsIntoPage();
        } else {
            injectAdminBlogPostsIntoPage(); // No aplica en non-blog
        }
    } else {
        // Aunque no sea admin, mostrar productos del admin en la página
        injectAdminProductsIntoPage();
        // Y posts del blog
        injectAdminBlogPostsIntoPage();
    }
});
