function around(first, second) {
	const forgivable	= 5;

	return (first >= (second - forgivable) && first <= (second + forgivable));
}
