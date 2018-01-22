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
			d3.select('.province#prov-' + prov_id).classed('unintended', false).classed('hidden', true);
			d3.selectAll('.kabupaten.prov-' + prov_id).classed('hidden', false);
			d3.select('.province.hidden:not(#prov-' + prov_id + ')').classed('unintended', true).classed('hidden', false);

			d3.selectAll('.province:not(#prov-' + prov_id + ')').classed('unintended', true);
			d3.selectAll('.kabupaten:not(.hidden):not(.prov-' + prov_id + ')').classed('hidden', true);

			let detilParams	= _.omitBy({ kementerian, provinsi: prov_id }, _.isNil);
			if (activeFilter) { detilParams.filters = JSON.stringify(activeFilter); }

			getDetil(category, detilParams, (data) => {
				$( '#prov-name' ).text(provName)
				_.forEach(data, (o, key) => { $( '#prov-' + key + ' > span' ).text(o); });

				d3.select('#prov-overview').classed('hidden', false);
			});

			getMaps(category, detilParams, (data) => { colorKabs(data, prov_id); });

			appendAdditionTable();
		} else {
			x = node.width / 2;
			y = node.height / 2;
			k = 1;

			centered = null;
			d3.selectAll('.province').classed('unintended', false);
			d3.selectAll('.province.hidden').classed('hidden', false);
			d3.selectAll('.kabupaten:not(.hidden)').classed('hidden', true);
			d3.select('#prov-overview').classed('hidden', true);
		}

		getFilters(category, _.omitBy({ kementerian, provinsi: centered }, _.isNil), (data) => {
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
		'<tr id="' + o._id + '" onclick="toggleOutput(\'' + o._id + '\', ' + o.anggaran + ')" class="cursor-pointer">' +
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

function colorKabs(data, prov_id) {
	console.log(data);
	$( '.kabupaten.prov-' + prov_id ).removeClass('cursor-pointer cursor-not-allowed');
	data.forEach((o) => {
		d3.select('#kab-' + o._id).style('fill', o.color);
		$( '#kab-' + o._id ).addClass(o.color == defaultColor ? 'cursor-not-allowed' : 'cursor-pointer');
	});
}

function toggleOutput(id, anggaran) {
	if ($( '#' + id ).hasClass('selected') || _.isNil(id)) {
		$( '#search-wrapper' ).show();
		backState	= 'peta';

		$( '#detil-wrapper' ).addClass('forced-height');
		$( '#detil-wrapper > table > tbody tr' ).removeClass('hidden selected');

		d3.select("#progress-wrapper > #svg-wrapper").selectAll("svg").remove();

	} else {
		$( '#search-wrapper' ).hide();
		backState	= 'daftar';

		let komponen	= _.random(5);
		let multiplier	= _.random(.8, 1.1);

		$( '#diff-anggaran > span' ).text(nFormatter(anggaran));
		$( '#diff-realisasi > span' ).text(komponen ? nFormatter(anggaran * multiplier) : '-');
		$( '#diff-selisih > span' ).text(komponen ? (multiplier > 1 ? '-' : '+') + nFormatter(anggaran * Math.abs(1 - multiplier)) : '-');

		_.times(komponen, (o) => { createProgress(o + 1, true); });

		$( '#' + id ).addClass('selected');
		$( '#detil-wrapper' ).removeClass('forced-height');
		$( '#detil-wrapper > table > tbody tr:not(#' + id + ')' ).addClass('hidden');
	}

	$( '#backtomap > span' ).text(backState);
}
