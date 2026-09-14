window.volverAtras = function () {
    if (document.referrer && window.history.length > 1) {
        window.history.back();
    } else {
        window.location.href = "Index.html";
    }
};

window.desplazarNav = function (direccion) {
    const wrapper = document.querySelector(".menu-principal-wrapper");
    if (wrapper) {
        wrapper.scrollBy({ left: direccion * 220, behavior: "smooth" });
    }
};

document.addEventListener("DOMContentLoaded", function () {
    // Configurar menú de navegación slider y botones
    const navPrincipal = document.querySelector("nav.menu-principal");
    if (navPrincipal) {
        if (!navPrincipal.parentElement.classList.contains("menu-principal-wrapper")) {
            const container = document.createElement("div");
            container.className = "nav-slider-container";

            const btnPrev = document.createElement("button");
            btnPrev.type = "button";
            btnPrev.className = "nav-btn nav-btn-prev";
            btnPrev.innerHTML = "&#10094;";
            btnPrev.onclick = function () { window.desplazarNav(-1); };

            const wrapper = document.createElement("div");
            wrapper.className = "menu-principal-wrapper";

            const btnNext = document.createElement("button");
            btnNext.type = "button";
            btnNext.className = "nav-btn nav-btn-next";
            btnNext.innerHTML = "&#10095;";
            btnNext.onclick = function () { window.desplazarNav(1); };

            navPrincipal.parentNode.insertBefore(container, navPrincipal);
            wrapper.appendChild(navPrincipal);
            container.appendChild(btnPrev);
            container.appendChild(wrapper);
            container.appendChild(btnNext);
        } else {
            const container = navPrincipal.closest(".nav-slider-container");
            if (container) {
                const btnPrev = container.querySelector(".nav-btn-prev");
                const btnNext = container.querySelector(".nav-btn-next");
                if (btnPrev) btnPrev.onclick = function () { window.desplazarNav(-1); };
                if (btnNext) btnNext.onclick = function () { window.desplazarNav(1); };
            }
        }

        // Marcar enlace activo
        const paginaActual = window.location.pathname.split("/").pop().toLowerCase() || "index.html";
        const enlaces = navPrincipal.querySelectorAll("a");
        enlaces.forEach(enlace => {
            const href = enlace.getAttribute("href")?.toLowerCase();
            if (href && (href === paginaActual || (paginaActual === "" && href === "index.html"))) {
                enlace.classList.add("active-link");
                setTimeout(() => {
                    enlace.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
                }, 150);
            }
        });
    }

    // Mostrar el botón de Volver Atrás solo si el usuario proviene de otra página
    const referrer = document.referrer ? document.referrer.trim() : "";
    const tieneNavegacionPrevia = referrer !== "" && referrer !== window.location.href;

    if (tieneNavegacionPrevia && !document.querySelector(".contenedor-volver")) {
        const headerElement = document.querySelector("header");
        if (headerElement) {
            const divVolver = document.createElement("div");
            divVolver.className = "contenedor-volver";
            divVolver.innerHTML = `
                <button type="button" class="boton-volver-atras" onclick="volverAtras()">
                    &#10094; Volver atrás
                </button>
            `;
            headerElement.insertAdjacentElement("afterend", divVolver);
        }
    }

    const paginasPorCarpeta = {
        "accesorios": "Accesorios.html",
        "consolas": "Consolas.html",
        "juegos": "Juegos.html",
        "mouses": "Mouse-Mousepad.html",
        "mousepads": "Mouse-Mousepad.html",
        "pcgamers": "PcGamers.html",
        "poleras": "Poleras.html",
        "polerones": "Poleron.html",
        "sillasgamers": "SillasGamers.html"
    };

    function obtenerNombrePaginaActual() {
        let path = window.location.pathname.split("/").pop();
        if (!path || path.toLowerCase() === "index.html") {
            return "Index.html";
        }
        return path;
    }

    function obtenerPaginaParaProducto(producto, paginaActual) {
        if (paginaActual !== "Index.html") {
            return paginaActual;
        }
        const imagen = producto.querySelector("img");
        if (!imagen) return null;
        const ruta = imagen.getAttribute("src").toLowerCase();

        for (const carpeta in paginasPorCarpeta) {
            if (ruta.includes(`/${carpeta}/`)) {
                return paginasPorCarpeta[carpeta];
            }
        }
        if (ruta.includes("mandogta6")) return "Consolas.html";
        return null;
    }

    function extraerPrecioProducto(prod) {
        const elEspecifico = prod.querySelector("strong, .precio");
        if (elEspecifico && elEspecifico.textContent.includes("$")) {
            return elEspecifico.textContent.trim();
        }
        const candidatos = prod.querySelectorAll("p, span, div, strong");
        for (const cand of candidatos) {
            const text = cand.textContent.trim();
            if (text.includes("$")) {
                return text;
            }
        }
        return "$0";
    }

    function procesarProducto(producto) {
        const paginaActual = obtenerNombrePaginaActual();
        const paginaTarget = obtenerPaginaParaProducto(producto, paginaActual);
        if (!paginaTarget) return;

        const imagen = producto.querySelector("img");
        const titulo = producto.querySelector("h2, h3");

        if (!imagen && !titulo) return;

        const id = producto.id ? producto.id.trim() : null;

        const enlaceExistente = producto.querySelector("a.producto-enlace");
        let hashId = null;
        if (enlaceExistente) {
            const href = enlaceExistente.getAttribute("href") || "";
            const match = href.match(/#(.+)$/);
            if (match) hashId = match[1];
        }

        const targetId = id || hashId;
        const nombreImagen = imagen ? imagen.getAttribute("src").split("/").pop() : null;

        const params = new URLSearchParams();
        params.set("pagina", paginaTarget);
        if (targetId) {
            params.set("id", targetId);
        } else if (nombreImagen) {
            params.set("imagen", nombreImagen);
        }

        const urlFinal = `Producto.html?${params.toString()}`;

        if (imagen) {
            if (imagen.parentElement && imagen.parentElement.tagName === "A" && imagen.parentElement.classList.contains("producto-enlace")) {
                imagen.parentElement.href = urlFinal;
            } else if (!imagen.parentElement || imagen.parentElement.tagName !== "A") {
                const aImg = document.createElement("a");
                aImg.className = "producto-enlace";
                aImg.href = urlFinal;
                imagen.parentNode.insertBefore(aImg, imagen);
                aImg.appendChild(imagen);
            }
        }

        if (titulo) {
            if (titulo.parentElement && titulo.parentElement.tagName === "A" && titulo.parentElement.classList.contains("producto-enlace")) {
                titulo.parentElement.href = urlFinal;
            } else if (!titulo.parentElement || titulo.parentElement.tagName !== "A") {
                const aTitulo = document.createElement("a");
                aTitulo.className = "producto-enlace";
                aTitulo.href = urlFinal;
                titulo.parentNode.insertBefore(aTitulo, titulo);
                aTitulo.appendChild(titulo);
            }
        }

        // Configurar botones de acción ("Comprar", "Reservar", "Ver producto") dentro de la tarjeta
        const botones = producto.querySelectorAll("a:not(.producto-enlace), button");
        const precioTexto = extraerPrecioProducto(producto);
        const tituloTexto = titulo ? titulo.textContent.trim() : "Producto";
        const prodId = targetId || (imagen ? imagen.getAttribute("src").split("/").pop() : "item");
        const imagenSrc = imagen ? imagen.getAttribute("src") : "";

        botones.forEach(btn => {
            const txt = btn.textContent.toLowerCase().trim();
            if (txt.includes("ver producto")) {
                btn.href = urlFinal;
            } else if (!btn.classList.contains("btn-canjear-levelup")) {
                btn.href = "#";
                btn.onclick = function (e) {
                    e.preventDefault();
                    if (typeof window.agregarAlCarrito === "function") {
                        window.agregarAlCarrito(prodId, tituloTexto, precioTexto, imagenSrc);
                    }
                    return false;
                };
            }
        });

        // Verificar si es Polera o Polerón para añadir botón de Canjear con Puntos LevelUp
        const esPoleraOPoleron = paginaTarget.includes("Poleras.html") ||
            paginaTarget.includes("Poleron.html") ||
            window.location.pathname.toLowerCase().includes("polera") ||
            window.location.pathname.toLowerCase().includes("poleron") ||
            tituloTexto.toLowerCase().includes("polera") ||
            tituloTexto.toLowerCase().includes("poleron");

        if (esPoleraOPoleron && !producto.querySelector(".btn-canjear-levelup")) {
            const puntosReq = window.obtenerPuntosCanje(prodId, tituloTexto, paginaTarget);
            const btnCanjear = document.createElement("button");
            btnCanjear.className = "btn-canjear-levelup";
            btnCanjear.type = "button";
            btnCanjear.style.cssText = "background: linear-gradient(135deg, #10b981, #059669); color: white; border: none; padding: 10px 14px; border-radius: 8px; font-weight: bold; cursor: pointer; margin-top: 8px; margin-left: 6px; font-size: 0.88rem; box-shadow: 0 2px 8px rgba(16,185,129,0.3); transition: transform 0.2s;";
            btnCanjear.innerHTML = `🎁 Canjear (${puntosReq} pts)`;
            btnCanjear.onclick = function (e) {
                e.preventDefault();
                window.canjearProductoConPuntos(prodId, tituloTexto, puntosReq, imagenSrc);
                return false;
            };

            const primerBoton = producto.querySelector("a:not(.producto-enlace), button");
            if (primerBoton && primerBoton.parentElement) {
                primerBoton.parentElement.appendChild(btnCanjear);
            } else {
                producto.appendChild(btnCanjear);
            }
        }
    }

    const productos = document.querySelectorAll(".producto, .producto-detalle, .juego-card");
    productos.forEach(procesarProducto);

    // Mando GTA VI puesto PRIMERO para evitar que "GTA VI" calce antes que "Mando GTA VI"
    const slidesMap = [
        ["Mando PS5 GTA VI", "Consolas.html", "mandogta6"],
        ["Mando GTA VI", "Consolas.html", "mandogta6"],
        ["GTA VI", "Juegos.html", "gta6"],
        ["FC 27", "Juegos.html", "fc27"]
    ];

    document.querySelectorAll(".slide").forEach(slide => {
        const titulo = slide.querySelector("h2")?.textContent.trim();
        if (!titulo) return;
        const item = slidesMap.find(s => titulo.includes(s[0]));
        if (!item) return;

        const boton = slide.querySelector(".boton-compra");
        if (boton) {
            boton.href = `Producto.html?pagina=${item[1]}&id=${item[2]}`;
        }
    });

    /* ============================================================
       SISTEMA DE FILTRADO UNIVERSAL DE PRODUCTOS Y RANGO DE PRECIO
       ============================================================ */
    const pathActual = window.location.pathname.split("/").pop().toLowerCase();
    const esPaginaCatalogo = !["", "index.html", "blog.html", "serviciotecnico.html", "producto.html"].includes(pathActual);

    if (esPaginaCatalogo) {
        let contenedorFiltros = document.querySelector(".filtros-juegos, .filtros-seccion");

        // Si la página no tiene barra de filtros, se crea dinámicamente
        if (!contenedorFiltros) {
            const tarjetaHeader = document.querySelector("main.contenedor .tarjeta");
            if (tarjetaHeader) {
                contenedorFiltros = document.createElement("div");
                contenedorFiltros.className = "filtros-seccion";

                // Input de búsqueda genérico
                const inputSearch = document.createElement("input");
                inputSearch.type = "search";
                inputSearch.id = "buscarProductoAuto";
                inputSearch.placeholder = "🔍 Buscar producto...";

                contenedorFiltros.appendChild(inputSearch);

                // Insertar justo después del h2 de la tarjeta
                const h2Titulo = tarjetaHeader.querySelector("h2");
                if (h2Titulo) {
                    h2Titulo.insertAdjacentElement("afterend", contenedorFiltros);
                } else {
                    tarjetaHeader.insertBefore(contenedorFiltros, tarjetaHeader.firstChild);
                }
            }
        }

        // Inyectar caja de filtro de rango de precio manual ($) si no está presente
        if (contenedorFiltros && !document.getElementById("filtroPrecioBox")) {
            const precioBox = document.createElement("div");
            precioBox.id = "filtroPrecioBox";
            precioBox.className = "filtro-precio-box";
            precioBox.innerHTML = `
                <label>💵 Rango ($):</label>
                <input type="number" id="filtroPrecioMin" placeholder="Mín $" min="0">
                <span style="color:#94a3b8; font-weight:bold;">-</span>
                <input type="number" id="filtroPrecioMax" placeholder="Máx $" min="0">
            `;
            contenedorFiltros.appendChild(precioBox);
        }

        // Función de filtrado universal
        function aplicarFiltrosUniversales() {
            const inputSearch = document.getElementById("buscarJuego") || document.getElementById("buscarProductoAuto");
            const selectConsola = document.getElementById("filtroConsola");
            const selectGenero = document.getElementById("filtroGenero");
            const inputMin = document.getElementById("filtroPrecioMin");
            const inputMax = document.getElementById("filtroPrecioMax");

            const text = inputSearch ? inputSearch.value.toLowerCase().trim() : "";
            const consola = selectConsola ? selectConsola.value.toLowerCase() : "todas";
            const genero = selectGenero ? selectGenero.value.toLowerCase() : "todos";

            const minVal = inputMin && inputMin.value !== "" ? parseFloat(inputMin.value) : null;
            const maxVal = inputMax && inputMax.value !== "" ? parseFloat(inputMax.value) : null;

            const cards = document.querySelectorAll(".producto, .producto-detalle, .juego-card");

            cards.forEach(card => {
                const tituloStr = card.querySelector("h2, h3")?.textContent.toLowerCase() || "";
                const consolaStr = (card.getAttribute("data-consola") || "").toLowerCase();
                const generoStr = (card.getAttribute("data-genero") || "").toLowerCase();

                const precioStr = extraerPrecioProducto(card);
                const precioVal = parsearPrecio(precioStr);

                const coincideTexto = !text || tituloStr.includes(text);
                const coincideConsola = consola === "todas" || consolaStr.includes(consola);
                const coincideGenero = genero === "todos" || generoStr.includes(genero);

                const coincideMin = minVal === null || precioVal >= minVal;
                const coincideMax = maxVal === null || precioVal <= maxVal;

                if (coincideTexto && coincideConsola && coincideGenero && coincideMin && coincideMax) {
                    card.style.display = "";
                } else {
                    card.style.display = "none";
                }
            });
        }

        // Escuchar eventos en todos los controles de filtro
        const idsEscucha = ["buscarJuego", "buscarProductoAuto", "filtroConsola", "filtroGenero", "filtroPrecioMin", "filtroPrecioMax"];
        idsEscucha.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener("input", aplicarFiltrosUniversales);
                el.addEventListener("change", aplicarFiltrosUniversales);
            }
        });
    }

    /* ============================================================
       SISTEMA DE LOGIN — Botón en header + Modal de autenticación
       ============================================================ */
    const headerEl = document.querySelector("header");
    if (headerEl && !document.getElementById("btnLoginHeader")) {

        // 1. Inyectar botón icono en el header
        const btnLogin = document.createElement("button");
        btnLogin.id = "btnLoginHeader";
        btnLogin.className = "btn-login-header";
        btnLogin.title = "Iniciar sesión / Registrarse";
        btnLogin.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
            </svg>
        `;
        headerEl.appendChild(btnLogin);

        // 2. Inyectar el modal de autenticación
        const modalHTML = `
        <div class="modal-auth-overlay" id="modalAuth">
            <div class="modal-auth-box" onclick="event.stopPropagation()">
                <button class="modal-auth-cerrar" id="cerrarModalAuth">✕</button>

                <p class="modal-auth-titulo">👤 Mi Cuenta</p>
                <p class="modal-auth-subtitulo">La Taverna — Accede o crea tu cuenta</p>

                <div class="modal-auth-tabs">
                    <button class="modal-auth-tab activo" id="tabLogin">Iniciar Sesión</button>
                    <button class="modal-auth-tab" id="tabRegistro">Registrarse</button>
                </div>

                <!-- FORMULARIO LOGIN -->
                <form class="modal-auth-form activo" id="formLogin" onsubmit="return false;">
                    <div class="campo">
                        <label for="loginCorreo">Correo electrónico</label>
                        <input type="email" id="loginCorreo" placeholder="tucorreo@ejemplo.com" required>
                    </div>
                    <div class="campo">
                        <label for="loginPass">Contraseña</label>
                        <input type="password" id="loginPass" placeholder="••••••••" required>
                    </div>
                    <button class="modal-auth-submit" type="submit" onclick="handleLogin()">Iniciar Sesión</button>
                    <div class="modal-auth-ok" id="loginOk">✅ ¡Bienvenido de vuelta!</div>
                </form>

                <!-- FORMULARIO REGISTRO -->
                <form class="modal-auth-form" id="formRegistro" onsubmit="return false;">
                    <div class="modal-auth-fila">
                        <div class="campo">
                            <label for="regNombres">Nombres</label>
                            <input type="text" id="regNombres" placeholder="Juan Pablo" required>
                        </div>
                        <div class="campo">
                            <label for="regApPat">Apellido Paterno</label>
                            <input type="text" id="regApPat" placeholder="González" required>
                        </div>
                    </div>
                    <div class="campo">
                        <label for="regApMat">Apellido Materno</label>
                        <input type="text" id="regApMat" placeholder="Martínez" required>
                    </div>
                    <div class="campo">
                        <label for="regRut">RUT</label>
                        <input type="text" id="regRut" placeholder="12.345.678-9" required>
                    </div>
                    <div class="campo">
                        <label for="regCorreo">Correo electrónico</label>
                        <input type="email" id="regCorreo" placeholder="tucorreo@ejemplo.com" required>
                    </div>
                    <div class="campo">
                        <label for="regPass">Contraseña</label>
                        <input type="password" id="regPass" placeholder="Mínimo 8 caracteres" required>
                    </div>
                    <div class="campo">
                        <label for="regNacimiento">Fecha de Nacimiento</label>
                        <input type="date" id="regNacimiento" required>
                    </div>
                    <div class="campo">
                        <label for="regTel">Teléfono</label>
                        <input type="tel" id="regTel" placeholder="+56 9 1234 5678" required>
                    </div>
                    <div class="campo">
                        <label for="regDir">Dirección</label>
                        <input type="text" id="regDir" placeholder="Av. Ejemplo 123, Santiago" required>
                    </div>
                    <div style="background: linear-gradient(135deg, #fef3c7, #fde68a); border: 1.5px solid #f59e0b; padding: 10px 14px; border-radius: 8px; margin-bottom: 12px; font-size: 0.85rem; color: #92400e; text-align: center; font-weight: bold;">
                        🎁 Código de regalo por registro: <span style="background: #fff; padding: 2px 6px; border-radius: 4px; font-family: monospace; color: #d97706;">WelcomeToLevelUp</span> (+20 Puntos LevelUp)
                    </div>
                    <div class="campo">
                        <label for="regReferido">Código de Referido / Regalo (Opcional)</label>
                        <input type="text" id="regReferido" placeholder="Ej: WelcomeToLevelUp">
                    </div>
                    <button class="modal-auth-submit" type="submit" onclick="handleRegistro()">Crear Cuenta</button>
                    <div class="modal-auth-ok" id="registroOk">✅ ¡Cuenta creada exitosamente!</div>
                </form>
            </div>
        </div>`;

        const modalPerfilHTML = `
        <div class="modal-auth-overlay" id="modalPerfil">
            <div class="modal-auth-box" onclick="event.stopPropagation()">
                <button class="modal-auth-cerrar" id="cerrarModalPerfil">✕</button>
                <h2>Mi Perfil</h2>
                <div id="perfilContenido" style="text-align:left;">
                    <!-- Contenido inyectado por JS -->
                </div>
                <button class="modal-auth-submit" onclick="window.cerrarSesion()" style="background:#ef4444; margin-top:15px;">Cerrar Sesión</button>
            </div>
        </div>`;

        document.body.insertAdjacentHTML("beforeend", modalHTML + modalPerfilHTML);

        // 3. Lógica de modales (Auth y Perfil)
        const overlayAuth = document.getElementById("modalAuth");
        const overlayPerfil = document.getElementById("modalPerfil");

        btnLogin.addEventListener("click", () => {
            const user = JSON.parse(localStorage.getItem("usuarioActivo"));
            if (user) {
                renderizarPerfil(user);
                overlayPerfil.classList.add("activo");
            } else {
                overlayAuth.classList.add("activo");
            }
        });
        document.getElementById("cerrarModalAuth").addEventListener("click", () => overlayAuth.classList.remove("activo"));
        overlayAuth.addEventListener("click", (e) => { if (e.target === overlayAuth) overlayAuth.classList.remove("activo"); });

        document.getElementById("cerrarModalPerfil").addEventListener("click", () => overlayPerfil.classList.remove("activo"));
        overlayPerfil.addEventListener("click", (e) => { if (e.target === overlayPerfil) overlayPerfil.classList.remove("activo"); });

        // Tabs
        document.getElementById("tabLogin").addEventListener("click", function () {
            document.getElementById("formLogin").classList.add("activo");
            document.getElementById("formRegistro").classList.remove("activo");
            this.classList.add("activo");
            document.getElementById("tabRegistro").classList.remove("activo");
        });
        document.getElementById("tabRegistro").addEventListener("click", function () {
            document.getElementById("formRegistro").classList.add("activo");
            document.getElementById("formLogin").classList.remove("activo");
            this.classList.add("activo");
            document.getElementById("tabLogin").classList.remove("activo");
        });

        window.actualizarUIAuth(); // Llamar al inicio
    }
});

window.renderizarPerfil = function (user) {
    let nivel = "Bronce";
    if (user.puntos >= 1000) nivel = "Plata";
    if (user.puntos >= 3000) nivel = "Oro";

    let descuentoHtml = user.isDuoc ? `<p style="color:#10b981; font-weight:bold;">¡Tienes 20% de descuento vitalicio por ser Duoc!</p>` : "";

    document.getElementById("perfilContenido").innerHTML = `
        <p><strong>Nombre:</strong> ${user.nombres} ${user.apellidos}</p>
        <p><strong>Correo:</strong> ${user.correo}</p>
        <p><strong>Teléfono:</strong> ${user.telefono || "No registrado"}</p>
        <p><strong>Dirección:</strong> ${user.direccion || "No registrada"}</p>
        <hr style="margin:15px 0; border:1px solid #eee;">
        <p><strong>Puntos LevelUp:</strong> <span style="color:#9333ea; font-weight:bold;">${user.puntos}</span></p>
        <p><strong>Nivel:</strong> ${nivel}</p>
        <p><strong>Tu Código de Referido:</strong> <span style="background:#f1f5f9; padding:2px 6px; border-radius:4px; font-family:monospace;">${user.codigoReferido}</span></p>
        ${descuentoHtml}
    `;
};

window.cerrarSesion = function () {
    localStorage.removeItem("usuarioActivo");
    document.getElementById("modalPerfil").classList.remove("activo");
    const btn = document.getElementById("btnLoginHeader");
    if (btn) {
        btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`;
        btn.title = "Iniciar Sesión / Registro";
    }
    if (typeof renderizarCarrito === 'function') renderizarCarrito(); // Quita descuentos
};

