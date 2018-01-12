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

module.exports.filters = (input, category_name, location, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all filters for ' + category_name + ' success.';
	let result          = null;

	const kementerian	= !_.isNil(input.kementerian)	? input.kementerian	: null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
		},
		(categories, flowCallback) => {
			let filters		= _.chain(categories).get('filters', []).map('NOMENKLATUR').uniq().value();
			let colors	= _.get(categories, 'colors', {});

			let column	= categoriesMap[category_name];
			let match	= {};
			match[column]	= { '$in': filters.map((o) => (new RegExp(o))) };
			if (location) { match.location = location; }
			if (kementerian) { match.kementerian_kode = kementerian; }

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

module.exports.maps = (input, category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get maps data for ' + category_name + ' success.';
	let result          = null;

	const filters		= !_.isNil(input.filters)		? JSON.parse(input.filters)		: null;
	const kementerian	= !_.isNil(input.kementerian)	? input.kementerian				: null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
		},
		(categories, flowCallback) => {
			krisna.distinct('location', {}, (err, result) => flowCallback(err, categories, result));
		},
		(categories, locations, flowCallback) => {
			let filt	= (filters || _.chain(categories).get('filters', []).map('NOMENKLATUR').uniq().value());
			let colors	= _.get(categories, 'colors', {});

			let column	= categoriesMap[category_name];
			let match	= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };
			if (kementerian) { match.kementerian_kode = kementerian; }

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

module.exports.detillocation = (input, category_name, location, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get maps data for ' + category_name + ' success.';
	let result          = null;

	const filters		= !_.isNil(input.filters)	? JSON.parse(input.filters)		: null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
		},
		(categories, flowCallback) => {
			let filt	= (filters || _.chain(categories).get('filters', []).map('NOMENKLATUR').uniq().value());

			let column	= categoriesMap[category_name];
			let match	= { location };
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: '$location', output: { '$sum': 1 }, anggaran: { '$sum': '$alokasi' }, kementerian: {  '$addToSet': '$kementerian_nomen' }} },
				{ '$project': { _id: 0, output: 1, anggaran: 1, kementerian: { '$size': '$kementerian' }} }
			], {}, (err, result) => flowCallback(err, _.assign(result[0], { anggaran: 'Rp. ' + _.get(result, '[0].anggaran', 0).toString().replace( /(\d)(?=(\d{3})+$)/g, "$1." ) + ',00' })));
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

module.exports.getOutput = (input, category_name, location, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get output data for ' + category_name + ' success.';
	let result          = null;

	const onepage		= 20;

	let currentpage		= !_.isNil(input.page)			? _.toInteger(input.page)		: 0;
	let sortby			= !_.isNil(input.sort)			? _.toInteger(input.sort)		: 'alokasi';
	const filters		= !_.isNil(input.filters)		? JSON.parse(input.filters)		: null;
	const kementerian	= !_.isNil(input.kementerian)	? input.kementerian				: null;

	async.waterfall([
		(flowCallback) => {
			categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
		},
		(categories, flowCallback) => {
			let filt		= (filters || _.chain(categories).get('filters', []).map('NOMENKLATUR').uniq().value());

			let column		= categoriesMap[category_name];
			let match		= { location };
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };
			let sort		= {};
			sort[sortby]	= -1;
			if (kementerian) { match.kementerian_kode = kementerian; }
			
			krisna.rawAggregate([
				{ '$match': match },
				{ '$sort': sort },
				{ '$skip': (currentpage * onepage) },
				{ '$limit': onepage },
				{ '$project': { kegiatan: '$kegiatan_nomen', output: '$output_nomen', kl: '$kementerian_nomen', anggaran: '$alokasi' }},
			], {}, (err, result) => flowCallback(err, { iteratee: (currentpage + 1), data: result }));
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

module.exports.kementerian = (input, category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all categories success.';
	let result          = null;

	const filters		= !_.isNil(input.filters)	? JSON.parse(input.filters)		: null;

	async.waterfall([
		(flowCallback) => {
			if (filters) {
				flowCallback(null, filters);
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).map('NOMENKLATUR').uniq().value()));
			}
		},
		(filt, flowCallback) => {
			let column		= categoriesMap[category_name];
			let match		= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };

			krisna.rawAggregate([
				{ '$match': match },
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

module.exports.location = (input, category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all categories success.';
	let result          = null;

	const filters		= !_.isNil(input.filters)	? JSON.parse(input.filters)		: null;

	async.waterfall([
		(flowCallback) => {
			if (filters) {
				flowCallback(null, filters);
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).map('NOMENKLATUR').uniq().value()));
			}
		},
		(filt, flowCallback) => {
			let column		= categoriesMap[category_name];
			let match		= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };

			krisna.rawAggregate([
				{ '$match': match },
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
