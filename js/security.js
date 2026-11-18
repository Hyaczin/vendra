/* ==========================================================================
   security.js — OWASP Top 10 (2021) demonstration engine for Vendra

   IMPORTANT / BY DESIGN:
   This file catalogs intentionally-insecure patterns that are built into the
   demo so visitors can SEE why they are dangerous. Nothing here performs a
   real attack. When a page notices one of these patterns being exercised
   (e.g. a user edits an order id in the URL, or submits a price the page
   trusted blindly), it calls Security.reveal() to pop an educational modal
   that explains the weakness, the real-world impact, and the fix — with
   vulnerable vs. secure code side by side.

   This is a teaching artifact for a cybersecurity portfolio.
   ========================================================================== */
(function () {

  const OWASP = [
    {
      id: "A01",
      name: "Broken Access Control",
      severity: "crit",
      icon: "🚪",
      where: "Order details page (orders.html) trusts the id in the URL.",
      short: "The app shows whatever order id is in the URL without checking it belongs to you (IDOR).",
      impact: "An attacker increments or guesses order ids and reads strangers' names, addresses and purchases. In a real store this leaks PII at scale and can enable fraud or account takeover.",
      howToFind: "Open one of your orders, then change the id in the address bar to a different order's id.",
      vuln:
`// orders.html — renders ANY order for ANY visitor
function showOrder(id) {
  const order = db.getOrder(id);   // no owner check!
  render(order);                   // trusts the URL
}`,
      fix:
`// Enforce ownership on the server for every request
function showOrder(id, session) {
  const order = db.getOrder(id);
  if (!order || order.userId !== session.userId) {
    return deny(403);              // never leak others' data
  }
  render(order);
}`,
      refs: "OWASP A01:2021 · CWE-639 Authorization Bypass Through User-Controlled Key"
    },
    {
      id: "A02",
      name: "Cryptographic Failures",
      severity: "high",
      icon: "🔑",
      where: "Accounts are saved with plaintext passwords; 'card' kept in order history.",
      short: "Passwords are stored and compared in plaintext, and card numbers are kept verbatim.",
      impact: "If the datastore leaks, every password is instantly usable — and reused on victims' email and banking. Storing full card data violates PCI-DSS and multiplies breach damage.",
      howToFind: "Open the account page and click 'Reveal stored account data', or inspect localStorage.",
      vuln:
`// Stored exactly as typed — readable by anyone with DB access
user.password = req.body.password;      // plaintext
order.card    = req.body.cardNumber;    // full PAN retained`,
      fix:
`// Hash with a slow, salted algorithm; never store raw cards
user.passwordHash = await argon2.hash(password);
// verify:
await argon2.verify(user.passwordHash, attempt);
// cards: tokenize via the payment processor, store only a token`,
      refs: "OWASP A02:2021 · CWE-256 Plaintext Storage · CWE-312 Cleartext Sensitive Data"
    },
    {
      id: "A03",
      name: "Injection (XSS)",
      severity: "high",
      icon: "💉",
      where: "Product reviews render submitted text as raw HTML.",
      short: "A review is inserted into the page with innerHTML, so markup in it becomes live DOM.",
      impact: "A stored cross-site-scripting payload runs in every shopper's browser — stealing sessions, rewriting prices, or redirecting checkout. One malicious review can hit thousands of users.",
      howToFind: "On any product page, post a review containing an HTML tag (the demo shows a harmless marker instead of executing it).",
      vuln:
`// Review text dropped straight into the DOM
reviewEl.innerHTML = review.text;   // markup executes`,
      fix:
`// Treat user input as TEXT, never markup
reviewEl.textContent = review.text; // browser escapes it
// or escape + sanitize (DOMPurify) if HTML is required`,
      refs: "OWASP A03:2021 · CWE-79 Cross-site Scripting"
    },
    {
      id: "A04",
      name: "Insecure Design",
      severity: "high",
      icon: "📐",
      where: "Checkout trusts the price and totals sent by the browser.",
      short: "The client computes the order total; the 'server' accepts whatever price it is handed.",
      impact: "A shopper edits the request and buys a laptop for $1. Because price integrity was never part of the design, no single code fix closes it — the whole flow must be rethought.",
      howToFind: "At checkout, click 'Tamper with price (demo)' to submit an altered total.",
      vuln:
`// Browser is the source of truth for money
const total = cart.reduce((t,i)=> t + i.clientPrice*i.qty, 0);
placeOrder({ total });   // server just stores it`,
      fix:
`// Server re-prices from its own catalog every time
let total = 0;
for (const line of order.items) {
  const p = catalog.price(line.productId); // trusted source
  total += p * line.qty;
}
charge(total); // ignore any client-supplied amount`,
      refs: "OWASP A04:2021 · CWE-602 Client-Side Enforcement of Server-Side Security"
    },
    {
      id: "A05",
      name: "Security Misconfiguration",
      severity: "med",
      icon: "⚙️",
      where: "A debug panel is shipped to production and reachable via ?debug=1.",
      short: "Verbose debug mode, left enabled, exposes internal state and config to anyone.",
      impact: "Attackers map your stack, see internal ids, feature flags and seeded secrets — a free blueprint for the next attack. Default/debug settings in production are a leading breach cause.",
      howToFind: "Add ?debug=1 to any page URL, or click 'Open debug panel' in the lab.",
      vuln:
`// Debug flag honored in production builds
if (query.debug) {
  render(appState);            // dumps everything
  console.log(config.secrets); // internal config leaked
}`,
      fix:
`// Strip debug paths from prod; gate behind real auth
if (ENV === 'development') enableDebug();
// remove verbose errors, default creds, and unused features
// ship hardened, reviewed configuration only`,
      refs: "OWASP A05:2021 · CWE-16 Configuration · CWE-489 Active Debug Code"
    },
    {
      id: "A06",
      name: "Vulnerable & Outdated Components",
      severity: "med",
      icon: "📦",
      where: "The app advertises a pinned, years-old library with known CVEs.",
      short: "A dependency manifest pins outdated packages carrying published vulnerabilities.",
      impact: "Known CVEs are the easiest way in — automated scanners find the version string and fire a matching public exploit. You inherit every unpatched flaw in code you didn't write.",
      howToFind: "Open the 'Dependency report' in the lab to see flagged versions.",
      vuln:
`// package.json — frozen on vulnerable versions
"dependencies": {
  "ui-kit": "1.0.3",      // CVE-2023-XXXX (demo)
  "json-parse": "0.2.1",  // prototype pollution (demo)
  "img-resize": "2.4.0"   // RCE advisory (demo)
}`,
      fix:
`// Track, update and audit continuously
// - npm audit / Dependabot / Renovate in CI
// - pin AND patch; remove unused deps
// - subscribe to advisories for what you ship`,
      refs: "OWASP A06:2021 · CWE-1104 Use of Unmaintained Third Party Components"
    },
    {
      id: "A07",
      name: "Identification & Authentication Failures",
      severity: "high",
      icon: "🔓",
      where: "Login allows trivial passwords, unlimited attempts, and leaks which field is wrong.",
      short: "No rate limiting, weak-password acceptance, and distinct 'user not found' vs 'wrong password' messages.",
      impact: "Credential stuffing and brute force run unchecked, and verbose errors confirm valid emails. Combined with password reuse, accounts fall in minutes.",
      howToFind: "Try logging in with a wrong password repeatedly, or register with the password '123'.",
      vuln:
`// Unlimited tries + oracle in the error text
if (!user)            return err("No account with that email");
if (user.pw !== pw)   return err("Incorrect password");
// accepts any password length, no lockout, no MFA`,
      fix:
`// Generic errors, throttling, strong-password policy, MFA
if (!user || !verify(user.hash, pw))
  return err("Invalid email or password"); // no oracle
rateLimit(ip); enforceStrength(pw); offerMFA(user);`,
      refs: "OWASP A07:2021 · CWE-307 Improper Restriction of Auth Attempts"
    },
    {
      id: "A08",
      name: "Software & Data Integrity Failures",
      severity: "med",
      icon: "🧩",
      where: "A 'plugin'/coupon blob is loaded from untrusted input without integrity checks.",
      short: "The app accepts and applies serialized data / third-party code without verifying it.",
      impact: "Unsigned updates or deserialized objects let an attacker swap in malicious logic (supply-chain / insecure deserialization). Trust without verification means tampered data becomes trusted data.",
      howToFind: "In the lab, 'import' a crafted coupon blob and watch it be trusted blindly.",
      vuln:
`// Trusts whatever it is handed
const coupon = JSON.parse(userBlob);   // no validation
applyDiscount(coupon.percent);         // could be 100%`,
      fix:
`// Verify integrity + validate shape before use
verifySignature(blob, publisherPublicKey);
const coupon = schema.parse(JSON.parse(blob)); // bounded
// use SRI for scripts; signed, checksummed updates only`,
      refs: "OWASP A08:2021 · CWE-502 Deserialization of Untrusted Data"
    },
    {
      id: "A09",
      name: "Security Logging & Monitoring Failures",
      severity: "med",
      icon: "📊",
      where: "Security-relevant events (failed logins, price tampering) are never recorded.",
      short: "Nothing logs the suspicious actions, so an attack leaves no trail.",
      impact: "Breaches go undetected for months. Without logs there's no alerting, no forensics, and no way to scope the damage after the fact — the average breach dwells ~200 days unnoticed.",
      howToFind: "Trigger a few other findings, then open the lab's 'Audit log' — the demo logs them so you can see what SHOULD exist.",
      vuln:
`// Critical events happen silently
login(user, pw);          // success/failure: no log
applyAdminAction(req);    // no audit trail
// no alerts, no retention, no monitoring`,
      fix:
`// Log security events with context, centrally + alert
audit.log('auth.fail', { email, ip, ts });
audit.log('order.price_mismatch', { orderId, delta });
// ship to SIEM, alert on anomalies, retain & protect logs`,
      refs: "OWASP A09:2021 · CWE-778 Insufficient Logging"
    },
    {
      id: "A10",
      name: "Server-Side Request Forgery (SSRF)",
      severity: "med",
      icon: "🌐",
      where: "The 'import product image from URL' feature would fetch any URL the user gives.",
      short: "A URL field is fetched as-is, with no allow-list — in a real backend it could reach internal systems.",
      impact: "On a real server, SSRF lets an attacker point the fetch at internal metadata endpoints or private services (e.g. cloud credentials), pivoting into the internal network. Here it's simulated safely.",
      howToFind: "On the Sell page, use 'Import image from URL' with an internal-looking address (the demo refuses to fetch and explains why).",
      vuln:
`// Server fetches whatever URL the user supplies
const img = await fetch(req.body.imageUrl); // no checks
store(img); // could hit http://169.254.169.254/...`,
      fix:
`// Allow-list hosts, block internal ranges, no redirects
if (!isAllowedHost(url)) return deny();
assertNotPrivateIP(await resolve(url));
fetchWithTimeout(url, { redirect: 'error' });`,
      refs: "OWASP A10:2021 · CWE-918 Server-Side Request Forgery"
    }
  ];

  const byId = {};
  OWASP.forEach(o => byId[o.id] = o);

  // simple in-memory + persisted audit log (demonstrates A09 by contrast)
  function auditLog(event, detail) {
    const s = window.Store.state;
    if (!s._audit) s._audit = [];
    s._audit.push({ event, detail: detail || "", ts: new Date().toISOString() });
    if (s._audit.length > 200) s._audit.shift();
    window.Store.save ? null : null; // save handled by caller flows
    try { localStorage.setItem("vendra_audit", JSON.stringify(s._audit)); } catch (e) {}
  }
  function getAudit() {
    try { return JSON.parse(localStorage.getItem("vendra_audit") || "[]"); } catch (e) { return []; }
  }

  const sevLabel = { crit:"Critical", high:"High", med:"Medium" };

  function reveal(id, extra) {
    const o = byId[id];
    if (!o) return;
    const firstTime = window.Store.markFound(id);
    auditLog("owasp.revealed", id + " " + o.name);

    const progress = window.Store.foundCount();
    const html = `
      <div class="finding-hero">
        <div class="ring">${o.icon}</div>
        <div>
          <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap">
            <span class="sev ${o.severity}">${sevLabel[o.severity]}</span>
            <span class="chip" style="background:rgba(255,255,255,.12);color:#fff;border:none">${o.id}</span>
            ${firstTime ? '<span class="chip" style="background:var(--success);color:#fff;border:none">New find!</span>' : ''}
          </div>
          <h2 style="margin:.3em 0 0;color:#fff">${o.name}</h2>
        </div>
      </div>
      <div class="modal-body">
        ${extra ? `<div class="panel" style="background:var(--brand-50);border-color:var(--brand-200);margin-bottom:16px"><b>What just happened:</b> ${window.escapeHtml(extra)}</div>` : ""}
        <p style="margin-top:0"><b>The weak practice:</b> ${o.short}</p>
        <p><b>Where in Vendra:</b> ${o.where}</p>
        <p><b>Why it matters:</b> ${o.impact}</p>

        <div style="display:grid;grid-template-columns:1fr 1fr;gap:14px;margin:18px 0">
          <div>
            <div class="chip" style="color:var(--danger);border-color:var(--danger);margin-bottom:8px">✗ Vulnerable</div>
            <pre class="code"><code>${colorize(o.vuln)}</code></pre>
          </div>
          <div>
            <div class="chip" style="color:var(--success);border-color:var(--success);margin-bottom:8px">✓ Secure</div>
            <pre class="code"><code>${colorize(o.fix)}</code></pre>
          </div>
        </div>

        <p class="muted" style="font-size:.82rem">${o.refs}</p>
        <div style="display:flex;justify-content:space-between;align-items:center;gap:12px;margin-top:16px;flex-wrap:wrap">
          <span class="muted">Security Lab progress: <b>${progress}/10</b> found</span>
          <div style="display:flex;gap:10px">
            <a class="btn btn-ghost" href="security.html">Open Security Lab</a>
            <button class="btn btn-primary" onclick="closeModal()">Got it</button>
          </div>
        </div>
      </div>`;
    window.openModal(html);
    if (firstTime) window.toast("🛡️ Vulnerability found: " + o.name, "warn");
  }

  function colorize(code) {
    // lightweight highlighter for the side-by-side blocks
    return window.escapeHtml(code)
      .replace(/(\/\/[^\n]*)/g, '<span class="cm">$1</span>')
      .replace(/\b(no owner check!|plaintext|full PAN retained|markup executes|could be 100%|dumps everything)\b/g, '<span class="bad">$1</span>');
  }

  window.Security = {
    list: OWASP,
    byId,
    reveal,
    auditLog,
    getAudit,
    sevLabel
  };

  // Global: honor ?debug=1 anywhere (A05 demonstration)
  document.addEventListener("DOMContentLoaded", function () {
    if (new URLSearchParams(location.search).get("debug") === "1") {
      setTimeout(() => {
        reveal("A05", "You enabled debug mode by adding ?debug=1 to the URL. A real app would now be exposing internal state and configuration to anyone who guesses this flag.");
      }, 600);
    }
  });
})();
