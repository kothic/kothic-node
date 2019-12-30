//TODO Segment selection strategy???
//1. Choose only one longest segments
//2. Repeat with margin
//3. Select segments with minimal curvature
//4. Combine multiple strategies
//Segments are independent from one another
//There is a context like main collision buffer or segment collision buffer
//Stateful?

/** Find index of segemnt part and offset from beginning of the part by offset.
 ** This method is used to put label to the center of a segment
 ** @param parts {array} array of segment parts length
 ** @param offset {float} expected offset
 **/
function calculateOffset(parts, offset) {
  var totalOffset = 0;

  for (var i = 0; i < parts.length; i++) {
    const part = parts[i];

    if (totalOffset + part > offset) {
      return [i, offset - totalOffset];
    } else {
      totalOffset += part;
    }
  }

  throw new Error("Sanity check: path is shorter than an offset");
}

function adjustAngle(pointStart, angleStart, pointNext, angleNext, offsetX, offsetY) {
	//If glyph can be fitted to a single segment part, no adjustment is needed
	if (pointStart === pointNext) {
		return angleStart;
	}

	//Draw a line from start point to end point of a glyph
	const x = pointNext[0] + offsetX * Math.cos(angleNext) + offsetY * Math.sin(angleNext);
	const y = pointNext[1] + offsetX * Math.sin(angleNext) + offsetY * Math.cos(angleNext);

	//return angle of this line
	return Math.atan2(y - pointStart[1], x - pointStart[0]);
}

function calculateGlyphsPositions(segment, glyphs) {
  const textWidth = glyphs.reduce((acc, glyph) => acc + glyph.width, 0);

	//Align text to the middle of current segment
  const startOffset = (segment.length - textWidth) / 2;

	// Get point index and offset from that point of the starting position
	// 'index' is an index of current segment partsLength
	// 'offset' is an offset from the beggining of the part
  let [index, offset] = calculateOffset(segment.partsLength, startOffset);
  for (let i = 0; i < glyphs.length; i++) {
    const glyph = glyphs[i];
		const startPointIndex = index;
		const offsetX = offset;

		//Iterate by points until space for current glyph was reserved
		var reserved = 0;
    while (reserved < glyph.width) {
      const requiredSpace = glyph.width - reserved;
			//Current part is longer than required space
      if (segment.partsLength[index] - offset > requiredSpace) {
        offset += requiredSpace;
        reserved += requiredSpace;
        break;
      }

			//Current part is shorter than required space. Reserve the whole part
			//and increment index
      reserved += segment.partsLength[index] - offset;
      index += 1;
      offset = 0;
    }

		// Text glyph may cover multiple segment parts, so a glyph angle should
		// be averaged between start ans end position
		const angle = adjustAngle(segment.points[startPointIndex], segment.angles[startPointIndex], segment.points[index], segment.angles[index], offset, 0);

		glyph.position = segment.points[startPointIndex];
		glyph.angle = angle;
		glyph.offset = [offsetX, 0];
  }

	return glyphs;
}


function process(segments, glyphs, options) {

}

function PlacementStrategy(textCollisionBuffer, segmentCollisionBuffer) {

}

function* PlacementStrategy.prototype.iterator(segments) {

}

function PlacementStrategy.prototype.check(glyphPositions) {
  return true;
}
