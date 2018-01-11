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
			.attr('id', (o) => (o.kode))
			.attr('class', 'addition cursor-pointer')
			.attr("transform", (o, i) => ('translate(' + (height / 4) + ',' + (((height / 16) * (i + 1)) + (height / 4) * (i + 0.5)) + ')'));

	addition.append("circle")
		.attr('id', (o) => ('prov-' + o.kode))
		.attr('class', 'province')
	    .attr("r", (height / 8))
	    .attr("fill", defMapColor);

	addition.append('text')
		.attr('text-anchor', 'middle')
		.text((o) => (o.nama))
		.call(wrap, (height / 8));

	addition.on('click', (o) => { zoomProv(o.kode); });

	d3.json('json/indonesia.json', (err, raw) => {
		if (err) return console.error(err);

		let states		= topojson.feature(raw, raw.objects.map);
		mappedGeoProv	= _.chain(states).get('features', []).keyBy('properties.id_provinsi').value();

		svg.selectAll("path.province")
			.data(states.features)
				.enter().append("path")
					.attr("id", (o) => ('prov-' + (o.properties.id_provinsi)))
					.attr("class", (o) => ("province cursor-pointer"))
					.attr("d", path)
					.attr('vector-effect', 'non-scaling-stroke')
					.style("fill", defMapColor)
					.on('click', (o) => zoomProv(o.properties.id_provinsi));
	});
}
