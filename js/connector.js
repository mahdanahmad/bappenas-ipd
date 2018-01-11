function zoomProv(prov_id, isMoronic) {
	prov_id			= "" + prov_id;

	let svg			= d3.select("svg#" + map_id + " > g");
	let isNotProv	= _.chain(mapAddition).map('kode').includes(prov_id).value();

	if (path && svg.node()) {
		let x, y, k;
		let node		= svg.node().getBBox();
		let duration	= 750;

		// Compute centroid of the selected path
		if ((mappedGeoProv[prov_id] || isNotProv) && (centered !== prov_id || isMoronic)) {
			$('#detil-wrapper > table > tbody').html(' ');

			page	= 0;
			let centroid;
			if (!isNotProv) {
				centroid = path.centroid(mappedGeoProv[prov_id]);
				k = 2;
			} else {
				centroid = $( '.addition#' + prov_id ).attr('transform').replace('translate(', '').replace(')', '').split(',').map((o, i) => (parseFloat(o) - ((i * -1) * node.height / 32)));
				k = 1.25;
			}

			x = centroid[0];
			y = centroid[1];

			if (centered) { duration = 500; }

			centered = prov_id;
			d3.select('.province#prov-' + prov_id).classed('unintended', false);
			d3.selectAll('.province:not(#prov-' + prov_id + ')').classed('unintended', true);

			let detilParams	= {};
			if (activeFilter) { detilParams.filters = JSON.stringify(activeFilter); }

			$.get('/api/detil/' + category + '/' + prov_id, detilParams, (data) => {
				$( '#prov-name' ).text($( '#drop-prov-' + prov_id ).text())
				_.forEach(data.result, (o, key) => { $( '#prov-' + key + ' > span' ).text(o); });

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

		$.get('/api/filters/' + category + (centered ? ('/' + centered) : ''), (data) => {
			let height	= $(cate_dest).outerHeight(true);
			let y		= d3.scaleLinear().rangeRound([height / 2, 0]).domain([0, _.chain(data.result).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

			changeCateHeight(formData(data.result, height, y));
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
		'<tr id="' + o._id + '" class="cursor-pointer">' +
			['kegiatan', 'output', 'kl', 'anggaran'].map((key) => ('<td class="table-' + key + '">' + (key == 'anggaran' ? nFormatter(o[key]) : o[key]) + '</td>')).join() +
		'</tr>'
	)).join('');
}

function appendAdditionTable() {
	let params	= { page };
	if (activeFilter) { params.filters = JSON.stringify(activeFilter); }

	$.get('/api/output/' + category + '/' + centered, params, (data) => {
		page	= data.result.iteratee;
		$('#detil-wrapper > table > tbody').append(constructAdditionTable(data.result.data));
	});
}

function colorMap(data) {
	data.forEach((o) => { d3.select('#prov-' + o._id).style('fill', o.color); });
}
