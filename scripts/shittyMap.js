const csv			= require('fast-csv');
const _				= require('lodash');
const fs 			= require('fs');
const async 		= require('async');

const params		= { headers: true, strictColumnHandling: true, trim: true, quote: "'", delimiter: ',' };

const init_root		= './public/data/initial/';

let result_regy		= [];
let result_prov		= [
	{ used_id: 100, krisna_id: 00, name: 'Pusat' },
	{ used_id: 101, krisna_id: null, name: 'Luar Negeri' },
];

const byPass		= ['Afrika', 'Amerika Selatan', 'Amerika Utara', 'Asia Pasifik', 'Asia Tenggara', 'Asia Tengah Dan Timur', 'Eropa Barat', 'Timur Tengah', 'Pusat'];

const rewrite_prov	= {
	'kepulauan bangka beli': 'kepulauan bangka belitung',
};
const rewrite_regy	= {
	'mamuju tengah': 'mamuju',
	'bireun': 'bireuen',
	'gunung sitoli': 'kota gunungsitoli',
	'labuhanbatu': 'labuhan batu',
	'tulang bawang': 'tulangbawang',
	'malaka': 'belu',
	'buton tengah': 'buton',
	'pulau buru': 'buru',
	'dharmas raya': 'dharmasraya',
	'fak fak': 'fakfak',
	'pulau taliabu': 'kepulauan sula',
	'pangkajene kepulauan': 'pangkajene dan kepulauan',
	'mahakam ulu': 'kutai barat',
	'morowali utara': 'morowali',
	'simeuleu': 'simeulue',
	'deliserdang': 'deli serdang',
	'musi banyu asin': 'musi banyuasin',
	'pesisir barat': 'lampung barat',
	'gunungkidul': 'gunung kidul',
	'tanatoraja': 'tana toraja',
	'kolaka timur': 'kolaka',
	'oku timur': 'ogan komering ulu timur',
	'oku selatan': 'ogan komering ulu selatan',
	'muko-muko': 'mukomuko',
	'kotabaru': 'kota baru',
	'aceh gayo lues': 'gayo lues',
	'musi rawas utara': 'musi rawas',
	'pakpak barat': 'pakpak bharat',
	'kutai kertanegara': 'kutai kartanegara',
	'limapuluh kota': 'lima puluh kota',
	'batubara': 'batu bara',
	'banyuasin': 'banyu asin',
	'pangandaran': 'ciamis',
	'kulonprogo': 'kulon progo',
	'yogyakarta': 'kota yogyakarta',
	'medan': 'kota medan',
	'banjarbaru': 'banjar baru',
	'sumbulussalam': 'subulussalam',
	'batanghari': 'batang hari',
	'pare-pare': 'parepare',
	'biak-numfor': 'biak numfor',
	'pekanbaru': 'kota pekanbaru',
	'konawe kepulauan': 'konawe',
	'anambas': 'kepulauan anambas',
	'manokwari selatan': 'manokwari',
	'palangkaraya': 'palangka raya',
	'kep. siau tagulandang biaro': 'siau tagulandang biaro',
	'kutai': 'kutai kartanegara',
	'tenggarong': 'kutai kartanegara',
	'negara': 'jembrana',
	'limboto': 'gorontalo',
	'tidore': 'tidore kepulauan',
	'tanjung pinang': 'tanjungpinang',
	'batam': 'kota batam',
	'timor': 'timor tengah selatan',
	'pegunungan arfak': 'manokwari',
	'binjai': 'kota binjai',
	'banggai laut': 'banggai kepulauan',
	'jambi': 'kota jambi',
	'kotamobago': 'kotamobagu',
	'buton selatan': 'buton',
	'padang sidempuan': 'kota padangsidimpuan',
	'payakumbuh': 'kota payakumbuh',
	'tanjungbalai': 'kota tanjung balai',
	'muna barat': 'muna',
	'penukal abab lematang ilir': 'muara enim',
	'lubuk linggau': 'lubuklinggau',
	'meulaboh': 'aceh barat',
	'sidi kalang': 'dairi',
	'lubuk pakam': 'deli serdang',
	'kep.sangihe talaud': 'kepulauan sangihe',
	'kota. kupang': 'kota kupang',
	'kota. gorontalo': 'kota gorontalo',
	'kota. sorong': 'kota sorong',
};

async.waterfall([
	(flowCallback) => {
		async.map(['provinces', 'regencies'], (o, eachCallback) => {
			let column_id	= o == 'regencies' ? 'regency_id' : 'province_id';
			let column_name	= o == 'regencies' ? 'regency_name' : 'province_name';

			let data	= [];
			csv
				.fromPath(init_root + o + '.csv', params)
				.on("data", (row) => {
					data.push([_.toLower(row[column_name]), row[column_id]]);
				})
				.on("end", () => eachCallback(null, [o, _.fromPairs(data)]));

		}, (err, results) => flowCallback(err, _.fromPairs(results)));
	},
	(init_data, flowCallback) => {
		let data	= { provinces: {}, regencies: {} };
		csv
			.fromPath(init_root + 'krisna_prov.csv', _.assign({}, params, { delimiter: ';' }))
			.on('data', (row) => {
				let nm_kota	= row.Kota.toLowerCase().replace('kab. ', '').replace('kota ', '');
				let nm_prov	= row.provinsi.toLowerCase().replace('provinsi ', '');

				if (!_.includes(byPass, row.provinsi)) {
					if (!_.chain(data.provinces).keys().includes(nm_prov).value()) { data.provinces[nm_prov] = row.kd_prov; }
					if (!_.chain(data.regencies).keys().includes(nm_kota).value() && !_.includes(nm_kota, 'provinsi')) { data.regencies[nm_kota] = row.kd_kota; }
				}
			}).on("end", () => flowCallback(null, init_data, data))
	},
	(init_data, krisna_data, flowCallback) => {
		_.forEach(krisna_data.provinces, (o, key) => {
			let name	= _.includes(_.keys(rewrite_prov), key) ? rewrite_prov[key] : key;

			result_prov.push({ used_id: init_data.provinces[name], krisna_id: o, name: name.replace(/\b\w/g, l => l.toUpperCase()) })
		});

		_.forEach(krisna_data.regencies, (o, key) => {
			let name	= _.includes(_.keys(rewrite_regy), key) ? rewrite_regy[key] : key;

			if (init_data.regencies[name]) { result_regy.push({ used_id: init_data.regencies[name], krisna_id: o, name: name.replace(/\b\w/g, l => l.toUpperCase()) }) }
		});

		flowCallback();
	}
], (err) => {
	async.each(['provinces', 'regencies'], (o, eachCallback) => {
		csv
			.writeToPath(init_root + 'mapped-' + o + '.csv', _.sortBy(o == 'provinces' ? result_prov : result_regy, 'used_id'), { headers: true })
			.on("finish", () => eachCallback());

	}, (err) => { if (err) throw err; });
});
