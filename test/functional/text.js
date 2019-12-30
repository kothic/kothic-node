'use strict';

const fs = require('fs');
const { createCanvas, loadImage } = require('canvas');

const textOnPath = require("../../src/renderer/curvedtext.js");

function createContext(width, height) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  ctx.strokeStyle = 'black';
  ctx.lineWidth = 1;
  ctx.font = "16px sans-serif"
  ctx.textBaseline = 'bottom';
  return {ctx, canvas};
}

describe("merge_segments.png", () => {

  const points = [];
  const w = 300;
  const h = 300;
  const n = 100;
  const r = 100;
  const ang = (2 * Math.PI) / n;
  for (var i = 0; i < n + 1; i++) {
    points.push([w / 2 + r * Math.cos(ang * i), h / 2 + r * Math.sin(ang * i)]);
  }
  console.log(points);

  const {ctx, canvas} = createContext(w, h);
  textOnPath.render(ctx, points, "correct horse battery staple")
  const stream = canvas.createPNGStream();
  const file = fs.createWriteStream("./test/functional/fixtures/merge_segments.png");
  stream.pipe(file);
});
