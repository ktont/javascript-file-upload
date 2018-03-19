const request = require('request');
const fs = require('fs');

//'/Users/zhi.liang/Downloads/googlechrome_mac_55.0.2883.95.dmg'
const pathname = process.argv[2];
if(!pathname) {
  console.log('Usage: 请选择一个文件');
  process.exit(1);
}

var stream = fs
.createReadStream(pathname);

var total = fs.statSync(pathname).size
var current = 0;

var formData = {
  file: stream,
};

function _progress(chunk) {
  current += chunk.length;
  console.log('progress', total, current, chunk.length,
   ((current/total)*100).toString().slice(0,4)+'%');
}

request.post({
  url:'http://localhost/upload',
  formData: formData
},(err, res, body) => {
  if (err) {
    //stream.removeAllListeners('data', _progress);
    stream.removeAllListeners(['data']);
    return console.error('upload failed:', err);
  }
  console.log('Upload successful!  Server responded with:', body);
  process.exit(0);
});

stream.on('data', _progress);
//stream.removeAllListeners(['data']);
