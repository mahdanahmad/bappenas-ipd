function getCategories(callback) {
	$.get('/api/categories', (data) => (callback(data.result)));
}

function getFilters(category, params, callback) {
	$.get('/api/filters/' + category, _.assign(params, { shit }), (data) => (callback(data.result)));
}

function getMaps(category, params, callback) {
	$.get('/api/maps/' + category, _.assign(params, { shit }), (data) => (callback(data.result)));
}

function getDetil(category, params, callback) {
	$.get('/api/detil/' + category, _.assign(params, { shit }), (data) => (callback(data.result)));
}

function getOutput(category, location, kabs_id, params, callback) {
	$.get('/api/output/' + category + '/' + location + (kabs_id ? ('/' + kabs_id) : ''), _.assign(params, { shit }), (data) => (callback(data.result)));
}

function getKementerian(category, params, callback) {
	$.get('/api/kementerian/' + category, _.assign(params, { shit }), (data) => (callback(data.result)));
}

function getLocation(category, params, callback) {
	$.get('/api/location/' + category, _.assign(params, { shit }), (data) => (callback(data.result)));
}
