(function(exports) {

  var round = Math.round;

  var svgAutosize = exports.svgAutosize = function svgAutosize(svg) {
    if (!svg.hasAttribute("viewBox")) {
      return;
    } else if (svg.hasAttribute("width") && svg.hasAttribute("height")) {
      // do something else here?
      return;
    }
    var viewBox = svg.viewBox.baseVal,
        width = viewBox.width,
        height = viewBox.height,
        aspect = width / height;
    if (!isFinite(aspect) || aspect <= 0) {
      // invalid viewBox
      return;
    } else if (svg.getAttribute("height")) {
      svg.style.setProperty("width", round(svg.offsetHeight * aspect) + "px");
    } else {
      svg.style.setProperty("height", round(svg.offsetWidth / aspect) + "px");
    }
  };

  function desired(node, prop) {
    return node.style.getProperty(prop) || node.getAttribute(prop);
  }

  svgAutosize.all = function(selector) {
    var elements = document.querySelectorAll(selector || "svg");
    [].forEach.call(elements, svgAutosize);
  };

  svgAutosize.always = function(selector) {
    var resize = function() {
      svgAutosize.all(selector);
    };
    resize.start = function() {
      window.addEventListener("resize", resize);
      window.addEventListener("load", resize);
      return resize;
    };
    resize.stop = function() {
      window.removeEventListener("resize", resize);
      window.removeEventListener("load", resize);
      return resize;
    };
    resize();
    return resize.start();
  };

})(this);
