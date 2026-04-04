(function () {
  'use strict';

  function getPage() {
    return location.pathname.split('/').pop().replace(/\.html.*$/, '') || 'index';
  }

  const PAGE = getPage();
  const IS_PRODUCT_PAGE = PAGE === 'index' || PAGE === 'latest';
  const IS_CONTACT  = PAGE === 'contact';
  const IS_DELIVERY = PAGE === 'delivery';
  const IS_CART     = PAGE === 'cart';
  const IS_TRIAL    = PAGE === 'trialroom';

  function getCartCount () {
    const cart = JSON.parse(localStorage.getItem('myshop_cart')) || [];
    return cart.reduce((sum, item) => sum + (item.qty || 1), 0);
  }

  function updateCartBadge () {
    const badge = document.getElementById('cart-badge');
    if (!badge) return;
    const count = getCartCount();
    badge.textContent = count;
    badge.style.display = count > 0 ? 'flex' : 'none';
  }

  const brands = [
    'NETPLAY', 'CAMPUS SUTRA', 'WROGN', 'HERE&NOW',
    'LOCOMOTIVE', 'KETCH', 'HIGHLANDER', 'URBANO FASHION',
    'MAST & HARBOUR', 'ROADSTER', 'HRX', 'LEVIS'
  ];

  const tags = ['BESTSELLER', 'BESTSELLER', 'BESTSELLER', 'NEW', null, null];

  function fakeRating () { return (Math.random() * 2.4 + 2.4).toFixed(1); }
  function fakeCount  () { return Math.floor(Math.random() * 800 + 20); }
  function fakeDiscount () { return Math.floor(Math.random() * 61 + 20); }

  document.addEventListener('DOMContentLoaded', init);

  function init () {
    injectUtilBar();
    upgradeHeader();
    injectBreadcrumb();
    wrapPageLayout();
    buildSidebar();
    buildCatHeading();
    buildToolbar();
    upgradeCards();
    injectFooter();
    injectToast();
    initContactForm();
    setActiveNav();
    injectDeliveryModal();
    injectDeliveryTrackerBar();
  }

  function injectUtilBar () {
    if (document.getElementById('topbar-util')) return;
    const bar = document.createElement('div');
    bar.id = 'topbar-util';
    bar.innerHTML = `
      <a href="signin.html">Sign In / Join EB</a>
      <a href="customer-care.html">Customer Care</a>
      <a href="delivery.html" style="color:var(--green);font-weight:700;">🚚 Track Order</a>
      <a href="index.html" class="visit-btn">Visit Easy Buy</a>
    `;
    document.body.prepend(bar);
  }

  function upgradeHeader () {
    const hdr = document.querySelector('header');
    if (!hdr) return;
    hdr.innerHTML = `
      <h1><a href="index.html" style="color:inherit;text-decoration:none;">Easy Buy</a></h1>
      <div id="header-search">
        <input type="text" placeholder="Search Easy Buy" id="search-input" autocomplete="off">
        <button type="button" aria-label="Search">&#128269;</button>
      </div>
      <div id="header-icons">
        <a href="wishlist.html" class="hdr-icon" title="Wishlist">&#9825;</a>
        <a href="delivery.html" class="hdr-icon" title="Track Order" style="font-size:20px;text-decoration:none;">🚚</a>
        <a href="cart.html" class="hdr-icon" id="cart-icon" title="Bag">
          &#128716;
          <span id="cart-badge">0</span>
        </a>
      </div>
    `;
    updateCartBadge();

    const si = document.getElementById('search-input');
    if (si) {
      si.addEventListener('input', () => applySearch(si.value.trim().toLowerCase()));
      si.addEventListener('keydown', e => { if (e.key === 'Escape') { si.value = ''; applySearch(''); } });
    }
  }

  const PAGE_LABELS = {
    'index':         'Home',
    'latest':        'Latest',
    'contact':       'Contact Us',
    'delivery':      'Track Order',
    'cart':          'My Bag',
    'wishlist':      'Wishlist',
    'signin':        'Sign In',
    'about':         'About Us',
    'blog':          'Blog',
    'careers':       'Careers',
    'customer-care': 'Customer Care',
    'faq':           'FAQs',
    'press':         'Press',
    'returns':       'Returns',
    'size-guide':    'Size Guide',
    'trialroom':     'Trial Room',
  };

  function injectBreadcrumb () {
    if (document.getElementById('breadcrumb')) return;
    const bc = document.createElement('div');
    bc.id = 'breadcrumb';
    if (PAGE === 'index') {
      bc.innerHTML = `Home`;
    } else {
      const label = PAGE_LABELS[PAGE] || PAGE;
      bc.innerHTML = `<a href="index.html">Home</a> <span class="sep">/</span> ${label}`;
    }
    const hdr = document.querySelector('header');
    if (hdr) hdr.after(bc);
  }

  function wrapPageLayout () {
    const container = document.querySelector('.container');
    if (!container) return;
    if (document.getElementById('page-layout')) return;

    const layout  = document.createElement('div');
    layout.id = 'page-layout';
    const sidebarEl = document.createElement('aside');
    sidebarEl.id = 'sidebar';
    const mainEl = document.createElement('div');
    mainEl.id = 'main-content';

    container.parentNode.insertBefore(layout, container);
    layout.appendChild(sidebarEl);
    layout.appendChild(mainEl);
    mainEl.appendChild(container);

    let prev = layout.previousElementSibling;
    while (prev && (prev.tagName === 'H2' || prev.tagName === 'HR')) {
      const tmp = prev.previousElementSibling;
      mainEl.prepend(prev);
      prev = tmp;
    }
  }

  function buildSidebar () {
    const sb = document.getElementById('sidebar');
    if (!sb || sb.innerHTML.trim()) return;

    sb.innerHTML = `
      <div id="sidebar-title">
        <h3>Refine By</h3>
        <a href="javascript:void(0)" id="clear-all-filters">Clear All</a>
      </div>
      ${filterSection('Shop For', `
        <label class="check-item"><input type="checkbox"> Men (1,243)</label>
        <label class="check-item"><input type="checkbox"> Women (892)</label>
      `, true)}
      ${filterSection('Category', `
        <label class="check-item"><input type="checkbox"> T-Shirts (432)</label>
        <label class="check-item"><input type="checkbox"> Casual Shirts (218)</label>
        <label class="check-item"><input type="checkbox"> Pants & Trousers (315)</label>
        <label class="check-item"><input type="checkbox"> Watches (97)</label>
        <label class="check-item"><input type="checkbox"> Denim (184)</label>
        <label class="check-item"><input type="checkbox"> Shoes (256)</label>
      `, true)}
      ${filterSection('Price', `
        <div class="price-range">
          <input type="range" min="0" max="5000" value="5000" id="price-slider">
          <div class="price-labels"><span>₹0</span><span id="price-val">₹5,000</span></div>
        </div>
      `)}
      ${filterSection('Brands', `
        <label class="check-item"><input type="checkbox"> Campus Sutra</label>
        <label class="check-item"><input type="checkbox"> WROGN</label>
        <label class="check-item"><input type="checkbox"> Roadster</label>
        <label class="check-item"><input type="checkbox"> HRX</label>
        <label class="check-item"><input type="checkbox"> Highlander</label>
        <label class="check-item"><input type="checkbox"> Locomotive</label>
      `)}
      ${filterSection('Discount Ranges', `
        <label class="check-item"><input type="checkbox"> 20% and above</label>
        <label class="check-item"><input type="checkbox"> 30% and above</label>
        <label class="check-item"><input type="checkbox"> 50% and above</label>
        <label class="check-item"><input type="checkbox"> 70% and above</label>
      `)}
      ${filterSection('Colors', `
        <div class="color-swatches">
          <div class="swatch" style="background:#000" title="Black"></div>
          <div class="swatch" style="background:#fff;border:1px solid #ccc" title="White"></div>
          <div class="swatch" style="background:#1a237e" title="Navy"></div>
          <div class="swatch" style="background:#b71c1c" title="Red"></div>
          <div class="swatch" style="background:#558b2f" title="Green"></div>
          <div class="swatch" style="background:#4e342e" title="Brown"></div>
          <div class="swatch" style="background:#f57f17" title="Yellow"></div>
          <div class="swatch" style="background:#6a1b9a" title="Purple"></div>
          <div class="swatch" style="background:#e8c9a0" title="Beige"></div>
          <div class="swatch" style="background:#546e7a" title="Grey"></div>
        </div>
      `)}
      ${filterSection('Size & Fit', `
        <label class="check-item"><input type="checkbox"> XS</label>
        <label class="check-item"><input type="checkbox"> S</label>
        <label class="check-item"><input type="checkbox"> M</label>
        <label class="check-item"><input type="checkbox"> L</label>
        <label class="check-item"><input type="checkbox"> XL</label>
        <label class="check-item"><input type="checkbox"> XXL</label>
      `)}
      ${filterSection('Rating', `
        <div class="rating-filter">
          <label class="check-item"><input type="checkbox"> ⭐ 4★ & above</label>
          <label class="check-item"><input type="checkbox"> ⭐ 3★ & above</label>
          <label class="check-item"><input type="checkbox"> ⭐ 2★ & above</label>
        </div>
      `)}
    `;

    const clearAllBtn = sb.querySelector('#clear-all-filters');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', function (e) {
        e.preventDefault();
        sb.querySelectorAll('input[type="checkbox"]').forEach(cb => { cb.checked = false; });
        const slider = sb.querySelector('#price-slider');
        const priceVal = sb.querySelector('#price-val');
        if (slider)   slider.value = 5000;
        if (priceVal) priceVal.textContent = '₹5,000';
        sb.querySelectorAll('.swatch').forEach(sw => sw.classList.remove('selected'));
        // Reset filter state
        filterState.maxPrice = 5000;
        filterState.categories.clear();
        filterState.colors.clear();
        filterState.sizes.clear();
        filterState.discounts.clear();
        filterState.brands.clear();
        filterState.ratings.clear();
        applyFilters();
        showToast('Filters cleared');
      });
    }

    const sl = sb.querySelector('#price-slider');
    const pv = sb.querySelector('#price-val');
    if (sl && pv) {
      sl.addEventListener('input', () => {
        pv.textContent = `₹${Number(sl.value).toLocaleString('en-IN')}`;
        filterState.maxPrice = Number(sl.value);
        applyFilters();
      });
    }

    // Wire up all checkboxes to filterState
    sb.querySelectorAll('.sidebar-section').forEach(section => {
      const title = section.querySelector('.sidebar-toggle')?.textContent.trim().toLowerCase() || '';
      section.querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.addEventListener('change', () => {
          const label = cb.closest('label')?.textContent.trim();
          const val = label?.replace(/\s*\([\d,]+\)\s*$/, '').trim(); // strip count like "(432)"
          if (!val) return;

          let set;
          if (title.startsWith('category'))        set = filterState.categories;
          else if (title.startsWith('brand'))       set = filterState.brands;
          else if (title.startsWith('discount'))    set = filterState.discounts;
          else if (title.startsWith('size'))        set = filterState.sizes;
          else if (title.startsWith('rating'))      set = filterState.ratings;
          else if (title.startsWith('shop for'))    set = filterState.categories;
          else return;

          if (cb.checked) {
            // For discounts, extract numeric part
            if (title.startsWith('discount')) {
              const pct = val.match(/\d+/)?.[0];
              if (pct) set.add(pct);
            } else if (title.startsWith('rating')) {
              const r = val.match(/[\d.]+/)?.[0];
              if (r) set.add(r);
            } else {
              set.add(val);
            }
          } else {
            if (title.startsWith('discount')) {
              const pct = val.match(/\d+/)?.[0];
              if (pct) set.delete(pct);
            } else if (title.startsWith('rating')) {
              const r = val.match(/[\d.]+/)?.[0];
              if (r) set.delete(r);
            } else {
              set.delete(val);
            }
          }
          applyFilters();
        });
      });
    });

    sb.querySelectorAll('.sidebar-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        if (!body) return;
        const isOpen = body.classList.toggle('open');
        btn.classList.toggle('open', isOpen);
      });
    });

    sb.querySelectorAll('.swatch').forEach(sw => {
      sw.addEventListener('click', () => {
        sw.classList.toggle('selected');
        const color = sw.title;
        if (sw.classList.contains('selected')) filterState.colors.add(color);
        else filterState.colors.delete(color);
        applyFilters();
      });
    });
  }

  function filterSection (title, content, open = false) {
    return `
      <div class="sidebar-section">
        <button class="sidebar-toggle ${open ? 'open' : ''}">
          ${title} <span class="icon">+</span>
        </button>
        <div class="sidebar-body ${open ? 'open' : ''}">${content}</div>
      </div>`;
  }

  function buildCatHeading () {
    const mc = document.getElementById('main-content');
    if (!mc || document.getElementById('cat-heading')) return;
    if (!IS_PRODUCT_PAGE) return;
    const label = PAGE === 'latest' ? 'NEW ARRIVALS' : 'MEN\'S COLLECTION';
    const title = PAGE === 'latest' ? 'Latest Drops' : 'All Products';
    const div = document.createElement('div');
    div.id = 'cat-heading';
    div.innerHTML = `<p class="cat-label">${label}</p><h2>${title}</h2>`;
    mc.prepend(div);
  }

  function buildToolbar () {
    const mc = document.getElementById('main-content');
    if (!mc || document.getElementById('toolbar')) return;
    if (!IS_PRODUCT_PAGE) return;

    const cards = document.querySelectorAll('.card');
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    toolbar.innerHTML = `
      <span id="item-count">${cards.length} Items</span>
      <div id="grid-sort">
        <div class="grid-toggle">
          <button class="grid-btn active" data-cols="3" title="3-column grid">
            <span></span><span></span><span></span>
          </button>
          <button class="grid-btn" data-cols="4" title="4-column grid">
            <span></span><span></span><span></span><span></span>
          </button>
        </div>
        <div class="sort-wrap">
          <label>SORT BY</label>
          <select id="sort-select">
            <option value="popular">Popularity</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
            <option value="discount">Best Discount</option>
          </select>
        </div>
      </div>
    `;

    const heading = document.getElementById('cat-heading');
    if (heading) heading.after(toolbar);
    else mc.prepend(toolbar);

    const sortSel = toolbar.querySelector('#sort-select');
    if (sortSel) {
      sortSel.addEventListener('change', () => {
        filterState.sort = sortSel.value;
        applyFilters();
      });
    }

    toolbar.querySelectorAll('.grid-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toolbar.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cols = btn.dataset.cols;
        document.querySelectorAll('.productgrid').forEach(g => {
          g.classList.remove('cols-2', 'cols-3', 'cols-4');
          g.classList.add(`cols-${cols}`);
        });
      });
    });
  }

  function upgradeCards () {
    document.querySelectorAll('.card').forEach((card, i) => {
      if (card.dataset.upgraded) return;
      card.dataset.upgraded = '1';

      const img = card.querySelector('img');
      if (img && !img.closest('.card-img-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'card-img-wrap';
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);

        const wl = document.createElement('button');
        wl.className = 'wishlist-btn';
        wl.innerHTML = '&#9825;';
        wrap.appendChild(wl);
        wl.addEventListener('click', e => {
          e.stopPropagation();
          wl.classList.toggle('liked');
          wl.innerHTML = wl.classList.contains('liked') ? '&#9829;' : '&#9825;';
        });

        const tag = tags[i % tags.length];
        if (tag) {
          const t = document.createElement('div');
          t.className = 'card-tag';
          t.textContent = tag;
          wrap.appendChild(t);
        }
      }

      let body = card.querySelector('.card-body');
      if (!body) {
        body = document.createElement('div');
        body.className = 'card-body';
        const children = [...card.children].filter(c => !c.classList.contains('card-img-wrap'));
        children.forEach(c => body.appendChild(c));
        card.appendChild(body);
      }

      if (!body.querySelector('.card-brand')) {
        const brand = document.createElement('div');
        brand.className = 'card-brand';
        brand.textContent = brands[i % brands.length];
        body.prepend(brand);
      }

      if (!body.querySelector('.card-rating')) {
        const rating = fakeRating();
        const count  = fakeCount();
        const cls    = rating >= 4 ? 'high' : rating >= 3 ? 'mid' : 'low';
        const ratingEl = document.createElement('div');
        ratingEl.className = 'card-rating';
        ratingEl.innerHTML = `
          <span class="rating-badge ${cls}">${rating} <span class="star">★</span></span>
          <span class="rating-count">(${count})</span>
        `;
        const h3 = body.querySelector('h3');
        if (h3) h3.after(ratingEl);
        else body.appendChild(ratingEl);
      }

      const priceEl = body.querySelector('.price');
      if (priceEl && !body.querySelector('.card-price-row')) {
        const disc    = fakeDiscount();
        const priceN  = parseInt(priceEl.textContent.replace(/[₹,]/g, ''), 10);
        const mrp     = Math.round(priceN / (1 - disc / 100));

        const row = document.createElement('div');
        row.className = 'card-price-row';
        row.innerHTML = `
          <span class="price">${priceEl.textContent}</span>
          <span class="original-price">₹${mrp.toLocaleString('en-IN')}</span>
          <span class="discount-pct">(${disc}% off)</span>
        `;
        priceEl.after(row);
        priceEl.remove();

        const op = document.createElement('p');
        op.className = 'offer-price';
        op.textContent = `₹${Math.round(priceN * 0.93).toLocaleString('en-IN')}`;
        row.after(op);
      }

      const origBtn = body.querySelector('button');
      if (origBtn) origBtn.remove();

      if (!card.querySelector('.card-atc')) {
        const atcBtn = document.createElement('button');
        atcBtn.className = 'card-atc';
        atcBtn.textContent = 'ADD TO BAG';
        body.appendChild(atcBtn);
        atcBtn.addEventListener('click', e => {
          e.stopPropagation();
          handleAddToCart(atcBtn, card);
        });
      }

      if (!card.querySelector('.card-tryon')) {
        const tryBtn = document.createElement('a');
        tryBtn.className = 'card-tryon';
        tryBtn.textContent = '👕 Try It On';
        tryBtn.href = 'trialroom.html';
        tryBtn.target = '_blank';
        tryBtn.rel = 'noopener noreferrer';
        body.appendChild(tryBtn);

        tryBtn.addEventListener('click', e => {
          e.stopPropagation();
          const rawPriceText = card.querySelector('.card-price-row .price')?.textContent || '₹0';
          const priceNumber = parseInt(rawPriceText.replace(/[₹,]/g, ''), 10);
          const imgEl = card.querySelector('img');
          const product = {
            id: Date.now(),
            name: card.querySelector('h3')?.textContent || 'Item',
            brand: card.querySelector('.card-brand')?.textContent || 'Easy Buy',
            color: card.querySelector('.color')?.textContent || '',
            size: 'M', price: priceNumber,
            img: imgEl ? imgEl.src : ''
          };
          localStorage.setItem('trial_product', JSON.stringify(product));
        });
      }
    });
  }

  function handleAddToCart (btn, card) {
    const rawPriceText = card.querySelector('.card-price-row .price')?.textContent ||
      card.innerText.match(/₹[\d,]+/)?.[0] || '₹0';
    const priceNumber = parseInt(rawPriceText.replace(/[₹,]/g, ''), 10);

    const product = {
      id: Date.now(),
      name: card.querySelector('h3')?.textContent || 'Item',
      brand: card.querySelector('.card-brand')?.textContent || 'Easy Buy',
      color: card.querySelector('.color')?.textContent || '',
      size: 'M', price: priceNumber,
      mrp: Math.round(priceNumber * 1.35),
      img: card.querySelector('img')?.getAttribute('src'),
      qty: 1
    };

    let cart = JSON.parse(localStorage.getItem('myshop_cart')) || [];
    cart.push(product);
    localStorage.setItem('myshop_cart', JSON.stringify(cart));
    updateCartBadge();

    btn.classList.add('added');
    btn.textContent = '✓ ADDED TO BAG';
    showToast(product.name + ' added to bag');
    setTimeout(() => { btn.classList.remove('added'); btn.textContent = 'ADD TO BAG'; }, 2000);

    showDeliveryModal(product);
  }

  function setActiveNav () {
    const nav = document.querySelector('nav');
    if (!nav) return;

    nav.querySelectorAll('a').forEach(a => {
      const href = a.getAttribute('href') || '';
      const hPage = href.replace(/\.html.*$/, '').replace(/^.*\//, '');
      if (hPage === PAGE || (PAGE === 'index' && hPage === 'index')) {
        a.style.color = 'var(--brand-orange)';
      }
    });

    if (!nav.querySelector('a[href="trialroom.html"]')) {
      const trialLink = document.createElement('a');
      trialLink.href = 'trialroom.html';
      trialLink.target = '_blank';
      trialLink.rel = 'noopener noreferrer';
      trialLink.innerHTML = '👕 Trial Room';
      trialLink.style.color = 'var(--brand-orange)';
      trialLink.style.fontWeight = '700';
      nav.appendChild(trialLink);
    }

    if (!nav.querySelector('a[href="delivery.html"]')) {
      const deliveryLink = document.createElement('a');
      deliveryLink.href = 'delivery.html';
      deliveryLink.innerHTML = '🚚 Track Order';
      deliveryLink.style.color = 'var(--green)';
      deliveryLink.style.fontWeight = '700';
      nav.appendChild(deliveryLink);
    }
  }

  function injectFooter () {
    if (document.querySelector('footer')) return;
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <div class="footer-grid">
        <div>
          <div class="footer-logo">Easy Buy</div>
          <p class="footer-desc">Fashion for everyone. Free delivery on orders above ₹999.</p>
        </div>
        <div class="footer-col">
          <h4>Customer Service</h4>
          <a href="delivery.html">Track My Order</a>
          <a href="returns.html">Returns & Refunds</a>
          <a href="faq.html">FAQs</a>
          <a href="size-guide.html">Size Guide</a>
          <a href="customer-care.html">Customer Care</a>
          <a href="contact.html">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="about.html">About Us</a>
          <a href="careers.html">Careers</a>
          <a href="press.html">Press</a>
          <a href="blog.html">Blog</a>
        </div>
        <div class="footer-col">
          <h4>My Account</h4>
          <a href="signin.html">Sign In / Register</a>
          <a href="wishlist.html">My Wishlist</a>
          <a href="cart.html">My Bag</a>
          <a href="delivery.html">My Orders</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 Easy Buy. All rights reserved.</span>
        <span>Made with ❤️ in India</span>
      </div>
    `;
    document.body.appendChild(footer);
  }

  function injectToast () {
    if (document.getElementById('toast')) return;
    const t = document.createElement('div');
    t.id = 'toast';
    document.body.appendChild(t);
  }

  function showToast (msg) {
    const t = document.getElementById('toast');
    if (!t) return;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove('show'), 3000);
  }

  function initContactForm () {
    const form = document.querySelector('form');
    if (!form) return;
    const btn = form.querySelector('button');
    if (!btn) return;
    btn.setAttribute('type', 'button');
    btn.textContent = 'Send Message';
    btn.addEventListener('click', () => {
      const fields = form.querySelectorAll('input, textarea');
      let ok = true;
      fields.forEach(f => {
        if (!f.value.trim()) {
          f.style.borderColor = 'var(--red)';
          ok = false;
          setTimeout(() => f.style.borderColor = '', 2000);
        }
      });
      if (ok) {
        btn.textContent = '✓ Message Sent!';
        btn.style.background = '#388e3c';
        showToast("Message sent! We'll get back to you.");
        setTimeout(() => { btn.textContent = 'Send Message'; btn.style.background = ''; form.reset(); }, 3000);
      } else {
        showToast('Please fill in all fields.');
      }
    });
  }

  /* ── Filter / Sort State ── */
  const filterState = {
    search: '',
    maxPrice: 5000,
    categories: new Set(),
    colors: new Set(),
    sizes: new Set(),
    discounts: new Set(),
    brands: new Set(),
    ratings: new Set(),
    sort: 'popular'
  };

  function applySearch (query) {
    filterState.search = query;
    applyFilters();
  }

  function parseCardPrice (card) {
    const priceEl = card.querySelector('.card-price-row .price') || card.querySelector('.price');
    if (!priceEl) return 0;
    return parseInt(priceEl.textContent.replace(/[₹,]/g, ''), 10) || 0;
  }

  function parseCardDiscount (card) {
    const discEl = card.querySelector('.discount-pct');
    if (!discEl) return 0;
    return parseInt(discEl.textContent) || 0;
  }

  function parseCardRating (card) {
    const ratingEl = card.querySelector('.rating-badge');
    if (!ratingEl) return 0;
    return parseFloat(ratingEl.textContent) || 0;
  }

  function applyFilters () {
    const allCards = [...document.querySelectorAll('.card')];
    const { search, maxPrice, categories, colors, sizes, discounts, brands, ratings, sort } = filterState;

    let visible = allCards.filter(card => {
      const text = card.textContent.toLowerCase();

      // Search
      if (search && !text.includes(search)) return false;

      // Price
      const price = parseCardPrice(card);
      if (price > maxPrice) return false;

      // Category — match against card h3 / section headings
      if (categories.size) {
        const catMap = {
          't-shirts':        ['t-shirt', 'tee', 'graphic tee', 'printed t', 'oversized'],
          'casual shirts':   ['casual shirt', 'cuban', 'mandarin', 'linen', 'denim shirt', 'slim fit shirt', 'washed denim'],
          'pants & trousers':['pant', 'trouser', 'denim', 'jeans', 'chino', 'cargo', 'track pant'],
          'watches':         ['watch'],
          'denim':           ['jeans', 'denim'],
          'shoes':           ['shoe', 'sneaker', 'derby', 'canvas', 'running']
        };
        const matched = [...categories].some(cat => {
          const keywords = catMap[cat.toLowerCase()] || [cat.toLowerCase()];
          return keywords.some(kw => text.includes(kw));
        });
        if (!matched) return false;
      }

      // Color swatches — match color text in card
      if (colors.size) {
        const colorText = card.querySelector('.color')?.textContent.toLowerCase() || text;
        const matched = [...colors].some(c => colorText.includes(c.toLowerCase()));
        if (!matched) return false;
      }

      // Brand
      if (brands.size) {
        const cardBrand = (card.querySelector('.card-brand')?.textContent || '').toLowerCase();
        const matched = [...brands].some(b => cardBrand.includes(b.toLowerCase()));
        if (!matched) return false;
      }

      // Discount ranges
      if (discounts.size) {
        const disc = parseCardDiscount(card);
        const matched = [...discounts].some(d => {
          const pct = parseInt(d);
          return disc >= pct;
        });
        if (!matched) return false;
      }

      // Size — can't filter meaningfully without real data, skip silently
      // Rating
      if (ratings.size) {
        const r = parseCardRating(card);
        const matched = [...ratings].some(rv => r >= parseFloat(rv));
        if (!matched) return false;
      }

      return true;
    });

    // Sort
    visible.sort((a, b) => {
      if (sort === 'price-asc')  return parseCardPrice(a) - parseCardPrice(b);
      if (sort === 'price-desc') return parseCardPrice(b) - parseCardPrice(a);
      if (sort === 'discount')   return parseCardDiscount(b) - parseCardDiscount(a);
      if (sort === 'newest')     return visible.indexOf(a) - visible.indexOf(b); // preserve DOM order as proxy
      return 0; // popularity = original order
    });

    // Show/hide
    allCards.forEach(c => { c.style.display = 'none'; });
    visible.forEach(c => { c.style.display = ''; });

    // Re-order in DOM (sort)
    if (sort !== 'popular' && sort !== 'newest') {
      const grids = [...document.querySelectorAll('.productgrid')];
      if (grids.length === 1) {
        // single grid (latest page)
        visible.forEach(c => grids[0].appendChild(c));
      } else {
        // multi-section (index page) — put all visible into first grid, hide empty grids
        const firstGrid = grids[0];
        visible.forEach(c => firstGrid.appendChild(c));
        grids.slice(1).forEach(g => {
          g.style.display = g.querySelectorAll('.card:not([style*="display: none"])').length ? '' : 'none';
        });
      }
    }

    // Update count
    const countEl = document.getElementById('item-count');
    if (countEl) countEl.textContent = `${visible.length} Items`;
  }

  

  const DELIVERY_OPTIONS = [
    { id: 'standard', label: 'Standard Delivery', icon: '📦', days: '5–7 business days', price: 0, priceLabel: 'FREE', badge: '', color: '#388e3c' },
    { id: 'express',  label: 'Express Delivery',  icon: '⚡', days: '2–3 business days', price: 99, priceLabel: '₹99', badge: 'POPULAR', color: '#c05200' },
    { id: 'same_day', label: 'Same Day Delivery',  icon: '🚀', days: 'Today by 10 PM',   price: 199, priceLabel: '₹199', badge: 'FASTEST', color: '#b71c1c' }
  ];

  function injectDeliveryModal () {
    if (document.getElementById('delivery-modal')) return;

    const overlay = document.createElement('div');
    overlay.id = 'delivery-modal-overlay';
    overlay.innerHTML = `
      <div id="delivery-modal">
        <div class="dm-header">
          <span class="dm-title">🚚 Choose Delivery Option</span>
          <button class="dm-close" id="dm-close-btn">✕</button>
        </div>
        <div class="dm-product" id="dm-product-info"></div>
        <div class="dm-pincode-row">
          <input type="text" id="dm-pincode" placeholder="Enter pincode to check delivery" maxlength="6">
          <button id="dm-check-btn">Check</button>
        </div>
        <p class="dm-pin-result" id="dm-pin-result"></p>
        <div class="dm-options" id="dm-options">
          ${DELIVERY_OPTIONS.map(opt => `
            <label class="dm-option" data-id="${opt.id}">
              <input type="radio" name="delivery_opt" value="${opt.id}" ${opt.id === 'standard' ? 'checked' : ''}>
              <div class="dm-opt-content">
                <span class="dm-opt-icon">${opt.icon}</span>
                <div class="dm-opt-info">
                  <span class="dm-opt-label">${opt.label}
                    ${opt.badge ? `<span class="dm-badge">${opt.badge}</span>` : ''}
                  </span>
                  <span class="dm-opt-days">${opt.days}</span>
                </div>
                <span class="dm-opt-price" style="color:${opt.color}">${opt.priceLabel}</span>
              </div>
            </label>
          `).join('')}
        </div>
        <div class="dm-address-section" id="dm-address-section">
          <p class="dm-section-title">📍 Delivery Address</p>
          <div class="dm-addr-grid">
            <input type="text" placeholder="Full Name" id="dm-name">
            <input type="text" placeholder="Phone Number" id="dm-phone">
            <input type="text" placeholder="Address Line 1" id="dm-addr1" class="dm-full">
            <input type="text" placeholder="Address Line 2 (optional)" id="dm-addr2" class="dm-full">
            <input type="text" placeholder="City" id="dm-city">
            <input type="text" placeholder="State" id="dm-state">
          </div>
        </div>
        <div class="dm-footer">
          <button class="dm-confirm-btn" id="dm-confirm-btn">✓ Confirm &amp; Place Order</button>
        </div>
      </div>
    `;

    document.body.appendChild(overlay);

    document.getElementById('dm-close-btn').addEventListener('click', closeDeliveryModal);
    overlay.addEventListener('click', e => { if (e.target === overlay) closeDeliveryModal(); });
    document.getElementById('dm-check-btn').addEventListener('click', checkPincode);
    document.getElementById('dm-confirm-btn').addEventListener('click', confirmOrder);

    overlay.querySelectorAll('.dm-option').forEach(opt => {
      opt.addEventListener('click', () => {
        overlay.querySelectorAll('.dm-option').forEach(o => o.classList.remove('selected'));
        opt.classList.add('selected');
      });
    });
    overlay.querySelector('.dm-option').classList.add('selected');
  }

  function showDeliveryModal (product) {
    const overlay = document.getElementById('delivery-modal-overlay');
    if (!overlay) return;
    const info = document.getElementById('dm-product-info');
    info.innerHTML = `
      <img src="${product.img || ''}" alt="${product.name}" onerror="this.style.display='none'">
      <div>
        <p class="dm-prod-name">${product.name}</p>
        <p class="dm-prod-price">₹${product.price.toLocaleString('en-IN')}</p>
      </div>
    `;
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closeDeliveryModal () {
    const overlay = document.getElementById('delivery-modal-overlay');
    if (!overlay) return;
    overlay.classList.remove('open');
    document.body.style.overflow = '';
    document.getElementById('dm-pin-result').textContent = '';
    document.getElementById('dm-pincode').value = '';
  }

  function checkPincode () {
    const pin = document.getElementById('dm-pincode').value.trim();
    const result = document.getElementById('dm-pin-result');
    if (!/^\d{6}$/.test(pin)) {
      result.textContent = '⚠️ Please enter a valid 6-digit pincode.';
      result.style.color = 'var(--red)';
      return;
    }
    result.textContent = '✓ Delivery available to ' + pin + ' — All options enabled!';
    result.style.color = 'var(--green)';
  }

  function confirmOrder () {
    const name  = document.getElementById('dm-name').value.trim();
    const phone = document.getElementById('dm-phone').value.trim();
    const addr1 = document.getElementById('dm-addr1').value.trim();
    const city  = document.getElementById('dm-city').value.trim();
    const state = document.getElementById('dm-state').value.trim();

    if (!name || !phone || !addr1 || !city || !state) {
      showToast('⚠️ Please fill in your delivery address.');
      [
        { id: 'dm-name', val: name }, { id: 'dm-phone', val: phone },
        { id: 'dm-addr1', val: addr1 }, { id: 'dm-city', val: city }, { id: 'dm-state', val: state }
      ].forEach(({ id, val }) => {
        if (!val) {
          const el = document.getElementById(id);
          el.style.borderColor = 'var(--red)';
          setTimeout(() => el.style.borderColor = '', 2000);
        }
      });
      return;
    }

    const selectedOpt = document.querySelector('input[name="delivery_opt"]:checked')?.value || 'standard';
    const opt = DELIVERY_OPTIONS.find(o => o.id === selectedOpt);

    const order = {
      id: 'EB' + Math.floor(Math.random() * 9000000 + 1000000),
      date: new Date().toISOString(),
      address: { name, phone, addr1, city, state },
      delivery: opt,
      status: 'confirmed',
      steps: [
        { label: 'Order Confirmed', done: true, time: new Date().toLocaleString('en-IN') },
        { label: 'Processing at Warehouse', done: false, time: '' },
        { label: 'Shipped', done: false, time: '' },
        { label: 'Out for Delivery', done: false, time: '' },
        { label: 'Delivered', done: false, time: '' }
      ]
    };

    let orders = JSON.parse(localStorage.getItem('myshop_orders')) || [];
    orders.unshift(order);
    localStorage.setItem('myshop_orders', JSON.stringify(orders));

    closeDeliveryModal();
    showToast(`🎉 Order ${order.id} placed! Delivering via ${opt.label}.`);
    setTimeout(() => { window.location.href = 'delivery.html'; }, 1800);
  }

  function injectDeliveryTrackerBar () {
    const orders = JSON.parse(localStorage.getItem('myshop_orders')) || [];
    if (!orders.length) return;
    const latest = orders[0];
    if (document.getElementById('delivery-tracker-bar')) return;
    const bar = document.createElement('div');
    bar.id = 'delivery-tracker-bar';
    bar.innerHTML = `
      <span>📦 Order <b>${latest.id}</b> — ${latest.delivery.label} · ${latest.delivery.days}</span>
      <a href="delivery.html">Track →</a>
    `;
    document.body.insertBefore(bar, document.body.firstChild.nextSibling);
  }

})();