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

  // ── Nav scroll shadow ─────────────────────────────────
  const navEl = document.getElementById('nav');
  function updateNavShadow() {
    if (!navEl) return;
    if (window.scrollY > 10) {
      navEl.classList.add('scrolled');
    } else {
      navEl.classList.remove('scrolled');
    }
  }
  window.addEventListener('scroll', updateNavShadow, { passive: true });
  updateNavShadow();

  // ── Back to top ───────────────────────────────────────
  const backToTop = document.getElementById('back-to-top');
  if (backToTop) {
    window.addEventListener('scroll', function() {
      backToTop.classList.toggle('visible', window.scrollY > 400);
    }, { passive: true });
    backToTop.addEventListener('click', function() {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  // ── Inline nav search ─────────────────────────────────
  const searchOpen  = document.getElementById('search-open');
  const searchClose = document.getElementById('search-close');
  const searchInput = document.getElementById('search-input');
  const navEl2      = document.getElementById('nav');
  function openSearch() {
    if (!navEl2) return;
    navEl2.classList.add('search-open');
    setTimeout(() => { if (searchInput) searchInput.focus(); }, 50);
  }
  function closeSearch() {
    if (!navEl2) return;
    navEl2.classList.remove('search-open');
    if (searchInput) searchInput.value = '';
  }
  if (searchOpen)  searchOpen.addEventListener('click', openSearch);
  if (searchClose) searchClose.addEventListener('click', closeSearch);
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') closeSearch();
  });

  // ── Button press ripple ───────────────────────────────
  document.querySelectorAll('.btn-primary, .btn-secondary, .btn-add').forEach(btn => {
    btn.addEventListener('mousedown', function() {
      this.style.transform = 'scale(0.97)';
    });
    btn.addEventListener('mouseup', function() {
      this.style.transform = '';
    });
    btn.addEventListener('mouseleave', function() {
      this.style.transform = '';
    });
  });
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
