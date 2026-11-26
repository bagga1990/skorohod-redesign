/* SKOROKHOD·MODA — clickable prototype, English version (vanilla JS, no build step, works from file://) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ data */
  const P = window.PRODUCTS;
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const SIZES = ['36', '37', '38', '39', '40', '41'];
  const FOOT = { '36': 23, '37': 23.5, '38': 24, '39': 24.5, '40': 25, '41': 25.5 };
  const US = { '36': 6, '37': 6.5, '38': 7.5, '39': 8.5, '40': 9, '41': 10 };
  const UK = { '36': 3.5, '37': 4, '38': 5, '39': 6, '40': 6.5, '41': 7.5 };
  const FREE_SHIP = 150;
  const PROMOS = { AUTUMN10: { pct: 10, text: '−10% on the new collection' }, SKOROKHOD: { pct: 5, text: '−5% on your whole order', all: true } };

  const CATS = [
    { id: 'botinki', name: 'Boots', img: 'assets/img/look/6aa91f6eddb06.webp', text: 'All-season boots on a low, stable heel with a grippy sole. Genuine leather and suede with a warm lining, made for Saint Petersburg autumns from 0 to +15 °C.' },
    { id: 'botilony', name: 'Ankle boots', img: 'assets/img/banner9.webp', text: 'Heeled ankle boots on a high, stable heel: laces, textured leather, suede. For the office, the theatre and evening walks around town.' },
    { id: 'sapogi', name: 'Tall boots', img: 'assets/img/look/6aa91f4178b15.webp', text: 'Tall and mid-calf boots: all-season with a brushed cotton lining, or winter with wool fur down to −20 °C. Full-length zips and a comfortable shaft width.' },
    { id: 'lofery', name: 'Loafers & pumps', img: 'assets/img/j_a1.webp', text: 'Soft suede loafers, classic pumps and lace-ups on a lug sole. Shoes you will wear every day.' },
    { id: 'kedy', name: 'Sneakers', img: 'assets/img/p/358-21-03_6.webp', text: 'Suede sneakers and desert boots on a flexible rubber sole. A genuine leather lining keeps your feet breathing all day.' },
    { id: 'leto', name: 'Summer −20%', img: 'assets/img/banner15.webp', text: 'Genuine leather mules, sandals and slides. Summer collection sale: last sizes at 20% off.' }
  ];
  const catName = id => (CATS.find(c => c.id === id) || {}).name || 'All shoes';

  const LOOKS = [
    { img: 'assets/img/look/6aa91f5bec08b.webp', cap: 'Liteyny Prospekt', note: 'Burgundy + graphite', hots: [{ x: 86, y: 80, id: 'neva' }] },
    { img: 'assets/img/look/6aa91f4e7e21f.webp', cap: 'Coffee on Rubinstein Street', note: 'Suede to match the scarf', hots: [{ x: 45, y: 87, id: 'petrogradka' }] },
    { img: 'assets/img/look/6aa91f6eddb06.webp', cap: 'Hermitage steps', note: 'Denim and cognac', hots: [{ x: 55, y: 88, id: 'kolomna' }] }
  ];

  // Hero slides. fx/fy = where the shoe sits on the source frame (fractions of width/height); the pin is recalculated for the crop
  const HERO = [
    { short: 'Colour of the season', theme: 'light', img: 'assets/img/banner9.webp', pos: '56% 50%',
      label: 'Autumn — winter ’26 collection', title: ['The colour', 'is burgundy.'],
      text: 'Women’s shoes in genuine leather. Made by&nbsp;us, at&nbsp;our own factory in&nbsp;Saint Petersburg.',
      cta: ['Shop new arrivals', '#/catalog/new'], pins: [{ id: 'millionnaya', fx: .462, fy: .83 }] },
    { short: 'Suede', theme: 'light', img: 'assets/img/banner13.webp', pos: '62% 50%',
      label: 'Ankle boots · all-season', title: ['Soft suede,', 'steady stride.'],
      text: 'Heeled ankle boots on a high, stable heel with a warm lining. For the office, the theatre and walks around town.',
      cta: ['Shop ankle boots', '#/catalog/botilony'], pins: [] },
    { short: 'Okhta sneakers', theme: 'dark', img: 'assets/img/banner16.webp', pos: '58% 50%',
      label: 'Okhta sneakers · 4 colours', title: ['Light on', 'your feet.'],
      text: 'Suede sneakers on a flexible sole with a genuine leather lining. For the city, flights and long walks.',
      cta: ['Choose a colour', 'qv:okhta:358-21-03'], pins: [{ id: 'okhta', code: '358-21-03', fx: .44, fy: .78, flip: true }] },
    { short: 'Summer −20%', theme: 'dark', img: 'assets/img/banner15.webp', pos: '62% 50%',
      label: 'Summer collection sale', title: ['Summer', '−20%.'],
      text: 'Leather mules, sandals and slides. Last sizes, until the end of October.',
      cta: ['Shop the sale', '#/catalog/leto'], pins: [{ id: 'belye', code: '967-165-167-165', fx: .455, fy: .86 }] }
  ];

  const JOURNAL = [
    { img: 'assets/img/j_a10.webp', tag: 'Colour guide', title: 'Brown, burgundy or black: which shoe colour to choose this autumn' },
    { img: 'assets/img/j_a1.webp', tag: 'Style', title: 'How to wear loafers: from jeans to dresses' },
    { img: 'assets/img/leather.webp', tag: 'Care', title: 'How to protect leather shoes from road salt and slush' }
  ];

  /* ----------------------------------------------------------------- state */
  const LS = 'skm-proto-en-v1';
  const load = () => { try { return JSON.parse(localStorage.getItem(LS)) || {}; } catch (e) { return {}; } };
  const saved = load();
  const S = Object.assign({
    cart: [], favs: [], mySize: null, myWidth: 'std', promo: null,
    flags: { soldOut: false, payFail: false }, soldKey: null,
    form: {}, lastOrder: null, viewed: [], announce: true
  }, saved);
  const persist = () => { try { localStorage.setItem(LS, JSON.stringify(S)); } catch (e) { /* private mode */ } };

  /* --------------------------------------------------------------- helpers */
  const $ = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => Array.from(r.querySelectorAll(s));
  const fmt = n => '$' + n.toLocaleString('en-US');
  const icon = (n, cls = '') => `<svg class="icon ${cls}"><use href="#i-${n}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plural = (n, one, many) => n === 1 ? one : many;
  const variant = (p, code) => p.variants.find(v => v.code === code) || p.variants[0];
  const totalStock = v => SIZES.reduce((s, k) => s + (v.stock[k] || 0), 0);
  const fullName = p => `${p.name} ${p.type}`;
  const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const addDays = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const dShort = d => `${MONTHS[d.getMonth()]} ${d.getDate()}`;
  const CUT = new Date().getHours() >= 16 ? 1 : 0; // orders placed after 4 pm are packed the next day
  const dLabel = n => n === 0 ? 'today' : n === 1 ? 'tomorrow' : `${DAYS[addDays(n).getDay()]}, ${dShort(addDays(n))}`;

  /* --------------------------------------------------------------- cart ops */
  const key = (id, code, size) => `${id}|${code}|${size}`;
  const cartCount = () => S.cart.reduce((s, l) => s + l.qty, 0);
  function lineInfo(l) {
    const p = byId[l.id], v = variant(p, l.code);
    return { p, v, price: p.price, old: p.old, sum: p.price * l.qty };
  }
  function totals() {
    const sub = S.cart.reduce((s, l) => s + lineInfo(l).sum, 0);
    let disc = 0;
    if (S.promo && PROMOS[S.promo]) {
      const pr = PROMOS[S.promo];
      const base = S.cart.reduce((s, l) => { const i = lineInfo(l); return s + (pr.all || !i.old ? i.sum : 0); }, 0);
      disc = Math.round(base * pr.pct / 100);
    }
    const saleSave = S.cart.reduce((s, l) => { const i = lineInfo(l); return s + (i.old ? (i.old - i.price) * l.qty : 0); }, 0);
    return { sub, disc, saleSave, total: sub - disc };
  }
  function addToCart(id, code, size) {
    const k = key(id, code, size);
    const ex = S.cart.find(l => l.key === k);
    if (ex) ex.qty = Math.min(ex.qty + 1, 5); else S.cart.push({ key: k, id, code, size, qty: 1 });
    persist(); updateBadges(true);
  }

  /* ------------------------------------------------------------- favorites */
  const isFav = id => S.favs.includes(id);
  function toggleFav(id) {
    if (isFav(id)) S.favs = S.favs.filter(x => x !== id); else S.favs.push(id);
    persist(); updateBadges();
    $$(`[data-fav="${id}"]`).forEach(b => b.classList.toggle('on', isFav(id)));
    if (isFav(id)) toast({ text: 'Added to wishlist', sub: fullName(byId[id]), action: 'View', go: '#/catalog/fav' });
  }

  /* ----------------------------------------------------------------- toast */
  function toast({ text, sub = '', img = '', action = '', go = '', onAction = null, ttl = 4200 }) {
    const el = document.createElement('div');
    el.className = 'toast';
    el.innerHTML = `${img ? `<div class="t"><img src="${img}" alt=""></div>` : `<span>${icon('check')}</span>`}<div>${esc(text)}${sub ? `<small>${esc(sub)}</small>` : ''}</div>${action ? `<button>${esc(action)}</button>` : '<span></span>'}`;
    $('#toasts').appendChild(el);
    const kill = () => { el.classList.add('out'); setTimeout(() => el.remove(), 300); };
    if (action) el.querySelector('button').onclick = () => { kill(); if (onAction) onAction(); if (go) location.hash = go; };
    setTimeout(kill, ttl);
  }

  /* ---------------------------------------------------------------- header */
  function renderHeader(mode) {
    const h = $('#header');
    const ann = $('#announce');
    ann.classList.toggle('is-hidden', mode === 'checkout' || !S.announce);
    if (mode === 'checkout') {
      h.className = 'header header--co';
      h.innerHTML = `<div class="co-header" style="border:0;background:none;position:static">
        <a class="back" href="#/cart">${icon('arrow-l')} Bag</a>
        <a class="logo" href="#/"><img src="assets/img/logo.png" alt=""><b>Skorokhod<span>·Moda</span></b></a>
        <div class="help">Need help?<b>+7 (812) 329-44-35</b></div></div>`;
      return;
    }
    h.className = 'header' + (mode === 'home' ? ' header--over' : '');
    h.innerHTML = `<div class="header__in">
      <div style="display:flex;align-items:center;gap:6px">
        <button class="icon-btn burger" data-act="mnav" aria-label="Menu">${icon('menu')}</button>
        <a class="logo" href="#/" aria-label="Skorokhod·Moda, home"><img src="assets/img/logo.png" alt=""><b>Skorokhod<span>·Moda</span></b></a>
      </div>
      <nav class="nav" aria-label="Main navigation">
        <button data-act="mega" aria-expanded="false">Shop</button>
        <a href="#/catalog/new">New in</a>
        <a href="#/catalog/leto">Sale</a>
        <a href="#/" data-scroll="factory">Our factory</a>
        <a href="#/" data-scroll="journal">Journal</a>
      </nav>
      <div class="header__right">
        <button class="header__trade" data-act="trade">Wholesale</button>
        <button class="icon-btn header__lang" data-act="lang" data-lang="ru" aria-label="Русская версия">RU</button>
        <button class="icon-btn" data-act="search" aria-label="Search">${icon('search')}</button>
        <a class="icon-btn" href="#/catalog/fav" aria-label="Wishlist">${icon('heart')}<span class="badge-count" id="favCount"></span></a>
        <button class="icon-btn" data-act="account" aria-label="Account">${icon('user')}</button>
        <a class="icon-btn" href="#/cart" aria-label="Bag">${icon('bag')}<span class="badge-count" id="cartCount"></span></a>
      </div>
    </div>
    <div class="mega" id="mega"><div class="mega__in">
      <div class="mega__list">
        ${CATS.map(c => `<a href="#/catalog/${c.id}">${c.name}<small>${P.filter(p => p.cat === c.id).length}</small></a>`).join('')}
        <a class="mega__all" href="#/catalog">All shoes</a>
      </div>
      <div class="mega__tiles">
        <a class="mega__tile" href="#/catalog/new"><div class="ph"><img src="assets/img/look/6aa91f5bec08b.webp" alt=""></div><p>New for autumn<span>Burgundy, chocolate, graphite</span></p></a>
        <a class="mega__tile" href="#/catalog/botinki"><div class="ph"><img src="assets/img/look/6aa91f2b5c92e.webp" alt=""></div><p>Everyday boots<span>Low heel, warm lining</span></p></a>
        <a class="mega__tile" href="#/" data-scroll="finder"><div class="ph"><img src="assets/img/neva.webp" alt="" style="object-position:70% 50%"></div><p>Find your size<span>By foot length in 10 seconds</span></p></a>
      </div>
    </div></div>`;
    updateBadges();
    onScroll();
  }
  function updateBadges(bump) {
    const c = $('#cartCount'), f = $('#favCount');
    if (c) { const n = cartCount(); c.textContent = n; c.classList.toggle('on', n > 0); if (bump) { c.classList.remove('bump'); void c.offsetWidth; c.classList.add('bump'); } }
    if (f) { f.textContent = S.favs.length; f.classList.toggle('on', S.favs.length > 0); }
  }
  // compact header: slides in once you scroll down, slides out near the top
  let miniT = 0;
  function onScroll() {
    const h = $('#header'); if (!h || h.classList.contains('header--co')) return;
    const y = window.scrollY, on = h.classList.contains('is-mini') && !h.classList.contains('mini-out');
    if (!on && y > 90) { clearTimeout(miniT); closeMega(); h.classList.remove('mini-out'); h.classList.add('is-mini'); }
    else if (on && y < 40) { h.classList.add('mini-out'); miniT = setTimeout(() => h.classList.remove('is-mini', 'mini-out'), 300); }
  }
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ------------------------------------------------------------------ cards */
  function cardHTML(p, opts = {}) {
    const v = p.variants[0];
    const sizeHint = S.mySize ? (v.stock[S.mySize] > 0
      ? `<div class="card__hint">${icon('check')} Your size ${S.mySize} in stock</div>`
      : `<div class="card__hint warn">No size ${S.mySize}</div>`) : '';
    const badge = p.badge ? `<span class="card__badge ${p.old ? 'sale' : ''}">${p.badge}</span>` : (totalStock(v) < 9 ? '<span class="card__badge">Last pairs</span>' : '');
    return `<article class="card" data-card="${p.id}" data-code="${v.code}">
      <div class="card__media" data-qv="${p.id}">
        ${badge}
        <img class="main" src="${v.img}" alt="${esc(fullName(p))}, ${v.color}" loading="lazy">
        <img class="alt" src="${v.hover}" alt="" loading="lazy">
        <button class="card__quick" data-qv="${p.id}" aria-label="Quick view">${icon('plus')}<span>Choose size</span></button>
      </div>
      <button class="icon-btn card__fav ${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Add to wishlist">${icon('heart')}</button>
      <div class="card__body">
        <div class="card__name" data-qv="${p.id}">${fullName(p)}</div>
        <div class="card__price">${fmt(p.price)}${p.old ? `<s>${fmt(p.old)}</s>` : ''}</div>
        <div class="card__sub">${p.variants.length > 1 ? `${p.variants.length} ${plural(p.variants.length, 'colour', 'colours')}` : v.color} · ${p.specs.find(s => s[0] === 'Upper')?.[1].split(';')[0].replace('Genuine ', '') || ''}</div>
        ${p.variants.length > 1 ? `<div class="card__swatches">${p.variants.map((x, i) => `<button class="sw ${i === 0 ? 'on' : ''}" style="background:${x.hex}" data-sw="${x.code}" aria-label="${x.color}"></button>`).join('')}</div>` : ''}
        ${opts.noHint ? '' : sizeHint}
      </div>
    </article>`;
  }
  function bindCards(root) {
    $$('.sw', root).forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const card = b.closest('.card'), p = byId[card.dataset.card], v = variant(p, b.dataset.sw);
      card.dataset.code = v.code;
      $('.main', card).src = v.img; $('.alt', card).src = v.hover;
      $$('.sw', card).forEach(x => x.classList.toggle('on', x === b));
    }));
  }

  /* ------------------------------------------------------------------- home */
  function viewHome() {
    const newIds = ['millionnaya', 'neva', 'liteyny', 'moyka', 'tavricheskaya', 'fontanka', 'okhta', 'sadovaya'];
    return `
    ${heroHTML()}

    <section class="section wrap" id="cats" aria-label="Categories">
      <div class="cats">
        <div class="cats__media rv">
          <div class="cats__main">${CATS.map((c, i) => `<img src="${c.img}" alt="${c.name}" class="${i === 0 ? 'on' : ''}" data-ci="${i}" loading="lazy">`).join('')}</div>
          <div class="cats__thumbs">${CATS.slice(0, 4).map((c, i) => `<button data-cat-i="${i}" class="${i === 0 ? 'on' : ''}" aria-label="${c.name}"><img src="${c.img}" alt="" loading="lazy"></button>`).join('')}</div>
        </div>
        <div class="rv">
          <ul class="cats__list">${CATS.map((c, i) => `<li><button data-cat-i="${i}" class="${i === 0 ? 'on' : ''}">${c.name}<sup>${P.filter(p => p.cat === c.id).length}</sup></button></li>`).join('')}</ul>
          <p class="cats__text" id="catText">${CATS[0].text}</p>
          <div class="cats__foot">
            <a class="btn btn--outline" id="catLink" href="#/catalog/${CATS[0].id}">Shop ${CATS[0].name.toLowerCase()}</a>
            <span class="from" id="catFrom">from ${fmt(Math.min(...P.filter(p => p.cat === CATS[0].id).map(p => p.price)))}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="wrap" id="new" aria-label="New arrivals">
      <div class="row-head">
        <h2 class="h2">New this autumn.</h2>
        <div class="tabs" id="newTabs">
          <button class="on" data-tab="all">All</button>
          ${CATS.slice(0, 5).map(c => `<button data-tab="${c.id}">${c.name}</button>`).join('')}
        </div>
      </div>
      <div id="sizeChip"></div>
      <div class="grid" id="newGrid">${newIds.map(id => cardHTML(byId[id])).join('')}</div>
      <div class="more-row"><a class="btn btn--outline" href="#/catalog">All shoes — ${P.length} ${plural(P.length, 'style', 'styles')}</a></div>
    </section>

    <section class="section wrap" id="factory" aria-label="Our factory">
      <div class="values__head">
        <span class="label muted values__kicker">Made in Saint Petersburg<i></i>Our own production</span>
        <div class="values__nav"><span class="small muted num" id="railNum">01 — 05</span><button class="rail-arr" data-rail="-1" aria-label="Previous">${icon('arrow-l')}</button><button class="rail-arr" data-rail="1" aria-label="Next">${icon('arrow')}</button></div>
      </div>
      <p class="values__statement rv">We don’t resell. We make every pair ourselves, from the pattern to the last stitch. <em>So we know exactly what each pair is made of, and we stand behind it directly, with no middlemen.</em></p>
      <div class="rail" id="valuesRail">
        <article class="value-card"><div class="ph"><img src="assets/img/craft.webp" alt="A craftsman stitching a boot upper" loading="lazy"><span class="tag label">Factory</span></div><h3>Our own factory on Tsvetochnaya Street</h3><p>Cutting, stitching and assembly all happen in one workshop in Saint Petersburg. Every pair is checked before it ships.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/leather.webp" alt="Genuine leather" loading="lazy"><span class="tag label">Materials</span></div><h3>Only genuine leather and suede</h3><p>Summer styles have leather uppers and linings. All-season pairs get a warm cotton lining, winter pairs wool fur.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/lasts.webp" alt="Shoe lasts" loading="lazy"><span class="tag label">Fit</span></div><h3>Lasts shaped for real feet</h3><p>A wide, stable heel and a width designed for long city walks, not just for photos.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/neva.webp" alt="Boots on the Neva embankment" loading="lazy" style="object-position:62% 50%"><span class="mpt"><img src="assets/img/minpromtorg.png" alt="Ministry of Industry and Trade of Russia"></span></div><h3>Made in Russia</h3><p>Origin confirmed by Russia’s Ministry of Industry and Trade. Every style is certified to EAEU standards.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/lasts2.webp" alt="" loading="lazy"><span class="tag label">Guarantee</span></div><h3>Try on, 30-day returns</h3><p>Try them on with the courier or at the pickup point. If they don’t fit, we refund you, even if you’ve already worn them at home.</p></article>
      </div>
      <div class="rail-progress"><i id="railBar"></i></div>
    </section>

    <section class="feature" id="finder" aria-label="Size finder">
      <div class="feature__media"><img src="assets/img/neva.webp" alt="Black leather boots on a granite embankment" loading="lazy"></div>
      <div class="feature__body rv">
        <span class="label">Size finder</span>
        <h2 class="h1">Your size<br>in 10 seconds.</h2>
        <p>Wrong size is the number one reason shoes get returned. Measure your foot from heel to big toe: we’ll match it to our lasts and show only what’s in stock.</p>
        <div class="finder" id="finderBox"></div>
      </div>
    </section>

    <section class="section wrap" id="looks" aria-label="Looks of the season">
      <div class="row-head"><h2 class="h2">Looks of the season.</h2><span class="muted small">Tap a dot to see the shoe</span></div>
      <div class="looks">${LOOKS.map((l, li) => `
        <figure class="look rv" style="margin:0">
          <div class="look__ph">
            <img src="${l.img}" alt="${esc(l.cap)}" loading="lazy">
            ${l.hots.filter(h => !h.hide).map(h => { const p = byId[h.id], v = p.variants[0]; return `
              <button class="hot" style="left:${h.x}%;top:${h.y}%" data-hot="${li}-${h.id}" aria-label="${esc(fullName(p))}"></button>
              <div class="hot-card" id="hc-${li}-${h.id}" style="left:${Math.min(h.x, 52)}%;top:${h.y - 26}%">
                <div class="t"><img src="${v.img}" alt=""></div>
                <div><b>${esc(fullName(p))}</b><span>${fmt(p.price)}</span><br><button class="link" data-qv="${p.id}">View</button></div>
              </div>`; }).join('')}
          </div>
          <figcaption class="look__cap"><b style="font-weight:400">${l.cap}</b><span>${l.note}</span></figcaption>
        </figure>`).join('')}</div>
    </section>

    <section class="wrap section--tight" id="journal" style="padding-top:0" aria-label="Journal">
      <div class="row-head"><h2 class="h2">Journal.</h2><a class="btn btn--outline" href="#/" data-act="journal">All stories</a></div>
      <div class="journal">${JOURNAL.map(j => `<a class="post rv" href="#/" data-act="journal"><div class="ph"><img src="${j.img}" alt="" loading="lazy"></div><div class="label">${j.tag}</div><h3>${j.title}</h3></a>`).join('')}</div>
    </section>`;
  }


  /* ------------------------------------------------------------ hero slider */
  function heroHTML() {
    const pin = (pn, i) => { const p = byId[pn.id], v = variant(p, pn.code); return `
      <button class="hs__pin ${pn.flip ? 'flip' : ''}" data-qv="${p.id}" data-code="${v.code}" data-pin="${i}" aria-label="${esc(fullName(p))}, ${fmt(p.price)}">
        <span class="hot"></span>
        <span class="hs__chip"><span class="t"><img src="${v.img}" alt=""></span><span><b>${esc(fullName(p))}</b><span>${fmt(p.price)}</span></span></span>
      </button>`; };
    return `<section class="hs" id="hero" aria-roledescription="carousel" aria-label="Autumn — winter collection" style="--n:${HERO.length}" data-theme="${HERO[0].theme}">
      ${HERO.map((s, i) => `
      <article class="hs__slide ${i === 0 ? 'is-active' : ''}" data-theme="${s.theme}" aria-roledescription="slide" aria-label="${i + 1} of ${HERO.length}: ${esc(s.short)}" ${i ? 'aria-hidden="true"' : ''}>
        <div class="hs__media"><img src="${s.img}" alt="" style="object-position:${s.pos}" ${i ? 'loading="lazy"' : ''}><div class="hs__shade"></div>${s.pins.map(pin).join('')}</div>
        <div class="hs__content">
          <span class="label hs__label hs__fade">${s.label}</span>
          <h${i ? 2 : 1} class="h-display hs__title">${s.title.map(t => `<span class="ln"><span>${t}</span></span>`).join('')}</h${i ? 2 : 1}>
          <p class="hs__fade">${s.text}</p>
          <div class="hs__ctas hs__fade">
            ${s.cta[1].startsWith('qv:') ? `<button class="btn btn--dark" data-qv="${s.cta[1].split(':')[1]}" data-code="${s.cta[1].split(':')[2]}">${s.cta[0]}</button>` : `<a class="btn btn--dark" href="${s.cta[1]}">${s.cta[0]}</a>`}
            <button class="btn btn--outline" data-scroll="finder">Find my size</button>
          </div>
        </div>
      </article>`).join('')}
      <div class="hs__bar">
        <ol class="hs__steps">${HERO.map((s, i) => `<li><button class="hs__step ${i === 0 ? 'on' : ''}" data-go="${i}" aria-label="Slide ${i + 1}: ${esc(s.short)}"><span><span class="n">0${i + 1}</span><span class="t">${s.short}</span></span><i><b></b></i></button></li>`).join('')}</ol>
        <div class="hs__nav">
          <span class="hs__count" aria-live="polite"><span id="hsNum">01</span> / 0${HERO.length}</span>
          <button class="arr" data-dir="-1" aria-label="Previous slide">${icon('arrow-l')}</button>
          <button class="arr" data-dir="1" aria-label="Next slide">${icon('arrow')}</button>
          <button class="hs__next" data-dir="1" aria-label="Next slide"><img src="" alt="" id="hsNext"></button>
        </div>
      </div>
    </section>`;
  }

  let heroRaf = 0;
  function initHero() {
    cancelAnimationFrame(heroRaf);
    const root = $('#hero'); if (!root) return;
    const slides = $$('.hs__slide', root), steps = $$('.hs__step', root);
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    const DUR = 7000, WIPE = 1250;
    let cur = 0, busy = false, held = false, elapsed = 0, last = performance.now();
    const thumbOf = i => HERO[i].img;
    const syncChrome = () => {
      root.dataset.theme = HERO[cur].theme;
      const h = $('#header'); if (h) h.classList.toggle('on-dark', HERO[cur].theme === 'dark');
      $('#hsNum').textContent = '0' + (cur + 1);
      $('#hsNext').src = thumbOf((cur + 1) % HERO.length);
      steps.forEach((s, i) => { s.classList.toggle('on', i === cur); s.classList.toggle('done', i < cur); s.style.setProperty('--p', 0); });
    };
    // offsetLeft/Top ignore transforms: measure the resting layout, the zoom animation moves pins together with the photo
    const rel = (el, anc) => { let x = 0, y = 0; while (el && el !== anc) { x += el.offsetLeft; y += el.offsetTop; el = el.offsetParent; } return [x, y]; };
    function placePins() {
      slides.forEach((sl, si) => {
        const media = $('.hs__media', sl), imgs = $$('img', media).filter(im => !im.closest('.hs__pin'));
        $$('.hs__pin', sl).forEach(el => {
          const pn = HERO[si].pins[+el.dataset.pin], img = imgs[pn.img || 0];
          if (!img || !img.naturalWidth) { el.classList.add('off'); return; }
          const [ix, iy] = rel(img, media), W = img.offsetWidth, H = img.offsetHeight;
          const k = Math.max(W / img.naturalWidth, H / img.naturalHeight), w = img.naturalWidth * k, h = img.naturalHeight * k;
          const [px, py] = (getComputedStyle(img).objectPosition || '50% 50%').split(' ').map(v => parseFloat(v) / 100);
          const x = ix + (W - w) * px + pn.fx * w, y = iy + (H - h) * py + pn.fy * h;
          const ok = x > ix + 24 && x < ix + W - 24 && y > iy + 24 && y < Math.min(iy + H, media.offsetHeight - 110) - 10;
          el.classList.toggle('off', !ok);
          el.style.left = x + 'px'; el.style.top = y + 'px';
        });
      });
    }
    function goTo(n, dir) {
      if (busy || n === cur) return;
      busy = true;
      const prev = slides[cur], next = slides[n];
      const fromLeft = dir ? dir < 0 : n < cur;
      slides.forEach(s => s.classList.remove('is-prev', 'from-left', 'is-enter'));
      prev.classList.remove('is-active'); prev.classList.add('is-prev'); prev.setAttribute('aria-hidden', 'true');
      prev.classList.toggle('from-left', fromLeft);
      void next.offsetWidth;
      next.classList.add('is-active', 'is-enter'); next.classList.toggle('from-left', fromLeft); next.removeAttribute('aria-hidden');
      cur = n; elapsed = 0; syncChrome();
      setTimeout(() => { prev.classList.remove('is-prev', 'from-left'); next.classList.remove('is-enter'); busy = false; }, reduce ? 0 : WIPE);
    }
    const step = d => goTo((cur + d + HERO.length) % HERO.length, d);
    // own timer instead of animationend: pause, hidden tab and manual switching don't break the counter
    const tick = now => {
      if (!document.body.contains(root)) return;
      const dt = Math.min(now - last, 100); last = now;
      if (!held && !busy && !reduce && document.visibilityState === 'visible' && root.getBoundingClientRect().bottom > 0) {
        elapsed += dt;
        steps[cur].style.setProperty('--p', Math.min(1, elapsed / DUR));
        if (elapsed >= DUR) step(1);
      }
      heroRaf = requestAnimationFrame(tick);
    };
    heroRaf = requestAnimationFrame(tick);
    root.addEventListener('click', e => {
      const g = e.target.closest('[data-go]'), d = e.target.closest('[data-dir]');
      if (g) goTo(+g.dataset.go); else if (d) step(+d.dataset.dir);
    });
    const hold = on => { held = on; root.classList.toggle('paused', on); };
    const HOLD = '.hs__content,.hs__pin,.hs__bar';
    root.addEventListener('mouseover', e => { if (e.target.closest(HOLD)) hold(true); });
    root.addEventListener('mouseout', e => { if (e.target.closest(HOLD) && !(e.relatedTarget && e.relatedTarget.closest && e.relatedTarget.closest(HOLD))) hold(false); });
    root.addEventListener('focusin', () => hold(true));
    root.addEventListener('focusout', () => hold(false));
    let sx = null, sy = null;
    root.addEventListener('touchstart', e => { sx = e.touches[0].clientX; sy = e.touches[0].clientY; }, { passive: true });
    root.addEventListener('touchend', e => {
      if (sx === null) return; const dx = e.changedTouches[0].clientX - sx, dy = e.changedTouches[0].clientY - sy; sx = null;
      if (Math.abs(dx) > 45 && Math.abs(dx) > Math.abs(dy)) step(dx < 0 ? 1 : -1);
    });
    HERO_KEYS = e => { if (!document.body.contains(root) || $('#qv').classList.contains('on') || e.target.matches('input,textarea,select')) return; if (root.getBoundingClientRect().bottom < 100) return; if (e.key === 'ArrowRight') step(1); if (e.key === 'ArrowLeft') step(-1); };
    $$('.hs__media > img', root).forEach(img => { if (!img.complete) img.addEventListener('load', placePins); });
    window.removeEventListener('resize', HERO_RESIZE); HERO_RESIZE = placePins; window.addEventListener('resize', HERO_RESIZE, { passive: true });
    syncChrome(); placePins();
    setTimeout(() => $$('.hs__media img[loading="lazy"]', root).forEach(i => { i.loading = 'eager'; }), 1200);
  }
  let HERO_RESIZE = () => {};
  let HERO_KEYS = null;
  document.addEventListener('keydown', e => { if (HERO_KEYS && !e.defaultPrevented) HERO_KEYS(e); });

  function bindHome() {
    initHero();
    // categories
    const setCat = i => {
      const c = CATS[i];
      $$('[data-ci]').forEach(img => img.classList.toggle('on', +img.dataset.ci === i));
      $$('[data-cat-i]').forEach(b => b.classList.toggle('on', +b.dataset.catI === i));
      $('#catText').textContent = c.text;
      const l = $('#catLink'); l.href = `#/catalog/${c.id}`; l.textContent = `Shop ${c.id === 'leto' ? 'the sale' : c.name.toLowerCase()}`;
      $('#catFrom').textContent = `from ${fmt(Math.min(...P.filter(p => p.cat === c.id).map(p => p.price)))}`;
    };
    $$('[data-cat-i]').forEach(b => {
      b.addEventListener('mouseenter', () => setCat(+b.dataset.catI));
      b.addEventListener('focus', () => setCat(+b.dataset.catI));
      b.addEventListener('click', () => { if (b.classList.contains('on') && b.closest('.cats__list')) location.hash = `#/catalog/${CATS[+b.dataset.catI].id}`; setCat(+b.dataset.catI); });
    });
    // tabs
    const grid = $('#newGrid');
    const renderNew = tab => {
      let list = tab === 'all' ? ['millionnaya', 'neva', 'liteyny', 'moyka', 'tavricheskaya', 'fontanka', 'okhta', 'sadovaya'].map(id => byId[id]) : P.filter(p => p.cat === tab);
      if (S.mySize) list = list.filter(p => p.variants.some(v => v.stock[S.mySize] > 0));
      list = list.slice(0, 8);
      grid.innerHTML = list.length ? list.map(p => cardHTML(p)).join('') : `<div class="empty-grid">No styles in size ${S.mySize} in this category. <button class="link" data-act="clear-size">Show all sizes</button></div>`;
      bindCards(grid);
      $('#sizeChip').innerHTML = S.mySize ? `<div style="margin:-8px 0 18px"><span class="chip-filter">In stock in size ${S.mySize}<button data-act="clear-size" aria-label="Clear">${icon('close')}</button></span></div>` : '';
    };
    $$('#newTabs button').forEach(b => b.addEventListener('click', () => { $$('#newTabs button').forEach(x => x.classList.toggle('on', x === b)); renderNew(b.dataset.tab); }));
    renderNew('all');
    // rail progress
    const rail = $('#valuesRail'), bar = $('#railBar');
    const upd = () => { const max = rail.scrollWidth - rail.clientWidth; const w = rail.clientWidth / rail.scrollWidth; bar.style.width = (w * 100) + '%'; bar.style.transform = `translateX(${max ? (rail.scrollLeft / max) * ((1 - w) / w) * 100 : 0}%)`; };
    rail.addEventListener('scroll', upd, { passive: true }); upd();
    const cards = $$('.value-card', rail);
    const updNum = () => { const w = cards[0].offsetWidth + 16, i = Math.round(rail.scrollLeft / w); const vis = Math.max(1, Math.round(rail.clientWidth / w)); $('#railNum').textContent = `0${Math.min(cards.length, i + 1)}${vis > 1 ? '–0' + Math.min(cards.length, i + vis) : ''} / 0${cards.length}`; };
    rail.addEventListener('scroll', updNum, { passive: true }); updNum();
    $$('[data-rail]').forEach(b => b.addEventListener('click', () => rail.scrollBy({ left: (+b.dataset.rail) * (cards[0].offsetWidth + 16), behavior: 'smooth' })));
    // finder
    renderFinder(renderNew);
    // hotspots
    $$('[data-hot]').forEach(b => b.addEventListener('click', e => {
      e.stopPropagation();
      const c = $('#hc-' + b.dataset.hot), was = c.classList.contains('on');
      $$('.hot-card').forEach(x => x.classList.remove('on'));
      if (!was) c.classList.add('on');
    }));
  }

  function renderFinder(onApply) {
    const box = $('#finderBox'); if (!box) return;
    let cm = S.mySize ? FOOT[S.mySize] : 24, width = S.myWidth || 'std';
    const sizeFor = c => { let best = '36'; SIZES.forEach(s => { if (c >= FOOT[s] - 0.01) best = s; }); return c < 22.8 ? null : c > 25.75 ? 'big' : best; };
    const draw = () => {
      const s = sizeFor(cm);
      const r = $('#footRange', box);
      const pct = ((cm - 22) / (26 - 22)) * 100;
      if (r) r.style.setProperty('--p', pct + '%');
      const out = s === null ? '<p>We don’t make sizes below EU 36 yet. <b>Leave your contact</b> and we’ll let you know when EU 35 arrives.</p>'
        : s === 'big' ? '<p>This collection stops at EU 41. <b>Message us</b> and we’ll suggest styles that run large.</p>'
        : `<p>Your size is <b>EU ${s}</b> (US ${US[s]})${width === 'wide' ? '. Styles for wide feet are marked on the product page' : ''}.<br>In stock: <b>${P.filter(p => p.variants.some(v => v.stock[s] > 0)).length} ${plural(P.filter(p => p.variants.some(v => v.stock[s] > 0)).length, 'style', 'styles')}</b></p>`;
      $('#finderOut', box).innerHTML = `${s && s !== 'big' ? `<div class="finder__size">${s}</div>` : ''}${out}`;
      $('#finderVal', box).innerHTML = `${cm.toFixed(1)}<small>cm · ${(cm / 2.54).toFixed(1)} in</small>`;
      $('#finderApply', box).classList.toggle('is-disabled', !s || s === 'big');
    };
    box.innerHTML = `
      <div class="finder__row"><span class="small muted">Foot length</span><span class="finder__val num" id="finderVal"></span></div>
      <input class="range" id="footRange" type="range" min="22" max="26" step="0.1" value="${cm}" aria-label="Foot length, cm">
      <div class="finder__scale"><span>22 cm</span><span>24 cm</span><span>26 cm</span></div>
      <div class="finder__row" style="margin:20px 0 0;align-items:center"><span class="small muted">Foot width</span>
        <div class="seg"><button data-w="std" class="${width === 'std' ? 'on' : ''}">Standard</button><button data-w="wide" class="${width === 'wide' ? 'on' : ''}">Wide</button></div></div>
      <div class="finder__out" id="finderOut"></div>
      <button class="btn btn--dark btn--block" id="finderApply">Show styles in my size</button>
      <div class="tiny muted" style="margin-top:12px;text-align:center">We’ll remember your size and preselect it on product pages</div>`;
    $('#footRange', box).addEventListener('input', e => { cm = +e.target.value; draw(); });
    $$('[data-w]', box).forEach(b => b.addEventListener('click', () => { width = b.dataset.w; $$('[data-w]', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    $('#finderApply', box).addEventListener('click', () => {
      const s = sizeFor(cm); if (!s || s === 'big') return;
      S.mySize = s; S.myWidth = width; persist();
      toast({ text: `Your size: EU ${s}`, sub: 'Showing only styles in stock' });
      if (onApply) { $$('#newTabs button').forEach((x, i) => x.classList.toggle('on', i === 0)); onApply('all'); }
      $('#new').scrollIntoView({ behavior: 'smooth' });
    });
    draw();
  }

  /* ---------------------------------------------------------------- catalog */
  function viewCatalog(cat) {
    const titles = { new: 'New in', fav: 'Wishlist', all: 'All shoes' };
    const title = titles[cat] || catName(cat);
    const c = CATS.find(x => x.id === cat);
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/">Home</a><span>/</span><a href="#/catalog">Shop</a>${cat !== 'all' ? `<span>/</span><span>${title}</span>` : ''}</div>
      <div class="cat-intro"><h1 class="h1">${title}</h1><p>${c ? c.text : cat === 'fav' ? 'Styles you’ve saved with the heart. Your wishlist is stored on this device.' : 'Women’s genuine leather shoes straight from our Saint Petersburg factory. No middleman markup.'}</p></div>
      <div class="toolbar">
        <div class="toolbar__left">
          <a class="pill ${cat === 'all' ? 'on' : ''}" href="#/catalog">All</a>
          ${CATS.map(x => `<a class="pill ${cat === x.id ? 'on' : ''}" href="#/catalog/${x.id}">${x.name}</a>`).join('')}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <select class="select" id="fSize" aria-label="Size"><option value="">Any size</option>${SIZES.map(s => `<option value="${s}" ${S.mySize === s ? 'selected' : ''}>EU ${s}</option>`).join('')}</select>
          <select class="select" id="fSort" aria-label="Sort"><option value="pop">Most popular</option><option value="new">Newest first</option><option value="asc">Price: low to high</option><option value="desc">Price: high to low</option></select>
        </div>
      </div>
      <div class="small muted" id="catCount" style="margin-bottom:14px"></div>
      <div class="grid" id="catGrid"></div>
    </div>`;
  }
  function bindCatalog(cat) {
    const draw = () => {
      const size = $('#fSize').value, sort = $('#fSort').value;
      let list = cat === 'all' ? P.slice() : cat === 'new' ? P.filter(p => p.badge === 'New' || ['tavricheskaya', 'sadovaya', 'konyushennaya', 'kolomna'].includes(p.id)) : cat === 'fav' ? P.filter(p => isFav(p.id)) : P.filter(p => p.cat === cat);
      if (size) list = list.filter(p => p.variants.some(v => v.stock[size] > 0));
      if (sort === 'asc') list.sort((a, b) => a.price - b.price);
      if (sort === 'desc') list.sort((a, b) => b.price - a.price);
      if (sort === 'new') list.sort((a, b) => (b.badge === 'New') - (a.badge === 'New'));
      $('#catCount').textContent = `${list.length} ${plural(list.length, 'style', 'styles')}${size ? ` in size EU ${size}` : ''}`;
      $('#catGrid').innerHTML = list.length ? list.map(p => cardHTML(p)).join('')
        : `<div class="empty-grid">${cat === 'fav' ? `${icon('heart', '')}<p>Your wishlist is empty. Tap the heart on any product to save it.</p><a class="btn btn--outline" href="#/catalog">Browse the shop</a>` : `No styles ${size ? `in size EU ${size} ` : ''}in this category. <button class="link" data-act="reset-size-filter">Clear size</button>`}</div>`;
      bindCards($('#catGrid'));
    };
    $('#fSize').addEventListener('change', e => { if (e.target.value) { S.mySize = e.target.value; persist(); } draw(); });
    $('#fSort').addEventListener('change', draw);
    draw();
  }

  /* ------------------------------------------------------------- quick view */
  const QV = { id: null, code: null, size: null, img: 0, guide: false };
  function openQV(id, code) {
    const p = byId[id]; if (!p) return;
    QV.id = id; QV.code = code || p.variants[0].code; QV.img = 0; QV.guide = false;
    const v = variant(p, QV.code);
    QV.size = S.mySize && v.stock[S.mySize] > 0 ? S.mySize : null;
    if (!S.viewed.includes(id)) { S.viewed.unshift(id); S.viewed = S.viewed.slice(0, 8); persist(); }
    renderQV();
    $('#overlay').classList.add('on'); $('#qv').classList.add('on'); document.body.classList.add('no-scroll');
    setTimeout(() => { const c = $('#qv .qv__close'); c && c.focus({ preventScroll: true }); }, 50);
  }
  function closeQV() {
    $('#qv').classList.remove('on'); $('#overlay').classList.remove('on'); document.body.classList.remove('no-scroll');
    if (/^#\/p\//.test(location.hash)) history.replaceState(null, '', '#/');
  }
  function sizeNote(p, v) {
    if (!QV.size) return S.mySize && !(v.stock[S.mySize] > 0)
      ? `<div class="size-note warn">${icon('info')}<span>Your size ${S.mySize} isn’t available in this colour. ${p.variants.length > 1 ? 'Try another colour or ' : ''}<button class="link" data-act="notify-mine">notify me when it’s back</button></span></div>`
      : '';
    const st = v.stock[QV.size] || 0;
    if (st === 0) return `<div class="size-note err">${icon('bell')}<span><b>Size ${QV.size} is out of stock.</b> Leave your phone number and we’ll text you as soon as the next batch is made (usually 2–3 weeks).</span></div>`;
    if (st === 1) return `<div class="size-note warn">${icon('alert')}<span>Only one pair left in size ${QV.size}</span></div>`;
    return `<div class="size-note ok">${icon('check')}<span>${QV.size === S.mySize ? 'Your measured size · ' : ''}In stock, ships ${new Date().getHours() < 16 ? 'today' : 'tomorrow'}</span></div>`;
  }
  function renderQV() {
    const p = byId[QV.id], v = variant(p, QV.code);
    const g = v.gallery;
    const inCart = S.cart.some(l => l.id === p.id && l.code === v.code && l.size === QV.size);
    const out = QV.size && !(v.stock[QV.size] > 0);
    $('#qv').innerHTML = `
      <button class="icon-btn qv__close" data-act="qv-close" aria-label="Close">${icon('close')}</button>
      <div class="qv__gallery">
        <div class="qv__thumbs">${g.map((src, i) => `<button class="${i === QV.img ? 'on' : ''}" data-img="${i}" aria-label="Photo ${i + 1}"><img src="${src}" alt=""></button>`).join('')}</div>
        <div class="qv__stage" id="qvStage">
          <img src="${g[QV.img]}" alt="${esc(fullName(p))}, photo ${QV.img + 1}" class="${QV.img === g.length - 1 && p.variants[0].hover === g[g.length - 1] ? 'cover' : ''}">
          <div class="qv__nav"><button data-act="img-prev" aria-label="Previous photo">${icon('arrow-l')}</button><button data-act="img-next" aria-label="Next photo">${icon('arrow')}</button></div>
          <div class="qv__dots">${g.map((_, i) => `<i class="${i === QV.img ? 'on' : ''}"></i>`).join('')}</div>
        </div>
      </div>
      <div class="qv__info">
        <div class="qv__meta">${p.badge ? `<span class="label ${p.old ? 'accent' : ''}">${p.badge}</span>` : ''}<span class="label">Style ${v.code}</span></div>
        <h2 class="qv__title">${fullName(p)}</h2>
        <div class="qv__type">${p.season} · ${p.temp} · ${v.color}</div>
        <div class="qv__price"><span class="num">${fmt(p.price)}</span>${p.old ? `<s>${fmt(p.old)}</s>` : ''}</div>
        <div class="qv__split">or <b>4 × ${fmt(Math.ceil(p.price / 4))}</b> with Pay in 4, interest-free</div>

        ${p.variants.length > 1 ? `<div class="opt"><div class="opt__head"><span>Colour: <b>${v.color}</b></span></div>
          <div class="colors">${p.variants.map(x => `<button class="color ${x.code === v.code ? 'on' : ''}" data-color="${x.code}" aria-label="${x.color}" title="${x.color}"><img src="${x.img}" alt=""></button>`).join('')}</div></div>` : ''}

        <div class="opt" id="sizeOpt">
          <div class="opt__head"><span>Size (EU)${QV.size ? `: <b>${QV.size}</b> · US ${US[QV.size]}` : ''}</span><button class="link" data-act="guide">${QV.guide ? 'Hide size chart' : 'Size guide'}</button></div>
          <div class="sizes" role="radiogroup" aria-label="Size">${SIZES.map(s => { const st = v.stock[s] || 0; return `<button class="size ${st === 0 ? 'out' : ''} ${QV.size === s ? 'on' : ''} ${S.mySize === s ? 'mine' : ''}" data-size="${s}" role="radio" aria-checked="${QV.size === s}" aria-label="EU ${s}${st === 0 ? ', out of stock' : st === 1 ? ', last pair' : ''}">${s}${st === 1 ? '<span class="last">1 left</span>' : ''}</button>`; }).join('')}</div>
          <div id="sizeNote">${sizeNote(p, v)}</div>
          <div class="notify ${out ? 'on' : ''}" id="notify"><input type="tel" placeholder="+44 7700 900123" aria-label="Phone number for restock alert" value="${esc(S.form.phone || '')}"><button class="btn btn--outline" data-act="notify">Notify me</button></div>
          <div class="size-guide ${QV.guide ? 'on' : ''}">
            <table><tr><th>EU</th>${SIZES.map(s => `<td class="${QV.size === s ? 'on' : ''}">${s}</td>`).join('')}</tr><tr><th>US</th>${SIZES.map(s => `<td class="${QV.size === s ? 'on' : ''}">${US[s]}</td>`).join('')}</tr><tr><th>UK</th>${SIZES.map(s => `<td class="${QV.size === s ? 'on' : ''}">${UK[s]}</td>`).join('')}</tr><tr><th>Foot, cm</th>${SIZES.map(s => `<td class="${QV.size === s ? 'on' : ''}">${FOOT[s]}</td>`).join('')}</tr></table>
            <p class="tiny muted" style="margin:10px 0 0">True to size. If you have wide feet or a high instep, go half a size up. <button class="link" data-act="to-finder">Find by foot length</button></p>
          </div>
        </div>

        <div class="perks">
          <div>${icon('try')}Try on before you pay</div>
          <div>${icon('truck')}Europe from 3 days, worldwide from 5</div>
          <div>${icon('return')}30-day returns</div>
        </div>

        <div class="acc on"><button data-acc>Description<i></i></button><div class="acc__body">${esc(p.desc)}</div></div>
        <div class="acc"><button data-acc>Details<i></i></button><div class="acc__body"><table class="spec">${p.specs.map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('')}<tr><td>Made in</td><td>Saint Petersburg, Russia</td></tr></table></div></div>
        <div class="acc"><button data-acc>Shipping & returns<i></i></button><div class="acc__body">Courier delivery across Europe from $15, worldwide from $29. Pickup points from $6. Free on orders over ${fmt(FREE_SHIP)}. Try your shoes on with the courier (15 minutes) or in the pickup point fitting room. If a pair doesn’t fit, you only pay for what you keep. Returns are free within 30 days.</div></div>

        <div class="qv__cta" id="qvCta">
          ${out
            ? `<button class="btn btn--dark btn--lg" data-act="notify-focus">${icon('bell')} Notify me when it’s back</button>`
            : inCart
              ? `<a class="btn btn--dark btn--lg" href="#/cart" data-act="qv-close-nav">${icon('check')} In your bag · Checkout</a><button class="btn btn--outline btn--lg" data-act="qv-close" style="flex:.7">Keep shopping</button>`
              : `<button class="btn btn--dark btn--lg" data-act="add">${QV.size ? `Add to bag — ${fmt(p.price)}` : 'Select a size'}</button>`}
          <button class="icon-btn ${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="Add to wishlist">${icon('heart')}</button>
        </div>
      </div>`;
  }
  function qvHandle(e) {
    const t = e.target.closest('button,a'); if (!t) return;
    const p = byId[QV.id], v = variant(p, QV.code);
    if (t.dataset.size) { QV.size = t.dataset.size; renderQV(); return; }
    if (t.dataset.color) { QV.code = t.dataset.color; QV.img = 0; if (QV.size && !(variant(p, QV.code).stock[QV.size] > 0) && S.mySize !== QV.size) QV.size = null; renderQV(); return; }
    if (t.dataset.img) { QV.img = +t.dataset.img; renderQV(); return; }
    if (t.hasAttribute('data-acc')) { t.parentElement.classList.toggle('on'); return; }
    const a = t.dataset.act;
    if (a === 'img-next') { QV.img = (QV.img + 1) % v.gallery.length; renderQV(); }
    if (a === 'img-prev') { QV.img = (QV.img - 1 + v.gallery.length) % v.gallery.length; renderQV(); }
    if (a === 'guide') { QV.guide = !QV.guide; renderQV(); }
    if (a === 'to-finder') { closeQV(); go('#/', 'finder'); }
    if (a === 'notify-mine') { QV.size = S.mySize; renderQV(); setTimeout(() => $('#notify input').focus(), 30); }
    if (a === 'notify-focus') { const i = $('#notify input'); i.focus(); i.scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    if (a === 'notify') {
      const i = $('#notify input'), d = i.value.replace(/\D/g, '');
      if (d.length < 8) { i.style.borderColor = 'var(--err)'; i.focus(); return; }
      $('#notify').innerHTML = `<div class="size-note ok" style="margin:0">${icon('check')}<span>Done. We’ll text ${esc(i.value)} when size ${QV.size} is back.</span></div>`;
    }
    if (a === 'add') {
      if (!QV.size) {
        const opt = $('#sizeOpt'); opt.classList.remove('shake'); void opt.offsetWidth; opt.classList.add('shake');
        $('#sizeNote').innerHTML = `<div class="size-note err">${icon('alert')}<span>Pick a size and we’ll add it to your bag</span></div>`;
        return;
      }
      addToCart(p.id, v.code, QV.size);
      renderQV();
      toast({ text: 'Added to bag', sub: `${fullName(p)} · ${v.color} · EU ${QV.size}`, img: v.img, action: 'Checkout', go: '#/cart' });
    }
    if (a === 'qv-close') closeQV();
    if (a === 'qv-close-nav') { closeQV(); }
  }

  /* ------------------------------------------------------------------ cart */
  function viewCart() {
    if (!S.cart.length) return `<div class="page wrap"><div class="empty">
      ${icon('bag')}
      <h1 class="h1">Your bag is empty</h1>
      <p>Start with the new autumn styles, or find your size and we’ll show only what’s in stock.</p>
      <div class="empty__cats">${CATS.slice(0, 5).map(c => `<a class="pill" href="#/catalog/${c.id}">${c.name}</a>`).join('')}</div>
      </div>
      ${S.viewed.length ? `<div style="margin-top:72px"><div class="row-head"><h2 class="h3">Recently viewed</h2></div><div class="grid">${S.viewed.slice(0, 4).map(id => cardHTML(byId[id], { noHint: true })).join('')}</div></div>` : ''}
    </div>`;
    const t = totals();
    const left = Math.max(0, FREE_SHIP - t.total);
    const problems = S.cart.filter(l => l.key === S.soldKey).length;
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/">Home</a><span>/</span><span>Bag</span></div>
      <div class="page-title"><h1 class="h1">Your bag</h1><span class="muted">${cartCount()} ${plural(cartCount(), 'item', 'items')}</span></div>
      <div class="cart">
        <div>
          <div class="ship-bar ${left === 0 ? 'done' : ''}">${left === 0 ? `${icon('check')} You’ve unlocked free shipping` : `You’re <b>${fmt(left)}</b> away from free shipping`}
            <div class="ship-bar__track"><i style="width:${Math.min(100, t.total / FREE_SHIP * 100)}%"></i></div></div>
          <div id="lines">${S.cart.map(l => lineHTML(l)).join('')}</div>
        </div>
        <aside class="summary" aria-label="Order summary">
          <h3>Order summary</h3>
          <div class="sum-row"><span>Items (${cartCount()})</span><span class="num">${fmt(t.sub + t.saleSave)}</span></div>
          ${t.saleSave ? `<div class="sum-row disc"><span>Sale savings</span><span class="num">−${fmt(t.saleSave)}</span></div>` : ''}
          ${t.disc ? `<div class="sum-row disc"><span>Promo code ${S.promo}</span><span class="num">−${fmt(t.disc)}</span></div>` : ''}
          <div class="sum-row"><span>Shipping</span><span>${left === 0 ? '<span style="color:var(--ok)">free</span>' : 'from $6'}</span></div>
          <div class="sum-total"><span>Total</span><span class="num">${fmt(t.total)}</span></div>
          <div class="promo"><input id="promoIn" placeholder="Promo code" value="${S.promo || ''}" aria-label="Promo code"><button class="btn btn--outline" data-act="promo">${S.promo ? 'Remove' : 'Apply'}</button></div>
          <div class="promo-msg ${S.promo ? 'ok' : ''}" id="promoMsg">${S.promo ? PROMOS[S.promo].text + (PROMOS[S.promo].all ? '' : ', excluding sale items') : '<span class="muted">Try AUTUMN10</span>'}</div>
          <button class="btn btn--dark btn--lg btn--block" data-act="to-checkout" ${problems ? 'disabled' : ''} style="margin-top:12px">Checkout</button>
          ${problems ? `<p class="tiny" style="color:var(--err);margin:10px 0 0;text-align:center">Fix the item issue to continue</p>` : '<p class="tiny muted" style="margin:10px 0 0;text-align:center">Guest checkout · takes about a minute</p>'}
          <div class="trust">
            <div>${icon('try')}Try on before you pay, with the courier or at a pickup point</div>
            <div>${icon('return')}30-day returns, refunds within 3 days</div>
            <div>${icon('shield')}60-day factory warranty on seams and soles</div>
          </div>
          <div class="pay-logos"><span>APPLE PAY</span><span>GOOGLE PAY</span><span>VISA</span><span>MASTERCARD</span><span>PAY IN 4</span></div>
        </aside>
      </div>
      <div style="margin-top:88px"><div class="row-head"><h2 class="h3">Complete the look</h2></div>
        <div class="grid">${['fontanka', 'okhta', 'ermitazh', 'konyushennaya'].filter(id => !S.cart.some(l => l.id === id)).slice(0, 4).map(id => cardHTML(byId[id], { noHint: true })).join('')}</div></div>
    </div>`;
  }
  function lineHTML(l) {
    const { p, v, sum, old } = lineInfo(l);
    const problem = l.key === S.soldKey;
    return `<div class="line-item ${problem ? 'is-problem' : ''}" data-line="${l.key}">
      <div class="line-item__ph" data-qv="${p.id}" data-code="${v.code}"><img src="${v.img}" alt=""></div>
      <div>
        <div class="line-item__name" data-qv="${p.id}" data-code="${v.code}">${fullName(p)}</div>
        <div class="line-item__meta"><span class="sw" style="background:${v.hex}"></span>${v.color} · Style ${v.code}</div>
        <div class="line-item__ctrl">
          <select class="mini-select" data-line-size aria-label="Size">${SIZES.map(s => { const st = v.stock[s] || 0; const dis = st === 0 || (problem && s === l.size); return `<option value="${s}" ${s === l.size ? 'selected' : ''} ${dis && s !== l.size ? 'disabled' : ''}>Size EU ${s}${st === 0 || (problem && s === l.size) ? ' — sold out' : st === 1 ? ' — 1 left' : ''}</option>`; }).join('')}</select>
          <div class="qty"><button data-q="-1" ${l.qty <= 1 ? 'disabled' : ''} aria-label="Decrease">−</button><span class="num">${l.qty}</span><button data-q="1" ${l.qty >= Math.min(5, v.stock[l.size] || 1) ? 'disabled' : ''} aria-label="Increase">+</button></div>
        </div>
      </div>
      <div class="line-item__right">
        <div class="line-item__price num">${fmt(sum)}${old ? `<s>${fmt(old * l.qty)}</s>` : ''}</div>
        <div class="line-item__actions"><button data-act="line-fav">${isFav(p.id) ? 'In wishlist' : 'Save'}</button><button data-act="line-del">Remove</button></div>
      </div>
      ${problem ? `<div class="problem">${icon('alert')}<div><b>Size ${l.size} sold out</b> while it was in your bag. Pick another size or remove the item. The rest of your order is saved.
        <div class="acts"><button data-act="line-notify">Notify me when it’s back</button><button data-act="line-del">Remove</button></div></div></div>` : ''}
    </div>`;
  }
  function bindCart() {
    const root = $('#app');
    root.addEventListener('change', e => {
      if (!e.target.matches('[data-line-size]')) return;
      const k = e.target.closest('[data-line]').dataset.line, l = S.cart.find(x => x.key === k);
      const nk = key(l.id, l.code, e.target.value);
      const dup = S.cart.find(x => x.key === nk);
      if (dup && dup !== l) { dup.qty += l.qty; S.cart = S.cart.filter(x => x !== l); } else { l.size = e.target.value; l.key = nk; }
      if (S.soldKey === k) { S.soldKey = null; toast({ text: 'Size updated', sub: 'You can check out now' }); }
      persist(); route();
    });
    root.addEventListener('click', e => {
      const t = e.target.closest('button'); if (!t) return;
      const row = t.closest('[data-line]');
      if (row && t.dataset.q) {
        const l = S.cart.find(x => x.key === row.dataset.line); l.qty = Math.max(1, l.qty + (+t.dataset.q)); persist(); route(); updateBadges();
      }
      if (row && t.dataset.act === 'line-del') {
        const idx = S.cart.findIndex(x => x.key === row.dataset.line), l = S.cart[idx], p = byId[l.id];
        S.cart.splice(idx, 1); if (S.soldKey === l.key) S.soldKey = null; persist(); route(); updateBadges();
        toast({ text: 'Item removed', sub: fullName(p), action: 'Undo', ttl: 6000, onAction: () => { S.cart.splice(idx, 0, l); persist(); route(); updateBadges(); } });
      }
      if (row && t.dataset.act === 'line-fav') { const l = S.cart.find(x => x.key === row.dataset.line); if (!isFav(l.id)) toggleFav(l.id); route(); }
      if (row && t.dataset.act === 'line-notify') { toast({ text: 'We’ll let you know', sub: 'You’ll get a text when the size is back' }); }
      if (t.dataset.act === 'promo') {
        const inp = $('#promoIn'), code = inp.value.trim().toUpperCase(), msg = $('#promoMsg');
        if (S.promo) { S.promo = null; persist(); route(); return; }
        if (!code) { msg.className = 'promo-msg err'; msg.textContent = 'Enter a promo code'; return; }
        if (!PROMOS[code]) { msg.className = 'promo-msg err'; msg.textContent = 'This code doesn’t exist or has expired'; inp.focus(); return; }
        const t2 = (() => { S.promo = code; const r = totals(); S.promo = null; return r; })();
        if (!t2.disc) { msg.className = 'promo-msg err'; msg.textContent = 'This code doesn’t apply to sale items'; return; }
        S.promo = code; persist(); route();
      }
      if (t.dataset.act === 'to-checkout') location.hash = '#/checkout';
    });
  }

  /* -------------------------------------------------------------- checkout */
  // z: 0 — Saint Petersburg (showroom), 1 — Baltics & Finland, 2 — Western Europe, 3 — long haul, 4 — no courier service
  const CITIES = [
    { n: 'Saint Petersburg', r: 'Russia', z: 0 }, { n: 'Helsinki', r: 'Finland', z: 1 }, { n: 'Tallinn', r: 'Estonia', z: 1 },
    { n: 'Riga', r: 'Latvia', z: 1 }, { n: 'London', r: 'United Kingdom', z: 2 }, { n: 'Berlin', r: 'Germany', z: 2 },
    { n: 'Paris', r: 'France', z: 2 }, { n: 'Milan', r: 'Italy', z: 2 }, { n: 'Amsterdam', r: 'Netherlands', z: 2 },
    { n: 'Barcelona', r: 'Spain', z: 2 }, { n: 'New York', r: 'United States', z: 3 }, { n: 'Los Angeles', r: 'United States', z: 3 },
    { n: 'Toronto', r: 'Canada', z: 3 }, { n: 'Dubai', r: 'United Arab Emirates', z: 3 }, { n: 'Sydney', r: 'Australia', z: 3 },
    { n: 'Reykjavík', r: 'Iceland', z: 4 }
  ];
  const PVZ_SPB = [
    { id: 'p1', name: 'Pickup point · Tsvetochnaya St, 6', addr: '6 Tsvetochnaya St (next to the factory)', hours: 'Daily 10 am – 9 pm', x: 48, y: 64, fit: true, days: 1 },
    { id: 'p2', name: 'Pickup point · Nevsky Prospekt, 88', addr: '88 Nevsky Prospekt', hours: 'Daily 9 am – 10 pm', x: 52, y: 40, fit: true, days: 1 },
    { id: 'p3', name: 'Pickup point · Bolshoy Prospekt P.S., 37', addr: '37 Bolshoy Prospekt P.S.', hours: 'Mon–Sat 10 am – 8 pm', x: 36, y: 22, fit: true, days: 2 },
    { id: 'p4', name: 'Pickup point · Sredny Prospekt V.O., 18', addr: '18 Sredny Prospekt V.O.', hours: 'Closed for renovation until 12 October', x: 24, y: 36, closed: true, days: 2 },
    { id: 'p5', name: 'Pickup point · Moskovsky Prospekt, 140', addr: '140 Moskovsky Prospekt', hours: 'Daily 9 am – 10 pm', x: 50, y: 82, fit: false, days: 2 }
  ];
  const pvzFor = city => city.z === 0 ? PVZ_SPB : [
    { id: 'o1', name: `Pickup point · ${city.n}, 24 High Street`, addr: '24 High Street', hours: 'Daily 10 am – 8 pm', x: 44, y: 46, fit: true, days: 1 },
    { id: 'o2', name: `Parcel locker · ${city.n}, 7 Park Avenue`, addr: '7 Park Avenue', hours: 'Open 24/7', x: 62, y: 30, fit: false, days: 1 },
    { id: 'o3', name: `Pickup point · ${city.n}, 51 Market Street`, addr: '51 Market Street', hours: 'Mon–Fri 10 am – 7 pm', x: 30, y: 70, fit: true, days: 2 }
  ];
  function shipOptions(city) {
    const t = totals(), free = t.total >= FREE_SHIP;
    const base = [0, 2, 3, 5, 7][city.z] + CUT;
    return [
      { id: 'courier', t: city.z === 0 ? 'Courier' : 'Express courier', d: city.z === 4 ? 'Courier delivery isn’t available in this city' : `${dLabel(1 + base)} · 15-minute try-on`, price: city.z === 4 ? null : (free && city.z < 3 ? 0 : [9, 15, 19, 29][city.z]), days: 1 + base, tags: ['Try-on', 'Keep only what fits'], dis: city.z === 4 },
      { id: 'pvz', t: 'Pickup point or parcel locker', d: `${dLabel(1 + base)} · fitting room at selected points`, price: free ? 0 : [6, 8, 10, 14, 18][city.z], days: 1 + base, tags: ['Try-on', 'Held for 7 days'] },
      { id: 'post', t: 'Standard post', d: `${dShort(addDays(5 + base))} — ${dShort(addDays(9 + base))} · no try-on`, price: 12, days: 7 + base, tags: [] },
      { id: 'pickup', t: 'Collect from the factory showroom', d: '6 Tsvetochnaya St · ' + (new Date().getHours() < 14 ? 'today after 5 pm' : 'tomorrow after 12 pm'), price: 0, days: new Date().getHours() < 14 ? 0 : 1, tags: ['Try on the whole collection'], dis: city.z !== 0, hide: city.z !== 0 }
    ].filter(o => !o.hide);
  }
  const CO = { city: null, ship: null, pvz: null, slotDay: 1, slot: 0, pay: 'sbp', err: null, cityOpen: false };
  function initCO() {
    const f = S.form;
    CO.city = CITIES.find(c => c.n === (f.city || 'London')) || CITIES[4];
    const opts = shipOptions(CO.city);
    CO.ship = f.ship && opts.some(o => o.id === f.ship && !o.dis) ? f.ship : opts.find(o => !o.dis).id;
    CO.pvz = f.pvz || null; CO.pay = f.pay || 'sbp'; CO.err = null; CO.slot = f.slot ?? 0; CO.slotDay = f.slotDay ?? 0;
  }
  function viewCheckout() {
    if (!S.cart.length) return `<div class="page wrap"><div class="empty">${icon('bag')}<h1 class="h1">Your bag is empty</h1><p>Nothing to check out yet. Add a few styles from the shop.</p><a class="btn btn--dark" href="#/catalog">Go to shop</a></div></div>`;
    if (S.cart.some(l => l.key === S.soldKey)) { location.hash = '#/cart'; return ''; }
    initCO();
    return `<div class="page wrap" style="padding-top:32px">
      <div class="checkout">
        <form id="coForm" novalidate>
          <div class="mob-summary" id="mobSum"></div>
          <div class="co-block">
            <div class="co-block__head"><span class="n">01</span><h2>Contact</h2><span class="aside">No account needed</span></div>
            <div class="fields">
              ${field('phone', 'Phone', 'tel', 'We’ll text you order updates', 'tel')}
              ${field('name', 'Full name', 'text', 'So the courier knows who to ask for', 'name')}
              ${field('email', 'Email (optional)', 'email', 'For your receipt', 'email', 'full')}
            </div>
          </div>
          <div class="co-block">
            <div class="co-block__head"><span class="n">02</span><h2>Delivery</h2></div>
            <div class="field" style="margin-bottom:20px" id="cityField">
              <input id="f-city" type="text" placeholder=" " autocomplete="off" value="${esc(CO.city.n)}" aria-label="City"><label for="f-city">City</label>
              <div class="suggest" id="citySug"></div>
            </div>
            ${!S.form.city ? `<div class="city-hint" id="cityHint">${icon('pin')} Detected from your IP. Not your city? <button type="button" data-act="city-change">Change</button></div>` : ''}
            <div id="cityNotice"></div>
            <div class="opts" id="shipOpts"></div>
          </div>
          <div class="co-block">
            <div class="co-block__head"><span class="n">03</span><h2>Payment</h2></div>
            <div class="opts" id="payOpts"></div>
          </div>
          <div class="co-submit">
            <div id="payErr"></div>
            <label class="check"><input type="checkbox" id="f-sub" ${S.form.sub ? 'checked' : ''}><span>Send me news and private sales<small>No more than once a week. Unsubscribe in one click</small></span></label>
            <button class="btn btn--dark btn--lg btn--block" type="submit" id="coSubmit" style="margin-top:22px"></button>
            <p>By placing your order, you agree to our terms of sale and privacy policy. This is a prototype: nothing is sent anywhere, and your data stays in this browser.</p>
          </div>
        </form>
        <aside class="co-summary" id="coSum" aria-label="Order summary"></aside>
      </div>
    </div>`;
  }
  function field(id, label, type, hint, ac, cls = '') {
    return `<div class="field ${cls}" id="fld-${id}"><input id="f-${id}" type="${type}" placeholder=" " autocomplete="${ac}" value="${esc(S.form[id] || '')}" ${type === 'tel' ? 'inputmode="tel"' : ''}><label for="f-${id}">${label}</label><span class="tick">${icon('check')}</span><div class="hint">${hint}</div></div>`;
  }
  function phoneMask(v) {
    // international: + and up to 15 digits, grouped for readability
    const p = v.replace(/\D/g, '').slice(0, 15);
    return p ? '+' + p.replace(/(\d{1,3})(\d{1,4})?(\d{1,4})?(\d{1,4})?/, (m, a, b, c, e) => [a, b, c, e].filter(Boolean).join(' ')) : '';
  }
  const VALID = {
    phone: v => { const n = v.replace(/\D/g, '').length; return n >= 8 && n <= 15 ? '' : 'Enter your full number with country code, e.g. +44 7700 900123'; },
    name: v => v.trim().length >= 2 ? (/\d/.test(v) ? 'Names can’t contain numbers' : '') : 'What’s your name?',
    email: v => !v.trim() || /^[^@\s]+@[^@\s]+\.[a-z]{2,}$/i.test(v.trim()) ? '' : 'Check the address, e.g. anna@example.com',
    street: v => v.trim().length >= 3 ? '' : 'Enter your street address',
    house: v => v.trim() ? '' : 'Required'
  };
  function setFieldState(id, show) {
    const inp = $('#f-' + id); if (!inp) return true;
    const err = VALID[id] ? VALID[id](inp.value) : '';
    const f = $('#fld-' + id), hint = $('.hint', f);
    if (!hint.dataset.def) hint.dataset.def = hint.textContent;
    if (show) { f.classList.toggle('err', !!err); hint.textContent = err || hint.dataset.def; }
    f.classList.toggle('ok', !err && !!inp.value.trim());
    if (!err && !show) { f.classList.remove('err'); hint.textContent = hint.dataset.def; }
    return !err;
  }
  function drawShip() {
    const opts = shipOptions(CO.city);
    if (opts.find(o => o.id === CO.ship)?.dis) CO.ship = opts.find(o => !o.dis).id;
    $('#cityNotice').innerHTML = CO.city.z === 4 ? `<div class="notice warn">${icon('info')}<div><b>Couriers don’t deliver to ${CO.city.n}.</b> Pickup points and standard post are available, with dates and prices below.</div></div>` : '';
    $('#shipOpts').innerHTML = opts.map(o => `
      <div class="opt-card ${CO.ship === o.id ? 'on' : ''} ${o.dis ? 'dis' : ''}" data-ship="${o.id}" role="radio" aria-checked="${CO.ship === o.id}" tabindex="${o.dis ? -1 : 0}">
        <span class="radio"></span>
        <div><div class="opt-card__t">${o.t}</div><div class="opt-card__d">${o.d}</div>${o.tags.length && !o.dis ? `<div class="opt-card__tags">${o.tags.map(t => `<span class="${t === 'Try-on' ? 'g' : ''}">${t}</span>`).join('')}</div>` : ''}</div>
        <div class="opt-card__p">${o.price === null ? '—' : o.price === 0 ? '<span class="free">Free</span>' : fmt(o.price)}</div>
        ${CO.ship === o.id && !o.dis ? `<div class="sub-panel" data-stop>${subPanel(o)}</div>` : ''}
      </div>`).join('');
    bindSubPanel();
    drawPay(); drawSummary();
  }
  function subPanel(o) {
    if (o.id === 'courier') {
      const days = [0, 1, 2].map(i => o.days + i);
      const slots = ['10 am – 2 pm', '2 pm – 6 pm', '6 pm – 10 pm'];
      const evening = new Date().getHours() >= 18;
      return `<div class="fields">
          ${field('street', 'Street address', 'text', 'Start typing and we’ll suggest addresses', 'address-line1', 'full')}
          ${field('house', 'House / building no.', 'text', '', 'address-line2')}
          ${field('flat', 'Apt / suite', 'text', '', 'off')}
        </div>
        <div class="sub-label">Delivery day</div>
        <div class="slots">${days.map((d, i) => `<button type="button" class="slot ${CO.slotDay === i ? 'on' : ''}" data-day="${i}">${dLabel(d).replace(/^./, c => c.toUpperCase())}</button>`).join('')}</div>
        <div class="sub-label">Time slot</div>
        <div class="slots">${slots.map((s, i) => `<button type="button" class="slot ${CO.slot === i ? 'on' : ''}" data-slot="${i}" ${evening && CO.slotDay === 0 && o.days === 1 && i === 0 ? 'disabled' : ''}>${s}</button>`).join('')}</div>
        <div class="field full" style="margin-top:12px"><textarea id="f-comment" placeholder=" ">${esc(S.form.comment || '')}</textarea><label for="f-comment">Note for the courier</label></div>`;
    }
    if (o.id === 'pvz') {
      const list = pvzFor(CO.city);
      if (CO.pvz && !list.some(p => p.id === CO.pvz)) CO.pvz = null;
      return `<div class="pvz">
        <div class="pvz__map" aria-hidden="true">${mapSVG(CO.city.z === 0)}${list.map(p => `<button type="button" class="pin ${CO.pvz === p.id ? 'on' : ''}" data-pvz="${p.id}" style="left:${p.x}%;top:${p.y}%;${p.closed ? 'opacity:.35' : ''}" ${p.closed ? 'aria-disabled="true" title="Temporarily closed"' : ''}><svg viewBox="0 0 26 34"><path d="M13 33S1 20.5 1 12.5a12 12 0 0 1 24 0C25 20.5 13 33 13 33z" fill="#121110"/><circle cx="13" cy="12.5" r="4.2" fill="#FBF7EF"/></svg></button>`).join('')}</div>
        <div class="pvz__list">${list.map(p => `<button type="button" class="pvz-item ${CO.pvz === p.id ? 'on' : ''} ${p.closed ? 'closed' : ''}" data-pvz="${p.id}" ${p.closed ? 'aria-disabled="true"' : ''}>
          <b>${p.name}</b><span>${p.hours}</span>
          <div class="st">${p.closed ? '<span class="r">Not accepting orders right now</span>' : `<span>${dLabel(o.days + p.days - 1)}</span>${p.fit ? '<span class="g">Fitting room</span>' : '<span>No fitting room</span>'}`}</div></button>`).join('')}</div>
      </div><div id="pvzErr"></div>`;
    }
    if (o.id === 'post') return `<div class="fields">${field('street', 'Address: street, house, apartment', 'text', '', 'street-address', 'full')}${field('index', 'ZIP / postcode', 'text', 'We’ll fill it in from your address', 'postal-code')}</div>`;
    if (o.id === 'pickup') return `<div class="notice info" style="margin:0">${icon('store')}<div><b>Showroom at 6 Tsvetochnaya St</b>, Mon–Sat 10 am – 8 pm. We’ll hold your order for 3 days, and you can try on the whole collection, not just what you ordered.</div></div>`;
    return '';
  }
  function mapSVG(spb) {
    return `<svg viewBox="0 0 400 300" preserveAspectRatio="xMidYMid slice"><rect width="400" height="300" fill="#E9E3D7"/>
      ${spb ? `<path d="M-10 120 C 60 110, 110 135, 160 128 S 260 100, 300 112 S 380 150, 410 140 L410 165 C 370 172, 320 140, 290 138 S 200 160, 150 156 S 50 140, -10 148Z" fill="#CFD8DA"/>
      <path d="M120 140 C 130 180, 160 210, 170 300 L 186 300 C 176 210, 148 178, 138 140Z" fill="#CFD8DA" opacity=".8"/>
      <path d="M0 60 C 60 70, 100 50, 140 70 L 140 84 C 96 66, 60 84, 0 76Z" fill="#CFD8DA" opacity=".7"/>` : `<path d="M-10 200 C 80 180, 160 230, 260 210 S 380 180, 410 196 L410 222 C 360 208, 300 236, 250 236 S 80 206, -10 226Z" fill="#CFD8DA"/>`}
      <g stroke="#fff" stroke-width="5" fill="none" opacity=".9"><path d="M200 0 L 210 300"/><path d="M0 230 L 400 200"/><path d="M60 0 L 140 300"/><path d="M400 40 L 230 300"/></g>
      <g stroke="#fff" stroke-width="2" fill="none" opacity=".7"><path d="M0 40 L 400 70"/><path d="M0 270 L 400 250"/><path d="M300 0 L 320 300"/><path d="M100 0 L 60 300"/></g>
      <g fill="#DED6C7"><rect x="230" y="20" width="50" height="30" rx="3"/><rect x="40" y="180" width="60" height="38" rx="3"/><rect x="240" y="230" width="44" height="40" rx="3"/></g>
    </svg>`;
  }
  function bindSubPanel() {
    ['street', 'house', 'flat', 'index'].forEach(id => {
      const i = $('#f-' + id); if (!i) return;
      i.addEventListener('input', () => { S.form[id] = i.value; persist(); if ($('#fld-' + id).classList.contains('err')) setFieldState(id, true); });
      i.addEventListener('blur', () => VALID[id] && i.value && setFieldState(id, true));
    });
    const c = $('#f-comment'); if (c) c.addEventListener('input', () => { S.form.comment = c.value; persist(); });
    const st = $('#f-street');
    if (st && CO.ship === 'courier') {
      const box = document.createElement('div'); box.className = 'suggest'; st.parentElement.appendChild(box);
      const STREETS = CO.city.z === 0 ? ['Nevsky Prospekt', 'Liteyny Prospekt', 'Rubinstein Street', 'Moskovsky Prospekt', 'Bolshoy Prospekt P.S.', 'Sredny Prospekt V.O.', 'Fontanka Embankment', 'Sadovaya Street', 'Kamennoostrovsky Prospekt', 'Tsvetochnaya Street'] : ['High Street', 'Main Street', 'Market Street', 'Park Avenue', 'Station Road', 'King Street', 'Church Road', 'Queen Street', 'Victoria Road', 'Garden Lane'];
      st.addEventListener('input', () => {
        const q = st.value.toLowerCase().trim();
        const m = q.length < 2 ? [] : STREETS.filter(s => s.toLowerCase().includes(q)).slice(0, 5);
        box.innerHTML = m.map(s => `<button type="button" data-st="${s}">${s}<small>${CO.city.n}</small></button>`).join('');
        box.classList.toggle('on', m.length > 0);
      });
      box.addEventListener('mousedown', e => { const b = e.target.closest('[data-st]'); if (!b) return; e.preventDefault(); st.value = b.dataset.st; S.form.street = st.value; persist(); box.classList.remove('on'); setFieldState('street', true); $('#f-house').focus(); });
      st.addEventListener('blur', () => setTimeout(() => box.classList.remove('on'), 120));
    }
  }
  function drawPay() {
    const ship = CO.ship;
    const codDis = ship === 'post';
    if (codDis && CO.pay === 'cod') CO.pay = 'sbp';
    const t = totals();
    const opts = [
      { id: 'sbp', t: 'Apple Pay / Google Pay', d: 'Pay in one tap, no card details to type', tag: 'Fastest' },
      { id: 'card', t: 'Credit or debit card', d: 'Visa, Mastercard, Amex · 3-D Secure' },
      { id: 'split', t: 'Pay in 4', d: `${fmt(Math.ceil(t.total / 4))} today, then 3 payments every 2 weeks, interest-free` },
      { id: 'cod', t: 'Pay on delivery', d: codDis ? 'Not available for standard post. Choose a courier or a pickup point' : 'Pay by card after you try them on. Only pay for what fits', dis: codDis }
    ];
    $('#payOpts').innerHTML = opts.map(o => `<div class="opt-card ${CO.pay === o.id ? 'on' : ''} ${o.dis ? 'dis' : ''}" data-pay="${o.id}" role="radio" aria-checked="${CO.pay === o.id}" tabindex="${o.dis ? -1 : 0}"><span class="radio"></span><div><div class="opt-card__t">${o.t}</div><div class="opt-card__d">${o.d}</div>${o.tag ? `<div class="opt-card__tags"><span class="g">${o.tag}</span></div>` : ''}</div><div></div></div>`).join('');
    const total = t.total + shipPrice();
    $('#coSubmit').textContent = CO.pay === 'cod' ? `Place order · ${fmt(total)}` : `Pay ${fmt(CO.pay === 'split' ? Math.ceil(total / 4) : total)}${CO.pay === 'split' ? ' today' : ''}`;
  }
  function shipPrice() { const o = shipOptions(CO.city).find(x => x.id === CO.ship); return o && o.price ? o.price : 0; }
  function drawSummary() {
    const t = totals(), sp = shipPrice(), o = shipOptions(CO.city).find(x => x.id === CO.ship);
    const html = `<h3 class="h3" style="margin-bottom:18px">Order · ${cartCount()} ${plural(cartCount(), 'item', 'items')}</h3>
      <div class="co-summary__items">${S.cart.map(l => { const { p, v, sum } = lineInfo(l); return `<div class="co-item"><div class="ph"><img src="${v.img}" alt="">${l.qty > 1 ? `<em>${l.qty}</em>` : ''}</div><div>${fullName(p)}<small>${v.color} · EU ${l.size}</small></div><span class="num">${fmt(sum)}</span></div>`; }).join('')}</div>
      <div class="sum-row"><span>Items</span><span class="num">${fmt(t.sub + t.saleSave)}</span></div>
      ${t.saleSave ? `<div class="sum-row disc"><span>Sale savings</span><span class="num">−${fmt(t.saleSave)}</span></div>` : ''}
      ${t.disc ? `<div class="sum-row disc"><span>Promo code ${S.promo}</span><span class="num">−${fmt(t.disc)}</span></div>` : ''}
      <div class="sum-row"><span>Shipping</span><span class="num">${sp ? fmt(sp) : '<span style="color:var(--ok)">Free</span>'}</span></div>
      <div class="sum-total"><span>Total</span><span class="num">${fmt(t.total + sp)}</span></div>
      <div class="eta">${icon('clock')}<span>${o ? `<b>${o.id === 'pickup' ? 'Collection' : 'Delivery'} ${o.id === 'post' ? 'in 5–9 days' : dLabel(o.days)}</b>` : ''}<br>${CO.city.n}${o && (o.id === 'courier' || o.id === 'pvz') ? ' · try on before you pay' : ''}</span></div>
      <a class="link small" href="#/cart" style="display:inline-block;margin-top:14px">Edit bag</a>`;
    $('#coSum').innerHTML = html;
    const m = $('#mobSum');
    const open = m.classList.contains('on');
    m.innerHTML = `<button type="button" data-act="mobsum"><span>${open ? 'Hide' : 'Show'} order summary</span><b class="num">${fmt(t.total + sp)}</b></button><div class="in">${html}</div>`;
  }
  function bindCheckout() {
    if (!$('#coForm')) return;
    ['phone', 'name', 'email'].forEach(id => {
      const i = $('#f-' + id);
      if (S.form[id]) setFieldState(id, false);
      i.addEventListener('input', () => {
        if (id === 'phone') { const pos = i.value.length; i.value = i.value.replace(/\D/g, '').length ? phoneMask(i.value) : ''; }
        S.form[id] = i.value; persist();
        if ($('#fld-' + id).classList.contains('err') || (id === 'phone' && i.value.replace(/\D/g, '').length >= 10)) setFieldState(id, true);
      });
      i.addEventListener('focus', () => { if (id === 'phone' && !i.value) i.value = '+'; });
      i.addEventListener('blur', () => { if (id === 'phone' && i.value.replace(/\D/g, '').length <= 1) { i.value = ''; S.form.phone = ''; } if (i.value) setFieldState(id, true); });
    });
    // city
    const ci = $('#f-city'), sug = $('#citySug');
    const showSug = () => {
      const q = ci.value.toLowerCase().trim();
      const m = CITIES.filter(c => !q || c.n.toLowerCase().startsWith(q) || c.n.toLowerCase().includes(' ' + q)).slice(0, 6);
      sug.innerHTML = m.length ? m.map((c, i) => `<button type="button" data-city="${c.n}" class="${i === 0 ? 'hl' : ''}">${c.n}${c.r ? `<small>${c.r}</small>` : ''}</button>`).join('') : '<button type="button" disabled>City not found. Check the spelling</button>';
      sug.classList.add('on');
    };
    ci.addEventListener('focus', () => { ci.select(); showSug(); });
    ci.addEventListener('input', showSug);
    ci.addEventListener('keydown', e => { if (e.key === 'Enter') { e.preventDefault(); const b = $('[data-city]', sug); if (b) b.dispatchEvent(new MouseEvent('mousedown', { bubbles: true })); } });
    ci.addEventListener('blur', () => setTimeout(() => { sug.classList.remove('on'); ci.value = CO.city.n; }, 150));
    sug.addEventListener('mousedown', e => {
      const b = e.target.closest('[data-city]'); if (!b) return; e.preventDefault();
      CO.city = CITIES.find(c => c.n === b.dataset.city); S.form.city = CO.city.n; CO.pvz = null; persist();
      ci.value = CO.city.n; sug.classList.remove('on'); ci.blur();
      const h = $('#cityHint'); if (h) h.remove();
      drawShip();
    });
    // delegation
    $('#coForm').addEventListener('click', e => {
      if (e.target.closest('[data-stop]') && !e.target.closest('button')) return;
      const ship = e.target.closest('[data-ship]'), pay = e.target.closest('[data-pay]');
      const pv = e.target.closest('[data-pvz]'), day = e.target.closest('[data-day]'), slot = e.target.closest('[data-slot]');
      const act = e.target.closest('[data-act]');
      if (pv) { const p = pvzFor(CO.city).find(x => x.id === pv.dataset.pvz); if (p.closed) { $('#pvzErr').innerHTML = `<div class="notice err" style="margin:10px 0 0">${icon('alert')}<div>This point is closed until 12 October. Try the nearest ones: Tsvetochnaya St, 6 or Nevsky Prospekt, 88.</div></div>`; return; } CO.pvz = p.id; S.form.pvz = p.id; persist(); drawShip(); return; }
      if (day) { CO.slotDay = +day.dataset.day; S.form.slotDay = CO.slotDay; persist(); drawShip(); return; }
      if (slot) { CO.slot = +slot.dataset.slot; S.form.slot = CO.slot; persist(); drawShip(); return; }
      if (ship && !e.target.closest('.sub-panel')) { const o = shipOptions(CO.city).find(x => x.id === ship.dataset.ship); if (o.dis) return; CO.ship = o.id; S.form.ship = o.id; persist(); drawShip(); return; }
      if (pay) { if (pay.classList.contains('dis')) return; CO.pay = pay.dataset.pay; S.form.pay = CO.pay; persist(); drawPay(); $('#payErr').innerHTML = ''; return; }
      if (act && act.dataset.act === 'city-change') { ci.focus(); }
      if (act && act.dataset.act === 'mobsum') { $('#mobSum').classList.toggle('on'); drawSummary(); }
      if (act && act.dataset.act === 'retry') { submitOrder(true); }
      if (act && act.dataset.act === 'to-cod') { CO.pay = 'cod'; S.form.pay = 'cod'; persist(); drawPay(); $('#payErr').innerHTML = ''; $('#coSubmit').scrollIntoView({ block: 'center', behavior: 'smooth' }); }
    });
    $('#coForm').addEventListener('keydown', e => { if ((e.key === 'Enter' || e.key === ' ') && e.target.matches('.opt-card')) { e.preventDefault(); e.target.click(); } });
    $('#f-sub').addEventListener('change', e => { S.form.sub = e.target.checked; persist(); });
    $('#coForm').addEventListener('submit', e => { e.preventDefault(); submitOrder(false); });
    drawShip();
  }
  function submitOrder(retry) {
    let firstBad = null;
    const need = ['phone', 'name', 'email'];
    if (CO.ship === 'courier') need.push('street', 'house');
    if (CO.ship === 'post') need.push('street');
    need.forEach(id => { if (!setFieldState(id, true) && !firstBad) firstBad = $('#f-' + id); });
    if (CO.ship === 'pvz' && !CO.pvz) {
      $('#pvzErr').innerHTML = `<div class="notice err" style="margin:10px 0 0">${icon('alert')}<div>Choose a pickup point on the map or from the list</div></div>`;
      if (!firstBad) firstBad = $('#pvzErr');
    }
    if (firstBad) { firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (firstBad.focus) setTimeout(() => firstBad.focus({ preventScroll: true }), 300); return; }
    const sheet = $('#paySheet');
    $('#payTitle').textContent = CO.pay === 'cod' ? 'Placing your order…' : CO.pay === 'sbp' ? 'Opening Apple Pay / Google Pay…' : CO.pay === 'split' ? 'Opening Pay in 4…' : 'Redirecting to payment…';
    $('#payText').textContent = CO.pay === 'cod' ? 'Reserving your pairs at the factory warehouse' : 'Payment is simulated in this prototype';
    sheet.classList.add('on');
    setTimeout(() => {
      sheet.classList.remove('on');
      if (S.flags.payFail && CO.pay !== 'cod') {
        $('#payErr').innerHTML = `<div class="notice err">${icon('alert')}<div><b>Payment failed: your bank declined it.</b> You haven’t been charged, and your order and details are saved.
          <div class="acts"><button type="button" data-act="retry">Try again</button>${CO.ship !== 'post' ? '<button type="button" data-act="to-cod">Pay on delivery instead</button>' : ''}</div></div></div>`;
        $('#payErr').scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (retry) toast({ text: 'The bank declined the payment again', sub: 'Choose “Pay on delivery” to finish the scenario' });
        return;
      }
      const t = totals(), o = shipOptions(CO.city).find(x => x.id === CO.ship);
      const pv = CO.ship === 'pvz' ? pvzFor(CO.city).find(p => p.id === CO.pvz) : null;
      S.lastOrder = {
        num: 'SM-' + String(Date.now()).slice(-6),
        name: (S.form.name || '').trim().split(' ')[0],
        phone: S.form.phone, email: S.form.email,
        items: S.cart.map(l => ({ ...l })), total: t.total + shipPrice(), ship: o.t, shipId: o.id, days: o.days,
        addr: CO.ship === 'courier' ? `${CO.city.n}, ${S.form.street}, ${S.form.house}${S.form.flat ? ', apt ' + S.form.flat : ''}` : CO.ship === 'pvz' ? `${pv.name}` : CO.ship === 'pickup' ? 'Factory showroom, 6 Tsvetochnaya St' : `${CO.city.n}, ${S.form.street}`,
        when: o.id === 'post' ? `${dShort(addDays(o.days - 2))} — ${dShort(addDays(o.days + 2))}` : dLabel(o.days + (CO.ship === 'courier' ? CO.slotDay : 0)) + (CO.ship === 'courier' ? ', ' + ['10 am – 2 pm', '2 pm – 6 pm', '6 pm – 10 pm'][CO.slot] : ''),
        pay: CO.pay
      };
      S.cart = []; S.promo = null; S.soldKey = null; persist();
      location.hash = '#/success';
    }, 1500);
  }

  /* --------------------------------------------------------------- success */
  function viewSuccess() {
    const o = S.lastOrder;
    if (!o) return `<div class="page wrap"><div class="empty"><h1 class="h1">No orders yet</h1><p>Place an order and you’ll see its status here.</p><a class="btn btn--dark" href="#/catalog">Go to shop</a></div></div>`;
    const paid = o.pay !== 'cod';
    const payText = { sbp: 'Paid with Apple Pay / Google Pay', card: 'Paid by card', split: `Paid ${fmt(Math.ceil(o.total / 4))} · 3 payments left`, cod: 'Pay on delivery by card' }[o.pay];
    return `<div class="page wrap"><div class="success">
      <div class="success__hero">
        <div>
          <div class="success__check">${icon('check')}</div>
          <h1 class="h-display" style="font-size:clamp(40px,5vw,72px)">${o.name ? 'Thank you, ' + esc(o.name) + '!' : 'Thank you!'}<br>Order confirmed.</h1>
          <div class="success__num">Order number <b>${o.num}</b> · confirmation texted to ${esc(o.phone || '')}</div>
        </div>
        <div class="muted" style="max-width:380px">Your order is already being packed at the factory. ${o.shipId === 'pickup' ? 'We’ll call you when your pairs are waiting at the showroom.' : 'The carrier will text you a tracking number as soon as they collect the parcel.'}</div>
      </div>
      <ol class="timeline">
        <li class="done"><b>Order confirmed</b><span>Just now</span></li>
        <li class="now"><b>Packed at the factory</b><span>${new Date().getHours() < 16 ? 'Today by 6 pm' : 'Tomorrow by 12 pm'}</span></li>
        <li><b>${o.shipId === 'pickup' ? 'Ready for collection' : 'Handed to the carrier'}</b><span>${o.shipId === 'pickup' ? o.when.replace(/^./, c => c.toUpperCase()) : dLabel(Math.max(CUT, o.days - 1)).replace(/^./, c => c.toUpperCase())}</span></li>
        <li><b>${o.shipId === 'pickup' ? 'Waiting at the showroom' : 'Delivery and try-on'}</b><span>${o.when.replace(/^./, c => c.toUpperCase())}</span></li>
      </ol>
      <div class="success__grid">
        <div class="info-card"><div class="label">Delivery</div><p>${esc(o.ship)}</p><p>${esc(o.addr)}</p><p>${esc(o.when)}</p></div>
        <div class="info-card"><div class="label">Payment</div><p>${payText}</p><p>${paid ? 'Receipt sent to ' + (o.email ? esc(o.email) : 'your phone') : 'If a pair doesn’t fit, just hand it back to the courier'}</p><p class="num">Total: ${fmt(o.total)}</p></div>
        <div class="info-card"><div class="label">Items · ${o.items.reduce((s, l) => s + l.qty, 0)}</div>${o.items.map(l => { const p = byId[l.id], v = variant(p, l.code); return `<p>${fullName(p)}, ${v.color}, EU ${l.size}${l.qty > 1 ? ` × ${l.qty}` : ''}</p>`; }).join('')}</div>
      </div>
      <div class="next-steps">
        <div class="next-card"><h3>Order updates on WhatsApp</h3><p>Get your tracking number, delivery reminders and easy returns. No phone calls.</p><button class="btn btn--dark" data-act="tg">${icon('send')} Turn on updates</button></div>
        <div class="next-card" id="accCard"><h3>Save your details for next time</h3><p>We’ll create an account for ${esc(o.phone || '')}. No password, just a one-time text code. It will keep your orders${S.mySize ? ` and your size (EU ${S.mySize})` : ' and addresses'}.</p><button class="btn btn--outline" data-act="create-acc">Create account in one click</button></div>
      </div>
      <div style="margin-top:72px"><div class="row-head"><h2 class="h3">While you wait: caring for leather in autumn</h2><a class="link small" href="#/">Back to shop</a></div>
        <div class="journal">${JOURNAL.slice().reverse().map(j => `<a class="post" href="#/" data-act="journal"><div class="ph"><img src="${j.img}" alt="" loading="lazy"></div><div class="label">${j.tag}</div><h3>${j.title}</h3></a>`).join('')}</div></div>
    </div></div>`;
  }

  /* ------------------------------------------------------------------- CJM */
  function viewCJM() {
    const rows = [
      ['Discovery', 'Understand the brand and whether you can buy here', 'The first screen is a mood gallery with no prices; “Buy retail” sends people off to marketplaces (Wildberries, Ozon, Lamoda)', 'First screen: product on the model with a price and a quick-view pin. One-line value proposition: try-on, next-day delivery, 30-day returns'],
      ['Browsing', 'Find the right style in your size and colour', 'Style codes instead of names, every colour is a separate product, no size filter', 'Model names with the style code in small print. Colours as swatches on one card. Size finder by foot length → “my size in stock” filter'],
      ['Decision', 'Be sure about size, quality and terms', 'The product page only offers “Order wholesale”, with no shipping or returns info', 'Quick view: stock per size, “last pair”, foot-length chart, try-on and returns, Pay in 4'],
      ['Bag', 'Review the order and the total', 'There is no cart: shoppers leave for marketplaces, and the brand loses the customer and the margin', 'Change size right in the bag, free shipping progress bar, promo code, undo on remove'],
      ['Checkout', 'Fast, no account, clear dates and prices', '—', 'One page, 3 blocks. City from IP, pickup points on a map with fitting rooms, price and date for every option, 4 payment methods'],
      ['After purchase', 'Know what’s happening with the order', '—', 'Status timeline, messenger updates, one-click account after the purchase, not before']
    ];
    const ucs = [
      ['UC-1 · “I know what I want”', 'Burgundy ankle boots in EU 38: first screen → pin on the photo → size → add to bag → checkout. 4 screens, about 7 actions.', () => 'qv:millionnaya'],
      ['UC-2 · “I don’t know this brand’s sizing”', 'Size finder by foot length → the shop shows only what’s in stock → the size is preselected on the product.', () => 'scroll:finder'],
      ['UC-3 · “I saw a look I like”', 'Looks of the season: dot on the photo → mini card → quick view.', () => 'scroll:looks'],
      ['UC-4 · Ordering to another city', 'Berlin: pickup points on a map, honest dates and prices. Showroom collection is hidden where it isn’t available.', () => 'city:Berlin'],
      ['UC-5 · Wholesale buyer', 'A separate “Wholesale” entry in the header keeps the dealer programme and uniform footwear apart from retail.', () => 'trade']
    ];
    const ccs = [
      ['Size sold out while in the bag', 'The item is highlighted, the rest of the order is kept, and checkout is locked until another size is chosen.', 'sold'],
      ['Size out of stock', 'The size is crossed out but still clickable: instead of “Add to bag” you get a restock alert by text.', 'qv-out'],
      ['No size selected', 'The button says “Select a size”; tapping it shakes the size block and shows a hint.', 'qv:okhta'],
      ['Last pair', 'A “1 left” tag under the size and a warning on the product.', 'qv:millionnaya'],
      ['City without courier delivery', 'Reykjavík: courier is unavailable with an explanation; pickup points and post are offered.', 'city:Reykjavík'],
      ['Pickup point temporarily closed', 'Visible on the map and in the list but not selectable; the nearest alternatives are suggested.', 'city:Saint Petersburg'],
      ['Payment failed', 'A calm message: no charge, details saved. “Try again” or “Pay on delivery”.', 'payfail'],
      ['Standard post and pay on delivery', 'With standard post, “Pay on delivery” is disabled and explains why.', 'city:New York'],
      ['Promo code doesn’t apply', 'AUTUMN10 doesn’t work on sale items, and we say exactly that instead of “error”.', 'cart'],
      ['Item removed by mistake', 'A toast with an “Undo” button for 6 seconds.', 'cart'],
      ['Empty bag', 'Not a dead end: categories and recently viewed.', 'empty'],
      ['Left checkout halfway', 'Bag, contact details and delivery choice are saved on the device.', 'checkout']
    ];
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/">Home</a><span>/</span><span>CJM & scenarios</span></div>
      <div class="cat-intro"><h1 class="h1">Customer journey</h1><p>How the prototype removes the barriers of the current website at every step, from the first screen to receiving the order. You can open every scenario in the prototype.</p></div>
      <div class="scroll-x"><table class="cjm-table"><thead><tr><th>Stage</th><th>Customer goal</th><th>Barrier today</th><th>Redesign solution</th></tr></thead>
        <tbody>${rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td class="pain">${r[2]}</td><td class="fix">${r[3]}</td></tr>`).join('')}</tbody></table></div>
      <h2 class="h2" style="margin:80px 0 24px">Use cases</h2>
      <div class="cases">${ucs.map(u => `<div class="case"><b>${u[0]}</b><p>${u[1]}</p><button class="btn btn--outline" data-demo="${u[2]()}">Open ${icon('arrow')}</button></div>`).join('')}</div>
      <h2 class="h2" style="margin:80px 0 24px">Corner cases</h2>
      <div class="cases">${ccs.map(c => `<div class="case"><b>${c[0]}</b><p>${c[1]}</p><button class="btn btn--outline" data-demo="${c[2]}">Show ${icon('arrow')}</button></div>`).join('')}</div>
    </div>`;
  }
  function demo(d) {
    const [k, v] = d.split(':');
    if (k === 'qv') { go('#/'); setTimeout(() => openQV(v), 350); }
    if (k === 'qv-out') { go('#/'); setTimeout(() => { openQV('neva'); QV.size = '39'; renderQV(); }, 350); }
    if (k === 'scroll') go('#/', v);
    if (k === 'trade') tradeToast();
    if (k === 'city') { ensureCart(); S.form.city = v; S.form.ship = v === 'New York' ? 'post' : 'pvz'; S.form.pvz = null; S.soldKey = null; persist(); go('#/checkout'); }
    if (k === 'sold') { ensureCart(); S.flags.soldOut = true; S.soldKey = S.cart[0].key; persist(); renderProto(); go('#/cart'); }
    if (k === 'payfail') { ensureCart(); S.flags.payFail = true; S.soldKey = null; persist(); renderProto(); go('#/checkout'); toast({ text: '“Payment failed” scenario is on', sub: 'Fill in the form and tap “Pay”' }); }
    if (k === 'cart') { ensureCart(true); go('#/cart'); }
    if (k === 'empty') { S.cart = []; S.soldKey = null; persist(); updateBadges(); go('#/cart'); }
    if (k === 'checkout') { ensureCart(); go('#/checkout'); }
  }
  function ensureCart(withSale) {
    if (!S.cart.length) { addToCart('neva', '570-187-6', '38'); addToCart('fontanka', '361-15-01', '38'); }
    if (withSale && !S.cart.some(l => byId[l.id].old)) addToCart('krestovsky', '926-161-161', '38');
  }

  /* ------------------------------------------------------------- search */
  function renderSearch() {
    $('#search').innerHTML = `<div class="search__bar">${icon('search')}<input id="sIn" placeholder="Ankle boots, burgundy, 38…" aria-label="Search the shop"><button class="icon-btn" data-act="search-close" aria-label="Close">${icon('close')}</button></div>
      <div class="search__body"><div><div class="label muted" style="margin-bottom:14px">Popular searches</div><div class="search__pop">${['Ankle boots', 'Burgundy', 'Loafers', 'Winter boots', 'Suede', 'Sneakers'].map(q => `<button data-q="${q}">${q}</button>`).join('')}</div></div><div class="search__res grid" id="sRes"></div></div>`;
    const inp = $('#sIn');
    const run = () => {
      const q = inp.value.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);
      const list = (terms.length ? P.filter(p => { const hay = [p.name, p.type, catName(p.cat), p.season, ...p.variants.map(v => v.color + ' ' + v.code), ...p.specs.map(s => s[1])].join(' ').toLowerCase(); return terms.every(t => hay.includes(t.replace(/(es|s)$/, ''))); }) : P.filter(p => p.badge === 'New')).slice(0, 10);
      $('#sRes').innerHTML = list.length ? list.map(p => cardHTML(p, { noHint: true })).join('') : `<div class="empty-grid" style="grid-column:1/-1">No results for “${esc(q)}”. Try “boots” or “burgundy”.</div>`;
      bindCards($('#sRes'));
    };
    inp.addEventListener('input', run);
    $$('[data-q]', $('#search')).forEach(b => b.addEventListener('click', () => { inp.value = b.dataset.q; run(); inp.focus(); }));
    run();
  }
  function openSearch() { renderSearch(); $('#search').classList.add('on'); $('#overlay').classList.add('on'); document.body.classList.add('no-scroll'); setTimeout(() => $('#sIn').focus(), 200); }
  function closeSearch() { $('#search').classList.remove('on'); if (!$('#qv').classList.contains('on')) { $('#overlay').classList.remove('on'); document.body.classList.remove('no-scroll'); } }

  /* ---------------------------------------------------------- mobile nav */
  function renderMnav() {
    $('#mnav').innerHTML = `<div class="mnav__top"><a class="logo" href="#/"><img src="assets/img/logo.png" alt=""><b>Skorokhod<span>·Moda</span></b></a><button class="icon-btn" data-act="mnav-close" aria-label="Close">${icon('close')}</button></div>
      <a href="#/catalog">Shop</a><div class="sub">${CATS.map(c => `<a href="#/catalog/${c.id}">${c.name}</a>`).join('')}</div>
      <a href="#/catalog/new">New in</a><a href="#/catalog/fav">Wishlist</a><a href="#/cart">Bag</a><button class="lnk" data-scroll="finder">Size finder</button><a href="#/cjm">CJM & scenarios</a><button class="lnk" data-act="lang" data-lang="ru">Русская версия</button>
      <div class="mnav__foot"><button data-act="trade" style="text-align:left">Wholesale & corporate orders →</button><span>+7 (812) 329-44-35</span><span>hello@skorohod-moda.ru</span></div>`;
  }

  /* -------------------------------------------------------------- footer */
  // women's shoe print: toe + heel
  const PRINT = '<svg viewBox="0 0 22 52" aria-hidden="true"><path d="M11 1.5c5.6 0 9.2 5.2 9.2 12.4 0 6.4-2.6 11.3-4.4 15.6-.9 2.1-2.2 3.1-4.8 3.1s-3.9-1-4.8-3.1C4.4 25.2 1.8 20.3 1.8 13.9 1.8 6.7 5.4 1.5 11 1.5z"/><ellipse cx="11" cy="45.5" rx="3.6" ry="4.6"/></svg>';
  function roomStatus() {
    // showroom hours, Moscow time: Mon–Sat 10–20, closed Sunday
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const h = +parts.hour + (+parts.minute) / 60, sun = parts.weekday === 'Sun', sat = parts.weekday === 'Sat';
    if (!sun && h >= 10 && h < 20) return { open: true, text: `Open until 8 pm · ${parts.hour}:${parts.minute} in Saint Petersburg` };
    const next = sat && h >= 20 ? 'Monday' : sun ? 'tomorrow' : h < 10 ? 'today' : 'tomorrow';
    return { open: false, text: `Closed · opens ${next} at 10 am` };
  }
  function renderFooter(mode) {
    if (mode === 'checkout') { $('#footer').innerHTML = ''; return; }
    const st = roomStatus();
    $('#footer').innerHTML = `<div class="ft" id="ft">
      <div class="ft__trail" id="ftTrail"></div>
      <div class="ft__hint" aria-hidden="true">${PRINT}Move your cursor to leave footprints</div>
      <div class="ft__in">
        <div class="ft__top">
          <div>
            <span class="label ft__eyebrow">Skorokhod is Russian for “the one who walks fast”</span>
            <h2 class="ft__big">Walk with<br>us? <em>−10%</em></h2>
            <form class="ft__form" data-news><input type="email" placeholder="Your email" aria-label="Email"><button>Subscribe ${icon('arrow')}</button></form>
            <div class="ft__fine">New collections and private sales before anyone else. No more than once a week.</div>
          </div>
          <div class="ft__room">
            <div class="ph"><img src="assets/img/craft.webp" alt="Factory workshop" loading="lazy"></div>
            <div>
              <h4>Factory showroom</h4>
              <p>6 Tsvetochnaya St, Saint Petersburg · Moskovskiye Vorota metro</p>
              <div class="ft__status ${st.open ? '' : 'closed'}"><i></i>${st.text}</div>
              <div class="acts"><a href="#/" data-act="route">Directions ${icon('arrow')}</a><a href="tel:+78123294435">Call</a></div>
            </div>
          </div>
        </div>
        <div class="ft__mid">
          <div><h5>Help</h5><ul><li><a href="#/cjm">Shipping & payment</a></li><li><a href="#/cjm">Returns & exchanges</a></li><li><a href="#/" data-scroll="finder">Size finder</a></li><li><a href="#/" data-act="journal">Shoe care</a></li></ul></div>
          <div><h5>Shop</h5><ul>${CATS.slice(0, 4).map(c => `<li><a href="#/catalog/${c.id}">${c.name}</a></li>`).join('')}</ul></div>
          <div><h5>Company</h5><ul><li><a href="#/" data-scroll="factory">Our factory</a></li><li><a href="#/" data-scroll="journal">Journal</a></li><li><button data-act="trade">Wholesale</button></li><li><a href="#/cjm">CJM & scenarios</a></li></ul></div>
          <div><h5>Contact</h5><ul><li><a href="tel:+78123294435">+7 (812) 329-44-35</a></li><li><a href="mailto:hello@skorohod-moda.ru">hello@skorohod-moda.ru</a></li><li><a href="#/" data-act="journal">Instagram</a></li><li><a href="#/" data-act="journal">WhatsApp</a></li></ul></div>
          <button class="ft__up" data-act="to-top" aria-label="Back to top">${icon('arrow')}</button>
        </div>
      </div>
      <div class="ft__word" id="ftWord" aria-label="Skorokhod">${'SKOROKHOD'.split('').map((ch, i) => `<span style="transition-delay:${i * 55}ms" aria-hidden="true">${ch}</span>`).join('')}</div>
      <div class="ft__bottom"><span>© 2026 Skorokhod·Moda</span><span class="ft__note">Redesign concept, test assignment. Not the official website</span><span class="ft__social"><span>Instagram</span><span>WhatsApp</span></span></div>
    </div>`;
    initFooter();
  }
  let ftResize = () => {};
  function initFooter() {
    const ft = $('#ft'), word = $('#ftWord'), trail = $('#ftTrail'); if (!ft) return;
    // full-width word: font size from the sum of real letter widths
    const spans = $$('span', word);
    const fit = () => { word.style.setProperty('--fs', '200px'); const w = spans.reduce((s, sp) => s + sp.getBoundingClientRect().width, 0); word.style.setProperty('--fs', Math.max(56, 200 * (word.clientWidth * .985) / Math.max(1, w)) + 'px'); };
    fit();
    window.removeEventListener('resize', ftResize); ftResize = fit; window.addEventListener('resize', ftResize, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ft.classList.add('in'); o.disconnect(); if (!matchMedia('(hover:hover)').matches) autoWalk(); } }), { threshold: .25 }); o.observe(ft); } else ft.classList.add('in');
    setTimeout(() => spans.forEach(s => s.style.transitionDelay = ''), 1800);
    // footprints follow the cursor: alternating left/right, rotated along the step
    const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
    let last = null, side = 1, count = 0;
    const drop = (x, y, ang) => {
      const el = document.createElement('span'); el.className = 'print'; el.innerHTML = PRINT;
      const nx = Math.cos(ang), ny = Math.sin(ang), off = 11 * side;
      el.style.left = (x - ny * off) + 'px'; el.style.top = (y + nx * off) + 'px';
      el.style.transform = `rotate(${ang * 180 / Math.PI + 90}deg)`;
      trail.appendChild(el); setTimeout(() => el.remove(), 2500);
      side = -side; if (++count === 4) ft.classList.add('walked');
      if (trail.children.length > 40) trail.firstChild.remove();
    };
    if (!reduce) ft.addEventListener('mousemove', e => {
      if (e.target.closest('input,button,a,form,.ft__room')) { last = null; return; }
      const r = ft.getBoundingClientRect(), x = e.clientX - r.left, y = e.clientY - r.top;
      if (!last) { last = { x, y }; return; }
      const dx = x - last.x, dy = y - last.y, d = Math.hypot(dx, dy);
      if (d > 64) { drop(x, y, Math.atan2(dy, dx)); last = { x, y }; }
    });
    ft.addEventListener('mouseleave', () => { last = null; });
    function autoWalk() {
      if (reduce) return;
      const W = ft.clientWidth, H = ft.clientHeight; let i = 0;
      const steps = Math.ceil(W / 60);
      const t = setInterval(() => {
        const x = 20 + i * 60, y = H * .52 + Math.sin(i / 2.2) * 40, ang = Math.atan2(Math.cos(i / 2.2) * 40 / 2.2, 60);
        drop(x, y, ang); if (++i > steps) clearInterval(t);
      }, 160);
    }
  }

  /* ----------------------------------------------------- prototype panel */
  function renderProto() {
    $('#proto').innerHTML = `<div class="proto__panel" role="dialog" aria-label="Prototype navigation">
        <h4>Prototype · navigation</h4><p>Five scenario screens and toggles for edge cases.</p>
        <div class="grp">Screens</div>
        <div class="proto__screens">
          <button data-nav="#/"><em>01</em>Home</button>
          <button data-nav="qv"><em>02</em>Quick view</button>
          <button data-nav="#/cart"><em>03</em>Bag</button>
          <button data-nav="#/checkout"><em>04</em>Checkout</button>
          <button data-nav="#/success"><em>05</em>Confirmation</button>
          <button data-nav="#/cjm"><em>+</em>CJM & cases</button>
        </div>
        <div class="grp">Corner cases</div>
        <label class="tg"><span>Size sold out in bag</span><input type="checkbox" data-flag="soldOut" ${S.flags.soldOut ? 'checked' : ''}><i></i></label>
        <label class="tg"><span>Payment fails</span><input type="checkbox" data-flag="payFail" ${S.flags.payFail ? 'checked' : ''}><i></i></label>
        <button class="proto__reset" data-act="reset">Reset prototype</button>
      </div>
      <button class="proto__btn" data-act="proto" aria-expanded="false"><i></i>Prototype</button>`;
  }

  /* ---------------------------------------------------------------- router */
  let pendingScroll = null;
  function go(hash, scrollTo) {
    pendingScroll = scrollTo || null;
    if (location.hash === hash || (hash === '#/' && (location.hash === '' || location.hash === '#'))) route(); else location.hash = hash;
  }
  function route() {
    const h = location.hash.replace(/^#/, '') || '/';
    const parts = h.split('/').filter(Boolean);
    const app = $('#app');
    let mode = 'page';
    $$('.hot-card').forEach(x => x.classList.remove('on'));
    if (!parts.length || parts[0] === 'p') {
      mode = 'home'; app.innerHTML = `<div class="view">${viewHome()}</div>`; bindHome();
      if (parts[0] === 'p' && parts[1]) setTimeout(() => openQV(parts[1]), 200);
    } else if (parts[0] === 'catalog') {
      const cat = parts[1] || 'all'; app.innerHTML = `<div class="view">${viewCatalog(cat)}</div>`; bindCatalog(cat);
    } else if (parts[0] === 'cart') {
      app.innerHTML = `<div class="view">${viewCart()}</div>`; bindCards(app);
    } else if (parts[0] === 'checkout') {
      mode = 'checkout'; app.innerHTML = `<div class="view">${viewCheckout()}</div>`; bindCheckout();
    } else if (parts[0] === 'success') {
      app.innerHTML = `<div class="view">${viewSuccess()}</div>`;
    } else if (parts[0] === 'cjm') {
      app.innerHTML = `<div class="view">${viewCJM()}</div>`;
    } else { location.hash = '#/'; return; }
    renderHeader(mode); renderFooter(mode);
    $$('.nav a:not([data-scroll])').forEach(a => a.classList.toggle('is-active', a.getAttribute('href') === '#' + h));
    if (pendingScroll) { const id = pendingScroll; pendingScroll = null; setTimeout(() => { const el = document.getElementById(id); if (el) window.scrollTo({ top: el.getBoundingClientRect().top + scrollY - 70, behavior: 'smooth' }); }, 60); }
    else window.scrollTo(0, 0);
    reveal();
  }
  // cart binding is delegated once (app root persists)
  let cartBound = false;
  function ensureCartBinding() { if (!cartBound) { bindCart(); cartBound = true; } }

  /* ---------------------------------------------------------------- reveal */
  let io;
  function reveal() {
    if (!('IntersectionObserver' in window)) { $$('.rv').forEach(e => e.classList.add('in')); return; }
    io && io.disconnect();
    io = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); io.unobserve(e.target); } }), { rootMargin: '0px 0px -8% 0px' });
    $$('.rv').forEach(e => io.observe(e));
  }

  /* ---------------------------------------------------- global delegation */
  function tradeToast() { toast({ text: 'Wholesale has its own entrance', sub: 'Dealer programme, uniform footwear, PDF catalogue. Outside the scope of this prototype', ttl: 5000 }); }
  document.addEventListener('click', e => {
    const t = e.target;
    const qv = t.closest('[data-qv]');
    if (qv && !t.closest('#qv')) { e.preventDefault(); const card = qv.closest('[data-card]'); openQV(qv.dataset.qv, qv.dataset.code || (card && card.dataset.code)); closeSearch(); return; }
    const fav = t.closest('[data-fav]'); if (fav) { e.preventDefault(); e.stopPropagation(); toggleFav(fav.dataset.fav); if ($('#qv').classList.contains('on')) renderQV(); return; }
    if (t.closest('#qv')) { qvHandle(e); return; }
    const sc = t.closest('[data-scroll]'); if (sc) { e.preventDefault(); closeMnav(); go('#/', sc.dataset.scroll); return; }
    const demoBtn = t.closest('[data-demo]'); if (demoBtn) { demo(demoBtn.dataset.demo); return; }
    const nav = t.closest('[data-nav]');
    if (nav) {
      $('#proto').classList.remove('on');
      const n = nav.dataset.nav;
      if (n === 'qv') { go('#/'); setTimeout(() => openQV('neva'), 300); }
      else { if ((n === '#/checkout' || n === '#/cart') && !S.cart.length) ensureCart(); if (n === '#/success' && !S.lastOrder) { toast({ text: 'Place an order first', sub: 'Fill in the form to see the confirmation screen' }); ensureCart(); go('#/checkout'); return; } go(n); }
      return;
    }
    if (!t.closest('.hot') && !t.closest('.hot-card')) $$('.hot-card').forEach(x => x.classList.remove('on'));
    const a = t.closest('[data-act]'); if (!a) { if (!t.closest('#mega') && !t.closest('[data-act="mega"]')) closeMega(); if (!t.closest('#proto')) $('#proto').classList.remove('on'); return; }
    const act = a.dataset.act;
    if (act === 'mega') { const m = $('#mega'), on = !m.classList.contains('is-open'); m.classList.toggle('is-open', on); $('#header').classList.toggle('menu-open', on); a.setAttribute('aria-expanded', on); return; }
    if (act === 'search') { openSearch(); return; }
    if (act === 'search-close') { closeSearch(); return; }
    if (act === 'mnav') { renderMnav(); $('#mnav').classList.add('on'); document.body.classList.add('no-scroll'); return; }
    if (act === 'mnav-close') { closeMnav(); return; }
    if (act === 'announce-close') { S.announce = false; persist(); $('#announce').classList.add('is-hidden'); return; }
    if (act === 'trade') { e.preventDefault(); closeMnav(); tradeToast(); return; }
    if (act === 'lang') { const l = a.dataset.lang; try { localStorage.setItem('skm-lang', l); } catch (er) { /* */ } location.href = location.pathname + '?lang=' + l + location.hash; return; }
    if (act === 'account') { toast({ text: 'Sign in with your phone number', sub: 'One-time text code, no password. In the prototype, the account is created after the order' }); return; }
    if (act === 'journal') { e.preventDefault(); toast({ text: 'The journal is outside the prototype', sub: 'Stories will be moved over from the current website' }); return; }
    if (act === 'clear-size' || act === 'reset-size-filter') { S.mySize = null; persist(); route(); return; }
    if (act === 'proto') { const p = $('#proto'); p.classList.toggle('on'); a.setAttribute('aria-expanded', p.classList.contains('on')); return; }
    if (act === 'reset') { try { localStorage.removeItem(LS); } catch (er) { /* */ } location.hash = '#/'; location.reload(); return; }
    if (act === 'to-top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (act === 'route') { e.preventDefault(); toast({ text: 'Directions to the showroom', sub: 'In the live store this opens Google Maps' }); return; }
    if (act === 'tg') { toast({ text: 'Updates turned on', sub: 'In the live store this opens WhatsApp' }); return; }
    if (act === 'create-acc') { $('#accCard').innerHTML = `<h3>Account created</h3><p>Sign in with ${esc(S.lastOrder?.phone || '')}, and we’ll text you a code. ${S.mySize ? `Your size (EU ${S.mySize}) and address are` : 'Your address is'} saved.</p>`; return; }
  });
  document.addEventListener('mouseover', e => {
    const m = e.target.closest('[data-act="mega"]');
    if (m && matchMedia('(hover:hover)').matches) { $('#mega').classList.add('is-open'); $('#header').classList.add('menu-open'); }
  });
  document.addEventListener('mouseleave', () => closeMega());
  document.addEventListener('mousemove', e => { const mg = $('#mega'); if (mg && mg.classList.contains('is-open') && !e.target.closest('#header')) closeMega(); });
  function closeMega() { const m = $('#mega'); if (m) { m.classList.remove('is-open'); $('#header').classList.remove('menu-open'); } }
  function closeMnav() { $('#mnav').classList.remove('on'); if (!$('#qv').classList.contains('on')) document.body.classList.remove('no-scroll'); }
  $('#overlay').addEventListener('click', () => { closeQV(); closeSearch(); });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') { closeQV(); closeSearch(); closeMega(); closeMnav(); $('#proto').classList.remove('on'); }
    if ($('#qv').classList.contains('on') && (e.key === 'ArrowRight' || e.key === 'ArrowLeft') && !e.target.matches('input')) {
      const v = variant(byId[QV.id], QV.code); QV.img = (QV.img + (e.key === 'ArrowRight' ? 1 : -1) + v.gallery.length) % v.gallery.length; renderQV();
    }
  });
  // swipe in quick view gallery (mobile)
  let tx = null;
  document.addEventListener('touchstart', e => { if (e.target.closest('#qvStage')) tx = e.touches[0].clientX; }, { passive: true });
  document.addEventListener('touchend', e => {
    if (tx === null) return; const dx = e.changedTouches[0].clientX - tx; tx = null;
    if (Math.abs(dx) > 40) { const v = variant(byId[QV.id], QV.code); QV.img = (QV.img + (dx < 0 ? 1 : -1) + v.gallery.length) % v.gallery.length; renderQV(); }
  });
  document.addEventListener('change', e => {
    const f = e.target.closest('[data-flag]'); if (!f) return;
    S.flags[f.dataset.flag] = f.checked;
    if (f.dataset.flag === 'soldOut') {
      if (f.checked) { ensureCart(); S.soldKey = S.cart[0].key; toast({ text: 'Scenario on', sub: 'The first item in your bag is now sold out in its size' }); persist(); go('#/cart'); }
      else { S.soldKey = null; persist(); route(); }
    } else { persist(); if (f.checked) toast({ text: '“Payment failed” scenario is on', sub: 'Check out with an online payment method' }); }
    updateBadges();
  });
  document.addEventListener('submit', e => {
    if (e.target.matches('[data-news]')) { e.preventDefault(); const i = $('input', e.target); if (!/^[^@\s]+@[^@\s]+\.\w{2,}$/.test(i.value)) { i.style.color = '#F2A49A'; i.focus(); return; } e.target.innerHTML = '<span style="padding:14px 0;display:block">Done! Your −10% code is in your inbox.</span>'; }
  });

  /* ------------------------------------------------------------------ boot */
  // static markup in index.html is Russian: translate it for this build
  $('#announce .announce__track').innerHTML = '<span>Try on before you pay</span><span>Free shipping over $150</span><span>30-day returns</span><span>Handmade at our factory in Saint Petersburg</span>';
  $('#announce .announce__close').setAttribute('aria-label', 'Hide');
  $('#qv').setAttribute('aria-label', 'Product quick view');
  $('#search').setAttribute('aria-label', 'Search');
  $('#mnav').setAttribute('aria-label', 'Menu');
  ensureCartBinding();
  window.addEventListener('hashchange', route);
  route();
})();
