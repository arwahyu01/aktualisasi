(function(){
  var overlay = document.getElementById('lightboxOverlay');
  var imgEl = document.getElementById('lightboxImg');
  var captionEl = document.getElementById('lightboxCaption');
  var counterEl = document.getElementById('lightboxCounter');
  var prevBtn = document.getElementById('lightboxPrev');
  var nextBtn = document.getElementById('lightboxNext');
  var closeBtn = document.getElementById('lightboxClose');

  if (!overlay || !imgEl) return;

  var images = [];
  var currentIndex = -1;

  function collectImages() {
    var slides = document.querySelectorAll('.slide');
    var result = [];
    for (var s = 0; s < slides.length; s++) {
      var imgs = slides[s].querySelectorAll('.photo-item img, .showcase-body img, .ev-body img, .ba-hero-img img');
      for (var i = 0; i < imgs.length; i++) {
        result.push({
          src: imgs[i].getAttribute('src'),
          alt: imgs[i].getAttribute('alt') || ''
        });
      }
    }
    return result;
  }

  function open(index) {
    if (index < 0 || index >= images.length) return;
    currentIndex = index;
    var item = images[currentIndex];
    imgEl.setAttribute('src', item.src);
    imgEl.setAttribute('alt', item.alt);
    if (captionEl) {
      captionEl.textContent = item.alt || '';
    }
    overlay.classList.add('open');
    document.body.style.overflow = 'hidden';
    updateNav();
    updateCounter();
  }

  function close() {
    overlay.classList.remove('open');
    document.body.style.overflow = '';
  }

  function prev() {
    if (currentIndex > 0) open(currentIndex - 1);
  }

  function next() {
    if (currentIndex < images.length - 1) open(currentIndex + 1);
  }

  function updateNav() {
    prevBtn.classList.toggle('hidden', currentIndex <= 0);
    nextBtn.classList.toggle('hidden', currentIndex >= images.length - 1);
  }

  function updateCounter() {
    counterEl.textContent = (currentIndex + 1) + ' / ' + images.length;
  }

  // Delegate click on photo items
  document.addEventListener('click', function(e){
    var img = e.target.closest('.photo-item img, .showcase-body img, .ev-body img, .ba-hero-img img');
    if (!img) return;
    if (img.closest('.lightbox-overlay')) return;
    images = collectImages();
    var src = img.getAttribute('src');
    for (var i = 0; i < images.length; i++) {
      if (images[i].src === src) {
        open(i);
        return;
      }
    }
  });

  // Nav buttons
  if (prevBtn) prevBtn.addEventListener('click', function(e){ e.stopPropagation(); prev(); });
  if (nextBtn) nextBtn.addEventListener('click', function(e){ e.stopPropagation(); next(); });
  if (closeBtn) closeBtn.addEventListener('click', function(e){ e.stopPropagation(); close(); });

  // Close on overlay background click
  overlay.addEventListener('click', function(e){
    if (e.target === overlay) close();
  });

  // Keyboard
  document.addEventListener('keydown', function(e){
    if (!overlay.classList.contains('open')) return;
    switch(e.key) {
      case 'Escape': close(); break;
      case 'ArrowLeft': e.preventDefault(); prev(); break;
      case 'ArrowRight': e.preventDefault(); next(); break;
    }
  });

  // === OPEN LIGHTBOX WITH A CUSTOM GROUP OF IMAGES ===
  // Used when clicking on a tahapan (step) to show its evidence
  window.openLightboxGroup = function(srcArray, stageName) {
    var label = stageName || 'Evidence';
    images = srcArray.map(function(src, i) {
      return {
        src: src,
        alt: label + (srcArray.length > 1 ? ' — ' + (i + 1) : '')
      };
    });
    if (images.length > 0) open(0);
  };

  // Bind click on all step-list items with data-evidence
  document.addEventListener('click', function(e) {
    var li = e.target.closest('.step-list li[data-evidence]');
    if (!li) return;
    var raw = li.getAttribute('data-evidence');
    if (!raw) return;
    var srcArray = raw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    if (srcArray.length === 0) return;
    var stageName = li.getAttribute('data-evidence-label') || '';
    window.openLightboxGroup(srcArray, stageName);
  });

  // Bind click on evidence dashboard cards
  document.addEventListener('click', function(e) {
    var card = e.target.closest('.ev-card[data-evidence]');
    if (!card) return;
    var raw = card.getAttribute('data-evidence');
    if (!raw) return;
    var srcArray = raw.split(',').map(function(s) { return s.trim(); }).filter(Boolean);
    if (srcArray.length === 0) return;
    var label = card.getAttribute('data-evidence-label') || '';
    window.openLightboxGroup(srcArray, label);
  });

})();
