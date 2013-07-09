define(function() {
    $(function () {
        // Collapsable sections should toggle sign
        $(document).on('click', '[data-toggle="collapse"]', function(ev) {
            $(this).toggleClass('icon-minus icon-plus');
            ev.preventDefault();
        });
    
    });
}
);