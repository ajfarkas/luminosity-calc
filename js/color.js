var $ = function(node) { return document.querySelector(node) },
    $$ = function(node) { return document.querySelectorAll(node) },
    cPicker = $('#color-picker'),
    cText = $('#color-text'),
    svg = $('#svg-results')

//prevent page reload
cText.addEventListener('keypress', function(e) { 
  if (e.keyCode == 13) {
    e.preventDefault()
    getLuminosity.call(this)
  }
})
//link picker and textbox, set action
cText.addEventListener('change', getLuminosity)
cPicker.addEventListener('change', getLuminosity)

function getLuminosity() {
  if (this == cPicker) 
    var that = cText
  else if (this == cText)
    var that = cPicker
  //set other input to be equal
  that.value = this.value

  //find luminosity
  var L
  //convert to [r,g,b] format
  //for hex colors
  if (this.value.match(/#?[0-9a-fA-F]{6}/) ) {
    //remove any outstanding alerts
    if ($('.input-alert') ) $('.input-alert').remove()
    var color = calc.hex2rgb(this.value)
    L = calc.rgb2Lab(color)[0]
  }
  //for rgb colors
  else if(this.value.match(/rgba?\(\d{1,3}\,\s?\d{1,3}\,\s?\d{1,3}/) ) {
    //remove any outstanding alerts
    if ($('.input-alert') ) $('.input-alert').remove()
    var color = this.value.match(/rgba?\((\d{1,3})\,\s?(\d{1,3})\,\s?(\d{1,3})/),
        rgb = [color[1], color[2], color[3]]
    L = calc.rgb2Lab(rgb)[0]
  }
  //for color names
  else {
    if (!$('.input-alert') ) {
      var p = document.createElement('p')
      p.className = 'input-alert'
      p.innerHTML = this.value.match(/[^#]\b\w+\b/)
        ? 'color names not yet supported.'
        : 'this is not a valid color format.'
      $('#color-input').appendChild(p) 
    }
    return
  }

  //create nodes
  var nsURI = 'http://www.w3.org/2000/svg'
  var g = document.createElementNS(nsURI, 'g')
  var rect = document.createElementNS(nsURI, 'rect')
  var text = document.createElementNS(nsURI, 'text')

  //add attributes, etc.
  g.setAttribute('class', 'result '+ this.value.replace(/\s|[,.-]/g, ''))

  rect.setAttribute('x', L)
  rect.setAttribute('y', '.2')
  rect.setAttribute('width', '.6')
  rect.setAttribute('height', '5')
  rect.setAttribute('fill', this.value)

  text.setAttribute('y', L)
  text.setAttribute('x', '-6')
  text.setAttribute('dy', '.7')
  text.setAttribute('transform', 'rotate(-90)')
  text.setAttribute('text-anchor', 'end')
  text.innerHTML = this.value

  //add to SVG
  g.appendChild(rect)
  g.appendChild(text)
  svg.appendChild(g)

  svg.setAttribute('class', 'noDisplay')
  svg.setAttribute('class', '')
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

