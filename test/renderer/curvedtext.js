var expect = require("chai").expect;

var rewire = require("rewire");
var textOnPath = rewire("../../src/renderer/curvedtext.js")

const createSegments = textOnPath.__get__("createSegments");
const adjustSegmentDirection = textOnPath.__get__("adjustSegmentDirection");
const deg = textOnPath.__get__("deg");
const rad = textOnPath.__get__("rad");

describe("Text on path rendering", () => {
  describe("createSegments", () => {
    it("0,0 -> 20,20 single segment", function() {
      const segments = createSegments([[0, 0], [10, 10], [20, 20]]);
      expect(segments).to.have.lengthOf(1);

      const s = segments[0];
      expect(s.angles.map(deg)).to.be.deep.equal([45, 45]);
      expect(s.partsLength.reduce((acc, x) => acc + x, 0)).to.be.deep.equal(s.length);
      expect(s).to.have.property('quadrant', '1,3');
      expect(s).to.have.property('length', 28.284271247461902);
    });

    it("0,0 -> 20,0 sharp corner, 2 segments", () => {
      const segments = createSegments([[0, 0], [10, 10], [20, 0]]);
      expect(segments).to.have.lengthOf(2);

      const s0 = segments[0];
      const s1 = segments[1];
      expect(s0.angles.map(deg)).to.be.deep.equal([45]);
      expect(s1.angles.map(deg)).to.be.deep.equal([-45]);
      expect(s0).to.have.property('quadrant', '1,3');
      expect(s1).to.have.property('quadrant', '1,3');
    });

    it("20,20 -> 0,0 single segment", () => {
      const segments = createSegments([[20, 20], [10, 10], [0, 0]]);
      expect(segments).to.have.lengthOf(1);

      const s = segments[0];
      expect(s.angles.map(deg)).to.be.deep.equal([-135, -135]);
      expect(s.partsLength.reduce((acc, x) => acc + x, 0)).to.be.deep.equal(s.length);
      expect(s).to.have.property('quadrant', '2,4');
      expect(s).to.have.property('length', 28.284271247461902);
    });

    it("20,0 -> 0,0 sharp corner, 2 segments", () => {
      const segments = createSegments([[20, 0], [10, 10], [0, 0]]);
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
      const s = createSegments([ [ 20, 20 ], [ 10, 10 ], [ 0, 0 ] ])[0];

      adjustSegmentDirection(s);

      expect(s).to.have.property('quadrant', '1,3');
      expect(s).to.have.property('partsLength').to.be.deep.equal([14.142135623730951, 14.142135623730951]);
      expect(s).to.have.property('points').to.be.deep.equal([[0, 0], [10, 10], [20, 20]]);
      expect(s.angles.map(deg)).to.be.deep.equal([45, 45]);
    })

    it("Reverse segment in 2,4 quardant; 20,0 -> 0,20", () => {
      const s = createSegments([ [ 20, 0 ], [ 10, 10 ], [ 0, 20 ] ])[0];

      console.log(s);

      adjustSegmentDirection(s);
      console.log(s);

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
        const segments = createSegments(points);
        console.log(segments[0].angles.map(deg));

    });
  })
});