window.actualizarUIAuth = function () {
    const usuario = JSON.parse(localStorage.getItem("usuarioActivo"));
    const btn = document.getElementById("btnLoginHeader");
    if (btn) {
        if (usuario) {
            btn.innerHTML = `👤 ${usuario.nombres.split(" ")[0]}`;
            btn.title = "Mi Perfil";
        } else {
            btn.innerHTML = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/></svg>`;
            btn.title = "Iniciar sesión / Registrarse";
        }
    }
};

window.handleLogin = function () {
    const correo = document.getElementById("loginCorreo").value.trim();
    const pass = document.getElementById("loginPass").value.trim();
    if (!correo || !pass) { alert("Por favor completa todos los campos."); return; }

    // Simulación de login exitoso
    const isDuoc = correo.endsWith("@duoc.cl") || correo.endsWith("@duocuc.cl");
    localStorage.setItem("usuarioActivo", JSON.stringify({
        correo: correo,
        nombres: "Usuario",
        apellidos: "Demo",
        isDuoc: isDuoc,
        puntos: 0,
        codigoReferido: "USER-" + Math.floor(Math.random() * 9000 + 1000)
    }));

    document.getElementById("loginOk").style.display = "block";
    window.actualizarUIAuth();
    if (typeof renderizarCarrito === 'function') renderizarCarrito(); // Refrescar carrito para ver descuento

    setTimeout(() => {
        document.getElementById("modalAuth").classList.remove("activo");
        document.getElementById("loginOk").style.display = "none";
    }, 1500);
};

window.handleRegistro = function () {
    const campos = ["regNombres", "regApPat", "regApMat", "regRut", "regCorreo", "regPass", "regNacimiento", "regTel", "regDir"];
    for (const id of campos) {
        if (!document.getElementById(id).value.trim()) {
            alert("Por favor completa todos los campos obligatorios.");
            return;
        }
    }

    // Validación de edad
    const nac = new Date(document.getElementById("regNacimiento").value);
    const hoy = new Date();
    let edad = hoy.getFullYear() - nac.getFullYear();
    const m = hoy.getMonth() - nac.getMonth();
    if (m < 0 || (m === 0 && hoy.getDate() < nac.getDate())) {
        edad--;
    }
    if (edad < 18) {
        alert("Lo sentimos, debes ser mayor de 18 años para registrarte.");
        return;
    }

    const correo = document.getElementById("regCorreo").value.trim();
    const isDuoc = correo.endsWith("@duoc.cl") || correo.endsWith("@duocuc.cl");
    const referido = document.getElementById("regReferido").value.trim();

    const nuevoUsuario = {
        correo: correo,
        nombres: document.getElementById("regNombres").value.trim(),
        apellidos: document.getElementById("regApPat").value.trim() + " " + document.getElementById("regApMat").value.trim(),
        rut: document.getElementById("regRut").value.trim(),
        telefono: document.getElementById("regTel").value.trim(),
        direccion: document.getElementById("regDir").value.trim(),
        isDuoc: isDuoc,
        puntos: referido ? 20 : 0, // 20 Puntos por codigo
        codigoReferido: "USER-" + Math.floor(Math.random() * 9000 + 1000)
    };

    localStorage.setItem("usuarioActivo", JSON.stringify(nuevoUsuario));
    document.getElementById("registroOk").style.display = "block";
    window.actualizarUIAuth();
    if (typeof renderizarCarrito === 'function') renderizarCarrito();

    setTimeout(() => {
        document.getElementById("modalAuth").classList.remove("activo");
        document.getElementById("registroOk").style.display = "none";
    }, 1500);
};

/* ============================================================
   SISTEMA DE CARRITO DE COMPRAS
   ============================================================ */

function obtenerCarrito() {
    try {
        return JSON.parse(localStorage.getItem("carrito")) || [];
    } catch (e) {
        return [];
    }
}

let carritoCompras = obtenerCarrito();

function sincronizarTodo() {
    carritoCompras = obtenerCarrito();
    actualizarBadgeCarrito();
    if (typeof renderizarCarrito === 'function') renderizarCarrito();
    if (typeof window.actualizarUIAuth === 'function') window.actualizarUIAuth();
}

window.addEventListener("pageshow", sincronizarTodo);
window.addEventListener("storage", sincronizarTodo);

// Inyección de UI del carrito al cargar DOM
document.addEventListener("DOMContentLoaded", function () {
    const headerEl = document.querySelector("header");
    if (headerEl && !document.getElementById("btnCartHeader")) {
        // 1. Inyectar botón de carrito en el header
        const btnCart = document.createElement("button");
        btnCart.id = "btnCartHeader";
        btnCart.className = "btn-cart-header";
        btnCart.title = "Ver Carrito";
        btnCart.innerHTML = `
            <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 18c-1.1 0-1.99.9-1.99 2S5.9 22 7 22s2-.9 2-2-.9-2-2-2zM1 2v2h2l3.6 7.59-1.35 2.45c-.16.28-.25.61-.25.96 0 1.1.9 2 2 2h12v-2H7.42c-.14 0-.25-.11-.25-.25l.03-.12.9-1.63h7.45c.75 0 1.41-.41 1.75-1.03l3.58-6.49A1.003 1.003 0 0 0 20 4H5.21l-.94-2H1zm16 16c-1.1 0-1.99.9-1.99 2s.89 2 1.99 2 2-.9 2-2-.9-2-2-2z"/>
            </svg>
            <span class="cart-badge ${carritoCompras.length === 0 ? 'oculto' : ''}" id="cartBadgeCount">
                ${carritoCompras.reduce((acc, item) => acc + item.cantidad, 0)}
            </span>
        `;
        headerEl.appendChild(btnCart);

        // 2. Inyectar el modal del carrito
        const modalCartHTML = `
        <div class="modal-cart-overlay" id="modalCart">
            <div class="modal-cart-box" onclick="event.stopPropagation()">
                <div class="cart-header">
                    <h3>🛒 Mi Carrito</h3>
                    <button class="cart-cerrar" id="cerrarModalCart">✕</button>
                </div>
                <div class="cart-items-container" id="cartItemsContainer">
                    <!-- Ítems inyectados por JS -->
                </div>
                <div class="cart-footer">
                    <div class="cart-total-row">
                        <span class="cart-total-label">Total:</span>
                        <span class="cart-total-value" id="cartTotalValue">$0</span>
                    </div>
                    <button class="btn-checkout" onclick="procesarCompra()">Finalizar Compra / Ir a Pagar</button>
                </div>
            </div>
        </div>`;
        document.body.insertAdjacentHTML("beforeend", modalCartHTML);

        // 3. Lógica del modal
        const cartOverlay = document.getElementById("modalCart");
        btnCart.addEventListener("click", () => {
            renderizarCarrito();
            cartOverlay.classList.add("activo");
        });
        document.getElementById("cerrarModalCart").addEventListener("click", () => cartOverlay.classList.remove("activo"));
        cartOverlay.addEventListener("click", (e) => { if (e.target === cartOverlay) cartOverlay.classList.remove("activo"); });

        // Actualizar UI inicial
        actualizarBadgeCarrito();
    }

    // 4. Inyectar botón flotante de WhatsApp de Soporte Técnico (solo si NO es admin)
    if (!document.getElementById("btnWhatsAppFlotante") && localStorage.getItem("taverna_admin_logged") !== "true") {
        const btnWS = document.createElement("a");
        btnWS.id = "btnWhatsAppFlotante";
        btnWS.href = "https://wa.me/56912345678?text=Hola%20La%20Taverna,%20necesito%20soporte%20técnico%20para%20mi%20equipo";
        btnWS.target = "_blank";
        btnWS.title = "Soporte Técnico WhatsApp";
        btnWS.style.cssText = "position: fixed; bottom: 20px; right: 20px; background: linear-gradient(135deg, #25d366, #128c7e); color: white; border-radius: 30px; padding: 12px 20px; font-weight: bold; text-decoration: none; z-index: 9999; box-shadow: 0 6px 20px rgba(37,211,102,0.45); display: flex; align-items: center; gap: 8px; font-size: 0.95rem; transition: transform 0.2s;";
        btnWS.innerHTML = `💬 Soporte WhatsApp`;
        btnWS.onmouseenter = () => btnWS.style.transform = "scale(1.05)";
        btnWS.onmouseleave = () => btnWS.style.transform = "scale(1)";
        document.body.appendChild(btnWS);
    }

    // 5. Inyectar Redes Sociales en el Footer
    const footerEl = document.querySelector("footer");
    if (footerEl && !document.getElementById("redesSocialesContainer")) {
        const redesDiv = document.createElement("div");
        redesDiv.id = "redesSocialesContainer";
        redesDiv.style.cssText = "margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;";
        redesDiv.innerHTML = `
            <p style="margin: 0 0 10px 0; font-size: 0.9rem; color: #cbd5e1; font-weight: bold;">🌐 Síguenos y comparte nuestra comunidad:</p>
            <div style="display: flex; justify-content: center; gap: 12px; flex-wrap: wrap;">
                <a href="https://instagram.com" target="_blank" style="color:#e1306c; text-decoration:none; font-weight:bold; background:rgba(225,48,108,0.12); padding:5px 12px; border-radius:15px;">📸 Instagram</a>
                <a href="https://tiktok.com" target="_blank" style="color:#00f2fe; text-decoration:none; font-weight:bold; background:rgba(0,242,254,0.12); padding:5px 12px; border-radius:15px;">🎵 TikTok</a>
                <a href="https://facebook.com" target="_blank" style="color:#1877f2; text-decoration:none; font-weight:bold; background:rgba(24,119,242,0.12); padding:5px 12px; border-radius:15px;">📘 Facebook</a>
                <a href="https://twitter.com" target="_blank" style="color:#1da1f2; text-decoration:none; font-weight:bold; background:rgba(29,161,242,0.12); padding:5px 12px; border-radius:15px;">🐦 Twitter / X</a>
            </div>
        `;
        footerEl.appendChild(redesDiv);
    }

    // 6. Inyectar Sección de Mapa de Eventos Gamer en Blog.html
    if (window.location.pathname.toLowerCase().includes("blog.html") && !document.getElementById("seccionEventosGamer")) {
        const contenedorBlog = document.querySelector("main.contenedor") || document.body;
        const eventosSec = document.createElement("section");
        eventosSec.id = "seccionEventosGamer";
        eventosSec.style.cssText = "margin-top: 40px; padding: 30px; background: linear-gradient(135deg, #1e1b4b, #312e81); border-radius: 16px; color: white; box-shadow: 0 10px 30px rgba(49,46,129,0.3);";
        eventosSec.innerHTML = `
            <h2 style="color: #fbbf24; border: none; font-size: 1.8rem; margin: 0 0 8px 0; text-align: center;">🗺️ Mapa de Eventos Gamer en Chile</h2>
            <p style="text-align: center; color: #c7d2fe; margin-bottom: 25px;">¡Asiste a torneos presenciales a nivel nacional, confirma tu asistencia y gana +50 Puntos LevelUp!</p>

            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 20px;">
                <div style="background: rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
                    <span style="background:#ef4444; color:white; font-size:0.75rem; font-weight:bold; padding:3px 8px; border-radius:4px;">📍 SANTIAGO</span>
                    <h3 style="color:white; margin:10px 0 5px 0;">Gamers Cup Movistar Arena</h3>
                    <p style="font-size:0.88rem; color:#e2e8f0; margin-bottom:12px;">Gran final presencial de eSports. Stands de prueba y sorteos en vivo.</p>
                    <button onclick="asistirEvento('Gamers Cup Santiago', 50)" style="background:#f59e0b; color:black; border:none; padding:10px 16px; border-radius:6px; font-weight:bold; cursor:pointer; width:100%;">🎟️ Confirmar Asistencia (+50 pts)</button>
                </div>
                <div style="background: rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
                    <span style="background:#3b82f6; color:white; font-size:0.75rem; font-weight:bold; padding:3px 8px; border-radius:4px;">📍 VALPARAÍSO</span>
                    <h3 style="color:white; margin:10px 0 5px 0;">Expo Retro Gaming Puerto</h3>
                    <p style="font-size:0.88rem; color:#e2e8f0; margin-bottom:12px;">Muestra de consolas retro, torneos de Super Smash y cosplay.</p>
                    <button onclick="asistirEvento('Expo Retro Valparaíso', 50)" style="background:#f59e0b; color:black; border:none; padding:10px 16px; border-radius:6px; font-weight:bold; cursor:pointer; width:100%;">🎟️ Confirmar Asistencia (+50 pts)</button>
                </div>
                <div style="background: rgba(255,255,255,0.08); padding: 20px; border-radius: 12px; border: 1px solid rgba(255,255,255,0.15);">
                    <span style="background:#10b981; color:white; font-size:0.75rem; font-weight:bold; padding:3px 8px; border-radius:4px;">📍 CONCEPCIÓN</span>
                    <h3 style="color:white; margin:10px 0 5px 0;">Sur Gamer Fest Bío Bío</h3>
                    <p style="font-size:0.88rem; color:#e2e8f0; margin-bottom:12px;">Encuentro regional de eSports, zona PC Gamer y realidad virtual.</p>
                    <button onclick="asistirEvento('Sur Gamer Fest Concepción', 50)" style="background:#f59e0b; color:black; border:none; padding:10px 16px; border-radius:6px; font-weight:bold; cursor:pointer; width:100%;">🎟️ Confirmar Asistencia (+50 pts)</button>
                </div>
            </div>
        `;
        contenedorBlog.appendChild(eventosSec);
    }
});

function formatearPrecio(precio) {
    return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(precio);
}

function parsearPrecio(precioStr) {
    if (!precioStr) return 0;
    return parseInt(precioStr.replace(/[^0-9]/g, "")) || 0;
}

function obtenerNombreSeccion(id, titulo, imagenSrc) {
    const text = ((id || "") + " " + (titulo || "") + " " + (imagenSrc || "")).toLowerCase();

    if (text.includes("consola") || text.includes("ps5") || text.includes("ps4") || text.includes("switch") || text.includes("gameboy") || text.includes("xbox") || text.includes("mando") || text.includes("legion") || text.includes("ally")) {
        return "Consolas";
    }
    if (text.includes("juego") || text.includes("gta") || text.includes("fc27") || text.includes("tlou") || text.includes("spiderman") || text.includes("minecraft") || text.includes("mortal") || text.includes("resident") || text.includes("rdr2")) {
        return "Juegos Digitales";
    }
    if (text.includes("teclado") || text.includes("microfono") || text.includes("rtx") || text.includes("procesador") || text.includes("accesorio")) {
        return "Accesorios";
    }
    if (text.includes("silla")) return "Sillas Gamers";
    if (text.includes("mouse") || text.includes("pad")) return "Mouse / Mousepad";
    if (text.includes("polera") && !text.includes("poleron")) return "Poleras Personalizadas";
    if (text.includes("poleron")) return "Polerones Gamers Personalizados";
    if (text.includes("servicio") || text.includes("tecnico")) return "Servicio Técnico";
    if (text.includes("pc") || text.includes("vibora") || text.includes("gamer")) return "PC Gamers";

    return "Productos Gamers";
}

window.agregarAlCarrito = function (id, titulo, precioStr, imagenSrc) {
    carritoCompras = obtenerCarrito();
    const precio = parsearPrecio(precioStr);
    const seccion = obtenerNombreSeccion(id, titulo, imagenSrc);

    // Regla de Negocio: Máximo 10 artículos en total de la misma sección
    const totalEnSeccion = carritoCompras
        .filter(item => (item.seccion || obtenerNombreSeccion(item.id, item.titulo, item.imagen)) === seccion)
        .reduce((acc, item) => acc + item.cantidad, 0);

    if (totalEnSeccion + 1 > 10) {
        alert(`Lo sentimos, no puedes comprar más de 10 articulos de esta sección.\nActualmente ya posees ${totalEnSeccion} articulos.`);
        return;
    }

    const itemExistente = carritoCompras.find(i => i.id === id);

    if (itemExistente) {
        itemExistente.cantidad += 1;
    } else {
        carritoCompras.push({
            id: id,
            titulo: titulo,
            precio: precio,
            imagen: imagenSrc,
            seccion: seccion,
            cantidad: 1
        });
    }

    guardarCarrito();
    actualizarBadgeCarrito();
    renderizarCarrito();

    // Abrir el carrito automáticamente al agregar
    document.getElementById("modalCart")?.classList.add("activo");
};

window.modificarCantidad = function (id, delta) {
    carritoCompras = obtenerCarrito();
    const item = carritoCompras.find(i => i.id === id);
    if (!item) return;

    if (delta > 0) {
        const seccion = item.seccion || obtenerNombreSeccion(item.id, item.titulo, item.imagen);
        const totalEnSeccion = carritoCompras
            .filter(i => (i.seccion || obtenerNombreSeccion(i.id, i.titulo, i.imagen)) === seccion)
            .reduce((acc, i) => acc + i.cantidad, 0);

        if (totalEnSeccion + delta > 10) {
            alert(`Lo sentimos, no puedes comprar más de 10 articulos de esta sección.\nActualmente ya posees ${totalEnSeccion} articulos.`);
            return;
        }
    }

    item.cantidad += delta;
    if (item.cantidad <= 0) {
        eliminarDelCarrito(id);
    } else {
        guardarCarrito();
        actualizarBadgeCarrito();
        renderizarCarrito();
    }
};

window.eliminarDelCarrito = function (id) {
    carritoCompras = obtenerCarrito();
    carritoCompras = carritoCompras.filter(i => i.id !== id);
    guardarCarrito();
    actualizarBadgeCarrito();
    renderizarCarrito();
};

function guardarCarrito() {
    localStorage.setItem("carrito", JSON.stringify(carritoCompras));
}

function actualizarBadgeCarrito() {
    carritoCompras = obtenerCarrito();
    const badge = document.getElementById("cartBadgeCount");
    if (!badge) return;

    const totalItems = carritoCompras.reduce((acc, item) => acc + item.cantidad, 0);
    badge.textContent = totalItems;

    if (totalItems > 0) {
        badge.classList.remove("oculto");
    } else {
        badge.classList.add("oculto");
    }
}

function renderizarCarrito() {
    const container = document.getElementById("cartItemsContainer");
    const totalEl = document.getElementById("cartTotalValue");
    if (!container || !totalEl) return;

    if (carritoCompras.length === 0) {
        container.innerHTML = `<div class="cart-vacio">Tu carrito está vacío 😔</div>`;
        totalEl.textContent = "$0";
        return;
    }

    let html = "";
    let total = 0;

    carritoCompras.forEach(item => {
        total += item.precio * item.cantidad;
        const secNombre = item.seccion || obtenerNombreSeccion(item.id, item.titulo, item.imagen);
        html += `
            <div class="cart-item">
                <img src="${item.imagen}" alt="${item.titulo}" class="cart-item-img">
                <div class="cart-item-info">
                    <h4 class="cart-item-titulo">${item.titulo}</h4>
                    <span style="font-size:0.72rem; color:#64748b; background:#f1f5f9; padding:2px 6px; border-radius:4px; font-weight:bold; display:inline-block; margin-bottom:4px;">📁 ${secNombre}</span>
                    <p class="cart-item-precio" style="margin:2px 0 8px 0;">${formatearPrecio(item.precio)}</p>
                    <div class="cart-item-controles">
                        <button class="btn-cantidad" onclick="modificarCantidad('${item.id}', -1)">-</button>
                        <span class="item-cantidad">${item.cantidad}</span>
                        <button class="btn-cantidad" onclick="modificarCantidad('${item.id}', 1)">+</button>
                        <button class="btn-eliminar-item" onclick="eliminarDelCarrito('${item.id}')" title="Eliminar">🗑️</button>
                    </div>
                </div>
            </div>
        `;
    });

    container.innerHTML = html;

    // Calcular descuento
    const user = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (user && user.isDuoc) {
        const descuento = total * 0.20;
        const totalFinal = total - descuento;
        totalEl.innerHTML = `
            <div style="font-size:0.9rem; color:#64748b; text-decoration:line-through;">Subtotal: ${formatearPrecio(total)}</div>
            <div style="font-size:1rem; color:#10b981;">Descuento Duoc (20%): -${formatearPrecio(descuento)}</div>
            <div style="font-size:1.6rem; color:#1e293b; font-weight:bold; margin-top:5px;">${formatearPrecio(totalFinal)}</div>
        `;
    } else {
        totalEl.innerHTML = formatearPrecio(total);
    }
}

window.procesarCompra = function () {
    const carrito = obtenerCarrito();
    if (carrito.length === 0) {
        alert("Tu carrito está vacío.");
        return;
    }

    let total = 0;
    carrito.forEach(item => {
        total += item.precio * item.cantidad;
    });

    const user = JSON.parse(localStorage.getItem("usuarioActivo"));
    let totalFinal = total;
    if (user && user.isDuoc) {
        totalFinal = total * 0.80; // 20% descuento
    }

    // Cada $200.000 pesos son 20 puntos LevelUp (ej: $500.000 = 40 pts)
    const puntosGanados = Math.floor(totalFinal / 200000) * 20;

    if (user) {
        user.puntos = (user.puntos || 0) + puntosGanados;
        localStorage.setItem("usuarioActivo", JSON.stringify(user));
        alert(`🎉 ¡Gracias por tu compra de ${formatearPrecio(totalFinal)}!\n\n✨ Has ganado +${puntosGanados} Puntos LevelUp por tu compra.`);
    } else {
        alert(`🎉 ¡Gracias por tu compra de ${formatearPrecio(totalFinal)}!\n\n💡 Inicia sesión o regístrate para acumular Puntos LevelUp en tus compras.`);
    }

    // Vaciar carrito
    carritoCompras = [];
    guardarCarrito();
    actualizarBadgeCarrito();
    renderizarCarrito();

    const modalCart = document.getElementById("modalCart");
    if (modalCart) modalCart.classList.remove("activo");

    if (typeof window.actualizarUIAuth === 'function') window.actualizarUIAuth();
};

window.obtenerPuntosCanje = function (id, titulo, pagina) {
    const str = (id + titulo).toLowerCase();
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        hash = (hash << 5) - hash + str.charCodeAt(i);
        hash |= 0;
    }
    hash = Math.abs(hash);

    const esPoleron = str.includes("poleron") || (pagina && pagina.toLowerCase().includes("poleron"));
    if (esPoleron) {
        // Polerones: rango entre 80 y 120 pts
        const rango = [80, 85, 90, 95, 100, 110, 120];
        return rango[hash % rango.length];
    } else {
        // Poleras: rango entre 60 y 80 pts
        const rango = [60, 65, 70, 75, 80];
        return rango[hash % rango.length];
    }
};

window.canjearProductoConPuntos = function (id, titulo, puntosReq, imagenSrc) {
    const user = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!user) {
        alert("⚠️ Debes iniciar sesión para poder canjear productos con Puntos LevelUp.");
        const modalAuth = document.getElementById("modalAuth");
        if (modalAuth) modalAuth.classList.add("activo");
        return;
    }

    const puntosActuales = user.puntos || 0;
    if (puntosActuales < puntosReq) {
        alert(`❌ Puntos insuficientes. Este producto requiere ${puntosReq} Puntos LevelUp y actualmente tienes ${puntosActuales} pts.`);
        return;
    }

    // Descontar puntos
    user.puntos = puntosActuales - puntosReq;
    localStorage.setItem("usuarioActivo", JSON.stringify(user));

    // Agregar al carrito con precio $0
    window.agregarAlCarrito(id + "_canje", `${titulo} (🎁 Canjeado)`, "$0", imagenSrc);

    alert(`🎉 ¡Felicitaciones! Has canjeado "${titulo}" por ${puntosReq} Puntos LevelUp.\n\nEl producto ha sido añadido a tu carrito a $0.`);

    if (typeof window.actualizarUIAuth === 'function') window.actualizarUIAuth();
};

window.asistirEvento = function (nombreEvento, puntos) {
    const user = JSON.parse(localStorage.getItem("usuarioActivo"));
    if (!user) {
        alert("⚠️ Inicia sesión o regístrate para poder confirmar tu asistencia y ganar Puntos LevelUp.");
        const modalAuth = document.getElementById("modalAuth");
        if (modalAuth) modalAuth.classList.add("activo");
        return;
    }
    user.puntos = (user.puntos || 0) + puntos;
    localStorage.setItem("usuarioActivo", JSON.stringify(user));
    alert(`🎉 ¡Asistencia confirmada a "${nombreEvento}"!\n\n✨ Se han añadido +${puntos} Puntos LevelUp a tu cuenta.`);
    if (typeof window.actualizarUIAuth === 'function') window.actualizarUIAuth();
};
