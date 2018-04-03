const map_dest		= '#content';
const map_id		= 'maps-viz';
const defaultColor	= '#5a6569';
const mapAddition	= [
	{ kode: '100', nama: 'Pusat' },
	{ kode: '101', nama: 'Luar Negeri' },
];
let mappedGeoProv	= {};
let centered, path;

const cate_dest		= '#categories-content';
const cate_id		= 'categories-viz';

// const pie_dest		= '#content';
const pie_id		= 'pie_viz';

const shown			= 9;
const textMarg		= 5;

let page			= 0;

let awaitTime		= 800;
let activeFilter	= null;

let category		= '';
let kementerian		= null;

const shitCate		= "100 Janji Presiden";
const shitMargin	= 30;

let backState		= 'peta';
