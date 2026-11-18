# Vendra — Insecure Marketplace (Security Portfolio Demo)

A **full-featured, browser-only e-commerce marketplace** that deliberately implements the
**OWASP Top 10 (2021)** as realistic flaws inside ordinary shop features. It's a portfolio
piece showing how everyday development shortcuts become security incidents — and what the
corrected code looks like.

> ⚠️ **Nothing here runs a real attack.** There is no server, no network calls, no real
> payments. All state lives in your browser's `localStorage`. The "vulnerabilities" are
> demonstrated by detecting the insecure *pattern* and showing an educational breakdown
> (weakness → real-world impact → secure fix, side by side). Payloads are defanged.

## Run it

Just open `index.html` in any modern browser. No build step, no dependencies, works from
`file://`. (A static server like `npx serve .` or VS Code Live Server also works.)

## Features (a real store)

- Home with hero, categories, deals and trending rails
- Catalog with live search, category/price/rating filters and sorting
- Product pages with specs, ratings, reviews and related items
- Cart, coupons, and a multi-step checkout
- Accounts: register / login / profile / order history
- Wishlist, seller listing tool, light & dark themes, toasts, modals, skeletons

## The OWASP Top 10, built in

| ID | Category | Where it lives | How to trigger |
|----|----------|----------------|----------------|
| A01 | Broken Access Control | `orders.html?id=…` (IDOR) | Change an order id in the URL |
| A02 | Cryptographic Failures | Accounts / order history | Account → "Reveal stored account data" |
| A03 | Injection (XSS) | Product reviews | Post a review containing an HTML tag |
| A04 | Insecure Design | Checkout | "Tamper with price" button |
| A05 | Security Misconfiguration | Any page | Append `?debug=1` |
| A06 | Vulnerable Components | Build manifest | Security Lab → "Dependency report" |
| A07 | Auth Failures | Login / register | Repeated bad logins; weak password |
| A08 | Integrity Failures | Coupon import | Security Lab → "Import coupon" |
| A09 | Logging & Monitoring | Audit log | Security Lab → "Audit log" |
| A10 | SSRF | Sell → image URL import | Enter an internal/metadata address |

The **Security Lab** (`security.html`) tracks which of the ten you've discovered, with
hints and quick-launch links.

## Project structure

```
index.html … security.html   12 pages (thin shells)
css/styles.css                design system (tokens, components, animations)
js/data.js                    product catalog + seed data
js/store.js                   localStorage persistence + app state
js/ui.js                      header/footer, toasts, modals, theme
js/security.js                OWASP catalog + educational "reveal" engine
js/app.js                     storefront page controllers
js/auth.js                    auth, account, sell, Security Lab controllers
```

Reset everything (footer → "Reset demo data") to restore the original seed state.
