const Readable = require('stream').Readable;
const fs = require('fs');

class LoopReadFileStream extends Readable {
    constructor(max, filePath) {
        super()
        this.max = max;
        this.count = 1;
        this.filePath = filePath || './test.txt';
    }
    _read() {
        setTimeout(() => {
            if (this.max) {
                const rs = fs.createReadStream(this.filePath);
                rs.on('readable', () => {
                  let chunk;
                  while((chunk = rs.read()) !== null) {
                    this.push(`${this.count}:${chunk.toString()}\n`);
                    this.max--;
                    this.count++;
                  }
                });
            } else { // push null 可以让流停止
                this.push(null);
            }
        }, 100);
    }
}
module.exports = LoopReadFileStream;