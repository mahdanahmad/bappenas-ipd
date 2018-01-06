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

module.exports.filters = (category_name, location, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all filters for ' + category_name + ' success.';
	let result          = null;

	const defaultColor	= '#EBDCB2';
	const categoriesMap	= {
		'Tematik': 'tematik_nomen',
        'Nawacita': 'nawacita_nomen',
		'100 Janji Presiden': 'janpres_group',
        'Prioritas Nasional': 'pn_nomen',
	}

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
		},
		(categories, flowCallback) => {
			let filters	= _.chain(categories).get('filters', []).map('NOMENKLATUR').uniq().value();
			let colors	= _.get(categories, 'colors', {});

			let column	= categoriesMap[category_name];
			let match	= {};
			match[column]	= { '$in': filters.map((o) => (new RegExp(o))) };
			if (location) { match.location = location; }

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: '$' + column, total: { '$sum': '$alokasi' }} }
			], {}, (err, result) => {
				if (err) { flowCallback(err); } else {
					let formatted	= _.chain(result).flatMap((o) => (o._id.split(' | ').map((id) => ({ id, total: o.total })))).groupBy('id').mapValues((o) => _.sumBy(o, 'total')).value();
					flowCallback(err, filters.map((o) => ({ name: o, anggaran: (formatted[o] || 0), color: _.get(colors, o, defaultColor) })));
				}
			});
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
