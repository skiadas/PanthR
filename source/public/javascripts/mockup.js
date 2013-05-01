$(document).ready(function() {
    $('nav').hover(function() {
        // mouseenter
        $(this).removeClass('inactive');
    }, function() {  
        // mouseout
        $(this).addClass('inactive');
    });
});