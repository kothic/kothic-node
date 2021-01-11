/*
 (c) 2013, Darafei Praliaskouski, Vladimir Agafonkin, Maksim Gurtovenko
 Kothic JS is a full-featured JavaScript map rendering engine using HTML5 Canvas.
 http://github.com/kothic/kothic-js
*/

'use strict';

const MapCSS = require("./style/mapcss");
const StyleManager = require("./style/style-manager");
const Gallery = require("./style/gallery")
const Renderer = require("./renderer/renderer");
const Profiler = require("./utils/profiler")

/**
 ** Available options:
 ** getFrame:Function — Function, will be called prior the heavy operations
 ** debug {boolean} — render debug information
 ** browserOptimizations {boolean} — enable set of optimizations for HTML5 Canvas implementation
 ** rendering.drawOnTileEdges {boolean} — allow rendering lines on the tile edges.
 ** This option requires GeoJSON to include some buffer around the tile to avoid artifacts
 **/
function Kothic(css, options={}) {
  this.setOptions(options);

  const mapcss = new MapCSS(css, options.mapcss);

  this.styleManager = new StyleManager(mapcss, {groupFeaturesByActions: this.browserOptimizations});

  const images = mapcss.listImageReferences();
  const gallery = new Gallery(options.gallery);

  this.rendererPromise = gallery.preloadImages(images).then(() => {
     return new Renderer(gallery, Object.assign(options.rendering, {
      groupFeaturesByActions: this.browserOptimizations,
      debug: this.debug,
      getFrame: this.getFrame
    }));
  }, (err) => console.error(err));
}

Kothic.prototype.setOptions = function(options) {
  if (options && typeof options.debug !== 'undefined') {
    this.debug = !!options.debug;
  } else {
    this.debug = false;
  }

  if (options && typeof options.getFrame === 'function') {
    this.getFrame = options.getFrame;
  } else {
    if (typeof window !== "undefined") {
      this.getFrame = function (fn) {
        var reqFrame = window.requestAnimationFrame ||
              window.mozRequestAnimationFrame ||
              window.webkitRequestAnimationFrame ||
              window.msRequestAnimationFrame;

        reqFrame.call(window, fn);
      }
    } else {
      this.getFrame = function(callback) {
        setTimeout(callback, 0);
      }
    }
  }

  if (options && typeof options.browserOptimizations !== 'undefined') {
    this.browserOptimizations = !!options.browserOptimizations;
  } else {
    this.browserOptimizations = false;
  }
};

Kothic.prototype.render = function (canvas, geojson, zoom, callback) {

  const width = canvas.width;
  const height = canvas.height;

  var ctx = canvas.getContext('2d');

  //TODO: move to options node-canvas specific setting
  //ctx.globalCompositeOperation = 'copy'

  const bbox = geojson.bbox;
  const hscale = width / (bbox[2] - bbox[0]);
  const vscale = height / (bbox[3] - bbox[1]);
  function project(point) {
    return [
      (point[0] - bbox[0]) * hscale,
      height - ((point[1] - bbox[1]) * vscale)
    ];
  }

  // setup layer styles
  // Layer is an array of objects, already sorted
  const layers = Profiler.timify("Apply styles", () => this.styleManager.createLayers(geojson.features, zoom));

  this.rendererPromise.then((renderer) => {
    renderer.render(layers, ctx, width, height, project, callback);
  }).catch((err) => console.error(err))
};

module.exports = Kothic;
