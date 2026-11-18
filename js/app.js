/* ==========================================================================
   app.js — page controllers for Vendra
   Each page sets <body data-page="..."> and this dispatches to a renderer.
   ========================================================================== */
(function () {
  const S = window.Store;

  /* ---------------- reusable product card ---------------- */
  function cardHtml(p, i) {
    const fav = S.isFav(p.id);
    const badge = p.badge === "sale" && p.old ? `<span class="badge badge-sale">-${Math.round((1-p.price/p.old)*100)}%</span>`
      : p.badge === "new" ? `<span class="badge badge-new">New</span>`
      : p.badge === "low" ? `<span class="badge badge-low">Only ${p.stock} left</span>` : "";
    return `
    <article class="card" style="animation-delay:${(i||0)*40}ms">
      <a class="card-media" href="product.html?id=${p.id}" aria-label="${window.escapeHtml(p.title)}">
        <div class="card-badges">${badge}</div>
        <div class="ph">${p.emoji}</div>
      </a>
      <button class="card-fav ${fav?"on":""}" title="Save to wishlist"
        onclick="App.toggleFav('${p.id}',this)">${fav?"❤️":"🤍"}</button>
      <div class="card-body">
        <div class="card-cat">${catName(p.cat)}</div>
        <a class="card-title" href="product.html?id=${p.id}">${window.escapeHtml(p.title)}</a>
        <div class="card-rating"><span class="stars">${window.stars(p.rating)}</span> ${p.rating} · ${p.reviews.toLocaleString?p.reviews.toLocaleString():p.reviews}</div>
        <div class="card-foot">
          <div class="price">${window.money(p.price)}${p.old?`<span class="old">${window.money(p.old)}</span>`:""}</div>
        </div>
        <button class="btn btn-primary btn-sm" onclick="App.add('${p.id}')">Add to cart</button>
      </div>
    </article>`;
  }
  function catName(id){ const c=window.CATEGORIES.find(c=>c.id===id); return c?c.name:id; }

  /* ---------------- HOME ---------------- */
  function renderHome() {
    const el = document.getElementById("app");
    const deals = window.allProducts().filter(p=>p.old).slice(0,10);
    const trending = window.allProducts().slice().sort((a,b)=>b.reviews-a.reviews).slice(0,10);
    el.innerHTML = `
      <section class="hero">
        <div class="hero-glow"></div>
        <h1>Everything you love,<br>delivered to your door.</h1>
        <p>Millions of products, unbeatable deals, and a checkout that takes seconds. Welcome to Vendra.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap">
          <a class="btn btn-primary" href="catalog.html">Start shopping</a>
          <a class="btn btn-ghost" style="color:#fff;border-color:rgba(255,255,255,.3)" href="catalog.html?sort=deals">See today's deals</a>
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>Shop by category</h2></div>
        <div class="grid grid-cats">
          ${window.CATEGORIES.map(c=>`
            <a class="cat-tile" href="catalog.html?cat=${c.id}">
              <span class="emoji">${c.emoji}</span><span>${c.name}</span>
            </a>`).join("")}
        </div>
      </section>

      <section class="section">
        <div class="section-head"><h2>🔥 Today's deals</h2><a href="catalog.html?sort=deals">View all →</a></div>
        <div class="grid grid-products">${deals.map((p,i)=>cardHtml(p,i)).join("")}</div>
      </section>

      <section class="section">
        <div class="section-head"><h2>⭐ Trending now</h2><a href="catalog.html">View all →</a></div>
        <div class="grid grid-products">${trending.map((p,i)=>cardHtml(p,i)).join("")}</div>
      </section>

      <section class="section">
        <div class="panel" style="background:linear-gradient(135deg,var(--ink-900),#2a1a40);color:#fff;border:none;display:flex;gap:20px;align-items:center;justify-content:space-between;flex-wrap:wrap">
          <div>
            <h3 style="color:#fff;margin:0 0 6px">🛡️ This store is intentionally insecure</h3>
            <p class="muted" style="color:#c7d2e5;margin:0;max-width:560px">Vendra is a portfolio piece: a real-looking shop with the OWASP Top 10 weaknesses baked into its features. Explore the Security Lab to hunt them — nothing you do here can cause real harm.</p>
          </div>
          <a class="btn btn-primary" href="security.html">Enter the Security Lab</a>
        </div>
      </section>`;
  }

  /* ---------------- CATALOG ---------------- */
  function renderCatalog() {
    const el = document.getElementById("app");
    const params = new URLSearchParams(location.search);
    let cat = params.get("cat") || "";
    let q = (params.get("q") || "").toLowerCase();
    let sort = params.get("sort") || "relevance";

    function compute() {
      let list = window.allProducts().slice();
      const activeCats = [...document.querySelectorAll(".f-cat:checked")].map(c=>c.value);
      if (activeCats.length) list = list.filter(p=>activeCats.includes(p.cat));
      else if (cat) list = list.filter(p=>p.cat===cat);
      if (q) list = list.filter(p => (p.title+" "+p.brand+" "+catName(p.cat)).toLowerCase().includes(q));
      const minR = document.querySelector('input[name="rating"]:checked');
      if (minR && minR.value) list = list.filter(p=>p.rating>=+minR.value);
      const maxP = document.getElementById("maxPrice");
      if (maxP && maxP.value) list = list.filter(p=>p.price<=+maxP.value);
      const s = document.getElementById("sortSel") ? document.getElementById("sortSel").value : sort;
      if (s==="price-asc") list.sort((a,b)=>a.price-b.price);
      else if (s==="price-desc") list.sort((a,b)=>b.price-a.price);
      else if (s==="rating") list.sort((a,b)=>b.rating-a.rating);
      else if (s==="deals") list = list.filter(p=>p.old).sort((a,b)=>(1-a.price/a.old)<(1-b.price/b.old)?1:-1);
      return list;
    }
    function paint() {
      const list = compute();
      const grid = document.getElementById("catGrid");
      const count = document.getElementById("resCount");
      if (count) count.textContent = list.length + " product" + (list.length!==1?"s":"");
      grid.innerHTML = list.length ? list.map((p,i)=>cardHtml(p,i)).join("")
        : `<div class="empty" style="grid-column:1/-1"><div class="big">🔍</div><h3>No products found</h3><p>Try adjusting your filters or search.</p></div>`;
    }

    const title = q ? `Results for “${window.escapeHtml(q)}”` : cat ? catName(cat) : "All products";
    el.innerHTML = `
      <div class="crumbs"><a href="index.html">Home</a> / <span>${window.escapeHtml(title)}</span></div>
      <div class="catalog">
        <aside class="filters panel">
          <div class="filter-group">
            <h4>Category</h4>
            ${window.CATEGORIES.map(c=>`<label class="check"><input type="checkbox" class="f-cat" value="${c.id}" ${c.id===cat?"checked":""}> ${c.emoji} ${c.name}</label>`).join("")}
          </div>
          <div class="filter-group">
            <h4>Max price</h4>
            <input id="maxPrice" type="range" min="10" max="900" value="900" style="width:100%;accent-color:var(--brand-500)">
            <div class="muted" style="font-size:.82rem">Up to <span id="maxPriceLbl">$900</span></div>
          </div>
          <div class="filter-group">
            <h4>Minimum rating</h4>
            ${[0,4,4.5].map(r=>`<label class="check"><input type="radio" name="rating" value="${r}" ${r===0?"checked":""}> ${r===0?"Any":"★ "+r+"+"}</label>`).join("")}
          </div>
          <button class="btn btn-ghost btn-block" onclick="App.clearFilters()">Clear filters</button>
        </aside>
        <div>
          <div class="toolbar">
            <h1 style="font-size:1.4rem;margin:0">${window.escapeHtml(title)} <span class="muted" style="font-size:.9rem;font-weight:400">· <span id="resCount"></span></span></h1>
            <label style="display:flex;align-items:center;gap:8px;font-size:.88rem">Sort
              <select id="sortSel" class="btn btn-ghost" style="padding:8px 12px">
                <option value="relevance">Relevance</option>
                <option value="price-asc">Price: low to high</option>
                <option value="price-desc">Price: high to low</option>
                <option value="rating">Top rated</option>
                <option value="deals" ${sort==="deals"?"selected":""}>Best deals</option>
              </select>
            </label>
          </div>
          <div class="grid grid-products" id="catGrid"></div>
        </div>
      </div>`;

    document.querySelectorAll(".f-cat,input[name=rating]").forEach(i=>i.addEventListener("change",paint));
    const mp = document.getElementById("maxPrice");
    mp.addEventListener("input",()=>{ document.getElementById("maxPriceLbl").textContent="$"+mp.value; paint(); });
    document.getElementById("sortSel").addEventListener("change",paint);
    paint();
  }

  /* ---------------- PRODUCT ---------------- */
  let pdpQty = 1;
  function renderProduct() {
    const el = document.getElementById("app");
    const id = window.qs("id");
    const p = window.findProduct(id);
    if (!p) { el.innerHTML = emptyState("🛒","Product not found","This item may have been removed.","catalog.html","Browse products"); return; }
    pdpQty = 1;
    const reviews = S.reviewsFor(p.id);
    const related = window.allProducts().filter(x=>x.cat===p.cat && x.id!==p.id).slice(0,5);

    el.innerHTML = `
      <div class="crumbs"><a href="index.html">Home</a> / <a href="catalog.html?cat=${p.cat}">${catName(p.cat)}</a> / <span>${window.escapeHtml(p.title)}</span></div>
      <div class="pdp">
        <div class="pdp-media">${p.emoji}</div>
        <div>
          <div class="card-cat">${p.brand} · ${catName(p.cat)}</div>
          <h1>${window.escapeHtml(p.title)}</h1>
          <div class="card-rating" style="font-size:.95rem"><span class="stars">${window.stars(p.rating)}</span> <b>${p.rating}</b> · ${p.reviews} ratings · ${reviews.length} reviews</div>
          <div class="price" style="margin:14px 0">${window.money(p.price)}${p.old?`<span class="old">${window.money(p.old)}</span> <span class="chip active">Save ${window.money(p.old-p.price)}</span>`:""}</div>
          <p class="desc">${window.escapeHtml(p.desc)}</p>
          <div class="pdp-actions">
            <div class="qty">
              <button onclick="App.pdpQty(-1)" aria-label="Decrease">−</button>
              <span id="qtyVal">1</span>
              <button onclick="App.pdpQty(1)" aria-label="Increase">+</button>
            </div>
            <button class="btn btn-primary" onclick="App.addQty('${p.id}')">🛒 Add to cart</button>
            <button class="btn btn-ghost" onclick="App.buyNow('${p.id}')">Buy now</button>
            <button class="btn btn-ghost" onclick="App.toggleFav('${p.id}',this)">${S.isFav(p.id)?"❤️ Saved":"🤍 Save"}</button>
          </div>
          <div class="chip ${p.stock<10?'':'active'}" style="margin-bottom:16px">${p.stock<10?`⚠️ Only ${p.stock} left in stock`:`✓ In stock · ${p.stock} available`}</div>
          <div>
            <h3 style="font-size:1.05rem">Specifications</h3>
            ${Object.entries(p.specs).map(([k,v])=>`<div class="spec"><b>${k}</b><span>${window.escapeHtml(String(v))}</span></div>`).join("")}
          </div>
        </div>
      </div>

      <section class="section" id="reviews">
        <div class="section-head"><h2>Customer reviews</h2></div>
        <div class="layout-2">
          <div>
            <div id="reviewList">${reviews.length?reviews.map(reviewHtml).join(""):'<p class="muted">No written reviews yet. Be the first!</p>'}</div>
          </div>
          <div class="panel">
            <h3>Write a review</h3>
            <div class="field"><label>Rating</label>
              <select id="rvRating" class="btn btn-ghost btn-block" style="text-align:left">
                <option value="5">★★★★★ Excellent</option><option value="4">★★★★ Good</option>
                <option value="3">★★★ Okay</option><option value="2">★★ Poor</option><option value="1">★ Bad</option>
              </select>
            </div>
            <div class="field"><label>Your review</label>
              <textarea id="rvText" rows="4" placeholder="Share your experience…"></textarea>
            </div>
            <button class="btn btn-primary btn-block" onclick="App.submitReview('${p.id}')">Post review</button>
            <p class="muted" style="font-size:.76rem;margin-top:10px">Heads up: this demo renders review text insecurely on purpose (OWASP A03). Try including an HTML tag.</p>
          </div>
        </div>
      </section>

      ${related.length?`<section class="section">
        <div class="section-head"><h2>You might also like</h2></div>
        <div class="grid grid-products">${related.map((p,i)=>cardHtml(p,i)).join("")}</div>
      </section>`:""}`;
  }
  function reviewHtml(r) {
    // A03 DEMO: intentionally insecure — review text injected as raw HTML.
    // We defang it so nothing actually executes, but we SHOW the danger.
    const defanged = defangAndFlag(r.text);
    return `<div class="review">
      <div class="review-head">
        <span class="avatar">${(r.user||"?")[0]}</span>
        <div><b>${window.escapeHtml(r.user||"Anonymous")}</b><div class="muted" style="font-size:.78rem">${r.date} · <span class="stars">${window.stars(r.rating)}</span></div></div>
      </div>
      <div class="review-body">${defanged}</div>
    </div>`;
  }

  /* ---- A03 helper: detect markup, demonstrate without executing ---- */
  function defangAndFlag(text) {
    const hasMarkup = /<[a-z!/][\s\S]*>/i.test(text) || /on\w+\s*=/i.test(text) || /javascript:/i.test(text);
    if (!hasMarkup) return window.escapeHtml(text);
    // show it as a highlighted, NON-executing snippet, then fire the lesson
    setTimeout(() => window.Security.reveal("A03",
      "Your review contained HTML/script markup. A vulnerable store would have injected it with innerHTML and run it in every shopper's browser. Vendra detected the pattern and rendered it inertly instead."), 400);
    return `<div class="panel" style="border-color:var(--danger);background:color-mix(in srgb,var(--danger) 8%,transparent)">
      <div class="chip" style="color:var(--danger);border-color:var(--danger);margin-bottom:8px">⚠️ Script payload neutralised (A03 demo)</div>
      <code style="font-family:var(--mono);font-size:.8rem;word-break:break-all">${window.escapeHtml(text)}</code>
      <p class="muted" style="font-size:.8rem;margin:8px 0 0">Rendered as inert text. In a vulnerable build this markup would execute.</p>
    </div>`;
  }

  /* ---------------- CART ---------------- */
  function renderCart() {
    const el = document.getElementById("app");
    const items = S.cartItems();
    if (!items.length) { el.innerHTML = emptyState("🛒","Your cart is empty","Browse our catalog and add something you love.","catalog.html","Start shopping"); return; }
    const sub = items.reduce((t,i)=>t+i.price*i.qty,0);
    el.innerHTML = `
      <h1 style="margin:24px 0">Your cart</h1>
      <div class="layout-2">
        <div class="panel">
          ${items.map(i=>`
            <div class="cart-row" data-id="${i.id}">
              <a class="cart-thumb" href="product.html?id=${i.id}">${i.emoji}</a>
              <div>
                <a href="product.html?id=${i.id}" style="font-weight:600">${window.escapeHtml(i.title)}</a>
                <div class="muted" style="font-size:.82rem">${catName(i.cat)} · ${window.money(i.price)} each</div>
                <div class="qty" style="margin-top:8px">
                  <button onclick="App.cartQty('${i.id}',-1)">−</button><span>${i.qty}</span><button onclick="App.cartQty('${i.id}',1)">+</button>
                </div>
              </div>
              <div style="text-align:right">
                <div class="price" style="font-size:1.05rem">${window.money(i.price*i.qty)}</div>
                <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="App.cartRemove('${i.id}')">Remove</button>
              </div>
            </div>`).join("")}
        </div>
        <aside class="panel">
          <h3>Order summary</h3>
          <div class="summary-row"><span>Subtotal (${S.cartCount()} items)</span><span>${window.money(sub)}</span></div>
          <div class="summary-row"><span>Shipping</span><span>${sub>50?"Free":window.money(4.99)}</span></div>
          <div class="summary-row"><span>Estimated tax</span><span>${window.money(sub*0.08)}</span></div>
          <div class="summary-row total"><span>Total</span><span>${window.money(sub + (sub>50?0:4.99) + sub*0.08)}</span></div>
          <a class="btn btn-primary btn-block" href="checkout.html" style="margin-top:16px">Proceed to checkout</a>
          <a class="btn btn-ghost btn-block" href="catalog.html" style="margin-top:10px">Continue shopping</a>
        </aside>
      </div>`;
  }

  /* ---------------- CHECKOUT ---------------- */
  function renderCheckout() {
    const el = document.getElementById("app");
    const items = S.cartItems();
    if (!items.length) { el.innerHTML = emptyState("🛒","Nothing to check out","Your cart is empty.","catalog.html","Browse products"); return; }
    const u = S.currentUser();
    const sub = items.reduce((t,i)=>t+i.price*i.qty,0);
    const ship = sub>50?0:4.99, tax = sub*0.08, total = sub+ship+tax;
    el.innerHTML = `
      <h1 style="margin:24px 0">Checkout</h1>
      <div class="layout-2">
        <div>
          <div class="panel" style="margin-bottom:18px">
            <h3>Shipping address</h3>
            <div class="field"><label>Full name</label><input id="coName" value="${u?window.escapeHtml(u.name):""}"></div>
            <div class="field"><label>Address</label><input id="coAddr" value="${u&&u.address?window.escapeHtml(u.address):""}" placeholder="Street, city"></div>
          </div>
          <div class="panel">
            <h3>Payment <span class="chip">Demo · not charged</span></h3>
            <div class="field"><label>Card number</label><input id="coCard" placeholder="4242 4242 4242 4242" inputmode="numeric"></div>
            <div style="display:flex;gap:12px">
              <div class="field" style="flex:1"><label>Expiry</label><input id="coExp" placeholder="MM/YY"></div>
              <div class="field" style="flex:1"><label>CVC</label><input id="coCvc" placeholder="123"></div>
            </div>
            <div class="field"><label>Coupon code</label>
              <div style="display:flex;gap:8px"><input id="coCoupon" placeholder="Try SAVE10"><button class="btn btn-ghost" onclick="App.applyCoupon()">Apply</button></div>
            </div>
          </div>
        </div>
        <aside class="panel">
          <h3>Summary</h3>
          <div id="coSummary"></div>
          <button class="btn btn-primary btn-block" style="margin-top:16px" onclick="App.placeOrder(false)">Place order · <span id="coTotalBtn">${window.money(total)}</span></button>
          <button class="btn btn-ghost btn-block" style="margin-top:10px;border-color:var(--danger);color:var(--danger)" onclick="App.placeOrder(true)">🧪 Tamper with price (A04 demo)</button>
          <p class="muted" style="font-size:.76rem;margin-top:10px">The second button submits a total computed by the browser — showing how a store that trusts client-side prices (OWASP A04) can be charged $1 for everything.</p>
        </aside>
      </div>`;
    App._coState = { sub, ship, tax, discount:0, coupon:null };
    paintCoSummary();
  }
  function paintCoSummary() {
    const st = App._coState; if(!st) return;
    const total = Math.max(0, st.sub - st.discount) + st.ship + st.tax;
    const box = document.getElementById("coSummary");
    if (box) box.innerHTML = `
      <div class="summary-row"><span>Subtotal</span><span>${window.money(st.sub)}</span></div>
      ${st.discount?`<div class="summary-row" style="color:var(--success)"><span>Coupon ${st.coupon}</span><span>-${window.money(st.discount)}</span></div>`:""}
      <div class="summary-row"><span>Shipping</span><span>${st.ship?window.money(st.ship):"Free"}</span></div>
      <div class="summary-row"><span>Tax</span><span>${window.money(st.tax)}</span></div>
      <div class="summary-row total"><span>Total</span><span>${window.money(total)}</span></div>`;
    const btn = document.getElementById("coTotalBtn"); if(btn) btn.textContent = window.money(total);
  }

  /* ---------------- ORDERS ---------------- */
  function renderOrders() {
    const el = document.getElementById("app");
    const u = S.currentUser();
    const focusId = window.qs("id");

    if (focusId) {
      // A01 DEMO: we render ANY order id from the URL with no ownership check.
      const o = S.getOrder(focusId);
      if (!o) { el.innerHTML = emptyState("📦","Order not found","No order with that id.","orders.html","All orders"); return; }
      const owned = u && o.userId === u.id;
      if (!owned) {
        window.Security.auditLog("access.idor", "viewed order "+o.id+" not owned by current session");
        setTimeout(()=>window.Security.reveal("A01",
          "You opened order "+o.id+" by its id in the URL, but it does not belong to the signed-in account. A vulnerable store (like this one) shows it anyway — leaking another customer's name, address and purchases."), 500);
      }
      el.innerHTML = orderDetailHtml(o, owned);
      return;
    }

    if (!u) { el.innerHTML = emptyState("🔐","Sign in to see orders","Your orders are tied to your account.","login.html","Sign in"); return; }
    const orders = S.ordersFor(u.id);
    if (!orders.length) { el.innerHTML = emptyState("📦","No orders yet","When you place an order it shows up here.","catalog.html","Start shopping"); return; }
    el.innerHTML = `
      <h1 style="margin:24px 0">Your orders</h1>
      ${orders.slice().reverse().map(o=>`
        <div class="panel" style="margin-bottom:14px">
          <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:10px;align-items:center">
            <div>
              <b>${o.id}</b> <span class="chip active">${o.status}</span>
              <div class="muted" style="font-size:.84rem">${new Date(o.date).toLocaleString()} · ${o.items.length} item(s) · ${window.money(o.total)}</div>
            </div>
            <a class="btn btn-ghost btn-sm" href="orders.html?id=${o.id}">View details</a>
          </div>
        </div>`).join("")}
      <div class="panel" style="border-style:dashed">
        <p class="muted" style="margin:0;font-size:.86rem">🛡️ <b>A01 hint:</b> open an order's details, then change the <code>id</code> in the address bar to another order id — the page will show it regardless of who owns it.</p>
      </div>`;
  }
  function orderDetailHtml(o, owned) {
    const user = S.state.users.find(u=>u.id===o.userId);
    return `
      <div class="crumbs"><a href="orders.html">Orders</a> / <span>${o.id}</span></div>
      ${!owned?`<div class="panel" style="border-color:var(--danger);background:color-mix(in srgb,var(--danger) 8%,transparent);margin-bottom:16px">
        <b>⚠️ Broken access control (A01):</b> this order belongs to a different account, yet the page rendered it because it trusted the id in the URL.</div>`:""}
      <div class="panel">
        <div style="display:flex;justify-content:space-between;flex-wrap:wrap;gap:12px">
          <div><h2 style="margin:0">${o.id}</h2><div class="muted">${new Date(o.date).toLocaleString()}</div></div>
          <span class="chip active" style="height:fit-content">${o.status}</span>
        </div>
        <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin:18px 0">
          <div><b>Ship to</b><div class="muted">${window.escapeHtml((user&&user.name)||o.name||"—")}<br>${window.escapeHtml(o.address||"—")}</div></div>
          <div><b>Payment</b><div class="muted">Card ending ${o.card?String(o.card).slice(-4):"••••"}</div></div>
        </div>
        <h3>Items</h3>
        ${o.items.map(i=>`<div class="cart-row"><div class="cart-thumb">${i.emoji||"📦"}</div><div><b>${window.escapeHtml(i.title)}</b><div class="muted" style="font-size:.82rem">Qty ${i.qty}</div></div><div class="price" style="font-size:1rem">${window.money(i.price*i.qty)}</div></div>`).join("")}
        <div class="summary-row total"><span>Total paid</span><span>${window.money(o.total)}</span></div>
      </div>`;
  }

  /* ---------------- FAVORITES ---------------- */
  function renderFavorites() {
    const el = document.getElementById("app");
    const items = S.state.favorites.map(window.findProduct).filter(Boolean);
    if (!items.length) { el.innerHTML = emptyState("❤️","Your wishlist is empty","Tap the heart on any product to save it here.","catalog.html","Find something"); return; }
    el.innerHTML = `<h1 style="margin:24px 0">Your wishlist</h1><div class="grid grid-products">${items.map((p,i)=>cardHtml(p,i)).join("")}</div>`;
  }

  /* ---------------- helpers ---------------- */
  function emptyState(big,title,sub,href,cta){
    return `<div class="empty"><div class="big">${big}</div><h2>${title}</h2><p>${sub}</p><a class="btn btn-primary" href="${href}">${cta}</a></div>`;
  }

  /* ---------------- App API (onclick handlers) ---------------- */
  const App = {
    _coState: null,
    add(id){ S.addToCart(id,1); window.toast("Added to cart ✓"); },
    addQty(id){ S.addToCart(id,pdpQty); window.toast(`Added ${pdpQty} to cart ✓`); },
    buyNow(id){ S.addToCart(id,pdpQty); location.href="checkout.html"; },
    pdpQty(d){ pdpQty=Math.max(1,pdpQty+d); const v=document.getElementById("qtyVal"); if(v)v.textContent=pdpQty; },
    toggleFav(id,btn){ const on=S.toggleFav(id); if(btn){ if(btn.classList.contains("card-fav")){btn.classList.toggle("on",on);btn.textContent=on?"❤️":"🤍";} else {btn.textContent=on?"❤️ Saved":"🤍 Save";} } window.toast(on?"Saved to wishlist ❤️":"Removed from wishlist"); },
    cartQty(id,d){ const cur=S.state.cart[id]||0; S.setQty(id,cur+d); renderCart(); },
    cartRemove(id){ S.removeFromCart(id); renderCart(); window.toast("Removed from cart"); },
    clearFilters(){ location.href="catalog.html"; },

    applyCoupon(){
      const code=(document.getElementById("coCoupon").value||"").trim().toUpperCase();
      const c=S.state.coupons[code];
      const st=App._coState; if(!st) return;
      if(!c){ window.toast("Invalid coupon code","error"); return; }
      st.discount = c<1 ? st.sub*c : c; st.coupon=code; paintCoSummary();
      window.toast(`Coupon ${code} applied ✓`,"");
    },

    submitReview(pid){
      const text=(document.getElementById("rvText").value||"").trim();
      const rating=+document.getElementById("rvRating").value;
      if(!text){ window.toast("Write something first","warn"); return; }
      const u=S.currentUser();
      S.addReview(pid,{ user:u?u.name:"Guest shopper", rating, date:new Date().toISOString().slice(0,10), text });
      renderProduct(); window.toast("Review posted ✓");
      setTimeout(()=>{ const r=document.getElementById("reviews"); if(r)r.scrollIntoView({behavior:"smooth"}); },100);
    },

    placeOrder(tamper){
      const items=S.cartItems();
      if(!items.length){ window.toast("Cart is empty","warn"); return; }
      const st=App._coState;
      const name=document.getElementById("coName").value.trim();
      const addr=document.getElementById("coAddr").value.trim();
      const card=document.getElementById("coCard").value.trim();
      if(!name||!addr){ window.toast("Fill in your shipping details","warn"); return; }

      let total = Math.max(0, st.sub - st.discount) + st.ship + st.tax;
      if(tamper){
        // A04 DEMO: the browser decides the price. We submit $1.00 and the
        // "backend" (our store) accepts it without re-pricing.
        total = 1.00;
        window.Security.auditLog("order.price_tamper","client submitted total=1.00");
      }
      const u=S.currentUser();
      const order=S.placeOrder({
        userId: u?u.id:"guest",
        name, address:addr, card,
        items: items.map(i=>({id:i.id,title:i.title,emoji:i.emoji,qty:i.qty,price:i.price})),
        total
      });
      if(tamper){
        setTimeout(()=>window.Security.reveal("A04",
          `The browser told the checkout the total was $1.00 and it was accepted — your real cart was worth far more. Order ${order.id} was created at the tampered price because the store trusted a client-side total.`),300);
      } else {
        window.toast("Order placed ✓");
      }
      setTimeout(()=>location.href="orders.html?id="+order.id, tamper?2600:400);
    }
  };
  window.App = App;

  /* ---------------- dispatch ---------------- */
  const routes = { home:renderHome, catalog:renderCatalog, product:renderProduct, cart:renderCart, checkout:renderCheckout, orders:renderOrders, favorites:renderFavorites };
  document.addEventListener("DOMContentLoaded", function(){
    const page=document.body.dataset.page;
    if(routes[page]) routes[page]();
    App.paintCoSummary = paintCoSummary;
  });
})();
