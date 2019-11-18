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
    var expect = 'sp';
    var begin = new Date();
    var sp, cont, type, total = 0;
    req.on('data', function(tr) {
        while(1) {
            switch(expect) {
                case 'sp':
                    var idx = tr.indexOf('\r\n');
                    if(idx == -1) return;
                    sp = tr.slice(0, idx).toString();
                    tr = tr.slice(idx+2);
                    console.log('sp:', sp);
                    expect = 'content';
                    break;
                case 'content':
                    var idx = tr.indexOf('\r\n');
                    cont = tr.slice(0, idx).toString();
                    console.log('content:', cont);
                    if(/Content-Disposition: ?form-data;.*filename="/.test(cont)) {
                        expect = 'type';
                        tr = tr.slice(idx+2);
                    } else {
                        expect = 'value';
                        tr = tr.slice(idx+4);
                    }
                    break;
                case 'value':
                    var idx = tr.indexOf('\r\n');
                    value = tr.slice(0, idx).toString();
                    tr = tr.slice(idx+2);
                    console.log('value:', value);
                    expect = 'sp';
                    break;
                case 'type':
                    var idx = tr.indexOf('\r\n');
                    type = tr.slice(0, idx).toString();
                    tr = tr.slice(idx+4);
                    console.log('type:', type);
                    expect = 'end';
                    break;
                case 'end':
                    var idx = tr.indexOf('\r\n'+sp);
                    process.stdout.write('.');
                    if(idx >= 0) {
                        total += idx;
                    } else total += tr.length;
                    return;
            }
        }
    }).on('end',function() {
        console.log('\ntotal:', total);
        var spendTm = new Date() - begin;
        res.end(`<head>
            <meta http-equiv="Content-Type" content="text/html; charset=gb2312" />
            </head>
            <body><p>${cont}</p>
            <p>total: ${total}</p>
            <p>upload speed: ${parseInt((total*8)/(spendTm/1000))} bps</p>
            <p>upload speed: ${parseInt((total/1024/1024)/(spendTm/1000))} Mbyte per second</p>
            </body>`);
    });
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

http.createServer(function(req, res) {
  if(req.url == '/upload' && req.method.toLowerCase() == 'post') {
     console.log('post', req.url);
     formidable(req, res);
     return;
  }

  if(req.url == '/big') {
    res.setHeader('Content-Length', "4423129088");
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=CentOS-6.2.ios`);
    fs.createReadStream('/Users/zhi.liang/Downloads/CentOS-6.2-x86_64-bin-DVD1.iso').pipe(res);
    return;
  }

  if(req.url == '/small') {
    res.setHeader('Content-Length', "6393");
    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename=etc.passwd.txt`);
    fs.createReadStream('/etc/passwd').pipe(res);
    return;
  }

  var uri = url.parse(req.url).pathname
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
      res.writeHead(404, {"Content-Type": "text/plain"});
      res.write("404 Not Found\n");
      res.end();
      console.error('404: ' + filename);
      return;
    }

    if (fs.statSync(filename).isDirectory()) filename += '/index.html';

    fs.readFile(filename, "binary", function(err, file) {
      if(err) {        
        res.writeHead(500, {"Content-Type": "text/plain"});
        res.write(err + "\n");
        res.end();
        console.error('500: ' + filename);
        return;
      }

      var mimeType = mimeTypes[path.extname(filename).split(".")[1]];
      res.writeHead(200, {"Content-Type": mimeType});
      res.write(file, "binary");
      res.end();
      console.log('200: ' + filename + ' as ' + mimeType);
    });
  });
}).listen(parseInt(port, 10));

console.log("Static file server running at\n  => http://localhost:" + port + "/\nCTRL + C to shutdown");
