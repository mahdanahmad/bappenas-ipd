const util		= require('util');
const Model		= require('./model');

const table		= 'provinces';
const fillable	= ['province_id', 'country_id', 'province_name', 'name_alt', 'old_id'];
const required	= [];
const preserved	= [];
const hidden	= [];

class Collection extends Model {
	constructor() {
		super(table, fillable, required, preserved, hidden, []);
	}
}

module.exports = new Collection();
