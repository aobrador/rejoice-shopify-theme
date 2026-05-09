// ============================================
// REJOICE DANCE MINISTRY — Shopify Theme JS
// ============================================

document.addEventListener('DOMContentLoaded', () => {

  // ── Hamburger toggle ──────────────────────
  const hamburger = document.getElementById('hamburger');
  const navLinks  = document.getElementById('nav-links');
  const nav       = document.getElementById('nav');
  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
    document.addEventListener('click', e => {
      if (nav && !nav.contains(e.target)) navLinks.classList.remove('open');
    });
  }

  // ── Scroll-in animations ──────────────────
  const observer = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.05, rootMargin: '0px 0px -20px 0px' });

  document.querySelectorAll('.fade-in').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < window.innerHeight) {
      el.classList.add('visible');
    } else {
      observer.observe(el);
    }
  });

  // ── Particles (hero only) ─────────────────
  spawnParticles();

  // ── Promo code copy ───────────────────────
  const promoBtn = document.getElementById('promo-code-btn');
  if (promoBtn) {
    promoBtn.addEventListener('click', () => {
      const code = promoBtn.textContent.trim();
      navigator.clipboard.writeText(code).then(() => {
        showToast('🎉 Promo code ' + code + ' copied!');
      }).catch(() => {
        showToast('Code: ' + code + ' — copy it!');
      });
    });
  }

  // ── AJAX Add to Cart ──────────────────────
  const productForm = document.getElementById('product-form');
  if (productForm) {
    productForm.addEventListener('submit', async (e) => {
      const submitBtn = productForm.querySelector('[name="checkout"], [type="submit"]');
      // Only intercept "Add to Cart" — not the checkout button on the cart page
      if (submitBtn && submitBtn.name === 'checkout') return;
      e.preventDefault();
      const formData = new FormData(productForm);
      formData.set('sections', 'cart-icon-bubble');
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          body: formData
        });
        if (res.ok) {
          const data = await res.json();
          showToast('✨ ' + (data.title || 'Item') + ' added to cart!');
          updateCartCount();
        } else {
          showToast('⚠️ Could not add item — please try again.');
        }
      } catch (err) {
        productForm.submit(); // fallback
      }
    });
  }
});

// ── Fetch live cart count ─────────────────
async function updateCartCount() {
  try {
    const res  = await fetch('/cart.js');
    const cart = await res.json();
    const badges = document.querySelectorAll('.cart-badge');
    badges.forEach(b => b.textContent = cart.item_count || 0);
  } catch (e) { /* silent */ }
}

// ── Floating particles ──────────────────────
function spawnParticles() {
  const container = document.getElementById('particles');
  if (!container) return;
  const sizes  = [3, 5, 7, 4, 6];
  const delays = [0, 1.5, 3, 4.5, 2, 5, 0.8, 3.5];
  for (let i = 0; i < 20; i++) {
    const p = document.createElement('div');
    p.className = 'particle';
    const size  = sizes[i % sizes.length];
    const delay = delays[i % delays.length];
    const left  = Math.random() * 100;
    const dur   = 5 + Math.random() * 8;
    p.style.cssText = `
      width:${size}px; height:${size}px;
      left:${left}%;
      animation-delay:${delay}s;
      animation-duration:${dur}s;
    `;
    container.appendChild(p);
  }
}

// ── Toast notification ──────────────────────
function showToast(msg) {
  let t = document.getElementById('toast');
  if (!t) return;
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove('show'), 3200);
}
