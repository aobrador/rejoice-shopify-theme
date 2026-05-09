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

      // Button loading state — save original HTML to restore later
      const atcBtn    = document.getElementById('add-to-cart-btn');
      const stickyBtn = document.getElementById('sticky-atc-btn');
      const origHTML  = atcBtn ? atcBtn.innerHTML : '';
      if (atcBtn)    { atcBtn.disabled = true;    atcBtn.textContent = 'Adding…'; }
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
        if (atcBtn)    { atcBtn.disabled = false;    atcBtn.innerHTML = origHTML; }
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
    if (e.key === 'Escape') { closeCartDrawer(); closeQuickView(); }
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
  const body    = document.getElementById('cart-drawer-body');
  const footer  = document.getElementById('cart-drawer-footer');
  const countEl = document.getElementById('drawer-item-count');
  if (!body) return;

  body.innerHTML = '<div class="cart-drawer-loading"><div class="drawer-spinner"></div></div>';
  if (footer) footer.style.display = 'none';

  try {
    const res  = await fetch('/cart.js');
    const cart = await res.json();

    document.querySelectorAll('.cart-badge').forEach(b => b.textContent = cart.item_count || 0);
    if (countEl) countEl.textContent = cart.item_count || 0;

    if (cart.item_count === 0) {
      body.innerHTML = `
        <div class="drawer-empty">
          <div class="drawer-empty-icon">🛍️</div>
          <h4>Your cart is empty</h4>
          <p>Add some beautiful garments to get started.</p>
          <a href="/collections/all" class="btn-primary" onclick="closeCartDrawer()"
             style="display:inline-block;padding:12px 28px;border-radius:50px;font-size:0.88rem;">
            Shop Now
          </a>
        </div>`;
      return;
    }

    body.innerHTML = cart.items.map((item, index) => {
      const imgSrc = item.featured_image && item.featured_image.url
        ? item.featured_image.url.replace(/(\.[^.?]+)(\?|$)/, '_160x160$1$2')
        : '';
      return `
        <div class="drawer-item" data-key="${item.key}" data-index="${index + 1}">
          ${imgSrc ? `<a href="${item.url}" onclick="closeCartDrawer()"><img class="drawer-item-img" src="${imgSrc}" alt="${item.product_title}" /></a>` : ''}
          <div class="drawer-item-info">
            <div class="drawer-item-title">${item.product_title}</div>
            ${item.variant_title && item.variant_title !== 'Default Title'
              ? `<div class="drawer-item-variant">${item.variant_title}</div>` : ''}
            <div class="drawer-item-bottom">
              <div class="drawer-qty-wrap">
                <button class="drawer-qty-btn" onclick="drawerChangeQty('${item.key}', ${item.quantity - 1})">−</button>
                <div class="drawer-qty-num">${item.quantity}</div>
                <button class="drawer-qty-btn" onclick="drawerChangeQty('${item.key}', ${item.quantity + 1})">+</button>
              </div>
              <div class="drawer-item-price">${moneyFormat(item.final_line_price)}</div>
            </div>
          </div>
          <button class="drawer-remove-btn" onclick="drawerRemoveItem('${item.key}')" title="Remove item">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>`;
    }).join('');

    if (footer) {
      footer.style.display = 'block';
      const subtotalEl = document.getElementById('drawer-subtotal');
      if (subtotalEl) subtotalEl.textContent = moneyFormat(cart.total_price);
      const countNote = document.getElementById('drawer-item-count-note');
      if (countNote) countNote.textContent = cart.item_count + ' item' + (cart.item_count !== 1 ? 's' : '');
    }
  } catch (e) {
    body.innerHTML = '<p style="padding:24px;color:var(--text-muted);">Could not load cart. Please try again.</p>';
  }
}

async function drawerChangeQty(key, newQty) {
  if (newQty < 0) return;
  try {
    await fetch('/cart/change.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: key, quantity: newQty })
    });
    loadCartDrawer();
  } catch (e) { /* silent */ }
}

