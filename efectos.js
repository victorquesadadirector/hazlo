// Movimiento de la página: aparecer al bajar, contadores y barra que se oscurece.
(function () {
  var reducir = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var barra = document.querySelector('.barra');

  function alBajar() {
    if (barra) barra.classList.toggle('solida', window.scrollY > 40);
  }
  window.addEventListener('scroll', alBajar, { passive: true });
  alBajar();

  function formatear(n, el) {
    var dec = Number(el.dataset.decimales || 0);
    var txt = dec ? n.toFixed(dec).replace('.', ',') : Math.round(n).toString();
    if (el.dataset.formato === 'miles') txt = txt.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return txt;
  }

  function contar(el) {
    var hasta = parseFloat(el.dataset.hasta);
    if (reducir || isNaN(hasta)) { el.textContent = formatear(hasta, el); return; }
    var inicio = null, dur = 1400;
    function paso(t) {
      if (!inicio) inicio = t;
      var p = Math.min((t - inicio) / dur, 1);
      el.textContent = formatear(hasta * (1 - Math.pow(1 - p, 3)), el);
      if (p < 1) requestAnimationFrame(paso);
    }
    requestAnimationFrame(paso);
  }

  if (!('IntersectionObserver' in window) || reducir) {
    document.querySelectorAll('.revelar').forEach(function (e) { e.classList.add('visto'); });
    document.querySelectorAll('.contar').forEach(function (e) { e.textContent = formatear(parseFloat(e.dataset.hasta), e); });
    return;
  }

  document.documentElement.classList.add('con-efectos');
  var obs = new IntersectionObserver(function (entradas) {
    entradas.forEach(function (en) {
      if (!en.isIntersecting) return;
      en.target.classList.add('visto');
      en.target.querySelectorAll('.contar').forEach(contar);
      obs.unobserve(en.target);
    });
  }, { threshold: 0.15 });
  document.querySelectorAll('.revelar').forEach(function (e) { obs.observe(e); });
})();
