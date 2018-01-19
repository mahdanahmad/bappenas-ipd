require('dotenv').config();

const csv			= require('fast-csv');
const _				= require('lodash');
const fs 			= require('fs');
const async 		= require('async');
const assert 		= require('assert');

const MongoClient	= require('mongodb').MongoClient;
const auth			= (process.env.DB_USERNAME !== '' || process.env.DB_PASSWORD !== '') ? process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' : '';
const db_url		= 'mongodb://' + auth + process.env.DB_HOST + ':' + process.env.DB_PORT;

const params		= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' }

const data_root		= 'public/data/';

const krisna_coll	= 'krisna';
const cate_coll		= 'categories';
const pn_col		= 'prioritas_nasional';

let janpres_group	= {};

const palette		= ['#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#d2f53c', '#fabebe', '#008080', '#e6beff', '#aa6e28', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000080'];

MongoClient.connect(db_url, (err, client) => {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	const db	= client.db(process.env.DB_DATABASE);
	async.waterfall([
		(flowCallback) => {
			async.each([krisna_coll, cate_coll, pn_col], (o, eachCallback) => {
				db.collection(o).deleteMany({}, (err) => eachCallback(err));
			}, (err) => flowCallback(err));
		},
		(flowCallback) => {
			async.map(['Tematik', 'Nawacita', 'Prioritas Nasional'], (o, eachCallback) => {
				let filters	= [];
				let iterate	= 0;

				csv
					.fromPath(data_root + 'labels/' + o + '.csv', params)
					.on("data", (row) => {
						filters.push(_.assign({}, row, { color: palette[iterate] }));
						iterate++;
					})
					.on("end", () => { db.collection(cate_coll).insert({ name: o, filters }, (err, result) => eachCallback(err)); });

			}, (err, result) => flowCallback(err));
		},
		(flowCallback) => {
			let raw		= [];
			let iterate	= 0;

			csv
				.fromPath(data_root + 'labels/100 Janji Presiden.csv', params)
				.on("data", (row) => { raw.push(_.assign(row, { 'KODE': _.toInteger(row.KODE) })); })
				.on("end", () => {
					let filters	= _.chain(raw).groupBy('NOMENKLATUR').map((o, key) => ({
						'NOMENKLATUR': key,
						detil: _.map(o, (d) => ({ 'KODE': d.KODE, 'NOMENKLATUR': d.DETIL }))
					})).map((o, key) => (_.assign(o, { 'KODE': (key + 1), color: palette[(key)] }))).value();

					let groupMapped	= _.chain(filters).map((o) => ([o.NOMENKLATUR, o.KODE])).fromPairs().value();
					janpres_group	= _.chain(raw).map((o) => ([o.KODE, groupMapped[o.NOMENKLATUR]])).fromPairs().value();

					db.collection(cate_coll).insert({ name: '100 Janji Presiden', filters }, (err, result) => flowCallback(err));
				});
		},
		(flowCallback) => {
			async.map(['KP', 'PN', 'PP'], (o, eachCallback) => {
				let data	= {};

				csv
					.fromPath(data_root + 'deepprio/' + o + '.csv', params)
					.on("data", (row) => {
						data[row.ID]	= row.Name;
					})
					.on("end", () => { eachCallback(null, [o, data]) });
			}, (err, results) => {
				let prev_ids	= _.fromPairs(results);
				let data		= [];

				csv
					.fromPath(data_root + 'deepprio/PPN.csv', params)
					.on("data", (row) => { data.push(_.assign({}, row, _.chain(['KP', 'PN', 'PP']).map((o) => ([(o + '_name'), prev_ids[o][row[(o + '_id')]]])).fromPairs().value())); })
					.on("end", () => { db.collection(pn_col).insertMany(data, (err, result) => flowCallback(err)); });
			});
		}
	], (err, result) => {
		assert.equal(null, err);
		client.close();
	});
});
