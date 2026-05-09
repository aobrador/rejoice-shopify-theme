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

      // Button loading state
      const atcBtn = document.getElementById('add-to-cart-btn');
      const stickyBtn = document.getElementById('sticky-atc-btn');
      if (atcBtn) { atcBtn.disabled = true; atcBtn.textContent = 'Adding…'; }
      if (stickyBtn) { stickyBtn.disabled = true; stickyBtn.textContent = 'Adding…'; }

      const formData = new FormData(productForm);
      try {
        const res = await fetch('/cart/add.js', {
          method: 'POST',
          headers: { 'X-Requested-With': 'XMLHttpRequest' },
          body: formData
        });
        if (res.ok) {
          openCartDrawer();
        } else {
          showToast('⚠️ Could not add item — please try again.');
        }
      } catch (err) {
        productForm.submit(); // fallback
      } finally {
        if (atcBtn) { atcBtn.disabled = false; atcBtn.innerHTML = 'Add to Cart — <span id="btn-price">' + (atcBtn.dataset.price || '') + '</span>'; }
        if (stickyBtn) { stickyBtn.disabled = false; stickyBtn.textContent = 'Add to Cart'; }
      }
    });
  }

  // ── Cart drawer controls ──────────────────
  const drawerClose   = document.getElementById('cart-drawer-close');
  const drawerOverlay = document.getElementById('cart-drawer-overlay');
  const cartNavLink   = document.querySelector('.nav-cart');

  if (drawerClose)   drawerClose.addEventListener('click', closeCartDrawer);
  if (drawerOverlay) drawerOverlay.addEventListener('click', closeCartDrawer);

  // Intercept nav cart icon to open drawer instead of navigating
  if (cartNavLink) {
    cartNavLink.addEventListener('click', e => {
      e.preventDefault();
      openCartDrawer();
    });
  }

  // Close on Escape
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') closeCartDrawer();
  });

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

// ── Cart Drawer ───────────────────────────
function moneyFormat(cents) {
  return '$' + (cents / 100).toFixed(2).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function openCartDrawer() {
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer) return;
  drawer.classList.add('open');
  drawer.setAttribute('aria-hidden', 'false');
  if (overlay) overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  loadCartDrawer();
}

function closeCartDrawer() {
  const drawer  = document.getElementById('cart-drawer');
  const overlay = document.getElementById('cart-drawer-overlay');
  if (!drawer) return;
  drawer.classList.remove('open');
  drawer.setAttribute('aria-hidden', 'true');
  if (overlay) overlay.classList.remove('open');
  document.body.style.overflow = '';
}

async function loadCartDrawer() {
  const body   = document.getElementById('cart-drawer-body');
  const footer = document.getElementById('cart-drawer-footer');
  const countEl= document.getElementById('drawer-item-count');
  if (!body) return;

  // Show spinner
  body.innerHTML = '<div class="cart-drawer-loading"><div class="drawer-spinner"></div></div>';
  if (footer) footer.style.display = 'none';

  try {
    const res  = await fetch('/cart.js');
    const cart = await res.json();

    // Update nav badges
    document.querySelectorAll('.cart-badge').forEach(b => b.textContent = cart.item_count || 0);
    if (countEl) countEl.textContent = cart.item_count || 0;

    if (cart.item_count === 0) {
      body.innerHTML = `
        <div class="drawer-empty">
          <div class="drawer-empty-icon">◆</div>
          <h4>Your cart is empty</h4>
          <p>Looks like you haven't added anything yet.</p>
          <a href="/collections/all" class="btn-primary" style="display:inline-block;padding:12px 28px;border-radius:50px;">Shop Now</a>
        </div>`;
      return;
    }

    // Render items
    body.innerHTML = cart.items.map(item => `
      <div class="drawer-item">
        <a href="${item.url}">
          <img class="drawer-item-img"
               src="${item.image ? item.image.replace(/(\.[^.]+)$/, '_160x160$1') : ''}"
               alt="${item.product_title}" />
        </a>
        <div class="drawer-item-info">
          <div class="drawer-item-title">${item.product_title}</div>
          ${item.variant_title && item.variant_title !== 'Default Title' ? `<div class="drawer-item-variant">${item.variant_title}</div>` : ''}
          <div class="drawer-item-price">${moneyFormat(item.final_line_price)}</div>
          <div class="drawer-item-qty">Qty: ${item.quantity}</div>
        </div>
      </div>`).join('');

    // Show footer
    if (footer) {
      footer.style.display = 'block';
      const subtotalEl = document.getElementById('drawer-subtotal');
      if (subtotalEl) subtotalEl.textContent = moneyFormat(cart.total_price);
    }
  } catch (e) {
    body.innerHTML = '<p style="padding:24px;color:var(--text-muted);">Could not load cart. Please try again.</p>';
  }
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
