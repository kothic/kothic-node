'use strict';

function deg(rad) {
	return rad * 180 / Math.PI;
}

function rad(deg) {
	return deg * Math.PI / 180;
}

/**
 ** @param start {Point} start point of the vector
 ** @param end {Point} end point of the vector
 ** @return {float} vector angle in radians
 **/
function vectorAngle(start, end) {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];

	return Math.atan2(dy, dx);
}

/**
 ** @param start {Point} start point of the vector
 ** @param end {Point} end point of the vector
 ** @return {float} vector length in pixels
 **/
function vectorLength(start, end) {
	const dx = end[0] - start[0];
	const dy = end[1] - start[1];

	return Math.sqrt(dx ** 2 + dy ** 2);
}

/**
 ** @param angle {float} angle in radians
 ** @return Quadrant pair for detecting text direction
 **/
function quadrant(angle) {
  if (angle < Math.PI / 2 && angle > -Math.PI / 2)  {
    return '1,3';
  } else {
    return '2,4';
  }
}

/**
 ** @param points {array[Point]}
 ** @return {array{Segment}} unidirectional segemnts
 **/
function splitToSegments(points) {
  const segments = [];
  //TODO: Make this angle configurable
  const maxSegmentAngle = rad(45);

  // Offset of each segment from the beginning og the line
  var offset = 0;
  for (var i = 0; i < points.length - 1; i++) {
    const start = points[i];
    const end = points[i + 1];

		const angle = vectorAngle(start, end);
    const length = vectorLength(start, end);

    // Try to attach current point to a previous segment
    if (segments.length > 0) {
      const prevSegment = segments[segments.length - 1];
      const prevAngle = prevSegment.angles[prevSegment.angles.length - 1];

      // Angles more than 180 degrees are reversed to different direction
      var angleDiff = Math.abs(prevAngle - angle);
      if (angleDiff > Math.PI) {
        angleDiff = (2 * Math.PI) - angleDiff;
      }

      // The segment can be continued, if
      // 1. Angle between two parts is lesser then maxSegmentAngle to avoid sharp corners
      // 2. Part is direcred to the same hemicircle as the previous segment
      //
      // Otherwise, the new segment will be created
      if (angleDiff < maxSegmentAngle && quadrant(angle) == prevSegment.quadrant) {
        prevSegment.points.push(end);
        prevSegment.angles.push(angle);
        prevSegment.partsLength.push(length);
        prevSegment.length += length;
        offset += length;
        continue;
      }
    }

    segments.push({
      angles: [angle],
      partsLength: [length],
      offset: offset,
      length: length,
      points: [start, end],
      quadrant: quadrant(angle)
    });

    offset += length;
  }

  return segments;
}

/**
 ** If the line is closed, merge first and last segments to get rid of
 ** unnecessary breaking point
 **/
function mergeSegments(segments) {
	if (segments.length < 2) {
		return segments;
	}
	const s1 = segments[0];
	const s2 = segments[segments.length - 1];
	const p1 = s1.points[0];
	const p2 = s2.points[s2.points.length - 1];

	if (s1.quadrant !== s2.quadrant || p1[0] !== p2[0] || p1[1] !== p2[1]) {
		return segments;
	}

	const src = segments.shift();
	const dest = segments.pop();

	dest.angles.push(vectorAngle(dest.points[dest.points.length - 1], src.points[0]));
	dest.angles = dest.angles.concat(src.angles);
	dest.partsLength.push(vectorLength(dest.points[dest.points.length - 1], src.points[0]));
	dest.partsLength = dest.partsLength.concat(src.partsLength);
	dest.length += src.length;
	dest.offset -= src.length;

	//Shift all segments left
	segments.forEach((seg) => {
		seg.offset -= src.length;
	});
	dest.points = dest.points.concat(src.points);

	segments.push(dest);

	return segments;
}

function adjustSegmentDirection(segment) {
	//Reverse segment to turnover text from upside down
  if (segment.quadrant == '2,4') {
		segment.angles.reverse();
    segment.angles = segment.angles.map((angle) => angle < 0 ? angle + Math.PI : angle - Math.PI);
    segment.partsLength.reverse();
    segment.points.reverse();
		segment.quadrant = '1,3';
  }

	return segment;
}

function createSegments(points) {
  let segments = splitToSegments(points);

  // Try to merge first and last segments if the line is closed
	segments = mergeSegments(segments);

  //Reverse direction of upside-down text segments
	segments = segments.map(adjustSegmentDirection);

  return segments;
}

exports.createSegments = createSegments;
