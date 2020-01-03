'use strict';

const expect = require("chai").expect;

const matchers = require("../../src/style/matchers");

describe("MapCSS matchers", () => {
  describe("Zoom matcher", () => {
    it("complete range", () => {
      expect(matchers.matchZoom({type: 'z', begin: 6, end: 14}, 10)).to.be.true;
      expect(matchers.matchZoom({type: 'z', begin: 6, end: 14}, 16)).to.be.false;
      expect(matchers.matchZoom({type: 'z', begin: 6, end: 14}, 1)).to.be.false;
    });

    it("open end range", () => {
      expect(matchers.matchZoom({type: 'z', begin: 6}, 16)).to.be.true;
      expect(matchers.matchZoom({type: 'z', begin: 6}, 1)).to.be.false;
    });

    it("open start range", () => {
      expect(matchers.matchZoom({type: 'z', end: 14}, 16)).to.be.false;
      expect(matchers.matchZoom({type: 'z', end: 14}, 1)).to.be.true;
    });

    it("range edges", () => {
      expect(matchers.matchZoom({type: 'z', begin: 6, end: 14}, 6)).to.be.true;
      expect(matchers.matchZoom({type: 'z', begin: 6, end: 14}, 14)).to.be.true;
      expect(matchers.matchZoom({type: 'z', begin: 6}, 6)).to.be.true;
      expect(matchers.matchZoom({type: 'z', end: 14}, 14)).to.be.true;
    });

    it("null range", () => {
      expect(matchers.matchZoom(null, 6)).to.be.true;
    });

    it("unexpected zoom type '|s10000-25000'", () => {
      expect(() => matchers.matchZoom({type: 's', begin: 10000, end: 25000}, 6)).to.throw(Error, /not supported/);
    });
  });

  describe("Type matcher", () => {
    it("'way'", () => {
      expect(matchers.matchFeatureType('way', 'Point')).to.be.false;
      expect(matchers.matchFeatureType('way', 'LineString')).to.be.true;
      expect(matchers.matchFeatureType('way', 'Polygon')).to.be.true;
      expect(matchers.matchFeatureType('way', 'MultiPoint')).to.be.false;
      expect(matchers.matchFeatureType('way', 'MultiLineString')).to.be.true;
      expect(matchers.matchFeatureType('way', 'MultiPolygon')).to.be.true;
    });

    it("'node'", () => {
      expect(matchers.matchFeatureType('node', 'Point')).to.be.true;
      expect(matchers.matchFeatureType('node', 'LineString')).to.be.false;
      expect(matchers.matchFeatureType('node', 'Polygon')).to.be.false;
      expect(matchers.matchFeatureType('node', 'MultiPoint')).to.be.true;
      expect(matchers.matchFeatureType('node', 'MultiLineString')).to.be.false;
      expect(matchers.matchFeatureType('node', 'MultiPolygon')).to.be.false;
    });

    it("'line'", () => {
      expect(matchers.matchFeatureType('line', 'Point')).to.be.false;
      expect(matchers.matchFeatureType('line', 'LineString')).to.be.true;
      expect(matchers.matchFeatureType('line', 'Polygon')).to.be.false;
      expect(matchers.matchFeatureType('line', 'MultiPoint')).to.be.false;
      expect(matchers.matchFeatureType('line', 'MultiLineString')).to.be.true;
      expect(matchers.matchFeatureType('line', 'MultiPolygon')).to.be.false;
    });

    it("'area'", () => {
      expect(matchers.matchFeatureType('area', 'Point')).to.be.false;
      expect(matchers.matchFeatureType('area', 'LineString')).to.be.false;
      expect(matchers.matchFeatureType('area', 'Polygon')).to.be.true;
      expect(matchers.matchFeatureType('area', 'MultiPoint')).to.be.false;
      expect(matchers.matchFeatureType('area', 'MultiLineString')).to.be.false;
      expect(matchers.matchFeatureType('area', 'MultiPolygon')).to.be.true;
    });

    it("wildcard '*'", () => {
      expect(matchers.matchFeatureType('*', 'Point')).to.be.true;
      expect(matchers.matchFeatureType('*', 'LineString')).to.be.true;
      expect(matchers.matchFeatureType('*', 'Polygon')).to.be.true;
      expect(matchers.matchFeatureType('*', 'MultiPoint')).to.be.true;
      expect(matchers.matchFeatureType('*', 'MultiLineString')).to.be.true;
      expect(matchers.matchFeatureType('*', 'MultiPolygon')).to.be.true;
    });

    it("unexpected feature type", () => {
      expect(() => matchers.matchFeatureType('canvas', 'Feature')).to.throw(TypeError, /not supported/);
    });
  });

  describe("Attribute matcher", () => {
    it("prsence test", () => {
      expect(matchers.matchAttribute({type: 'presence', key: 'ford'}, {ford: 'yes', depth: '0.5'})).to.be.true;
      expect(matchers.matchAttribute({type: 'presence', key: 'ford'}, {depth: '0.5'})).to.be.false;
    });

    it("absence test", () => {
      expect(matchers.matchAttribute({type: 'absence', key: 'ford'}, {ford: 'yes', depth: '0.5'})).to.be.false;
      expect(matchers.matchAttribute({type: 'absence', key: 'ford'}, {depth: '0.5'})).to.be.true;
    });

    it("compare '=' test", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'ford', op: '=', value: 'yes'}, {ford: 'yes', depth: '0.5'})).to.be.true;
      expect(matchers.matchAttribute({type: 'cmp', key: 'ford', op: '=', value: 'no'}, {ford: 'yes', depth: '0.5'})).to.be.false;
    });

    it("compare '=' in numeric context", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'lanes', op: '=', value: '3'}, {lanes: '3.0'})).to.be.true;
      expect(matchers.matchAttribute({type: 'cmp', key: 'lanes', op: '=', value: '3'}, {lanes: '4.0'})).to.be.false;
    });

    it("compare '!=' test", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'ford', op: '!=', value: 'yes'}, {ford: 'yes', depth: '0.5'})).to.be.false;
      expect(matchers.matchAttribute({type: 'cmp', key: 'ford', op: '!=', value: 'no'}, {ford: 'yes', depth: '0.5'})).to.be.true;
    });

    it("compare '!=' in numeric context", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'lanes', op: '!=', value: '3'}, {lanes: '3.0'})).to.be.false;
      expect(matchers.matchAttribute({type: 'cmp', key: 'lanes', op: '!=', value: '3'}, {lanes: '4.0'})).to.be.true;
    });

    it("compare '<' test", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '<', value: '1'}, {ford: 'yes', depth: '0.5'})).to.be.true;
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '<', value: '0.1'}, {ford: 'yes', depth: '0.5'})).to.be.false;
    });

    it("compare '>' test", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '>', value: '0.1'}, {ford: 'yes', depth: '0.5'})).to.be.true;
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '>', value: '1'}, {ford: 'yes', depth: '0.5'})).to.be.false;
    });

    it("compare '<=' test", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '<=', value: '0.5'}, {ford: 'yes', depth: '0.5'})).to.be.true;
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '<=', value: '0.4'}, {ford: 'yes', depth: '0.5'})).to.be.false;
    });

    it("compare '>=' test", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '>=', value: '0.6'}, {ford: 'yes', depth: '0.5'})).to.be.false;
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '>=', value: '0.5'}, {ford: 'yes', depth: '0.5'})).to.be.true;
    });

    it("NaN in numeric context", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '>', value: '1'}, {ford: 'yes', depth: 'over_nine_thousands'})).to.be.false;
      expect(matchers.matchAttribute({type: 'cmp', key: 'depth', op: '>', value: 'over_nine_thousands'}, {ford: 'yes', depth: '0.5'})).to.be.false;
    });

    it("regexp test", () => {
      expect(matchers.matchAttribute({type: 'regexp', key: 'ford', op: '=~', value: {regexp: '^\\w+$', flags: 'g'}}, {ford: 'yes'})).to.be.true;
      expect(matchers.matchAttribute({type: 'regexp', key: 'ford', op: '=~', value: {regexp: '^\\d+$', flags: ''}}, {ford: 'yes'})).to.be.false;
    });

    it("unexpected operator '%'", () => {
      expect(matchers.matchAttribute({type: 'cmp', key: 'ele', op: '%', value: '1000'}, {ele: '1000'})).to.be.false;
      expect(matchers.matchAttribute({type: 'cmp', key: 'ele', op: '%', value: '1000'}, {ele: '250'})).to.be.false;
    });

    it("unexpected attribute type 'foo'", () => {
      expect(() => matchers.matchAttribute({type: 'foo', key: 'ele', op: '%', value: '1000'}, {ele: '1000'})).to.throw(Error, /not supported/)
    });
  });

  describe("Class matcher", () => {
    it("single class", () => {
      expect(matchers.matchClasses([{class: 'minor_road', not: false}], ['minor_road'])).to.be.true;
      expect(matchers.matchClasses([{class: 'minor_road', not: true}], ['minor_road'])).to.be.false;
      expect(matchers.matchClasses([{class: 'minor_road', not: false}], [])).to.be.false;
    });

    it("multiple classes", () => {
      expect(matchers.matchClasses([{class: 'minor_road', not: false}, {class: 'unpaved', not: false}], ['minor_road', 'unpaved'])).to.be.true;
      expect(matchers.matchClasses([{class: 'minor_road', not: false}, {class: 'unpaved', not: false}], ['minor_road'])).to.be.false;
    });

    it("no classes", () => {
      expect(matchers.matchClasses(null, ['minor_road', 'unpaved'])).to.be.true;
      expect(matchers.matchClasses([], ['minor_road', 'unpaved'])).to.be.true;
    });
  });

  describe("Multiple attributes matcher", () => {
    it("multiple attributes", () => {
      expect(matchers.matchAttributes([{
        type: 'presence',
        key: 'ford'
      }, {
        type: 'cmp',
        key: 'depth',
        op: '<',
        value: '0.7'
      }], {ford: 'yes', depth: '0.5'})).to.be.true;
      expect(matchers.matchAttributes([{type: 'presence', key: 'ford'}], {depth: '0.5'})).to.be.false;
    });

    it("no attributes", () => {
      expect(matchers.matchAttributes(null, {ford: 'yes'})).to.be.true;
      expect(matchers.matchAttributes([], {ford: 'yes'})).to.be.true;
    });
  });

  describe("Known tags", () => {
    it("no attributes", () => {
      const tags = {}
      matchers.appendKnownTags(tags, null);
      expect(tags).to.be.empty;
    });

    it("selector attributes", () => {
      const tags = {}
      matchers.appendKnownTags(tags, [
        {type: 'cmp', key: 'ele', op: '=', value: '1000'},
        {type: 'regexp', key: 'ele', value: '\\d+'},
        {type: 'presence', key: 'ele'},
        {type: 'absence', key: 'ele'}
      ]);
      expect(tags).to.have.property('ele', 'kv');
    });

    it("selector priority", () => {
      const tags = {}
      matchers.appendKnownTags(tags, [
        {type: 'presence', key: 'ele'},
        {type: 'cmp', key: 'ele', op: '=', value: '1000'},
        {type: 'absence', key: 'surface'}
      ]);
      expect(tags).to.have.property('ele', 'kv');
      expect(tags).to.have.property('surface', 'k');
    });
  });

  describe("Match selector", () => {
    it("positive case", () => {
      expect(matchers.matchSelector({type: 'node'}, {ele: 1000}, [], 10, 'Point')).to.be.true;
    });

    it("missed type", () => {
      expect(matchers.matchSelector({type: 'node'}, {ele: 1000}, [], 10, 'LineString')).to.be.false;
    });

    it("missed zoom", () => {
      expect(matchers.matchSelector({type: 'node', zoom: {type: 'z', begin: 6, end: 9}}, {ele: 1000}, [], 10, 'Point')).to.be.false;
    });

    it("missed class", () => {
      expect(matchers.matchSelector({type: 'node', classes: [{class: 'minor_road', not: false}]}, {ele: 1000}, [], 10, 'Point')).to.be.false;
    });

    it("missed attributes", () => {
      expect(matchers.matchSelector({type: 'node', attributes: [{type: 'absence', key: 'ele'}]}, {ele: 1000}, [], 10, 'Point')).to.be.false;
    });
  });

  describe("Match canvas", () => {
    it("positive case", () => {
      expect(matchers.matchCanvas({type: 'canvas'}, 10)).to.be.true;
    });

    it("zoom level", () => {
      expect(matchers.matchCanvas({type: 'canvas', zoom: {type: 'z', begin: 6, end: 9}}, 10)).to.be.false;
    });

    it("wrong type", () => {
      expect(matchers.matchCanvas({type: 'line'}, 10)).to.be.false;
    });
  });
});
