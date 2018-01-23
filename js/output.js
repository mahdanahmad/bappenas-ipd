function constructAdditionTable(data) {
	return (data || []).map((o) => (
		'<tr id="' + o._id + '" onclick="toggleOutput(\'' + o._id + '\', ' + o.anggaran + ')" class="cursor-pointer">' +
			['kegiatan', 'output', 'kl', 'anggaran'].map((key) => ('<td class="table-' + key + '">' + (key == 'anggaran' ? nFormatter(o[key]) : o[key]) + '</td>')).join() +
		'</tr>'
	)).join('');
}

function appendAdditionTable(kabs_id) {
	let params	= _.omitBy({ page, kementerian }, _.isNil);
	if (activeFilter) { params.filters = JSON.stringify(activeFilter); }
	let search	= $( '#detil-content > #detil-header > #search-wrapper > input' ).val();
	if (search !== '') { params.like = search; }

	getOutput(category, centered, kabs_id, params, (data) => {
		page	= data.iteratee;
		$('#detil-wrapper > table > tbody').append(constructAdditionTable(data.data));
	});
}

function toggleOutput(id, anggaran) {
	if ($( '#' + id ).hasClass('selected') || _.isNil(id)) {
		$( '#search-wrapper' ).show();
		backState	= 'peta';

		$( '#detil-wrapper' ).addClass('forced-height');
		$( '#detil-wrapper > table > tbody tr' ).removeClass('hidden selected');

		d3.select("#progress-wrapper > #svg-wrapper").selectAll("svg").remove();

	} else {
		$( '#search-wrapper' ).hide();
		backState	= 'daftar';

		let komponen	= _.random(5);
		let multiplier	= _.random(.8, 1.1);

		$( '#diff-anggaran > span' ).text(nFormatter(anggaran));
		$( '#diff-realisasi > span' ).text(komponen ? nFormatter(anggaran * multiplier) : '-');
		$( '#diff-selisih > span' ).text(komponen ? (multiplier > 1 ? '-' : '+') + nFormatter(anggaran * Math.abs(1 - multiplier)) : '-');

		_.times(komponen, (o) => { createProgress(o + 1, true); });

		$( '#' + id ).addClass('selected');
		$( '#detil-wrapper' ).removeClass('forced-height');
		$( '#detil-wrapper > table > tbody tr:not(#' + id + ')' ).addClass('hidden');
	}

	$( '#backtomap > span' ).text(backState);
}
