[![NPM version][npm-version-image]][npm-url] [![License][license-image]][license-url]  [![Build Status][travis-image]][travis-url]

[npm-url]: https://npmjs.org/package/kothic
[npm-version-image]: http://img.shields.io/npm/v/kothic.svg?style=flat

[license-image]: https://img.shields.io/npm/l/kothic.svg?style=flat
[license-url]: LICENSE

[travis-url]: http://travis-ci.org/kothic/kothic-node
[travis-image]: http://img.shields.io/travis/kothic/kothic-node/master.svg?style=flat

**Kothic JS** is a full-featured JavaScript map rendering engine using HTML5 Canvas.
It was initially developed as a JavaScript port of [Kothic](http://wiki.openstreetmap.org/wiki/Kothic) rendering engine written in Python. 

**kothic-node** is a KothicJS port, designed to work as a server-side renderer. Due to incompatibility with original KothicJS in almost every aspect, it deserves a separate repository.

Unlike original KothicJS kothic-node isn't limited to rendering OpenStreetMap data only. Any geo data in GeoJSON will be ok. 

Instead of using HTML5 Canvas, kothic-node relies on [node-canvas](https://github.com/Automattic/node-canvas) module.

**Warning:** kothic-node is a subject of active (but very slow) development and it's not intended for production use yet. 

### Features
 * Rendering any GeoJSON to an image 
 * Native [MapCSS](http://wiki.openstreetmap.org/wiki/MapCSS/0.2) support without any additional data preparation
 * GeoJSON as an internal data representation format
 * Browser-compatible design, no NodeJS specific API is used
 * As little dependencies as possible

### Basic usage

Install the library
```npm i kothic```

```javascript
const css = "way { width: 1; color: red;}";
const kothic = new Kothic(css, {
  //Synchronous mode for testing reasons
  getFrame: (callback) => callback(),
  browserOptimizations: false,
  gallery: {
    localImagesDirectory: '../../sandbox/maki/png'
  },
  mapcss: {
    cache: {},
    locales: []
  },
  debug: true
});

Kothic.render(
	canvas, // canvas element (or its id) to render on
	geojson, // GeoJSON data to render
	zoom, // zoom level
	callback, // onRenderingComplete callback
);
```

`locales` Kothic-JS supports map localization based on name:*lang* tags. Renderer will check all mentioned languages in order of persence.  If object doesn't have localized name, *name* tag will be used.

### Contributing to Kothic JS

Kothic JS is licensed under a BSD license, and we'll be glad to accept your contributions!

#### Core contributors:

 * Darafei Praliaskouski ([@Komzpa](https://github.com/Komzpa))
 * Vladimir Agafonkin ([@mourner](https://github.com/mourner), creator of [Leaflet](http://leafletjs.com))
 * Maksim Gurtovenko ([@Miroff](https://github.com/Miroff))
