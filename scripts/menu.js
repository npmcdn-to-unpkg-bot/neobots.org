$(document).ready(function() {
  $('#sidebar').removeClass('visible');
  $('#opc').removeClass('visible');
  $('#sidebar-teams').slideUp();
  $("#sidebar-teams").css("display", "none");

  $('#sidebar-btn').click(function(){
    $('#sidebar').toggleClass('visible');
    $('#sidebar-btn span').toggleClass('visible');
    $('#opc1').removeClass('visible');
    $('#filter').removeClass('visible');
    $('#filter-btn span').removeClass('visible');
    $('#opc').toggleClass('visible');
    $('#sidebar-teams').slideUp();
  });

  $('#opc').click(function(){
    $('#sidebar').removeClass('visible');
    $('#opc').removeClass('visible');
    $('#opc1').removeClass('visible');
    $('#filter').removeClass('visible');
    $('#sidebar-btn span').removeClass('visible');
    $('#sidebar-teams').slideUp();
  });
  $('.team').click(function(){
    $('#sidebar-teams').slideToggle();
  });
});
