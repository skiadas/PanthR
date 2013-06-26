$(function () {
	// Empower popovers
	$('[data-toggle="popover"]').popover();
	// Collapsable sections should toggle sign
	$('[data-toggle="collapse"]').on('click', function() {
		$(this).toggleClass('icon-minus icon-plus');
	})
});