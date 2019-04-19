const expect = require("chai").expect;

const Gallery = require('../../src/style/gallery')

describe("Gallery", () => {
  describe("Load external image", () => {
    it("empty rules", () => {
      const gallery = new Gallery({'localImagesDirectory': 'test/resources', 'loadImage': () => Promise.resolve({'fake': 'image'})});
      gallery.preloadImages(['test.png']).then(() => {
        expect(gallery.getImage('test.png')).to.be.not.null
      });
    });

    it("no image provider", () => {
      expect(() => new Gallery()).to.throw(Error, /loadImage/);
    });

    it("no file found", () => {
      const gallery = new Gallery({'localImagesDirectory': 'test/resources', 'loadImage': () => Promise.resolve(null)});
      gallery.preloadImages(['does-not-exist.png']).catch((err) => {
        expect(err).to.be.not.null
      });
    });

    it("no local directory", () => {
      const gallery = new Gallery({'loadImage': () => Promise.resolve(null)});
      gallery.preloadImages(['test.png']).catch((err) => {
        expect(err).to.be.null
        expect(gallery.getImage('test.png')).to.be.undefined;
      });
    });

    it("no external image", () => {
      const gallery = new Gallery({'loadImage': () => Promise.resolve(null)});
      gallery.preloadImages(['http://localhost:666/does-not-exist.png']).catch((err) => {
        expect(err).to.be.not.null
      });
    });
  });
});
