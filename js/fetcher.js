function getCategories(callback) {
	$.get('/api/categories', (data) => (callback(data.result)));
}

function getFilters(category, location, params, callback) {
	$.get('/api/filters/' + category + (location ? '/' + location : ''), params, (data) => (callback(data.result)));
}

function getMaps(category, params, callback) {
	$.get('/api/maps/' + category, params, (data) => (callback(data.result)));
}

function getDetil(category, location, params, callback) {
	$.get('/api/detil/' + category + '/' + location, params, (data) => (callback(data.result)));
}

function getOutput(category, location, params, callback) {
	$.get('/api/output/' + category + '/' + location, params, (data) => (callback(data.result)));
}

function getKementerian(category, params, callback) {
	$.get('/api/kementerian/' + category, params, (data) => (callback(data.result)));
}

function getLocation(category, params, callback) {
	$.get('/api/location/' + category, params, (data) => (callback(data.result)));
}
