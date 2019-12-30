'use strict';

/**
 ** Robust algorithm for rendering text along polyline. It is not as efficient
 ** as quick one (see textonpath.js) but it has some useful advantages:
 ** 1. Support dense high-curved lines with segments much shorter than letter width
 **/
const colors = require('../utils/colors.js');
const simplify = require("../utils/simplify.js");

function drawGlyph(ctx, glyph, hasHalo=false) {
	ctx.translate(glyph.position[0], glyph.position[1]);
  ctx.rotate(glyph.angle);
	ctx.beginPath();

	if (hasHalo) {
  	ctx.strokeText(glyph.glyph, glyph.offset[0], glyph.offset[1]);
	} else {
		ctx.fillText(glyph.glyph, glyph.offset[0], glyph.offset[1]);
	}

  ctx.rotate(-glyph.angle);
  ctx.translate(-glyph.position[0], -glyph.position[1]);
}

function renderSegments(ctx, segments) {
  ctx.save();
  segments.forEach((seg) => {
    ctx.strokeStyle = colors.nextColor();
    ctx.lineWidth = 3;
    ctx.beginPath()
    ctx.moveTo(seg.points[0][0], seg.points[0][1]);
    for (var i = 1; i < seg.points.length; i++) {
      ctx.lineTo(seg.points[i][0], seg.points[i][1]);
    }
    ctx.stroke();
  });
  ctx.restore();
}

// function checkCollisions(segment, collisions) {
// 	const box = segment.points.reduce((acc, point) => ({
// 			minX: Math.min(acc.minX, point[0]),
// 			minY: Math.min(acc.minY, point[1]),
// 			maxX: Math.max(acc.maxX, point[0]),
// 			maxY: Math.max(acc.maxX, point[1])
// 		}), {minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity});
//
// 		return collisions.check(box);
// }

//TODO: Extract to utils
function defautOptions(options, defaultOptions) {

}

/**
 ** @param points {array} array of 2D points [[0, 0], [1, 1], ...]
 ** @param text {String} text string
 **/
 //TODO: What about RTL text? Will it be handeled OK or we need some manual adjustment?
 //TODO: Implement higher lever strategy, eg. if text doesn't fit, try to truncate it
function render(ctx, points, text, options={}) {
  if (!text) {
    return;
  }

  options = defautOptions(options, {
    "hasHalo": false,
//    "collisions": null,
    "debug": true,
    "simplify": true,
    "simplifyTolerance": 5,
    "simplifyHighestQuality": false,
    //TODO: Allow text margin in pixels
    "segmentMargin": 0.2,
  });

  if (options.simplify) {
    points = simplify(points, tolerance=options.simplifyTolerance, highestQuality=options.simplifyHighestQuality);
  }

  // Split text into array of glyphs
  const glyphs = text.split("")
      .map((l) => {
        const metrics = ctx.measureText(l);
        return {
          glyph: l,
          width: metrics.width,
          ascent: metrics.emHeightAscent,
          descent: metrics.emHeightDescent,
        }
      });

  const textWidth = glyphs.reduce((acc, glyph) => acc + glyph.width, 0);

  // Segments are unidirectional pieces of a path
  // Text cannot be rendered over multiple segments because this will break
  // natural text direction
  let segments = createSegments(points);

  // Filter segments to short for the text width
  segments = segments.filter((seg) => seg.length > textWidth * (1 + options.segmentMargin));

  // No segments long enough to fit the text
	if (segments.length <= 0) {
		return;
	}

  // if (options.debug) {
  //   renderSegments(ctx, segments);
  // }

  //TODO: Problem, collision checks requires percise glyph positions,
  const placementStrategy = new PlacementStrategy();

  //TODO Choose best segments
//	segments = [segments[0]]

  //Render text
  placementStrategy.iterator(segments).forEach((seg) => {
		const positions = calculateGlyphsPositions(seg, glyphs);

		// if (optiosn.hasHalo) {
    //   //Draw halo
		// 	positions.forEach((glyph) => {
		// 		drawGlyph(ctx, glyph, true);
		// 	});
		// }
		// positions.forEach((glyph) => {
		// 	drawGlyph(ctx, glyph, false);
		// });
	});
}

module.exports.render = render;
