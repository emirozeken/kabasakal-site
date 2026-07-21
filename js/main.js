(function scrollZoom(){
  var app = document.getElementById('app');
  var scrollzoom = document.getElementById('scrollzoom');
  var stack = document.getElementById('stack');
  var captions = Array.prototype.slice.call(document.querySelectorAll('.caption'));
  var scrollMascots = Array.prototype.slice.call(document.querySelectorAll('.scroll-mascot'));
  var outro = document.getElementById('outro');
  var stickyEl = scrollzoom.querySelector('.sticky');
  var scrollhintEl = document.getElementById('scrollhint');
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Overall page-scroll progress bar — independent of the burger-stage math below,
  // so it still works (no motion involved) even when prefers-reduced-motion is on.
  var progressBar = document.getElementById('progressbar');
  function updateProgress(){
    if(!progressBar) return;
    var scrollable = app.scrollHeight - app.clientHeight;
    var p = scrollable > 0 ? Math.max(0, Math.min(1, app.scrollTop / scrollable)) : 0;
    progressBar.style.width = (p * 100) + '%';
  }
  app.addEventListener('scroll', updateProgress, {passive:true});
  updateProgress();

  if(reduced){
    captions.forEach(function(c){c.classList.add('show');});
    if(outro) outro.classList.add('show');
    return;
  }

  var stages = [
    {c:272, s:0.72}, {c:70, s:2.0}, {c:180, s:2.15},
    {c:290, s:2.55}, {c:373, s:2.25}, {c:465, s:1.0}
  ];

  var dotsWrap = document.getElementById('dots');
  for(var i=0;i<stages.length;i++){ dotsWrap.appendChild(document.createElement('i')); }
  var dotEls = dotsWrap.children;

  // HUD readout — one value per camera keyframe (same length/order as `stages` above), telling a
  // real temperature story: prep stays cool, spikes hard at the smash/sear stage, then cools as
  // the sauce goes on and the plate is served. Purely atmospheric (aria-hidden), so no fallback
  // is needed for browsers/users that never see it (hidden under reduced-motion via CSS already).
  var hudTempEl = document.getElementById('hud-temp-value');
  var hudProcessEl = document.getElementById('hud-process');
  var hudLayerEl = document.getElementById('hud-layer');
  var hudTemps = [22, 24, 26, 232, 140, 62];
  var hudProcessLabels = ['Hazırlık', 'Ekmek Hazırlama', 'Sebze Hazırlama', 'Smash & Sear', 'Sos & Servis', 'Servise Hazır'];
  var hudLayerLabels = ['—', '01 / 04', '02 / 04', '03 / 04', '04 / 04', 'Tamam'];

  function lerp(a,b,t){ return a+(b-a)*t; }
  function clamp(v,min,max){ return Math.max(min,Math.min(max,v)); }
  function ease(t){ return t<0.5 ? 4*t*t*t : 1-Math.pow(-2*t+2,3)/2; }

  var ticking = false;

  function update(){
    ticking = false;
    var scrollzoomTop = scrollzoom.offsetTop;
    var scrollable = scrollzoom.offsetHeight - app.clientHeight;
    if(scrollable < 1) scrollable = 1;
    var progress = clamp((app.scrollTop - scrollzoomTop) / scrollable, 0, 1);

    var stageFloat = progress * (stages.length-1);
    var idx = Math.floor(stageFloat);
    if(idx > stages.length-2) idx = stages.length-2;
    if(idx < 0) idx = 0;
    var t = ease(clamp(stageFloat-idx,0,1));

    var c = lerp(stages[idx].c, stages[idx+1].c, t);
    var s = lerp(stages[idx].s, stages[idx+1].s, t);
    var viewportCenter = app.clientHeight/2;
    var T = viewportCenter - s*c;

    stack.style.transform = 'translateX(-50%) translateY('+T+'px) scale('+s+')';

    captions.forEach(function(el){
      var stageIdx = parseInt(el.getAttribute('data-stage'),10);
      el.classList.toggle('show', Math.abs(stageFloat - stageIdx) < 0.42);
    });
    scrollMascots.forEach(function(el){
      var stageIdx = parseInt(el.getAttribute('data-stage'),10);
      el.classList.toggle('show', Math.abs(stageFloat - stageIdx) < 0.42);
    });
    if(outro) outro.classList.toggle('show', stageFloat > 4.55);
    if(scrollhintEl) scrollhintEl.style.opacity = app.scrollTop > 20 ? 0 : 1;
    for(var i=0;i<dotEls.length;i++){ dotEls[i].classList.toggle('active', i===Math.round(stageFloat)); }

    if(hudTempEl){
      var nearest = clamp(Math.round(stageFloat), 0, hudProcessLabels.length-1);
      var temp = Math.round(lerp(hudTemps[idx], hudTemps[idx+1], t));
      hudTempEl.textContent = temp + '°';
      hudTempEl.classList.toggle('hot', temp >= 180);
      hudProcessEl.textContent = hudProcessLabels[nearest];
      hudLayerEl.textContent = hudLayerLabels[nearest];
    }
    if(stickyEl) stickyEl.classList.toggle('outro-active', stageFloat > 4.55);
  }

  function onScroll(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }

  app.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  update();
})();

