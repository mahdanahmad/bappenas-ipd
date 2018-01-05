require('dotenv').config();

const csv			= require('fast-csv');
const _				= require('lodash');
const fs 			= require('fs');
const async 		= require('async');

const params		= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ';' };

const data_root		= 'public/data/';

let data			= [];
csv
	.fromPath(data_root + "raw.csv", params)
	.on("data", (row) => {
		data.push(_.pick(row, ['provinsi', 'alokasi']));
	})
	.on("end", () => {
		let formatted = _.chain(data).groupBy('provinsi').map((o, key) => ({ prov: key, total: o.length, alokasi: _.sumBy(o, (d) => parseInt(d.alokasi)) })).value();
		csv.writeToPath(data_root + "prov.csv", formatted, { headers: true }).on("finish", () => { console.log("done!"); });
	});
