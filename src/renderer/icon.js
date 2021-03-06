'use strict';
const geom = require('../utils/geom');

function renderIcon(ctx, feature, nextFeature, {projectPointFunction, collisionBuffer, gallery}) {
  //TODO: Refactor, calculate representative point only once
  const point = geom.getReprPoint(feature.geometry, projectPointFunction);
  if (!point) {
    return;
  }

  const actions = feature.actions;

  const image = gallery.getImage(actions['icon-image']);
  if (!image) {
    return;
  }

  var w = image.width, h = image.height;

  //Zoom image according to values, specified in MapCSS
  if (actions['icon-width'] || actions['icon-height']) {
    if (actions['icon-width']) {
      w = actions['icon-width'];
      h = image.height * w / image.width;
    }
    if (actions['icon-height']) {
      h = actions['icon-height'];
      if (!actions['icon-width']) {
        w = image.width * h / image.height;
      }
    }
  }

  if (!actions['allow-overlap']) {
    if (collisionBuffer.checkPointWH(point, w, h, feature.kothicId)) {
      return;
    }
  }


  const x = Math.floor(point[0] - w / 2);
  const y = Math.floor(point[1] - h / 2);

  ctx.save();
  ctx.beginPath();
  //ctx.strokeStyle = 'black'
  //ctx.lineWidth = 1
  ctx.ellipse(point[0], point[1], w / 2, h / 2, 0, 0, 2*Math.PI);
  //ctx.rect(x, y, w, h);
  ctx.clip("evenodd");
  //ctx.stroke()
  ctx.drawImage(image, x, y, w, h);
  ctx.restore();

  const padding = parseFloat(actions['-x-kothic-padding']);
  collisionBuffer.addPointWH(point, w, h, padding, feature.kothicId);
}

module.exports.render = renderIcon;