function drinkIconSVG(shape, color){
  // Yan-ürün ikonları: adet/boy bilgisi görselin kendisine kodlanıyor (4'lü = 4 halka,
  // büyük boy = daha dolu kutu) — böylece boyutlar arasında "aynı fotoğraf" tekrarı yerine
  // her kart gerçekten farklı görünüyor.
  var fryStick = function(x, h, tilt){
    return '<rect x="' + x + '" y="' + (78 - h) + '" width="9" height="' + h + '" rx="4" fill="#F7C948"' +
      (tilt ? ' transform="rotate(' + tilt + ' ' + (x + 4.5) + ' ' + (78 - h) + ')"' : '') + '/>';
  };
  var friesBox = function(color, sticks){
    return sticks +
      '<path d="M27 72 L73 72 L67 130 L33 130 Z" fill="' + color + '"/>' +
      '<path d="M27 72 L73 72 L71.5 86 L28.5 86 Z" fill="rgba(0,0,0,.15)"/>' +
      '<rect x="42" y="95" width="16" height="16" rx="8" fill="rgba(255,255,255,.25)"/>';
  };
  var onionRing = function(cx, cy, rx, color){
    return '<ellipse cx="' + cx + '" cy="' + cy + '" rx="' + rx + '" ry="' + (rx * 0.42) + '" fill="none" stroke="' + color + '" stroke-width="' + (rx * 0.38) + '"/>' +
      '<ellipse cx="' + cx + '" cy="' + (cy - rx * 0.1) + '" rx="' + (rx * 0.82) + '" ry="' + (rx * 0.3) + '" fill="none" stroke="rgba(255,255,255,.28)" stroke-width="2.5"/>';
  };
  // Elongated tender/strip built from overlapping circles along an axis — the bumpy
  // "caterpillar" silhouette reads as crispy breading, unlike a smooth rounded rect.
  var strip = function(cx, cy, len, r, angle, color){
    var rad = angle * Math.PI / 180;
    var dx = Math.cos(rad), dy = Math.sin(rad);
    var out = '';
    var n = 5;
    for(var i = 0; i < n; i++){
      var t = (i / (n - 1) - 0.5) * len;
      // radius varies per lump so the outline is irregular, not tube-smooth
      var rr = r * (i % 2 === 0 ? 1 : 0.86);
      out += '<circle cx="' + (cx + dx * t).toFixed(1) + '" cy="' + (cy + dy * t).toFixed(1) + '" r="' + rr.toFixed(1) + '" fill="' + color + '"/>';
    }
    out += '<circle cx="' + (cx - dx * len * 0.22).toFixed(1) + '" cy="' + (cy - dy * len * 0.22 - r * 0.45).toFixed(1) + '" r="1.5" fill="rgba(0,0,0,.2)"/>' +
      '<circle cx="' + (cx + dx * len * 0.18).toFixed(1) + '" cy="' + (cy + dy * len * 0.18 + r * 0.35).toFixed(1) + '" r="1.5" fill="rgba(0,0,0,.2)"/>' +
      '<circle cx="' + (cx + dx * len * 0.3).toFixed(1) + '" cy="' + (cy + dy * len * 0.3 - r * 0.3).toFixed(1) + '" r="1.3" fill="rgba(255,255,255,.3)"/>';
    return out;
  };
  var shapes = {
    'fries-s': friesBox(color, fryStick(34, 22) + fryStick(46, 28) + fryStick(58, 20)),
    'fries-m': friesBox(color, fryStick(30, 26, -6) + fryStick(41, 34) + fryStick(52, 30) + fryStick(61, 24, 6)),
    'fries-l': friesBox(color, fryStick(27, 28, -9) + fryStick(36, 38, -4) + fryStick(46, 44) + fryStick(55, 36, 4) + fryStick(63, 27, 9)),
    'rings-4': onionRing(50, 30, 26, color) + onionRing(50, 60, 26, color) + onionRing(50, 90, 26, color) + onionRing(50, 120, 26, color),
    'rings-8':
      onionRing(30, 28, 16, color) + onionRing(70, 28, 16, color) +
      onionRing(30, 62, 16, color) + onionRing(70, 62, 16, color) +
      onionRing(30, 96, 16, color) + onionRing(70, 96, 16, color) +
      onionRing(30, 128, 16, color) + onionRing(70, 128, 16, color),
    'chicken-4':
      strip(30, 40, 52, 10, 80, color) + strip(62, 44, 56, 10, 96, color) +
      strip(36, 106, 54, 10, 84, color) + strip(70, 102, 50, 10, 100, color),
    'chicken-8':
      strip(22, 30, 36, 7, 78, color) + strip(48, 34, 40, 7, 95, color) + strip(76, 28, 36, 7, 84, color) +
      strip(24, 78, 38, 7, 92, color) + strip(52, 82, 36, 7, 80, color) + strip(78, 76, 40, 7, 98, color) +
      strip(34, 122, 38, 7, 86, color) + strip(66, 124, 36, 7, 94, color),
    'platter':
      '<ellipse cx="50" cy="106" rx="46" ry="20" fill="rgba(247,241,230,.16)"/>' +
      '<ellipse cx="50" cy="103" rx="38" ry="15" fill="rgba(247,241,230,.1)"/>' +
      fryStick(30, 30, -8) + fryStick(40, 36, -3) +
      onionRing(66, 74, 15, color) +
      strip(32, 98, 34, 7, 12, color) + strip(56, 106, 32, 7, -8, color) +
      '<rect x="66" y="92" width="24" height="8" rx="4" fill="#B34328" transform="rotate(-12 78 96)"/>',
    can:
      '<rect x="20" y="15" width="60" height="110" rx="10" fill="' + color + '"/>' +
      '<ellipse cx="50" cy="15" rx="30" ry="8" fill="' + color + '" stroke="rgba(0,0,0,.15)"/>' +
      '<ellipse cx="50" cy="15" rx="20" ry="4.5" fill="rgba(255,255,255,.3)"/>' +
      '<ellipse cx="50" cy="125" rx="30" ry="8" fill="rgba(0,0,0,.18)"/>' +
      '<rect x="30" y="35" width="8" height="70" rx="4" fill="rgba(255,255,255,.18)"/>',
    bottle:
      '<rect x="38" y="0" width="24" height="24" rx="4" fill="' + color + '"/>' +
      '<path d="M38 24 L30 46 L30 130 Q30 138 38 138 L62 138 Q70 138 70 130 L70 46 L62 24 Z" fill="' + color + '"/>' +
      '<ellipse cx="50" cy="46" rx="20" ry="6" fill="rgba(255,255,255,.2)"/>' +
      '<rect x="36" y="60" width="6" height="60" rx="3" fill="rgba(255,255,255,.18)"/>',
    cup:
      '<path d="M25 22 L75 22 L66 132 L34 132 Z" fill="' + color + '" stroke="rgba(0,0,0,.12)"/>' +
      '<ellipse cx="50" cy="22" rx="25" ry="6" fill="rgba(255,255,255,.35)"/>' +
      '<rect x="40" y="45" width="5" height="70" rx="2.5" fill="rgba(0,0,0,.06)"/>'
  };
  return '<svg viewBox="0 0 100 140" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">' +
    (shapes[shape] || shapes.can) + '</svg>';
}

