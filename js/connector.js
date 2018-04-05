function zoomProv(prov_id, isMoronic) {
	if (prov_id) { prov_id = "" + prov_id; }
	let provName	= $( '#drop-provinsi-' + (prov_id || 'default') ).text()

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
				let bounds	= path.bounds(mappedGeoProv[prov_id]);

				centroid = path.centroid(mappedGeoProv[prov_id]);
				// k = 2;
				k = node.width * .25 / (bounds[1][0] - bounds[0][0]);
			} else {
				centroid = $( '#prov-wrapper-' + prov_id ).attr('transform').replace('translate(', '').replace(')', '').split(',').map((o, i) => (parseFloat(o) - ((i * -1) * node.height / 32)));
				k = 1.25;
			}

			x = centroid[0];
			y = centroid[1];

			if (centered) { duration = 500; }

			centered = prov_id;
			d3.select('.province#prov-' + prov_id).classed('unintended', false).classed('hidden', !_.chain(mapAddition).map('kode').includes(prov_id).value());
			d3.selectAll('.kabupaten.prov-' + prov_id).classed('hidden', false);
			d3.select('.province.hidden:not(#prov-' + prov_id + ')').classed('unintended', true).classed('hidden', false);

			d3.selectAll('.province:not(#prov-' + prov_id + ')').classed('unintended', true);
			d3.selectAll('.kabupaten:not(.hidden):not(.prov-' + prov_id + ')').classed('hidden', true);

			d3.selectAll('.kabupaten.prov-' + prov_id + '.unintended').classed('unintended', false);

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
			let height	= d3.select(cate_dest + ' > svg > g > .group-bar').node().getBBox().height;
			let y		= d3.scaleLinear().rangeRound([Math.floor(height) / 2, 0]).domain([0, _.chain(data.data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data.data, height, y));
			$( '#categories-head > span#categories-anggaran' ).text(nFormatter(data.total));
		});

		d3.select('div#content-wrapper').classed('shrink', centered);

		toggleKabDrop(prov_id);

		svg.transition()
			.duration(duration)
			.attr('transform', 'translate(' + node.width / 2 + ',' + node.height / 2 + ')scale(' + k + ')translate(' + -x + ',' + -y + ')' + (centered ? ('translate(-' + (isNotProv ? node.width * .25 : (node.width * .3 / k)) + ',' + (isNotProv ? .1 * node.height : (.05 * node.height / k)) + ')') : '' ));

		$( '#filters-provinsi .filters-value').html($( '#drop-provinsi-' + (centered ? prov_id : 'default') ).text());

		setTimeout(() => {
			d3.select( 'g#' + pie_id ).classed('hidden', prov_id);
		}, (prov_id ? 0 : duration));

	}
}

function zoomKabs(kabs_id) {
	if ($( '.kabupaten#kab-' + kabs_id ).hasClass('cursor-pointer') || _.isNil(kabs_id)) {
		$('#detil-wrapper > table > tbody').html(' ');

		let selectedName	= $( '#' + (kabs_id ? ('drop-kabupaten-' + kabs_id) : ('drop-provinsi-' + centered) ) ).text();

		page	= 0;
		if (kabs_id) {
			d3.selectAll('.kabupaten.prov-' + centered + ':not(#kab-' + kabs_id + ')' ).classed('unintended', true);
			d3.selectAll('.kabupaten#kab-' + kabs_id ).classed('unintended', false);

			$( '#filters-kabupaten .filters-value' ).text(selectedName);
		} else {
			d3.selectAll('.kabupaten.prov-' + centered ).classed('unintended', false);
		}

		let detilParams	= _.omitBy({ kementerian }, _.isNil);
		if (kabs_id) { detilParams.kabupaten = kabs_id; } else { detilParams.provinsi = centered; }
		if (activeFilter) { detilParams.filters = JSON.stringify(activeFilter); }

		getDetil(category, detilParams, (data) => {
			$( '#prov-name' ).text(selectedName);
			_.forEach(data, (o, key) => { $( '#prov-' + key + ' > span' ).text(o); });

			d3.select('#prov-overview').classed('hidden', false);
		});

		$( '#categories-head > span#categories-location' ).text(selectedName);

		appendAdditionTable(kabs_id);

		getFilters(category, detilParams, (data) => {
			let height	= d3.select(cate_dest + ' > svg > g > .group-bar').node().getBBox().height;
			let y		= d3.scaleLinear().rangeRound([Math.floor(height) / 2, 0]).domain([0, _.chain(data.data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data.data, height, y));
			$( '#categories-head > span#categories-anggaran' ).text(nFormatter(data.total));
		});
	}
}
