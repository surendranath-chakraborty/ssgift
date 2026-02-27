/**
 * SS GIFT — Home Page Renderer
 */
const HomePage = (() => {

  const render = () => {
    const featured = Store.getProducts().slice(0, 8);

    return `
      <!-- HERO -->
      <section class="hero">
        <div class="hero__left">
          <div class="hero__tag fade-up">Premium Gift Shop</div>
          <h1 class="hero__title fade-up">Where Love<br><em>Finds Its Form</em></h1>
          <p class="hero__sub fade-up">Handpicked, thoughtfully curated gifts for every emotion — birthdays, anniversaries, love, and everything in between.</p>
          <div class="hero__btns fade-up">
            <button class="btn btn--primary btn--lg" onclick="Router.go('shop')">
              <i class="fas fa-gift"></i> Explore Gifts
            </button>
            <button class="btn btn--outline btn--lg" onclick="Router.go('shop', {cat:'Couple Gifts'})">
              💑 Couple Gifts
            </button>
          </div>
          <div class="hero__stats fade-up">
            <div><div class="hero__stat-num">500+</div><div class="hero__stat-label">Products</div></div>
            <div><div class="hero__stat-num">2K+</div><div class="hero__stat-label">Happy Customers</div></div>
            <div><div class="hero__stat-num">4.9★</div><div class="hero__stat-label">Rating</div></div>
          </div>
        </div>
        <div class="hero__visual">
          <div class="hero__gift-box">
            <span class="hero__gift-bow">🎀</span>
            🎁
            <span class="hero__gift-tag">Premium Gift</span>
          </div>
        </div>
      </section>

      <!-- MARQUEE -->
      <div class="marquee-wrap">
        <div class="marquee">
          <span>Free Delivery on ₹499+</span>
          <span>Handcrafted Gifts</span>
          <span>Made With Love</span>
          <span>Premium Wrapping</span>
          <span>Same Day Delivery</span>
          <span>100% Original</span>
          <span>Free Delivery on ₹499+</span>
          <span>Handcrafted Gifts</span>
          <span>Made With Love</span>
          <span>Premium Wrapping</span>
          <span>Same Day Delivery</span>
          <span>100% Original</span>
        </div>
      </div>

      <!-- CATEGORIES -->
      <section class="section">
        <div class="section-head">
          <span class="section-tag">Browse By</span>
          <h2 class="section-title">Shop by <em>Category</em></h2>
        </div>
        <div class="cats-grid">
          ${CATEGORIES.map(c => {
            const count = Store.getProducts().filter(p => p.cat === c.name).length;
            return `<div class="cat-card fade-up" onclick="Router.go('shop', {cat:'${c.name}'})">
              <span class="cat-card__emoji">${c.emoji}</span>
              <div class="cat-card__name">${c.name}</div>
              <div class="cat-card__count">${count} items</div>
            </div>`;
          }).join('')}
        </div>
      </section>

      <!-- FEATURED PRODUCTS -->
      <section class="section section--alt">
        <div class="section-head">
          <span class="section-tag">Trending Now</span>
          <h2 class="section-title">Featured <em>Gifts</em></h2>
        </div>
        <div class="products-grid products-grid--4">
          ${featured.map(p => UI.productCard(p)).join('')}
        </div>
        <div class="text-center mt-4">
          <button class="btn btn--outline btn--lg" onclick="Router.go('shop')">
            View All Products <i class="fas fa-arrow-right"></i>
          </button>
        </div>
      </section>

      <!-- WHY US -->
      <section class="section">
        <div class="section-head">
          <span class="section-tag">Our Promise</span>
          <h2 class="section-title">Why Choose <em>SS GIFT</em></h2>
        </div>
        <div class="why-grid">
          ${[
            { icon:'💎', title:'Handpicked Quality',         desc:'Every product is carefully selected to ensure premium quality that matches your love and emotions.' },
            { icon:'💝', title:'Love-Infused Packaging',     desc:'Our signature gift wrapping with personalised notes makes every delivery feel extra special.' },
            { icon:'🚀', title:'Same-Day Delivery',          desc:'Last-minute surprises covered! Order before 2PM for same-day delivery within city limits.' },
          ].map(w => `
            <div class="why-card fade-up">
              <div class="why-card__icon">${w.icon}</div>
              <h3 class="why-card__title">${w.title}</h3>
              <p class="why-card__desc">${w.desc}</p>
            </div>`).join('')}
        </div>
      </section>

      <!-- TESTIMONIALS -->
      <section class="section section--alt">
        <div class="section-head">
          <span class="section-tag">Testimonials</span>
          <h2 class="section-title">What Our <em>Customers Say</em></h2>
        </div>
        <div class="testi-grid">
          ${[
            { avatar:'👩', name:'Priya Sharma',  loc:'Kolkata',  rating:5, text:'"Ordered a couple hamper for our anniversary. The packaging was absolutely gorgeous and delivery was on time!"' },
            { avatar:'👨', name:'Rahul Das',     loc:'Durgapur', rating:5, text:'"Best gift shop! Ordered a birthday hamper for my girlfriend — she absolutely loved it. Will order again!"' },
            { avatar:'👩', name:'Sneha Roy',     loc:'Asansol',  rating:4, text:'"Personalised name necklace was beautiful. Quality is top notch and the WhatsApp support was very helpful."' },
          ].map(t => `
            <div class="testi-card fade-up">
              <div class="testi-card__stars">${'★'.repeat(t.rating)}${'☆'.repeat(5-t.rating)}</div>
              <p class="testi-card__text">${t.text}</p>
              <div class="testi-card__author">
                <div class="testi-card__avatar">${t.avatar}</div>
                <div>
                  <div class="testi-card__name">${t.name}</div>
                  <div class="testi-card__loc">${t.loc}</div>
                </div>
              </div>
            </div>`).join('')}
        </div>
      </section>

      <!-- NEWSLETTER -->
      <section class="newsletter">
        <h2>Get Exclusive Offers</h2>
        <p>Subscribe for early access to new arrivals and special discounts</p>
        <div class="newsletter__form">
          <input type="email" id="newsletterEmail" placeholder="Enter your email address"/>
          <button onclick="UI.subscribeNewsletter()">Subscribe Now</button>
        </div>
      </section>

      <!-- FOOTER -->
      <footer>
        <div class="footer__grid">
          <div class="footer__brand">
            <a class="logo" href="#">SS <span>GIFT</span></a>
            <p>Curated with love, delivered with care. The perfect gift for every moment of your beautiful journey together.</p>
            <div class="footer__socials">
              <button class="footer__social-btn" onclick="window.open('https://instagram.com')"><i class="fab fa-instagram"></i></button>
              <button class="footer__social-btn" onclick="window.open('https://facebook.com')"><i class="fab fa-facebook"></i></button>
              <button class="footer__social-btn" onclick="window.open('https://wa.me/${CONFIG.WHATSAPP_NUM}')"><i class="fab fa-whatsapp"></i></button>
            </div>
          </div>
          <div class="footer__col">
            <h4>Shop</h4>
            <a href="#" onclick="Router.go('shop')">All Products</a>
            ${CATEGORIES.map(c => `<a href="#" onclick="Router.go('shop',{cat:'${c.name}'})">${c.name}</a>`).join('')}
          </div>
          <div class="footer__col">
            <h4>Help</h4>
            <a href="#" onclick="Router.go('account')">Track Order</a>
            <a href="#">Return Policy</a>
            <a href="#">FAQ</a>
            <a href="#" onclick="window.open('https://wa.me/${CONFIG.WHATSAPP_NUM}?text=Hi! I need help.')">WhatsApp Us</a>
          </div>
          <div class="footer__col">
            <h4>Contact</h4>
            <a href="tel:+918967882790">📞 +91 8967882790</a>
            <a href="mailto:ssgift@gmail.com">📧 ssgift@gmail.com</a>
            <a href="#">📍 West Bengal, India</a>
          </div>
        </div>
        <div class="footer__bottom">
          © ${new Date().getFullYear()} SS GIFT. Made with ❤️ for every love story.
        </div>
      </footer>`;
  };

  return { render };
})();