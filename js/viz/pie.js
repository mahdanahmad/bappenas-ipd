let radius;

function createShittyPie(data) {
	d3.select(map_dest + " > svg > g#" + pie_id).remove();
	let height	= $(map_dest).outerHeight(true);

	radius		= (height / 10) * 2;

	let svg	= d3.select(map_dest + " > svg").append("g")
		.attr("id", pie_id)
		.attr("transform", "translate(" + (height / 4) + "," + ((height / 10 * 7.25)) + ")");

	let div = d3.select(map_dest).append("div").attr("id", "pie-tooltip").attr('class', 'hidden');

	let pieFunc	= d3.pie()
    	.sort(null)
		.value((o) => (o.anggaran));

	let path = d3.arc()
	    .outerRadius(radius - 10)
	    .innerRadius(0);

	let zoomed	= d3.arc()
		.outerRadius(radius)
		.innerRadius(0);

	let arc = svg.selectAll(".arc")
		.data(pieFunc(data))
		.enter().append("g")
		.attr("class", "arc");

	arc.append("path")
		.attr("d", path)
		.attr("fill", (o) => (o.data.color));

	arc
		.on('mouseover', function(o) {
			d3.select(this).select('path').attr("d", zoomed);
			div.classed('hidden', false);
			div.html((o.data.name) + "<br/>Rp. " + (nFormatter(o.data.anggaran)) + " (" + (o.data.percentage) + "%)");
		})
		.on('mouseout', function(o) {
			d3.select(this).select('path').attr("d", path);
			div.classed('hidden', true);
		});
}
