$(function() {

  $(".tabs .links a").on("click", function (e) {
    e.preventDefault();
    $(this).addClass("active").siblings().removeClass("active");

    $($(this).attr("href")).show().siblings().hide();
  });

});
