/**
 * SS GIFT — Seed Data
 * Default products, categories and coupons.
 */
const SEED_PRODUCTS = [
  { id:1,  name:'Matching Couple Mug Set',       cat:'Couple Gifts',  price:499,  original:799,  emoji:'☕', stock:15, rating:4.8, reviews:124, desc:'Beautiful matching mugs for couples. Perfect morning ritual gift made with love.', tags:['couple','mug','gift'] },
  { id:2,  name:'Love Letter Keepsake Box',       cat:'Couple Gifts',  price:699,  original:999,  emoji:'💌', stock:8,  rating:4.9, reviews:87,  desc:'Handcrafted wooden box for love letters and memories. Engraved with a heart motif.', tags:['love','box','personalised'] },
  { id:3,  name:'Couple Keychain Set',            cat:'Couple Gifts',  price:299,  original:499,  emoji:'🗝️', stock:30, rating:4.7, reviews:203, desc:'Interlocking keychain set — two hearts that fit together perfectly.', tags:['keychain','couple'] },
  { id:4,  name:'Heart-Shaped Chocolate Box',     cat:'Couple Gifts',  price:449,  original:649,  emoji:'🍫', stock:30, rating:4.8, reviews:156, desc:'Heart-shaped box filled with assorted milk and dark Belgian chocolates.', tags:['chocolate','heart','couple'] },
  { id:5,  name:'Star Map Print',                 cat:'Birthday',      price:899,  original:1299, emoji:'🌟', stock:20, rating:5.0, reviews:56,  desc:'Custom star map of the night sky on any special date, printed on premium paper.', tags:['star','map','birthday','personalised'] },
  { id:6,  name:'Birthday Hamper Deluxe',         cat:'Birthday',      price:1299, original:1799, emoji:'🎂', stock:12, rating:4.6, reviews:94,  desc:'Curated birthday hamper with chocolates, scented candle, mug and a greeting card.', tags:['hamper','birthday','chocolate'] },
  { id:7,  name:'Glitter Balloon Set (10pc)',     cat:'Birthday',      price:249,  original:399,  emoji:'🎈', stock:50, rating:4.5, reviews:178, desc:'Shimmering gold and rose gold balloons. Perfect birthday decoration set.', tags:['balloon','birthday','decoration'] },
  { id:8,  name:'Glow Jar Night Lamp',            cat:'Birthday',      price:549,  original:799,  emoji:'🏮', stock:16, rating:4.9, reviews:88,  desc:'Handcrafted glow jar with LED fairy lights. Creates a magical warm ambiance.', tags:['lamp','glow','birthday','decoration'] },
  { id:9,  name:'Crystal Photo Frame',            cat:'Anniversary',   price:799,  original:1199, emoji:'🖼️', stock:18, rating:4.8, reviews:67,  desc:'Elegant crystal-clear photo frame with gold trim. Holds one 5x7 photo beautifully.', tags:['frame','photo','anniversary'] },
  { id:10, name:'Eternal Preserved Rose',         cat:'Anniversary',   price:1499, original:1999, emoji:'🌹', stock:6,  rating:4.9, reviews:43,  desc:'A real rose preserved to last for years. Comes in a luxury glass dome — timeless.', tags:['rose','eternal','anniversary','romantic'] },
  { id:11, name:'Personalised Memory Book',       cat:'Anniversary',   price:999,  original:1499, emoji:'📖', stock:10, rating:5.0, reviews:29,  desc:'Handbound memory book with personalised cover. Fill it with your best shared moments.', tags:['book','memory','personalised','anniversary'] },
  { id:12, name:'Name Necklace (Gold)',           cat:'Personalised',  price:599,  original:899,  emoji:'📿', stock:25, rating:4.7, reviews:312, desc:'Delicate 18K gold-plated name necklace. Custom engraved with any name up to 10 characters.', tags:['necklace','personalised','jewellery','gold'] },
  { id:13, name:'Custom Couple Portrait',        cat:'Personalised',  price:1199, original:1599, emoji:'🎨', stock:99, rating:4.8, reviews:76,  desc:'Digital illustration of you and your partner in a dreamy art style. Delivered as a print.', tags:['portrait','art','personalised','couple'] },
  { id:14, name:'Engraved Locket',               cat:'Personalised',  price:849,  original:1199, emoji:'🔮', stock:14, rating:4.6, reviews:54,  desc:'Silver-toned locket with custom engraving on the back. Holds one small photo inside.', tags:['locket','engraved','personalised','jewellery'] },
  { id:15, name:'Luxury Chocolate Box',          cat:'Hampers',       price:699,  original:999,  emoji:'🍬', stock:22, rating:4.7, reviews:189, desc:'Assorted premium Belgian chocolates in a beautiful rose gold gift box.', tags:['chocolate','hamper','luxury'] },
  { id:16, name:'Spa & Self-Care Kit',           cat:'Hampers',       price:1599, original:2199, emoji:'🛁', stock:9,  rating:4.8, reviews:63,  desc:'Lavender bath salts, rose face mask, essential oils and scented candles.', tags:['spa','selfcare','hamper'] },
  { id:17, name:'Morning Bliss Hamper',          cat:'Hampers',       price:999,  original:1399, emoji:'🌅', stock:11, rating:4.5, reviews:47,  desc:'Artisan coffee, honey, cookies and a personalised mug — perfect morning gift.', tags:['coffee','hamper','morning'] },
  { id:18, name:'Red Rose Bouquet (12)',         cat:'Flowers',       price:599,  original:799,  emoji:'🌹', stock:20, rating:4.9, reviews:234, desc:'Twelve fresh red roses with baby breath, wrapped in premium satin ribbon.', tags:['rose','bouquet','flower','red'] },
  { id:19, name:'Sunflower Basket',             cat:'Flowers',       price:499,  original:699,  emoji:'🌻', stock:15, rating:4.7, reviews:108, desc:'Cheerful sunflower basket arrangement — guaranteed to brighten any day.', tags:['sunflower','basket','flower'] },
  { id:20, name:'Tulip Arrangement',            cat:'Flowers',       price:649,  original:899,  emoji:'🌷', stock:12, rating:4.6, reviews:72,  desc:'Pastel tulips in a beautiful ceramic vase. Available in pink, purple and white.', tags:['tulip','flower','arrangement'] },
];

const SEED_COUPONS = [
  { code:'LOVE10', type:'percent', value:10, active:true },
  { code:'SS20',   type:'percent', value:20, active:true },
  { code:'GIFT15', type:'percent', value:15, active:true },
  { code:'FLAT50', type:'flat',    value:50, active:true },
];

const CATEGORIES = [
  { name:'Couple Gifts', emoji:'💑' },
  { name:'Birthday',     emoji:'🎂' },
  { name:'Anniversary',  emoji:'💍' },
  { name:'Personalised', emoji:'✨' },
  { name:'Hampers',      emoji:'🧺' },
  { name:'Flowers',      emoji:'💐' },
];