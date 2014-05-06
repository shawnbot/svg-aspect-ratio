# SVG Aspect Ratio
This is a proposal for how browsers should calculate the *intrinsic aspect ratio* of SVG elements using their `viewBox` attribute, so that they behave more like images in flexible layouts.

## The Problem
SVG elements are a pain to incorporate into flexible (and "responsive") web layouts because browsers and the standards they follow don't provide a simple way to automatically resize their height based on their width and aspect ratio.

By default, SVG elements have a width and height of `100%`, which you can easily modify in CSS or by setting a `width` and `height` attribute on each individual element. This differs pretty significantly from IMG elements, which browsers understand as having an [intrinsic aspect ratio](http://dev.w3.org/csswg/css-images-3/#intrinsic-dimensions) (width / height) once they're loaded, and adjust their heights automatically. That means that block-level images can be easily styled with CSS to Do the Right Thing in flexible layouts:

```css
img {
  width: 100%;
  max-width: 100%;
}
```

Like IMG elements, SVG elements can have `width` and `height` attributes, but because CSS width and height take [precedence](http://www.w3.org/TR/CSS2/cascade.html) they are usually irrelevant in flexible layouts. But if we apply similar CSS to SVG elements...

```css
svg {
  width: 100%;
  height: auto;
}
```

the heights of our SVG aren't adjusted automatically because the spec doesn't tell browsers how to calculate their intrinsic aspect ratio. **So how do we tell the browser the aspect ratio of an SVG element without giving it a fixed size?**

## The Solution
The solution that I'm proposing consists of a simple algorithm that can be adopted into the relevant standards and eventually incorporated into browsers. It looks like this, where `svg` below is an SVG element reference in JavaScript:

1. Determine an SVG element's aspect ratio:

  a. If the element has `width` and `height` attributes, and either its width or height has been modified by CSS, then calculate its aspect ratio as:

    ```js
    +svg.getAttribute("width") / +svg.getAttribute("height")
    ```

  b. If the element has a `viewBox` attribute, calculate its aspect ratio as:

    ```js
    svg.viewBox.baseVal.width / svg.viewBox.baseVal.height
    ```

  c. Otherwise, don't calculate an aspect ratio and exit.

  d. If the element has an undefined aspect ratio or the calculated aspect ratio is zero, negative, or not finite, don't apply the aspect ratio.

2. Apply each SVG element's aspect ratio:

  a. If the element has a `height` attribute, set its height (via CSS) to:

    ```js
    svg.offsetHeight * aspectRatio
    ```

  b. Otherwise, set its width (via CSS) to:

    ```js
    svg.offsetWidth / aspectRatio
    ```

  In either case, the element's offset width or height is used as a stand-in for its *calculated width or height*, and the CSS size that we set is a stand-in for the size that the browser should apply in either dimension.

## The JavaScript Implementation
Currently, the only way to have flexibly sized SVG elements that respect their aspect ratio is with JavaScript, using one or more of the following techniques:

1. Know the aspect ratio of each your SVG elements ahead of time, and resize their height accordingly.
2. Calculate the aspect ratio of your SVG elements based on an initial rendering (e.g., if JavaScript determines the ideal size of your SVG's contents).
3. Add a window `resize` event handler that resizes your SVG elements each time the window's width changes. (Don't forget to do it once when the window loads, and whenever new SVG elements are added to the document.)
4. Redraw your SVG elements whenever the window resizes, e.g. using [d3](http://d3js.org).
5. Trust that your MVC framework of choice will Do the Right Thing for you.

The [svg-autosize.js](https://github.com/shawnbot/svg-autosize/blob/master/svg-autosize.js) script included here implements the proposed algorithm and provides some useful global functions that you can call in the standards-compliant browser of your choice to enable the proposed behavior:

<a href="#fn" name="fn">#</a> **svgAutosize(** *element* **)**

Apply the aspect ratio resizing algorithm to an SVG *element* by reference.

<a href="#fn-all" name="fn-all">#</a> **svgAutosize.all(** *selector* **)**

Apply the aspect ratio resizing algorithm to all SVG elements matching CSS *selector*.

<a href="#fn-always" name="fn-always">#</a> **svgAutosize.always(** *[selector]* **)**

Call **svgAutosize.all(** *[selector]* **)** once, then add window `load` and `resize` event listeners to call it again when the document loads and when the window is resized.
