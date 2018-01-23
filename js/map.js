function createMaps() {
	d3.select(map_dest).selectAll("svg").remove();

	let canvasWidth		= $(map_dest).outerWidth(true);
	let canvasHeight	= $(map_dest).outerHeight(true);

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let projection		= d3.geoEquirectangular()
		.scale((width - (height / 2)) + 225)
		.rotate([-120, 1])
		.translate([(width * 6 / 10) + 55, (height / 2) - 50]);
	path	= d3.geoPath().projection(projection);

	let svg	= d3.select(map_dest).append("svg")
		.attr("id", map_id)
    	.attr("width", canvasWidth)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.append('rect')
		.attr('id', 'background')
		.attr('width', width)
		.attr('height', height)
		// .attr('transform', 'translate(-' + (width / 8) + ',-' + (height / 8) +  ')')
		.on('click', () => { zoomProv(null) });

	let addition	= svg.append('g').attr('id', 'addition-wrapper').selectAll('.addition')
		.data(mapAddition).enter().append('g')
			.attr('id', (o) => ('prov-wrapper-' + o.kode))
			.attr('class', 'addition')
			.attr("transform", (o, i) => ('translate(' + (height / 4) + ',' + (((height / 12) * (i + 1)) + (height / 3) * (i + 0.5)) + ')'));

	addition.append("circle")
		.attr('id', (o) => ('prov-' + o.kode))
		.attr('class', 'province')
	    .attr("r", (height / 8))
	    .attr("fill", defaultColor);

	addition.append('text')
		.attr('text-anchor', 'middle')
		.text((o) => (o.nama))
		.call(wrap, (height / 8));

	addition.on('click', (o) => { zoomProv(o.kode); });

	d3.queue()
		.defer(d3.json, 'json/indonesia.json')
		.defer(d3.json, 'json/kabupaten.geojson')
		.await((err, prov, kabs) => {
			if (err) return console.error(err);

			let states		= topojson.feature(prov, prov.objects.map);
			mappedGeoProv	= _.chain(states).get('features', []).keyBy('properties.id_provinsi').value();

			svg.selectAll('path.kabupaten')
				.data(kabs.features)
					.enter().append('path')
					.attr("id", (o) => ('kab-' + (o.properties.id_kabkota)))
					.attr('d', path)
					.attr('class', (o) => ('hidden kabupaten cursor-pointer prov-' + o.properties.id_provinsi))
					.attr('vector-effect', 'non-scaling-stroke')
					.style("fill", defaultColor)
					.on('click', (o) => { zoomKabs(o.properties.id_kabkota, o.properties.id_provinsi); });

			svg.selectAll("path.province")
				.data(states.features)
					.enter().append("path")
						.attr("id", (o) => ('prov-' + (o.properties.id_provinsi)))
						.attr("class", (o) => ("province"))
						.attr("d", path)
						.attr('vector-effect', 'non-scaling-stroke')
						.style("fill", defaultColor)
						.on('click', (o) => zoomProv(o.properties.id_provinsi));
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
	$( '.kabupaten.prov-' + prov_id ).removeClass('cursor-pointer cursor-not-allowed');
	data.forEach((o) => {
		d3.select('#kab-' + o._id).style('fill', o.color);
		$( '#kab-' + o._id ).addClass(o.color == defaultColor ? 'cursor-not-allowed' : 'cursor-pointer');
	});
}