async function drawerRemoveItem(key) {
  const item = document.querySelector(`.drawer-item[data-key="${key}"]`);
  if (item) { item.style.opacity = '0.4'; item.style.pointerEvents = 'none'; }
  await drawerChangeQty(key, 0);
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

// ── Quick View ──────────────────────────────
let qvProduct = null;       // full product JSON
let qvSelected = {};        // { optionName: value }
let qvActiveImg = 0;

async function openQuickView(handle) {
  const overlay = document.getElementById('qv-overlay');
  const modal   = document.getElementById('qv-modal');
  const inner   = document.getElementById('qv-inner');
  if (!modal) return;

  // Show modal with spinner
  inner.innerHTML = '<div class="qv-loading"><div class="drawer-spinner"></div></div>';
  overlay.classList.add('open');
  modal.style.display = 'block';
  document.body.style.overflow = 'hidden';
  // Force reflow then open
  requestAnimationFrame(() => modal.classList.add('open'));
  modal.setAttribute('aria-hidden', 'false');

  try {
    const res  = await fetch('/products/' + handle + '.js');
    qvProduct  = await res.json();
    qvSelected = {};
    qvActiveImg = 0;
    // Default each option to first value
    (qvProduct.options || []).forEach((opt, i) => {
      qvSelected[opt] = qvProduct.variants[0].options[i];
    });
    renderQuickView();
  } catch(e) {
    inner.innerHTML = '<p style="padding:40px;text-align:center;color:var(--text-muted);">Could not load product. <a href="/products/' + handle + '">View product page →</a></p>';
  }
}

function closeQuickView() {
  const overlay = document.getElementById('qv-overlay');
  const modal   = document.getElementById('qv-modal');
  if (!modal) return;
  overlay.classList.remove('open');
  modal.classList.remove('open');
  modal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
  setTimeout(() => { modal.style.display = 'none'; }, 260);
}

function renderQuickView() {
  const inner = document.getElementById('qv-inner');
  const p = qvProduct;
  if (!p || !inner) return;

  // Find currently matched variant
  const variant = findQVVariant();

  // Images
  const imgs = p.images || [];
  const mainImg = imgs[qvActiveImg] || imgs[0] || '';

  const thumbsHtml = imgs.slice(0, 6).map((img, i) => `
    <div class="qv-thumb${i === qvActiveImg ? ' active' : ''}" onclick="qvSetImage(${i})">
      <img src="${img.replace(/(\.[^.?]+)(\?|$)/, '_120x160_crop_top$1$2')}" alt="" loading="lazy">
    </div>
  `).join('');

  // Variants
  const optionsHtml = (p.options || []).length > 1 || (p.options[0] && p.options[0] !== 'Title')
    ? (p.options || []).map((optName, oi) => {
        const values = [...new Set(p.variants.map(v => v.options[oi]))];
        const btns = values.map(val => `
          <button class="qv-opt-btn${qvSelected[optName] === val ? ' selected' : ''}"
            onclick="qvSelectOption('${optName.replace(/'/g,"\\'")}','${val.replace(/'/g,"\\'")}')">
            ${val}
          </button>
        `).join('');
        return `
          <div class="qv-variants">
            <div class="qv-variant-label">${optName}: <strong>${qvSelected[optName] || ''}</strong></div>
            <div class="qv-option-btns">${btns}</div>
          </div>
        `;
      }).join('')
    : '';

  const isAvail  = variant ? variant.available : false;
  const price    = variant ? variant.price : p.price;
  const compare  = variant ? variant.compare_at_price : p.compare_at_price;
  const variantId = variant ? variant.id : (p.variants[0] ? p.variants[0].id : '');

  const mainImgSrc = mainImg
    ? mainImg.replace(/(\.[^.?]+)(\?|$)/, '_600x800_crop_top$1$2')
    : '';

  const desc = p.body_html
    ? p.body_html.replace(/<[^>]+>/g,'').trim().slice(0,280)
    : '';

  inner.innerHTML = `
    <div class="qv-grid">
      <div class="qv-images">
        <div class="qv-main-img-wrap" id="qv-main-wrap">
          ${mainImgSrc ? `<img id="qv-main-img" src="${mainImgSrc}" alt="${p.title}">` : ''}
        </div>
        ${imgs.length > 1 ? `<div class="qv-thumbs">${thumbsHtml}</div>` : ''}
      </div>

      <div class="qv-info">
        <div class="qv-type">${p.type || ''}</div>
        <h2 class="qv-title">${p.title}</h2>
        <div class="qv-price">
          ${moneyFormat(price)}
          ${compare && compare > price ? `<span class="qv-compare">${moneyFormat(compare)}</span>` : ''}
        </div>

        ${desc ? `<div class="qv-desc">${desc}</div>` : ''}

        ${optionsHtml}

        <div class="qv-actions">
          <button class="qv-atc-btn" id="qv-atc-btn"
            onclick="qvAddToCart('${variantId}')"
            ${!isAvail ? 'disabled' : ''}>
            ${isAvail ? 'Add to Cart' : 'Sold Out'}
          </button>
          <a class="qv-view-link" href="/products/${p.handle}">View full product page →</a>
        </div>
      </div>
    </div>
  `;
}

function qvSetImage(index) {
  qvActiveImg = index;
  const p = qvProduct;
  if (!p) return;
  const imgs = p.images || [];
  const src = imgs[index]
    ? imgs[index].replace(/(\.[^.?]+)(\?|$)/, '_600x800_crop_top$1$2')
    : '';
  const mainImg = document.getElementById('qv-main-img');
  if (mainImg && src) { mainImg.style.opacity = '0'; setTimeout(() => { mainImg.src = src; mainImg.style.opacity = '1'; }, 150); }
  document.querySelectorAll('.qv-thumb').forEach((t, i) => t.classList.toggle('active', i === index));
}

function qvSelectOption(optName, val) {
  qvSelected[optName] = val;
  // Update variant image if this option matches a variant with an image
  const variant = findQVVariant();
  if (variant && variant.featured_image) {
    const imgUrl = variant.featured_image.src;
    const idx = (qvProduct.images || []).findIndex(img => img === imgUrl || img.split('?')[0] === imgUrl.split('?')[0]);
    if (idx !== -1) qvSetImage(idx);
  }
  // Re-render just the options + button without full DOM wipe (for smoothness)
  const p = qvProduct;
  const v = findQVVariant();
  const isAvail = v ? v.available : false;
  const price   = v ? v.price : p.price;
  const compare = v ? v.compare_at_price : p.compare_at_price;
  const varId   = v ? v.id : '';

  // Update option buttons
  (p.options || []).forEach((oName, oi) => {
    const values = [...new Set(p.variants.map(vr => vr.options[oi]))];
    document.querySelectorAll(`.qv-opt-btn`).forEach(btn => {
      if (values.includes(btn.textContent.trim())) {
        btn.classList.toggle('selected', btn.textContent.trim() === qvSelected[oName] && oName === optName);
      }
    });
  });
  // Simpler: just re-render
  renderQuickView();
}

function findQVVariant() {
  if (!qvProduct) return null;
  const opts = qvProduct.options || [];
  return qvProduct.variants.find(v =>
    opts.every((optName, i) => !qvSelected[optName] || v.options[i] === qvSelected[optName])
  ) || qvProduct.variants[0];
}

async function qvAddToCart(variantId) {
  if (!variantId) return;
  const btn = document.getElementById('qv-atc-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Adding…'; }
  try {
    const res = await fetch('/cart/add.js', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-Requested-With': 'XMLHttpRequest' },
      body: JSON.stringify({ id: variantId, quantity: 1 })
    });
    if (res.ok) {
      closeQuickView();
      openCartDrawer();
    } else {
      showToast('⚠️ Could not add item — please try again.');
      if (btn) { btn.disabled = false; btn.textContent = 'Add to Cart'; }
    }
  } catch(e) {
    showToast('⚠️ Something went wrong.');
    if (btn) { btn.disabled = false; btn.textContent = 'Add to Cart'; }
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
