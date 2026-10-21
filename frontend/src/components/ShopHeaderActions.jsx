// Acceso de cliente reutilizable: sesión, registro, perfil y carrito compartido.
import React, { useEffect, useState } from 'react';
import {
  addProductToCart,
  CART_UPDATED_EVENT,
  getActiveUser,
  getRutValidationError,
  LOGIN_REQUIRED_EVENT,
  readCart,
  USER_UPDATED_EVENT,
} from '../data/cart.js';

const ACCOUNT_STORAGE_KEY = 'taverna:accounts';

// Separa apellidos antiguos para trabajar con el perfil nuevo.
function accountLastNames(user) {
  const names = String(user?.apellidos || '').trim().split(/\s+/).filter(Boolean);
  return {
    apellidoPaterno: user?.apellidoPaterno || names[0] || '',
    apellidoMaterno: user?.apellidoMaterno || names.slice(1).join(' '),
  };
}

function readAccounts() {
  const accounts = JSON.parse(localStorage.getItem(ACCOUNT_STORAGE_KEY) || '[]');
  if (!Array.isArray(accounts)) throw new Error('La lista local de cuentas no tiene un formato válido.');
  return accounts;
}

export default function ShopHeaderActions() {
  // Estados de cuenta, carrito y modales del encabezado.
  const [user, setUser] = useState(null);
  const [cart, setCart] = useState([]);
  const [authOpen, setAuthOpen] = useState(false);
  const [authTab, setAuthTab] = useState('login');
  const [adminMode, setAdminMode] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [authError, setAuthError] = useState('');
  const [authNotice, setAuthNotice] = useState('');
  const [cartError, setCartError] = useState('');
  const [pendingProduct, setPendingProduct] = useState(null);
  const [pendingAction, setPendingAction] = useState('cart');
  const [registrationRutError, setRegistrationRutError] = useState('');
  const [profileForm, setProfileForm] = useState({ nombres: '', apellidoPaterno: '', apellidoMaterno: '', rut: '', correo: '', telefono: '', direccion: '' });
  const [profileError, setProfileError] = useState('');
  const [profileRutError, setProfileRutError] = useState('');
  const isBlogPage = window.location.pathname.toLowerCase() === '/blog.html';
  const itemCount = cart.reduce((total, item) => total + (Number(item.cantidad) || 0), 0);

  // Mantiene el encabezado sincronizado con los cambios locales de cuenta y carrito.
  function refreshState() {
    try {
      setUser(getActiveUser());
      setCart(readCart());
      setCartError('');
    } catch (error) {
      setCartError(error instanceof Error ? error.message : 'No se pudo leer el carrito guardado.');
    }
  }

  // Escucha acciones que vienen de otras vistas, como pedir inicio de sesión.
  useEffect(() => {
    function requireLogin(event) {
      setPendingProduct(event.detail?.product ?? null);
      setPendingAction(event.detail?.action ?? 'cart');
      setAuthTab('login');
      setAdminMode(false);
      setAuthError('');
      setAuthNotice(event.detail?.action === 'review'
        ? 'Para dejar una reseña, primero debes iniciar sesión.'
        : 'Para agregar productos al carrito, primero debes iniciar sesión.');
      setAuthOpen(true);
    }

    refreshState();
    window.addEventListener('storage', refreshState);
    window.addEventListener(CART_UPDATED_EVENT, refreshState);
    window.addEventListener(LOGIN_REQUIRED_EVENT, requireLogin);
    return () => {
      window.removeEventListener('storage', refreshState);
      window.removeEventListener(CART_UPDATED_EVENT, refreshState);
      window.removeEventListener(LOGIN_REQUIRED_EVENT, requireLogin);
    };
  }, []);

  // Comparte el inicio de sesión entre acceso normal, registro y administrador.
  function finishSignIn(nextUser, message, admin = false) {
    localStorage.setItem('usuarioActivo', JSON.stringify(nextUser));
    if (admin) localStorage.setItem('taverna_admin_logged', 'true');
    setUser(nextUser);
    if (pendingProduct && pendingAction === 'cart') {
      addProductToCart(pendingProduct);
      setPendingProduct(null);
      message = 'Sesión iniciada y producto agregado al carrito.';
    }
    if (pendingAction === 'review') message = 'Sesión iniciada. Ya puedes compartir tu reseña.';
    setPendingAction('cart');
    setAuthError('');
    setAuthNotice(message);
    window.setTimeout(() => {
      setAuthOpen(false);
      setAuthNotice('');
      if (admin) window.location.assign('/admin-panel.html');
    }, 900);
  }

  // Busca el perfil guardado por correo o crea una sesión de demostración.
  function handleLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('email') || '').trim();
    const password = String(form.get('password') || '').trim();
    if (!email || !password) {
      setAuthError('Completa tu correo y contraseña.');
      return;
    }

    let savedAccount;
    try {
      savedAccount = readAccounts().find((account) => account.correo?.toLowerCase() === email.toLowerCase());
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No se pudieron leer las cuentas guardadas.');
      return;
    }

    finishSignIn(savedAccount ?? {
      correo: email,
      nombres: 'Usuario',
      apellidos: 'Demo',
      isDuoc: email.endsWith('@duoc.cl') || email.endsWith('@duocuc.cl'),
      puntos: 0,
      codigoReferido: `USER-${Math.floor(Math.random() * 9000 + 1000)}`,
    }, '¡Bienvenido de vuelta!');
  }

  function handleAdminLogin(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const email = String(form.get('adminEmail') || '').trim();
    const password = String(form.get('adminPassword') || '').trim();
    if (!email || !password) {
      setAuthError('Completa el correo y la contraseña de administrador.');
      return;
    }

    finishSignIn({
      correo: email,
      nombres: 'Administrador',
      apellidos: 'Demostración',
      isAdmin: true,
      isDuoc: false,
      puntos: 0,
    }, 'Acceso de demostración iniciado.', true);
  }

  // Valida los datos y guarda la nueva cuenta en el almacenamiento local.
  function handleRegistration(event) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const rut = String(form.get('rut') || '').trim().toUpperCase();
    const rutError = getRutValidationError(rut, { required: true });
    setRegistrationRutError(rutError);
    if (rutError) return;

    const birthDate = new Date(String(form.get('birthDate')));
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    if (
      today.getMonth() < birthDate.getMonth() ||
      (today.getMonth() === birthDate.getMonth() && today.getDate() < birthDate.getDate())
    ) age -= 1;
    if (age < 18) {
      setAuthError('Debes ser mayor de 18 años para registrarte.');
      return;
    }

    const email = String(form.get('email') || '').trim();
    const referral = String(form.get('referral') || '').trim();
    const apellidoPaterno = String(form.get('lastName') || '').trim();
    const apellidoMaterno = String(form.get('secondLastName') || '').trim();
    const account = {
      correo: email,
      nombres: String(form.get('firstName') || '').trim(),
      apellidoPaterno,
      apellidoMaterno,
      apellidos: `${apellidoPaterno} ${apellidoMaterno}`.trim(),
      rut,
      telefono: String(form.get('phone') || '').trim(),
      direccion: String(form.get('address') || '').trim(),
      isDuoc: email.endsWith('@duoc.cl') || email.endsWith('@duocuc.cl'),
      puntos: referral ? 20 : 0,
      codigoReferido: `USER-${Math.floor(Math.random() * 9000 + 1000)}`,
    };
    try {
      const accounts = readAccounts().filter((saved) => saved.correo?.toLowerCase() !== email.toLowerCase());
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify([...accounts, account]));
    } catch (error) {
      setAuthError(error instanceof Error ? error.message : 'No se pudo guardar la cuenta en este navegador.');
      return;
    }
    finishSignIn(account, '¡Cuenta creada exitosamente!');
  }

  function openAuth(tab) {
    setAuthError('');
    setAuthNotice('');
    setAuthTab(tab);
    setAdminMode(false);
    setAuthOpen(true);
  }

  function signOut() {
    localStorage.removeItem('usuarioActivo');
    localStorage.removeItem('taverna_admin_logged');
    setUser(null);
    setProfileOpen(false);
    setCart([]);
  }

  // Carga los datos actuales antes de abrir el formulario de perfil.
  function openProfile() {
    const { apellidoPaterno, apellidoMaterno } = accountLastNames(user);
    setProfileForm({
      nombres: user.nombres || '',
      apellidoPaterno,
      apellidoMaterno,
      rut: user.rut || '',
      correo: user.correo || '',
      telefono: user.telefono || '',
      direccion: user.direccion || '',
    });
    setProfileError('');
    setProfileRutError('');
    setProfileOpen(true);
  }

  // Guarda el perfil actualizado y avisa al checkout para que lo precargue.
  function saveProfile(event) {
    event.preventDefault();
    const rut = getRutValidationError(profileForm.rut, { required: true });
    setProfileRutError(rut);
    if (rut) return;
    if (!profileForm.nombres.trim() || !profileForm.apellidoPaterno.trim() || !profileForm.apellidoMaterno.trim()) {
      setProfileError('Completa tus nombres, apellido paterno y apellido materno.');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(profileForm.correo.trim())) {
      setProfileError('Ingresa un correo electrónico válido.');
      return;
    }

    const updatedUser = {
      ...user,
      ...profileForm,
      rut: profileForm.rut.trim().toUpperCase(),
      correo: profileForm.correo.trim(),
      apellidos: `${profileForm.apellidoPaterno.trim()} ${profileForm.apellidoMaterno.trim()}`,
    };
    try {
      const accounts = readAccounts();
      const matchingIndex = accounts.findIndex((account) => account.correo?.toLowerCase() === user.correo?.toLowerCase());
      if (matchingIndex >= 0) {
        accounts[matchingIndex] = updatedUser;
      } else {
        accounts.push(updatedUser);
      }
      localStorage.setItem(ACCOUNT_STORAGE_KEY, JSON.stringify(accounts));
      localStorage.setItem('usuarioActivo', JSON.stringify(updatedUser));
      setUser(updatedUser);
      window.dispatchEvent(new Event(USER_UPDATED_EVENT));
      setProfileError('');
      setProfileOpen(false);
    } catch (error) {
      setProfileError(error instanceof Error ? error.message : 'No se pudieron guardar los datos del perfil.');
    }
  }

  function updateProfileField(event) {
    const { name, value } = event.target;
    setProfileForm((current) => ({ ...current, [name]: value }));
    if (name === 'rut') setProfileRutError(getRutValidationError(value, { required: true }));
    setProfileError('');
  }

  // Botones, carrito y ventanas reutilizables del encabezado.
  return (
    <>
      {/* Accesos de cuenta y carrito visibles en todas las páginas. */}
      <div className="shop-header-actions">
        <div className="shop-account-actions">
          {user ? (
            <button className="shop-account-button shop-account-profile" type="button" onClick={openProfile}>
              Mi cuenta
            </button>
          ) : (
            <>
              <button className="shop-account-button shop-account-login" type="button" onClick={() => openAuth('login')}>
                Iniciar sesión
              </button>
              <button className="shop-account-button shop-account-register" type="button" onClick={() => openAuth('register')}>
                Crear cuenta
              </button>
            </>
          )}
        </div>
        <div className="shop-cart-actions">
          {user && (
            <a className="shop-cart-link" href="/carrito.html" aria-label={`Abrir carrito, ${itemCount} productos`}>
              <span aria-hidden="true">🛒</span> Carrito
              <span className="shop-cart-count" aria-label={`${itemCount} productos`}>{itemCount}</span>
            </a>
          )}
        </div>
      </div>

      {cartError && <p className="shop-cart-error" role="alert">{cartError}</p>}

      {/* Modal de inicio de sesión, registro y acceso de administrador del Blog. */}
      {authOpen && (
        <div className="modal-auth-overlay activo" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setAuthOpen(false);
        }}>
          <section className="modal-auth-box" role="dialog" aria-modal="true" aria-labelledby="auth-title" onMouseDown={(event) => event.stopPropagation()}>
            <button className="modal-auth-cerrar" type="button" aria-label="Cerrar" onClick={() => setAuthOpen(false)}>✕</button>
            <h2 className="modal-auth-titulo" id="auth-title">{adminMode ? 'Acceso administrador' : '👤 Mi Cuenta'}</h2>
            <p className="modal-auth-subtitulo">La Taverna — {adminMode ? 'Administración' : 'Accede o crea tu cuenta'}</p>

            {!adminMode && (
              <div className="modal-auth-tabs" role="tablist">
                <button className={`modal-auth-tab${authTab === 'login' ? ' activo' : ''}`} type="button" role="tab" aria-selected={authTab === 'login'} onClick={() => { setAuthTab('login'); setAuthError(''); }}>
                  Iniciar Sesión
                </button>
                <button className={`modal-auth-tab${authTab === 'register' ? ' activo' : ''}`} type="button" role="tab" aria-selected={authTab === 'register'} onClick={() => { setAuthTab('register'); setAuthError(''); }}>
                  Registrarse
                </button>
              </div>
            )}

            {adminMode ? (
              <form className="modal-auth-form activo" onSubmit={handleAdminLogin}>
                <div className="campo"><label htmlFor="admin-login-email">Correo de administrador</label><input id="admin-login-email" name="adminEmail" type="email" required /></div>
                <div className="campo"><label htmlFor="admin-login-password">Contraseña</label><input id="admin-login-password" name="adminPassword" type="password" required /></div>
                <p className="shop-auth-warning">Acceso solo demostrativo: esta aplicación no tiene servidor ni valida credenciales reales.</p>
                <button className="modal-auth-submit" type="submit">Entrar a administración</button>
                <button className="shop-auth-back" type="button" onClick={() => { setAdminMode(false); setAuthError(''); }}>Volver al inicio de sesión de cliente</button>
              </form>
            ) : authTab === 'login' ? (
              <form className="modal-auth-form activo" onSubmit={handleLogin}>
                <div className="campo"><label htmlFor="account-login-email">Correo electrónico</label><input id="account-login-email" name="email" type="email" autoComplete="email" required /></div>
                <div className="campo"><label htmlFor="account-login-password">Contraseña</label><input id="account-login-password" name="password" type="password" autoComplete="current-password" required /></div>
                <button className="modal-auth-submit" type="submit">Iniciar Sesión</button>
                {isBlogPage && (
                  <button className="shop-admin-entry" type="button" onClick={() => { setAdminMode(true); setAuthError(''); }}>
                    Iniciar sesión como administrador
                  </button>
                )}
              </form>
            ) : (
              <form className="modal-auth-form activo" onSubmit={handleRegistration}>
                <div className="modal-auth-fila">
                  <div className="campo"><label htmlFor="account-first-name">Nombres</label><input id="account-first-name" name="firstName" autoComplete="given-name" required /></div>
                  <div className="campo"><label htmlFor="account-last-name">Apellido paterno</label><input id="account-last-name" name="lastName" autoComplete="family-name" required /></div>
                </div>
                <div className="campo"><label htmlFor="account-second-last-name">Apellido materno</label><input id="account-second-last-name" name="secondLastName" required /></div>
                <div className="modal-auth-fila">
                  <div className="campo">
                    <label htmlFor="account-rut">RUT (sin puntos ni guion)</label>
                    <input id="account-rut" name="rut" required aria-describedby="registration-rut-error" onChange={(event) => setRegistrationRutError(getRutValidationError(event.target.value, { required: true }))} />
                    {registrationRutError && <small id="registration-rut-error" className="shop-field-error" role="alert">{registrationRutError}</small>}
                  </div>
                  <div className="campo"><label htmlFor="account-register-email">Correo electrónico</label><input id="account-register-email" name="email" type="email" autoComplete="email" required /></div>
                </div>
                <div className="modal-auth-fila">
                  <div className="campo"><label htmlFor="account-register-password">Contraseña</label><input id="account-register-password" name="password" type="password" minLength="8" autoComplete="new-password" required /></div>
                  <div className="campo"><label htmlFor="account-birth-date">Fecha de nacimiento</label><input id="account-birth-date" name="birthDate" type="date" required /></div>
                </div>
                <div className="modal-auth-fila">
                  <div className="campo"><label htmlFor="account-phone">Teléfono</label><input id="account-phone" name="phone" type="tel" autoComplete="tel" required /></div>
                  <div className="campo"><label htmlFor="account-address">Dirección</label><input id="account-address" name="address" autoComplete="street-address" required /></div>
                </div>
                <div className="shop-gift-code">🎁 Código de regalo por registro: <strong>WelcomeToLevelUp</strong> (+20 Puntos LevelUp)</div>
                <div className="campo"><label htmlFor="account-referral">Código de referido / regalo (opcional)</label><input id="account-referral" name="referral" /></div>
                <p className="shop-form-note">Los registros son de demostración y se guardan solo en este navegador.</p>
                <button className="modal-auth-submit" type="submit">Crear Cuenta</button>
              </form>
            )}
            {authError && <p className="shop-auth-error" role="alert">{authError}</p>}
            {authNotice && <p className="shop-auth-notice" role="status">{authNotice}</p>}
            {!adminMode && <p className="shop-form-note">El inicio de sesión es simulado; no valida credenciales con un servidor.</p>}
          </section>
        </div>
      )}

      {/* Formulario editable que comparte los datos con el checkout. */}
      {profileOpen && user && (
        <div className="modal-auth-overlay activo" role="presentation" onMouseDown={(event) => {
          if (event.target === event.currentTarget) setProfileOpen(false);
        }}>
          <section className="modal-auth-box" role="dialog" aria-modal="true" aria-labelledby="profile-title" onMouseDown={(event) => event.stopPropagation()}>
            <h2 className="modal-auth-titulo" id="profile-title">Mi Perfil</h2>
            <button className="modal-auth-cerrar" type="button" aria-label="Cerrar perfil" onClick={() => setProfileOpen(false)}>✕</button>
            <form className="shop-profile-form" onSubmit={saveProfile}>
              <div className="modal-auth-fila">
                <div className="campo"><label htmlFor="profile-names">Nombres</label><input id="profile-names" name="nombres" value={profileForm.nombres} onChange={updateProfileField} required /></div>
                <div className="campo"><label htmlFor="profile-paternal">Apellido paterno</label><input id="profile-paternal" name="apellidoPaterno" value={profileForm.apellidoPaterno} onChange={updateProfileField} required /></div>
              </div>
              <div className="modal-auth-fila">
                <div className="campo"><label htmlFor="profile-maternal">Apellido materno</label><input id="profile-maternal" name="apellidoMaterno" value={profileForm.apellidoMaterno} onChange={updateProfileField} required /></div>
                <div className="campo">
                  <label htmlFor="profile-rut">RUT (sin puntos ni guion)</label>
                  <input id="profile-rut" name="rut" value={profileForm.rut} onChange={updateProfileField} aria-describedby="profile-rut-error" required />
                  {profileRutError && <small id="profile-rut-error" className="shop-field-error" role="alert">{profileRutError}</small>}
                </div>
              </div>
              <div className="campo"><label htmlFor="profile-email">Correo electrónico</label><input id="profile-email" name="correo" type="email" value={profileForm.correo} onChange={updateProfileField} required /></div>
              <div className="modal-auth-fila">
                <div className="campo"><label htmlFor="profile-phone">Teléfono</label><input id="profile-phone" name="telefono" value={profileForm.telefono} onChange={updateProfileField} /></div>
                <div className="campo"><label htmlFor="profile-address">Dirección</label><input id="profile-address" name="direccion" value={profileForm.direccion} onChange={updateProfileField} /></div>
              </div>
              {profileError && <p className="shop-auth-error" role="alert">{profileError}</p>}
              <button className="modal-auth-submit" type="submit">Guardar cambios</button>
            </form>
            <p><strong>Puntos LevelUp:</strong> {user.puntos || 0}</p>
            <p><strong>Nivel:</strong> {(user.puntos || 0) >= 3000 ? 'Oro' : (user.puntos || 0) >= 1000 ? 'Plata' : 'Bronce'}</p>
            <p><strong>Código de referido:</strong> {user.codigoReferido || 'No disponible'}</p>
            {user.isDuoc && <p className="text-success fw-bold">Tienes 20% de descuento Duoc.</p>}
            <button className="modal-auth-submit shop-signout" type="button" onClick={signOut}>Cerrar Sesión</button>
          </section>
        </div>
      )}
    </>
  );
}
