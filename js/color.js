import calc from './luminance.js';
import {colorNames, colorNumbers} from './colorNames.js';

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
			clearResultsbtn = $('#clear-results'),
			clearListBtn = $('#clear-list'),
			resultsGrad = $('.result-gradient'),
			list = $('.list');

function createVisSwatch(color, L) {
	// create nodes
	const container = document.createElement('div'),
				swatch = document.createElement('div'),
				label = document.createElement('p');
	// update nodes
	container.classList.add('result');
	container.style.left = `${L}%`;
	swatch.classList.add('result-swatch');
	swatch.style.backgroundColor = color;
	label.classList.add('result-label');
	label.innerText = color;
	// add to DOM
	container.appendChild(swatch);
	container.appendChild(label);
	resultsGrad.appendChild(container);
}

function createLog(color, L) {
	//create nodes
	const swatch = document.createElement('div'),
				logTitle = document.createElement('p'),
				logMore = document.createElement('p'),
				item = document.createElement('li');
	//create color swatches
	swatch.classList.add('swatch');
	swatch.setAttribute('style', `background-color:${color}`);
	//create color label
	if (color.match(/#[0-9a-fA-F]{3}\b/)) {
		color = color.replace(/([0-9a-fA-F])/g, '$1$1');
	}
	logTitle.classList.add('color-list');
	logTitle.innerText = `${color} : ${Math.floor(L)}L*`;
	//create moreInfo
	logMore.classList.add('color-more');
	if (colorNames[color]) {
		logMore.innerText = `hex: ${colorNames[color]}`;
	} else if (colorNumbers[color]) {
		logMore.innerText = `name: ${colorNumbers[color]}`;
	}
	//add li with swatch and label
	item.appendChild(swatch);
	item.appendChild(logTitle);
	if (logMore.innerText.length) {
		item.appendChild(logMore);
	}
	list.appendChild(item);
}

function setInputDisplay(node, value) {
	let otherNode = null;
	//set other input to be equal
	if (node.id.match('picker') ) {
		otherNode = node.id.match('color') ? cText : bgText;
		otherNode.setAttribute('placeholder', value);
		otherNode.value = '';
	} else if (node.id.match('text') ) {
		otherNode = node.id.match('color') ? cPicker : bgPicker;
		otherNode.value = value;
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
	} else if (colorNames[value]) {
		// convert color name to hex
		value = colorNames[value];
	}

	//convert to [r,g,b] format
	if ( value.match(/#[0-9a-fA-F]{6}\b/) ) {
		//for hex colors
		rgb = calc.hex2rgb(value);
	} else if ( value.match(/rgba?\(\d{1,3}\,\s?\d{1,3}\,\s?\d{1,3}/) ) {
		//for rgb colors
		const color = value.match(/rgba?\((\d{1,3})\,\s?(\d{1,3})\,\s?(\d{1,3})/);
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

function changeBGColor(e) {
	const el = e.currentTarget;

	if (getLuminosity(el) === null ) {
		return throwAlert(el);
	}
	const styleEl = $('#style-updates');
	styleEl.innerText = styleEl.innerText.replace(
		/(--contrast-bg:)([#0-9a-zA-Z]*)(;)/,
		`$1${el.value}$3`
	);
}


function addColor(e) {
	const el = e.currentTarget;

	//find luminosity & place color swatches
	const L = getLuminosity(el);
	//check for invalid inputs
	if (L === null) {
		return throwAlert(el);
	}
	//create log entry with color swatch
	createVisSwatch(el.value, L);
	createLog(el.value, L);
}

//clear one section
function clear(els) {
	const results = $$(els),
				resLen = results.length;
	for (let i = 0; i < resLen; i++) {
		results[i].remove();
	}
}

function addColorByKeyPress (e) {
	if (e.keyCode === 13 || e.keyCode === 9) {
		e.preventDefault();
		addColor(e);
	}
}

//link picker and textbox, set action
cText.addEventListener('change', addColor);
bgText.addEventListener('change', changeBGColor);
// $('.submit-colors').addEventListener('click', changeColor);
//check if browser supports color input
if (Modernizr.inputtypes.color) {
	cPicker.addEventListener('keypress', addColorByKeyPress);
	bgPicker.addEventListener('change', changeBGColor);
} else {
	const pickers = [cPicker, bgPicker];
	pickers.forEach((picker) => {
		picker.remove();
	});
}
//link clear buttons
clearResultsbtn.addEventListener('click', clear.bind(this, '.result'));
clearListBtn.addEventListener('click', clear.bind(this, '.list li'));
