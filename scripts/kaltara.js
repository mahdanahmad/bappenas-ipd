const fs		= require('fs');
const _			= require('lodash');

const file		= './public/json/kabupaten.geojson';

let data		= JSON.parse(fs.readFileSync(file));

let problemo	= {
	'MALINAU': '6501',
	'BULUNGAN': '6502',
	'NUNUKAN': '6503',
	'TANA TIDUNG': '6504',
	'TARAKAN': '6571',
}

_.chain(data).get('features', []).filter((o) => (_.includes(_.keys(problemo), o.properties.nm_kabkota))).forEach((o) => {
	// console.log(o);
	_.set(o, 'properties.id_provinsi', '65');
	_.set(o, 'properties.nm_provinsi', 'Kalimantan Utara');
	_.set(o, 'properties.id_kabkota', problemo[o.properties.nm_kabkota]);
}).value();

fs.writeFileSync(file, JSON.stringify(data));