(function renderMenu(){
  var grid = document.getElementById('menu-grid');
  if(!grid) return;

  fetch('data/menu.json')
    .then(function(res){ return res.json(); })
    .then(function(data){
      grid.innerHTML = '';

      // Kategori atlama çipleri: 34 ürünlük tek grid'de içeceklere ulaşmak için tüm
      // burgerleri kaydırmak gerekiyordu — çipler doğrudan kategori başlığına götürür.
      var slugify = function(s){
        // Türkçe büyük harfler ÖNCE dönüştürülüyor: 'İ'.toLowerCase() 'i'+U+0307 (combining
        // dot) üretir ve slug'da fazladan tire bırakır ("i-cecekler")
        return s.replace(/İ/g,'i').replace(/I/g,'i').replace(/Ğ/g,'g').replace(/Ü/g,'u')
          .replace(/Ş/g,'s').replace(/Ö/g,'o').replace(/Ç/g,'c')
          .toLowerCase()
          .replace(/ğ/g,'g').replace(/ü/g,'u').replace(/ş/g,'s')
          .replace(/ı/g,'i').replace(/ö/g,'o').replace(/ç/g,'c')
          .replace(/[^a-z0-9]+/g,'-');
      };
      var catNav = document.createElement('nav');
      catNav.className = 'menu-cat-nav';
      catNav.setAttribute('aria-label', 'Mönü kategorileri');
      data.categories.forEach(function(cat){
        var chip = document.createElement('a');
        chip.className = 'menu-cat-chip';
        chip.href = '#cat-' + slugify(cat.name);
        chip.textContent = cat.name;
        catNav.appendChild(chip);
      });
      grid.parentNode.insertBefore(catNav, grid);

      data.categories.forEach(function(cat){
        var heading = document.createElement('h3');
        heading.className = 'menu-category';
        heading.id = 'cat-' + slugify(cat.name);
        heading.textContent = cat.name;
        grid.appendChild(heading);

        cat.items.forEach(function(item){
          var card = document.createElement('article');
          card.className = 'menu-card';
          // exact-name key so the quiz result can scroll straight to its recommended burger
          card.setAttribute('data-item-name', item.name);

          var photo = document.createElement('div');
          photo.className = 'photo';
          if(item.icon){
            photo.classList.add('icon');
            photo.innerHTML = drinkIconSVG(item.icon.shape, item.icon.color);
          } else if(item.photo && item.photo.indexOf('PLACEHOLDER') === -1){
            // gerçek <img> (background-image değil) → tarayıcı lazy-load edebiliyor;
            // 14 fotoğraf ilk açılışta değil, mönüye yaklaşınca iniyor. alt boş çünkü
            // ürün adı hemen altındaki h4'te — tekrar okutmamak için.
            var pimg = document.createElement('img');
            pimg.src = item.photo;
            pimg.alt = '';
            pimg.loading = 'lazy';
            pimg.decoding = 'async';
            photo.appendChild(pimg);
          } else {
            var ph = document.createElement('span');
            ph.className = 'placeholder';
            ph.textContent = 'Fotoğraf bekleniyor';
            photo.appendChild(ph);
          }
          if(item.popular){
            var badge = document.createElement('span');
            badge.className = 'popular-badge';
            badge.textContent = 'Popüler';
            photo.appendChild(badge);
          }
          card.appendChild(photo);

          var info = document.createElement('div');
          info.className = 'info';
          info.innerHTML =
            '<h4>' + item.name + '</h4>' +
            '<p>' + item.description + '</p>' +
            '<span class="price">' + (item.price ? item.price + ' ₺' : 'Fiyat TODO') + '</span>';
          card.appendChild(info);

          grid.appendChild(card);
        });
      });
    })
    .catch(function(err){
      grid.innerHTML = '<p style="font-family:var(--mono);font-size:12px;color:rgba(247,241,230,.5)">Mönü yüklenemedi. Bu dosyayı bir yerel sunucu üzerinden açtığınızdan emin olun (file:// üzerinden fetch çalışmaz).</p>';
      console.error(err);
    });
})();

