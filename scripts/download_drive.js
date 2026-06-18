const https = require('https');
const fs = require('fs');

function downloadFile(id, path) {
  const url = `https://drive.google.com/uc?export=download&id=${id}`;
  
  function get(urlStr) {
    https.get(urlStr, (res) => {
      if ([301, 302, 303, 307, 308].includes(res.statusCode)) {
        get(res.headers.location);
      } else if (res.statusCode === 200) {
        const stream = fs.createWriteStream(path);
        res.pipe(stream);
        stream.on('finish', () => {
          stream.close();
          console.log(`Downloaded ${path}`);
        });
      } else {
        console.error(`Status Code: ${res.statusCode} for ${path}`);
      }
    }).on('error', (e) => {
      console.error(e);
    });
  }
  get(url);
}

downloadFile('1CA8XPcdCvTRHZ5HrOCvBVDFSkaHAlVdt', 'public/logo-1.png');
downloadFile('1O16AB6E0z082ewwBBmCeb9sGaClxMCfN', 'public/logo-2.png');
downloadFile('15A1DSV60tmoI38ExIa_v2ExHcfpj1o2i', 'public/logo-3.png');
downloadFile('16MMAyjB0oLNTQ8XvJcXo_RQRQi3ns4Md', 'public/logo-4.png');
