'use strict';

const chai = require('chai');
const chaiSubset = require('chai-subset');

chai.use(chaiSubset);

const expect = chai.expect;

var rewire = require("rewire");

const StyleManager = rewire("../../src/style/style-manager");

const compareLayers = StyleManager.__get__("compareLayers");


describe("Style Manager", () => {
  describe("Sorting", () => {
    it("Different renders same layers", () => {
      expect(compareLayers([0, 20, 'default'], [0, 10, 'default'])).to.be.above(0);
    });
    it("Different z-index same layers and renders", () => {
      expect(compareLayers([10, 10, 'default'], [0, 10, 'default'])).to.be.above(0);
    });
    it("Different layers", () => {
      expect(compareLayers([0, 10, 'default'], [0, 10, 'overlay'])).to.be.below(0);
      expect(compareLayers([0, 10, 'overlay'], [0, 10, 'default'])).to.be.above(0);
    });
    it("Different overlay layers", () => {
      expect(compareLayers([5, 10, 'overlay_1'], [0, 10, 'overlay_2'])).to.be.above(0);
      expect(compareLayers([0, 10, 'overlay_1'], [5, 10, 'overlay_2'])).to.be.below(0);

      expect(compareLayers([5, 10, 'overlay_1'], [0, 20, 'overlay_2'])).to.be.above(0);
      expect(compareLayers([5, 20, 'overlay_1'], [0, 10, 'overlay_2'])).to.be.above(0);
    });
    it("Different overlay layers same z-index", () => {
      expect(compareLayers([0, 10, 'overlay_1'], [0, 10, 'overlay_2'])).to.be.below(0);
    });

    it("Duplicate layers", () => {
      expect(() => compareLayers([0, 10, 'overlay_1'], [0, 10, 'overlay_1'])).to.throw(Error, /Duplicate layers/);
    });
  });
  describe("Layers", () => {
    it("Zero hypotesis", () => {
      const mapcss = {
        apply: () => ({'default': {}}),
        applyCanvas: () => ({})
      };
      const sm = new StyleManager(mapcss);
      const layers = sm.createLayers([], 10);
      expect(layers).to.have.property('length', 1);
      expect(layers[0]).to.containSubset({render: 'canvas'});
    });

    it("Split feature to layers", () => {
        const mapcss = {
          apply: () => ({
            'default': {
              'width': '1',
              'casing-width': '1',
              'casing-color': 'red',
              'casing-dashes': '3,3',
              'text': 'Hooray',
              'text-allow-overlap': "true"
            },
            'overlay_1': {
              'width': '5',
              'casing-width': '2',
              'text': '',
              'text-allow-overlap': "false",
              'z-index': '1000'
            },
            'overlay_2': {
              'width': '1',
              'casing-width': '1',
              'z-index': '2000'
            }
          }
        ),
        applyCanvas: () => ({})
      };
      const sm = new StyleManager(mapcss, {groupFeaturesByActions: false});

      const features = [{
        geometry: {type: 'LineString'},
      }];

      const layers = sm.createLayers(features, 10);
      expect(layers).to.have.property('length', 9);

      expect(layers[0]).to.containSubset({render: 'canvas'});
      expect(layers[1]).to.containSubset({render: 'casing', zIndex: 0});
      expect(layers[2]).to.containSubset({render: 'line', zIndex: 0});
      expect(layers[3]).to.containSubset({render: 'text', zIndex: 0});
      expect(layers[4]).to.containSubset({render: 'casing', zIndex: 1000});
      expect(layers[5]).to.containSubset({render: 'line', zIndex: 1000});
      expect(layers[6]).to.containSubset({render: 'text', zIndex: 1000});
      expect(layers[7]).to.containSubset({render: 'casing', zIndex: 2000});
      expect(layers[8]).to.containSubset({render: 'line', zIndex: 2000});
    });

    it("Sort features by actions", () => {
      var i = 1;
      const mapcss = {
        apply: (tags, zoom, featureType) => {
          if (featureType == 'Polygon') {
            return {
              'default': {
                'width': '1',
              }
            }
          } else {
            return {
              'default': {
                'width': '2',
              }
            }
          }
        },
        applyCanvas: () => ({})
      };
      const sm = new StyleManager(mapcss, {groupFeaturesByActions: true});
      const features = [{
        geometry: {type: 'LineString'},
      }, {
        geometry: {type: 'Polygon'},
      }, {
        geometry: {type: 'LineString'},
      }
      ];

      const layers = sm.createLayers(features, 10);
      expect(layers).to.have.property('length', 2);
      expect(layers[0]).to.containSubset({render: 'canvas'});
      expect(layers[1]).to.containSubset({render: 'line', zIndex: 0});      
      expect(layers[1].features[0].actions.width).to.be.equal(1)
      expect(layers[1].features[1].actions.width).to.be.equal(2)
      expect(layers[1].features[2].actions.width).to.be.equal(2)
    });
  });
});
