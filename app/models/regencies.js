const util		= require('util');
const Model		= require('./model');

const table		= 'regencies';
const fillable	= ['regency_id', 'province_id', 'regency_name', 'old_id'];
const required	= [];
const preserved	= [];
const hidden	= [];

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, []);
	}
}

module.exports = new Collection();
