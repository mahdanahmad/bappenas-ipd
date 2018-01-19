require('dotenv').config();

const _				= require('lodash');
const async 		= require('async');
const assert 		= require('assert');

const MongoClient	= require('mongodb').MongoClient;
const auth			= (process.env.DB_USERNAME !== '' || process.env.DB_PASSWORD !== '') ? process.env.DB_USERNAME + ':' + process.env.DB_PASSWORD + '@' : '';
const db_url		= 'mongodb://' + auth + process.env.DB_HOST + ':' + process.env.DB_PORT;

const palette		= [
	'#F98866','#FF420E','#80BD9E','#89DA59',
	'#98DBC6','#5BC8AC','#E6D72A','#F18D9E',
	'#F1F1F2','#BCBABE','#A1D6E2','#1995AD',
	'#9A9EAB','#5D5353','#EC96A4','#DFE166',
	'#A1BE95','#E2DFA2','#92AAC7','#ED5752'
];

const colors_coll	= 'categories';

MongoClient.connect(db_url, (err, client) => {
	assert.equal(null, err);
	console.log("Connected correctly to server");

	const db	= client.db(process.env.DB_DATABASE);
	async.waterfall([
		(flowCallback) => {
			db.collection('categories').find({}).toArray((err, result) => flowCallback(err, result));
		},
		(filters, flowCallback) => {
			async.map(filters, (o, eachcallback) => {
				let name	= o.name;
				let avail	= _.chain(o.filters).map('NOMENKLATUR').uniq().value();

				eachcallback(null, { name, colors: _.chain(avail).map((o, i) => ([o, palette[i]])).fromPairs().value() });
			}, (err, result) => flowCallback(err, result));
		},
		(colored, flowCallback) => {
			async.each(colored, (o, eachcallback) => {
				db.collection(colors_coll).update({ name: o.name }, { '$set': { colors: o.colors } }, {}, (err, result) => eachcallback(err) );
			}, (err) => flowCallback(err));
		},
	], (err, result) => {
		assert.equal(null, err);
		client.close();
	});
});
