# SVG Autosize
This is a proposal for how browsers should calculate the *intrinsic aspect ratio* of SVG elements using their `viewBox` attribute, so that they behave more like images in flexible layouts.

## The Problem
SVG elements are a pain to incorporate into flexible (and "responsive") web layouts because browsers and the standards they follow don't provide a simple way to automatically resize their height based on their width and aspect ratio. By default, SVG elements have a width and height of `100%`, which you can easily modify in CSS or by setting a `width` and `height` attribute on each individual element. This differs pretty significantly from IMG elements, which browsers understand as having an *intrinsic aspect ratio* (`width / height`) when they're loaded, and adjust their heights automatically. Like IMG elements, SVG elements can specify `width` and `height` attributes, but these are overridden by CSS and therefore not relevant in flexible layouts. **Vectors are inherently flexible; shouldn't their dimensions be, too?**

### JavaScript to the Rescue
Currently, the only way to have flexibly sized SVG elements that respect their aspect ratio is with JavaScript, using one or more of the following techniques:

1. Know the aspect ratio of each your SVG elements ahead of time, and resize their height accordingly.
2. Calculate the aspect ratio of your SVG elements based on an initial rendering (e.g., if JavaScript determines the ideal size of your SVG's contents).
3. Add a window `resize` event handler that resizes your SVG elements each time the window's width changes. (Don't forget to do it once when the window loads, and whenever new SVG elements are added to the document.)
4. Redraw your SVG elements whenever the window resizes, e.g. using [d3](http://d3js.org).
5. Trust that your MVC framework of choice will Do the Right Thing for you.

## The Solution
The solution that I'm proposing blends some of the above techniques, but behaves in such a way that can be adopted into the relevant standards and incorporated into browsers quite easily. The algoritm looks like this:

### Determining an SVG Element's Aspect Ratio
1. If the element has `width` and `height` attributes, and either its width or height has been modified by CSS, then calculate its aspect ratio as:
  ```js
  +svg.getAttribute("width") / +svg.getAttribute("height")
  ```
2. If the element has a `viewBox` attribute, calculate its aspect ratio as:
  ```js
  svg.viewBox.baseVal.width / svg.viewBox.baseVal.height
  ```
3. Otherwise, don't calculate an aspect ratio.

### Applying an SVG Element's Aspect Ratio
1. If the element has a `height` attribute, set its height (via CSS) to:
  ```js
  svg.offsetHeight * aspectRatio
  ```
2. Otherwise, set its width (via CSS) to:
  ```js
  svg.offsetWidth / aspectRatio
  ```

