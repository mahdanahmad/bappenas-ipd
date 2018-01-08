require('dotenv').config();

const csv			= require('fast-csv');
const _				= require('lodash');
const fs 			= require('fs');
const async 		= require('async');
const assert 		= require('assert');

const MongoClient	= require('mongodb').MongoClient;
const auth			= (process.env.DB_USERNAME !== '' || process.env.DB_PASSWORD !== '') ? process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' : '';
const db_url		= 'mongodb://' + auth + process.env.DB_HOST + ':' + process.env.DB_PORT;

const params		= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ',' };

const data_root		= 'public/data/';

MongoClient.connect(db_url, (err, client) => {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	const db	= client.db(process.env.DB_DATABASE);
	async.waterfall([
		(flowCallback) => {
			let data = [];

			csv
				.fromPath(data_root + "prov.csv", params)
				.on("data", (row) => {
					data.push({ old: row.prov.split('-')[0], new: row.code, name: row.prov.split('-')[1].replace('Provinsi ', '') });
				})
				.on("end", () => flowCallback(null, { data }));
		},
		(proceed, flowCallback) => {
			async.each(proceed.data, (o, eachCallback) => {
				db.collection('krisna').update({ provinsi_kode: o.old }, { $set: { provinsi_nomen: o.name, location: o.new } }, { multi: true }, (err, result) => eachCallback(err));
			}, (err) => {
				flowCallback(err);
			})
		},
	], (err, result) => {
		assert.equal(null, err);
		client.close();
	});
});
