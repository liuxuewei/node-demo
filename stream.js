// const RandomNumberStream = require('./random-number-stream');
// const rns = new RandomNumberStream(5);

// rns.pipe(process.stdout);

// rns.on('readable', () => {
//   let chunk;
//   while((chunk = rns.read(8)) !== null){
//     console.log(chunk.toString());
//   }
// });


// const fs = require('fs');
// const rs = fs.createReadStream('./README.md');
// const ws = fs.createWriteStream('./README-copy.md');

// rs.setEncoding('utf-8');

// rs.on('data', chunk => {
//   ws.write(chunk);
// });


// const fs = require('fs');
// const rs = fs.createReadStream('./test.txt');
// const OutputStream = require('./output-stream');

// const os = new OutputStream({
// 	  objectMode: false,
//     highWaterMark: 8 // 把水位降低，默认16k还是挺大的
// });

// rs.pipe(os);


const LoopReadFileStream = require('./loop-read-file-stream');
const OutputStream = require('./output-stream');
const rns = new LoopReadFileStream(5, './test.txt');
const os = new OutputStream({
	objectMode: false,
    highWaterMark: 1 // 把水位降低，默认16k还是挺大的
});

// 自动处理积压
// rns.pipe(os);

// 不管三七二十一，强行灌入数据到缓冲区，等待处理
rns.on('data', chunk => {
    os.write(chunk)
});

// 手动处理积压
// rns.on('data', chunk => {
//     // 当待处理队列大于 highWaterMark 时返回 false
//     if (os.write(chunk) === false) { 
//         console.log('pause');
//         rns.pause(); // 暂停数据读取
//     }
// });

// // 当待处理队列小于 highWaterMark 时触发 drain 事件
// os.on('drain', () => {
//     console.log('drain')
//     rns.resume(); // 恢复数据读取
// });