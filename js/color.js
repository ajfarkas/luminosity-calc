import calc from './luminance.js';
import colorName from './colorNames.js';

function $(node) {
	return document.querySelector(node);
};
function $$(node) {
	return document.querySelectorAll(node);
};

//for invalid inputs
function throwAlert(self) {
	const p = document.createElement('p');
	p.className = 'input-alert';
	p.innerHTML = self.value.match(/[^#]\b\w+[^\d]\b/)
		? 'color names not yet supported.'
		: 'this is not a valid color format.';
	self.parentNode.appendChild(p);
}

const cPicker = $('#color-picker'),
			cText = $('#color-text'),
			bgPicker = $('#bg-picker'),
			bgText = $('#bg-text'),
			clearSVGbtn = $('#clear-svg'),
			clearListBtn = $('#clear-list'),
			svg = $('#svg-results'),
			list = $('.list');

function createVisSwatch(color, L) {
	//create nodes
	const nsURI = 'http://www.w3.org/2000/svg';
	const g = document.createElementNS(nsURI, 'g');
	const rect = document.createElementNS(nsURI, 'rect');
	const text = document.createElementNS(nsURI, 'text');

	//add attributes, etc.
	g.setAttribute('class', 'result '+ color.replace(/\s|[,.-]/g, ''));
	//create swatches
	rect.setAttribute('x', L);
	rect.setAttribute('y', '2.6');
	rect.setAttribute('width', '.6');
	rect.setAttribute('height', '5');
	rect.setAttribute('fill', color);
	//add text labels to swatches
	text.setAttribute('y', L);
	text.setAttribute('x', '-8.4');
	text.setAttribute('dy', '.7');
	text.setAttribute('transform', 'rotate(-90)');
	text.setAttribute('text-anchor', 'end');
	text.textContent = color;

	//add to SVG
	g.appendChild(rect);
	g.appendChild(text);
	svg.appendChild(g);
}

function createLog(color, L) {
	//create nodes
	const swatch = document.createElement('div');
	const p = document.createElement('p');
	const item = document.createElement('li');
	//create color swatches
	swatch.setAttribute('class', 'swatch');
	swatch.setAttribute('style', 'background-color:'+color);
	//create color label
	p.setAttribute('class', 'color-list');
	p.innerHTML = color+' : '+Math.floor(L)+'L*';
	//add li with swatch and label
	item.appendChild(swatch);
	item.appendChild(p);
	list.appendChild(item);
}

function changeColor() {
	const self = this;
	let that = undefined;
	//find paired input
	if (self === cPicker) {
		that = cText;
	}	else if (self === cText) {
		that = cPicker;
	}	else if (self === bgPicker) {
		that = bgText;
	}	else if (self === bgText) {
		that = bgPicker;
	}

	function setInputDisplay(node, value) {
		//set other input to be equal
		if (node.id.match('picker') ) {
			that.setAttribute('placeholder', value);
			that.value = '';
		} else if (node.id.match('text') ) {
			that.value = value;
		}
	}

	function getLuminosity(node) {
		let rgb = undefined,
				value = node.value;

		if ( $('.input-alert') ) {
			$('.input-alert').remove();
		};
		
		if ( value.match(/#[0-9a-fA-F]{3}\b/) ) {
			// convert 3-byte hex to 6-byte
			value = '#' + value.replace('#', '').split('').map(h => h+h).join('');
		} else if (colorName[value]) {
			// convert color name to hex
			value = colorName[value];
		}

		//convert to [r,g,b] format
		if ( value.match(/#[0-9a-fA-F]{6}/) ) {
			//for hex colors
			rgb = calc.hex2rgb(value);
		} else if ( value.match(/rgba?\(\d{1,3}\,\s?\d{1,3}\,\s?\d{1,3}/) ) {
			//for rgb colors
			const color = node.value.match(/rgba?\((\d{1,3})\,\s?(\d{1,3})\,\s?(\d{1,3})/);
			rgb = [+color[1], +color[2], +color[3]];
			node.value = calc.rgb2hex(rgb);
		}
		//if user input is valid
		if (rgb) {
			//match color picker and text
			setInputDisplay(node, calc.rgb2hex(rgb));
			//return calculated luminosity
			return calc.rgb2Lab(rgb)[0];
		}
		return null;
	} 

	if (self === bgPicker || self === bgText) {
		if (getLuminosity(self) === null ) {
			return throwAlert(self);
		}
		$('#results-bg').setAttribute('fill', self.value);
	} else if (self === cPicker || self === cText) {
		//find luminosity & place color swatches
		const L = getLuminosity(self);
		//check for invalid inputs
		if (L === null) {
			return throwAlert(self);
		}
		//create log entry with color swatch
		createVisSwatch(self.value, L);
		createLog(self.value, L);
	}

	
}

//clear one section
function clear(els) {
	const results = $$(els),
				resLen = results.length;
	for (let i = 0; i < resLen; i++) {
		results[i].remove();
	}
}

//prevent page reload
cText.addEventListener('keypress', (e) => { 
	if (e.keyCode === 13 || e.keyCode === 9) {
		e.preventDefault();
		changeColor.call(this);
	}
});
//link picker and textbox, set action
cText.addEventListener('change', changeColor);
bgText.addEventListener('change', changeColor);
//check if browser supports color input
if (Modernizr.inputtypes.color) {
	cPicker.addEventListener('change', changeColor);
	bgPicker.addEventListener('change', changeColor);
} else {
	const pickers = [cPicker, bgPicker];
	pickers.forEach((picker) => {
		// //create color swatch
		// var pSwatch = document.createElement('div')
		// pSwatch.setAttribute('class', 'swatch')
		// pSwatch.setAttribute('style', 'background-color:white;border:2px solid gray')
		// //replace inputs
		// picker.parentNode.insertBefore(pSwatch, picker)
		picker.remove();
	});
}
//link clear buttons
clearSVGbtn.addEventListener('click', clear.bind(this, '.result'));
clearListBtn.addEventListener('click', clear.bind(this, '.list li'));
