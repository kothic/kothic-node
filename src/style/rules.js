'use strict';

const matchers = require("./matchers");
const evalProcessor = require("./eval");

/**
 ** Extract all tags, referenced in MapCSS rules.
 **
 ** @param rules {array} — list of MapCSS rules from AST
 ** @param locales {array} — list of supported locales
 ** @return {Object} ­tags — map of tags
 **   key — tag name
 **   value — 'k' if tag value is not used
 **           'kv' if tag value is used
 **/
function listKnownTags(rules, locales=[]) {
  const tags = {};
  rules.forEach((rule) => {
    rule.selectors.forEach((selector) => {
      matchers.appendKnownTags(tags, selector.attributes);
    });

    rule.actions.forEach((action) => {
      const value = action.v;

      if (action.action === 'kv' && action.k === 'text') {
        if (value.type === "string") {
          //Support 'text: "tagname";' syntax sugar statement
          tags[value.v] = 'kv';
        } else if (value.type === "eval") {
          //Support tag() function in eval
          evalProcessor.appendKnownTags(tags, value.v, locales);
        }
      }
    });
  });

  return tags;
}

/**
 ** Extract all images, referenced in MapCSS rules.
 ** @param rules {array} — list of MapCSS rules from AST
 ** @return {array} — unique list of images
 **/
function listKnownImages(rules) {
  const images = {};

  const imageActions = ['image', 'shield-image', 'icon-image', 'fill-image'];

  rules.forEach((rule) => {
    rule.actions.forEach((action) => {
      const value = action.v;

      if (action.action === 'kv' && imageActions.includes(action.k)) {
        if (value.type === "string") {
          images[value.v.trim()] = true;
        }
      }
    });
  });

  return Object.keys(images);
}

/**
 ** Apply MapCSS style to a specified feature in specified context
 ** @param rules {array} — list of MapCSS rules from AST
 ** @param tags {Object} — key-value map of feature properties
 ** @param classes {array} — list of feature classes
 ** @param zoom {int} — zoom level in terms of tiling scheme
 ** @param featureType {string} — feature type in terms of GeoJSON features
 ** @param locales {array} — list of supported locales in prefered order
 ** @returns {Object} — map of layers for rendering
 **
 ** NB: this method is called for each rendered feature, so it must be
 ** as performance optimized as possible.
 **/
function apply(rules, tags, classes, zoom, featureType, locales) {
  const layers = {};

  for (var i = 0; i < rules.length; i++) {
    const rule = rules[i];

    const ruleLayers = applyRule(rule, tags, classes, zoom, featureType, locales);
    var exit = false;
    for (var layer in ruleLayers) {
      layers[layer] = layers[layer] || {};
      if ('exit' in ruleLayers[layer]) {
        exit = true;
        delete ruleLayers[layer]['exit'];
      }
      Object.assign(layers[layer], ruleLayers[layer]);
    }

    if (exit) {
      break;
    }
  }

  return layers;
}

function applyCanvas(rules, zoom) {
  const result = {};

  for (var i = 0; i < rules.length; i++) {
    const rule = rules[i];

    const selectors = rule.selectors;
    const actions = rule.actions;

    for (var j = 0; j < selectors.length; j++) {
      const selector = selectors[j];
      if (matchers.matchCanvas(selector, zoom)) {
        const props = unwindActions(actions, {}, result, [], []);

        Object.assign(result, props);
      }
    }
  }

  return result;
}

/**
 ** @returns {Object<String, RenderingDetails>}
 **/
function applyRule(rule, tags, classes, zoom, featureType, locales) {
  const selectors = rule.selectors;
  const actions = rule.actions;
  const result = {};

  for (var i = 0; i < selectors.length; i++) {
    const selector = selectors[i];
    if (matchers.matchSelector(selector, tags, classes, zoom, featureType)) {
      const layer = selector.layer || 'default';
      const properties = result[layer] || {}
      const props = unwindActions(actions, tags, properties, locales, classes);

      result[layer] = Object.assign(properties, props);

      if ('exit' in properties) {
        break;
      }
    }
  }

  return result;
}

function unwindActions(actions, tags, properties, locales, classes) {
  const result = {};

  for (var i = 0; i < actions.length; i++) {
    const action = actions[i];

    switch (action.action) {
    case 'kv':
      if (action.k === 'text') {
        if (action.v.type === 'string') {
          if (action.v.v in tags) {
            result[action.k] = tags[action.v.v];
          } else {
            result[action.k] = '';
          }
        } else {
          result[action.k] = unwindValue(action.v, tags, properties, locales);
        }
      } else {
        const value = unwindValue(action.v, tags, properties, locales);
        result[action.k] = value;
      }
      break;
    case 'set_class':
      if (!classes.includes(action.v.class)) {
        classes.push(action.v.class);
      }
      break;
    case 'set_tag':
      tags[action.k] = unwindValue(action.v, tags, properties, locales);
      break;
    case 'exit':
      result['exit'] = true;
      return result;
    default:
      throw new TypeError("Action type is not supproted: " + JSON.stringify(action));
    }
  }
  return result;
}

function unwindValue(value, tags, properties, locales) {
  switch (value.type) {
  case 'string':
    return value.v;
  case 'csscolor':
    return formatCssColor(value.v);
  case 'eval':
    return evalProcessor.evalExpr(value.v, tags, properties, locales);
  default:
    throw new TypeError("Value type is not supproted: " + JSON.stringify(value));
  }
}

function formatCssColor(color) {
  if ('r' in color && 'g' in color && 'b' in color && 'a' in color) {
    return "rgba(" + color.r + ", " + color.g + ", " + color.b + ", " + color.a + ")";
  } else if ('r' in color && 'g' in color && 'b' in color) {
    return "rgb(" + color.r + ", " + color.g + ", " + color.b + ")";
  } else if ('h' in color && 's' in color && 'l' in color && 'a' in color) {
    return "hsla(" + color.h + ", " + color.s + ", " + color.l + ", " + color.a + ")";
  } else if ('h' in color && 's' in color && 'l' in color) {
    return "hsl(" + color.h + ", " + color.s + ", " + color.l + ")";
  }

  throw new TypeError("Unexpected color space " + JSON.stringify(color));
}

module.exports = {
  listKnownTags: listKnownTags,
  listKnownImages: listKnownImages,
  apply: apply,
  applyCanvas: applyCanvas,
}
