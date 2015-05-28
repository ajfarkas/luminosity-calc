var $ = function(node) { return document.querySelector(node) },
    $$ = function(node) { return document.querySelectorAll(node) },
    cPicker = $('#color-picker'),
    cText = $('#color-text'),
    bgPicker = $('#bg-picker'),
    bgText = $('#bg-text'),
    clearSVGbtn = $('#clear-svg'),
    clearListBtn = $('#clear-list'),
    svg = $('#svg-results'),
    list = $('.list')

//prevent page reload
cText.addEventListener('keypress', function(e) { 
  if (e.keyCode == 13 || e.keyCode == 9) {
    e.preventDefault()
    changeColor.call(this)
  }
})
//link picker and textbox, set action
cText.addEventListener('change', changeColor)
cPicker.addEventListener('change', changeColor)
bgText.addEventListener('change', changeColor)
bgPicker.addEventListener('change', changeColor)

clearSVGbtn.addEventListener('click', clear.bind(this, '.result'))
clearListBtn.addEventListener('click', clear.bind(this, '.list li'))

function changeColor() {
  var self = this,
      that
  if (self == cPicker) that = cText
  else if (self == cText) that = cPicker
  else if (self == bgPicker) that = bgText
  else if (self == bgText) that = bgPicker
  
  function setInputDisplay(node, value) {
    //set other input to be equal
    if (node.id.match('picker') ) {
      that.setAttribute('placeholder', value)
      that.value = ''
    }
    else if (node.id.match('text') )
      that.value = value
  }

  function getLuminosity(node) {
    if ($('.input-alert') ) $('.input-alert').remove()
    //convert to [r,g,b] format
    //for hex colors
    if (node.value.match(/#[0-9a-fA-F]{6}/) ) {      
      var rgb = calc.hex2rgb(node.value)
    }
    //for rgb colors
    else if(node.value.match(/rgba?\(\d{1,3}\,\s?\d{1,3}\,\s?\d{1,3}/) ) {
      var color = node.value.match(/rgba?\((\d{1,3})\,\s?(\d{1,3})\,\s?(\d{1,3})/),
          rgb = [+color[1], +color[2], +color[3]]
      node.value = calc.rgb2hex(rgb)
    }
    if (rgb) {
      setInputDisplay(node, calc.rgb2hex(rgb))
      return calc.rgb2Lab(rgb)[0]
    }
    else return null
  } 

  if (self == bgPicker || self == bgText) {
    if (getLuminosity(self) == undefined ) return throwAlert()
    $('#results-bg').setAttribute('fill', self.value)
  }
  //find luminosity & place color swatches
  else if (self == cPicker || self == cText) {
    var L = getLuminosity(self)

    if (L == undefined) return throwAlert()

    createVisSwatch(self.value, L)
    createLog(self.value, L)
  }

  function createVisSwatch(color, L) {
    //create nodes
    var nsURI = 'http://www.w3.org/2000/svg'
    var g = document.createElementNS(nsURI, 'g')
    var rect = document.createElementNS(nsURI, 'rect')
    var text = document.createElementNS(nsURI, 'text')

    //add attributes, etc.
    g.setAttribute('class', 'result '+ color.replace(/\s|[,.-]/g, ''))
    //create swatches
    rect.setAttribute('x', L)
    rect.setAttribute('y', '2.6')
    rect.setAttribute('width', '.6')
    rect.setAttribute('height', '5')
    rect.setAttribute('fill', color)
    //add text labels to swatches
    text.setAttribute('y', L)
    text.setAttribute('x', '-8.4')
    text.setAttribute('dy', '.7')
    text.setAttribute('transform', 'rotate(-90)')
    text.setAttribute('text-anchor', 'end')
    text.innerHTML = color

    //add to SVG
    g.appendChild(rect)
    g.appendChild(text)
    svg.appendChild(g)
  }
  
  function createLog(color, L) {
    //create nodes
    var swatch = document.createElement('div')
    var p = document.createElement('p')
    var item = document.createElement('li')
    //create color swatches
    swatch.setAttribute('class', 'swatch')
    swatch.setAttribute('style', 'background-color:'+color)
    //create color label
    p.setAttribute('class', 'color-list')
    p.innerHTML = color+' : '+Math.floor(L)+'L*'
    //add li with swatch and label
    item.appendChild(swatch)
    item.appendChild(p)
    list.appendChild(item)
  }

  //for invalid inputs
  function throwAlert() {
    var p = document.createElement('p')
    p.className = 'input-alert'
    p.innerHTML = self.value.match(/[^#]\b\w+[^\d]\b/)
      ? 'color names not yet supported.'
      : 'this is not a valid color format.'
    self.parentNode.appendChild(p) 
  }

}

function clear(els) {
  var results = $$(els),
      resLen = results.length
  for (var i = 0; i < resLen; i++) {
    results[i].remove()
  }
}

var calc = {
  //convert '#hexstr' to [r, g, b]
  'hex2rgb' : function(hex) {
    hex = hex.replace('#', '')
    var hRGB = [hex.substr(0,2), hex.substr(2,2), hex.substr(4,2)],
        rgb = []

    hRGB.forEach(function(h, i) {
      rgb[i] = parseInt(h, 16)
    })
    return rgb
  },

  //convert [r,g,b] to hex str
  'rgb2hex': function(rgb) {
    var zeroHex = '0',
        result = '#'
    rgb.forEach(function(num) {
      var hex = num.toString(16)
      //add leading zero, if necessary
      result += (zeroHex + hex).substr(-2)
    })
    return result
  },

  //input color as 3-element array [r, g, b]
  'rgb2xyz': function(color) {
    color = [color[0]/255, color[1]/255, color[2]/255]
    var xyz = [0, 0, 0],
        matrix = [[0.412453, 0.357580, 0.180423],
                  [0.212671, 0.715160, 0.072169],
                  [0.019334, 0.119193, 0.950227]]
        
    matrix.forEach(function(row, i) {
      row.forEach(function(cell, j) {
        xyz[i] += color[j] * cell * 100
      })
    })

    return xyz
  },

  //input color as 3-element array [x, y, z]
  'xyz2rgb': function(color) {
    var rgb = [0, 0, 0],
        matrix = [[3.240479, -1.537150, -0.498535],
                  [-0.969256, 1.875992, 0.041556],
                  [0.055648, -0.204043, 1.057311]]

    matrix.forEach(function(row, i) {
      row.forEach(function(cell, j) {
        rgb[i] += Math.round(color[j] * cell) * 2.55
      })
    })

    return rgb
  },

  //input color as 3-element array [x, y, z]
  'xyz2Lab': function(color) {
    var d65 = [95.0456, 100, 108.8754],
        xyzN = [], 
        L, a, b
    //find X/Xn, Y/Yn, Z/Zn
    color.forEach(function(d, i) {
      xyzN[i] = d/d65[i]
    })

    var f = function(t) {
      if (t > 0.008856)
        return Math.pow(t, 1/3)
      else
        return 7.787 * t + 16/116
    }

    if (xyzN[1] > 0.008856)
      L = 116 * Math.pow(xyzN[1], 1/3) - 16
    else
      L = 903.3 * xyzN[1]

    a = 500 * ( f(xyzN[0]) - f(xyzN[1]) )
    b = 200 * ( f(xyzN[1]) - f(xyzN[2]) )

    return [L, a, b]
  },

  //input color as 3-element array [L, a, b]
  'lab2xyz': function(color) {
    var d65 = [95.0456, 100, 108.8754],
        p = (color[0] + 16) / 116,
        x, y, z

    x = d65[0] * Math.pow(p + color[1] / 500, 3)
    y = d65[1] * Math.pow(p, 3)
    z = d65[2] * Math.pow(p - color[2] / 200, 3)

    if (y/d65[1] <= 0.008856) return console.error('ERR! Y/Yn below min ('+y/d65[1]+')')
    return [x, y, z]
  },

  'rgb2Lab': function(color) {
    return this.xyz2Lab(this.rgb2xyz(color))
  },

  'lab2rgb': function(color) {
    return this.xyz2rgb(this.lab2xyz(color))
  }

}

