const { Jimp } = require('jimp');

async function convert() {
  try {
    const original = await Jimp.read('public/logo_orig.jpg');
    await original.write('public/logo.png');
    await original.write('public/icon-192x192.png');
    await original.write('public/icon-512x512.png');
    console.log('Conversion successful!');
  } catch (err) {
    console.error(err);
  }
}

convert();
