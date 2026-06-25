(function(){
  var modal = document.getElementById('pdfModal');
  var iframe = document.getElementById('pdfModalIframe');
  var titleEl = document.getElementById('pdfModalTitle');
  var closeBtn = document.getElementById('pdfModalClose');
  var backdrop = document.getElementById('pdfModalBackdrop');

  if (!modal || !iframe) return;

  function openPdf(url, title) {
    iframe.setAttribute('src', url);
    if (titleEl) titleEl.textContent = title || 'Dokumen';
    modal.classList.add('open');
    document.body.style.overflow = 'hidden';
  }

  function closePdf() {
    modal.classList.remove('open');
    iframe.setAttribute('src', '');
    document.body.style.overflow = '';
  }

  // Expose globally
  window.openPdfModal = openPdf;

  // Close button
  if (closeBtn) closeBtn.addEventListener('click', closePdf);

  // Click backdrop to close
  if (backdrop) backdrop.addEventListener('click', closePdf);

  // Escape key
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape' && modal.classList.contains('open')) {
      closePdf();
    }
  });

  // Convert all .doc-link to open in modal
  document.addEventListener('click', function(e) {
    var link = e.target.closest('.doc-link');
    if (!link) return;
    e.preventDefault();
    var href = link.getAttribute('href');
    var title = link.textContent.trim() || 'Dokumen';
    if (href) openPdf(href, title);
  });

})();
