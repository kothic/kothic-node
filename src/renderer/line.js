//'use strict';
const path = require('./path');
const contextUtils = require('../utils/style');

//TODO: Refactor to class
module.exports = {
  pathOpened: false,
  renderCasing: function (ctx, feature, nextFeature, {projectPointFunction, tileWidth, tileHeight, groupFeaturesByActions, options}) {
    const actions = feature.actions;
    const nextActions = nextFeature && nextFeature.actions;

   if (!this.pathOpened) {
     this.pathOpened = true;
      ctx.beginPath();
   }

    //TODO: Is MapCSS spec really allows a fallback from "casing-dashes" to "dashes"?
    const dashes = actions['casing-dashes'] || actions['dashes'];
    path(ctx, feature.geometry, dashes, !!options.drawOnTileEdges, projectPointFunction, tileWidth, tileHeight);

    if (groupFeaturesByActions &&
        nextFeature &&
        nextFeature.key === feature.key) {
      return;
    }

    const style = {
      'lineWidth': 2 * actions["casing-width"] + actions['width'],
      'strokeStyle': actions["casing-color"],
      'lineCap': actions["casing-linecap"] || actions['linecap'],
      'lineJoin': actions["casing-linejoin"] || actions['linejoin'],
      'globalAlpha': actions["casing-opacity"]
    }

    contextUtils.applyStyle(ctx, style);

    ctx.stroke();
    this.pathOpened = false;
  },

  render: function (ctx, feature, nextFeature, {projectPointFunction, tileWidth, tileHeight, groupFeaturesByActions, gallery, options}) {
    const actions = feature.actions;
    const nextActions = nextFeature && nextFeature.actions;
    if (!this.pathOpened) {
      this.pathOpened = true;
       ctx.beginPath();
    }

    path(ctx, feature.geometry, actions['dashes'], !!options.drawOnTileEdges, projectPointFunction, tileWidth, tileHeight);

    if (groupFeaturesByActions &&
        nextFeature &&
        nextFeature.key === feature.key) {
      return;
    }

    const defaultLinejoin = actions['width'] <= 2 ? "miter" : "round";
    const defaultLinecap = actions['width'] <= 2 ? "butt" : "round";

    var strokeStyle;
    if ('image' in actions) {
      const image = gallery.getImage(actions['image']);
      if (image) {
        strokeStyle = ctx.createPattern(image, 'repeat');
      }
    }
    strokeStyle = strokeStyle || actions['color'];

    const style = {
      'strokeStyle': strokeStyle,
      'lineWidth': actions['width'],
      'lineCap': actions['linecap'] || defaultLinejoin,
      'lineJoin': actions['linejoin'] || defaultLinecap,
      'globalAlpha': actions['opacity'],
      'miterLimit': 4
    }

    contextUtils.applyStyle(ctx, style);
    ctx.stroke();

    this.pathOpened = false;
  }
};
