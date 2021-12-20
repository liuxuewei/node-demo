var http = require('http');
// var memwatch = require('memwatch');
// var hd = new memwatch.HeapDiff();
var heapdump = require('heapdump');
var server = http.createServer(function (req, res) {
    for (var i = 0; i < 1000; i++) {
        server.on('request', function leakyfunc() { });
    }
    var file = 'tmp/app-' + process.pid + '-' + Date.now() + '.heapsnapshot';
    heapdump.writeSnapshot(file, function (err) {
        if (err) console.error(err);
        else console.error('Wrote snapshot: ' + file);
    });
    res.end('Hello World\n');
}).listen(3000, '127.0.0.1');

// memwatch.on('leak', function (info) {
//     var diff = hd.end();
//     console.log(JSON.stringify(diff));
//     gc();
//     var file = '/tmp/app-' + process.pid + '-' + Date.now() + '.heapsnapshot';
//     heapdump.writeSnapshot(file, function (err) {
//         if (err) console.error(err);
//         else console.error('Wrote snapshot: ' + file);
//     });
// });
server.setMaxListeners(0);
console.log('Server running at http://127.0.0.1:3000/. Process PID: ', process.pid);