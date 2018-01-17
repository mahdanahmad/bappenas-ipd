function createProgress() {
	let canvasWidth		= $( 'body' ).outerWidth(true) * .65 - 30;
	let canvasHeight	= 85;

	let margin 			= { top: 15, right: 60, bottom: 50, left: 60 };
	let width			= canvasWidth - margin.right - margin.left;
	let height			= canvasHeight - margin.top - margin.bottom;

	let progress		= ['Pembukaan Tender', 'Pemenang Tender', 'Pelaksanaan', 'Pencairan', 'Pembayaraan'];

	let svg				= d3.select('#progress-wrapper > svg')
		.attr('id', 'viz-progress')
		.attr("width", canvasWidth)
		.attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	// let scale			= d3.scaleBand().rangeRound([0, width]).padding(0).domain(progress);

	svg.append('rect')
		.attr('width', width)
		.attr('height', height);

	let lineFunc	= d3.line().x((o) => (o.x)).y((o) => (o.y));
	let lineCount	= progress.length - 1;
	let lineSpace	= width / lineCount;
	let lineHeight	= (height - 2) / 2;
	let lineWrapper	= svg.append('g').attr('id', 'line-wrapper');
	_.times(lineCount, (o) => {
		lineWrapper.append('path')
			.attr('id', 'line-' + (o + 1))
			.attr('class', 'line')
			.attr('d', lineFunc([{ x: o * lineSpace, y: lineHeight }, { x: (o + 1) * lineSpace, y: lineHeight }]))
	});

	let crclWrapper	= svg.append('g').selectAll('circle-wrapper').data(progress).enter()
		.append('g')
			.attr('id', (o, i) => ('circle-' + i))
			.attr('class', 'circle-wrapper');

	crclWrapper.append('circle')
		.attr('class', 'outer')
		.attr('cx', (o, i) => (i * lineSpace))
		.attr('cy', (height / 2))
		.attr('r', (height / 2));

	crclWrapper.append('circle')
		.attr('class', 'inner')
		.attr('cx', (o, i) => (i * lineSpace))
		.attr('cy', (height / 2))
		.attr('r', (height / 2) - 4);

	crclWrapper.append('text')
		.attr('text-anchor', 'middle')
		.attr('x', (o, i) => (i * lineSpace))
		.attr('y', (height * 2))
		.text((o) => (o));
}
