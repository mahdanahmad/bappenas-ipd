const _				= require('lodash');
const async			= require('async');

const krisna		= require('../models/krisna');
const categories	= require('../models/categories');

const defaultColor	= '#5a6569';
const categoriesMap	= {
	'Tematik': 'tematik_nomen',
	'Nawacita': 'nawacita_nomen',
	'100 Janji Presiden': 'janpres_group',
	'Prioritas Nasional': 'pn_nomen',
}

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

module.exports.maps = (category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get maps data for ' + category_name + ' success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
		},
		(categories, flowCallback) => {
			krisna.distinct('location', {}, (err, result) => flowCallback(err, categories, result));
		},
		(categories, locations, flowCallback) => {
			// console.log(locations);
			let filters	= _.chain(categories).get('filters', []).map('NOMENKLATUR').uniq().value();
			let colors	= _.get(categories, 'colors', {});

			let column	= categoriesMap[category_name];
			let match	= {};
			match[column]	= { '$in': filters.map((o) => (new RegExp(o))) };

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: { location: '$location', column: '$' + column }, anggaran: { '$sum': '$alokasi' }} },
				{ '$group': { _id: '$_id.location', data: { '$push': { column: '$_id.column', anggaran: '$anggaran' }}} }
			], {}, (err, result) => {
				if (err) { flowCallback(err); } else {
					let formatted	= _.chain(result).map((o) => ({
						_id: o._id,
						filter: _.chain(o.data).flatMap((d) => (d.column.split(' | ').map((id) => ({ id, anggaran: d.anggaran })))).groupBy('id').mapValues((o) => _.sumBy(o, 'anggaran')).toPairs().maxBy((d) => (d[1])).get('0', '').value()
					})).map((o) => ([o._id, _.get(colors, o.filter, null)])).fromPairs().value();
					flowCallback(null, locations.map((o) => ({ _id: o, color: _.get(formatted, o, defaultColor) })));
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

module.exports.kementerian = (callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all categories success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			krisna.rawAggregate([
				{ '$group': { _id: { id: '$kementerian_kode', name: '$kementerian_nomen' }}},
				{ '$project': { id: '$_id.id', name: '$_id.name', _id: 0 }},
				{ '$sort': { name: 1 }}
			], {}, (err, result) => flowCallback(err, result));
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

module.exports.location = (callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all categories success.';
	let result          = null;

	async.waterfall([
		(flowCallback) => {
			krisna.rawAggregate([
				{ '$group': { _id: { id: '$location', name: '$provinsi_nomen' }}},
				{ '$project': { id: '$_id.id', name: '$_id.name', _id: 0 }},
				{ '$sort': { name: 1 }}
			], {}, (err, result) => flowCallback(err, result));
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
