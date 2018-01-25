let typeTimeout;

$( document ).ready(() => {
	getCategories((data) => { $( '#categories-wrapper' ).html( data.map((o) => ("<div class='ipd-categories float-left uppercase cursor-pointer' onclick='changeCategory(\"" + o + "\")'>" + o + "</div>")).join('') ); });

	createMaps();
	// createProgress();

	setTimeout(() => { changeCategory('Nawacita'); }, 1000)

	// $( '#categories-hamburger' ).click(function() {
	// 	if ($( this ).hasClass('x-sign')) {
	// 		$( '#selection' ).slideUp();
	// 	} else {
	// 		$( '#selection' ).slideDown();
	// 	}
	// 	$( this ).toggleClass('x-sign');
	// });

	$( '#categories-head > i' ).click(function() {
		if ($( this ).hasClass('fa-times')) {
			$( '#selection' ).slideUp();
		} else if ($( this ).hasClass('fa-home')) {
			$( '#selection' ).slideDown();
		}
		$( '#categories-head > i' ).toggleClass('hidden');
	});

	// $('#detil-wrapper > table > tbody').endlessScroll({
	// 	inflowPixels: 200,
	// 	fireOnce: false,
	// 	fireDelay: false,
	// 	loader: '<div id="loader"><li><i class="fa-li fa fa-spinner fa-spin"></i>as bullets</li><div>',
	// 	// ceaseFireOnEmpty: false,
	// 	resetCounter: () => (page == 0),
	// 	callback: (p) => {
	// 		appendAdditionTable();
	// 	}
	// });

	$( '#detil-content > #detil-header > #search-wrapper > input' ).keyup(() => {
		clearTimeout(typeTimeout);

		typeTimeout	= setTimeout(() => {
			$('#detil-wrapper > table > tbody').html(' ');
			page	= 0;
			appendAdditionTable();
		}, awaitTime);
	});

	$( '#backtomap' ).click(() => { if (backState == 'peta') { zoomProv(null); } else { toggleOutput(null); } });
});
