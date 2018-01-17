function zoomProv(prov_id, isMoronic) {
	if (prov_id) { prov_id = "" + prov_id; }
	let provName	= $( '#drop-prov-' + (prov_id || 'default') ).text()

	let svg			= d3.select("svg#" + map_id + " > g");
	let isNotProv	= _.chain(mapAddition).map('kode').includes(prov_id).value();

	let addition_kode	= _.map(mapAddition, 'kode');
	if (path && svg.node() && ($( '#prov-' + (_.includes(addition_kode, prov_id) ? 'wrapper-' : '') + prov_id ).hasClass('cursor-pointer') || _.isNil(prov_id))) {
		let x, y, k;
		let node		= svg.node().getBBox();
		let duration	= 750;

		$( '#categories-head > span#categories-location' ).text(provName);
		$( '#detil-content > #detil-header > #search-wrapper > input' ).val('');
		// Compute centroid of the selected path
		if ((mappedGeoProv[prov_id] || isNotProv) && (centered !== prov_id || isMoronic)) {
			$('#detil-wrapper > table > tbody').html(' ');

			page	= 0;
			let centroid;
			if (!isNotProv) {
				centroid = path.centroid(mappedGeoProv[prov_id]);
				k = 2;
			} else {
				centroid = $( '#prov-wrapper-' + prov_id ).attr('transform').replace('translate(', '').replace(')', '').split(',').map((o, i) => (parseFloat(o) - ((i * -1) * node.height / 32)));
				k = 1.25;
			}

			x = centroid[0];
			y = centroid[1];

			if (centered) { duration = 500; }

			centered = prov_id;
			d3.select('.province#prov-' + prov_id).classed('unintended', false);
			d3.selectAll('.province:not(#prov-' + prov_id + ')').classed('unintended', true);

			let detilParams	= _.omitBy({ kementerian }, _.isNil);
			if (activeFilter) { detilParams.filters = JSON.stringify(activeFilter); }

			getDetil(category, prov_id, detilParams, (data) => {
				$( '#prov-name' ).text(provName)
				_.forEach(data, (o, key) => { $( '#prov-' + key + ' > span' ).text(o); });

				d3.select('#prov-overview').classed('hidden', false);
			});

			appendAdditionTable();
		} else {
			x = node.width / 2;
			y = node.height / 2;
			k = 1;

			centered = null;
			d3.selectAll('.province').classed('unintended', false);
			d3.select('#prov-overview').classed('hidden', true);
		}

		getFilters(category, centered, _.omitBy({ kementerian }, _.isNil), (data) => {
			let height	= $(cate_dest).outerHeight(true);
			let y		= d3.scaleLinear().rangeRound([height / 2, 0]).domain([0, _.chain(data.data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data.data, height, y));
			$( '#categories-head > span#categories-anggaran' ).text(nFormatter(data.total));
		});

		d3.select('div#content-wrapper').classed('shrink', centered);

		svg.transition()
			.duration(duration)
			.attr('transform', 'translate(' + node.width / 2 + ',' + node.height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')' + (centered ? ('translate(-' + (node.width * (isNotProv ? .25 : .15)) + ',' + (node.height * (isNotProv ? .1 : .05)) + ')') : '' ));

		$( '#filters-location .filters-value').html($( '#drop-prov-' + (centered ? prov_id : 'default') ).text());
	}
}

function constructAdditionTable(data) {
	return (data || []).map((o) => (
		'<tr id="' + o._id + '" onclick="toggleOutput(\'' + o._id + '\')" class="cursor-pointer">' +
			['kegiatan', 'output', 'kl', 'anggaran'].map((key) => ('<td class="table-' + key + '">' + (key == 'anggaran' ? nFormatter(o[key]) : o[key]) + '</td>')).join() +
		'</tr>'
	)).join('');
}

function appendAdditionTable() {
	let params	= _.omitBy({ page, kementerian }, _.isNil);
	if (activeFilter) { params.filters = JSON.stringify(activeFilter); }
	let search	= $( '#detil-content > #detil-header > #search-wrapper > input' ).val();
	if (search !== '') { params.like = search; }

	getOutput(category, centered, params, (data) => {
		page	= data.iteratee;
		$('#detil-wrapper > table > tbody').append(constructAdditionTable(data.data));
	});
}

function colorMap(data) {
	let addition_kode	= _.map(mapAddition, 'kode');
	$( '#addition-wrapper .addition, .province' ).removeClass('cursor-pointer cursor-not-allowed');
	data.forEach((o) => {
		d3.select('#prov-' + o._id).style('fill', o.color);
		$( '#prov-' + (_.includes(addition_kode, o._id) ? 'wrapper-' : '') + o._id ).addClass(o.color == defaultColor ? 'cursor-not-allowed' : 'cursor-pointer');
	});
}

function toggleOutput(id) {
	if ($( '#' + id ).hasClass('selected') || _.isNil(id)) {
		backState	= 'peta';

		$( '#detil-wrapper' ).addClass('forced-height');
		$( '#detil-wrapper > table > tbody tr' ).removeClass('hidden selected');

	} else {
		backState	= 'daftar';

		$( '#' + id ).addClass('selected');
		$( '#detil-wrapper' ).removeClass('forced-height');
		$( '#detil-wrapper > table > tbody tr:not(#' + id + ')' ).addClass('hidden');
	}

	$( '#backtomap > span' ).text(backState);
}
