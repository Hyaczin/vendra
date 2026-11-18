/* ==========================================================================
   store.js — browser-only persistence + app state for Vendra
   Everything lives in localStorage. No backend, no network.
   ========================================================================== */
(function () {
  const KEY = "vendra_v1";

  const defaults = () => ({
    users: [
      // NOTE: seeded demo accounts. Passwords stored in plaintext ON PURPOSE —
      // this is one of the demonstrated OWASP weaknesses (see security.js A02).
      { id:"u-admin", name:"Site Admin", email:"admin@vendra.shop", password:"admin123", role:"admin",
        address:"1 Market Street, Metroville", created:"2026-01-04" },
      { id:"u-demo", name:"Jamie Rivera", email:"jamie@example.com", password:"password1", role:"customer",
        address:"88 Maple Ave, Rivertown", created:"2026-03-21" }
    ],
    session: null,            // current logged-in user id
    cart: {},                 // productId -> qty
    favorites: [],            // productIds
    orders: [],               // {id, userId, items, total, date, status, address, card}
    reviews: {},              // productId -> [{user,rating,date,text}]
    coupons: { SAVE10: 0.10, WELCOME20: 0.20, VENDRA5: 5 }, // front-end only
    settings: { theme: "light" },
    lab: { found: {} },       // owasp id -> true
    sellerProducts: []        // user-added listings
  });

  let state = load();

  function load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) { const d = defaults(); persist(d); return d; }
      const parsed = JSON.parse(raw);
      // merge seed reviews once
      if (!parsed.reviews || Object.keys(parsed.reviews).length === 0) {
        parsed.reviews = JSON.parse(JSON.stringify(window.SEED_REVIEWS || {}));
      }
      return Object.assign(defaults(), parsed);
    } catch (e) {
      const d = defaults(); persist(d); return d;
    }
  }
  function persist(s) {
    try { localStorage.setItem(KEY, JSON.stringify(s || state)); } catch (e) {}
  }
  function save() { persist(state); emit(); }

  // simple pub/sub so UI can react
  const subs = [];
  function emit() { subs.forEach(fn => { try { fn(state); } catch(e){} }); }

  const Store = {
    sub(fn) { subs.push(fn); return () => { const i=subs.indexOf(fn); if(i>-1)subs.splice(i,1); }; },
    get state() { return state; },
    save() { save(); },

    reset() { state = defaults(); if (window.SEED_REVIEWS) state.reviews = JSON.parse(JSON.stringify(window.SEED_REVIEWS)); save(); },

    /* ---- theme ---- */
    getTheme() { return state.settings.theme; },
    setTheme(t) { state.settings.theme = t; save(); },

    /* ---- auth ---- */
    currentUser() { return state.users.find(u => u.id === state.session) || null; },
    findUser(email) { return state.users.find(u => u.email.toLowerCase() === String(email).toLowerCase()); },
    register(u) {
      const user = Object.assign({ id:"u-"+Date.now().toString(36), role:"customer", created:new Date().toISOString().slice(0,10) }, u);
      state.users.push(user); state.session = user.id; save(); return user;
    },
    login(email, password) {
      const u = this.findUser(email);
      if (u && u.password === password) { state.session = u.id; save(); return u; }
      return null;
    },
    logout() { state.session = null; save(); },

    /* ---- cart ---- */
    cartCount() { return Object.values(state.cart).reduce((a,b)=>a+b,0); },
    addToCart(id, qty=1) { state.cart[id] = (state.cart[id]||0) + qty; save(); },
    setQty(id, qty) { if (qty<=0) delete state.cart[id]; else state.cart[id]=qty; save(); },
    removeFromCart(id) { delete state.cart[id]; save(); },
    clearCart() { state.cart = {}; save(); },
    cartItems() {
      return Object.entries(state.cart).map(([id,qty]) => {
        const p = window.findProduct(id); return p ? { ...p, qty } : null;
      }).filter(Boolean);
    },

    /* ---- favorites ---- */
    isFav(id) { return state.favorites.includes(id); },
    toggleFav(id) {
      const i = state.favorites.indexOf(id);
      if (i>-1) state.favorites.splice(i,1); else state.favorites.push(id);
      save(); return this.isFav(id);
    },

    /* ---- orders ---- */
    placeOrder(order) {
      const o = Object.assign({ id:"ORD-"+Date.now().toString(36).toUpperCase(), date:new Date().toISOString(), status:"Processing" }, order);
      state.orders.push(o); state.cart = {}; save(); return o;
    },
    ordersFor(userId) { return state.orders.filter(o => o.userId === userId); },
    getOrder(id) { return state.orders.find(o => o.id === id); },

    /* ---- reviews ---- */
    reviewsFor(pid) { return state.reviews[pid] || []; },
    addReview(pid, r) {
      if (!state.reviews[pid]) state.reviews[pid] = [];
      state.reviews[pid].unshift(r); save();
    },

    /* ---- seller listings ---- */
    addListing(p) { state.sellerProducts.push(p); save(); },

    /* ---- security lab ---- */
    markFound(owaspId) {
      if (!state.lab.found[owaspId]) { state.lab.found[owaspId] = { at: Date.now() }; save(); return true; }
      return false;
    },
    isFound(id) { return !!state.lab.found[id]; },
    foundCount() { return Object.keys(state.lab.found).length; }
  };

  window.Store = Store;
})();

/* ---------- global helpers ---------- */
window.findProduct = function (id) {
  const extra = (window.Store && window.Store.state.sellerProducts) || [];
  return window.PRODUCTS.concat(extra).find(p => p.id === id) || null;
};
window.allProducts = function () {
  const extra = (window.Store && window.Store.state.sellerProducts) || [];
  return window.PRODUCTS.concat(extra);
};
window.money = function (n) { return "$" + Number(n).toFixed(2); };
window.stars = function (r) {
  const full = Math.round(r);
  return "★★★★★".slice(0,full) + "☆☆☆☆☆".slice(0,5-full);
};
window.escapeHtml = function (s) {
  return String(s).replace(/[&<>"']/g, c => ({ "&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;" }[c]));
};
window.qs = function (name) { return new URLSearchParams(location.search).get(name); };
