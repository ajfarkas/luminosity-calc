# luminosity-calc
A web app for visualizing relative visual luminosity of colors.
<br/>[http://ajfarkas.com/luminosity](http://ajfarkas.com/luminosity)

The color space of the web is mainly sRGB, but that space is much smaller than what we're able to see. 
L*a*b* space is much closer to our actual vision, and the L* part (luminosity) is a more accurate scale of brightness. 
For instance, `#808080` (or `rgb(128,128,128)`) is halfway between white and black by the computer's measure. But visually, it's actually much closer to white than black (~76 on a 0-100 scale).

###Purpose
This tool allows you to visually understand how far apart different colors are on the L*a*b* scale. While people with full color vision may not have trouble seeing a red (`#b01e26`) and a blue (`#3237a6`) apart, people with color-blindness may have trouble. 
Equiluminant colors (colors with equal luminosity, like the above red and blue) may also create a "shimmering" effect for many viewers because of the simultaneous equal brightness and unequal hues. 

###How to Use This
If you're a designer planning a color pallette, you can enter colors one at a time in the first input space ("enter your color"), and change the background ("choose a background color") to match the color on your site. You can use either **`hex`** or **`rgb`** formats. `rgba`is also accepted for cut-and-paste purposes, but the alpha information is not accounted for, so the results may not be accurate.

The main colors are plotted along the 0-100 L* scale and labeled with the hex representation of that color.

The main colors are simultaneously added to a list under the plot. Two colors that are very close together may have overlapping labels, and it's useful to have a list of the colors and their L* value.

You can clear the plot and list independent of one another with the `clear` buttons on the right side of the screen.

####How do I Read the Visualization?
Well, it depends on what your goal is. If you're choosing colors for a heatmap, for instance, you may want to find a range of colors that are evenly spaced across the scale. If you were to use the full color specturm, you'd get the following luminosity values:

#89000A : 40L* (red)
#F09800 : 83L* (orange)
#FCFF00 : 97L* (yellow)
#6ED521 : 86L* (green)
#3D63FF : 69L* (blue)
#9400F2 : 50L* (purple)

Note that how close the two colors at opposite ends of the spectrum are (red: 40, purple: 50). The scale gets brighter and then darker again. A better scale may be simplified to blue, green, yellow (69, 86, 97). Or you could choose to darken your blue and green points, to broaden the visual contrast of the scale.

This is also a good start in thinking about web accessibility, for people with differing levels of vision. [WebAIM](webaim.org) is a good resource, and they have standards for accessible color contrasts. There are also browser extensions that mimic the way people with vision limitations would see the web.