(function factPopovers(){
  var btns = Array.prototype.slice.call(document.querySelectorAll('.fact-btn'));
  if(!btns.length) return;

  function closeAll(){
    document.querySelectorAll('.fact-pop.show').forEach(function(p){ p.classList.remove('show'); });
    document.querySelectorAll('.fact-btn[aria-expanded="true"]').forEach(function(b){ b.setAttribute('aria-expanded','false'); });
  }

  btns.forEach(function(btn){
    btn.addEventListener('click', function(e){
      e.stopPropagation();
      var pop = document.getElementById(btn.getAttribute('aria-controls'));
      if(!pop) return;
      var wasOpen = pop.classList.contains('show');
      closeAll();
      if(!wasOpen){ pop.classList.add('show'); btn.setAttribute('aria-expanded','true'); }
    });
  });

  document.addEventListener('click', closeAll);
})();

(function hikayeCurtain(){
  var app = document.getElementById('app');
  var win = document.getElementById('hikaye-window');
  var scene = win ? win.querySelector('.reveal-scene') : null;
  if(!app || !win || !scene) return;
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches) return; // CSS statik gösteriyor

  var ticking = false;

  function update(){
    ticking = false;
    // pencere normal akışta kayar; sahne her karede pencerenin viewport konumunu geri
    // alarak ekrana çakılıymış gibi durur. overflow:hidden pencere dışını keser —
    // position:fixed + clip-path'in aksine bu her tarayıcıda aynı davranır.
    var top = win.getBoundingClientRect().top;
    var vh = window.innerHeight;
    if(top > vh + 60 || top < -(vh + 60)) return; // bölümden uzaktayken hiç dokunma
    scene.style.transform = 'translateY(' + (-top).toFixed(2) + 'px)';
  }
  app.addEventListener('scroll', function(){
    if(!ticking){ ticking = true; requestAnimationFrame(update); }
  }, {passive:true});
  window.addEventListener('resize', update);
  update();
})();

