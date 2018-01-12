let category	= '';

$( document ).ready(() => {
	$.get('/api/categories', (data) => { $( '#categories-wrapper' ).html( data.result.map((o) => ("<div class='ipd-categories float-left uppercase cursor-pointer' onclick='changeCategory(\"" + o + "\")'>" + o + "</div>")).join('') ); });

	createMaps();

	changeCategory('Nawacita');

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

	$('#detil-wrapper > table > tbody').endlessScroll({
		fireOnce: false,
		fireDelay: false,
		loader: '<div id="loader"><li><i class="fa-li fa fa-spinner fa-spin"></i>as bullets</li><div>',
		callback: (p) => {
			appendAdditionTable();
		}
	});

	$( '#backtomap' ).click(() => { zoomProv(null); });
});

function changeCategory(val) {
	category		= val;
	activeFilter	= null;
	kementerian		= null;

	$( '#selection' ).slideUp(() => {
		$( '#categories-hamburger' ).removeClass('hidden');
	});

	$( '#categories-head > span' ).html(val);
	$( '#categories-hamburger' ).removeClass('x-sign');

	$.get('/api/filters/' + val, (data) => { createCategoriesBar(data.result); });
	$.get('/api/maps/' + val, (data) => { colorMap(data.result); });

	$.get('/api/location/' + val, (data) => {
		$( '#dropdown-location > ul' ).html( constructDropdown(data, 'prov') );
	});
	$.get('/api/kementerian/' + val, (data) => {
		$( '#dropdown-kementerian > ul' ).html( constructDropdown(data, 'kl') );
	});

}

function changeDrop(state, id, name) {
	$( '#dropdown-' + state ).jqDropdown('hide');
	$( '#filters-' + state + ' .filters-value').html(name);

	if (state == 'location') { zoomProv(id, true); }
	if (state == 'kementerian') {
		kementerian	= id;

		$.get('/api/filters/' + category + (centered ? ('/' + centered) : ''), _.omitBy({ kementerian: id }, _.isNil), (data) => {
			let height	= $(cate_dest).outerHeight(true);
			let y		= d3.scaleLinear().rangeRound([height / 2, 0]).domain([0, _.chain(data.result).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data.result, height, y));
		});

		let params	= _.omitBy({ kementerian: id }, _.isNil);
		if (activeFilter) { params.filters = JSON.stringify(activeFilter); }
		$.get('/api/maps/' + category, params, (data) => { colorMap(data.result); });

		zoomProv(null);
	}

}

function constructDropdown(data, state) {
	return $( '#drop-' + state + '-default' )[0].outerHTML + data.result.map((o) => ("<li id='drop-" + state + "-" + o.id + "' class='uppercase cursor-pointer' onclick='changeDrop(\"" + (state == 'prov' ? 'location' : 'kementerian') + "\",\"" + o.id + "\",\"" + o.name + "\")'>" + o.name + "</li>")).join('');

}
