$( document ).ready(() => {
	$.get('/api/categories', (data) => { $( '#categories-wrapper' ).html( data.result.map((o) => ("<div class='ipd-categories float-left uppercase cursor-pointer'>" + o + "</div>")).join('') ); });
});
