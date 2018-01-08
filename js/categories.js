const dest		= '#categories-content';

const shown		= 9;
let space		= 0;
let maxWidth	= 0;

function createCategoriesBar(data) {
	d3.select(dest).selectAll("svg").remove();

	let canvasWidth		= $(dest).outerWidth(true);
	let canvasHeight	= $(dest).outerHeight(true);

	space				= (canvasWidth / shown);
	maxWidth			= Math.floor(-((space * data.length) - canvasWidth));

	if (shown == data.length) { $( '#categories-right-arrow' ).addClass('nonactive'); }

	let margin 			= { top: 0, right: 0, bottom: 0, left: 0 };
	let width			= space * data.length;
	let height			= canvasHeight - margin.top - margin.bottom;

	let x				= d3.scaleBand().rangeRound([0, width]).padding(0).domain(data.map((o) => (o.color)));
    let y 				= d3.scaleLinear().rangeRound([height, 0]).domain([0, _.chain(data).maxBy('anggaran').get('anggaran', 0).multiply(1.1).value()]);

	let svg = d3.select(dest).append("svg")
		.attr("id", "categories-viz")
    	// .attr("width", canvasWidth)
    	.attr("width", width)
        .attr("height", canvasHeight)
		.append('g')
			.attr("transform", "translate(" + margin.left + "," + margin.top + ")");





	svg.append('g')
		.attr('id', 'grid-wrapper')
		.selectAll('grid')
		.data(_.times(data.length - 1, (o) => ( (o + 1) * x.bandwidth() )))
			.enter().append('line')
			.attr('x1', (o) => (o))
			.attr('x2', (o) => (o))
			.attr('y1', 0)
			.attr('y2', height);

	$( '.arrows' ).click(moveCategories);
}

function moveCategories() {
	if (!$(this).hasClass('nonactive')) {
		let canvas	= d3.select('#categories-viz > g');
		let current	= parseFloat(canvas.attr('transform').replace('translate(', '').split(',')[0]);

		let next	= current + (_.includes($( this ).attr('id'), 'left') ? space : -space);
		canvas.attr('transform', 'translate(' + next + ',0)');

		if (around(current, 0)) { $( '#categories-left-arrow' ).removeClass('nonactive'); }
		if (around(Math.floor(current), maxWidth)) { $( '#categories-right-arrow' ).removeClass('nonactive'); }

		if (around(next, 0)) { $( '#categories-left-arrow' ).addClass('nonactive'); }
		if (around(Math.floor(next), maxWidth)) { $( '#categories-right-arrow' ).addClass('nonactive'); }
	}
}
