'use strict';

const contextUtils = require('../utils/style');

function render(ctx, feature, nextFeature, {tileWidth, tileHeight}) {
  const actions = feature.actions;

  if ('fill-color' in actions) {
    let style = {
      fillStyle: actions["fill-color"],
      globalAlpha: actions["fill-opacity"] || actions['opacity']
    };

    contextUtils.applyStyle(ctx, style);
    ctx.fillRect(0, 0, tileWidth, tileHeight);
  }

  if ('fill-image' in actions) {
    // second pass fills with texture
    const image = gallery.getImage(actions['fill-image']);
    if (image) {
      let style = {
        fillStyle: ctx.createPattern(image, 'repeat'),
        globalAlpha: actions["fill-opacity"] || actions['opacity']
      };
      contextUtils.applyStyle(ctx, style);
      ctx.fillRect(0, 0, tileWidth, tileHeight);
    }
  }
}

module.exports = {
  render: render,
}
