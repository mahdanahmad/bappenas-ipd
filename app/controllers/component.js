const _				= require('lodash');
const async			= require('async');

const krisna		= require('../models/krisna');
const categories	= require('../models/categories');

module.exports.categories = (callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all categories success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.findAll({}, {}, (err, result) => flowCallback(err, result.map((o) => (o.name))));
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}

module.exports.filters = (category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all filters for ' + category_name + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).map('NOMENKLATUR').uniq().value()));
		}
	], (err, asyncResult) => {
		if (err) {
			response    = 'FAILED';
			status_code = 400;
			message     = err;
		} else {
			result      = asyncResult;
		}
		callback({ response, status_code, message, result });
	});
}
