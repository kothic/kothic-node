'use strict';

const expect = require("chai").expect;
const mapcss = require("mapcss");
var rewire = require("rewire");

const rules = rewire("../../src/style/rules");

const formatCssColor = rules.__get__("formatCssColor");

function expr(str) {
  return mapcss.parse(str);
}

describe("Rules", () => {
  describe("Known Tags", () => {
    it("empty rules", () => {
      expect(rules.listKnownTags([])).to.be.an('Object').that.is.empty;
    });

    it("tag presence", () => {
      const ast = mapcss.parse("way[ele]{}");
      expect(rules.listKnownTags(ast)).to.have.property('ele', 'k')
    });

    it("text tag", () => {
      const ast = mapcss.parse("way {text: ele; color: red;}");
      expect(rules.listKnownTags(ast)).to.have.property('ele', 'kv')
    });

    it("tag() in eval", () => {
      const ast = mapcss.parse('way {text: eval(tag("ele"));}');
      expect(rules.listKnownTags(ast)).to.have.property('ele', 'kv')
    });

    it("text: unexpected", () => {
      const ast = mapcss.parse("way {text: #fff;}");
      expect(rules.listKnownTags(ast)).to.be.empty
    });
    it("localize() in eval", () => {
      const ast = mapcss.parse('way {text: eval(localize("name"));}');
      const tags = rules.listKnownTags(ast, ['en', 'de']);
      expect(tags).to.have.property('name', 'kv');
      expect(tags).to.have.property('name:en', 'kv');
      expect(tags).to.have.property('name:de', 'kv');
    });

    it("no actions with tags access", () => {
      const ast = mapcss.parse('way {color: red;}');
      expect(rules.listKnownTags(ast)).to.be.an('Object').that.is.empty;
    });
  });

  describe("Known images", () => {
    it("empty rules", () => {
      expect(rules.listKnownImages([])).to.be.empty;
    });

    it("image tags", () => {
      const ast = mapcss.parse('line {shield-image: "http://example.org/img/shield.png"; image: "http://example.org/img/line.png"; icon-image: "http://example.org/img/icon.png"; fill-image: "http://example.org/img/texture.png";}');
      const images = rules.listKnownImages(ast);
      expect(images).to.include('http://example.org/img/icon.png')
      expect(images).to.include('http://example.org/img/line.png')
      expect(images).to.include('http://example.org/img/shield.png')
      expect(images).to.include('http://example.org/img/texture.png')
    });

    it("image: unexpected", () => {
      const ast = mapcss.parse("way {image: #fff;}");
      expect(rules.listKnownImages(ast)).to.be.empty
    });

    it("exit;", () => {
      const ast = mapcss.parse("way {exit;}");
      expect(rules.listKnownImages(ast)).to.be.empty
    });
  });

  describe("CSS color", () => {
    it("RGB", () => {
      expect(formatCssColor({r: 1, g: 2, b: 3})).to.be.equal("rgb(1, 2, 3)");
    });
    it("RGBA", () => {
      expect(formatCssColor({r: 1, g: 2, b: 3, a: 0.5})).to.be.equal("rgba(1, 2, 3, 0.5)");
    });
    it("HSL", () => {
      expect(formatCssColor({h: 1, s: 2, l: 3})).to.be.equal("hsl(1, 2, 3)");
    });
    it("HSLA", () => {
      expect(formatCssColor({h: 1, s: 2, l: 3, a: 0.5})).to.be.equal("hsla(1, 2, 3, 0.5)");
    });

    it("Unknown color space", () => {
      expect(() => formatCssColor({eXe: true})).to.throw(TypeError, /Unexpected color space.*eXe/)
    });
  });

  describe("apply()", () => {
    it("Default layer", () => {
      expect(rules.apply(expr("node {} way { color: red; }"), {}, [], 10, 'LineString', []))
        .to.have.deep.property('default', {color: 'red'})
    });

    it("Custom layer", () => {
      expect(rules.apply(expr("way::outline { color: red; }"), {}, [], 10, 'LineString', []))
        .to.have.deep.property('outline', {color: 'red'})
    });

    it("Multiple layers layer", () => {
      const res = rules.apply(expr("way, way::outline { color: red; }"), {}, [], 10, 'LineString', []);
      expect(res).to.have.deep.property('outline', {color: 'red'});
      expect(res).to.have.deep.property('default', {color: 'red'});
    });

    it("Rules overlay", () => {
      const res = rules.apply(expr("way {color: #fff; width: 1;} way { color: red; }"), {}, [], 10, 'LineString', []);
      expect(res).to.have.deep.property('default', {color: 'red', width: '1'});
    });

    it("Text tag", () => {
      const res = rules.apply(expr('node {text: "name";}'), {name: "Arlington"}, [], 10, 'Point', []);
      expect(res).to.have.deep.property('default', {text: 'Arlington'});
    });

    it("Text tag empty value", () => {
      const res = rules.apply(expr('node {text: "name";}'), {}, [], 10, 'Point', []);
      expect(res).to.have.deep.property('default', {text: ''});
    });

    it("Missing value", () => {
      const res = rules.apply(expr('node {width: eval();}'), {}, [], 10, 'Point', []);
      expect(res).to.have.deep.property('default', {width: null});
    });
  });

  describe("applyCanvas()", () => {
    it("Default canvas", () => {
      expect(rules.applyCanvas(expr("canvas { color: red; }"), 10))
        .to.have.property('color', 'red')
    });

    it("Multiple canvases with different zoom", () => {
      expect(rules.applyCanvas(expr("canvas|z-9 { color: red; } canvas|z10 { color: green; } canvas|z11- { color: white; }"), 10))
        .to.have.property('color', 'green')
    });
  });

  describe("Set statements", () => {
    it("Set class layer", () => {
      const classes = [];
      rules.apply(expr("way {set .minor_road;}"), {}, classes, 10, 'LineString', []);
      expect(classes).to.include("minor_road");
      rules.apply(expr("way {set .minor_road;}"), {}, classes, 10, 'LineString', []);
      expect(classes.length).to.be.equal(1);
    });

    it("Set class layer", () => {
      const tags = {};
      rules.apply(expr("way {set ford=yes;}"), tags, [], 10, 'LineString', []);
      expect(tags).to.have.property('ford', 'yes');
    });
  });

  describe("Exit statement", () => {
    it("Stop on exit;", () => {
      const res = rules.apply(expr("way {color: #fff; exit;} way { color: red; }"), {}, [], 10, 'LineString', []);
      expect(res).to.have.deep.property('default', {color: 'rgb(255, 255, 255)'});
    });
  });

  describe("Eval", () => {
    it("Support locales", () => {
      const tags = {'name': '北京', 'name:en': 'Beijing', 'name:de': 'Peking'}

      const res = rules.apply(expr('node {text: eval(localize("name"));}'), tags, [], 10, 'Point', ['de', 'en']);
      expect(res).to.have.deep.property('default', {text: 'Peking'});
    });
  });

  describe("Unexpected nodes in AST", () => {
    it("unexpected action type", () => {
      const ast = expr('node {text: "!";}');
      ast[0].actions[0].action = "uneXpected";
      expect(() => rules.apply(ast, {}, [], 10, 'Point', [])).to.throw(TypeError, /uneXpected/)
    });

    it("unexpected value type", () => {
      const ast = expr('node {text: "!";}');
      ast[0].actions[0].v.type = "uneXpected";
      expect(() => rules.apply(ast, {}, [], 10, 'Point', [])).to.throw(TypeError, /uneXpected/)
    });
  });
});
