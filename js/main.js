let typeTimeout;

$( document ).ready(() => {
	getCategories((data) => { $( '#categories-wrapper' ).html( data.map((o) => ("<div class='ipd-categories float-left uppercase cursor-pointer' onclick='changeCategory(\"" + o + "\")'>" + o + "</div>")).join('') ); });

	createMaps();

	// changeCategory('Nawacita');

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

	getFilters(val, null, {}, (data) => { createCategoriesBar(data); });
	getMaps(val, {}, (data) => { colorMap(data); })

	getLocation(val, {}, (data) => {
		$( '#dropdown-location > ul' ).html( constructDropdown(data, 'prov') );
	});
	getKementerian(val, {}, (data) => {
		$( '#dropdown-kementerian > ul' ).html( constructDropdown(data, 'kl') );
	});

}

function changeDrop(state, id, name) {
	$( '#dropdown-' + state ).jqDropdown('hide');
	$( '#filters-' + state + ' .filters-value').html(name);

	if (state == 'location') { zoomProv(id, true); }
	if (state == 'kementerian') {
		kementerian	= id;

		getFilters(category, centered, _.omitBy({ kementerian: id }, _.isNil), (data) => {
			let height	= $(cate_dest).outerHeight(true);
			let y		= d3.scaleLinear().rangeRound([height / 2, 0]).domain([0, _.chain(data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data, height, y));
		});

		let params	= _.omitBy({ kementerian: id }, _.isNil);
		if (activeFilter) { params.filters = JSON.stringify(activeFilter); }
		getMaps(category, params, (data) => { colorMap(data); });

		zoomProv(null);
	}

}

function constructDropdown(data, state) {
	return $( '#drop-' + state + '-default' )[0].outerHTML + data.map((o) => ("<li id='drop-" + state + "-" + o.id + "' class='uppercase cursor-pointer' onclick='changeDrop(\"" + (state == 'prov' ? 'location' : 'kementerian') + "\",\"" + o.id + "\",\"" + o.name + "\")'>" + o.name + "</li>")).join('');

}
