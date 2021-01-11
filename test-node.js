const Profiler = require("./src/utils/profiler")
const { PerformanceObserver } = require('perf_hooks');

const Kothic = require("./src/kothic");
const fs = require('fs');

const MapCSS = Kothic.MapCSS;

const { createCanvas, loadImage } = require('canvas')

const canvas = createCanvas(512* 4, 512 *4)

const css = fs.readFileSync("./experiments/styles/contours.mapcss").toString();

const kothic = new Kothic(css, {
  //Synchronous mode for testing reasons
  getFrame: (callback) => callback(),
  browserOptimizations: false,
  gallery: {
    localImagesDirectory: '../../sandbox/maki/png',
    loadImage: loadImage
  },
  mapcss: {
    cache: {},
    locales: []
  },
  debug: true
});

const observer = new PerformanceObserver((list) => {
  list.getEntries().forEach((item) => {
    console.log(item.name, (item.duration).toFixed(2) + "ms");
  });
});
observer.observe({ entryTypes: ['function', 'measure'] });


Profiler.mark("Loading GeoJSON");
//const geojson = JSON.parse(fs.readFileSync('../../sandbox/relief/contours-json/N50E086.json'));
const geojson = JSON.parse(fs.readFileSync('../../sandbox/relief/contours-json/N052E085.json'));
geojson.bbox = [85, 52, 85.1, 52.1];
//const geojson = JSON.parse(fs.readFileSync('tile.geojson'));
//const geojson = JSON.parse(fs.readFileSync('ridges.geojson'));
Profiler.measure("Loading GeoJSON");

// console.log(Profiler.stats());

Profiler.mark("Rendering");
kothic.render(canvas, geojson, 16, function() {
  Profiler.measure("Rendering");

  Profiler.mark("Saving PNG")
  const stream = canvas.createPNGStream();
  const file = fs.createWriteStream("./test.png");

  stream.pipe(file);
  stream.on('end', () => {
    Profiler.measure("Saving PNG");
    observer.disconnect();
  })
});
