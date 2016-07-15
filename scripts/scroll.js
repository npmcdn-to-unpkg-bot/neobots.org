$(document).ready(function() {
  $("a.scroll").on('click', function(event) {
    event.preventDefault();
    $('#sidebar').removeClass('visible');
    $('#opc').removeClass('visible');
    var hash = this.hash;
    $('html, body').animate({
        scrollTop: $(hash).offset().top
      }, 500);
  });
  function redirectPage() {
    window.location = linkLocation;
  }
});
