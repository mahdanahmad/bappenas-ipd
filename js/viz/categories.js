let space		= 0;
let maxWidth	= 0;

let categoryTimeout;

function createCategoriesBar(data) {
	d3.select(cate_dest).selectAll("svg").remove();

	let canvasWidth		= $(cate_dest).outerWidth(true);
	let canvasHeight	= $(cate_dest).outerHeight(true);

	space				= (canvasWidth / shown);
	maxWidth			= Math.floor(-((space * data.length) - canvasWidth));

	if (shown >= data.length) { $( '#categories-right-arrow' ).addClass('nonactive'); } else { $( '#categories-right-arrow' ).removeClass('nonactive'); }

	let margin 			= { top: 0, right: 0, bottom: (shitCate == category && _.isNil(shit) ? shitMargin : 0), left: 0 };
	// let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= space * data.length;
	let height			= canvasHeight - margin.top - margin.bottom;

	let x				= d3.scaleBand().rangeRound([0, width]).padding(0).domain(data.map((o) => (o.color)));
    let y 				= d3.scaleLinear().rangeRound([Math.floor(height / 2), 0]).domain([0, _.chain(data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

	let svg	= d3.select(cate_dest).append("svg")
		.attr("id", cate_id)
    	.attr("width", width)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	let groupBar	= svg.selectAll('group-bar').data(data).enter()
		.append('g')
			// .attr('id', (o) => (o.color.replace('#', '')))
			.attr('id', (o) => (o.kode))
			.attr('class', 'group-bar');

	groupBar.append("rect")
		  .attr("class", "bar fill")
		  .attr("fill", (o) => (o.color || defaultColor))
		  .attr("x", (o) => (x(o.color)))
		  .attr("y", height)
		  // .attr("y", (o) => ((height / 2) + y(o.anggaran)))
		  .attr("width", x.bandwidth())
		  // .attr("height", (o) => ((height / 2) - y(o.anggaran)));
		  .attr("height", 0);

	groupBar.append("rect")
		  .attr("class", "bar cream")
		  .attr("fill", (o) => (o.color || defaultColor))
		  .attr("x", (o) => (x(o.color)))
		  .attr("y", (height - 2))
		  .attr("width", x.bandwidth())
		  .attr("height", 2);

  	groupBar.append('text')
  		.attr('class', 'detil-idr')
		.attr('text-anchor', 'middle')
  		.attr('y', (height - textMarg))
  		.attr('x', (o) => (x(o.color) + (x.bandwidth() / 2)))
  		.text(0);

	groupBar.append('foreignObject')
		.attr('class', 'node')
		.attr('x', (o) => (x(o.color)))
		.attr('y', 0)
		.attr('width', space)
		.attr('height', height * 2 / 5)
		.append('xhtml:div')
			.attr('class', 'cursor-default')
			.text((o, i) => ((i + 1) + '. ' + o.name))

	groupBar.append('rect')
		.attr('class', 'cate-overlay cursor-pointer')
		.attr('x', (o) => (x(o.color)))
		.attr('y', 0)
		.attr('width', space)
		.attr('height', height);

	groupBar
		.on('click', (o) => categorySelect(o));

	if (shitCate == category && _.isNil(shit)) {
		let expandButton	= svg.selectAll('expand-button').data(data).enter()
			.append('g')
				.attr('class', 'expand-button')
				.attr('transform', (o) => ('translate(' + x(o.color) + ',' + height + ')'))

		expandButton.append('text')
			.attr('x', x.bandwidth() / 2)
			.attr('y', shitMargin / 2)
			.attr('text-anchor', 'middle')
			.attr('alignment-baseline', 'central')
			.text('Expand');

		expandButton.append('rect')
			.attr('class', 'expand-overlay cursor-pointer')
			.attr('x', 0)
			.attr('y', 0)
			.attr('width', x.bandwidth())
			.attr('height', shitMargin)

		expandButton
			.on('click', (o) => {
				shit	= o.kode;
				$( '#categories-head > .shitty-back' ).removeClass('hidden');
				toggleShittyData(o);
			});
	}

	changeCateHeight(formData(data, height, y));

	svg.append('g')
		.attr('id', 'grid-wrapper')
		.selectAll('grid')
		.data(_.map(data, (o) => ( x(o.color) )))
			.enter().append('line')
			.attr('class', (o, i) => (i == 0 ? 'hidden' : ''))
			.attr('x1', (o) => (o))
			.attr('x2', (o) => (o))
			.attr('y1', 0)
			.attr('y2', height);

	$( '.arrows' ).click(moveCategories);
}

function moveCategories() {
	if (!$(this).hasClass('nonactive')) {
		let canvas	= d3.select('#' + cate_id + ' > g');
		let current	= parseFloat(canvas.attr('transform').replace('translate(', '').split(',')[0]);

		let next	= current + (_.includes($( this ).attr('id'), 'left') ? space : -space);
		canvas.attr('transform', 'translate(' + next + ',0)');

		if (around(current, 0)) { $( '#categories-left-arrow' ).removeClass('nonactive'); }
		if (around(Math.floor(current), maxWidth)) { $( '#categories-right-arrow' ).removeClass('nonactive'); }

		if (around(next, 0)) { $( '#categories-left-arrow' ).addClass('nonactive'); }
		if (around(Math.floor(next), maxWidth)) { $( '#categories-right-arrow' ).addClass('nonactive'); }
	}
}

function changeCateHeight(data) {
	let time		= 500;
	let transition	= d3.transition()
        .duration(time)
        .ease(d3.easeLinear);

	let canvas		= d3.select('#' + cate_id);

	canvas.selectAll('.bar.fill').transition(transition)
        .attr('y', (o) => (data[o.color].fill))
        .attr('height', (o) => (data[o.color].height > 0 ? data[o.color].height : 0));

	canvas.selectAll('.bar.cream').transition(transition)
        .attr('y', (o) => (data[o.color].cream));

	canvas.selectAll('.detil-idr').transition(transition)
		.text((o) => (data[o.color].text))
		.attr('y', (o) => (data[o.color].cream - textMarg));
}

function categorySelect(data) {
	$( '.group-bar#' + data.kode ).toggleClass('unintended');

	clearTimeout(categoryTimeout);
	//
	categoryTimeout	= setTimeout(() => {
		activeFilter	= $(' .group-bar:not(.unintended) ').map(function() {
			let currText	= $( this ).attr('id');
			return currText;
		}).get();

		getMaps(category, _.omitBy({ filters: JSON.stringify(activeFilter), kementerian }, _.isNil), (data) => { colorMap(data); zoomProv(null); })

	}, awaitTime);
}

function formData(val, height, y) {
	return _.chain(val).keyBy('color').mapValues((o) => ({ anggaran: o.anggaran, y: y(o.anggaran), half: (height / 2), fill: (height / 2) + y(o.anggaran), height: (height / 2) - y(o.anggaran), cream: (height / 2) - 2 + y(o.anggaran), text: nFormatter(o.anggaran) + (o.percentage !== 0 ? ' (' + o.percentage + '%)' : '') })).value();
}

function toggleShittyData(o) {
	if (centered) { zoomProv(null); }
	$( '#categories-head > span#categories-title' ).html(shitCate + ( o ? ' - ' + o.name : '' ));

	getFilters(shitCate, {}, (data) => { createCategoriesBar(data.data); $( '#categories-head > span#categories-anggaran' ).text(nFormatter(data.total)); createShittyPie(data.data)});
	getMaps(shitCate, {}, (data) => { colorMap(data); })

	getLocation(shitCate, {}, (data) => {
		$( '#dropdown-provinsi > ul' ).html( constructDropdown(data, 'provinsi') );
	});
	getKementerian(shitCate, {}, (data) => {
		$( '#dropdown-kementerian > ul' ).html( constructDropdown(data, 'kementerian') );
	});
}
