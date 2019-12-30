var expect = require("chai").expect;

var rewire = require("rewire");
var segmenter = rewire("../../../src/renderer/text/segmenter.js")

const splitToSegments = segmenter.__get__("splitToSegments");
const mergeSegments = segmenter.__get__("mergeSegments");
const adjustSegmentDirection = segmenter.__get__("adjustSegmentDirection");
const deg = segmenter.__get__("deg");
const rad = segmenter.__get__("rad");

function circle(center, r, n, a0) {
  let points = [];
  for (var i = 0; i <= n; i++) {
    const a = a0 + 2 * Math.PI * i / n;
    points.push([center[0] + r * Math.cos(a), center[1] + r * Math.sin(a)])
  }

  //Fix precision error for tests. Real data will have exact coordinates
  points[points.length - 1] = points[0];

  return points;
}

describe("Text on path rendering", () => {
  describe("Segments separation", () => {
    it("Should merge first and last segments of closed line", () => {
      const points = circle([150, 150], 100, 15, Math.PI / 2);

      let segments = splitToSegments(points);

      expect(segments).to.have.lengthOf(3);
      let mergedSegments = mergeSegments(segments);
      expect(mergedSegments).to.have.lengthOf(2);
    });
    it("Shouldn't merge segments in different quadrants", () => {
      const points = circle([150, 150], 100, 15, 0);

      let segments = splitToSegments(points);
      expect(segments).to.have.lengthOf(2);
      let mergedSegments = mergeSegments(segments);
      //console.log(mergedSegments)
      expect(mergedSegments).to.have.lengthOf(2);
    });

    it("Shouldn't merge segments of open lines", () => {
      const points = circle([150, 150], 100, 10, Math.PI / 2);
      points.pop()

      let segments = splitToSegments(points);
      expect(segments).to.have.lengthOf(3);
      let mergedSegments = mergeSegments(segments);
      expect(mergedSegments).to.have.lengthOf(3);
    });

    it("Shouldn't even try to merge less then 2 segments", () => {
      let segments = splitToSegments([[0, 0], [100, 100]]);
      expect(segments).to.have.lengthOf(1);
      let mergedSegments = mergeSegments(segments);
      expect(mergedSegments).to.have.lengthOf(1);
    });

  });
  describe("splitToSegments", () => {
    it("0,0 -> 20,20 single segment", function() {
      const segments = splitToSegments([[0, 0], [10, 10], [20, 20]]);
      expect(segments).to.have.lengthOf(1);

      const s = segments[0];
      expect(s.angles.map(deg)).to.be.deep.equal([45, 45]);
      expect(s.partsLength.reduce((acc, x) => acc + x, 0)).to.be.deep.equal(s.length);
      expect(s).to.have.property('quadrant', '1,3');
      expect(s).to.have.property('length', 28.284271247461902);
    });

    it("0,0 -> 20,0 sharp corner, 2 segments", () => {
      const segments = splitToSegments([[0, 0], [10, 10], [20, 0]]);
      expect(segments).to.have.lengthOf(2);

      const s0 = segments[0];
      const s1 = segments[1];
      expect(s0.angles.map(deg)).to.be.deep.equal([45]);
      expect(s1.angles.map(deg)).to.be.deep.equal([-45]);
      expect(s0).to.have.property('quadrant', '1,3');
      expect(s1).to.have.property('quadrant', '1,3');
    });

    it("20,20 -> 0,0 single segment", () => {
      const segments = splitToSegments([[20, 20], [10, 10], [0, 0]]);
      expect(segments).to.have.lengthOf(1);

      const s = segments[0];
      expect(s.angles.map(deg)).to.be.deep.equal([-135, -135]);
      expect(s.partsLength.reduce((acc, x) => acc + x, 0)).to.be.deep.equal(s.length);
      expect(s).to.have.property('quadrant', '2,4');
      expect(s).to.have.property('length', 28.284271247461902);
    });

    it("20,0 -> 0,0 sharp corner, 2 segments", () => {
      const segments = splitToSegments([[20, 0], [10, 10], [0, 0]]);
      expect(segments).to.have.lengthOf(2);

      const s0 = segments[0];
      const s1 = segments[1];
      expect(s0.angles.map(deg)).to.be.deep.equal([135]);
      expect(s1.angles.map(deg)).to.be.deep.equal([-135]);
      expect(s0).to.have.property('quadrant', '2,4');
      expect(s1).to.have.property('quadrant', '2,4');
    });
  });
  describe("adjustSegmentDirection", () => {
    it("Reverse segment in 2,4 quardant; 20,20 -> 0,0", () => {
      const s = splitToSegments([ [ 20, 20 ], [ 10, 10 ], [ 0, 0 ] ])[0];

      adjustSegmentDirection(s);

      expect(s).to.have.property('quadrant', '1,3');
      expect(s).to.have.property('partsLength').to.be.deep.equal([14.142135623730951, 14.142135623730951]);
      expect(s).to.have.property('points').to.be.deep.equal([[0, 0], [10, 10], [20, 20]]);
      expect(s.angles.map(deg)).to.be.deep.equal([45, 45]);
    })

    it("Reverse segment in 2,4 quardant; 20,0 -> 0,20", () => {
      const s = splitToSegments([ [ 20, 0 ], [ 10, 10 ], [ 0, 20 ] ])[0];

      adjustSegmentDirection(s);

      expect(s).to.have.property('quadrant', '1,3');
      expect(s).to.have.property('partsLength').to.be.deep.equal([14.142135623730951, 14.142135623730951]);
      expect(s).to.have.property('points').to.be.deep.equal([[0, 20], [10, 10], [20, 0]]);
      expect(s.angles.map(deg)).to.be.deep.equal([-45, -45]);
    })

    it("Shouldn't touch segments in 1,3 quadrants", () => {
      const s = splitToSegments([ [ 0, 20 ], [ 10, 10 ], [ 20, 0 ] ])[0];

      adjustSegmentDirection(s);

      expect(s).to.have.property('quadrant', '1,3');
      expect(s).to.have.property('partsLength').to.be.deep.equal([14.142135623730951, 14.142135623730951]);
      expect(s).to.have.property('points').to.be.deep.equal([[0, 20], [10, 10], [20, 0]]);
      expect(s.angles.map(deg)).to.be.deep.equal([-45, -45]);
    })
  });

  describe("real world", () => {
    it("2,4", () => {
      const points =    [ [ 0, 344.5429272281275 ],
          [ 9.210139002452985, 340.77514309076037 ],
          [ 21.769419460343418, 340.77514309076037 ],
          [ 34.747342600163535, 340.77514309076037 ],
          [ 41.44562551103843, 335.75143090760423 ],
          [ 47.72526573998365, 325.70400654129185 ],
          [ 54.42354865085855, 315.6565821749796 ],
          [ 60.70318887980376, 310.6328699918233 ],
          [ 73.68111201962388, 305.1905151267375 ],
          [ 86.65903515944399, 305.1905151267375 ] ];
        //points.reverse()
        const segments = segmenter.createSegments(points);
    });
  })
});
