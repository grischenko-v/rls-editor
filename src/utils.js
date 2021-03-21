function getBezierBasis(i, n, t) {
	function f(n) {
		return (n <= 1) ? 1 : n * f(n - 1);
	}

	return (f(n)/(f(i)*f(n - i)))* Math.pow(t, i)*Math.pow(1 - t, n - i);
}

export function getBezierCurve(arr, step) {
	if (step === undefined) {
		step = 0.01;
	}

	if(arr.length < 2) {
		return [];
	}

	var res = new Array()

	for (var t = 0; t < 1 + step; t += step) {
		if (t > 1) {
			t = 1;
		}

		var ind = res.length;

		res[ind] = new Array(0, 0);

		for (var i = 0; i < arr.length; i++) {
			var b = getBezierBasis(i, arr.length - 1, t);

			res[ind][0] += arr[i][0] * b;
			res[ind][1] += arr[i][1] * b;
		}
	}

	return res;
}


export function globalToMap (projection, position, mapObject) {
	return projection.fromGlobalPixels(mapObject.converter.pageToGlobal([position.x, position.y]),
		mapObject.getZoom());
}

export const removeByIndex = (arr, index) => {
	const copy = [...arr];
	copy.splice(index, 1);
	return copy;
}