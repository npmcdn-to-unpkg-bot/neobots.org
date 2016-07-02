$(document).ready(function() {
  $('#sidebar').removeClass('visible');
  $('#opc').removeClass('visible');
  $('#sidebar-teams').slideUp();
  $("#sidebar-teams").css("display", "none");
  $('#sidebar-btn').click(function(){
    $('#sidebar').toggleClass('visible');
    $('#opc').toggleClass('visible');
    $('#sidebar-teams').slideUp();
  });
  $('#opc').click(function(){
    $('#sidebar').removeClass('visible');
    $('#opc').removeClass('visible');
    $('#sidebar-teams').slideUp();
  });
  $('.team').click(function(){
    $('#sidebar-teams').slideToggle();
  });
});
