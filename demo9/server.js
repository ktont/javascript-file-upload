/*
$ node server.js
or
$ node server.js 1234
                  |
                  V 
                 port
*/
var http = require("http"),
    url = require("url"),
    path = require("path"),
    fs = require("fs");

var port = process.argv[2] || 80;

function formidable(req, res) {
    // parse a file upload
    var total = 0;
    req.on('data', function(tr) {
        while(1) {
            if(tr.length == 0) return;
            var idx = tr.indexOf('\r\n');
            if(idx == -1) {
                process.stdout.write('data:'+tr.length);
                total += tr.length;
                return;
            }
            if(idx > 2000) {
                process.stdout.write('data:'+tr.length);
                total += idx;
                tr = tr.slice(idx+2);
                continue;
            }
            var flag = 0;
            for(var i = 0; i<idx;i++) {
                var b = tr[i];
                if(!(b >= 0x20 && b <= 0x7a)) {
                    total += idx+2;
                    tr = tr.slice(idx+2);
                    flag = 1;
                    break;
                }
            }
            if(flag) {
                continue;
            }
            var str = tr.slice(0, idx).toString();
            if(/\<.*\>/.test(str)) {
                total += idx+2;
                tr = tr.slice(idx+2);
                continue;
            }
            console.log(str);
            tr = tr.slice(idx+2);
        }
        return;
    }).on('end',function() {
        console.log('\ntotal:', total);
        res.end('total: ' + total);
    });
}

function getRandom(start, end) {
    return Math.floor(Math.random() * (end - start)) + start;
}

var mimeTypes = {
    "htm": "text/html",
    "html": "text/html",
    "jpeg": "image/jpeg",
    "jpg": "image/jpeg",
    "png": "image/png",
    "gif": "image/gif",
    "js": "text/javascript",
    "css": "text/css"};

var virtualDirectories = {
    //"images": "../images/"
  };

process.chdir(__dirname);
http.createServer(function(request, response) {
  if (request.url == '/upload' && request.method.toLowerCase() == 'post') {
     console.log('post', request.url);
     formidable(request, response);
     return;
  }

  if (request.url == '/offset') {
      //response.end(getRandom(100, 50)+'');
      response.end('0');
      return;
  }

  var uri = url.parse(request.url).pathname
    , filename = path.join(process.cwd(), uri)
    , root = uri.split("/")[1]
    , virtualDirectory;
  
  virtualDirectory = virtualDirectories[root];
  if(virtualDirectory){
    uri = uri.slice(root.length + 1, uri.length);
    filename = path.join(virtualDirectory ,uri);
  }

  fs.exists(filename, function(exists) {
    if(!exists) {
      response.writeHead(404, {"Content-Type": "text/plain"});
      response.write("404 Not Found\n");
      response.end();
      console.error('404: ' + filename);
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        response.writeHead(500, {"Content-Type": "text/plain"});
        response.write(err + "\n");
        response.end();
        console.error('500: ' + filename);
        return;
      }

      var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
      response.writeHead(200, {"Content-Type": mimeType});
      response.write(file, "binary");
      response.end();
      console.log('200: ' + filename + ' as ' + mimeType);
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
