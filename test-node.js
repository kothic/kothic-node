const Kothic = require("./src/kothic");
const fs = require('fs');

const MapCSS = Kothic.MapCSS;

const { createCanvas, loadImage } = require('canvas')

const canvas = createCanvas(512, 512)

const css = fs.readFileSync("./experiments/styles/debug.mapcss").toString();

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

console.time("Loading GeoJSON");
//const geojson = JSON.parse(fs.readFileSync('../../sandbox/relief/contours-json/N50E086.json'));
const geojson = JSON.parse(fs.readFileSync('../../sandbox/relief/contours-json/N52E085.json'));
//const geojson = JSON.parse(fs.readFileSync('test.json'));
//const geojson = JSON.parse(fs.readFileSync('ridges.geojson'));
geojson.bbox = [85, 52, 85.1, 52.1];
console.timeEnd("Loading GeoJSON");

console.time("Rendering")
kothic.render(canvas, geojson, 13, function() {
  console.timeEnd("Rendering")
  console.time("Saving PNG")
  const stream = canvas.createPNGStream();
  const file = fs.createWriteStream("./test.png");

  stream.pipe(file);
  stream.on('end', () => console.timeEnd("Saving PNG"))
});
