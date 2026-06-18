const { Jimp } = require('jimp');
const fs = require('fs');

async function processLogo() {
  try {
    const image = await Jimp.read('public/logo-primary.png');
    image.resize({ w: 64 });
    const buffer = await image.getBuffer('image/png');
    const base64 = 'data:image/png;base64,' + buffer.toString('base64');
    fs.writeFileSync('lib/logo.ts', 'export const LogoBase64 = `' + base64 + '`;\n');
    console.log('Saved to lib/logo.ts, size:', base64.length);
  } catch (err) {
    console.error(err);
  }
}
processLogo();
