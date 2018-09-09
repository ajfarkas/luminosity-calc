const xyzLabCalc = (t) => {
	if (t > 0.008856) {
		return Math.pow(t, 1/3);
	} else {
		return 7.787 * t + 16/116;
	}
};
//calculations and conversions
const calc = {
	/* convert '#hexstr' to [r, g, b]
	 * @param {String} hex: String in hexadecimal format with 6 bytes
	 * @returns {Array} of 3 rgb values
	*/
	'hex2rgb' : (hex) => {
		hex = hex.replace('#', '');
		const hRGB = [hex.substr(0,2), hex.substr(2,2), hex.substr(4,2)];

		return hRGB.map((h) => parseInt(h, 16));
	},

	/* convert [r,g,b] to hex str
	 * @param {Array} rgb: array of 3 values, 0-255
	 * @returns {String} representing hexadecimal value of r,g,b
	*/
	'rgb2hex': (rgb) => {
		let result = '#';
		rgb.forEach((num) => {
			const hex = num.toString(16);
			//add leading zero, if necessary
			result += ('0' + hex).substr(-2);
		});
		return result;
	},

	/* input color as 3-element array [r, g, b]
	 * @param {Array} color: array of 3 (r,g,b) values, 0-255
	 * @returns {Array} of 3 values in xyz format
	*/
	'rgb2xyz': (color) => {
		const colorArr = [color[0]/255, color[1]/255, color[2]/255];
		const xyz = [0, 0, 0],
					matrix = [[0.412453, 0.357580, 0.180423],
										[0.212671, 0.715160, 0.072169],
										[0.019334, 0.119193, 0.950227]];
				
		matrix.forEach((row, i) => {
			row.forEach((cell, j) => {
				xyz[i] += colorArr[j] * cell * 100;
			});
		});

		return xyz;
	},

	/* input color as 3-element array [x, y, z]
	 * @param {Array} color: array of 3 (x,y,z) values
	 * @returns {Array} of 3 rgb values
	*/
	'xyz2rgb': (color) => {
		const rgb = [0, 0, 0],
					matrix = [[3.240479, -1.537150, -0.498535],
										[-0.969256, 1.875992, 0.041556],
										[0.055648, -0.204043, 1.057311]];

		matrix.forEach((row, i) => {
			row.forEach((cell, j) => {
				rgb[i] += Math.round(color[j] * cell) * 2.55;
			});
		});

		return rgb;
	},

	/* input color as 3-element array [x, y, z]
	 * @param {Array} color: array of 3 (x,y,z) values
	 * @returns {Array} of 3 L*a*b values
	*/
	'xyz2Lab': (color) => {
		const d65 = [95.0456, 100, 108.8754],
					//find X/Xn, Y/Yn, Z/Zn
					xyzN = color.map((d, i) => d/d65[i]);
		let [L, a, b] = [];

		if (xyzN[1] > 0.008856) {
			L = 116 * Math.pow(xyzN[1], 1/3) - 16;
		} else {
			L = 903.3 * xyzN[1];
		}

		a = 500 * ( xyzLabCalc(xyzN[0]) - xyzLabCalc(xyzN[1]) );
		b = 200 * ( xyzLabCalc(xyzN[1]) - xyzLabCalc(xyzN[2]) );

		return [L, a, b];
	},

	/* input color as 3-element array [L, a, b]
	 * @param {Array} color: array of 3 L*a*b values
	 * @returns {Array} of 3 values in xyz format
	*/
	'lab2xyz': (color) => {
		const d65 = [95.0456, 100, 108.8754],
					p = (color[0] + 16) / 116;
		let [x, y, z] = [];

		x = d65[0] * Math.pow(p + color[1] / 500, 3);
		y = d65[1] * Math.pow(p, 3);
		z = d65[2] * Math.pow(p - color[2] / 200, 3);
		// check for development error
		if (y/d65[1] <= 0.008856) {
			return console.error('ERR! Y/Yn below min ('+y/d65[1]+')');
		}
		return [x, y, z];
	},
	/*
	 * @param {Array} color: array of 3 values, 0-255
	 * @returns {Array} of 3 L*a*b values
	*/
	'rgb2Lab': (color) => {
		return calc.xyz2Lab(calc.rgb2xyz(color));
	},
	/*
	 * @param {Array} color: array of 3 L*a*b values
	 * @returns {Array} of 3 rgb values
	*/
	'lab2rgb': (color) => {
		return calc.xyz2rgb(calc.lab2xyz(color));
	}
};

export default calc;