(function mobileNav(){
  var toggle = document.getElementById('nav-toggle');
  var topnav = document.querySelector('.topnav');
  if(!toggle || !topnav) return;

  function setOpen(open){
    topnav.classList.toggle('open', open);
    toggle.setAttribute('aria-expanded', String(open));
    toggle.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  }
  toggle.addEventListener('click', function(){
    setOpen(!topnav.classList.contains('open'));
  });
  // bir bölüme gidilince panel kapanır — açık panelin altında gezinmek istemez kimse
  topnav.querySelectorAll('.links a').forEach(function(a){
    a.addEventListener('click', function(){ setOpen(false); });
  });
  document.addEventListener('keydown', function(e){
    if(e.key === 'Escape' && topnav.classList.contains('open')){ setOpen(false); toggle.focus(); }
  });
})();

(function navHighlight(){
  var app = document.getElementById('app');
  var links = Array.prototype.slice.call(document.querySelectorAll('.topnav .links a'));
  if(!links.length || !('IntersectionObserver' in window)) return;

  var sections = links
    .map(function(a){ return document.querySelector(a.getAttribute('href')); })
    .filter(Boolean);

  // root must be #app, not the viewport — #app is the actual scroll container on this page.
  var observer = new IntersectionObserver(function(entries){
    entries.forEach(function(entry){
      if(!entry.isIntersecting) return;
      var link = document.querySelector('.topnav .links a[href="#' + entry.target.id + '"]');
      if(!link) return;
      links.forEach(function(l){ l.classList.remove('active'); });
      link.classList.add('active');
    });
  }, { root: app, threshold: 0.4 });

  sections.forEach(function(s){ observer.observe(s); });
})();

(function mascotFallback(){
  var img = document.querySelector('.mascot img');
  if(!img) return;
  img.addEventListener('error', function(){
    img.closest('.mascot').classList.add('mascot--missing');
  });
})();

(function burgerBuilder(){
  var stack = document.querySelector('.builder-stack');
  var nameOut = document.getElementById('builder-name-out');
  if(!stack || !nameOut) return;

  var checkboxes = Array.prototype.slice.call(document.querySelectorAll('.chip-toggle input[data-layer]'));

  var nameBank = {
    double: ['İkili', 'Zorlu', 'Devasa'],
    cheese: ['Cheddar\'lı', 'Eritmeli'],
    sauce: ['Soslu', 'Islak Islak'],
    fresh: ['Bahçeli', 'Taze']
  };
  function pick(arr){ return arr[Math.floor(Math.random() * arr.length)]; }

  function render(){
    var state = {};
    checkboxes.forEach(function(cb){ state[cb.getAttribute('data-layer')] = cb.checked; });

    stack.querySelectorAll('[data-layer-el]').forEach(function(el){
      var key = el.getAttribute('data-layer-el');
      el.classList.toggle('hidden', !state[key]);
    });

    var parts = [];
    if(state.double) parts.push(pick(nameBank.double));
    if(state.cheese) parts.push(pick(nameBank.cheese));
    if(state.sauce) parts.push(pick(nameBank.sauce));
    if(state.lettuce || state.tomato) parts.push(pick(nameBank.fresh));
    nameOut.textContent = (parts.length ? parts.join(' ') : 'Sade') + ' Kabasakal';
  }

  checkboxes.forEach(function(cb){ cb.addEventListener('change', render); });
  render();
})();

