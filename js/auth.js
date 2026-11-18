/* ==========================================================================
   auth.js — login, register, account, sell, and the Security Lab page
   ========================================================================== */
(function () {
  const S = window.Store;

  /* ---------------- password strength ---------------- */
  function strength(pw) {
    let s = 0;
    if (pw.length >= 8) s++;
    if (/[A-Z]/.test(pw) && /[a-z]/.test(pw)) s++;
    if (/\d/.test(pw)) s++;
    if (/[^A-Za-z0-9]/.test(pw)) s++;
    return s; // 0..4
  }
  function paintMeter() {
    const pw = document.getElementById("regPw");
    if (!pw) return;
    const s = strength(pw.value);
    const bar = document.getElementById("pwBar");
    const lbl = document.getElementById("pwLbl");
    const pct = [8,30,55,80,100][s];
    const col = ["#dc2626","#dc2626","#d97706","#16a34a","#16a34a"][s];
    const txt = ["Too weak","Weak","Fair","Good","Strong"][s];
    bar.style.width = pct + "%"; bar.style.background = col;
    lbl.textContent = pw.value ? txt : "";
  }

  /* ---------------- LOGIN ---------------- */
  function renderLogin() {
    const el = document.getElementById("app");
    el.innerHTML = `
      <div class="panel auth-card">
        <h1 style="font-size:1.6rem">Welcome back</h1>
        <p class="muted" style="margin-top:-6px">Sign in to your Vendra account.</p>
        <div class="field"><label>Email</label><input id="logEmail" type="email" placeholder="you@example.com" value="jamie@example.com"></div>
        <div class="field"><label>Password</label><input id="logPw" type="password" placeholder="••••••••" value="password1"></div>
        <div id="logMsg"></div>
        <button class="btn btn-primary btn-block" onclick="Auth.login()">Sign in</button>
        <p class="center muted" style="margin-top:16px;font-size:.88rem">New here? <a href="register.html" style="color:var(--brand-600);font-weight:600">Create an account</a></p>
        <div class="panel" style="background:var(--bg-sunken);margin-top:18px;border-style:dashed">
          <p style="margin:0 0 6px;font-size:.84rem"><b>🛡️ Demo accounts</b></p>
          <p class="muted" style="margin:0;font-size:.8rem">customer — jamie@example.com / password1<br>admin — admin@vendra.shop / admin123</p>
          <p class="muted" style="margin:8px 0 0;font-size:.78rem">A07 demo: there's no rate-limiting and errors reveal which field was wrong. Try a few bad passwords.</p>
        </div>
      </div>`;
  }

  /* ---------------- REGISTER ---------------- */
  function renderRegister() {
    const el = document.getElementById("app");
    el.innerHTML = `
      <div class="panel auth-card">
        <h1 style="font-size:1.6rem">Create your account</h1>
        <p class="muted" style="margin-top:-6px">Join Vendra in a few seconds.</p>
        <div class="field"><label>Full name</label><input id="regName" placeholder="Jamie Rivera"></div>
        <div class="field"><label>Email</label><input id="regEmail" type="email" placeholder="you@example.com"></div>
        <div class="field"><label>Password</label><input id="regPw" type="password" placeholder="Choose a password" oninput="Auth.meter()">
          <div class="pw-meter"><i id="pwBar"></i></div>
          <div class="muted" id="pwLbl" style="font-size:.78rem;margin-top:4px"></div>
        </div>
        <div id="regMsg"></div>
        <button class="btn btn-primary btn-block" onclick="Auth.register()">Create account</button>
        <p class="center muted" style="margin-top:16px;font-size:.88rem">Already have an account? <a href="login.html" style="color:var(--brand-600);font-weight:600">Sign in</a></p>
        <p class="muted" style="font-size:.78rem;margin-top:12px">A02/A07 demo: weak passwords are accepted, and your password is stored in plaintext in localStorage.</p>
      </div>`;
  }

  /* ---------------- ACCOUNT ---------------- */
  function renderAccount() {
    const el = document.getElementById("app");
    const u = S.currentUser();
    if (!u) { el.innerHTML = `<div class="empty"><div class="big">🔐</div><h2>You're signed out</h2><p>Sign in to view your account.</p><a class="btn btn-primary" href="login.html">Sign in</a></div>`; return; }
    const orders = S.ordersFor(u.id);
    el.innerHTML = `
      <div style="display:flex;align-items:center;gap:16px;margin:28px 0">
        <span class="avatar" style="width:64px;height:64px;font-size:1.5rem">${u.name.split(" ").map(w=>w[0]).slice(0,2).join("")}</span>
        <div><h1 style="margin:0">${window.escapeHtml(u.name)}</h1><div class="muted">${window.escapeHtml(u.email)} · ${u.role}${u.role==="admin"?" 👑":""}</div></div>
        <button class="btn btn-ghost" style="margin-left:auto" onclick="Auth.logout()">Sign out</button>
      </div>
      <div class="layout-2">
        <div>
          <div class="panel" style="margin-bottom:16px">
            <h3>Profile</h3>
            <div class="field"><label>Full name</label><input id="acName" value="${window.escapeHtml(u.name)}"></div>
            <div class="field"><label>Address</label><input id="acAddr" value="${u.address?window.escapeHtml(u.address):""}"></div>
            <button class="btn btn-primary" onclick="Auth.saveProfile()">Save changes</button>
          </div>
          <div class="panel">
            <h3>Recent orders</h3>
            ${orders.length?orders.slice().reverse().slice(0,3).map(o=>`<div class="summary-row"><a href="orders.html?id=${o.id}" style="color:var(--brand-600)">${o.id}</a><span>${window.money(o.total)} · ${o.status}</span></div>`).join(""):'<p class="muted">No orders yet.</p>'}
            <a class="btn btn-ghost btn-block" href="orders.html" style="margin-top:12px">All orders</a>
          </div>
        </div>
        <aside>
          ${u.role==="admin"?`<div class="panel" style="margin-bottom:16px;border-color:var(--brand-300)">
            <h3>👑 Admin tools</h3>
            <p class="muted" style="font-size:.84rem">Role check is done entirely client-side — a customer could flip their own role in localStorage and reach this.</p>
            <button class="btn btn-ghost btn-block" onclick="Auth.adminDump()">View all users & orders</button>
          </div>`:`<div class="panel" style="margin-bottom:16px;border-style:dashed">
            <p class="muted" style="font-size:.84rem;margin:0">🛡️ A01 note: the admin panel is only hidden, not protected. Authorization that lives in the browser isn't authorization.</p>
          </div>`}
          <div class="panel" style="border-color:var(--danger)">
            <h3>🔑 Stored account data (A02)</h3>
            <p class="muted" style="font-size:.84rem">This reveals what the app actually persisted about you — including your password in plaintext.</p>
            <button class="btn btn-ghost btn-block" style="color:var(--danger);border-color:var(--danger)" onclick="Auth.revealStored()">Reveal stored account data</button>
          </div>
        </aside>
      </div>`;
  }

  /* ---------------- SELL ---------------- */
  function renderSell() {
    const el = document.getElementById("app");
    el.innerHTML = `
      <h1 style="margin:24px 0">Sell on Vendra</h1>
      <div class="layout-2">
        <div class="panel">
          <h3>List a new product</h3>
          <div class="field"><label>Title</label><input id="slTitle" placeholder="e.g. Handmade ceramic mug"></div>
          <div style="display:flex;gap:12px">
            <div class="field" style="flex:1"><label>Price ($)</label><input id="slPrice" type="number" min="1" placeholder="29"></div>
            <div class="field" style="flex:1"><label>Category</label>
              <select id="slCat" class="field" style="padding:11px">${window.CATEGORIES.map(c=>`<option value="${c.id}">${c.name}</option>`).join("")}</select>
            </div>
          </div>
          <div class="field"><label>Emoji / icon</label><input id="slEmoji" placeholder="🎁" maxlength="4" value="🎁"></div>
          <div class="field"><label>Description</label><textarea id="slDesc" rows="3" placeholder="Describe your product…"></textarea></div>
          <div class="field"><label>Product image URL (optional)</label>
            <div style="display:flex;gap:8px"><input id="slImg" placeholder="https://images.example.com/mug.jpg"><button class="btn btn-ghost" onclick="Auth.importImage()">Import</button></div>
            <p class="muted" style="font-size:.76rem;margin-top:6px">A10 demo: a real backend would fetch this URL server-side. Try an internal address like http://169.254.169.254/ to see why that's dangerous.</p>
          </div>
          <button class="btn btn-primary btn-block" onclick="Auth.listProduct()">Publish listing</button>
        </div>
        <aside class="panel">
          <h3>Your listings</h3>
          <div id="myListings">${myListingsHtml()}</div>
        </aside>
      </div>`;
  }
  function myListingsHtml(){
    const list = S.state.sellerProducts;
    if(!list.length) return '<p class="muted">You haven\'t listed anything yet.</p>';
    return list.map(p=>`<div class="summary-row"><a href="product.html?id=${p.id}" style="color:var(--brand-600)">${p.emoji} ${window.escapeHtml(p.title)}</a><span>${window.money(p.price)}</span></div>`).join("");
  }

  /* ---------------- SECURITY LAB ---------------- */
  function renderSecurityLab() {
    const el = document.getElementById("app");
    const L = window.Security.list;
    const found = S.foundCount();
    el.innerHTML = `
      <section class="hero" style="padding:40px 44px">
        <div class="hero-glow"></div>
        <span class="chip" style="background:rgba(255,255,255,.14);color:#fff;border:none">OWASP Top 10 · 2021</span>
        <h1 style="margin-top:14px">🛡️ Vendra Security Lab</h1>
        <p>This storefront has ten classes of vulnerability deliberately built into its real features. Hunt them down — each discovery explains the weak practice, its real-world impact, and the secure fix. Nothing here runs a real attack.</p>
        <div style="max-width:420px">
          <div class="progress"><i style="width:${found*10}%"></i></div>
          <div style="color:#c7d2e5;font-size:.86rem;margin-top:8px">${found} of 10 weaknesses discovered</div>
        </div>
      </section>

      <section class="section">
        <div class="lab-grid">
          ${L.map(o=>{
            const done = S.isFound(o.id);
            return `<div class="lab-card ${done?"found":""}">
              <div class="tick">${done?"✓":"○"}</div>
              <div style="font-size:1.8rem">${o.icon}</div>
              <div class="chip ${o.severity==='crit'?'':''}" style="margin:8px 0">
                <span class="sev ${o.severity}">${window.Security.sevLabel[o.severity]}</span> &nbsp;${o.id}</div>
              <h3 style="font-size:1.05rem;margin:4px 0">${o.name}</h3>
              <p class="muted" style="font-size:.86rem">${o.short}</p>
              <p style="font-size:.84rem"><b>Try it:</b> ${o.howToFind}</p>
              <button class="btn btn-ghost btn-sm" onclick="Security.reveal('${o.id}')">${done?"Review lesson":"Reveal details"}</button>
            </div>`;
          }).join("")}
        </div>
      </section>

      <section class="section" id="about">
        <div class="panel">
          <h2>Quick-launch demos</h2>
          <p class="muted">Jump straight to the feature where each weakness lives.</p>
          <div style="display:flex;gap:10px;flex-wrap:wrap;margin-top:12px">
            <a class="btn btn-ghost" href="orders.html">A01 · Orders (IDOR)</a>
            <a class="btn btn-ghost" href="account.html">A02 · Stored data</a>
            <a class="btn btn-ghost" href="product.html?id=p1001#reviews">A03 · Review XSS</a>
            <a class="btn btn-ghost" href="checkout.html">A04 · Price tamper</a>
            <button class="btn btn-ghost" onclick="location.href='security.html?debug=1'">A05 · Debug panel</button>
            <button class="btn btn-ghost" onclick="Auth.depReport()">A06 · Dependency report</button>
            <a class="btn btn-ghost" href="login.html">A07 · Weak auth</a>
            <button class="btn btn-ghost" onclick="Auth.importCoupon()">A08 · Import coupon</button>
            <button class="btn btn-ghost" onclick="Auth.auditView()">A09 · Audit log</button>
            <a class="btn btn-ghost" href="sell.html">A10 · Image URL (SSRF)</a>
          </div>
        </div>
      </section>

      <section class="section">
        <div class="panel" style="background:var(--bg-sunken)">
          <h3>About this project</h3>
          <p class="muted" style="max-width:720px">Vendra is a front-end-only portfolio piece. It looks and behaves like a modern marketplace — catalog, cart, checkout, accounts, reviews, seller tools — but every feature hides a realistic instance of an OWASP Top 10 (2021) weakness. The goal is to show, concretely, how ordinary development shortcuts turn into security incidents, and what the corrected code looks like. All state lives in your browser's localStorage; there is no server, no real payment, and no exploit that can affect anything outside this tab.</p>
        </div>
      </section>`;
  }

  /* ---------------- Auth API ---------------- */
  const Auth = {
    meter: paintMeter,
    login() {
      const email = document.getElementById("logEmail").value.trim();
      const pw = document.getElementById("logPw").value;
      const msg = document.getElementById("logMsg");
      const user = S.findUser(email);
      // A07 DEMO: verbose, field-specific errors + no throttling. Log the attempt (A09 contrast).
      window.Security.auditLog("auth.attempt", email);
      if (!user) {
        msg.innerHTML = alertBox("No account exists with that email.", "error");
        Auth._bumpFail();
        return;
      }
      if (user.password !== pw) {
        msg.innerHTML = alertBox("Incorrect password for that account.", "error");
        window.Security.auditLog("auth.fail", email);
        Auth._bumpFail();
        return;
      }
      S.login(email, pw);
      window.toast("Signed in ✓");
      setTimeout(()=>location.href="account.html", 400);
    },
    _fails: 0,
    _bumpFail() {
      Auth._fails++;
      if (Auth._fails >= 4) {
        window.Security.reveal("A07",
          `You just made ${Auth._fails} failed sign-in attempts with no lockout, delay or CAPTCHA, and the error told you whether the email existed. That combination lets attackers enumerate accounts and brute-force passwords at machine speed.`);
        Auth._fails = 0;
      }
    },
    register() {
      const name = document.getElementById("regName").value.trim();
      const email = document.getElementById("regEmail").value.trim();
      const pw = document.getElementById("regPw").value;
      const msg = document.getElementById("regMsg");
      if (!name || !email || !pw) { msg.innerHTML = alertBox("Please fill in every field.", "warn"); return; }
      if (S.findUser(email)) { msg.innerHTML = alertBox("An account with that email already exists.", "warn"); return; }
      // A07/A02 DEMO: accept ANY password strength, store plaintext.
      S.register({ name, email, password: pw });
      window.toast("Account created ✓");
      if (strength(pw) <= 1) {
        setTimeout(()=>window.Security.reveal("A07",
          `Your account was created with a very weak password and no strength requirement — and (A02) it was saved in plaintext. Both are real, common mistakes that make credential attacks trivial.`), 300);
        setTimeout(()=>location.href="account.html", 2800);
      } else {
        setTimeout(()=>location.href="account.html", 500);
      }
    },
    logout() { S.logout(); window.toast("Signed out"); setTimeout(()=>location.href="index.html",300); },
    saveProfile() {
      const u = S.currentUser(); if(!u) return;
      u.name = document.getElementById("acName").value.trim() || u.name;
      u.address = document.getElementById("acAddr").value.trim();
      S.save(); window.toast("Profile saved ✓");
    },
    revealStored() {
      const u = S.currentUser(); if(!u) return;
      window.Security.auditLog("data.reveal_stored", u.email);
      const data = JSON.stringify(u, null, 2);
      window.Security.reveal("A02",
        "Here is exactly what the app stored about you — including your password in clear text. Open DevTools → Application → Local Storage to confirm it's readable, unencrypted, by anything with access to this browser profile.");
      // append the actual dump under the modal body
      setTimeout(()=>{
        const body = document.querySelector("#modalBackdrop .modal-body");
        if (body) {
          const d = document.createElement("div");
          d.innerHTML = `<div class="panel" style="margin-top:14px"><b>Your stored record:</b><pre class="code" style="margin-top:8px">${window.escapeHtml(data)}</pre></div>`;
          body.insertBefore(d, body.firstChild.nextSibling);
        }
      }, 120);
    },
    adminDump() {
      const dump = { users: S.state.users, orders: S.state.orders };
      window.Security.auditLog("admin.dump", "all users+orders viewed");
      window.openModal(`
        <div class="modal-head"><h3 style="margin:0">👑 Admin data dump</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <div class="panel" style="border-color:var(--danger);background:color-mix(in srgb,var(--danger) 8%,transparent);margin-bottom:12px">
            <b>A01 note:</b> this "admin only" view is gated by a role flag stored in the browser. Since the client holds the role, a normal user can set it to <code>admin</code> themselves and reach this. Authorization must be enforced server-side.</div>
          <pre class="code">${window.escapeHtml(JSON.stringify(dump,null,2))}</pre>
        </div>`);
      setTimeout(()=>window.Security.reveal("A01","You reached an administrative data dump of every user and order. The only thing standing between a normal customer and this screen was a role value kept in their own browser."), 200);
    },

    listProduct() {
      const title = document.getElementById("slTitle").value.trim();
      const price = +document.getElementById("slPrice").value;
      if (!title || !price) { window.toast("Add a title and price","warn"); return; }
      const p = {
        id: "seller-"+Date.now().toString(36),
        title, price, old:0, cat: document.getElementById("slCat").value,
        emoji: document.getElementById("slEmoji").value || "🎁",
        rating: 5, reviews: 0, stock: 25, brand: (S.currentUser()&&S.currentUser().name)||"Seller",
        desc: document.getElementById("slDesc").value.trim() || "A new listing on Vendra.",
        specs: { "Seller":"Marketplace", "Condition":"New" }
      };
      S.addListing(p);
      document.getElementById("myListings").innerHTML = myListingsHtml();
      window.toast("Listing published ✓");
      document.getElementById("slTitle").value=""; document.getElementById("slPrice").value="";
    },
    importImage() {
      const url = (document.getElementById("slImg").value||"").trim();
      if (!url) { window.toast("Enter an image URL","warn"); return; }
      // A10 DEMO: we DO NOT fetch anything. We detect internal-looking targets
      // and explain the SSRF risk a real server-side fetch would carry.
      const internal = /(169\.254\.169\.254|127\.0\.0\.1|localhost|0\.0\.0\.0|10\.|192\.168\.|internal|metadata|::1|file:|gopher:)/i.test(url);
      window.Security.auditLog("ssrf.import_attempt", url);
      if (internal) {
        window.Security.reveal("A10",
          `You pointed the image importer at an internal/metadata-style address (${url}). A naive backend would fetch it server-side from inside the network — potentially reaching cloud metadata or private services. Vendra refuses and never makes the request.`);
      } else {
        window.toast("Demo: image import is simulated (no network request)", "warn");
      }
    },
    importCoupon() {
      window.openModal(`
        <div class="modal-head"><h3 style="margin:0">Import coupon pack (A08)</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <p class="muted">Paste a coupon "blob". A vulnerable app deserializes and trusts it without verifying its origin or shape.</p>
          <textarea id="cpBlob" rows="3" class="field" style="width:100%" placeholder='{"code":"FREESTUFF","percent":1.0}'>{"code":"FREESTUFF","percent":1.0}</textarea>
          <button class="btn btn-primary" onclick="Auth.applyBlob()">Import & apply</button>
        </div>`);
    },
    applyBlob() {
      let blob;
      try { blob = JSON.parse(document.getElementById("cpBlob").value); }
      catch(e){ window.toast("Invalid JSON","error"); return; }
      // A08 DEMO: trust the unsigned, unvalidated object outright
      S.state.coupons[blob.code || "IMPORTED"] = blob.percent || 1.0;
      S.save();
      window.Security.auditLog("integrity.coupon_import", JSON.stringify(blob));
      closeModal();
      window.Security.reveal("A08",
        `The imported coupon "${blob.code||"IMPORTED"}" granting ${Math.round((blob.percent||1)*100)}% off was accepted with no signature check and no validation of its values. Trusting serialized data from an untrusted source is how supply-chain and deserialization attacks start.`);
    },
    depReport() {
      window.Security.auditLog("config.dep_report","viewed");
      window.openModal(`
        <div class="modal-head"><h3 style="margin:0">📦 Dependency report (A06)</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <p class="muted">Simulated manifest for this "build". Flagged versions carry publicly-known advisories.</p>
          <pre class="code">${window.escapeHtml(
`ui-kit        1.0.3   ⚠ CVE-2023-00001  XSS in tooltip (demo)
json-parse    0.2.1   ⚠ CVE-2022-00002  prototype pollution (demo)
img-resize    2.4.0   ⚠ CVE-2024-00003  RCE on crafted image (demo)
date-helper   3.9.0   ✓ up to date
http-client   1.1.7   ⚠ CVE-2021-00004  SSRF via redirects (demo)`)}</pre>
          <p class="muted" style="font-size:.84rem">These advisories are illustrative. In a real project, <code>npm audit</code>, Dependabot or Renovate would surface and help remediate them.</p>
        </div>`);
      setTimeout(()=>window.Security.reveal("A06","The build pins several components to versions with published vulnerabilities. Attackers fingerprint these versions and fire matching public exploits — patching dependencies is one of the highest-leverage defences there is."),200);
    },
    auditView() {
      const log = window.Security.getAudit();
      window.openModal(`
        <div class="modal-head"><h3 style="margin:0">📊 Audit log (A09)</h3><button class="icon-btn" onclick="closeModal()">✕</button></div>
        <div class="modal-body">
          <p class="muted">Vendra records security-relevant events so you can SEE what a real app must monitor. A vulnerable app logs none of this — attacks then leave no trace.</p>
          <pre class="code">${log.length?window.escapeHtml(log.slice().reverse().map(e=>`${e.ts}  ${e.event}  ${e.detail}`).join("\n")):"(no events yet — trigger some demos first)"}</pre>
        </div>`);
      setTimeout(()=>window.Security.reveal("A09","This audit trail shows the failed logins, IDOR access and price tampering you triggered. Without logging and monitoring like this, those same events happen silently and breaches go undetected for months."),200);
    }
  };
  function alertBox(msg,type){ return `<div class="panel" style="padding:12px 14px;margin-bottom:14px;border-color:var(--${type==='error'?'danger':'warn'});background:color-mix(in srgb,var(--${type==='error'?'danger':'warn'}) 8%,transparent);font-size:.88rem">${msg}</div>`; }
  window.Auth = Auth;

  const routes = { login:renderLogin, register:renderRegister, account:renderAccount, sell:renderSell, security:renderSecurityLab };
  document.addEventListener("DOMContentLoaded", function(){
    const page=document.body.dataset.page;
    if(routes[page]) routes[page]();
  });
})();
