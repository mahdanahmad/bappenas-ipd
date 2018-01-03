require('dotenv').config();

const csv			= require('fast-csv');
const _				= require('lodash');
const async 		= require('async');
const assert 		= require('assert');

const MongoClient	= require('mongodb').MongoClient;
const auth			= (process.env.DB_USERNAME !== '' || process.env.DB_PASSWORD !== '') ? process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' : '';
const db_url		= 'mongodb://' + auth + process.env.DB_HOST + ':' + process.env.DB_PORT;

const params		= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' }

const janpres		= ["PANGAN", "PANGAN", "PANGAN", "PANGAN", "PANGAN", "PANGAN", "PANGAN", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "ENERGI", "INFRASTRUKTUR", "INFRASTRUKTUR", "INFRASTRUKTUR", "INFRASTRUKTUR", "INFRASTRUKTUR", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "MARITIM", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "KESEHATAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "PENDIDIKAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "KEMISKINAN", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "REFORMASI BIROKRASI", "INDUSTRI", "INDUSTRI", "INDUSTRI", "INDUSTRI", "INDUSTRI", "PARIWISATA", "PARIWISATA", "PARIWISATA", "PERDAGANGAN", "DESA", "HUTAN", "HUTAN", "TEKNOLOGI", "TEKNOLOGI", "TEKNOLOGI", "TEKNOLOGI", "ANAK DAN PEREMPUAN", "KAUM MARJINAL", "KAUM MARJINAL", "UNDANG-UNDANG", "INTERNASIONAL", "KAWASAN PERBATASAN", "KAWASAN PERBATASAN"];

const krisna_coll	= 'krisna';

let data			= [];

csv
	.fromPath("public/raw.csv", params)
	.on("data", (row) => {
		let parsed	= _.chain(row)
						.omit(['no', 'alokasi'])
						.flatMap((o, key) => {
							let val = (key !== 'tematik') ? o.split('-').map(_.trim) : _.chain(o).split(',').flatMap((d) => (d.split('-').map(_.trim))).reduce((result, d, i) => { let value = (i % 2 == 0 ? 0 : 1); (result[value] || (result[value] = [])).push(d); return result; }, []).map((d) => d.join(' | ')).value();
							return [[key + '_kode', (val[0] || '')], [key + '_nomen', (val[1] || '')]];
						})
						.fromPairs()
						.value();
		parsed.janpres_group	= (parsed.janpres_kode !== '' ? janpres[parseInt(parsed.janpres_kode) + 1] : '');

		data.push(_.assign({ no: row.no }, parsed, { alokasi: parseInt(row.alokasi) }));
	})
	.on("end", () => {
		// csv.writeToPath("public/data.csv", data, { headers: true }).on("finish", () => { console.log("done!"); });

		MongoClient.connect(db_url, (err, client) => {
			assert.equal(null, err);
			console.log("Connected correctly to server");

			const db	= client.db(process.env.DB_DATABASE);
			async.waterfall([
				(flowCallback) => {
					db.collection(krisna_coll).drop((err, result) => flowCallback(err));
				},
				(flowCallback) => {
					db.collection(krisna_coll).insertMany(data, (err, result) => flowCallback(err));
				},
			], (err, result) => {
				assert.equal(null, err);
				client.close();
			});
		});
	});
