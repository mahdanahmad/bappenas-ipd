function around(first, second) {
	const forgivable	= 5;

	return (first >= (second - forgivable) && first <= (second + forgivable));
}

function nFormatter(num) {
	let digits	= 2;
	let standar = [
		{ value: 1, symbol: "" },
		{ value: 1E3, symbol: "ribu" },
		{ value: 1E6, symbol: "juta" },
		{ value: 1E9, symbol: "milyar" },
		{ value: 1E12, symbol: "triliun" },
		{ value: 1E15, symbol: "kuadriliun" },
		{ value: 1E18, symbol: "kuantiliun" }
	];
	let re = /\.0+$|(\.[0-9]*[1-9])0+$/;
	let i;
	for (i = standar.length - 1; i > 0; i--) { if (num >= standar[i].value) { break; } }
	return (num / standar[i].value).toFixed(digits).replace(re, "$1") + ' ' + standar[i].symbol;
}
