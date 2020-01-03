'use strict';

function matchCanvas(selector, zoom) {
  if (selector.type !== 'canvas') {
    return false;
  }

  if (!matchZoom(selector.zoom, zoom)) {
    return false;
  }

  return true;
}

function matchSelector(selector, tags, classes, zoom, featureType) {
  if (!matchFeatureType(selector.type, featureType)) {
    return false;
  }

  if (!matchZoom(selector.zoom, zoom)) {
    return false;
  }

  if (!matchAttributes(selector.attributes, tags)) {
    return false;
  }

  if (!matchClasses(selector.classes, classes)) {
    return false;
  }

  return true;
}


/**
 ** Has side effects for performance reasons (argumant if modified)
 ** knownTags:{tag: 'k'|'kv'}
 ** attributes:[{type, key, value}]
 **/
function appendKnownTags(knownTags, attributes) {
  if (!attributes) {
    return;
  }

  for (var i = 0; i < attributes.length; i++) {
    const attr = attributes[i];
    switch (attr.type) {
    case 'presence':
    case 'absence':
      if (knownTags[attr.key] != 'kv') {
        knownTags[attr.key] = 'k';
      }
      break;
    case 'cmp':
    case 'regexp':
      //'kv' should override 'k'
      knownTags[attr.key] = 'kv';
      break;
    }
  }
}


/**
 ** range:Object = {type: 'z', begin: int, end: int}
 ** zoom:int
 **/
function matchZoom(range, zoom) {
  if (!range) {
    return true;
  }

  if (range.type !== 'z') {
    throw new Error("Zoom selector '" + range.type + "' is not supported");
  }

  return zoom >= (range.begin || 0) && zoom <= (range.end || 9000);
}

/**
 ** @param selectorType {string} — "node", "way", "relation", "line", "area", "canvas", "*"
 ** @param featureType {string} — "Point", "MultiPoint", "Polygon", "MultiPolygon", "LineString", "MultiLineString"
 **/
function matchFeatureType(selectorType, featureType) {
  if (selectorType === '*') {
    return true;
  }

  switch (featureType) {
  case 'LineString':
  case 'MultiLineString':
    return selectorType === 'way' || selectorType === 'line';
  case 'Polygon':
  case 'MultiPolygon':
    return selectorType === 'way' || selectorType === 'area';
  case 'Point':
  case 'MultiPoint':
    return selectorType === 'node';
  default:
    //Note: Canvas and Relation are virtual features and cannot be supported at this level
    throw new TypeError("Feature type is not supported: " + featureType);
  }
}

function matchAttributes(attributes, tags) {
  if (!attributes) {
    return true;
  }

  for (var i = 0; i < attributes.length; i++) {
    if (!matchAttribute(attributes[i], tags)) {
      return false;
    }
  }

  return true;
}

/**
 ** Classes are concatenated by AND statement
 ** selectorClasses:[{class:String, not:Boolean}]
 ** classes:[String]
 **/
function matchClasses(selectorClasses, classes) {
  if (!selectorClasses) {
    return true;
  }

  for (var i = 0; i < selectorClasses.length; i++) {
    const selClass = selectorClasses[i];
    if (!matchClass(selClass, classes)) {
      return false;
    }
  }

  return true;
}

function matchClass(selectorClass, classes) {
  for (var i = 0; i < classes.length; i++) {
    const cls = classes[i];
    if (selectorClass.class == cls) {
      return !selectorClass.not;
    }
  }
  return false;
}

/**
 ** op:String — one of "=", "!=", "<", "<=", ">", ">="
 ** expect:String — expected value
 ** value:String — actual value
 **/
function compare(op, expect, value) {
  // parseFloat returns NaN if failed, and NaN compared to anything is false, so
  // no additional type checks are required
  const val = parseFloat(value);
  const exp = parseFloat(expect);

  switch (op) {
  case '=':
    return isNaN(val) || isNaN(exp) ? expect == value : val == exp;
  case '!=':
    return isNaN(val) || isNaN(exp) ? expect != value : val != exp;
  case '<':
    return val < exp;
  case '<=':
    return val <= exp;
  case '>':
    return val > exp;
  case '>=':
    return val >= exp;
  default:
    return false;
  }
}


/**
 ** regexp:String — regular expression
 ** flags:String — regular expression flags
 ** value:String — actual value
 **/
function regexp(regexp, flags, value) {
  const re = new RegExp(regexp, flags);
  return re.test(value);
}

/**
 ** Match tags against single attribute selector
 ** attr:{type:String, key:String, value:String}
 ** tags:{*: *}
 **/
function matchAttribute(attr, tags) {
  switch (attr.type) {
  case 'presence':
    return attr.key in tags;
  case 'absence':
    return !(attr.key in tags);
  case 'cmp':
    return attr.key in tags && compare(attr.op, attr.value, tags[attr.key]);
  case 'regexp':
    return attr.key in tags && regexp(attr.value.regexp, attr.value.flags, tags[attr.key]);
  default:
    throw new Error("Attribute type is not supported: " + attr.type);
  }
}

module.exports = {
  matchZoom: matchZoom,
  matchFeatureType: matchFeatureType,
  matchAttributes: matchAttributes,
  matchAttribute: matchAttribute,
  matchClasses: matchClasses,
  matchSelector: matchSelector,
  appendKnownTags: appendKnownTags,
  matchCanvas: matchCanvas,
}
