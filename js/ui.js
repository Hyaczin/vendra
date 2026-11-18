/* ==========================================================================
   ui.js — shared chrome: header, footer, toasts, modals, theme
   ========================================================================== */
(function () {
  const S = window.Store;

  /* ---------- Theme ---------- */
  function applyTheme(t) {
    document.documentElement.setAttribute("data-theme", t);
    const btn = document.getElementById("themeToggle");
    if (btn) btn.textContent = t === "dark" ? "☀️" : "🌙";
  }
  applyTheme(S.getTheme());

  /* ---------- Toasts ---------- */
  function ensureToastHost() {
    let h = document.getElementById("toasts");
    if (!h) { h = document.createElement("div"); h.id = "toasts"; document.body.appendChild(h); }
    return h;
  }
  window.toast = function (msg, type) {
    const host = ensureToastHost();
    const el = document.createElement("div");
    el.className = "toast " + (type || "");
    el.innerHTML = '<span class="dot"></span><span>' + window.escapeHtml(msg) + "</span>";
    host.appendChild(el);
    setTimeout(() => { el.classList.add("out"); setTimeout(() => el.remove(), 320); }, 2600);
  };

  /* ---------- Modal ---------- */
  window.openModal = function (html, opts) {
    opts = opts || {};
    closeModal();
    const back = document.createElement("div");
    back.className = "modal-backdrop";
    back.id = "modalBackdrop";
    back.innerHTML = '<div class="modal" role="dialog" aria-modal="true">' + html + "</div>";
    back.addEventListener("click", e => { if (e.target === back && !opts.sticky) closeModal(); });
    document.body.appendChild(back);
    document.body.style.overflow = "hidden";
    const esc = e => { if (e.key === "Escape" && !opts.sticky) closeModal(); };
    document.addEventListener("keydown", esc);
    back._esc = esc;
    return back;
  };
  window.closeModal = function () {
    const b = document.getElementById("modalBackdrop");
    if (b) { if (b._esc) document.removeEventListener("keydown", b._esc); b.remove(); }
    document.body.style.overflow = "";
  };

  /* ---------- Header ---------- */
  function headerHtml() {
    const u = S.currentUser();
    const cc = S.cartCount();
    const favc = S.state.favorites.length;
    return `
    <header class="site-header">
      <div class="wrap header-inner">
        <a class="logo" href="index.html" aria-label="Vendra home">
          <span class="logo-mark">V</span>Ven<span>dra</span>
        </a>
        <form class="search" role="search" onsubmit="return Vendra.doSearch(event)">
          <span class="mag">🔍</span>
          <input id="globalSearch" type="search" placeholder="Search products, brands and categories…"
                 autocomplete="off" aria-label="Search" />
        </form>
        <div class="header-actions">
          <button class="icon-btn" id="themeToggle" title="Toggle theme" aria-label="Toggle theme"
                  onclick="Vendra.toggleTheme()">🌙</button>
          <a class="icon-btn" href="favorites.html" title="Wishlist" aria-label="Wishlist">❤️
            ${favc ? `<span class="count">${favc}</span>` : ""}</a>
          <a class="icon-btn" href="cart.html" title="Cart" aria-label="Cart">🛒
            ${cc ? `<span class="count" id="cartCount">${cc}</span>` : ""}</a>
          <a class="icon-btn" href="${u ? "account.html" : "login.html"}" title="Account" aria-label="Account">
            ${u ? `<span class="avatar" style="width:30px;height:30px;font-size:.8rem">${initials(u.name)}</span>` : "👤"}</a>
        </div>
      </div>
      <nav class="navbar"><div class="wrap">
        <a class="navlink" href="index.html" data-nav="home">Home</a>
        ${window.CATEGORIES.map(c => `<a class="navlink" href="catalog.html?cat=${c.id}" data-nav="${c.id}">${c.name}</a>`).join("")}
        <a class="navlink" href="sell.html" data-nav="sell">Sell</a>
        <a class="navlink" href="security.html" data-nav="security" style="margin-left:auto;color:var(--brand-600)">🛡️ Security Lab</a>
      </div></nav>
    </header>`;
  }
  function initials(name){ return name.split(" ").map(w=>w[0]).slice(0,2).join("").toUpperCase(); }

  function footerHtml() {
    return `
    <footer class="site-footer"><div class="wrap">
      <div class="footer-grid">
        <div>
          <div class="logo" style="margin-bottom:12px"><span class="logo-mark">V</span>Ven<span>dra</span></div>
          <p class="muted" style="font-size:.88rem;max-width:280px">A demonstration marketplace built entirely in the browser — a portfolio piece exploring how insecure development practices create real risk.</p>
          <p class="chip" style="margin-top:12px">⚠️ Demo only · no real payments</p>
        </div>
        <div>
          <h4>Shop</h4>
          <a href="catalog.html">All products</a>
          <a href="catalog.html?sort=deals">Today's deals</a>
          <a href="favorites.html">Wishlist</a>
          <a href="cart.html">Cart</a>
        </div>
        <div>
          <h4>Account</h4>
          <a href="account.html">My account</a>
          <a href="orders.html">My orders</a>
          <a href="sell.html">Become a seller</a>
          <a href="login.html">Sign in</a>
        </div>
        <div>
          <h4>About this project</h4>
          <a href="security.html">🛡️ Security Lab</a>
          <a href="security.html#about">OWASP Top 10</a>
          <a href="#" onclick="Vendra.confirmReset();return false">Reset demo data</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2026 Vendra Demo · Educational security portfolio</span>
        <span>All data stored locally in your browser</span>
      </div>
    </div></footer>`;
  }

  function mountChrome() {
    const h = document.getElementById("header-slot");
    if (h) h.innerHTML = headerHtml();
    const f = document.getElementById("footer-slot");
    if (f) f.innerHTML = footerHtml();
    // active nav
    const page = document.body.dataset.nav;
    if (page) {
      document.querySelectorAll(".navlink[data-nav='"+page+"']").forEach(n=>n.classList.add("active"));
    }
  }

  /* ---------- Public API ---------- */
  window.Vendra = {
    toggleTheme() {
      const next = S.getTheme() === "dark" ? "light" : "dark";
      S.setTheme(next); applyTheme(next);
    },
    doSearch(e) {
      e.preventDefault();
      const q = document.getElementById("globalSearch").value.trim();
      location.href = "catalog.html?q=" + encodeURIComponent(q);
      return false;
    },
    confirmReset() {
      window.openModal(`
        <div class="modal-head"><h3 style="margin:0">Reset demo data?</h3>
          <button class="icon-btn" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <p>This clears your cart, orders, accounts, reviews and Security Lab progress, restoring the original seed data.</p>
          <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:18px">
            <button class="btn btn-ghost" onclick="closeModal()">Cancel</button>
            <button class="btn btn-primary" onclick="Store.reset();location.href='index.html'">Reset everything</button>
          </div>
        </div>`);
    },
    remount: mountChrome
  };

  // re-render chrome counts on state change
  S.sub(() => mountChrome());
  document.addEventListener("DOMContentLoaded", mountChrome);
})();
