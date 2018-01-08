let category	= '';

$( document ).ready(() => {
	$.get('/api/categories', (data) => { $( '#categories-wrapper' ).html( data.result.map((o) => ("<div class='ipd-categories float-left uppercase cursor-pointer' onclick='changeCategory(\"" + o + "\")'>" + o + "</div>")).join('') ); });

});

function changeCategory(val) {
	category	= val;
	$( '#selection' ).slideUp();
}
