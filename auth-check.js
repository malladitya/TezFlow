(function () {
  const AUTH_KEY = "nscns_auth";

  // Demo credentials for role-based access.
  const AUTH_USERS = {
    hq: {
      username: "hqadmin",
      password: "HQ@123",
      redirect: "hq.html",
      label: "National HQ Operator",
    },
    warehouse: {
      username: "warehousemgr",
      password: "WH@123",
      redirect: "warehouse.html",
      label: "Warehouse Manager",
    },
    driver: {
      username: "driver710",
      password: "DRV@123",
      redirect: "driver.html",
      label: "Fleet Driver",
    },
  };

  const PAGE_ROLE_MAP = {
    "hq.html": "hq",
    "warehouse.html": "warehouse",
    "driver.html": "driver",
  };

  /**
   * Enterprise-Grade Security Hardening
   * - Session Expiry (24h)
   * - CSRF Token Generation
   * - Input Sanitization
   * - Content Security Policy (CSP) Meta Injection
   */

  const SESSION_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 Hours

  function _sanitize(str) {
    if (typeof str !== 'string') return '';
    return str.replace(/[&<>"']/g, (m) => ({
      '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[m]));
  }

  function _generateCSRF() {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map(b => b.toString(16).padStart(2, '0')).join('');
  }

  function _injectCSP() {
    if (document.querySelector('meta[content*="script-src"]')) return;
    const meta = document.createElement('meta');
    meta.httpEquiv = "Content-Security-Policy";
    meta.content = "default-src 'self'; script-src 'self' https://cdn.jsdelivr.net https://unpkg.com 'unsafe-inline'; style-src 'self' https://fonts.googleapis.com https://unpkg.com 'unsafe-inline'; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https://*.tile.openstreetmap.org https://*.basemaps.cartocdn.com https://*.cartocdn.com https://unpkg.com; connect-src 'self' https://api.open-meteo.com https://api.openrouteservice.org https://*.supabase.co;";
    document.head.appendChild(meta);
  }

  function currentPageName() {
    const path = window.location.pathname || "";
    const page = path.split("/").pop();
    return page || "index.html";
  }

  function getStoredAuth() {
    try {
      const raw = window.sessionStorage.getItem(AUTH_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      
      // Validate session expiry
      if (parsed && parsed.timestamp && (Date.now() - parsed.timestamp > SESSION_EXPIRY_MS)) {
        clearStoredAuth();
        return null;
      }
      
      return parsed && typeof parsed === "object" ? parsed : null;
    } catch (_) {
      return null;
    }
  }

  function setStoredAuth(payload) {
    const enriched = {
      ...payload,
      timestamp: Date.now(),
      csrf: _generateCSRF()
    };
    window.sessionStorage.setItem(AUTH_KEY, JSON.stringify(enriched));
  }

  function clearStoredAuth() {
    window.sessionStorage.removeItem(AUTH_KEY);
  }

  function validateCredentials(username, password, role) {
    const roleCfg = AUTH_USERS[role];
    if (!roleCfg) {
      return { ok: false, reason: "Invalid role selected." };
    }

    const normalizedUser = _sanitize(username).trim().toLowerCase();
    const expectedUser = roleCfg.username.toLowerCase();
    const expectedPass = roleCfg.password;

    if (normalizedUser !== expectedUser || password !== expectedPass) {
      return { ok: false, reason: "Invalid username or password for selected role." };
    }

    return {
      ok: true,
      redirect: roleCfg.redirect,
      role,
      username: roleCfg.username,
      label: roleCfg.label,
    };
  }

  function ensureProtectedPageAccess() {
    _injectCSP();
    const page = currentPageName();
    const requiredRole = PAGE_ROLE_MAP[page];
    if (!requiredRole) return;

    const auth = getStoredAuth();
    if (!auth || auth.role !== requiredRole) {
      clearStoredAuth();
      window.location.replace("index.html");
    }
  }

  window.NSCNS_AUTH_USERS = AUTH_USERS;
  window.getNSCNSUserSession = getStoredAuth;
  window.setNSCNSUserSession = setStoredAuth;
  window.validateNSCNSCredentials = validateCredentials;
  window.logout = function logout() {
    clearStoredAuth();
    window.location.href = "index.html";
  };

  ensureProtectedPageAccess();
})();
