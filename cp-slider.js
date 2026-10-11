(function () {
  document.querySelectorAll('.cp-slider').forEach(function (slider) {
    var track = slider.querySelector('.cp-slider__track');
    var slides = slider.querySelectorAll('.cp-slider__slide');
    if (!track || !slides.length) return;

    var dots = slider.querySelectorAll('.cp-slider__dot');
    var prevBtn = slider.querySelector('.cp-slider__btn--prev');
    var nextBtn = slider.querySelector('.cp-slider__btn--next');
    var thumbsWrap = slider.nextElementSibling && slider.nextElementSibling.classList.contains('cp-slider__thumbs')
      ? slider.nextElementSibling
      : null;
    var thumbs = thumbsWrap ? thumbsWrap.querySelectorAll('.cp-slider__thumb') : [];
    var index = 0;
    var timer = null;

    function goTo(i) {
      index = (i + slides.length) % slides.length;
      track.style.transform = 'translateX(-' + (index * 100) + '%)';
      dots.forEach(function (dot, di) { dot.classList.toggle('is-active', di === index); });
      thumbs.forEach(function (thumb, ti) { thumb.classList.toggle('is-active', ti === index); });
    }

    function start() {
      stop();
      timer = setInterval(function () { goTo(index + 1); }, 4500);
    }
    function stop() {
      if (timer) clearInterval(timer);
    }

    if (prevBtn) prevBtn.addEventListener('click', function () { goTo(index - 1); start(); });
    if (nextBtn) nextBtn.addEventListener('click', function () { goTo(index + 1); start(); });
    dots.forEach(function (dot, di) {
      dot.addEventListener('click', function () { goTo(di); start(); });
    });
    thumbs.forEach(function (thumb, ti) {
      thumb.addEventListener('click', function () { goTo(ti); start(); });
    });
    slider.addEventListener('mouseenter', stop);
    slider.addEventListener('mouseleave', start);
    if (thumbsWrap) {
      thumbsWrap.addEventListener('mouseenter', stop);
      thumbsWrap.addEventListener('mouseleave', start);
    }

    goTo(0);
    start();
  });
})();
