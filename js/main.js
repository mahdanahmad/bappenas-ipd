let category	= '';

$( document ).ready(() => {
	$.get('/api/categories', (data) => { $( '#categories-wrapper' ).html( data.result.map((o) => ("<div class='ipd-categories float-left uppercase cursor-pointer' onclick='changeCategory(\"" + o + "\")'>" + o + "</div>")).join('') ); });

	$.get('/api/location', (data) => { $( '#dropdown-location > ul' ).append( data.result.map((o) => ("<li class='uppercase cursor-pointer' onclick='changeDrop(\"location\",\"" + o.id + "\",\"" + o.name + "\")'>" + o.name + "</li>")).join('') ); });
	$.get('/api/kementerian', (data) => { $( '#dropdown-kementerian > ul' ).append( data.result.map((o) => ("<li class='uppercase cursor-pointer' onclick='changeDrop(\"kementerian\",\"" + o.id + "\",\"" + o.name + "\")'>" + o.name + "</li>")).join('') ); });

	changeCategory('Nawacita');

	$( '#categories-hamburger' ).click(function() {
		if ($( this ).hasClass('x-sign')) {
			$( '#selection' ).slideUp();
		} else {
			$( '#selection' ).slideDown();
		}
		$( this ).toggleClass('x-sign');
	});
});

function changeCategory(val) {
	category	= val;
	$( '#selection' ).slideUp(() => {
		$( '#categories-hamburger' ).removeClass('hidden');
	});

	$( '#categories-head > span' ).html(val);
	$( '#categories-hamburger' ).removeClass('x-sign');

	$.get('/api/filters/' + val, (data) => {
		createCategoriesBar(data.result);
	});
}

function changeDrop(state, id, name) {
	$( '#dropdown-' + state ).jqDropdown('hide');
	$( '#filters-' + state + ' .filters-value').html(name);

}
