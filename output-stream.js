const Writable = require('stream').Writable
class OutputStream extends Writable {
    _write(chunk, enc, done) {
        // 转大写之后写入标准输出设备
        const writeText = chunk.toString().toUpperCase();
        process.stdout.write(writeText, () => setTimeout(done, 3000));
        
    }
}
module.exports = OutputStream;