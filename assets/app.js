/* СКОРОХОД-МОДА — кликабельный прототип (vanilla JS, без сборки, работает с file://) */
(function () {
  'use strict';

  /* ------------------------------------------------------------------ data */
  const P = window.PRODUCTS;
  const byId = Object.fromEntries(P.map(p => [p.id, p]));
  const SIZES = ['36', '37', '38', '39', '40', '41'];
  const FOOT = { '36': 23, '37': 23.5, '38': 24, '39': 24.5, '40': 25, '41': 25.5 };
  const FREE_SHIP = 7000;
  const PROMOS = { OSEN10: { pct: 10, text: '−10% на новую коллекцию' }, SKOROHOD: { pct: 5, text: '−5% на весь заказ', all: true } };

  const CATS = [
    { id: 'botinki', name: 'Ботинки', img: 'assets/img/look/6aa91f6eddb06.webp', text: 'Демисезонные ботинки на невысоком устойчивом каблуке и рельефной подошве. Натуральная кожа и замша, тёплая подкладка — на петербургскую осень от 0 до +15°.' },
    { id: 'botilony', name: 'Ботильоны', img: 'assets/img/banner9.webp', text: 'Ботильоны на высоком устойчивом каблуке: шнуровка, фактурная кожа, замша. Для офиса, театра и вечерних прогулок по центру.' },
    { id: 'sapogi', name: 'Сапоги', img: 'assets/img/look/6aa91f4178b15.webp', text: 'Высокие сапоги и полусапожки — демисезонные на байке и зимние на шерстяном меху до −20°. Молния по всей длине, удобная полнота голенища.' },
    { id: 'lofery', name: 'Лоферы и туфли', img: 'assets/img/j_a1.webp', text: 'Мягкие замшевые лоферы, классические лодочки и полуботинки на тракторной подошве. Обувь, которую носят каждый день.' },
    { id: 'kedy', name: 'Кеды', img: 'assets/img/p/358-21-03_6.webp', text: 'Кеды и дезерты из замши на гибкой каучуковой подошве. Подкладка из натуральной кожи — нога дышит весь день.' },
    { id: 'leto', name: 'Лето −20%', img: 'assets/img/banner15.webp', text: 'Сабо, босоножки и сандалии из натуральной кожи. Распродажа летней коллекции — последние размеры со скидкой 20%.' }
  ];
  const catName = id => (CATS.find(c => c.id === id) || {}).name || 'Вся обувь';

  const LOOKS = [
    { img: 'assets/img/look/6aa91f5bec08b.webp', cap: 'Литейный проспект', note: 'Бордо + графит', hots: [{ x: 86, y: 80, id: 'neva' }] },
    { img: 'assets/img/look/6aa91f4e7e21f.webp', cap: 'Кофе на Рубинштейна', note: 'Замша в цвет шарфа', hots: [{ x: 45, y: 87, id: 'petrogradka' }] },
    { img: 'assets/img/look/6aa91f6eddb06.webp', cap: 'Ступени Эрмитажа', note: 'Деним и коньячный', hots: [{ x: 55, y: 88, id: 'kolomna' }] }
  ];

  // Слайды первого экрана. fx/fy — где на исходном кадре стоит обувь (доли ширины/высоты), метка пересчитывается под кроп
  const HERO = [
    { short: 'Цвет сезона', theme: 'light', img: 'assets/img/banner9.webp', pos: '56% 50%',
      label: 'Коллекция осень — зима ’26', title: ['Цвет сезона —', 'бордо.'],
      text: 'Женская обувь из натуральной кожи. Шьём сами, на&nbsp;собственной фабрике в&nbsp;Петербурге.',
      cta: ['Смотреть новинки', '#/catalog/new'], pins: [{ id: 'millionnaya', fx: .462, fy: .83 }] },
    { short: 'Замша', theme: 'light', img: 'assets/img/banner13.webp', pos: '62% 50%',
      label: 'Ботильоны · демисезон', title: ['Мягкая замша,', 'уверенный шаг.'],
      text: 'Ботильоны на высоком устойчивом каблуке и тёплой байке. Для офиса, театра и прогулок по центру.',
      cta: ['Смотреть ботильоны', '#/catalog/botilony'], pins: [] },
    { short: 'Кеды «Охта»', theme: 'dark', img: 'assets/img/banner16.webp', pos: '58% 50%',
      label: 'Кеды «Охта» · 4 цвета', title: ['Лёгкие', 'на подъём.'],
      text: 'Замшевые кеды на гибкой подошве с подкладкой из натуральной кожи. Для города, перелётов и долгих прогулок.',
      cta: ['Выбрать цвет', 'qv:okhta:358-21-03'], pins: [{ id: 'okhta', code: '358-21-03', fx: .44, fy: .78, flip: true }] },
    { short: 'Лето −20%', theme: 'dark', img: 'assets/img/banner15.webp', pos: '62% 50%',
      label: 'Распродажа летней коллекции', title: ['Лето', '−20%.'],
      text: 'Сабо, босоножки и сандалии из кожи. Последние размеры — до конца октября.',
      cta: ['Смотреть скидки', '#/catalog/leto'], pins: [{ id: 'belye', code: '967-165-167-165', fx: .455, fy: .86 }] }
  ];

  const JOURNAL = [
    { img: 'assets/img/j_a10.webp', tag: 'Гид по цвету', title: 'Коричневый, бордовый или чёрный: какой цвет обуви выбрать осенью' },
    { img: 'assets/img/j_a1.webp', tag: 'Стиль', title: 'С чем носить лоферы: от джинсов до платья' },
    { img: 'assets/img/leather.webp', tag: 'Уход', title: 'Как подготовить кожаную обувь к реагентам и слякоти' }
  ];

  /* ----------------------------------------------------------------- state */
  const LS = 'skm-proto-v1';
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
  const fmt = n => n.toLocaleString('ru-RU').replace(/ |,/g, ' ') + ' ₽';
  const icon = (n, cls = '') => `<svg class="icon ${cls}"><use href="#i-${n}"/></svg>`;
  const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const plural = (n, a, b, c) => { const m10 = n % 10, m100 = n % 100; return m10 === 1 && m100 !== 11 ? a : (m10 >= 2 && m10 <= 4 && (m100 < 10 || m100 >= 20) ? b : c); };
  const variant = (p, code) => p.variants.find(v => v.code === code) || p.variants[0];
  const totalStock = v => SIZES.reduce((s, k) => s + (v.stock[k] || 0), 0);
  const fullName = p => `${p.type} «${p.name}»`;
  const DAYS = ['вс', 'пн', 'вт', 'ср', 'чт', 'пт', 'сб'];
  const MONTHS = ['января', 'февраля', 'марта', 'апреля', 'мая', 'июня', 'июля', 'августа', 'сентября', 'октября', 'ноября', 'декабря'];
  const addDays = n => { const d = new Date(); d.setHours(12, 0, 0, 0); d.setDate(d.getDate() + n); return d; };
  const dShort = d => `${d.getDate()} ${MONTHS[d.getMonth()]}`;
  const CUT = new Date().getHours() >= 16 ? 1 : 0; // после 16:00 заказ уходит в сборку на следующий день
  const dLabel = n => n === 0 ? 'сегодня' : n === 1 ? 'завтра' : `${DAYS[addDays(n).getDay()]}, ${dShort(addDays(n))}`;

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
    if (isFav(id)) toast({ text: 'Добавлено в избранное', sub: fullName(byId[id]), action: 'Открыть', go: '#/catalog/fav' });
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
        <a class="back" href="#/cart">${icon('arrow-l')} Корзина</a>
        <a class="logo" href="#/"><img src="assets/img/logo.png" alt=""><b>Скороход<span>·Мода</span></b></a>
        <div class="help">Помощь с заказом<b>+7 (812) 329-44-35</b></div></div>`;
      return;
    }
    h.className = 'header' + (mode === 'home' ? ' header--over' : '');
    h.innerHTML = `<div class="header__in">
      <div style="display:flex;align-items:center;gap:6px">
        <button class="icon-btn burger" data-act="mnav" aria-label="Меню">${icon('menu')}</button>
        <a class="logo" href="#/" aria-label="Скороход-Мода, на главную"><img src="assets/img/logo.png" alt=""><b>Скороход<span>·Мода</span></b></a>
      </div>
      <nav class="nav" aria-label="Основная навигация">
        <button data-act="mega" aria-expanded="false">Каталог</button>
        <a href="#/catalog/new">Новинки</a>
        <a href="#/catalog/leto">Скидки</a>
        <a href="#/" data-scroll="factory">О фабрике</a>
        <a href="#/" data-scroll="journal">Журнал</a>
      </nav>
      <div class="header__right">
        <button class="header__trade" data-act="trade">Оптовикам</button>
        <button class="icon-btn" data-act="search" aria-label="Поиск">${icon('search')}</button>
        <a class="icon-btn" href="#/catalog/fav" aria-label="Избранное">${icon('heart')}<span class="badge-count" id="favCount"></span></a>
        <button class="icon-btn" data-act="account" aria-label="Профиль">${icon('user')}</button>
        <a class="icon-btn" href="#/cart" aria-label="Корзина">${icon('bag')}<span class="badge-count" id="cartCount"></span></a>
      </div>
    </div>
    <div class="mega" id="mega"><div class="mega__in">
      <div class="mega__list">
        ${CATS.map(c => `<a href="#/catalog/${c.id}">${c.name}<small>${P.filter(p => p.cat === c.id).length}</small></a>`).join('')}
        <a class="mega__all" href="#/catalog">Вся обувь</a>
      </div>
      <div class="mega__tiles">
        <a class="mega__tile" href="#/catalog/new"><div class="ph"><img src="assets/img/look/6aa91f5bec08b.webp" alt=""></div><p>Новинки осени<span>Бордо, шоколад, графит</span></p></a>
        <a class="mega__tile" href="#/catalog/botinki"><div class="ph"><img src="assets/img/look/6aa91f2b5c92e.webp" alt=""></div><p>Ботинки на каждый день<span>Низкий каблук, тёплая подкладка</span></p></a>
        <a class="mega__tile" href="#/" data-scroll="finder"><div class="ph"><img src="assets/img/neva.webp" alt="" style="object-position:70% 50%"></div><p>Подобрать размер<span>По длине стопы за 10 секунд</span></p></a>
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
  // компактная шапка: выезжает, как только начинаешь скроллить вниз, и уезжает у самого верха
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
      ? `<div class="card__hint">${icon('check')} Есть ваш ${S.mySize}</div>`
      : `<div class="card__hint warn">Размера ${S.mySize} нет</div>`) : '';
    const badge = p.badge ? `<span class="card__badge ${p.old ? 'sale' : ''}">${p.badge}</span>` : (totalStock(v) < 9 ? '<span class="card__badge">Последние пары</span>' : '');
    return `<article class="card" data-card="${p.id}" data-code="${v.code}">
      <div class="card__media" data-qv="${p.id}">
        ${badge}
        <img class="main" src="${v.img}" alt="${esc(fullName(p))}, ${v.color}" loading="lazy">
        <img class="alt" src="${v.hover}" alt="" loading="lazy">
        <button class="card__quick" data-qv="${p.id}" aria-label="Быстрый просмотр">${icon('plus')}<span>Выбрать размер</span></button>
      </div>
      <button class="icon-btn card__fav ${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="В избранное">${icon('heart')}</button>
      <div class="card__body">
        <div class="card__name" data-qv="${p.id}">${p.type} «${p.name}»</div>
        <div class="card__price">${fmt(p.price)}${p.old ? `<s>${fmt(p.old)}</s>` : ''}</div>
        <div class="card__sub">${p.variants.length > 1 ? `${p.variants.length} ${plural(p.variants.length, 'цвет', 'цвета', 'цветов')}` : v.color} · ${p.specs.find(s => s[0] === 'Материал верха')?.[1].split(';')[0].replace('Натуральная ', 'нат. ') || ''}</div>
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

    <section class="section wrap" id="cats" aria-label="Категории">
      <div class="cats">
        <div class="cats__media rv">
          <div class="cats__main">${CATS.map((c, i) => `<img src="${c.img}" alt="${c.name}" class="${i === 0 ? 'on' : ''}" data-ci="${i}" loading="lazy">`).join('')}</div>
          <div class="cats__thumbs">${CATS.slice(0, 4).map((c, i) => `<button data-cat-i="${i}" class="${i === 0 ? 'on' : ''}" aria-label="${c.name}"><img src="${c.img}" alt="" loading="lazy"></button>`).join('')}</div>
        </div>
        <div class="rv">
          <ul class="cats__list">${CATS.map((c, i) => `<li><button data-cat-i="${i}" class="${i === 0 ? 'on' : ''}">${c.name}<sup>${P.filter(p => p.cat === c.id).length}</sup></button></li>`).join('')}</ul>
          <p class="cats__text" id="catText">${CATS[0].text}</p>
          <div class="cats__foot">
            <a class="btn btn--outline" id="catLink" href="#/catalog/${CATS[0].id}">Смотреть ${CATS[0].name.toLowerCase()}</a>
            <span class="from" id="catFrom">от ${fmt(Math.min(...P.filter(p => p.cat === CATS[0].id).map(p => p.price)))}</span>
          </div>
        </div>
      </div>
    </section>

    <section class="wrap" id="new" aria-label="Новинки">
      <div class="row-head">
        <h2 class="h2">Новое этой осенью.</h2>
        <div class="tabs" id="newTabs">
          <button class="on" data-tab="all">Все</button>
          ${CATS.slice(0, 5).map(c => `<button data-tab="${c.id}">${c.name}</button>`).join('')}
        </div>
      </div>
      <div id="sizeChip"></div>
      <div class="grid" id="newGrid">${newIds.map(id => cardHTML(byId[id])).join('')}</div>
      <div class="more-row"><a class="btn btn--outline" href="#/catalog">Вся обувь — ${P.length} ${plural(P.length, 'модель', 'модели', 'моделей')}</a></div>
    </section>

    <section class="section wrap" id="factory" aria-label="О фабрике">
      <div class="values__head">
        <span class="label muted values__kicker">Сделано в Петербурге<i></i>Своё производство</span>
        <div class="values__nav"><span class="small muted num" id="railNum">01 — 05</span><button class="rail-arr" data-rail="-1" aria-label="Назад">${icon('arrow-l')}</button><button class="rail-arr" data-rail="1" aria-label="Вперёд">${icon('arrow')}</button></div>
      </div>
      <p class="values__statement rv">Мы не перепродаём, а шьём сами — от лекала до последнего шва. <em>Поэтому знаем, из чего сделана каждая пара, и отвечаем за неё напрямую, без посредников.</em></p>
      <div class="rail" id="valuesRail">
        <article class="value-card"><div class="ph"><img src="assets/img/craft.webp" alt="Мастер прошивает заготовку ботинка" loading="lazy"><span class="tag label">Фабрика</span></div><h3>Своя фабрика на Цветочной</h3><p>Раскрой, пошив и сборка — в одном цехе в Петербурге. Контроль каждой пары перед отправкой.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/leather.webp" alt="Натуральная кожа" loading="lazy"><span class="tag label">Материалы</span></div><h3>Только натуральная кожа и замша</h3><p>Верх и подкладка летних моделей — из натуральной кожи. Демисезон — на тёплой байке, зима — на шерстяном меху.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/lasts.webp" alt="Обувные колодки" loading="lazy"><span class="tag label">Посадка</span></div><h3>Колодки под реальную стопу</h3><p>Широкий устойчивый каблук и полнота, рассчитанная на долгую ходьбу по городу, а не на фото.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/neva.webp" alt="Ботинки на набережной Невы" loading="lazy" style="object-position:62% 50%"><span class="mpt"><img src="assets/img/minpromtorg.png" alt="Минпромторг России"></span></div><h3>Сделано в России</h3><p>Продукция подтверждена Минпромторгом, все модели сертифицированы по ЕАЭС.</p></article>
        <article class="value-card"><div class="ph"><img src="assets/img/lasts2.webp" alt="" loading="lazy"><span class="tag label">Гарантия</span></div><h3>Примерка и возврат 30 дней</h3><p>Примерьте при курьере или в пункте выдачи. Не подошло — вернём деньги, даже если пару уже носили дома.</p></article>
      </div>
      <div class="rail-progress"><i id="railBar"></i></div>
    </section>

    <section class="feature" id="finder" aria-label="Подбор размера">
      <div class="feature__media"><img src="assets/img/neva.webp" alt="Чёрные кожаные ботинки на гранитной набережной" loading="lazy"></div>
      <div class="feature__body rv">
        <span class="label">Подбор размера</span>
        <h2 class="h1">Ваш размер —<br>за 10 секунд.</h2>
        <p>Размер — главная причина возвратов обуви. Измерьте длину стопы от пятки до большого пальца: мы подберём размер по нашим колодкам и покажем только то, что есть в наличии.</p>
        <div class="finder" id="finderBox"></div>
      </div>
    </section>

    <section class="section wrap" id="looks" aria-label="Образы сезона">
      <div class="row-head"><h2 class="h2">Образы сезона.</h2><span class="muted small">Нажмите на точку, чтобы увидеть модель</span></div>
      <div class="looks">${LOOKS.map((l, li) => `
        <figure class="look rv" style="margin:0">
          <div class="look__ph">
            <img src="${l.img}" alt="${esc(l.cap)}" loading="lazy">
            ${l.hots.filter(h => !h.hide).map(h => { const p = byId[h.id], v = p.variants[0]; return `
              <button class="hot" style="left:${h.x}%;top:${h.y}%" data-hot="${li}-${h.id}" aria-label="${esc(fullName(p))}"></button>
              <div class="hot-card" id="hc-${li}-${h.id}" style="left:${Math.min(h.x, 52)}%;top:${h.y - 26}%">
                <div class="t"><img src="${v.img}" alt=""></div>
                <div><b>${esc(fullName(p))}</b><span>${fmt(p.price)}</span><br><button class="link" data-qv="${p.id}">Смотреть</button></div>
              </div>`; }).join('')}
          </div>
          <figcaption class="look__cap"><b style="font-weight:400">${l.cap}</b><span>${l.note}</span></figcaption>
        </figure>`).join('')}</div>
    </section>

    <section class="wrap section--tight" id="journal" style="padding-top:0" aria-label="Журнал">
      <div class="row-head"><h2 class="h2">Журнал.</h2><a class="btn btn--outline" href="#/" data-act="journal">Все статьи</a></div>
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
    return `<section class="hs" id="hero" aria-roledescription="карусель" aria-label="Коллекция осень — зима" style="--n:${HERO.length}" data-theme="${HERO[0].theme}">
      ${HERO.map((s, i) => `
      <article class="hs__slide ${i === 0 ? 'is-active' : ''}" data-theme="${s.theme}" aria-roledescription="слайд" aria-label="${i + 1} из ${HERO.length}: ${esc(s.short)}" ${i ? 'aria-hidden="true"' : ''}>
        <div class="hs__media"><img src="${s.img}" alt="" style="object-position:${s.pos}" ${i ? 'loading="lazy"' : ''}><div class="hs__shade"></div>${s.pins.map(pin).join('')}</div>
        <div class="hs__content">
          <span class="label hs__label hs__fade">${s.label}</span>
          <h${i ? 2 : 1} class="h-display hs__title">${s.title.map(t => `<span class="ln"><span>${t}</span></span>`).join('')}</h${i ? 2 : 1}>
          <p class="hs__fade">${s.text}</p>
          <div class="hs__ctas hs__fade">
            ${s.cta[1].startsWith('qv:') ? `<button class="btn btn--dark" data-qv="${s.cta[1].split(':')[1]}" data-code="${s.cta[1].split(':')[2]}">${s.cta[0]}</button>` : `<a class="btn btn--dark" href="${s.cta[1]}">${s.cta[0]}</a>`}
            <button class="btn btn--outline" data-scroll="finder">Подобрать размер</button>
          </div>
        </div>
      </article>`).join('')}
      <div class="hs__bar">
        <ol class="hs__steps">${HERO.map((s, i) => `<li><button class="hs__step ${i === 0 ? 'on' : ''}" data-go="${i}" aria-label="Слайд ${i + 1}: ${esc(s.short)}"><span><span class="n">0${i + 1}</span><span class="t">${s.short}</span></span><i><b></b></i></button></li>`).join('')}</ol>
        <div class="hs__nav">
          <span class="hs__count" aria-live="polite"><span id="hsNum">01</span> / 0${HERO.length}</span>
          <button class="arr" data-dir="-1" aria-label="Предыдущий слайд">${icon('arrow-l')}</button>
          <button class="arr" data-dir="1" aria-label="Следующий слайд">${icon('arrow')}</button>
          <button class="hs__next" data-dir="1" aria-label="Следующий слайд"><img src="" alt="" id="hsNext"></button>
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
    // offsetLeft/Top не учитывают transform — считаем по «спокойной» раскладке, а zoom-анимация двигает метки вместе с фото
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
    // свой таймер вместо animationend: пауза, скрытая вкладка и ручное переключение не сбивают счётчик
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
      const l = $('#catLink'); l.href = `#/catalog/${c.id}`; l.textContent = `Смотреть ${c.id === 'leto' ? 'распродажу' : c.name.toLowerCase()}`;
      $('#catFrom').textContent = `от ${fmt(Math.min(...P.filter(p => p.cat === c.id).map(p => p.price)))}`;
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
      grid.innerHTML = list.length ? list.map(p => cardHTML(p)).join('') : `<div class="empty-grid">В этой категории нет моделей в ${S.mySize} размере. <button class="link" data-act="clear-size">Показать все размеры</button></div>`;
      bindCards(grid);
      $('#sizeChip').innerHTML = S.mySize ? `<div style="margin:-8px 0 18px"><span class="chip-filter">Есть в ${S.mySize} размере<button data-act="clear-size" aria-label="Сбросить">${icon('close')}</button></span></div>` : '';
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
      const out = s === null ? '<p>Меньше 36 размера мы пока не шьём. <b>Оставьте контакт</b> — сообщим, когда появится 35.</p>'
        : s === 'big' ? '<p>Больше 41 размера в этой коллекции нет. <b>Напишите нам</b> — подскажем модели с большой полномерностью.</p>'
        : `<p>Ваш размер — <b>${s}</b>${width === 'wide' ? ', модели на широкую стопу помечены в карточке' : ''}.<br>В наличии: <b>${P.filter(p => p.variants.some(v => v.stock[s] > 0)).length} ${plural(P.filter(p => p.variants.some(v => v.stock[s] > 0)).length, 'модель', 'модели', 'моделей')}</b></p>`;
      $('#finderOut', box).innerHTML = `${s && s !== 'big' ? `<div class="finder__size">${s}</div>` : ''}${out}`;
      $('#finderVal', box).innerHTML = `${cm.toFixed(1).replace('.', ',')}<small>см</small>`;
      $('#finderApply', box).classList.toggle('is-disabled', !s || s === 'big');
    };
    box.innerHTML = `
      <div class="finder__row"><span class="small muted">Длина стопы</span><span class="finder__val num" id="finderVal"></span></div>
      <input class="range" id="footRange" type="range" min="22" max="26" step="0.1" value="${cm}" aria-label="Длина стопы, см">
      <div class="finder__scale"><span>22 см</span><span>24 см</span><span>26 см</span></div>
      <div class="finder__row" style="margin:20px 0 0;align-items:center"><span class="small muted">Полнота стопы</span>
        <div class="seg"><button data-w="std" class="${width === 'std' ? 'on' : ''}">Стандартная</button><button data-w="wide" class="${width === 'wide' ? 'on' : ''}">Широкая</button></div></div>
      <div class="finder__out" id="finderOut"></div>
      <button class="btn btn--dark btn--block" id="finderApply">Показать модели в моём размере</button>
      <div class="tiny muted" style="margin-top:12px;text-align:center">Размер сохранится и будет выбран в карточке товара</div>`;
    $('#footRange', box).addEventListener('input', e => { cm = +e.target.value; draw(); });
    $$('[data-w]', box).forEach(b => b.addEventListener('click', () => { width = b.dataset.w; $$('[data-w]', box).forEach(x => x.classList.toggle('on', x === b)); draw(); }));
    $('#finderApply', box).addEventListener('click', () => {
      const s = sizeFor(cm); if (!s || s === 'big') return;
      S.mySize = s; S.myWidth = width; persist();
      toast({ text: `Ваш размер — ${s}`, sub: 'Показываем только модели в наличии' });
      if (onApply) { $$('#newTabs button').forEach((x, i) => x.classList.toggle('on', i === 0)); onApply('all'); }
      $('#new').scrollIntoView({ behavior: 'smooth' });
    });
    draw();
  }

  /* ---------------------------------------------------------------- catalog */
  function viewCatalog(cat) {
    const titles = { new: 'Новинки', fav: 'Избранное', all: 'Вся обувь' };
    const title = titles[cat] || catName(cat);
    const c = CATS.find(x => x.id === cat);
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/">Главная</a><span>/</span><a href="#/catalog">Каталог</a>${cat !== 'all' ? `<span>/</span><span>${title}</span>` : ''}</div>
      <div class="cat-intro"><h1 class="h1">${title}</h1><p>${c ? c.text : cat === 'fav' ? 'Модели, которые вы отметили сердечком. Список хранится на этом устройстве.' : 'Женская обувь из натуральной кожи от фабрики в Петербурге. Цены без наценки посредников.'}</p></div>
      <div class="toolbar">
        <div class="toolbar__left">
          <a class="pill ${cat === 'all' ? 'on' : ''}" href="#/catalog">Все</a>
          ${CATS.map(x => `<a class="pill ${cat === x.id ? 'on' : ''}" href="#/catalog/${x.id}">${x.name}</a>`).join('')}
        </div>
        <div style="display:flex;gap:8px;align-items:center">
          <select class="select" id="fSize" aria-label="Размер"><option value="">Любой размер</option>${SIZES.map(s => `<option ${S.mySize === s ? 'selected' : ''}>${s}</option>`).join('')}</select>
          <select class="select" id="fSort" aria-label="Сортировка"><option value="pop">Популярные</option><option value="new">Сначала новинки</option><option value="asc">Сначала дешевле</option><option value="desc">Сначала дороже</option></select>
        </div>
      </div>
      <div class="small muted" id="catCount" style="margin-bottom:14px"></div>
      <div class="grid" id="catGrid"></div>
    </div>`;
  }
  function bindCatalog(cat) {
    const draw = () => {
      const size = $('#fSize').value, sort = $('#fSort').value;
      let list = cat === 'all' ? P.slice() : cat === 'new' ? P.filter(p => p.badge === 'Новинка' || ['tavricheskaya', 'sadovaya', 'konyushennaya', 'kolomna'].includes(p.id)) : cat === 'fav' ? P.filter(p => isFav(p.id)) : P.filter(p => p.cat === cat);
      if (size) list = list.filter(p => p.variants.some(v => v.stock[size] > 0));
      if (sort === 'asc') list.sort((a, b) => a.price - b.price);
      if (sort === 'desc') list.sort((a, b) => b.price - a.price);
      if (sort === 'new') list.sort((a, b) => (b.badge === 'Новинка') - (a.badge === 'Новинка'));
      $('#catCount').textContent = `${list.length} ${plural(list.length, 'модель', 'модели', 'моделей')}${size ? ` в ${size} размере` : ''}`;
      $('#catGrid').innerHTML = list.length ? list.map(p => cardHTML(p)).join('')
        : `<div class="empty-grid">${cat === 'fav' ? `${icon('heart', '')}<p>В избранном пока пусто. Нажмите на сердечко в карточке, чтобы сохранить модель.</p><a class="btn btn--outline" href="#/catalog">Перейти в каталог</a>` : `Нет моделей ${size ? `в ${size} размере ` : ''}в этой категории. <button class="link" data-act="reset-size-filter">Сбросить размер</button>`}</div>`;
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
      ? `<div class="size-note warn">${icon('info')}<span>Вашего ${S.mySize} размера в этом цвете нет. ${p.variants.length > 1 ? 'Проверьте другие цвета или ' : ''}<button class="link" data-act="notify-mine">сообщите мне о поступлении</button></span></div>`
      : '';
    const st = v.stock[QV.size] || 0;
    if (st === 0) return `<div class="size-note err">${icon('bell')}<span><b>${QV.size} размера нет в наличии.</b> Оставьте телефон — пришлём SMS, как только сошьём новую партию (обычно 2–3 недели).</span></div>`;
    if (st === 1) return `<div class="size-note warn">${icon('alert')}<span>Осталась последняя пара ${QV.size} размера</span></div>`;
    return `<div class="size-note ok">${icon('check')}<span>${QV.size === S.mySize ? 'Ваш размер по замеру · ' : ''}В наличии, отправим ${new Date().getHours() < 16 ? 'сегодня' : 'завтра'}</span></div>`;
  }
  function renderQV() {
    const p = byId[QV.id], v = variant(p, QV.code);
    const g = v.gallery;
    const inCart = S.cart.some(l => l.id === p.id && l.code === v.code && l.size === QV.size);
    const out = QV.size && !(v.stock[QV.size] > 0);
    $('#qv').innerHTML = `
      <button class="icon-btn qv__close" data-act="qv-close" aria-label="Закрыть">${icon('close')}</button>
      <div class="qv__gallery">
        <div class="qv__thumbs">${g.map((src, i) => `<button class="${i === QV.img ? 'on' : ''}" data-img="${i}" aria-label="Фото ${i + 1}"><img src="${src}" alt=""></button>`).join('')}</div>
        <div class="qv__stage" id="qvStage">
          <img src="${g[QV.img]}" alt="${esc(fullName(p))}, фото ${QV.img + 1}" class="${QV.img === g.length - 1 && p.variants[0].hover === g[g.length - 1] ? 'cover' : ''}">
          <div class="qv__nav"><button data-act="img-prev" aria-label="Предыдущее фото">${icon('arrow-l')}</button><button data-act="img-next" aria-label="Следующее фото">${icon('arrow')}</button></div>
          <div class="qv__dots">${g.map((_, i) => `<i class="${i === QV.img ? 'on' : ''}"></i>`).join('')}</div>
        </div>
      </div>
      <div class="qv__info">
        <div class="qv__meta">${p.badge ? `<span class="label ${p.old ? 'accent' : ''}">${p.badge}</span>` : ''}<span class="label">Арт. ${v.code}</span></div>
        <h2 class="qv__title">${p.type} «${p.name}»</h2>
        <div class="qv__type">${p.season} · ${p.temp} · ${v.color}</div>
        <div class="qv__price"><span class="num">${fmt(p.price)}</span>${p.old ? `<s>${fmt(p.old)}</s>` : ''}</div>
        <div class="qv__split">или <b>4 × ${fmt(Math.ceil(p.price / 4))}</b> — «Долями», без переплаты</div>

        ${p.variants.length > 1 ? `<div class="opt"><div class="opt__head"><span>Цвет: <b>${v.color}</b></span></div>
          <div class="colors">${p.variants.map(x => `<button class="color ${x.code === v.code ? 'on' : ''}" data-color="${x.code}" aria-label="${x.color}" title="${x.color}"><img src="${x.img}" alt=""></button>`).join('')}</div></div>` : ''}

        <div class="opt" id="sizeOpt">
          <div class="opt__head"><span>Размер${QV.size ? `: <b>${QV.size}</b>` : ''}</span><button class="link" data-act="guide">${QV.guide ? 'Скрыть таблицу' : 'Как выбрать размер?'}</button></div>
          <div class="sizes" role="radiogroup" aria-label="Размер">${SIZES.map(s => { const st = v.stock[s] || 0; return `<button class="size ${st === 0 ? 'out' : ''} ${QV.size === s ? 'on' : ''} ${S.mySize === s ? 'mine' : ''}" data-size="${s}" role="radio" aria-checked="${QV.size === s}" aria-label="${s}${st === 0 ? ', нет в наличии' : st === 1 ? ', последняя пара' : ''}">${s}${st === 1 ? '<span class="last">1 пара</span>' : ''}</button>`; }).join('')}</div>
          <div id="sizeNote">${sizeNote(p, v)}</div>
          <div class="notify ${out ? 'on' : ''}" id="notify"><input type="tel" placeholder="+7 (___) ___-__-__" aria-label="Телефон для уведомления" value="${esc(S.form.phone || '')}"><button class="btn btn--outline" data-act="notify">Сообщить</button></div>
          <div class="size-guide ${QV.guide ? 'on' : ''}">
            <table><tr><th>Размер</th>${SIZES.map(s => `<td class="${QV.size === s ? 'on' : ''}">${s}</td>`).join('')}</tr><tr><th>Стопа, см</th>${SIZES.map(s => `<td class="${QV.size === s ? 'on' : ''}">${String(FOOT[s]).replace('.', ',')}</td>`).join('')}</tr></table>
            <p class="tiny muted" style="margin:10px 0 0">Модель в размер. Если стопа широкая или высокий подъём — возьмите на полразмера больше. <button class="link" data-act="to-finder">Подобрать по длине стопы</button></p>
          </div>
        </div>

        <div class="perks">
          <div>${icon('try')}Примерка перед оплатой</div>
          <div>${icon('truck')}По СПб — ${dLabel(1 + CUT)}, по России от 2 дней</div>
          <div>${icon('return')}Возврат 30 дней</div>
        </div>

        <div class="acc on"><button data-acc>Описание<i></i></button><div class="acc__body">${esc(p.desc)}</div></div>
        <div class="acc"><button data-acc>Характеристики<i></i></button><div class="acc__body"><table class="spec">${p.specs.map(s => `<tr><td>${s[0]}</td><td>${s[1]}</td></tr>`).join('')}<tr><td>Производство</td><td>Россия, Санкт-Петербург</td></tr></table></div></div>
        <div class="acc"><button data-acc>Доставка и возврат<i></i></button><div class="acc__body">Курьером по Петербургу — ${dLabel(1 + CUT)}, 390 ₽. Пункты выдачи СДЭК и Яндекс — от 190 ₽. От ${fmt(FREE_SHIP)} — бесплатно. Примерить можно при курьере (15 минут) или в примерочной пункта выдачи. Если пара не подошла — оплачиваете только то, что оставили.</div></div>

        <div class="qv__cta" id="qvCta">
          ${out
            ? `<button class="btn btn--dark btn--lg" data-act="notify-focus">${icon('bell')} Сообщить о поступлении</button>`
            : inCart
              ? `<a class="btn btn--dark btn--lg" href="#/cart" data-act="qv-close-nav">${icon('check')} В корзине · Оформить</a><button class="btn btn--outline btn--lg" data-act="qv-close" style="flex:.7">Продолжить</button>`
              : `<button class="btn btn--dark btn--lg" data-act="add">${QV.size ? `В корзину — ${fmt(p.price)}` : 'Выберите размер'}</button>`}
          <button class="icon-btn ${isFav(p.id) ? 'on' : ''}" data-fav="${p.id}" aria-label="В избранное">${icon('heart')}</button>
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
      if (d.length < 11) { i.style.borderColor = 'var(--err)'; i.focus(); return; }
      $('#notify').innerHTML = `<div class="size-note ok" style="margin:0">${icon('check')}<span>Готово. Пришлём SMS на ${esc(i.value)}, когда ${QV.size} размер появится.</span></div>`;
    }
    if (a === 'add') {
      if (!QV.size) {
        const opt = $('#sizeOpt'); opt.classList.remove('shake'); void opt.offsetWidth; opt.classList.add('shake');
        $('#sizeNote').innerHTML = `<div class="size-note err">${icon('alert')}<span>Выберите размер — сразу добавим в корзину</span></div>`;
        return;
      }
      addToCart(p.id, v.code, QV.size);
      renderQV();
      toast({ text: 'Добавлено в корзину', sub: `${fullName(p)} · ${v.color} · ${QV.size}`, img: v.img, action: 'Оформить', go: '#/cart' });
    }
    if (a === 'qv-close') closeQV();
    if (a === 'qv-close-nav') { closeQV(); }
  }

  /* ------------------------------------------------------------------ cart */
  function viewCart() {
    if (!S.cart.length) return `<div class="page wrap"><div class="empty">
      ${icon('bag')}
      <h1 class="h1">В корзине пока пусто</h1>
      <p>Начните с новинок осени или подберите размер — покажем только модели в наличии.</p>
      <div class="empty__cats">${CATS.slice(0, 5).map(c => `<a class="pill" href="#/catalog/${c.id}">${c.name}</a>`).join('')}</div>
      </div>
      ${S.viewed.length ? `<div style="margin-top:72px"><div class="row-head"><h2 class="h3">Вы смотрели</h2></div><div class="grid">${S.viewed.slice(0, 4).map(id => cardHTML(byId[id], { noHint: true })).join('')}</div></div>` : ''}
    </div>`;
    const t = totals();
    const left = Math.max(0, FREE_SHIP - t.total);
    const problems = S.cart.filter(l => l.key === S.soldKey).length;
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/">Главная</a><span>/</span><span>Корзина</span></div>
      <div class="page-title"><h1 class="h1">Корзина</h1><span class="muted">${cartCount()} ${plural(cartCount(), 'товар', 'товара', 'товаров')}</span></div>
      <div class="cart">
        <div>
          <div class="ship-bar ${left === 0 ? 'done' : ''}">${left === 0 ? `${icon('check')} Доставка будет бесплатной` : `До бесплатной доставки — <b>${fmt(left)}</b>`}
            <div class="ship-bar__track"><i style="width:${Math.min(100, t.total / FREE_SHIP * 100)}%"></i></div></div>
          <div id="lines">${S.cart.map(l => lineHTML(l)).join('')}</div>
        </div>
        <aside class="summary" aria-label="Итого">
          <h3>Ваш заказ</h3>
          <div class="sum-row"><span>Товары, ${cartCount()} шт.</span><span class="num">${fmt(t.sub + t.saleSave)}</span></div>
          ${t.saleSave ? `<div class="sum-row disc"><span>Скидка на распродаже</span><span class="num">−${fmt(t.saleSave)}</span></div>` : ''}
          ${t.disc ? `<div class="sum-row disc"><span>Промокод ${S.promo}</span><span class="num">−${fmt(t.disc)}</span></div>` : ''}
          <div class="sum-row"><span>Доставка</span><span>${left === 0 ? '<span style="color:var(--ok)">бесплатно</span>' : 'от 190 ₽'}</span></div>
          <div class="sum-total"><span>Итого</span><span class="num">${fmt(t.total)}</span></div>
          <div class="promo"><input id="promoIn" placeholder="Промокод" value="${S.promo || ''}" aria-label="Промокод"><button class="btn btn--outline" data-act="promo">${S.promo ? 'Убрать' : 'Применить'}</button></div>
          <div class="promo-msg ${S.promo ? 'ok' : ''}" id="promoMsg">${S.promo ? PROMOS[S.promo].text + (PROMOS[S.promo].all ? '' : ', кроме распродажи') : '<span class="muted">Попробуйте OSEN10</span>'}</div>
          <button class="btn btn--dark btn--lg btn--block" data-act="to-checkout" ${problems ? 'disabled' : ''} style="margin-top:12px">Оформить заказ</button>
          ${problems ? `<p class="tiny" style="color:var(--err);margin:10px 0 0;text-align:center">Решите проблему с товаром, чтобы продолжить</p>` : '<p class="tiny muted" style="margin:10px 0 0;text-align:center">Без регистрации · займёт около минуты</p>'}
          <div class="trust">
            <div>${icon('try')}Примерка перед оплатой при курьере и в ПВЗ</div>
            <div>${icon('return')}Возврат 30 дней, деньги — в течение 3 дней</div>
            <div>${icon('shield')}Гарантия фабрики 60 дней на швы и подошву</div>
          </div>
          <div class="pay-logos"><span>СБП</span><span>МИР</span><span>VISA</span><span>MASTERCARD</span><span>ДОЛЯМИ</span></div>
        </aside>
      </div>
      <div style="margin-top:88px"><div class="row-head"><h2 class="h3">Дополнит образ</h2></div>
        <div class="grid">${['fontanka', 'okhta', 'ermitazh', 'konyushennaya'].filter(id => !S.cart.some(l => l.id === id)).slice(0, 4).map(id => cardHTML(byId[id], { noHint: true })).join('')}</div></div>
    </div>`;
  }
  function lineHTML(l) {
    const { p, v, sum, old } = lineInfo(l);
    const problem = l.key === S.soldKey;
    return `<div class="line-item ${problem ? 'is-problem' : ''}" data-line="${l.key}">
      <div class="line-item__ph" data-qv="${p.id}" data-code="${v.code}"><img src="${v.img}" alt=""></div>
      <div>
        <div class="line-item__name" data-qv="${p.id}" data-code="${v.code}">${p.type} «${p.name}»</div>
        <div class="line-item__meta"><span class="sw" style="background:${v.hex}"></span>${v.color} · Арт. ${v.code}</div>
        <div class="line-item__ctrl">
          <select class="mini-select" data-line-size aria-label="Размер">${SIZES.map(s => { const st = v.stock[s] || 0; const dis = st === 0 || (problem && s === l.size); return `<option value="${s}" ${s === l.size ? 'selected' : ''} ${dis && s !== l.size ? 'disabled' : ''}>Размер ${s}${st === 0 || (problem && s === l.size) ? ' — нет' : st === 1 ? ' — 1 пара' : ''}</option>`; }).join('')}</select>
          <div class="qty"><button data-q="-1" ${l.qty <= 1 ? 'disabled' : ''} aria-label="Меньше">−</button><span class="num">${l.qty}</span><button data-q="1" ${l.qty >= Math.min(5, v.stock[l.size] || 1) ? 'disabled' : ''} aria-label="Больше">+</button></div>
        </div>
      </div>
      <div class="line-item__right">
        <div class="line-item__price num">${fmt(sum)}${old ? `<s>${fmt(old * l.qty)}</s>` : ''}</div>
        <div class="line-item__actions"><button data-act="line-fav">${isFav(p.id) ? 'В избранном' : 'В избранное'}</button><button data-act="line-del">Удалить</button></div>
      </div>
      ${problem ? `<div class="problem">${icon('alert')}<div><b>${l.size} размер закончился</b>, пока товар лежал в корзине. Выберите другой размер или удалите позицию — остальной заказ сохранён.
        <div class="acts"><button data-act="line-notify">Сообщить о поступлении</button><button data-act="line-del">Удалить</button></div></div></div>` : ''}
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
      if (S.soldKey === k) { S.soldKey = null; toast({ text: 'Размер изменён', sub: 'Можно оформлять заказ' }); }
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
        toast({ text: 'Товар удалён', sub: fullName(p), action: 'Вернуть', ttl: 6000, onAction: () => { S.cart.splice(idx, 0, l); persist(); route(); updateBadges(); } });
      }
      if (row && t.dataset.act === 'line-fav') { const l = S.cart.find(x => x.key === row.dataset.line); if (!isFav(l.id)) toggleFav(l.id); route(); }
      if (row && t.dataset.act === 'line-notify') { toast({ text: 'Сообщим о поступлении', sub: 'SMS придёт, когда размер появится' }); }
      if (t.dataset.act === 'promo') {
        const inp = $('#promoIn'), code = inp.value.trim().toUpperCase(), msg = $('#promoMsg');
        if (S.promo) { S.promo = null; persist(); route(); return; }
        if (!code) { msg.className = 'promo-msg err'; msg.textContent = 'Введите промокод'; return; }
        if (!PROMOS[code]) { msg.className = 'promo-msg err'; msg.textContent = 'Такого промокода нет или он истёк'; inp.focus(); return; }
        const t2 = (() => { S.promo = code; const r = totals(); S.promo = null; return r; })();
        if (!t2.disc) { msg.className = 'promo-msg err'; msg.textContent = 'Промокод не действует на товары со скидкой'; return; }
        S.promo = code; persist(); route();
      }
      if (t.dataset.act === 'to-checkout') location.hash = '#/checkout';
    });
  }

  /* -------------------------------------------------------------- checkout */
  const CITIES = [
    { n: 'Санкт-Петербург', r: '', z: 0 }, { n: 'Пушкин', r: 'Санкт-Петербург', z: 0 }, { n: 'Колпино', r: 'Санкт-Петербург', z: 0 },
    { n: 'Всеволожск', r: 'Ленинградская обл.', z: 1 }, { n: 'Гатчина', r: 'Ленинградская обл.', z: 1 }, { n: 'Москва', r: '', z: 1 },
    { n: 'Великий Новгород', r: 'Новгородская обл.', z: 1 }, { n: 'Казань', r: 'Татарстан', z: 2 }, { n: 'Нижний Новгород', r: '', z: 2 },
    { n: 'Екатеринбург', r: '', z: 2 }, { n: 'Краснодар', r: '', z: 2 }, { n: 'Калининград', r: '', z: 3 }, { n: 'Мурманск', r: '', z: 3 },
    { n: 'Новосибирск', r: '', z: 3 }, { n: 'Владивосток', r: '', z: 3 }, { n: 'Норильск', r: 'Красноярский край', z: 4 }
  ];
  const PVZ_SPB = [
    { id: 'p1', name: 'СДЭК · Цветочная, 6', addr: 'ул. Цветочная, 6 (рядом с фабрикой)', hours: 'Ежедневно 10–21', x: 48, y: 64, fit: true, days: 1 },
    { id: 'p2', name: 'Яндекс · Невский, 88', addr: 'Невский пр., 88', hours: 'Ежедневно 9–22', x: 52, y: 40, fit: true, days: 1 },
    { id: 'p3', name: 'СДЭК · Большой П.С., 37', addr: 'Большой пр. П.С., 37', hours: 'Пн–Сб 10–20', x: 36, y: 22, fit: true, days: 2 },
    { id: 'p4', name: 'СДЭК · Средний В.О., 18', addr: 'Средний пр. В.О., 18', hours: 'Закрыт на ремонт до 12 октября', x: 24, y: 36, closed: true, days: 2 },
    { id: 'p5', name: 'Яндекс · Московский, 140', addr: 'Московский пр., 140', hours: 'Ежедневно 9–22', x: 50, y: 82, fit: false, days: 2 }
  ];
  const pvzFor = city => city.z === 0 ? PVZ_SPB : [
    { id: 'o1', name: `СДЭК · ${city.n}, ул. Ленина, 24`, addr: 'ул. Ленина, 24', hours: 'Ежедневно 10–20', x: 44, y: 46, fit: true, days: 1 },
    { id: 'o2', name: `Яндекс · ${city.n}, пр. Мира, 7`, addr: 'пр. Мира, 7', hours: 'Ежедневно 9–21', x: 62, y: 30, fit: true, days: 1 },
    { id: 'o3', name: `СДЭК · ${city.n}, ул. Садовая, 51`, addr: 'ул. Садовая, 51', hours: 'Пн–Пт 10–19', x: 30, y: 70, fit: false, days: 2 }
  ];
  function shipOptions(city) {
    const t = totals(), free = t.total >= FREE_SHIP;
    const base = [0, 1, 2, 4, 6][city.z] + CUT;
    return [
      { id: 'courier', t: 'Курьер', d: city.z === 4 ? 'Курьерская доставка в этот город недоступна' : `${dLabel(1 + base)} · примерка 15 минут`, price: city.z === 4 ? null : (free && city.z < 3 ? 0 : [390, 490, 590, 790][city.z]), days: 1 + base, tags: ['Примерка', 'Частичный выкуп'], dis: city.z === 4 },
      { id: 'pvz', t: 'Пункт выдачи СДЭК или Яндекс', d: `${dLabel(1 + base)} · примерочная в пункте`, price: free ? 0 : [190, 250, 290, 350, 450][city.z], days: 1 + base, tags: ['Примерка', 'Хранение 7 дней'] },
      { id: 'post', t: 'Почта России', d: `${dShort(addDays(5 + base))} — ${dShort(addDays(9 + base))} · без примерки`, price: 350, days: 7 + base, tags: [] },
      { id: 'pickup', t: 'Самовывоз из шоурума фабрики', d: 'ул. Цветочная, 6 · ' + (new Date().getHours() < 14 ? 'сегодня после 17:00' : 'завтра после 12:00'), price: 0, days: new Date().getHours() < 14 ? 0 : 1, tags: ['Примерка всей коллекции'], dis: city.z !== 0, hide: city.z !== 0 }
    ].filter(o => !o.hide);
  }
  const CO = { city: null, ship: null, pvz: null, slotDay: 1, slot: 0, pay: 'sbp', err: null, cityOpen: false };
  function initCO() {
    const f = S.form;
    CO.city = CITIES.find(c => c.n === (f.city || 'Санкт-Петербург')) || CITIES[0];
    const opts = shipOptions(CO.city);
    CO.ship = f.ship && opts.some(o => o.id === f.ship && !o.dis) ? f.ship : opts.find(o => !o.dis).id;
    CO.pvz = f.pvz || null; CO.pay = f.pay || 'sbp'; CO.err = null; CO.slot = f.slot ?? 0; CO.slotDay = f.slotDay ?? 0;
  }
  function viewCheckout() {
    if (!S.cart.length) return `<div class="page wrap"><div class="empty">${icon('bag')}<h1 class="h1">Корзина пуста</h1><p>Оформлять пока нечего — добавьте модели из каталога.</p><a class="btn btn--dark" href="#/catalog">В каталог</a></div></div>`;
    if (S.cart.some(l => l.key === S.soldKey)) { location.hash = '#/cart'; return ''; }
    initCO();
    return `<div class="page wrap" style="padding-top:32px">
      <div class="checkout">
        <form id="coForm" novalidate>
          <div class="mob-summary" id="mobSum"></div>
          <div class="co-block">
            <div class="co-block__head"><span class="n">01</span><h2>Контакты</h2><span class="aside">Регистрация не нужна</span></div>
            <div class="fields">
              ${field('phone', 'Телефон', 'tel', 'Пришлём SMS со статусом заказа', 'tel')}
              ${field('name', 'Имя и фамилия', 'text', 'Как к вам обращаться курьеру', 'name')}
              ${field('email', 'Email — необязательно', 'email', 'Для электронного чека', 'email', 'full')}
            </div>
          </div>
          <div class="co-block">
            <div class="co-block__head"><span class="n">02</span><h2>Доставка</h2></div>
            <div class="field" style="margin-bottom:20px" id="cityField">
              <input id="f-city" type="text" placeholder=" " autocomplete="off" value="${esc(CO.city.n)}" aria-label="Город"><label for="f-city">Город</label>
              <div class="suggest" id="citySug"></div>
            </div>
            ${!S.form.city ? `<div class="city-hint" id="cityHint">${icon('pin')} Определили по IP. Не ваш город? <button type="button" data-act="city-change">Изменить</button></div>` : ''}
            <div id="cityNotice"></div>
            <div class="opts" id="shipOpts"></div>
          </div>
          <div class="co-block">
            <div class="co-block__head"><span class="n">03</span><h2>Оплата</h2></div>
            <div class="opts" id="payOpts"></div>
          </div>
          <div class="co-submit">
            <div id="payErr"></div>
            <label class="check"><input type="checkbox" id="f-sub" ${S.form.sub ? 'checked' : ''}><span>Хочу получать новости и закрытые распродажи<small>Не чаще раза в неделю, отписаться можно в один клик</small></span></label>
            <button class="btn btn--dark btn--lg btn--block" type="submit" id="coSubmit" style="margin-top:22px"></button>
            <p>Нажимая кнопку, вы соглашаетесь с условиями оферты и обработки персональных данных. Это прототип: данные никуда не отправляются и хранятся только в этом браузере.</p>
          </div>
        </form>
        <aside class="co-summary" id="coSum" aria-label="Состав заказа"></aside>
      </div>
    </div>`;
  }
  function field(id, label, type, hint, ac, cls = '') {
    return `<div class="field ${cls}" id="fld-${id}"><input id="f-${id}" type="${type}" placeholder=" " autocomplete="${ac}" value="${esc(S.form[id] || '')}" ${type === 'tel' ? 'inputmode="tel"' : ''}><label for="f-${id}">${label}</label><span class="tick">${icon('check')}</span><div class="hint">${hint}</div></div>`;
  }
  function phoneMask(v) {
    // цифры после префикса +7; ведущие 8/7 (привычка набирать «8 921…») считаем кодом страны
    let p = v.replace(/\D/g, '');
    if (v.trim().startsWith('+7')) p = p.slice(1);
    if ((p[0] === '8' || p[0] === '7') && (p.length === 1 || p.length === 11)) p = p.slice(1);
    p = p.slice(0, 10);
    let out = '+7';
    if (p.length) out += ' (' + p.slice(0, 3);
    if (p.length >= 3) out += ')';
    if (p.length > 3) out += ' ' + p.slice(3, 6);
    if (p.length > 6) out += '-' + p.slice(6, 8);
    if (p.length > 8) out += '-' + p.slice(8, 10);
    return out;
  }
  const VALID = {
    phone: v => v.replace(/\D/g, '').length === 11 ? '' : 'Введите номер полностью — 10 цифр после +7',
    name: v => v.trim().length >= 2 ? (/\d/.test(v) ? 'Имя не должно содержать цифр' : '') : 'Как к вам обращаться?',
    email: v => !v.trim() || /^[^@\s]+@[^@\s]+\.[a-zа-я]{2,}$/i.test(v.trim()) ? '' : 'Проверьте адрес — например, anna@mail.ru',
    street: v => v.trim().length >= 3 ? '' : 'Укажите улицу',
    house: v => v.trim() ? '' : 'Дом'
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
    $('#cityNotice').innerHTML = CO.city.z === 4 ? `<div class="notice warn">${icon('info')}<div><b>В ${CO.city.n} курьеры не доставляют.</b> Доступны пункты выдачи и Почта России — сроки и цены ниже.</div></div>` : '';
    $('#shipOpts').innerHTML = opts.map(o => `
      <div class="opt-card ${CO.ship === o.id ? 'on' : ''} ${o.dis ? 'dis' : ''}" data-ship="${o.id}" role="radio" aria-checked="${CO.ship === o.id}" tabindex="${o.dis ? -1 : 0}">
        <span class="radio"></span>
        <div><div class="opt-card__t">${o.t}</div><div class="opt-card__d">${o.d}</div>${o.tags.length && !o.dis ? `<div class="opt-card__tags">${o.tags.map(t => `<span class="${t === 'Примерка' ? 'g' : ''}">${t}</span>`).join('')}</div>` : ''}</div>
        <div class="opt-card__p">${o.price === null ? '—' : o.price === 0 ? '<span class="free">Бесплатно</span>' : fmt(o.price)}</div>
        ${CO.ship === o.id && !o.dis ? `<div class="sub-panel" data-stop>${subPanel(o)}</div>` : ''}
      </div>`).join('');
    bindSubPanel();
    drawPay(); drawSummary();
  }
  function subPanel(o) {
    if (o.id === 'courier') {
      const days = [0, 1, 2].map(i => o.days + i);
      const slots = ['10:00–14:00', '14:00–18:00', '18:00–22:00'];
      const evening = new Date().getHours() >= 18;
      return `<div class="fields">
          ${field('street', 'Улица', 'text', 'Начните вводить — подскажем адрес', 'address-line1', 'full')}
          ${field('house', 'Дом, корпус', 'text', '', 'address-line2')}
          ${field('flat', 'Квартира / офис', 'text', '', 'off')}
        </div>
        <div class="sub-label">День доставки</div>
        <div class="slots">${days.map((d, i) => `<button type="button" class="slot ${CO.slotDay === i ? 'on' : ''}" data-day="${i}">${dLabel(d).replace(/^./, c => c.toUpperCase())}</button>`).join('')}</div>
        <div class="sub-label">Интервал</div>
        <div class="slots">${slots.map((s, i) => `<button type="button" class="slot ${CO.slot === i ? 'on' : ''}" data-slot="${i}" ${evening && CO.slotDay === 0 && o.days === 1 && i === 0 ? 'disabled' : ''}>${s}</button>`).join('')}</div>
        <div class="field full" style="margin-top:12px"><textarea id="f-comment" placeholder=" ">${esc(S.form.comment || '')}</textarea><label for="f-comment">Комментарий курьеру</label></div>`;
    }
    if (o.id === 'pvz') {
      const list = pvzFor(CO.city);
      if (CO.pvz && !list.some(p => p.id === CO.pvz)) CO.pvz = null;
      return `<div class="pvz">
        <div class="pvz__map" aria-hidden="true">${mapSVG(CO.city.z === 0)}${list.map(p => `<button type="button" class="pin ${CO.pvz === p.id ? 'on' : ''}" data-pvz="${p.id}" style="left:${p.x}%;top:${p.y}%;${p.closed ? 'opacity:.35' : ''}" ${p.closed ? 'aria-disabled="true" title="Временно закрыт"' : ''}><svg viewBox="0 0 26 34"><path d="M13 33S1 20.5 1 12.5a12 12 0 0 1 24 0C25 20.5 13 33 13 33z" fill="#121110"/><circle cx="13" cy="12.5" r="4.2" fill="#FBF7EF"/></svg></button>`).join('')}</div>
        <div class="pvz__list">${list.map(p => `<button type="button" class="pvz-item ${CO.pvz === p.id ? 'on' : ''} ${p.closed ? 'closed' : ''}" data-pvz="${p.id}" ${p.closed ? 'aria-disabled="true"' : ''}>
          <b>${p.name}</b><span>${p.hours}</span>
          <div class="st">${p.closed ? '<span class="r">Временно не принимает заказы</span>' : `<span>${dLabel(o.days + p.days - 1)}</span>${p.fit ? '<span class="g">Есть примерочная</span>' : '<span>Без примерочной</span>'}`}</div></button>`).join('')}</div>
      </div><div id="pvzErr"></div>`;
    }
    if (o.id === 'post') return `<div class="fields">${field('street', 'Адрес: улица, дом, квартира', 'text', '', 'street-address', 'full')}${field('index', 'Индекс', 'text', 'Подставим автоматически по адресу', 'postal-code')}</div>`;
    if (o.id === 'pickup') return `<div class="notice info" style="margin:0">${icon('store')}<div><b>Шоурум на Цветочной, 6</b> — пн–сб 10:00–20:00. Отложим заказ на 3 дня. Здесь же можно примерить всю коллекцию, даже то, чего нет в заказе.</div></div>`;
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
      const STREETS = ['Невский проспект', 'Литейный проспект', 'улица Рубинштейна', 'Московский проспект', 'Большой проспект П.С.', 'Средний проспект В.О.', 'набережная реки Фонтанки', 'Садовая улица', 'Каменноостровский проспект', 'улица Цветочная'];
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
      { id: 'sbp', t: 'СБП', d: 'Оплата из приложения банка, без ввода карты', tag: 'Быстрее всего' },
      { id: 'card', t: 'Банковская карта', d: 'МИР, Visa, Mastercard · 3-D Secure' },
      { id: 'split', t: 'Долями — 4 платежа', d: `${fmt(Math.ceil(t.total / 4))} сейчас и ещё 3 платежа раз в 2 недели, без переплаты` },
      { id: 'cod', t: 'При получении', d: codDis ? 'Недоступно для Почты России — выберите курьера или ПВЗ' : 'Картой или наличными после примерки. Платите только за то, что подошло', dis: codDis }
    ];
    $('#payOpts').innerHTML = opts.map(o => `<div class="opt-card ${CO.pay === o.id ? 'on' : ''} ${o.dis ? 'dis' : ''}" data-pay="${o.id}" role="radio" aria-checked="${CO.pay === o.id}" tabindex="${o.dis ? -1 : 0}"><span class="radio"></span><div><div class="opt-card__t">${o.t}</div><div class="opt-card__d">${o.d}</div>${o.tag ? `<div class="opt-card__tags"><span class="g">${o.tag}</span></div>` : ''}</div><div></div></div>`).join('');
    const total = t.total + shipPrice();
    $('#coSubmit').textContent = CO.pay === 'cod' ? `Подтвердить заказ · ${fmt(total)}` : `Оплатить ${fmt(CO.pay === 'split' ? Math.ceil(total / 4) : total)}${CO.pay === 'split' ? ' сейчас' : ''}`;
  }
  function shipPrice() { const o = shipOptions(CO.city).find(x => x.id === CO.ship); return o && o.price ? o.price : 0; }
  function drawSummary() {
    const t = totals(), sp = shipPrice(), o = shipOptions(CO.city).find(x => x.id === CO.ship);
    const html = `<h3 class="h3" style="margin-bottom:18px">Заказ · ${cartCount()} ${plural(cartCount(), 'товар', 'товара', 'товаров')}</h3>
      <div class="co-summary__items">${S.cart.map(l => { const { p, v, sum } = lineInfo(l); return `<div class="co-item"><div class="ph"><img src="${v.img}" alt="">${l.qty > 1 ? `<em>${l.qty}</em>` : ''}</div><div>${p.type} «${p.name}»<small>${v.color} · ${l.size} размер</small></div><span class="num">${fmt(sum)}</span></div>`; }).join('')}</div>
      <div class="sum-row"><span>Товары</span><span class="num">${fmt(t.sub + t.saleSave)}</span></div>
      ${t.saleSave ? `<div class="sum-row disc"><span>Скидка</span><span class="num">−${fmt(t.saleSave)}</span></div>` : ''}
      ${t.disc ? `<div class="sum-row disc"><span>Промокод ${S.promo}</span><span class="num">−${fmt(t.disc)}</span></div>` : ''}
      <div class="sum-row"><span>Доставка</span><span class="num">${sp ? fmt(sp) : '<span style="color:var(--ok)">Бесплатно</span>'}</span></div>
      <div class="sum-total"><span>Итого</span><span class="num">${fmt(t.total + sp)}</span></div>
      <div class="eta">${icon('clock')}<span>${o ? `<b>${o.id === 'pickup' ? 'Самовывоз' : 'Доставка'} ${o.id === 'post' ? 'за 5–9 дней' : dLabel(o.days)}</b>` : ''}<br>${CO.city.n}${o && (o.id === 'courier' || o.id === 'pvz') ? ' · примерка перед оплатой' : ''}</span></div>
      <a class="link small" href="#/cart" style="display:inline-block;margin-top:14px">Изменить состав</a>`;
    $('#coSum').innerHTML = html;
    const m = $('#mobSum');
    const open = m.classList.contains('on');
    m.innerHTML = `<button type="button" data-act="mobsum"><span>${open ? 'Скрыть' : 'Показать'} состав заказа</span><b class="num">${fmt(t.total + sp)}</b></button><div class="in">${html}</div>`;
  }
  function bindCheckout() {
    if (!$('#coForm')) return;
    ['phone', 'name', 'email'].forEach(id => {
      const i = $('#f-' + id);
      if (S.form[id]) setFieldState(id, false);
      i.addEventListener('input', () => {
        if (id === 'phone') { const pos = i.value.length; i.value = i.value.replace(/\D/g, '').length ? phoneMask(i.value) : ''; }
        S.form[id] = i.value; persist();
        if ($('#fld-' + id).classList.contains('err') || (id === 'phone' && i.value.replace(/\D/g, '').length === 11)) setFieldState(id, true);
      });
      i.addEventListener('focus', () => { if (id === 'phone' && !i.value) i.value = '+7 ('; });
      i.addEventListener('blur', () => { if (id === 'phone' && i.value.replace(/\D/g, '').length <= 1) { i.value = ''; S.form.phone = ''; } if (i.value) setFieldState(id, true); });
    });
    // city
    const ci = $('#f-city'), sug = $('#citySug');
    const showSug = () => {
      const q = ci.value.toLowerCase().trim();
      const m = CITIES.filter(c => !q || c.n.toLowerCase().startsWith(q) || c.n.toLowerCase().includes(' ' + q)).slice(0, 6);
      sug.innerHTML = m.length ? m.map((c, i) => `<button type="button" data-city="${c.n}" class="${i === 0 ? 'hl' : ''}">${c.n}${c.r ? `<small>${c.r}</small>` : ''}</button>`).join('') : '<button type="button" disabled>Город не найден — проверьте название</button>';
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
      if (pv) { const p = pvzFor(CO.city).find(x => x.id === pv.dataset.pvz); if (p.closed) { $('#pvzErr').innerHTML = `<div class="notice err" style="margin:10px 0 0">${icon('alert')}<div>Этот пункт временно закрыт до 12 октября. Выберите ближайший — Цветочная, 6 или Невский, 88.</div></div>`; return; } CO.pvz = p.id; S.form.pvz = p.id; persist(); drawShip(); return; }
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
      $('#pvzErr').innerHTML = `<div class="notice err" style="margin:10px 0 0">${icon('alert')}<div>Выберите пункт выдачи на карте или в списке</div></div>`;
      if (!firstBad) firstBad = $('#pvzErr');
    }
    if (firstBad) { firstBad.scrollIntoView({ block: 'center', behavior: 'smooth' }); if (firstBad.focus) setTimeout(() => firstBad.focus({ preventScroll: true }), 300); return; }
    const sheet = $('#paySheet');
    $('#payTitle').textContent = CO.pay === 'cod' ? 'Оформляем заказ…' : CO.pay === 'sbp' ? 'Открываем приложение банка…' : CO.pay === 'split' ? 'Переходим в «Долями»…' : 'Переходим к оплате…';
    $('#payText').textContent = CO.pay === 'cod' ? 'Резервируем пары на складе фабрики' : 'В прототипе оплата имитируется';
    sheet.classList.add('on');
    setTimeout(() => {
      sheet.classList.remove('on');
      if (S.flags.payFail && CO.pay !== 'cod') {
        $('#payErr').innerHTML = `<div class="notice err">${icon('alert')}<div><b>Платёж не прошёл — банк отклонил операцию.</b> Деньги не списаны, заказ и все данные сохранены.
          <div class="acts"><button type="button" data-act="retry">Попробовать ещё раз</button>${CO.ship !== 'post' ? '<button type="button" data-act="to-cod">Оплатить при получении</button>' : ''}</div></div></div>`;
        $('#payErr').scrollIntoView({ block: 'center', behavior: 'smooth' });
        if (retry) toast({ text: 'Банк снова отклонил платёж', sub: 'Выключите сценарий в панели прототипа' });
        return;
      }
      const t = totals(), o = shipOptions(CO.city).find(x => x.id === CO.ship);
      const pv = CO.ship === 'pvz' ? pvzFor(CO.city).find(p => p.id === CO.pvz) : null;
      S.lastOrder = {
        num: 'СМ-' + String(Date.now()).slice(-6),
        name: (S.form.name || '').trim().split(' ')[0],
        phone: S.form.phone, email: S.form.email,
        items: S.cart.map(l => ({ ...l })), total: t.total + shipPrice(), ship: o.t, shipId: o.id, days: o.days,
        addr: CO.ship === 'courier' ? `${CO.city.n}, ${S.form.street}, ${S.form.house}${S.form.flat ? ', кв. ' + S.form.flat : ''}` : CO.ship === 'pvz' ? `${pv.name}` : CO.ship === 'pickup' ? 'Шоурум фабрики, ул. Цветочная, 6' : `${CO.city.n}, ${S.form.street}`,
        when: o.id === 'post' ? `${dShort(addDays(o.days - 2))} — ${dShort(addDays(o.days + 2))}` : dLabel(o.days + (CO.ship === 'courier' ? CO.slotDay : 0)) + (CO.ship === 'courier' ? ', ' + ['10:00–14:00', '14:00–18:00', '18:00–22:00'][CO.slot] : ''),
        pay: CO.pay
      };
      S.cart = []; S.promo = null; S.soldKey = null; persist();
      location.hash = '#/success';
    }, 1500);
  }

  /* --------------------------------------------------------------- success */
  function viewSuccess() {
    const o = S.lastOrder;
    if (!o) return `<div class="page wrap"><div class="empty"><h1 class="h1">Заказов пока нет</h1><p>Оформите заказ — здесь появится его статус.</p><a class="btn btn--dark" href="#/catalog">В каталог</a></div></div>`;
    const paid = o.pay !== 'cod';
    const payText = { sbp: 'Оплачено через СБП', card: 'Оплачено картой', split: `Оплачено ${fmt(Math.ceil(o.total / 4))} · ещё 3 платежа`, cod: 'Оплата при получении — картой или наличными' }[o.pay];
    return `<div class="page wrap"><div class="success">
      <div class="success__hero">
        <div>
          <div class="success__check">${icon('check')}</div>
          <h1 class="h-display" style="font-size:clamp(40px,5vw,72px)">${o.name ? esc(o.name) + ', спасибо!' : 'Спасибо!'}<br>Заказ принят.</h1>
          <div class="success__num">Номер заказа <b>${o.num}</b> · SMS отправили на ${esc(o.phone || '')}</div>
        </div>
        <div class="muted" style="max-width:380px">Мы уже передали заказ в сборку на фабрике. ${o.shipId === 'pickup' ? 'Позвоним, когда пары будут ждать вас в шоуруме.' : 'Курьерская служба пришлёт SMS с трек-номером, как только заберёт посылку.'}</div>
      </div>
      <ol class="timeline">
        <li class="done"><b>Заказ принят</b><span>Сейчас</span></li>
        <li class="now"><b>Сборка на фабрике</b><span>${new Date().getHours() < 16 ? 'Сегодня до 18:00' : 'Завтра до 12:00'}</span></li>
        <li><b>${o.shipId === 'pickup' ? 'Готов к выдаче' : 'Передан в доставку'}</b><span>${o.shipId === 'pickup' ? o.when.replace(/^./, c => c.toUpperCase()) : dLabel(Math.max(CUT, o.days - 1)).replace(/^./, c => c.toUpperCase())}</span></li>
        <li><b>${o.shipId === 'pickup' ? 'Ждём в шоуруме' : 'Получение и примерка'}</b><span>${o.when.replace(/^./, c => c.toUpperCase())}</span></li>
      </ol>
      <div class="success__grid">
        <div class="info-card"><div class="label">Доставка</div><p>${esc(o.ship)}</p><p>${esc(o.addr)}</p><p>${esc(o.when)}</p></div>
        <div class="info-card"><div class="label">Оплата</div><p>${payText}</p><p>${paid ? 'Чек отправим на ' + (o.email ? esc(o.email) : 'телефон в SMS') : 'Если пара не подойдёт — просто оставьте её курьеру'}</p><p class="num">Итого: ${fmt(o.total)}</p></div>
        <div class="info-card"><div class="label">Состав · ${o.items.reduce((s, l) => s + l.qty, 0)} шт.</div>${o.items.map(l => { const p = byId[l.id], v = variant(p, l.code); return `<p>${p.type} «${p.name}», ${v.color}, ${l.size}${l.qty > 1 ? ` × ${l.qty}` : ''}</p>`; }).join('')}</div>
      </div>
      <div class="next-steps">
        <div class="next-card"><h3>Статус — в Telegram</h3><p>Бот пришлёт трек-номер, напомнит о доставке и поможет с возвратом. Без звонков.</p><button class="btn btn--dark" data-act="tg">${icon('send')} Подключить бота</button></div>
        <div class="next-card" id="accCard"><h3>Сохранить данные для следующих покупок</h3><p>Создадим профиль по номеру ${esc(o.phone || '')} — без пароля, вход по коду из SMS. Здесь будут заказы${S.mySize ? ` и ваш размер (${S.mySize})` : ' и адреса'}.</p><button class="btn btn--outline" data-act="create-acc">Создать профиль в один клик</button></div>
      </div>
      <div style="margin-top:72px"><div class="row-head"><h2 class="h3">Пока ждёте — как ухаживать за кожей осенью</h2><a class="link small" href="#/">Вернуться в магазин</a></div>
        <div class="journal">${JOURNAL.slice().reverse().map(j => `<a class="post" href="#/" data-act="journal"><div class="ph"><img src="${j.img}" alt="" loading="lazy"></div><div class="label">${j.tag}</div><h3>${j.title}</h3></a>`).join('')}</div></div>
    </div></div>`;
  }

  /* ------------------------------------------------------------------- CJM */
  function viewCJM() {
    const rows = [
      ['Знакомство', 'Понять, что за бренд и можно ли здесь купить', 'Первый экран — «фотогалерея настроения», нет цен; «Купить в розницу» уводит на WB / Ozon / Lamoda', 'Первый экран: товар на модели с ценой и меткой быстрого просмотра. УТП в одну строку: примерка, доставка завтра, возврат 30 дней'],
      ['Выбор', 'Найти подходящую модель в своём размере и цвете', 'Артикулы вместо названий, каждый цвет — отдельная карточка, нет фильтра по размеру', 'Имена моделей + артикул мелко. Цвета — свотчи в одной карточке. Подбор размера по длине стопы → фильтр «есть мой размер»'],
      ['Решение', 'Убедиться в размере, качестве и условиях', 'В карточке только «Заказать оптом», нет доставки и возврата', 'Быстрый просмотр: остаток по размерам, «последняя пара», таблица стоп, примерка/возврат, «Долями»'],
      ['Корзина', 'Проверить заказ и стоимость', 'Корзины нет — покупатель уходит на маркетплейс, бренд теряет клиента и маржу', 'Смена размера прямо в корзине, прогресс бесплатной доставки, промокод, удаление с отменой'],
      ['Оформление', 'Быстро, без регистрации, понятные сроки и цены', '—', 'Одна страница, 3 блока. Город по IP, ПВЗ на карте с примерочными, цена и дата у каждого способа, 4 способа оплаты'],
      ['Ожидание', 'Знать, что происходит с заказом', '—', 'Таймлайн статусов, Telegram-бот, профиль в 1 клик — после покупки, а не до']
    ];
    const ucs = [
      ['UC-1 · «Знаю, что хочу»', 'Бордовые ботильоны 38 размера: первый экран → метка на фото → размер → в корзину → оформление. 4 экрана, около 7 действий.', () => 'qv:millionnaya'],
      ['UC-2 · «Не знаю размер этой фабрики»', 'Подбор по длине стопы → в каталоге только то, что есть в наличии → в карточке размер уже выбран.', () => 'scroll:finder'],
      ['UC-3 · «Увидела образ»', 'Блок «Образы сезона»: точка на фото → мини-карточка → быстрый просмотр.', () => 'scroll:looks'],
      ['UC-4 · Покупка в другой город', 'Москва / Казань: ПВЗ на карте, честные сроки и цены. Самовывоз из шоурума скрыт, если он недоступен.', () => 'city:Казань'],
      ['UC-5 · Оптовый клиент', 'Отдельный вход «Оптовикам» в шапке — дилерская программа и форменная обувь не смешиваются с розницей.', () => 'trade']
    ];
    const ccs = [
      ['Размер закончился, пока товар лежал в корзине', 'Позиция подсвечена, остальной заказ сохранён, кнопка оформления заблокирована до выбора другого размера.', 'sold'],
      ['Нужного размера нет в наличии', 'Размер перечёркнут, но кликабелен: вместо «В корзину» — подписка на поступление по SMS.', 'qv-out'],
      ['Не выбран размер', 'Кнопка «Выберите размер», при нажатии блок размеров вздрагивает и показывает подсказку.', 'qv:okhta'],
      ['Последняя пара', 'Метка «1 пара» под размером и предупреждение в карточке.', 'qv:millionnaya'],
      ['Город без курьерской доставки', 'Норильск: курьер недоступен с объяснением, предлагаются ПВЗ и Почта.', 'city:Норильск'],
      ['Пункт выдачи временно закрыт', 'Виден на карте и в списке, но выбрать нельзя — показываем ближайшие альтернативы.', 'city:Санкт-Петербург'],
      ['Оплата не прошла', 'Сообщение без паники: деньги не списаны, данные сохранены. «Повторить» или «Оплатить при получении».', 'payfail'],
      ['Почта и оплата при получении', 'Для Почты способ «При получении» неактивен и объясняет почему.', 'city:Москва'],
      ['Промокод не подходит', 'OSEN10 не действует на распродажу — пишем это прямо, а не «ошибка».', 'cart'],
      ['Удалили товар случайно', 'Тост с кнопкой «Вернуть» 6 секунд.', 'cart'],
      ['Пустая корзина', 'Не тупик: категории и «Вы смотрели».', 'empty'],
      ['Ушли с оформления', 'Корзина, контакты и выбор доставки сохраняются на устройстве.', 'checkout']
    ];
    return `<div class="page wrap">
      <div class="crumbs"><a href="#/">Главная</a><span>/</span><span>CJM и сценарии</span></div>
      <div class="cat-intro"><h1 class="h1">Путь покупателя</h1><p>Как прототип убирает барьеры текущего сайта на каждом шаге — от первого экрана до получения заказа. Каждый сценарий можно открыть в прототипе.</p></div>
      <div class="scroll-x"><table class="cjm-table"><thead><tr><th>Этап</th><th>Цель покупателя</th><th>Барьер сейчас</th><th>Решение в редизайне</th></tr></thead>
        <tbody>${rows.map(r => `<tr><th>${r[0]}</th><td>${r[1]}</td><td class="pain">${r[2]}</td><td class="fix">${r[3]}</td></tr>`).join('')}</tbody></table></div>
      <h2 class="h2" style="margin:80px 0 24px">Use cases</h2>
      <div class="cases">${ucs.map(u => `<div class="case"><b>${u[0]}</b><p>${u[1]}</p><button class="btn btn--outline" data-demo="${u[2]()}">Открыть ${icon('arrow')}</button></div>`).join('')}</div>
      <h2 class="h2" style="margin:80px 0 24px">Corner cases</h2>
      <div class="cases">${ccs.map(c => `<div class="case"><b>${c[0]}</b><p>${c[1]}</p><button class="btn btn--outline" data-demo="${c[2]}">Показать ${icon('arrow')}</button></div>`).join('')}</div>
    </div>`;
  }
  function demo(d) {
    const [k, v] = d.split(':');
    if (k === 'qv') { go('#/'); setTimeout(() => openQV(v), 350); }
    if (k === 'qv-out') { go('#/'); setTimeout(() => { openQV('neva'); QV.size = '39'; renderQV(); }, 350); }
    if (k === 'scroll') go('#/', v);
    if (k === 'trade') tradeToast();
    if (k === 'city') { ensureCart(); S.form.city = v; S.form.ship = v === 'Москва' ? 'post' : 'pvz'; S.form.pvz = null; S.soldKey = null; persist(); go('#/checkout'); }
    if (k === 'sold') { ensureCart(); S.flags.soldOut = true; S.soldKey = S.cart[0].key; persist(); renderProto(); go('#/cart'); }
    if (k === 'payfail') { ensureCart(); S.flags.payFail = true; S.soldKey = null; persist(); renderProto(); go('#/checkout'); toast({ text: 'Сценарий «Оплата не прошла» включён', sub: 'Заполните форму и нажмите «Оплатить»' }); }
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
    $('#search').innerHTML = `<div class="search__bar">${icon('search')}<input id="sIn" placeholder="Ботильоны, бордовый, 38…" aria-label="Поиск по каталогу"><button class="icon-btn" data-act="search-close" aria-label="Закрыть">${icon('close')}</button></div>
      <div class="search__body"><div><div class="label muted" style="margin-bottom:14px">Часто ищут</div><div class="search__pop">${['Ботильоны', 'Бордовый', 'Лоферы', 'Зимние сапоги', 'Замша', 'Кеды'].map(q => `<button data-q="${q}">${q}</button>`).join('')}</div></div><div class="search__res grid" id="sRes"></div></div>`;
    const inp = $('#sIn');
    const run = () => {
      const q = inp.value.toLowerCase().trim();
      const terms = q.split(/\s+/).filter(Boolean);
      const list = (terms.length ? P.filter(p => { const hay = [p.name, p.type, catName(p.cat), p.season, ...p.variants.map(v => v.color + ' ' + v.code), ...p.specs.map(s => s[1])].join(' ').toLowerCase(); return terms.every(t => hay.includes(t.replace(/ые$|ая$|ий$|ой$/, ''))); }) : P.filter(p => p.badge === 'Новинка')).slice(0, 10);
      $('#sRes').innerHTML = list.length ? list.map(p => cardHTML(p, { noHint: true })).join('') : `<div class="empty-grid" style="grid-column:1/-1">Ничего не нашли по «${esc(q)}». Попробуйте «ботинки» или «бордовый».</div>`;
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
    $('#mnav').innerHTML = `<div class="mnav__top"><a class="logo" href="#/"><img src="assets/img/logo.png" alt=""><b>Скороход<span>·Мода</span></b></a><button class="icon-btn" data-act="mnav-close" aria-label="Закрыть">${icon('close')}</button></div>
      <a href="#/catalog">Каталог</a><div class="sub">${CATS.map(c => `<a href="#/catalog/${c.id}">${c.name}</a>`).join('')}</div>
      <a href="#/catalog/new">Новинки</a><a href="#/catalog/fav">Избранное</a><a href="#/cart">Корзина</a><button class="lnk" data-scroll="finder">Подбор размера</button><a href="#/cjm">CJM и сценарии</a>
      <div class="mnav__foot"><button data-act="trade" style="text-align:left">Оптовикам и организациям →</button><span>+7 (812) 329-44-35</span><span>hello@skorohod-moda.ru</span></div>`;
  }

  /* -------------------------------------------------------------- footer */
  // след женской туфли: носок + каблук
  const PRINT = '<svg viewBox="0 0 22 52" aria-hidden="true"><path d="M11 1.5c5.6 0 9.2 5.2 9.2 12.4 0 6.4-2.6 11.3-4.4 15.6-.9 2.1-2.2 3.1-4.8 3.1s-3.9-1-4.8-3.1C4.4 25.2 1.8 20.3 1.8 13.9 1.8 6.7 5.4 1.5 11 1.5z"/><ellipse cx="11" cy="45.5" rx="3.6" ry="4.6"/></svg>';
  function roomStatus() {
    // часы шоурума по Москве: пн–сб 10–20, вс — выходной
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Moscow', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false }).formatToParts(new Date()).map(p => [p.type, p.value]));
    const h = +parts.hour + (+parts.minute) / 60, sun = parts.weekday === 'Sun', sat = parts.weekday === 'Sat';
    if (!sun && h >= 10 && h < 20) return { open: true, text: `Открыто · до 20:00 · сейчас ${parts.hour}:${parts.minute}` };
    const next = sat && h >= 20 ? 'в понедельник' : sun ? 'завтра' : h < 10 ? 'сегодня' : 'завтра';
    return { open: false, text: `Закрыто · откроемся ${next} в 10:00` };
  }
  function renderFooter(mode) {
    if (mode === 'checkout') { $('#footer').innerHTML = ''; return; }
    const st = roomStatus();
    $('#footer').innerHTML = `<div class="ft" id="ft">
      <div class="ft__trail" id="ftTrail"></div>
      <div class="ft__hint" aria-hidden="true">${PRINT}Проведите курсором — оставьте след</div>
      <div class="ft__in">
        <div class="ft__top">
          <div>
            <span class="label ft__eyebrow">Скороход — тот, кто быстро ходит</span>
            <h2 class="ft__big">Пройдёмся<br>вместе? <em>−10%</em></h2>
            <form class="ft__form" data-news><input type="email" placeholder="Ваш email" aria-label="Email"><button>Подписаться ${icon('arrow')}</button></form>
            <div class="ft__fine">Новые коллекции и закрытые распродажи раньше всех. Не чаще раза в неделю.</div>
          </div>
          <div class="ft__room">
            <div class="ph"><img src="assets/img/craft.webp" alt="Цех фабрики" loading="lazy"></div>
            <div>
              <h4>Шоурум при фабрике</h4>
              <p>Санкт-Петербург, ул. Цветочная, 6 · м. «Московские ворота»</p>
              <div class="ft__status ${st.open ? '' : 'closed'}"><i></i>${st.text}</div>
              <div class="acts"><a href="#/" data-act="route">Маршрут ${icon('arrow')}</a><a href="tel:+78123294435">Позвонить</a></div>
            </div>
          </div>
        </div>
        <div class="ft__mid">
          <div><h5>Покупателям</h5><ul><li><a href="#/cjm">Доставка и оплата</a></li><li><a href="#/cjm">Возврат и обмен</a></li><li><a href="#/" data-scroll="finder">Подбор размера</a></li><li><a href="#/" data-act="journal">Уход за обувью</a></li></ul></div>
          <div><h5>Каталог</h5><ul>${CATS.slice(0, 4).map(c => `<li><a href="#/catalog/${c.id}">${c.name}</a></li>`).join('')}</ul></div>
          <div><h5>Компания</h5><ul><li><a href="#/" data-scroll="factory">О фабрике</a></li><li><a href="#/" data-scroll="journal">Журнал</a></li><li><button data-act="trade">Оптовикам</button></li><li><a href="#/cjm">CJM и сценарии</a></li></ul></div>
          <div><h5>Связь</h5><ul><li><a href="tel:+78123294435">+7 (812) 329-44-35</a></li><li><a href="mailto:hello@skorohod-moda.ru">hello@skorohod-moda.ru</a></li><li><a href="#/" data-act="journal">Telegram</a></li><li><a href="#/" data-act="journal">ВКонтакте</a></li></ul></div>
          <button class="ft__up" data-act="to-top" aria-label="Наверх">${icon('arrow')}</button>
        </div>
      </div>
      <div class="ft__word" id="ftWord" aria-label="Скороход">${'СКОРОХОД'.split('').map((ch, i) => `<span style="transition-delay:${i * 55}ms" aria-hidden="true">${ch}</span>`).join('')}</div>
      <div class="ft__bottom"><span>© 2026 Скороход·Мода</span><span class="ft__note">Концепт редизайна — тестовое задание, не официальный сайт</span><span class="ft__social"><span>Telegram</span><span>VK</span></span></div>
    </div>`;
    initFooter();
  }
  let ftResize = () => {};
  function initFooter() {
    const ft = $('#ft'), word = $('#ftWord'), trail = $('#ftTrail'); if (!ft) return;
    // слово во всю ширину: кегль по сумме реальных ширин букв
    const spans = $$('span', word);
    const fit = () => { word.style.setProperty('--fs', '200px'); const w = spans.reduce((s, sp) => s + sp.getBoundingClientRect().width, 0); word.style.setProperty('--fs', Math.max(56, 200 * (word.clientWidth * .985) / Math.max(1, w)) + 'px'); };
    fit();
    window.removeEventListener('resize', ftResize); ftResize = fit; window.addEventListener('resize', ftResize, { passive: true });
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(fit);
    if ('IntersectionObserver' in window) { const o = new IntersectionObserver(es => es.forEach(e => { if (e.isIntersecting) { ft.classList.add('in'); o.disconnect(); if (!matchMedia('(hover:hover)').matches) autoWalk(); } }), { threshold: .25 }); o.observe(ft); } else ft.classList.add('in');
    setTimeout(() => spans.forEach(s => s.style.transitionDelay = ''), 1800);
    // следы за курсором: левый/правый по очереди, развёрнуты по направлению шага
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
    $('#proto').innerHTML = `<div class="proto__panel" role="dialog" aria-label="Навигация по прототипу">
        <h4>Прототип · навигация</h4><p>Пять экранов сценария и переключатели нестандартных ситуаций для проверки.</p>
        <div class="grp">Экраны</div>
        <div class="proto__screens">
          <button data-nav="#/"><em>01</em>Главная</button>
          <button data-nav="qv"><em>02</em>Поп-ап товара</button>
          <button data-nav="#/cart"><em>03</em>Корзина</button>
          <button data-nav="#/checkout"><em>04</em>Оформление</button>
          <button data-nav="#/success"><em>05</em>Заказ принят</button>
          <button data-nav="#/cjm"><em>+</em>CJM и кейсы</button>
        </div>
        <div class="grp">Corner cases</div>
        <label class="tg"><span>Размер закончился в корзине</span><input type="checkbox" data-flag="soldOut" ${S.flags.soldOut ? 'checked' : ''}><i></i></label>
        <label class="tg"><span>Оплата не проходит</span><input type="checkbox" data-flag="payFail" ${S.flags.payFail ? 'checked' : ''}><i></i></label>
        <button class="proto__reset" data-act="reset">Сбросить прототип</button>
      </div>
      <button class="proto__btn" data-act="proto" aria-expanded="false"><i></i>Прототип</button>`;
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
  function tradeToast() { toast({ text: 'Оптовый раздел — отдельный вход', sub: 'Дилерская программа, форменная обувь, каталог PDF. Вне рамок прототипа', ttl: 5000 }); }
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
      else { if ((n === '#/checkout' || n === '#/cart') && !S.cart.length) ensureCart(); if (n === '#/success' && !S.lastOrder) { toast({ text: 'Сначала оформите заказ', sub: 'Заполните форму — откроется экран подтверждения' }); ensureCart(); go('#/checkout'); return; } go(n); }
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
    if (act === 'account') { toast({ text: 'Вход по номеру телефона', sub: 'Код из SMS, без пароля. В прототипе профиль создаётся после заказа' }); return; }
    if (act === 'journal') { e.preventDefault(); toast({ text: 'Журнал — вне рамок прототипа', sub: 'Статьи переносятся с текущего сайта' }); return; }
    if (act === 'clear-size' || act === 'reset-size-filter') { S.mySize = null; persist(); route(); return; }
    if (act === 'proto') { const p = $('#proto'); p.classList.toggle('on'); a.setAttribute('aria-expanded', p.classList.contains('on')); return; }
    if (act === 'reset') { try { localStorage.removeItem(LS); } catch (er) { /* */ } location.hash = '#/'; location.reload(); return; }
    if (act === 'to-top') { window.scrollTo({ top: 0, behavior: 'smooth' }); return; }
    if (act === 'route') { e.preventDefault(); toast({ text: 'Маршрут до шоурума', sub: 'В реальном магазине откроется Яндекс Карты' }); return; }
    if (act === 'tg') { toast({ text: 'Бот подключён', sub: 'В реальном магазине откроется Telegram' }); return; }
    if (act === 'create-acc') { $('#accCard').innerHTML = `<h3>Профиль создан</h3><p>Войти можно по номеру ${esc(S.lastOrder?.phone || '')} — код придёт в SMS. Размер ${S.mySize || 'и адрес'} сохранены.</p>`; return; }
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
      if (f.checked) { ensureCart(); S.soldKey = S.cart[0].key; toast({ text: 'Сценарий включён', sub: 'Первая позиция в корзине — размер закончился' }); persist(); go('#/cart'); }
      else { S.soldKey = null; persist(); route(); }
    } else { persist(); if (f.checked) toast({ text: 'Сценарий «Оплата не прошла» включён', sub: 'Оформите заказ с онлайн-оплатой' }); }
    updateBadges();
  });
  document.addEventListener('submit', e => {
    if (e.target.matches('[data-news]')) { e.preventDefault(); const i = $('input', e.target); if (!/^[^@\s]+@[^@\s]+\.\w{2,}$/.test(i.value)) { i.style.color = '#F2A49A'; i.focus(); return; } e.target.innerHTML = '<span style="padding:14px 0;display:block">Готово! Промокод на −10% — в письме.</span>'; }
  });

  /* ------------------------------------------------------------------ boot */
  ensureCartBinding();
  renderProto();
  window.addEventListener('hashchange', route);
  route();
})();
