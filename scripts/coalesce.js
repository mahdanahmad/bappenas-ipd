require('dotenv').config();

const csv			= require('fast-csv');
const _				= require('lodash');
const fs 			= require('fs');
const async 		= require('async');
const assert 		= require('assert');
const randomColor	= require('randomcolor');
const MongoClient	= require('mongodb').MongoClient;
const auth			= (process.env.DB_USERNAME !== '' || process.env.DB_PASSWORD !== '') ? process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' : '';
const db_url		= 'mongodb://' + auth + process.env.DB_HOST + ':' + process.env.DB_PORT;

const params		= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' }

const data_root		= 'public/data/';

const krisna_coll	= 'krisna';
const cate_coll		= 'categories';
const pn_col		= 'prioritas_nasional';

let janpres_group	= {};

// const palette		= ['#e6194b', '#3cb44b', '#ffe119', '#0082c8', '#f58231', '#911eb4', '#46f0f0', '#f032e6', '#d2f53c', '#fabebe', '#008080', '#e6beff', '#aa6e28', '#fffac8', '#800000', '#aaffc3', '#808000', '#ffd8b1', '#000080'];

// const palette		= [
// 	'#F98866','#FF420E','#80BD9E','#89DA59',
// 	'#F1F1F2','#BCBABE','#A1D6E2','#1995AD',
// 	'#9A9EAB','#5D5353','#EC96A4','#DFE166',
// 	'#A1BE95','#E2DFA2','#92AAC7','#ED5752',
// 	'#5BC8AC','#E6D72A','#F18D9E','#98DBC6',
// ];

const palette		= ['#d17076', '#eb6090', '#f3a6be', '#98e2e1', '#17a5a3', '#fac999', '#e6790d', '#b24201', '#eac8b5', '#f3f0e2', '#c1ccd4', '#fbe5ad', '#e2c408', '#fdb360', '#af9b95', '#a4bfd9', '#5b92cb', '#787fa0', '#8e9fbb', '#ebf0f7'];

MongoClient.connect(db_url, (err, client) => {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	const db	= client.db(process.env.DB_DATABASE);
	async.waterfall([
		(flowCallback) => {
			async.each([krisna_coll, cate_coll, pn_col, 'provinces', 'regencies'], (o, eachCallback) => {
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
			let label	= '100 Janji Presiden';

			csv
				.fromPath(data_root + 'labels/' + label + '.csv', params)
				.on("data", (row) => { raw.push(_.assign(row, { 'KODE': _.toInteger(row.KODE) })); })
				.on("end", () => {
					let filters	= _.chain(raw).groupBy('GROUP').map((o, key) => ({
						'NOMENKLATUR': key,
						detil: _.map(o, (d, i) => ({ 'KODE': _.toInteger(d.KODE), 'NOMENKLATUR': d.NOMENKLATUR, color: palette[i] }))
					})).map((o, key) => (_.assign(o, { 'KODE': (key + 1), color: palette[(key)] }))).value();

					let groupMapped	= _.chain(filters).map((o) => ([o.NOMENKLATUR, o.KODE])).fromPairs().value();
					janpres_group	= _.chain(raw).map((o) => ([o.KODE, groupMapped[o.GROUP]])).fromPairs().value();

					db.collection(cate_coll).insert({ name: label, filters }, (err, result) => flowCallback(err));
				});

			// let filters	= [];
			// csv
			// 	.fromPath(data_root + 'labels/' + label + '.csv', params)
			// 	.on("data", (row) => {
			// 		filters.push(_.assign({}, row, { 'KODE': _.toInteger(row.KODE), color: palette[iterate] || randomColor() }));
			// 		iterate++;
			// 	})
			// 	.on("end", () => { db.collection(cate_coll).insert({ name: label, filters }, (err, result) => flowCallback(err)); });
		},
		(flowCallback) => {
			async.map(['KP', 'PN', 'PP'], (o, eachCallback) => {
				let data	= {};

				csv
					.fromPath(data_root + 'deepprio/' + o + '.csv', params)
					.on("data", (row) => { data[row.ID] = row.Name; })
					.on("end", () => { eachCallback(null, [o, data]) });
			}, (err, results) => {
				let prev_ids	= _.fromPairs(results);
				let data		= [];

				csv
					.fromPath(data_root + 'deepprio/PPN.csv', params)
					.on("data", (row) => { data.push(_.assign({}, row, _.chain(['KP', 'PN', 'PP']).map((o) => ([(o + '_name'), prev_ids[o][row[(o + '_id')]]])).fromPairs().value())); })
					.on("end", () => { db.collection(pn_col).insertMany(data, (err, result) => flowCallback(err)); });
			});
		},
		(flowCallback) => {
			async.each(['provinces', 'regencies'], (o, eachCallback) => {
				let data	= [];
				csv
					.fromPath(data_root + 'initial/' + o + '.csv', _.assign({}, params, { delimiter: ',' }))
					.on('data', (row) => { data.push(row); })
					.on('end', () => { db.collection(o).insertMany(data, (err, result) => eachCallback(err)); })
			}, (err) => flowCallback(err));
		},
		(flowCallback) => {
			async.map(['provinces', 'regencies'], (o, eachCallback) => {
				let data	= {};
				csv
					.fromPath(data_root + 'initial/mapped-' + o + '.csv', _.assign({}, params, { delimiter: ',' }))
					.on('data', (row) => { data[row.krisna_id] = row.used_id; })
					.on('end', () => { eachCallback(null, [o, data]); })
			}, (err, results) => flowCallback(err, _.fromPairs(results)));
		},
		(mapped_ids, flowCallback) => {
			csv
				.fromPath(data_root + 'raw.csv', params)
				.on('data', (row) => {
					let picked	= _.chain(row).clone().assign({
						anggaran: parseInt(row.Anggaran.split('.').join('')),
						janpres_group: '' + janpres_group[row.Janpres] || null,
						provinsi: row.provinsi == '' ? null : (mapped_ids.provinces[row.kd_prov] || mapped_ids.provinces['']),
						kabupaten: mapped_ids.regencies[row.kd_kota] || null,
						Tematik: _.last(row.Tematik) == ',' ? row.Tematik.slice(0, -1) : row.Tematik,
						// kd_nawacita: '' + parseInt(row.kd_nawacita),
					}).omit(['PN', 'PP', 'KP', 'PPN', 'Kota', 'nawacita', 'Anggaran']).value();

					db.collection(krisna_coll).insert(picked, (err, result) => {});
				})
				.on('end', () => { flowCallback(); });
		},
	], (err, result) => {
		assert.equal(null, err);
		client.close();
	});
});
