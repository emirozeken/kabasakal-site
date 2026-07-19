(function scrollZoom(){
  var app = document.getElementById('app');
  var scrollzoom = document.getElementById('scrollzoom');
  var stack = document.getElementById('stack');
  var captions = Array.prototype.slice.call(document.querySelectorAll('.caption'));
  var outro = document.getElementById('outro');
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
    if(outro) outro.classList.toggle('show', stageFloat > 4.55);
    if(scrollhintEl) scrollhintEl.style.opacity = app.scrollTop > 20 ? 0 : 1;
    for(var i=0;i<dotEls.length;i++){ dotEls[i].classList.toggle('active', i===Math.round(stageFloat)); }
  }

  function onScroll(){ if(!ticking){ requestAnimationFrame(update); ticking = true; } }

  app.addEventListener('scroll', onScroll, {passive:true});
  window.addEventListener('resize', onScroll);
  update();
})();

function drinkIconSVG(shape, color){
  var shapes = {
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
      data.categories.forEach(function(cat){
        var heading = document.createElement('h3');
        heading.className = 'menu-category';
        heading.textContent = cat.name;
        grid.appendChild(heading);

        cat.items.forEach(function(item){
          var card = document.createElement('article');
          card.className = 'menu-card';

          var photo = document.createElement('div');
          photo.className = 'photo';
          if(item.icon){
            photo.classList.add('icon');
            photo.innerHTML = drinkIconSVG(item.icon.shape, item.icon.color);
          } else if(item.photo && item.photo.indexOf('PLACEHOLDER') === -1){
            photo.style.backgroundImage = "url('" + item.photo + "')";
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

(function menuTilt(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  if(reduced || !finePointer) return;

  var grid = document.getElementById('menu-grid');
  if(!grid) return;
  var current = null;

  function reset(card){ card.style.transform = ''; }

  grid.addEventListener('mousemove', function(e){
    var card = e.target.closest('.menu-card');
    if(!card){
      if(current){ reset(current); current = null; }
      return;
    }
    if(current && current !== card) reset(current);
    current = card;
    var r = card.getBoundingClientRect();
    var px = (e.clientX - r.left) / r.width;
    var py = (e.clientY - r.top) / r.height;
    var rotY = (px - 0.5) * 14;
    var rotX = (0.5 - py) * 14;
    card.style.transform = 'perspective(700px) rotateX(' + rotX + 'deg) rotateY(' + rotY + 'deg) scale(1.03)';
  });
  grid.addEventListener('mouseleave', function(){
    if(current){ reset(current); current = null; }
  });
})();

(function magneticButtons(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  if(reduced || !finePointer) return;

  document.querySelectorAll('.cta:not([disabled])').forEach(function(btn){
    btn.addEventListener('mousemove', function(e){
      var r = btn.getBoundingClientRect();
      var relX = e.clientX - (r.left + r.width / 2);
      var relY = e.clientY - (r.top + r.height / 2);
      var pull = 0.25, max = 10;
      var tx = Math.max(-max, Math.min(max, relX * pull));
      var ty = Math.max(-max, Math.min(max, relY * pull));
      btn.style.transform = 'translate(' + tx + 'px,' + (ty - 2) + 'px)';
    });
    btn.addEventListener('mouseleave', function(){
      btn.style.transform = '';
    });
  });
})();

(function customCursor(){
  var reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var finePointer = window.matchMedia('(pointer: fine)').matches;
  if(reduced || !finePointer) return;

  var dot = document.createElement('div'); dot.className = 'cursor-dot';
  var ring = document.createElement('div'); ring.className = 'cursor-ring';
  document.body.appendChild(dot);
  document.body.appendChild(ring);
  document.body.classList.add('has-custom-cursor');

  var mouseX = 0, mouseY = 0, ringX = 0, ringY = 0;
  document.addEventListener('mousemove', function(e){
    mouseX = e.clientX; mouseY = e.clientY;
    dot.style.transform = 'translate(' + mouseX + 'px,' + mouseY + 'px) translate(-50%,-50%)';
  });

  function loop(){
    ringX += (mouseX - ringX) * 0.18;
    ringY += (mouseY - ringY) * 0.18;
    ring.style.transform = 'translate(' + ringX + 'px,' + ringY + 'px) translate(-50%,-50%)';
    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);

  var hoverSelector = 'a, button:not([disabled]), .menu-card, label.chip-toggle';
  document.addEventListener('mouseover', function(e){
    if(e.target.closest(hoverSelector)) ring.classList.add('hover');
  });
  document.addEventListener('mouseout', function(e){
    if(e.target.closest(hoverSelector)) ring.classList.remove('hover');
  });
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
    });
  }

  retryBtn.addEventListener('click', function(){
    currentIndex = 0;
    collectedTags = [];
    resultEl.hidden = true;
    questionsWrap.hidden = false;
    renderQuestion();
  });

  renderQuestion();
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
