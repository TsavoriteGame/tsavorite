
const fs = require('fs-extra');
const rimraf = require('rimraf');
const readdir = require('recursive-readdir');

const imagemin = require('imagemin');
const webp = require('imagemin-webp');
const pngquant = require('imagemin-pngquant');

const Sharp = require('sharp');
Sharp.cache(false);

const resizes = {
  icon: { width: 128, height: 128 },
};

fs.ensureDirSync('src/assets/images/game')

rimraf.sync('src/assets/images/game/**/*.webp');
rimraf.sync('src/assets/images/game/**/*.png');

Object.keys(resizes).forEach(async type => {

  const pngquantOpts = { quality: [0.3, 0.5] };
  const webpOpts = { quality: 10 };

  await imagemin([
    `content/art/${type}/*.png`
  ], `src/assets/images/game/${type}`, {
    plugins: [
      pngquant(pngquantOpts)
    ]
  });

  await imagemin([
    `content/art/${type}/*.png`
  ], `src/assets/images/game/${type}`, {
    plugins: [
      webp(webpOpts)
    ]
  });

  if(resizes[type]) {
    const images = await readdir(`src/assets/images/game/${type}`, ['placeholder.png']);
    images.forEach(async imagePath => {
      const resizedImage = await Sharp(imagePath).resize(resizes[type].width, resizes[type].height).toBuffer();
      await Sharp(resizedImage).toFile(imagePath);
    });
  }
});
