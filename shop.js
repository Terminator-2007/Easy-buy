(function () {
  'use strict';

  /* ── Data ──────────────────────────────────────────────── */

  // Read true count from localStorage (persists across pages)
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

  // Fake brand names & ratings for demo (applied randomly)
  const brands = [
    'NETPLAY', 'CAMPUS SUTRA', 'WROGN', 'HERE&NOW',
    'LOCOMOTIVE', 'KETCH', 'HIGHLANDER', 'URBANO FASHION',
    'MAST & HARBOUR', 'ROADSTER', 'HRX', 'LEVIS'
  ];

  const tags = ['BESTSELLER', 'BESTSELLER', 'BESTSELLER', 'NEW', null, null];

  // Generate semi-random rating between 2.4 and 4.8
  function fakeRating () {
    return (Math.random() * 2.4 + 2.4).toFixed(1);
  }
  function fakeCount () {
    return Math.floor(Math.random() * 800 + 20);
  }
  // Discount 20-80 %
  function fakeDiscount () {
    return Math.floor(Math.random() * 61 + 20);
  }

  /* ── Init ──────────────────────────────────────────────── */
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
  }

  /* ── 1. Utility top bar ─────────────────────────────────── */
  function injectUtilBar () {
    if (document.getElementById('topbar-util')) return;
    const bar = document.createElement('div');
    bar.id = 'topbar-util';
    bar.innerHTML = `
      <a href="#">Sign In / Join Eb</a>
      <a href="#">Customer Care</a>
      <a href="#" class="visit-btn">Visit Easy buy</a>
    `;
    document.body.prepend(bar);
  }

  /* ── 2. Header ──────────────────────────────────────────── */
  function upgradeHeader () {
    const hdr = document.querySelector('header');
    if (!hdr) return;

    // Keep h1 text, rebuild internals
    const logoText = hdr.querySelector('h1')?.textContent || 'EB';
    hdr.innerHTML = `
      <h1>${logoText}</h1>
      <div id="header-search">
        <input type="text" placeholder="Search EASY BUY" id="search-input" autocomplete="off">
        <button type="button" aria-label="Search">&#128269;</button>
      </div>
      <div id="header-icons">
        <div class="hdr-icon" title="Wishlist">&#9825;</div>
<a href="cart.html" class="hdr-icon" id="cart-icon" title="Bag">          &#128716;
          <span id="cart-badge">0</span>
        </a>
      </div>
    `;

    // Sync badge with current localStorage cart count
    updateCartBadge();

    const si = document.getElementById('search-input');
    if (si) {
      // Live search — filter cards as user types
      si.addEventListener('input', () => {
        const query = si.value.trim().toLowerCase();
        applySearch(query);
      });

      si.addEventListener('keydown', e => {
        if (e.key === 'Escape') {
          si.value = '';
          applySearch('');
        }
      });
    }
  }

  /* ── 3. Breadcrumb ─────────────────────────────────────── */
  function injectBreadcrumb () {
    if (document.getElementById('breadcrumb')) return;
    const isLatest  = location.pathname.includes('latest');
    const isContact = location.pathname.includes('contact');

    const trail = isLatest  ? 'Home / <a href="#">Men</a> <span class="sep">/</span> Latest'
                : isContact ? 'Home <span class="sep">/</span> Contact Us'
                : 'Home <span class="sep">/</span> <a href="#">Men</a> <span class="sep">/</span> All Products';

    const bc = document.createElement('div');
    bc.id = 'breadcrumb';
    bc.innerHTML = `<a href="index.html">Home</a> <span class="sep">/</span> ${isLatest ? 'Latest' : isContact ? 'Contact Us' : 'Products'}`;

    const hdr = document.querySelector('header');
    if (hdr) hdr.after(bc);
  }

  /* ── 4. Wrap main content in sidebar layout ─────────────── */
  function wrapPageLayout () {
    // Only for pages with product grids
    const container = document.querySelector('.container');
    if (!container) return;
    if (document.getElementById('page-layout')) return;

    const layout = document.createElement('div');
    layout.id = 'page-layout';

    const sidebarEl = document.createElement('aside');
    sidebarEl.id = 'sidebar';

    const mainEl = document.createElement('div');
    mainEl.id = 'main-content';

    // Move container into main
    container.parentNode.insertBefore(layout, container);
    layout.appendChild(sidebarEl);
    layout.appendChild(mainEl);
    mainEl.appendChild(container);

    // Also move any bare h2 above container (e.g. "Latest products")
    let prev = layout.previousElementSibling;
    while (prev && (prev.tagName === 'H2' || prev.tagName === 'HR')) {
      const tmp = prev.previousElementSibling;
      mainEl.prepend(prev);
      prev = tmp;
    }
  }

  /* ── 5. Sidebar filters ─────────────────────────────────── */
  function buildSidebar () {
    const sb = document.getElementById('sidebar');
    if (!sb || sb.innerHTML.trim()) return;

    sb.innerHTML = `
      <div id="sidebar-title">
        <h3>Refine By</h3>
        <a href="#">Clear All</a>
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
          <label class="rating-row"><input type="checkbox"> <span class="stars-display">★★★★★</span> 5</label>
          <label class="rating-row"><input type="checkbox"> <span class="stars-display">★★★★</span> 4 &amp; above</label>
          <label class="rating-row"><input type="checkbox"> <span class="stars-display">★★★</span> 3 &amp; above</label>
        </div>
      `)}
    `;

    // Accordion toggle
    sb.querySelectorAll('.sidebar-toggle').forEach(btn => {
      btn.addEventListener('click', () => {
        const body = btn.nextElementSibling;
        const isOpen = btn.classList.toggle('open');
        body.classList.toggle('open', isOpen);
        btn.querySelector('.icon').textContent = isOpen ? '−' : '+';
      });
    });

    // Price slider — live filter
    const slider  = document.getElementById('price-slider');
    const priceVal = document.getElementById('price-val');
    if (slider && priceVal) {
      slider.addEventListener('input', () => {
        priceVal.textContent = '₹' + Number(slider.value).toLocaleString('en-IN');
        applyFilters();
      });
    }

    // Colour swatches toggle
    sb.querySelectorAll('.swatch').forEach(s => {
      s.addEventListener('click', () => {
        s.classList.toggle('selected');
        applyFilters();
      });
    });

    // All checkboxes → filter
    sb.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', applyFilters);
    });

    // Clear All
    sb.querySelector('#sidebar-title a')?.addEventListener('click', e => {
      e.preventDefault();
      sb.querySelectorAll('input[type="checkbox"]').forEach(cb => cb.checked = false);
      sb.querySelectorAll('.swatch').forEach(s => s.classList.remove('selected'));
      if (slider) { slider.value = slider.max; priceVal.textContent = '₹5,000'; }
      applyFilters();
    });
  }

  /* ── Filter engine ──────────────────────────────────────── */
  function applyFilters () {
    const sb = document.getElementById('sidebar');
    if (!sb) return;

    // ── Collect active filters ───────────────────────────────

    // Price ceiling
    const slider = document.getElementById('price-slider');
    const maxPrice = slider ? parseInt(slider.value, 10) : Infinity;

    // Category checkboxes → keywords mapped to card text
    const catMap = {
      't-shirts':           ['t-shirt','tee','graphic tee','plain cotton','think positive'],
      'casual shirts':      ['shirt','denim shirt','linen','cuban','mandarin'],
      'pants & trousers':   ['pant','trouser','chino','cargo','denim','jeans'],
      'watches':            ['watch','smartwatch'],
      'denim':              ['denim','jeans'],
      'shoes':              ['shoe','sneaker','derby','canvas','running']
    };

    const activeCats = [];
    sb.querySelectorAll('.sidebar-body').forEach(body => {
      const title = body.previousElementSibling?.textContent?.toLowerCase() || '';
      if (title.includes('category')) {
        body.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          const label = cb.parentElement.textContent.trim().toLowerCase().replace(/\s*\(\d+\)/, '');
          activeCats.push(label);
        });
      }
    });

    // Brand checkboxes
    const activeBrands = [];
    sb.querySelectorAll('.sidebar-body').forEach(body => {
      const title = body.previousElementSibling?.textContent?.toLowerCase() || '';
      if (title.includes('brand')) {
        body.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          activeBrands.push(cb.parentElement.textContent.trim().toLowerCase());
        });
      }
    });

    // Discount checkboxes → minimum discount %
    let minDiscount = 0;
    sb.querySelectorAll('.sidebar-body').forEach(body => {
      const title = body.previousElementSibling?.textContent?.toLowerCase() || '';
      if (title.includes('discount')) {
        body.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          const pct = parseInt(cb.parentElement.textContent.match(/\d+/)?.[0] || '0', 10);
          if (pct > minDiscount) minDiscount = pct;
        });
      }
    });

    // Rating checkboxes → minimum rating
    let minRating = 0;
    sb.querySelectorAll('.sidebar-body').forEach(body => {
      const title = body.previousElementSibling?.textContent?.toLowerCase() || '';
      if (title.includes('rating')) {
        body.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          const r = parseInt(cb.parentElement.textContent.match(/\d+/)?.[0] || '0', 10);
          if (r > minRating) minRating = r;
        });
      }
    });

    // Size checkboxes
    const activeSizes = [];
    sb.querySelectorAll('.sidebar-body').forEach(body => {
      const title = body.previousElementSibling?.textContent?.toLowerCase() || '';
      if (title.includes('size')) {
        body.querySelectorAll('input[type="checkbox"]:checked').forEach(cb => {
          activeSizes.push(cb.parentElement.textContent.trim().toUpperCase());
        });
      }
    });

    // Colour swatches
    const activeColors = [];
    sb.querySelectorAll('.swatch.selected').forEach(s => {
      activeColors.push(s.getAttribute('title')?.toLowerCase() || '');
    });

    // ── Apply to each card ───────────────────────────────────
    let visibleCount = 0;
    document.querySelectorAll('.card').forEach(card => {
      const nameText   = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const colorText  = (card.querySelector('.color')?.textContent || '').toLowerCase();
      const brandText  = (card.querySelector('.card-brand')?.textContent || '').toLowerCase();
      const priceEl    = card.querySelector('.card-price-row .price') || card.querySelector('.price');
      const cardPrice  = parseInt((priceEl?.textContent || '0').replace(/[^\d]/g, ''), 10);

      // Discount % stored as data attr if set, else read from DOM
      const discEl  = card.querySelector('.discount-pct');
      const cardDisc = discEl ? parseInt(discEl.textContent.match(/\d+/)?.[0] || '0', 10) : 0;

      // Rating
      const ratingEl  = card.querySelector('.rating-badge');
      const cardRating = ratingEl ? parseFloat(ratingEl.textContent.trim()) : 0;

      // ── Tests ────────────────────────────────────────────
      let show = true;

      // Price
      if (cardPrice > maxPrice) show = false;

      // Category
      if (show && activeCats.length) {
        const matched = activeCats.some(cat => {
          const keywords = catMap[cat] || [cat];
          return keywords.some(kw => nameText.includes(kw));
        });
        if (!matched) show = false;
      }

      // Brand
      if (show && activeBrands.length) {
        if (!activeBrands.some(b => brandText.includes(b))) show = false;
      }

      // Discount
      if (show && minDiscount > 0) {
        if (cardDisc < minDiscount) show = false;
      }

      // Rating
      if (show && minRating > 0) {
        if (cardRating < minRating) show = false;
      }

      // Colour
      if (show && activeColors.length) {
        if (!activeColors.some(c => colorText.includes(c))) show = false;
      }

      // Size — all cards treated as available in all sizes (no size data on cards)
      // so size filter shows all if any size selected (can be refined later)

      card.style.display = show ? '' : 'none';
      if (show) visibleCount++;
    });

    // Update item count in toolbar
    const countEl = document.getElementById('item-count');
    if (countEl) countEl.textContent = visibleCount + ' Items Found';
  }

  /* ── Search engine ──────────────────────────────────────── */
  function applySearch (query) {
    let visibleCount = 0;

    document.querySelectorAll('.card').forEach(card => {
      if (!query) {
        // Empty query — restore all cards (let sidebar filters re-apply)
        card.style.display = '';
        visibleCount++;
        return;
      }

      const name  = (card.querySelector('h3')?.textContent || '').toLowerCase();
      const color = (card.querySelector('.color')?.textContent || '').toLowerCase();
      const brand = (card.querySelector('.card-brand')?.textContent || '').toLowerCase();
      const price = (card.querySelector('.card-price-row .price')?.textContent || card.querySelector('.price')?.textContent || '').toLowerCase();

      const matches = name.includes(query)
                   || color.includes(query)
                   || brand.includes(query)
                   || price.includes(query);

      card.style.display = matches ? '' : 'none';
      if (matches) visibleCount++;
    });

    // Update toolbar count
    const countEl = document.getElementById('item-count');
    if (countEl) {
      if (query) {
        countEl.textContent = visibleCount > 0
          ? `${visibleCount} result${visibleCount !== 1 ? 's' : ''} for "${query}"`
          : `No results for "${query}"`;
      } else {
        countEl.textContent = document.querySelectorAll('.card').length + ' Items Found';
      }
    }

    // Show a "no results" hint inside main-content if 0 found
    const mc = document.getElementById('main-content');
    let noRes = document.getElementById('search-no-results');
    if (visibleCount === 0 && query) {
      if (!noRes) {
        noRes = document.createElement('div');
        noRes.id = 'search-no-results';
        noRes.style.cssText = 'padding:40px 20px;text-align:center;color:var(--text-muted);font-size:14px;';
        noRes.innerHTML = `<div style="font-size:40px;margin-bottom:12px;">🔍</div>
          <strong style="color:var(--text-primary);font-size:16px;">No products found for "<span id="snr-q"></span>"</strong>
          <p style="margin-top:8px;">Try a different keyword — e.g. "watch", "shirt", "jeans"</p>`;
        mc?.appendChild(noRes);
      }
      document.getElementById('snr-q').textContent = query;
      noRes.style.display = 'block';
    } else if (noRes) {
      noRes.style.display = 'none';
    }
  }

  function filterSection (title, bodyHtml, startOpen = false) {
    return `
      <div class="sidebar-section">
        <button class="sidebar-toggle ${startOpen ? 'open' : ''}" type="button">
          ${title} <span class="icon">${startOpen ? '−' : '+'}</span>
        </button>
        <div class="sidebar-body ${startOpen ? 'open' : ''}">${bodyHtml}</div>
      </div>
    `;
  }

  /* ── 6. Category heading ────────────────────────────────── */
  function buildCatHeading () {
    const mc = document.getElementById('main-content');
    if (!mc || document.getElementById('cat-heading')) return;

    const isLatest  = location.pathname.includes('latest');
    const isContact = location.pathname.includes('contact');
    if (isContact) return;

    const label = isLatest ? 'NEW ARRIVALS' : "MEN'S";
    const title = isLatest ? 'Latest Products' : 'All Products';

    const div = document.createElement('div');
    div.id = 'cat-heading';
    div.innerHTML = `<p class="cat-label">${label}</p><h2>${title}</h2>`;
    mc.prepend(div);

    // Remove the bare h2 that was already in HTML
    mc.querySelectorAll(':scope > h2').forEach(h => h.remove());
  }

  /* ── 7. Toolbar (count + grid + sort) ──────────────────── */
  function buildToolbar () {
    const mc = document.getElementById('main-content');
    if (!mc || document.getElementById('toolbar')) return;
    if (location.pathname.includes('contact')) return;

    const count = document.querySelectorAll('.card').length;
    const toolbar = document.createElement('div');
    toolbar.id = 'toolbar';
    toolbar.innerHTML = `
      <span id="item-count">${count} Items Found</span>
      <div id="grid-sort">
        <div class="grid-toggle">
          GRID
          <button class="grid-btn active" data-cols="3" title="3 columns">
            <span></span><span></span><span></span>
          </button>
          <button class="grid-btn" data-cols="4" title="4 columns">
            <span></span><span></span><span></span><span></span>
          </button>
          <button class="grid-btn" data-cols="2" title="2 columns">
            <span></span><span></span>
          </button>
        </div>
        <div class="sort-wrap">
          <label>SORT BY</label>
          <select id="sort-select">
            <option>Relevance</option>
            <option>New Arrivals</option>
            <option>Price: Low to High</option>
            <option>Price: High to Low</option>
            <option>Discount</option>
            <option>Customer Rating</option>
          </select>
        </div>
      </div>
    `;

    // Insert before the container
    const container = mc.querySelector('.container');
    if (container) mc.insertBefore(toolbar, container);
    else mc.prepend(toolbar);

    // Grid toggle
    toolbar.querySelectorAll('.grid-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        toolbar.querySelectorAll('.grid-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        const cols = btn.dataset.cols;
        document.querySelectorAll('.productgrid').forEach(g => {
          g.className = `productgrid cols-${cols}`;
        });
      });
    });

    // Sort
    document.getElementById('sort-select')?.addEventListener('change', e => {
      showToast(`Sorted by: ${e.target.value}`);
    });
  }

  /* ── 8. Card Upgrades ───────────────────────────────────── */
  function upgradeCards () {
    document.querySelectorAll('.card').forEach((card, i) => {
      // Wrap img
      const img = card.querySelector('img');
      if (img && !img.parentElement.classList.contains('card-img-wrap')) {
        const wrap = document.createElement('div');
        wrap.className = 'card-img-wrap';
        img.parentNode.insertBefore(wrap, img);
        wrap.appendChild(img);
      }

      // Random tag
      const tagText = tags[i % tags.length];
      if (tagText && !card.querySelector('.card-img-wrap .card-tag')) {
        const tag = document.createElement('span');
        tag.className = 'card-tag';
        tag.textContent = tagText;
        card.querySelector('.card-img-wrap')?.appendChild(tag);
      }

      // Wishlist button
      if (!card.querySelector('.wishlist-btn')) {
        const wb = document.createElement('button');
        wb.className = 'wishlist-btn';
        wb.setAttribute('aria-label', 'Wishlist');
        wb.innerHTML = '&#9825;';
        card.querySelector('.card-img-wrap')?.appendChild(wb);
        wb.addEventListener('click', e => {
          e.stopPropagation();
          wb.classList.toggle('liked');
          wb.innerHTML = wb.classList.contains('liked') ? '&#9829;' : '&#9825;';
          const name = card.querySelector('h3')?.textContent || 'Item';
          showToast(wb.classList.contains('liked')
            ? `♥ Added "${name}" to Wishlist`
            : `Removed from Wishlist`);
        });
      }

      // Wrap body content
      const bodyChildren = [...card.children].filter(el =>
        !el.classList.contains('card-img-wrap') && el.tagName !== 'IMG'
      );
      if (bodyChildren.length && !card.querySelector('.card-body')) {
        const body = document.createElement('div');
        body.className = 'card-body';
        bodyChildren.forEach(el => body.appendChild(el));
        card.appendChild(body);
      }

      const body = card.querySelector('.card-body');
      if (!body) return;

      // Brand name (inject before h3)
      if (!body.querySelector('.card-brand')) {
        const br = document.createElement('p');
        br.className = 'card-brand';
        br.textContent = brands[i % brands.length];
        body.prepend(br);
      }

      // Rating badge (inject after h3)
      if (!body.querySelector('.card-rating')) {
        const rating = parseFloat(fakeRating());
        const count  = fakeCount();
        const cls    = rating >= 4 ? 'high' : rating >= 3 ? 'mid' : 'low';
        const rRow = document.createElement('div');
        rRow.className = 'card-rating';
        rRow.innerHTML = `
          <span class="rating-badge ${cls}">
            ${rating} <span class="star">★</span>
          </span>
          <span class="rating-count">| ${count.toLocaleString('en-IN')}</span>
        `;
        const h3 = body.querySelector('h3');
        if (h3) h3.after(rRow);
        else body.appendChild(rRow);
      }

      // Price row: add MRP + discount
      const priceEl = body.querySelector('.price');
      if (priceEl && !body.querySelector('.card-price-row')) {
        const rawPrice = parseInt(priceEl.textContent.replace(/[^\d]/g, ''), 10);
        const disc     = fakeDiscount();
        const mrp      = Math.round(rawPrice / (1 - disc / 100));
        const offerPct = Math.max(5, disc - 8);
        const offerPr  = Math.round(rawPrice * (1 - offerPct / 100));

        const row = document.createElement('div');
        row.className = 'card-price-row';
        row.innerHTML = `
          <span class="price">${priceEl.textContent}</span>
          <span class="original-price">₹${mrp.toLocaleString('en-IN')}</span>
          <span class="discount-pct">(${disc}% off)</span>
        `;
        priceEl.after(row);
        priceEl.remove();

        // Offer price
        const op = document.createElement('p');
        op.className = 'offer-price';
        op.textContent = `₹${offerPr.toLocaleString('en-IN')}`;
        row.after(op);
      }

      // ATC button (replace original)
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

      // ── Try It On button ──────────────────────────────────
      if (!card.querySelector('.card-tryon')) {
        const tryBtn = document.createElement('a');
        tryBtn.className = 'card-tryon';
        tryBtn.textContent = '👕 Try It On';
        tryBtn.href = 'trialroom.html';
        tryBtn.target = '_blank';          // opens in new tab
        tryBtn.rel = 'noopener noreferrer';
        body.appendChild(tryBtn);

        tryBtn.addEventListener('click', e => {
          e.stopPropagation();
          const rawPriceText =
            card.querySelector('.card-price-row .price')?.textContent ||
            card.innerText.match(/₹[\d,]+/)?.[0] || '₹0';
          const priceNumber = parseInt(rawPriceText.replace(/[₹,]/g, ''), 10);

          // MUST use imgEl.src (absolute URL), NOT getAttribute('src') (relative)
          const imgEl = card.querySelector('img');
          const imgUrl = imgEl ? imgEl.src : '';

          const product = {
            id:    Date.now(),
            name:  card.querySelector('h3')?.textContent || 'Item',
            brand: card.querySelector('.card-brand')?.textContent || 'Easy Buy',
            color: card.querySelector('.color')?.textContent || '',
            size:  'M',
            price: priceNumber,
            img:   imgUrl
          };
          // localStorage is shared across tabs — sessionStorage is NOT
          localStorage.setItem('trial_product', JSON.stringify(product));
        });
      }
    });
  }

  function handleAddToCart (btn, card) {

const rawPriceText =
card.querySelector('.card-price-row .price')?.textContent ||
card.innerText.match(/₹[\d,]+/)?.[0] ||
"₹0";

const priceNumber = parseInt(rawPriceText.replace(/[₹,]/g,''),10);

const product = {

id: Date.now(),
name: card.querySelector('h3')?.textContent || 'Item',
brand: card.querySelector('.card-brand')?.textContent || 'MyShop',
color: card.querySelector('.color')?.textContent || '',
size: "M",
price: priceNumber,
mrp: Math.round(priceNumber * 1.35),
img: card.querySelector('img')?.getAttribute("src"),
qty: 1

};

let cart = JSON.parse(localStorage.getItem("myshop_cart")) || [];

cart.push(product);

localStorage.setItem("myshop_cart", JSON.stringify(cart));

updateCartBadge();

btn.classList.add('added');
btn.textContent = '✓ ADDED TO BAG';

showToast(product.name + " added to bag");

setTimeout(()=>{
btn.classList.remove('added');
btn.textContent='ADD TO BAG';
},2000);

}

  /* ── 9. Nav active state ────────────────────────────────── */
  function setActiveNav () {
    const page = location.pathname.split('/').pop() || 'index.html';
    document.querySelectorAll('#main-nav a').forEach(a => {
      const href = a.getAttribute('href');
      if (href && (href === page || (page === '' && href === 'index.html'))) {
        a.classList.add('active');
      }
    });

    // Inject Trial Room link into <nav> if not already present
    const nav = document.querySelector('nav');
    if (nav && !nav.querySelector('a[href="trialroom.html"]')) {
      const trialLink = document.createElement('a');
      trialLink.href = 'trialroom.html';
      trialLink.target = '_blank';
      trialLink.rel = 'noopener noreferrer';
      trialLink.innerHTML = '👕 Trial Room';
      trialLink.style.color = 'var(--brand-orange)';
      trialLink.style.fontWeight = '700';
      nav.appendChild(trialLink);
    }
  }

  /* ── 10. Footer ─────────────────────────────────────────── */
  function injectFooter () {
    if (document.querySelector('footer')) return;
    const footer = document.createElement('footer');
    footer.innerHTML = `
      <div class="footer-grid">
        <div>
          <div class="footer-logo">MyShop</div>
        </div>
        <div class="footer-col">
          <h4>Customer Service</h4>
          <a href="#">Track My Order</a>
          <a href="#">Returns & Refunds</a>
          <a href="#">FAQs</a>
          <a href="#">Size Guide</a>
          <a href="contact.html">Contact Us</a>
        </div>
        <div class="footer-col">
          <h4>Company</h4>
          <a href="#">About Us</a>
          <a href="#">Careers</a>
          <a href="#">Press</a>
          <a href="#">Blog</a>
        </div>
        <div class="footer-col">
          <h4>Connect</h4>
          <a href="#">Instagram</a>
          <a href="#">Facebook</a>
          <a href="#">Twitter</a>
          <a href="#">YouTube</a>
        </div>
      </div>
      <div class="footer-bottom">
        <span>© 2025 MyShop. All rights reserved.</span>
        <span>Made with ❤️ in India</span>
      </div>
    `;
    document.body.appendChild(footer);
  }

  /* ── 11. Toast ──────────────────────────────────────────── */
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

  /* ── 12. Contact form ───────────────────────────────────── */
  function initContactForm () {
    const form = document.querySelector('form');
    if (!form) return;
    const btn = form.querySelector('button');
    if (!btn) return;
    btn.setAttribute('type', 'button');
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
        btn.textContent = '✓ Submitted Successfully';
        btn.style.background = '#388e3c';
        showToast('Message sent! We\'ll get back to you.');
        setTimeout(() => {
          btn.textContent = 'Submit';
          btn.style.background = '';
          form.reset();
        }, 3000);
      } else {
        showToast('Please fill in all fields.');
      }
    });
  }

})();