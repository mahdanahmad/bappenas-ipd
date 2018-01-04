const util		= require('util');
const Model		= require('./model');

const table		= 'krisna';
const fillable	= ['KODE', 'NOMENKLATUR', 'DETIL'];
const required	= [];
const preserved	= [];
const hidden	= [];

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, []);
	}
}

module.exports = new Collection();
