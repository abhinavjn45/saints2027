jQuery(function () {
  var timeline = jQuery('.important-dates-carousel');

  if (!timeline.length || !jQuery.fn.owlCarousel) {
    return;
  }

  timeline.owlCarousel({
    center: false,
    items: 3,
    loop: true,
    margin: 24,
    dots: false,
    nav: false,
    autoplay: true,
    autoplayTimeout: 2400,
    autoplayHoverPause: false,
    smartSpeed: 900,
    responsive: {
      0: {
        items: 1,
      },
      768: {
        items: 2,
      },
      1200: {
        items: 3,
      },
    },
  });
});