(function burgerQuiz(){
  var quizEl = document.getElementById('quiz');
  if(!quizEl) return;

  var questionsWrap = document.getElementById('quiz-questions');
  var stepLabel = document.getElementById('quiz-step-label');
  var progressFill = document.getElementById('quiz-progress-fill');
  var resultEl = document.getElementById('quiz-result');
  var retryBtn = document.getElementById('quiz-retry');

  var questions = [
    { q: 'Bugün nasıl bir modundasın?', options: [
      { label: 'Klasik ve güvenilir', tags: ['klasik'] },
      { label: 'Gurme bir deneyim', tags: ['gurme'] },
      { label: 'Acı ve heyecan verici', tags: ['aci', 'tatli-aci'] },
      { label: 'Doyurucu, büyük bir şey', tags: ['buyuk'] }
    ]},
    { q: 'Et mi, tavuk mu?', options: [
      { label: 'Kırmızı et', tags: [] },
      { label: 'Tavuk', tags: ['tavuk'] },
      { label: 'Fark etmez', tags: [] }
    ]},
    { q: 'Peynir olmazsa olmaz mı?', options: [
      { label: 'Evet, bol peynirli olsun', tags: ['peynir'] },
      { label: 'Olmasa da olur', tags: [] }
    ]},
    { q: 'Sos tercihin?', options: [
      { label: 'Klasik burger sosu', tags: ['klasik'] },
      { label: 'Tatlı-acı (sweet chili)', tags: ['tatli-aci'] },
      { label: 'Trüflü / gurme soslar', tags: ['gurme'] },
      { label: 'Barbekü', tags: ['barbeku'] }
    ]},
    { q: 'Ekstra bir şey ister misin? (bacon, hellim, mantar...)', options: [
      { label: 'Evet, şaşırt beni', tags: ['farkli', 'bacon'] },
      { label: 'Hayır, sade kalsın', tags: ['klasik'] }
    ]}
  ];

  var currentIndex = 0;
  var collectedTags = [];

  var burgersPromise = fetch('data/menu.json')
    .then(function(res){ return res.json(); })
    .then(function(data){
      var cat = data.categories.find(function(c){ return c.name === 'Burgerler'; });
      return cat ? cat.items : [];
    });

  function renderQuestion(){
    var q = questions[currentIndex];
    progressFill.style.width = (currentIndex / questions.length * 100) + '%';
    stepLabel.textContent = 'Soru ' + (currentIndex + 1) + ' / ' + questions.length;

    questionsWrap.innerHTML = '';
    var h = document.createElement('h3');
    h.className = 'quiz-question';
    h.textContent = q.q;
    questionsWrap.appendChild(h);

    var optsWrap = document.createElement('div');
    optsWrap.className = 'quiz-options';
    q.options.forEach(function(opt){
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'quiz-option';
      btn.textContent = opt.label;
      btn.addEventListener('click', function(){
        collectedTags = collectedTags.concat(opt.tags);
        currentIndex++;
        if(currentIndex >= questions.length){ showResult(); } else { renderQuestion(); }
      });
      optsWrap.appendChild(btn);
    });
    questionsWrap.appendChild(optsWrap);
  }

  function showResult(){
    progressFill.style.width = '100%';
    stepLabel.textContent = '';
    questionsWrap.hidden = true;
    resultEl.hidden = false;

    burgersPromise.then(function(burgers){
      if(!burgers.length) return;
      var scored = burgers.map(function(item){
        var tags = item.tags || [];
        var score = tags.filter(function(t){ return collectedTags.indexOf(t) !== -1; }).length;
        return { item: item, score: score };
      });
      scored.sort(function(a, b){
        if(b.score !== a.score) return b.score - a.score;
        return (b.item.popular ? 1 : 0) - (a.item.popular ? 1 : 0);
      });
      var winner = scored[0].item;
      document.getElementById('quiz-result-name').textContent = winner.name;
      document.getElementById('quiz-result-desc').textContent = winner.description;
      document.getElementById('quiz-result-price').textContent = winner.price ? winner.price + ' ₺' : '';
      var gotoBtn = document.getElementById('quiz-goto-menu');
      if(gotoBtn) gotoBtn.setAttribute('data-target-item', winner.name);
      // move focus to the result so keyboard/screen-reader users land on their answer,
      // not on a silently-swapped DOM
      var nameEl = document.getElementById('quiz-result-name');
      nameEl.setAttribute('tabindex', '-1');
      nameEl.focus();
    });
  }

  // "Mönüde Gör" scrolls to the exact recommended card and spotlights it — without this the
  // visitor lands at the top of a 34-item grid and has to re-find their own recommendation.
  var gotoMenuBtn = document.getElementById('quiz-goto-menu');
  if(gotoMenuBtn){
    gotoMenuBtn.addEventListener('click', function(e){
      var name = this.getAttribute('data-target-item');
      if(!name) return; // no data yet → default #menu anchor behavior
      var card = document.querySelector('.menu-card[data-item-name="' + name.replace(/"/g, '\\"') + '"]');
      if(!card) return;
      e.preventDefault();
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      document.querySelectorAll('.menu-card.spotlight').forEach(function(c){ c.classList.remove('spotlight'); });
      card.classList.add('spotlight');
      setTimeout(function(){ card.classList.remove('spotlight'); }, 4000);
    });
  }

  retryBtn.addEventListener('click', function(){
    currentIndex = 0;
    collectedTags = [];
    resultEl.hidden = true;
    questionsWrap.hidden = false;
    renderQuestion();
    var firstOpt = questionsWrap.querySelector('.quiz-option');
    if(firstOpt) firstOpt.focus();
  });

  renderQuestion();
})();

(function reservationForm(){
  var form = document.getElementById('reservation-form');
  if(!form) return;

  var dateInput = document.getElementById('res-date');
  var timeGrid = document.getElementById('res-time-grid');
  var submitBtn = document.getElementById('res-submit');
  var statusEl = document.getElementById('res-status');
  var honeypot = document.getElementById('res-honeypot');
  var selectedTime = null;

  // Today's date as the floor for the picker — no reservation requests for a date that's already passed.
  var today = new Date();
  dateInput.min = today.getFullYear() + '-' + String(today.getMonth()+1).padStart(2,'0') + '-' + String(today.getDate()).padStart(2,'0');

  // Placeholder 12:00–22:00 / 30-min window — see .reservation-note; swap once real hours are confirmed.
  // role="radio" promises radio KEYBOARD behavior too: one tab stop for the whole group (roving
  // tabindex) and arrow keys to move+select — without it screen-reader users hear "radio button"
  // but get 20 disconnected tab stops and dead arrow keys.
  (function buildTimeSlots(){
    function selectSlot(btn){
      Array.prototype.forEach.call(timeGrid.children, function(b){
        b.setAttribute('aria-checked', 'false');
        b.tabIndex = -1;
      });
      btn.setAttribute('aria-checked', 'true');
      btn.tabIndex = 0;
      selectedTime = btn.textContent;
    }
    for(var h=12; h<=21; h++){
      [':00', ':30'].forEach(function(min){
        var label = String(h).padStart(2,'0') + min;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'time-slot';
        btn.textContent = label;
        btn.setAttribute('role', 'radio');
        btn.setAttribute('aria-checked', 'false');
        btn.tabIndex = -1;
        btn.addEventListener('click', function(){ selectSlot(this); });
        timeGrid.appendChild(btn);
      });
    }
    timeGrid.firstChild.tabIndex = 0;
    timeGrid.addEventListener('keydown', function(e){
      var slots = Array.prototype.slice.call(timeGrid.children);
      var idx = slots.indexOf(document.activeElement);
      if(idx === -1) return;
      var next;
      if(e.key === 'ArrowRight' || e.key === 'ArrowDown'){ next = (idx + 1) % slots.length; }
      else if(e.key === 'ArrowLeft' || e.key === 'ArrowUp'){ next = (idx - 1 + slots.length) % slots.length; }
      else return;
      e.preventDefault();
      selectSlot(slots[next]);
      slots[next].focus();
    });
  })();

  var configured = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
    window.SUPABASE_URL.indexOf('TODO') !== 0 && window.SUPABASE_ANON_KEY.indexOf('TODO') !== 0;

  if(!configured){
    submitBtn.disabled = true;
    statusEl.textContent = 'Bu form henüz aktif değil — Supabase bağlantısı bekleniyor.';
    return;
  }

  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  form.addEventListener('submit', function(e){
    e.preventDefault();

    if(honeypot.value){
      statusEl.className = 'feedback-status ok';
      statusEl.textContent = 'Teşekkürler! Rezervasyon isteğin alındı.';
      form.reset();
      return;
    }

    if(!dateInput.value){
      statusEl.className = 'feedback-status error';
      statusEl.textContent = 'Lütfen bir tarih seç.';
      return;
    }
    if(!selectedTime){
      statusEl.className = 'feedback-status error';
      statusEl.textContent = 'Lütfen bir saat seç.';
      return;
    }
    var name = document.getElementById('res-name').value.trim();
    var phone = document.getElementById('res-phone').value.trim();
    if(!name || !phone){
      statusEl.className = 'feedback-status error';
      statusEl.textContent = 'Ad soyad ve telefon gerekli.';
      return;
    }

    submitBtn.disabled = true;
    statusEl.className = 'feedback-status';
    statusEl.textContent = 'Gönderiliyor…';

    client.from('reservations').insert({
      name: name,
      phone: phone,
      party_size: document.getElementById('res-party').value,
      res_date: dateInput.value,
      res_time: selectedTime,
      note: document.getElementById('res-note').value || null,
      honeypot: honeypot.value || null
    }).then(function(result){
      submitBtn.disabled = false;
      if(result.error){
        statusEl.className = 'feedback-status error';
        statusEl.textContent = 'Gönderilemedi, tekrar dener misin?';
        console.error(result.error);
        return;
      }
      statusEl.className = 'feedback-status ok';
      statusEl.textContent = 'Teşekkürler! Rezervasyon isteğin alındı, onay için seninle iletişime geçilecek.';
      form.reset();
      Array.prototype.forEach.call(timeGrid.children, function(b){ b.setAttribute('aria-checked', 'false'); b.tabIndex = -1; });
      timeGrid.firstChild.tabIndex = 0;
      selectedTime = null;
    });
  });
})();

(function feedbackForm(){
  var form = document.getElementById('feedback-form');
  if(!form) return;

  var burgerSelect = document.getElementById('feedback-burger');
  var submitBtn = document.getElementById('feedback-submit');
  var statusEl = document.getElementById('feedback-status');
  var honeypot = document.getElementById('feedback-honeypot');

  fetch('data/menu.json')
    .then(function(res){ return res.json(); })
    .then(function(data){
      var cat = data.categories.find(function(c){ return c.name === 'Burgerler'; });
      (cat ? cat.items : []).forEach(function(item){
        var opt = document.createElement('option');
        opt.value = item.name;
        opt.textContent = item.name;
        burgerSelect.appendChild(opt);
      });
    });

  var configured = window.SUPABASE_URL && window.SUPABASE_ANON_KEY &&
    window.SUPABASE_URL.indexOf('TODO') !== 0 && window.SUPABASE_ANON_KEY.indexOf('TODO') !== 0;

  if(!configured){
    submitBtn.disabled = true;
    statusEl.textContent = 'Bu form henüz aktif değil — Supabase bağlantısı bekleniyor.';
    return;
  }

  var client = window.supabase.createClient(window.SUPABASE_URL, window.SUPABASE_ANON_KEY);

  form.addEventListener('submit', function(e){
    e.preventDefault();

    if(honeypot.value){
      // Muhtemelen bot: hiçbir şey kaydetmeden başarılı gibi davran, botu bilgilendirme.
      statusEl.className = 'feedback-status ok';
      statusEl.textContent = 'Teşekkürler!';
      form.reset();
      return;
    }

    var ratingInput = form.querySelector('input[name="rating"]:checked');
    if(!ratingInput){
      statusEl.className = 'feedback-status error';
      statusEl.textContent = 'Lütfen bir puan seç.';
      return;
    }

    submitBtn.disabled = true;
    statusEl.className = 'feedback-status';
    statusEl.textContent = 'Gönderiliyor…';

    client.from('feedback').insert({
      rating: parseInt(ratingInput.value, 10),
      burger_name: burgerSelect.value || null,
      comment: document.getElementById('feedback-comment').value || null,
      honeypot: honeypot.value || null
    }).then(function(result){
      submitBtn.disabled = false;
      if(result.error){
        statusEl.className = 'feedback-status error';
        statusEl.textContent = 'Gönderilemedi, tekrar dener misin?';
        console.error(result.error);
        return;
      }
      statusEl.className = 'feedback-status ok';
      statusEl.textContent = 'Teşekkürler, geri bildirimin bize ulaştı!';
      form.reset();
    });
  });
})();
