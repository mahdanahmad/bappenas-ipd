const map_dest		= '#content';
const map_id		= 'maps-viz';
const defaultColor	= '#5a6569';
const mapAddition	= [
	{ kode: '100', nama: 'Pusat' },
	{ kode: '101', nama: 'Perwakilan RI di Luar Negeri' },
	{ kode: '102', nama: 'Asia Tenggara' },
];
let mappedGeoProv	= {};
let centered, path;

const cate_dest		= '#categories-content';
const cate_id		= 'categories-viz';

const shown			= 9;
const textMarg		= 5;

let page			= 0;

let awaitTime		= 800;
let activeFilter	= null;

let category		= '';
let kementerian		= null;

let backState		= 'peta';
