function getCategories(callback) {
	$.get('/api/categories', (data) => (callback(data.result)));
}

function getFilters(category, params, callback) {
	$.get('/api/filters/' + category, params, (data) => (callback(data.result)));
}

function getMaps(category, params, callback) {
	$.get('/api/maps/' + category, params, (data) => (callback(data.result)));
}

function getDetil(category, params, callback) {
	$.get('/api/detil/' + category, params, (data) => (callback(data.result)));
}

function getOutput(category, location, kabs_id, params, callback) {
	$.get('/api/output/' + category + '/' + location + (kabs_id ? ('/' + kabs_id) : ''), params, (data) => (callback(data.result)));
}

function getKementerian(category, params, callback) {
	$.get('/api/kementerian/' + category, params, (data) => (callback(data.result)));
}

function getLocation(category, params, callback) {
	$.get('/api/location/' + category, params, (data) => (callback(data.result)));
}
