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

const janpres		= ["PANGAN", "PANGAN", "PANGAN", "PANGAN", "PANGAN", "PANGAN", "PANGAN", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "INFRASTRUKTUR", "INFRASTRUKTUR", "INFRASTRUKTUR", "INFRASTRUKTUR", "INFRASTRUKTUR", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "INDUSTRI", "INDUSTRI", "INDUSTRI", "INDUSTRI", "INDUSTRI", "PARIWISATA", "PARIWISATA", "PARIWISATA", "PERDAGANGAN", "DESA", "HUTAN", "HUTAN", "TEKNOLOGI", "TEKNOLOGI", "TEKNOLOGI", "TEKNOLOGI", "ANAK DAN PEREMPUAN", "KAUM MARJINAL", "KAUM MARJINAL", "UNDANG-UNDANG", "INTERNASIONAL", "KAWASAN PERBATASAN", "KAWASAN PERBATASAN"];

const data_root		= 'public/data/';

const krisna_coll	= 'krisna';
const cate_coll		= 'categories';

MongoClient.connect(db_url, (err, client) => {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	const db	= client.db(process.env.DB_DATABASE);
	async.waterfall([
		(flowCallback) => {
			[krisna_coll, cate_coll].forEach((o) => {
				console.log(o);
			});

			flowCallback();
		},
	], (err, result) => {
		assert.equal(null, err);
		client.close();
	});
});
