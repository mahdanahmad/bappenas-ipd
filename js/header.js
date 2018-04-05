function changeCategory(val) {
	category		= val;
	activeFilter	= null;
	kementerian		= null;
	shit			= null;

	if (centered) { zoomProv(null); }

	$( '#selection' ).slideUp(() => {
		// $( '#categories-hamburger' ).removeClass('hidden');
		$( '#categories-head > i.fa-times' ).addClass('hidden');
		$( '#categories-head > i.fa-home' ).removeClass('hidden');
	});

	$( '#categories-head > span#categories-title' ).html(val);
	$( '#categories-hamburger' ).removeClass('x-sign');

	getFilters(val, {}, (data) => { createCategoriesBar(data.data); $( '#categories-head > span#categories-anggaran' ).text(nFormatter(data.total)); createShittyPie(data.data)});
	getMaps(val, {}, (data) => { colorMap(data); })

	getLocation(val, {}, (data) => {
		$( '#dropdown-provinsi > ul' ).html( constructDropdown(data, 'provinsi') );
	});
	getKementerian(val, {}, (data) => {
		$( '#dropdown-kementerian > ul' ).html( constructDropdown(data, 'kementerian') );
	});

}

function changeDrop(state, id, name) {
	$( '#dropdown-' + state ).jqDropdown('hide');
	$( '#filters-' + state + ' .filters-value').html(name);

	if (state == 'provinsi') { zoomProv(id, true); }
	if (state == 'kabupaten') { zoomKabs(id, true); }
	if (state == 'kementerian') {
		kementerian	= id;
		getFilters(category, _.omitBy({ kementerian: id, provinsi: centered }, _.isNil), (data) => {
			let height	= $(cate_dest).outerHeight(true);
			let y		= d3.scaleLinear().rangeRound([height / 2, 0]).domain([0, _.chain(data.data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data.data, height, y));
			createShittyPie(data.data);
			$( '#categories-head > span#categories-anggaran' ).text(nFormatter(data.total));
		});

		let params	= _.omitBy({ kementerian: id }, _.isNil);
		if (activeFilter) { params.filters = JSON.stringify(activeFilter); }
		getMaps(category, params, (data) => { colorMap(data); });

		zoomProv(null);
	}

}

function toggleKabDrop(prov_id) {
	if (prov_id && !_.chain(mapAddition).map('kode').includes(prov_id).value() || _.isNil(prov_id)) {
		getLocation(category, { provinsi: prov_id }, (data) => { $( '#dropdown-kabupaten > ul' ).html( constructDropdown(data, 'kabupaten', prov_id) ); });
		$( '#filters-kabupaten .filters-value').html($( '#drop-kabupaten-default' ).text());

		d3.select('#filters-kabupaten').classed('hidden', !prov_id);
		d3.select('#filters-provinsi').classed('hidden', prov_id);
	}
}

function constructDropdown(data, state, prov_id) {
	return $( '#drop-' + state + '-default' )[0].outerHTML + data.map((o) => ("<li id='drop-" + state + "-" + o.id + "' class='uppercase cursor-pointer' onclick='changeDrop(\"" + state + "\",\"" + o.id + "\",\"" + o.name + "\")'>" + o.name + "</li>")).join('');
}
