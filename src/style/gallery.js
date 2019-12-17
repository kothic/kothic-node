const path = require('path');

/**
 ** @param loadImage {function} image provider (imageName) => Promise
 **/
function Gallery(options={}) {
  this.localImagesDirectory = options && options.localImagesDirectory;
  this.images = {};
  this.loadImage = options.loadImage;
  if (typeof(this.loadImage) !== 'function') {
    //TODO: Make optional to allow zero-configuration
    throw new Error("gallery.loadImage option must be a function");
  }
}

Gallery.prototype.preloadImages = function(images) {
  const self = this;
  const uriRegexp = /https?:\/\//;

  //External images
  var promises = images.filter((image) => image.match(uriRegexp))
      .map((image) => self.loadImage(image).then((data) => self.images[image] = data));

  if (this.localImagesDirectory) {
    const localPromises = images.filter((image) => !image.match(uriRegexp))
      .map((image) => self.loadImage(path.join(self.localImagesDirectory, image)).then((data) => self.images[image] = data));
    promises = promises.concat(localPromises);
  }

  promises = promises.map((promise) => promise);

  return Promise.all(promises);
}

Gallery.prototype.getImage = function(image) {
  return this.images[image];
}

module.exports = Gallery;
