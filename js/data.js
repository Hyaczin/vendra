/* ==========================================================================
   data.js — seed catalog for Vendra (browser-only demo marketplace)
   ========================================================================== */
window.CATEGORIES = [
  { id: "electronics", name: "Electronics", emoji: "🎧" },
  { id: "home",        name: "Home & Living", emoji: "🛋️" },
  { id: "fashion",     name: "Fashion", emoji: "👟" },
  { id: "beauty",      name: "Beauty", emoji: "💄" },
  { id: "sports",      name: "Sports & Outdoors", emoji: "⚽" },
  { id: "toys",        name: "Toys & Games", emoji: "🎲" },
  { id: "grocery",     name: "Grocery", emoji: "🥐" },
  { id: "books",       name: "Books", emoji: "📚" }
];

// price in whole currency units
window.PRODUCTS = [
  { id:"p1001", title:"Aurora Wireless Noise-Cancelling Headphones", cat:"electronics", price:179, old:249, emoji:"🎧", rating:4.7, reviews:1284, stock:23, brand:"Aurora", badge:"sale",
    desc:"Over-ear ANC headphones with 40h battery, plush memory-foam cushions and adaptive sound. Tuned for deep bass and crisp highs.",
    specs:{ "Battery":"40 hours", "Connectivity":"Bluetooth 5.3", "Weight":"254 g", "Warranty":"2 years" } },
  { id:"p1002", title:"Pulse Smartwatch Series 6 — AMOLED", cat:"electronics", price:129, old:159, emoji:"⌚", rating:4.5, reviews:842, stock:8, brand:"Pulse", badge:"low",
    desc:"1.8\" AMOLED always-on display, SpO2 + heart-rate sensors, 14-day battery, 100+ workout modes and water resistance to 50m.",
    specs:{ "Display":"1.8\" AMOLED", "Battery":"14 days", "Water":"5 ATM", "GPS":"Dual-band" } },
  { id:"p1003", title:"NovaBook 14 Ultralight Laptop (16GB/512GB)", cat:"electronics", price:849, old:999, emoji:"💻", rating:4.8, reviews:510, stock:15, brand:"Nova",
    desc:"14-inch 2.8K OLED, 16GB RAM, 512GB SSD, all-day battery in a 1.1kg magnesium chassis. Backlit keyboard and fingerprint login.",
    specs:{ "CPU":"8-core", "RAM":"16 GB", "Storage":"512 GB SSD", "Screen":"2.8K OLED" } },
  { id:"p1004", title:"Lumen 4K Streaming Webcam", cat:"electronics", price:59, old:79, emoji:"📷", rating:4.3, reviews:331, stock:40, brand:"Lumen", badge:"sale",
    desc:"4K30 / 1080p60 webcam with auto-framing, HDR and dual noise-cancelling mics. USB-C plug and play.",
    specs:{ "Resolution":"4K30", "FOV":"90°", "Mic":"Dual stereo", "Mount":"Clip + tripod" } },
  { id:"p2001", title:"Cloudrest Memory Foam Pillow (2-Pack)", cat:"home", price:39, old:55, emoji:"🛏️", rating:4.6, reviews:2210, stock:120, brand:"Cloudrest", badge:"sale",
    desc:"Ventilated gel-infused memory foam that keeps its shape. Hypoallergenic washable cover. Set of two queen pillows.",
    specs:{ "Material":"Gel memory foam", "Size":"Queen", "Pack":"2", "Cover":"Washable" } },
  { id:"p2002", title:"Terra Ceramic Non-Stick Cookware 10-Piece Set", cat:"home", price:119, old:189, emoji:"🍳", rating:4.4, reviews:678, stock:34, brand:"Terra", badge:"sale",
    desc:"PFOA-free ceramic coating, stay-cool handles, oven-safe to 230°C. Includes pots, pans and glass lids.",
    specs:{ "Pieces":"10", "Coating":"Ceramic", "Oven-safe":"230°C", "Induction":"Yes" } },
  { id:"p2003", title:"Halo Smart LED Floor Lamp", cat:"home", price:74, emoji:"💡", rating:4.2, reviews:189, stock:19, brand:"Halo", badge:"new",
    desc:"16M colors, app + voice control, music sync and scheduled scenes. Modern minimalist aluminum body.",
    specs:{ "Colors":"16M", "Control":"App/Voice", "Height":"150 cm", "Power":"18 W" } },
  { id:"p3001", title:"Stride Everyday Running Shoes", cat:"fashion", price:69, old:89, emoji:"👟", rating:4.5, reviews:1540, stock:65, brand:"Stride", badge:"sale",
    desc:"Responsive foam midsole, breathable knit upper and durable rubber outsole. Light enough for daily miles.",
    specs:{ "Drop":"8 mm", "Weight":"238 g", "Upper":"Knit", "Use":"Road" } },
  { id:"p3002", title:"Harbor Canvas Weekender Bag", cat:"fashion", price:54, emoji:"🧳", rating:4.6, reviews:423, stock:28, brand:"Harbor",
    desc:"Water-resistant waxed canvas with leather trim, padded laptop sleeve and shoe compartment. Cabin-size.",
    specs:{ "Volume":"35 L", "Material":"Waxed canvas", "Laptop":"15\"", "Strap":"Detachable" } },
  { id:"p3003", title:"Meridian Polarized Sunglasses", cat:"fashion", price:34, old:49, emoji:"🕶️", rating:4.1, reviews:276, stock:90, brand:"Meridian", badge:"sale",
    desc:"UV400 polarized lenses, lightweight TR90 frame and spring hinges. Comes with hard case and cloth.",
    specs:{ "Lens":"Polarized UV400", "Frame":"TR90", "Weight":"22 g", "Case":"Included" } },
  { id:"p4001", title:"Velvet Glow Vitamin C Serum", cat:"beauty", price:24, old:32, emoji:"🧴", rating:4.7, reviews:3120, stock:200, brand:"Velvet", badge:"sale",
    desc:"15% Vitamin C + hyaluronic acid + vitamin E. Brightens, hydrates and smooths. Cruelty-free, 30ml.",
    specs:{ "Volume":"30 ml", "Key active":"15% Vit C", "Skin type":"All", "Cruelty-free":"Yes" } },
  { id:"p4002", title:"Aria Rose Gold Hair Dryer", cat:"beauty", price:89, emoji:"💨", rating:4.4, reviews:512, stock:22, brand:"Aria", badge:"new",
    desc:"Ionic brushless motor, 3 heat + 2 speed settings, cool shot and magnetic concentrator. Fast, quiet drying.",
    specs:{ "Power":"1600 W", "Tech":"Ionic", "Settings":"3 heat/2 speed", "Weight":"320 g" } },
  { id:"p5001", title:"Summit 2-Person Backpacking Tent", cat:"sports", price:149, old:199, emoji:"⛺", rating:4.6, reviews:388, stock:17, brand:"Summit", badge:"sale",
    desc:"Freestanding double-wall tent, 2.1kg packed, waterproof 3000mm floor, color-coded poles for quick setup.",
    specs:{ "Capacity":"2", "Weight":"2.1 kg", "Waterproof":"3000 mm", "Seasons":"3" } },
  { id:"p5002", title:"Flux Adjustable Dumbbell (2–24 kg)", cat:"sports", price:199, emoji:"🏋️", rating:4.8, reviews:905, stock:11, brand:"Flux", badge:"low",
    desc:"Dial from 2kg to 24kg in seconds, replacing 15 sets of weights. Compact steel cradle included.",
    specs:{ "Range":"2–24 kg", "Increment":"2 kg", "Pair":"Single", "Cradle":"Yes" } },
  { id:"p6001", title:"Cosmo Build-It Space Station (820 pcs)", cat:"toys", price:64, old:79, emoji:"🚀", rating:4.9, reviews:1120, stock:48, brand:"Cosmo", badge:"sale",
    desc:"820-piece modular space station set with light-up dome, rover and 4 minifigures. Ages 8+.",
    specs:{ "Pieces":"820", "Age":"8+", "Minifigs":"4", "Lights":"Yes" } },
  { id:"p6002", title:"Riddle Realm Family Board Game", cat:"toys", price:29, emoji:"🎲", rating:4.5, reviews:642, stock:75, brand:"Riddle",
    desc:"Cooperative puzzle-adventure for 2–6 players, 45-min rounds, 60 scenario cards. A new story every night.",
    specs:{ "Players":"2–6", "Time":"45 min", "Age":"10+", "Cards":"60" } },
  { id:"p7001", title:"Artisan Dark Roast Coffee Beans 1kg", cat:"grocery", price:19, old:24, emoji:"☕", rating:4.7, reviews:2890, stock:300, brand:"Artisan", badge:"sale",
    desc:"Single-origin, small-batch roasted dark beans with notes of cocoa and toasted hazelnut. Whole bean, 1kg.",
    specs:{ "Weight":"1 kg", "Roast":"Dark", "Origin":"Single", "Form":"Whole bean" } },
  { id:"p7002", title:"Golden Harvest Organic Honey 500g", cat:"grocery", price:12, emoji:"🍯", rating:4.8, reviews:1455, stock:180, brand:"Golden",
    desc:"Raw, unfiltered wildflower honey. Certified organic, no additives. 500g squeeze jar.",
    specs:{ "Weight":"500 g", "Type":"Wildflower", "Organic":"Yes", "Raw":"Yes" } },
  { id:"p8001", title:"The Midnight Archive — Hardcover Novel", cat:"books", price:18, old:26, emoji:"📕", rating:4.6, reviews:980, stock:140, brand:"Quill", badge:"sale",
    desc:"A twisting literary thriller about a librarian who discovers books that rewrite reality. 416 pages.",
    specs:{ "Format":"Hardcover", "Pages":"416", "Language":"English", "Genre":"Thriller" } },
  { id:"p8002", title:"Clean Code Foundations — Developer Guide", cat:"books", price:33, emoji:"📗", rating:4.7, reviews:655, stock:60, brand:"DevPress", badge:"new",
    desc:"Practical guide to writing maintainable, secure software with real-world examples and checklists.",
    specs:{ "Format":"Paperback", "Pages":"512", "Level":"All", "Edition":"3rd" } }
];

// Seed reviews (display only)
window.SEED_REVIEWS = {
  p1001: [
    { user:"Mariah K.", rating:5, date:"2026-09-12", text:"Noise cancelling is unreal on flights. Battery easily lasts a week of commuting." },
    { user:"Deon P.", rating:4, date:"2026-08-30", text:"Great sound, slightly tight at first but loosened up. Worth the sale price." }
  ],
  p1003: [
    { user:"Aisha R.", rating:5, date:"2026-10-02", text:"The OLED screen is gorgeous and it's feather light. Perfect for travel." }
  ],
  p4001: [
    { user:"Tomás L.", rating:5, date:"2026-07-19", text:"Skin looks brighter after two weeks. No sticky feel." },
    { user:"Grace W.", rating:4, date:"2026-07-01", text:"Good serum, wish the bottle were bigger." }
  ]
};
