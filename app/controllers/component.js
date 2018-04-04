const _				= require('lodash');
const async			= require('async');

const krisna		= require('../models/krisna');
const provinces		= require('../models/provinces');
const regencies		= require('../models/regencies');
const categories	= require('../models/categories');

const defaultColor	= '#5a6569';
const categoriesMap	= {
	'Tematik': 'Tematik',
	'Nawacita': 'kd_nawacita',
	'100 Janji Presiden': 'janpres_group',
	// '100 Janji Presiden': 'Janpres',
	'Prioritas Nasional': 'kd_PN',
}

const shitCate		= '100 Janji Presiden';
const shitColumn	= 'Janpres';

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

module.exports.filters = (input, category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get all filters for ' + category_name + ' success.';
	let result          = null;

	const kementerian	= !_.isNil(input.kementerian)	? input.kementerian	: null;
	const provinsi		= !_.isNil(input.provinsi)		? input.provinsi	: null;
	const kabupaten		= !_.isNil(input.kabupaten)		? input.kabupaten	: null;
	const shitdetil		= !_.isNil(input.shit)			? input.shit		: null;

	async.waterfall([
		(flowCallback) => {
			if (category_name == shitCate && shitdetil) {
				categories.findOne({ name: shitCate }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).find({ 'KODE': parseInt(shitdetil) }).get('detil', []).value()));
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
			}
		},
		(categories, flowCallback) => {
			let filters		= shitdetil ? categories : _.chain(categories).get('filters', []).value();
			let colors		= _.get(categories, 'colors', {});

			let column		= shitdetil ? shitColumn : categoriesMap[category_name];
			let match		= {};
			match[column]	= { '$in': filters.map((o) => (new RegExp(o.KODE))) };
			if (provinsi) { match.provinsi = provinsi; }
			if (kabupaten) { match.kabupaten = kabupaten; }
			if (kementerian) { match.kd_kementerian = kementerian; }

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: '$' + column, total: { '$sum': '$anggaran' }} }
			], {}, (err, result) => {
				if (err) { flowCallback(err); } else {
					let formatted	= _.chain(result).flatMap((o) => (o._id.split(',').map((id) => ({ id, total: o.total })))).groupBy('id').mapValues((o) => _.sumBy(o, 'total')).value();

					flowCallback(err, filters.map((o) => ({ kode: o.KODE, name: o.NOMENKLATUR, anggaran: (formatted[o.KODE] || 0), color: o.color })));
				}
			});
		},
		(data, flowCallback) => {
			let total = _.sumBy(data, 'anggaran');
			flowCallback(null, { total, data: data.map((o) => (_.assign(o, { percentage: _.round(((o.anggaran / total) * 100), 2) }))) });
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
	const provinsi		= !_.isNil(input.provinsi)		? input.provinsi				: null;
	const shitdetil		= !_.isNil(input.shit)			? input.shit					: null;

	async.waterfall([
		(flowCallback) => {
			if (category_name == shitCate && shitdetil) {
				categories.findOne({ name: shitCate }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).find({ 'KODE': parseInt(shitdetil) }).get('detil', []).value()));
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
			}
		},
		(categories, flowCallback) => {
			if (provinsi) {
				regencies.distinct('regency_id', { province_id: provinsi }, (err, result) => flowCallback(err, categories, result));
			} else {
				provinces.distinct('province_id', {}, (err, result) => flowCallback(err, categories, result));
			}
		},
		(categories, locations, flowCallback) => {
			let filt	= (filters || (shitdetil ? categories : _.chain(categories).get('filters', []).value()).map((o) => (o.KODE)));
			let colors	= _.chain(categories).get('filters', []).map((o) => ([o.KODE, o.color])).fromPairs().value();

			let column	= shitdetil ? shitColumn : categoriesMap[category_name];
			let match	= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };
			match[(provinsi ? 'kabupaten' : 'provinsi')]	= { '$in': locations };
			if (kementerian) { match.kd_kementerian = kementerian; }

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: { location: '$' + (provinsi ? 'kabupaten' : 'provinsi'), column: '$' + column }, anggaran: { '$sum': '$anggaran' }} },
				{ '$group': { _id: '$_id.location', data: { '$push': { column: '$_id.column', anggaran: '$anggaran' }}} }
			], {}, (err, result) => {
				if (err) { flowCallback(err); } else {
					let formatted	= _.chain(result).map((o) => ({
						_id: o._id,
						data: o.data,
						filter: _.chain(o.data).flatMap((d) => (d.column.split(',').map((id) => ({ id, anggaran: d.anggaran })))).groupBy('id').pick(filt).mapValues((o) => _.sumBy(o, 'anggaran')).toPairs().maxBy((d) => (d[1])).get('0', '').value()
					})).map((o) => ([o._id, _.get(colors, o.filter, null)])).fromPairs().value();
					flowCallback(null, locations.map((o) => ({ _id: o, color: _.get(formatted, o, defaultColor) })));
					// })).value();
					// flowCallback(null, formatted);
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

module.exports.detillocation = (input, category_name, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get maps data for ' + category_name + ' success.';
	let result          = null;

	const filters		= !_.isNil(input.filters)		? JSON.parse(input.filters)		: null;
	const kementerian	= !_.isNil(input.kementerian)	? input.kementerian				: null;
	const provinsi		= !_.isNil(input.provinsi)		? input.provinsi				: null;
	const kabupaten		= !_.isNil(input.kabupaten)		? input.kabupaten				: null;
	const shitdetil		= !_.isNil(input.shit)			? input.shit					: null;

	async.waterfall([
		(flowCallback) => {
			if (category_name == shitCate && shitdetil) {
				categories.findOne({ name: shitCate }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).find({ 'KODE': parseInt(shitdetil) }).get('detil', []).value()));
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
			}
		},
		(categories, flowCallback) => {
			let filt	= (filters || (shitdetil ? categories : _.chain(categories).get('filters', []).value()).map((o) => (o.KODE)));

			let column	= shitdetil ? shitColumn : categoriesMap[category_name];
			let match	= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };
			if (kementerian) { match.kd_kementerian = kementerian; }
			if (provinsi) { match.provinsi = provinsi; }
			if (kabupaten) { match.kabupaten = kabupaten; }

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: '$' + (provinsi ? 'provinsi' : 'kabupaten'), output: { '$sum': 1 }, anggaran: { '$sum': '$anggaran' }, kementerian: {  '$addToSet': '$kementerian' }} },
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

module.exports.getOutput = (input, category_name, provinsi, kabupaten, callback) => {
	let response        = 'OK';
	let status_code     = 200;
	let message         = 'Get output data for ' + category_name + ' success.';
	let result          = null;

	const onepage		= 20;

	let currentpage		= !_.isNil(input.page)			? _.toInteger(input.page)		: 0;
	let sortby			= !_.isNil(input.sort)			? _.toInteger(input.sort)		: 'anggaran';

	const like			= !_.isNil(input.like)			? input.like					: null;
	const filters		= !_.isNil(input.filters)		? JSON.parse(input.filters)		: null;
	const kementerian	= !_.isNil(input.kementerian)	? input.kementerian				: null;
	const shitdetil		= !_.isNil(input.shit)			? input.shit					: null;

	async.waterfall([
		(flowCallback) => {
			if (category_name == shitCate && shitdetil) {
				categories.findOne({ name: shitCate }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).find({ 'KODE': parseInt(shitdetil) }).get('detil', []).value()));
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, result));
			}
		},
		(categories, flowCallback) => {
			let filt		= (filters || (shitdetil ? categories : _.chain(categories).get('filters', []).value()).map((o) => (o.KODE)));

			let column		= shitdetil ? shitColumn : categoriesMap[category_name];
			let match		= { provinsi };
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };
			let sort		= {};
			sort[sortby]	= -1;
			if (kementerian) { match.kd_kementerian = kementerian; }
			if (like) { match.output = new RegExp(like, 'i') }
			if (kabupaten) { match.kabupaten = kabupaten; }

			krisna.rawAggregate([
				{ '$match': match },
				{ '$sort': sort },
				{ '$skip': (currentpage * onepage) },
				{ '$limit': onepage },
				{ '$project': { kegiatan: '$Kegiatan', output: '$output', kl: '$kementerian', anggaran: '$anggaran' }},
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
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).map('KODE').uniq().value()));
			}
		},
		(filt, flowCallback) => {
			let column		= categoriesMap[category_name];
			let match		= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };

			krisna.rawAggregate([
				{ '$match': match },
				{ '$group': { _id: { id: '$kd_kementerian', name: '$kementerian' }}},
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
	const provinsi		= !_.isNil(input.provinsi)	? input.provinsi				: null;

	async.waterfall([
		(flowCallback) => {
			if (filters) {
				flowCallback(null, filters);
			} else {
				categories.findOne({ name: category_name }, (err, result) => flowCallback(err, _.chain(result).get('filters', []).map('KODE').uniq().value()));
			}
		},
		(filt, flowCallback) => {
			let column		= categoriesMap[category_name];
			let match		= {};
			match[column]	= { '$in': filt.map((o) => (new RegExp(o))) };
			if (provinsi) { match.provinsi = provinsi; }

			krisna.distinct((provinsi ? 'kabupaten' : 'provinsi'), match, (err, result) => flowCallback(err, _.compact(result)));
		},
		(locations, flowCallback) => {
			let collection	= provinsi ? regencies : provinces;

			let match		= {};
			match[(provinsi ? 'regency_id' : 'province_id')]	= { '$in': locations };

			collection.findAll(match, {}, (err, result) => flowCallback(err, _.chain(result).map((o) => ({
				id: o[(provinsi ? 'regency_id' : 'province_id')],
				name: o[(provinsi ? 'regency_name' : 'province_name')],
			})).sortBy('id').value()));
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
